"""Serve only generated Pages artifacts under their real project subpath."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

root = Path(__file__).resolve().parents[1]
preview = root / "build/pages-preview"
preview.mkdir(parents=True, exist_ok=True)
link = preview / "clearmessage-evohacks"
if not link.exists():
    link.symlink_to("../pages", target_is_directory=True)
ThreadingHTTPServer(("127.0.0.1", 8872), partial(SimpleHTTPRequestHandler, directory=str(preview))).serve_forever()
