"""Frozen, verified local encoder. Refuse overflow instead of silent truncation."""

import hashlib
import json
import os
from pathlib import Path

import numpy as np

from ml.data_prep import DataError
from ml.sparse_model import MAX_INPUT, SparseModel

REVISION = "e8f8c211226b894fcb81acc59f3b34ba3efd5f42"


class FrozenEncoder:
    def __init__(self, directory: Path):
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
        os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
        import torch
        from sentence_transformers import SentenceTransformer
        from transformers.utils import logging
        logging.set_verbosity_error()
        from ml.data_prep import digest
        if digest((directory / "assets.json").read_bytes()) != digest(Path(__file__).with_name("encoder-assets.json").read_bytes()):
            raise DataError("encoder_asset_manifest_mismatch")
        assets = json.loads((directory / "assets.json").read_text())
        if assets["revision"] != REVISION or assets["license"] != "Apache-2.0":
            raise DataError("encoder_provenance_mismatch")
        for name, info in assets["files"].items():
            if Path(name).is_absolute() or ".." in Path(name).parts:
                raise DataError("encoder_asset_path_invalid")
            h = hashlib.sha256()
            with (directory / name).open("rb") as f:
                while chunk := f.read(1024 * 1024): h.update(chunk)
            if h.hexdigest() != info["sha256"]:
                raise DataError("encoder_asset_hash_mismatch")
        modules = json.loads((directory / "modules.json").read_text())
        if [(m["type"], m["path"]) for m in modules] != [
                ("sentence_transformers.models.Transformer", ""),
                ("sentence_transformers.models.Pooling", "1_Pooling")]:
            raise DataError("encoder_modules_not_allowlisted")
        torch.set_num_threads(4)
        self.model = SentenceTransformer(str(directory.resolve()), device="cpu", local_files_only=True,
                                         trust_remote_code=False, token=False,
                                         model_kwargs={"use_safetensors": True})
        self.model.eval()
        self.model.requires_grad_(False)
        self.max_tokens = int(self.model.max_seq_length)
        if self.max_tokens != 128:
            raise DataError("encoder_token_limit_changed")
        self.assets = assets

    def coverage(self, texts):
        result = self.model.tokenizer(texts, truncation=False, padding=False,
                                      add_special_tokens=True, return_attention_mask=False)
        return np.asarray([len(ids) <= self.max_tokens for ids in result["input_ids"]])

    def encode(self, texts):
        if not self.coverage(texts).all():
            raise DataError("encoder_token_overflow")
        return self.model.encode(texts, batch_size=32, show_progress_bar=False,
                                 convert_to_numpy=True, normalize_embeddings=False)


class EmbeddingModel(SparseModel):
    def __init__(self, path: Path, expected_sha256: str, encoder_directory: Path, encoder=None):
        from ml.data_prep import LABELS, bounded_read, digest
        payload = bounded_read(path)
        if digest(payload) != expected_sha256:
            raise DataError("model_artifact_hash_mismatch")
        state = json.loads(payload)
        if state.get("kind") != "frozen_minilm_linear_head" or state.get("encoder_revision") != REVISION:
            raise DataError("model_artifact_format_invalid")
        if digest((encoder_directory / "assets.json").read_bytes()) != state["encoder_assets_sha256"]:
            raise DataError("encoder_asset_manifest_mismatch")
        self.encoder = encoder or FrozenEncoder(encoder_directory)
        self.classes = np.asarray(state["classes"])
        dtype = state.get("coefficient_dtype", "float64")
        if dtype not in ("float32", "float64"):
            raise DataError("model_artifact_dtype_invalid")
        self.coef = np.asarray(state["coefficients"], dtype=dtype)
        self.intercept = np.asarray(state["intercept"], dtype=dtype)
        if sorted(self.classes.tolist()) != sorted(LABELS) or self.coef.shape != (3, 384) or self.intercept.shape != (3,):
            raise DataError("model_artifact_dimensions_invalid")
        if not np.isfinite(self.coef).all() or not np.isfinite(self.intercept).all():
            raise DataError("model_artifact_weights_invalid")
        self.provenance = state["provenance"]
        self.version = "clearmessage-minilm-head-v1"

    def predict_proba(self, texts):
        from scipy.special import softmax
        return softmax(self.encoder.encode(texts) @ self.coef.T + self.intercept, axis=1)

    def analyze(self, text, language="und", threshold=0.75):
        if isinstance(text, str) and text.strip() and len(text) <= MAX_INPUT and not self.encoder.coverage([text]).all():
            return {"status": "review", "analysis_complete": False, "model_version": self.version,
                    "policy_version": "provisional-policy-v1", "limitations": ["token_coverage_incomplete"]}
        return super().analyze(text, language, threshold)
