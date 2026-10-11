"""CPU runtime bounds and private operational diagnostics, independent of policy."""
import argparse
import logging

MAX_HTTP_REQUESTS = 8
BODY_TIMEOUT_SECONDS = 5
KEEP_ALIVE_SECONDS = 5
LISTEN_BACKLOG = 64


class PrivateArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        self.exit(2, "ClearMessage command rejected: invalid arguments.\n")


class PrivateDiagnostic(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # Never format a server exception, request, address or internal path.
        record.msg = "ClearMessage server diagnostic; check service health."
        record.args = ()
        record.exc_info = None
        record.exc_text = None
        record.stack_info = None
        return True


LOG_CONFIG = {
    "version": 1, "disable_existing_loggers": False,
    "filters": {"private": {"()": PrivateDiagnostic}},
    "handlers": {
        "private": {"class": "logging.StreamHandler", "filters": ["private"], "stream": "ext://sys.stderr"},
        "discard": {"class": "logging.NullHandler"},
    },
    "loggers": {
        "uvicorn": {"handlers": ["private"], "level": "WARNING", "propagate": False},
        "uvicorn.error": {"handlers": ["private"], "level": "WARNING", "propagate": False},
        "uvicorn.access": {"handlers": ["discard"], "propagate": False},
    },
}
