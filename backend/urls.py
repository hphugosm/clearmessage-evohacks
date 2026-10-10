"""Syntax only: no fetching, DNS, reputation lookup, redirects or disk cache."""
from dataclasses import dataclass
import re
from urllib.parse import urlsplit
import tldextract

EXTRACTOR = tldextract.TLDExtract(suffix_list_urls=(), cache_dir=None, fallback_to_snapshot=True)
URL = re.compile(r"(?:https?://|www\.)[^\s<>\"']+", re.IGNORECASE)

@dataclass(frozen=True)
class UrlSyntax:
    start: int
    end: int
    valid: bool

def parse_urls(text: str) -> list[UrlSyntax]:
    found = []
    for match in URL.finditer(text):
        candidate = match.group().rstrip(".,;!?)")
        try:
            parts = urlsplit(candidate if "://" in candidate else "https://" + candidate)
            valid = parts.scheme.lower() in ("http", "https") and bool(parts.hostname)
            _ = parts.port
            if valid:
                EXTRACTOR(parts.hostname)
        except ValueError:
            valid = False
        found.append(UrlSyntax(match.start(), match.start() + len(candidate), valid))
    return found  # Domains/schemes/lengths never become evidence of fraud.
