"""Explicit offline build preparation: verify/copy our selected JSON. No training."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.runtime import PrivateArgumentParser
from backend.inference import CONFIG, LocalClassifier


def main():
    parser = PrivateArgumentParser(description=__doc__)
    parser.add_argument("--artifact-file", type=Path, help="Import this project's trusted JSON output; the recorded hash is mandatory.")
    args = parser.parse_args()
    report_path = ROOT / CONFIG["selection_report"]
    if hashlib.sha256(report_path.read_bytes()).hexdigest() != CONFIG["selection_report_sha256"]:
        raise ValueError("selection_report_hash_mismatch")
    report = json.loads(report_path.read_text())
    selected = report["selection"]
    if selected["threshold"] != CONFIG["warning_threshold"] or report["artifacts"][selected["model"]]["sha256"] != CONFIG["sha256"]:
        raise ValueError("model_selection_config_mismatch")
    canonical = ROOT / CONFIG["artifact_path"]
    source = args.artifact_file if args.artifact_file is not None else canonical
    model = LocalClassifier(source)
    target = ROOT / "build/model.json"
    payload = source.read_bytes()
    if hashlib.sha256(payload).hexdigest() != CONFIG["sha256"]:
        raise ValueError("model_artifact_hash_mismatch")
    if args.artifact_file is not None:
        if canonical.exists() and canonical.read_bytes() != payload:
            raise ValueError("different_canonical_artifact_exists")
        canonical.parent.mkdir(parents=True, exist_ok=True)
        if not canonical.exists():
            canonical.write_bytes(payload)
    target.parent.mkdir(exist_ok=True)
    if target.exists() and target.read_bytes() != payload:
        raise ValueError("different_build_artifact_exists")
    target.write_bytes(payload)
    print(json.dumps({"model_ready":model.ready,"human_review_complete":model.human_review_complete,"sha256":CONFIG["sha256"],"build_asset":"build/model.json"},sort_keys=True))

if __name__ == "__main__":
    try:
        main()
    except Exception:
        raise SystemExit("Model preparation blocked: missing or mismatched selected project asset/report. Restore or reproduce Goal02; no substitute or download was attempted.") from None
