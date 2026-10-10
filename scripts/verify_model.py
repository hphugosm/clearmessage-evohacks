#!/usr/bin/env python3
"""Verify real saved artifacts offline, fresh-process inference and latency."""

import argparse
import json
import os
import platform
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.data_prep import digest, json_bytes, write_new
from ml.sparse_model import SparseModel
from ml.train import Corpus, load_manifest


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--report", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    p.add_argument("--manifest", type=Path, default=Path("ml/manifests/mendeley-v1.split.provisional.json"))
    p.add_argument("--source", type=Path, default=Path("ml/data/raw/Dataset_5971.zip"))
    p.add_argument("--encoder-directory", type=Path, default=Path("ml/artifacts/encoder"))
    p.add_argument("--fresh-python", default=sys.executable)
    a = p.parse_args()
    report = json.loads(a.report.read_text())
    manifest, _ = load_manifest(a.manifest, True)
    corpus = Corpus(a.source, manifest)
    texts, _, _ = corpus.get("validation")
    threshold = report["selection"]["threshold"]
    results = {"experiment_report_sha256": digest(a.report.read_bytes()), "selected_model": report["selection"]["model"],
               "system": platform.system(), "architecture": platform.machine(), "models": {}}
    if platform.system() == "Darwin":
        results["device"] = subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"], text=True).strip()
        results["ram_bytes"] = int(subprocess.check_output(["sysctl", "-n", "hw.memsize"], text=True))
    encoder = None
    for name, artifact in report["artifacts"].items():
        path, h = Path(artifact["file"]), artifact["sha256"]
        if name.startswith("minilm"):
            from ml.frozen_encoder import EmbeddingModel, FrozenEncoder
            encoder = encoder or FrozenEncoder(a.encoder_directory)
            model = EmbeddingModel(path, h, a.encoder_directory, encoder)
            sample = [t for t, keep in zip(texts, encoder.coverage(texts)) if keep][:32]
        else:
            model = SparseModel(path, h)
            sample = texts[:32]
        # The command uses stdin; no message bodies in argv, logs or saved report.
        arguments = ["scripts/infer_model.py", "--artifact", str(path), "--sha256", h, "--threshold", str(threshold)]
        if name.startswith("minilm"):
            arguments.extend(["--encoder-directory", str(a.encoder_directory)])
        wrapper = ("import socket,runpy,sys; "
                   "socket.socket.connect=lambda *a,**k: (_ for _ in ()).throw(RuntimeError('network_disabled')); "
                   "socket.create_connection=lambda *a,**k: (_ for _ in ()).throw(RuntimeError('network_disabled')); "
                   "sys.argv=sys.argv[1:]; runpy.run_path(sys.argv[0],run_name='__main__')")
        interpreter = a.fresh_python if not name.startswith("minilm") else sys.executable
        env = {**os.environ, "HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1"}
        begin = time.perf_counter()
        try:
            process = subprocess.run([interpreter, "-c", wrapper, *arguments],
                                     input=json.dumps({"text": sample[0], "language": "und"}),
                                     capture_output=True, text=True, env=env, timeout=60)
        except subprocess.TimeoutExpired:
            raise SystemExit("fresh_process_timeout") from None
        fresh_seconds = time.perf_counter() - begin
        if process.returncode != 0:
            raise SystemExit("fresh_process_inference_failed")
        prediction = json.loads(process.stdout)
        if prediction != model.analyze(sample[0], "und", threshold):
            raise SystemExit("fresh_process_prediction_mismatch")
        samples = []
        for text in sample:
            begin = time.perf_counter()
            model.analyze(text, "und", threshold)
            samples.append((time.perf_counter() - begin) * 1000)
        item = {"artifact_sha256_verified": True, "fresh_process_inference": "passed",
                "fresh_process_network_disabled": True, "fresh_process_matches_parent": True,
                "fresh_process_wall_seconds_including_imports": fresh_seconds,
                "latency": {"sample_count": len(samples), "median_ms": float(np.median(samples)),
                            "p95_ms": float(np.percentile(samples, 95)), "includes_policy": True, "device": "cpu"},
                "oversized_input_review": model.analyze("x" * 2001)["status"] == "review"}
        if name.startswith("minilm"):
            overflow = model.analyze("word " * 200)
            item["token_overflow_review"] = "token_coverage_incomplete" in overflow["limitations"] and not overflow["analysis_complete"]
            tx = np.load(path.parent / "public_train_embeddings.npy", allow_pickle=False)
            train_texts, _, _ = corpus.get("train")
            train_sample = [t for t, keep in zip(train_texts, encoder.coverage(train_texts)) if keep][:32]
            repeat = encoder.encode(train_sample)
            # Larger original batches can differ slightly in floating-point arithmetic.
            item["repeat_encoding_first32_max_difference"] = float(np.max(np.abs(repeat - tx[:32])))
            if item["repeat_encoding_first32_max_difference"] > 1e-5:
                raise SystemExit("encoder_reproducibility_check_failed")
        results["models"][name] = item
    write_new(a.output, json_bytes(results))
    print(json.dumps({"status": "verified", "models": len(results["models"]), "report": str(a.output)}))


if __name__ == "__main__":
    main()
