"""FastAPI serves both the API and the compiled frontend from one process."""

import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from backend.contracts import (
    AnalyzeRequest, AnalyzeResponse, CONTRACT_VERSION, ErrorResponse,
    HealthResponse, MAX_BODY_BYTES, MAX_TEXT_LENGTH, POLICY_VERSION,
)
from backend.inference import Classifier, load_classifier
from backend.policy import analyze_text
from backend.privacy import PrivacyBoundary, error_response


def create_app(frontend_dir: Path | None = None, classifier: Classifier | None = None) -> PrivacyBoundary:
    api = FastAPI(
        title="ClearMessage", version=CONTRACT_VERSION, docs_url=None,
        redoc_url=None, openapi_url="/api/openapi.json", redirect_slashes=False,
        telemetry={"tracing": False, "metrics": False, "logs": False, "operation_spans": False, "auto_configure": False},
    )
    classifier = classifier if classifier is not None else load_classifier()

    @api.exception_handler(RequestValidationError)
    async def invalid_input(_request: Request, _exc: RequestValidationError):
        # Never serialize exc.errors(), exc.body, loc, ctx or str(exc).
        return error_response("invalid_input", 422)

    @api.exception_handler(HTTPException)
    async def http_error(_request: Request, exc: HTTPException):
        key = {404: "not_found", 405: "method_not_allowed"}.get(exc.status_code, "request_rejected")
        return error_response(key, exc.status_code)

    @api.exception_handler(Exception)
    async def internal_error(_request: Request, _exc: Exception):
        return error_response("service_unavailable", 500)

    @api.get("/api/health", response_model=HealthResponse)
    async def health() -> HealthResponse:
        return HealthResponse(service_status="ok", model_ready=classifier.ready, model_version=classifier.version, evaluated_message_languages=list(classifier.evaluated_languages), human_review_complete=classifier.human_review_complete, policy_version=POLICY_VERSION, contract_version=CONTRACT_VERSION, max_text_length=MAX_TEXT_LENGTH, max_body_bytes=MAX_BODY_BYTES)

    errors = {status: {"model": ErrorResponse} for status in (400, 408, 413, 415, 422, 500, 503)}

    @api.post("/api/analyze", response_model=AnalyzeResponse, responses=errors)
    def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
        # Worker pool keeps bounded CPU inference off the event loop.
        return analyze_text(payload, classifier)

    dist = frontend_dir or Path(os.environ.get("FRONTEND_DIST", str(Path(__file__).resolve().parents[1] / "frontend" / "dist")))
    if (dist / "index.html").is_file():
        if (dist / "assets").is_dir():
            api.mount("/assets", StaticFiles(directory=dist / "assets"), name="assets")

        @api.get("/how-it-works", include_in_schema=False)
        @api.get("/", include_in_schema=False)
        async def index():
            return FileResponse(dist / "index.html")

    return PrivacyBoundary(api)


app = create_app()
