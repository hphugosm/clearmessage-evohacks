#!/usr/bin/env python3
"""Explicit public asset acquisition; never called by analysis/inference."""

import hashlib
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.data_prep import json_bytes, write_new

MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
REVISION = "e8f8c211226b894fcb81acc59f3b34ba3efd5f42"
DEST = Path("ml/artifacts/encoder")
FILES = ("README.md", "config.json", "config_sentence_transformers.json", "modules.json",
         "sentence_bert_config.json", "1_Pooling/config.json", "model.safetensors",
         "tokenizer.json", "tokenizer_config.json", "special_tokens_map.json",
         "sentencepiece.bpe.model")


def main():
    manifest = {"model_id": MODEL, "revision": REVISION, "license": "Apache-2.0",
                "license_source": f"https://huggingface.co/{MODEL}/blob/{REVISION}/README.md", "files": {}}
    for name in FILES:
        target = DEST / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            temp = target.with_suffix(target.suffix + ".partial")
            try:
                with urlopen(f"https://huggingface.co/{MODEL}/resolve/{REVISION}/{name}", timeout=45) as response, temp.open("wb") as out:
                    size = 0
                    while chunk := response.read(1024 * 1024):
                        size += len(chunk)
                        if size > 700 * 1024 * 1024:
                            raise ValueError("asset_size_limit")
                        out.write(chunk)
                temp.rename(target)
            except (OSError, HTTPError, URLError, ValueError):
                temp.unlink(missing_ok=True)
                print(json.dumps({"status": "blocked", "code": "encoder_download_failed", "asset": name}))
                return 2
        h = hashlib.sha256()
        with target.open("rb") as f:
            while chunk := f.read(1024 * 1024): h.update(chunk)
        manifest["files"][name] = {"sha256": h.hexdigest(), "bytes": target.stat().st_size}
        print(json.dumps({"asset": name, "bytes": target.stat().st_size}), flush=True)
    if "license: apache-2.0" not in (DEST / "README.md").read_text().lower():
        raise ValueError("encoder_license_not_verified")
    write_new(DEST / "assets.json", json_bytes(manifest))
    write_new(Path("ml/encoder-assets.json"), json_bytes(manifest))
    print(json.dumps({"status": "acquired", "revision": REVISION, "license": "Apache-2.0"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
