"""Stage a hash-manifested runtime, with no raw corpus, tests or training CLI."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.runtime import PrivateArgumentParser
from backend.inference import CONFIG, LocalClassifier

RUNTIME_FILES = [
    *[f"backend/{name}" for name in ("__init__.py", "app.py", "contracts.py", "inference.py", "policy.py", "privacy.py", "rules.py", "urls.py", "runtime.py", "model-config.json", "requirements.txt")],
    "scripts/serve.py", "scripts/healthcheck.py", "ml/sparse_model.py", "ml/data_prep.py",
    "ml/sources/mendeley-v1.json", CONFIG["artifact_path"], CONFIG["selection_report"],
    "DATA_SOURCES.md", "docs/MODEL_CARD.md", "docs/THIRD_PARTY_NOTICES.md", "docs/runtime-licenses.json",
    "frontend/src/assets/Inter-LICENSE.txt",
]


def package(destination: Path, frontend_dir: Path | None = None) -> dict:
    LocalClassifier(ROOT / CONFIG["artifact_path"])
    dist = frontend_dir or ROOT / "frontend/dist"
    if not (dist / "index.html").is_file() or not (dist / "assets").is_dir():
        raise ValueError("frontend_build_missing")
    sources = {name: ROOT / name for name in RUNTIME_FILES}
    sources["frontend/dist/index.html"] = dist / "index.html"
    for asset in sorted((dist / "assets").iterdir()):
        if not asset.is_file() or asset.is_symlink() or asset.suffix not in {".css", ".js", ".svg", ".woff2"}:
            raise ValueError("unexpected_frontend_asset")
        sources[f"frontend/dist/assets/{asset.name}"] = asset
    payloads = {name: source.read_bytes() for name, source in sorted(sources.items())}
    manifest = {
        "format_version": 1, "product": "ClearMessage", "model_sha256": CONFIG["sha256"],
        "selection_report_sha256": CONFIG["selection_report_sha256"],
        "files": {name: hashlib.sha256(value).hexdigest() for name, value in payloads.items()},
        "encoder_required": False, "gpu_required": False,
    }
    payloads["runtime-manifest.json"] = (json.dumps(manifest, sort_keys=True, indent=2) + "\n").encode()
    if destination.is_symlink():
        raise ValueError("symlink_destination_rejected")
    if destination.exists() and any(destination.iterdir()):
        existing = {file.relative_to(destination).as_posix(): file for file in destination.rglob("*") if file.is_file()}
        if any(path.is_symlink() for path in destination.rglob("*")) or set(existing) != set(payloads) or any(existing[name].read_bytes() != value for name, value in payloads.items()):
            raise ValueError("existing_package_differs_choose_empty_destination")
    else:
        for name, value in payloads.items():
            target = destination / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(value)
    return manifest


def main() -> int:
    parser = PrivateArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "build/runtime")
    parser.add_argument("--frontend-dist", type=Path)
    args = parser.parse_args()
    try:
        manifest = package(args.output, args.frontend_dist)
        print(json.dumps({"status": "prepared", "files": len(manifest["files"]), "model_sha256": manifest["model_sha256"]}))
        return 0
    except Exception:
        print('{"status":"blocked","code":"runtime_package_missing_mismatched_or_destination_not_empty"}')
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
