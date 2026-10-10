#!/usr/bin/env python3
"""Offline fresh-process inference. Read input from stdin, never echo or log it."""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.data_prep import DataError, bounded_read, digest
from ml.sparse_model import SparseModel


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--artifact", type=Path, required=True)
    p.add_argument("--sha256", required=True)
    p.add_argument("--encoder-directory", type=Path)
    p.add_argument("--threshold", type=float, default=0.75)
    a = p.parse_args()
    try:
        payload = bounded_read(a.artifact)
        if digest(payload) != a.sha256:
            raise DataError("model_artifact_hash_mismatch")
        if json.loads(payload).get("kind") == "frozen_minilm_linear_head":
            if a.encoder_directory is None:
                raise DataError("local_encoder_missing")
            from ml.frozen_encoder import EmbeddingModel
            model = EmbeddingModel(a.artifact, a.sha256, a.encoder_directory)
        else:
            model = SparseModel(a.artifact, a.sha256)
        body = sys.stdin.buffer.read(32769)
        if len(body) > 32768:
            raise DataError("input_size_limit")
        value = json.loads(body)
        result = model.analyze(value["text"], value.get("language", "und"), a.threshold)
        print(json.dumps(result, sort_keys=True))
        return 0
    except DataError as error:
        print(json.dumps({"status": "review", "analysis_complete": False, "code": str(error)}))
    except (OSError, ValueError, KeyError, TypeError, RuntimeError):
        print('{"status":"review","analysis_complete":false,"code":"inference_failed"}')
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
