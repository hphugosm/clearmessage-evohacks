#!/usr/bin/env python3
"""Check owned language/brand metadata without reading ignored message datasets.

A language scan assists editorial review; it cannot prove every sentence is
English or establish model accuracy. Intentional non-English input exceptions
are exact paths, and Python exceptions apply only within string literals.
"""
from __future__ import annotations

import hashlib
import html
import io
import json
from pathlib import Path
import re
import subprocess
import sys
import tokenize
import unicodedata
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CZECH = re.compile(r"[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]")
# Legacy identifiers are diagnostic patterns only, never displayed as branding.
LEGACY = re.compile(r"klidn[aá][\s_-]*zpr[aá]va", re.IGNORECASE)
PYTHON_INPUTS = {
    "scripts/verify_analysis.py",
    "tests/test_analysis.py",
    "tests/test_czech_format.py",
    "tests/test_data_prep.py",
}
BROWSER_INPUTS = {
    "Fiktivní zpráva: zítra se potkáme ve škole.",
    "Fiktivní krátká zpráva.",
    "Pošli mi své heslo. ${canary}",
    "Jiná fiktivní zpráva.",
}
SUFFIXES = {".md", ".py", ".ts", ".tsx", ".mjs", ".css", ".json", ".txt", ".in", ".html", ".svg", ".sh", ".toml", ".yaml", ".yml"}


def owned_paths() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=ROOT, capture_output=True, check=True,
    )
    names = sorted(set(result.stdout.decode().rstrip("\0").split("\0")))
    return [ROOT / name for name in names if name and (ROOT / name).is_file()]


def python_without_literals(text: str) -> str:
    rows = text.splitlines(keepends=True)
    for token in tokenize.generate_tokens(io.StringIO(text).readline):
        if token.type != tokenize.STRING:
            continue
        for index in range(token.start[0] - 1, token.end[0]):
            left = token.start[1] if index == token.start[0] - 1 else 0
            right = token.end[1] if index == token.end[0] - 1 else len(rows[index])
            rows[index] = rows[index][:left] + " " * (right - left) + rows[index][right:]
    return "".join(rows)


def main() -> int:
    failures: list[str] = []
    paths = owned_paths()
    for path in paths:
        name = path.relative_to(ROOT).as_posix()
        if path.suffix not in SUFFIXES and path.name not in {"Dockerfile", ".gitignore", ".dockerignore"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            failures.append(f"{name}: unexpected non-UTF-8 owned text")
            continue
        decoded = html.unescape(text)
        decoded = re.sub(r"\\u([0-9a-fA-F]{4})", lambda match: chr(int(match[1], 16)), decoded)
        decoded = unicodedata.normalize("NFC", decoded)
        if name != "scripts/audit_migration.py" and (LEGACY.search(decoded) or LEGACY.search(name)):
            failures.append(f"{name}: legacy product identifier")
        if name == "scripts/audit_migration.py":
            continue  # Diagnostic patterns and explicit input exceptions above.
        if name in PYTHON_INPUTS:
            decoded = python_without_literals(text)
        elif name == "frontend/tests/app.spec.ts":
            for value in BROWSER_INPUTS:
                decoded = decoded.replace(value, "")
        if CZECH.search(decoded):
            failures.append(f"{name}: untranslated Czech prose outside input exceptions")
        if path.suffix == ".md":
            for target in re.findall(r"\]\(([^)\s]+)\)", text):
                if ":" in target or target.startswith("#"):
                    continue
                local = path.parent / target.split("#")[0]
                if not local.exists():
                    failures.append(f"{name}: missing local documentation target {target}")

    index = (ROOT / "frontend/index.html").read_text()
    if '<html lang="en">' not in index or "<title>ClearMessage — Message guidance</title>" not in index:
        failures.append("frontend/index.html: English identity metadata mismatch")
    package = json.loads((ROOT / "frontend/package.json").read_text())
    lock = json.loads((ROOT / "frontend/package-lock.json").read_text())
    if any(value != "clearmessage" for value in (package["name"], lock["name"], lock["packages"][""]["name"])):
        failures.append("frontend package identity mismatch")
    schema = json.loads((ROOT / "docs/openapi.json").read_text())
    if schema["info"]["title"] != "ClearMessage":
        failures.append("OpenAPI identity mismatch")
    copy = (ROOT / "frontend/src/copy.ts").read_text()
    app = (ROOT / "frontend/src/App.tsx").read_text()
    if "UiLanguage" in copy or "uiLanguage" in app or "setUiLanguage" in app:
        failures.append("frontend: interface locale switch/fallback remains")
    demos = json.loads((ROOT / "tests/fixtures/demo_messages.json").read_text())
    if any(row["language"] != "en" or row["origin"] != "manual_fictional_demo_only" or "label" in row for row in demos):
        failures.append("public demo copy/provenance mismatch")
    for name in ("assets/brand/mark.svg", "assets/brand/support-illustration.svg"):
        tree = ET.fromstring((ROOT / name).read_bytes())
        if any(element.tag.endswith(("script", "foreignObject")) or any(key.startswith("on") or key.endswith("href") for key in element.attrib) for element in tree.iter()):
            failures.append(f"{name}: active or external SVG content")
    font = ROOT / "frontend/src/assets/InterVariable.woff2"
    if hashlib.sha256(font.read_bytes()).hexdigest() != "693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3":
        failures.append("bundled Inter differs from recorded upstream artifact")
    if "SIL OPEN FONT LICENSE" not in (ROOT / "frontend/src/assets/Inter-LICENSE.txt").read_text():
        failures.append("font license missing")
    if failures:
        print("Migration audit failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print(f"Migration audit passed: {len(paths)} owned files inspected; input-language exceptions retained.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
