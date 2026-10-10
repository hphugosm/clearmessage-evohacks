"""A small seam for a future locally trained classifier, with no downloads."""

from dataclasses import dataclass
from typing import Literal, Protocol


@dataclass(frozen=True)
class Prediction:
    label: Literal["ham", "spam", "smishing"]
    full_text_coverage: bool


class Classifier(Protocol):
    @property
    def version(self) -> str | None: ...

    @property
    def ready(self) -> bool: ...

    def predict(self, text: str, message_language: str) -> Prediction: ...


class ModelNotReady(Exception):
    """Fixed exception with no message text."""


class UnavailableClassifier:
    """Real absence of a model. Never a keyword fallback or a demo classifier."""

    version = None
    ready = False

    def predict(self, text: str, message_language: str) -> Prediction:
        raise ModelNotReady("model_not_ready")
