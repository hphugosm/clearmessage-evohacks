"""Bound request buffering and suppress private error details at the ASGI edge."""

import asyncio
from threading import BoundedSemaphore
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from backend.contracts import ErrorResponse, MAX_BODY_BYTES
from backend.runtime import BODY_TIMEOUT_SECONDS, MAX_HTTP_REQUESTS

SECURITY_HEADERS = {
    "cache-control": "no-store",
    "pragma": "no-cache",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
}


def error_response(key: str, status: int) -> JSONResponse:
    return JSONResponse(ErrorResponse(error_key=key).model_dump(), status_code=status)


class PrivacyBoundary:
    def __init__(self, app: ASGIApp):
        self.api = app
        self._slots = BoundedSemaphore(MAX_HTTP_REQUESTS)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.api(scope, receive, send)
            return
        started = False

        async def private_send(message: Message) -> None:
            nonlocal started
            if message["type"] == "http.response.start":
                started = True
                headers = [(k, v) for k, v in message.get("headers", []) if k.decode("latin1").lower() not in SECURITY_HEADERS]
                headers.extend((k.encode(), v.encode()) for k, v in SECURITY_HEADERS.items())
                message = {**message, "headers": headers}
            await send(message)

        async def reject(key: str, status: int) -> None:
            await error_response(key, status)(scope, receive, private_send)

        admitted = False
        try:
            admitted = self._slots.acquire(blocking=False)
            if not admitted:
                await reject("service_unavailable", 503)
                return
            if scope["path"].startswith("/api/") and scope.get("query_string"):
                await reject("unexpected_query", 400)
                return
            if scope["path"] == "/api/analyze" and scope["method"] == "POST":
                headers = dict(scope.get("headers", []))
                content_type = headers.get(b"content-type", b"").split(b";", 1)[0].strip().lower()
                if content_type != b"application/json":
                    await reject("json_required", 415)
                    return
                content_length = headers.get(b"content-length")
                if content_length:
                    try:
                        too_large = int(content_length) > MAX_BODY_BYTES
                    except ValueError:
                        await reject("invalid_input", 400)
                        return
                    if too_large:
                        await reject("body_too_large", 413)
                        return
                body = bytearray()
                async with asyncio.timeout(BODY_TIMEOUT_SECONDS):
                    while True:
                        chunk = await receive()
                        if chunk["type"] == "http.disconnect":
                            return
                        part = chunk.get("body", b"")
                        if len(body) + len(part) > MAX_BODY_BYTES:
                            await reject("body_too_large", 413)
                            return
                        body.extend(part)
                        if not chunk.get("more_body", False):
                            break
                delivered = False

                async def bounded_receive() -> Message:
                    nonlocal delivered
                    if not delivered:
                        delivered = True
                        return {"type": "http.request", "body": bytes(body), "more_body": False}
                    return await receive()

                await self.api(scope, bounded_receive, private_send)
            else:
                await self.api(scope, receive, private_send)
        except TimeoutError:
            if not started:
                await reject("request_rejected", 408)
        except Exception:
            # Do not format/log exceptions or input. Starlette may already have sent
            # the sanitized 500 handler response before re-raising to this boundary.
            if not started:
                await reject("service_unavailable", 500)
        finally:
            if admitted:
                self._slots.release()
