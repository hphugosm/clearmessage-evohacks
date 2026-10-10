"""Explicit setup-only lock generation from installed versions + PyPI hashes."""

import importlib.metadata as metadata
import json
from pathlib import Path
from urllib.request import urlopen

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name

ROOT = Path(__file__).resolve().parents[1]


def closure(names):
    found = {}
    while names:
        name = canonicalize_name(names.pop())
        if name in found:
            continue
        dist = metadata.distribution(name)
        found[name] = dist.version
        for line in dist.requires or []:
            requirement = Requirement(line)
            if requirement.marker is None or requirement.marker.evaluate({"extra": ""}):
                names.append(requirement.name)
    return found


runtime = closure(["fastapi", "pydantic", "uvicorn"])
development = closure(["pytest", "httpx"])
for filename, packages, prefix in [
    ("requirements.txt", runtime, ""),
    ("requirements-dev.txt", {key: value for key, value in development.items() if key not in runtime}, "-r requirements.txt\n"),
]:
    lines = ["# Generated at explicit setup time by scripts/lock_dependencies.py.\n", prefix]
    for name, version in sorted(packages.items()):
        with urlopen(f"https://pypi.org/pypi/{name}/{version}/json", timeout=20) as response:
            release = json.load(response)
        hashes = sorted({item["digests"]["sha256"] for item in release["urls"] if item["packagetype"] == "bdist_wheel" and not item["yanked"]})
        if not hashes:
            raise SystemExit(f"No usable wheels: {name}=={version}")
        lines.append(f"{name}=={version} \\\n" + " \\\n".join(f"    --hash=sha256:{value}" for value in hashes) + "\n")
    (ROOT / "backend" / filename).write_text("".join(lines))
    print(f"Locked backend/{filename}: {len(packages)} exact versions, wheel hashes.")
