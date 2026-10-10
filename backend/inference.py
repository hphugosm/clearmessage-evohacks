"""Small offline inference seam. Scores stay internal; artifacts are hash pinned."""
from dataclasses import dataclass
import json
from pathlib import Path
from threading import BoundedSemaphore
from typing import Protocol

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((Path(__file__).parent / "model-config.json").read_text())

@dataclass(frozen=True)
class Prediction:
    ham: float
    spam: float
    smishing: float
    full_text_coverage: bool

class Classifier(Protocol):
    version: str | None
    ready: bool
    human_review_complete: bool
    evaluated_languages: tuple[str, ...]
    def predict(self, text: str, message_language: str) -> Prediction: ...

class ModelNotReady(Exception):
    """Fixed exception with no message text."""

class UnavailableClassifier:
    version = None
    ready = False
    human_review_complete = False
    evaluated_languages = ()
    def predict(self, text: str, message_language: str) -> Prediction:
        raise ModelNotReady("model_not_ready")

class LocalClassifier:
    """Our selected JSON only. Full bounded sparse input, no tokenizer truncation.

    Processing all characters is not a claim of vocabulary/language understanding.
    A single inference slot rejects overload rather than queuing private text.
    """
    ready = True
    def __init__(self, path: Path):
        from ml.sparse_model import SparseModel
        self._model = SparseModel(path, CONFIG["sha256"])
        self.version = f"{self._model.version}:{CONFIG['sha256'][:12]}"
        self.human_review_complete = CONFIG["human_review_complete"] is True and self._model.provenance.get("human_review_complete") is True
        self.evaluated_languages = tuple(CONFIG["evaluated_languages"])
        self._slot = BoundedSemaphore(1)

    def predict(self, text: str, message_language: str) -> Prediction:
        if not self._slot.acquire(blocking=False):
            raise ModelNotReady("inference_busy")
        try:
            if not isinstance(text, str) or not text.strip() or len(text) > 2000:
                raise ModelNotReady("input_out_of_scope")
            scores = dict(zip(self._model.classes.tolist(), self._model.predict_proba([text])[0]))
            return Prediction(*(float(scores[key]) for key in ("ham", "spam", "smishing")), full_text_coverage=True)
        finally:
            self._slot.release()

def load_classifier() -> Classifier:
    try:
        return LocalClassifier(ROOT / CONFIG["artifact_path"])
    except Exception:
        # Never format exception details or substitute scores/downloads.
        return UnavailableClassifier()
