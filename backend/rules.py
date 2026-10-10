"""Small CZ/EN request rules with original character offsets as internal proof.

These describe observed requests, not intent or verified fraud. Conservative
negation/education handling may miss sophisticated wording. No keyword ML fallback.
"""
from dataclasses import dataclass
import re
import unicodedata

RULES_VERSION = "observed-requests-1"

@dataclass(frozen=True)
class RuleMatch:
    key: str
    start: int
    end: int

SECRET = r"(?:passwords?|passcodes?|otp|verification\s+codes?|one[ -]time\s+(?:codes?|passwords?)|hesl\w*|overovac\w*\s+kod\w*|jednorazov\w*\s+kod\w*)"
REQUEST = r"(?:send|share|tell|provide|give|reply\s+with|forward|posli|poslete|sd[ei]l\w*|zasli|zaslete|preposli|preposlete|napis\w*)"
PAY = r"(?:pay|transfer\s+(?:(?:the|your|some)\s+)?(?:money|funds|payment|\d+)|send\s+(?:money|payment)|zaplat\w*|uhrad\w*|preved\w*\s+(?:penize|castku|\d+)|posli\w*\s+penize)"
URGENT = r"(?:now|immediately|right\s+away|within\s+\d+\s+minutes|hned|ihned|okamzite|do\s+\d+\s+minut)"
TRUSTED = r"(?:anyone|parents?|family|friends?|bank|trusted\s+person|nikomu|rodic\w*|rodin\w*|pratel\w*|bank\w*|duveryhodn\w*)"
PATTERNS = {
    "request_for_secret": re.compile(rf"\b{REQUEST}\b[^.!?;\n]{{0,55}}?\b{SECRET}\b"),
    "payment_pressure": re.compile(rf"\b(?:{PAY}\b[^.!?;\n]{{0,55}}?\b{URGENT}|{URGENT}\b[^.!?;\n]{{0,35}}?\b{PAY})\b"),
    "secrecy_request": re.compile(rf"\b(?:(?:do\s+not|don't|dont|never)\s+(?:tell|inform|contact)\b[^.!?;\n]{{0,40}}?\b{TRUSTED}|(?:nerikej\w*|nesdeluj\w*|nekontaktuj\w*)\b[^.!?;\n]{{0,40}}?\b{TRUSTED}|keep\s+(?:this|it)\s+(?:secret|between\s+us)|nech\w*\s+si\s+to\s+pro\s+sebe)\b"),
}
NEGATION = re.compile(r"\b(?:not|never|don't|dont|no\s+need\s+to|nemus\w*|neposil\w*|nesdilej\w*|nezasil\w*|neplat\w*|nezaplat\w*|nehrad\w*)\b")
EDUCATION = re.compile(r"\b(?:beware|scam\s+(?:example|warning)|example\s+of\s+(?:a\s+)?scam|if\s+(?:someone|anyone)|will\s+never|never\s+ask|nikdy\s+ne|pozor|priklad\s+podvodu|pokud\s+(?:nekdo|vas)|kdyz\s+(?:nekdo|vas))\b")
CLAUSES = re.compile(r"[^.!?;\n]+")
CONTRAST = re.compile(r"\b(?:but|however|ale|avsak)\b")

def folded(text: str) -> tuple[str, list[int]]:
    chars, indices = [], []
    for index, char in enumerate(text):
        for part in unicodedata.normalize("NFKD", char).lower():
            if not unicodedata.combining(part):
                chars.append(part)
                indices.append(index)
    return "".join(chars), indices

def observed_rules(text: str) -> list[RuleMatch]:
    value, indices = folded(text)
    found = {}
    for clause in CLAUSES.finditer(value):
        # Earlier warnings cannot suppress a later direct request after "but".
        contrasts = list(CONTRAST.finditer(clause.group()))
        starts = [clause.start()] + [clause.start() + m.end() for m in contrasts]
        ends = [clause.start() + m.start() for m in contrasts] + [clause.end()]
        for start, end in zip(starts, ends):
            segment = value[start:end]
            if EDUCATION.search(segment):
                continue
            for key, pattern in PATTERNS.items():
                for match in pattern.finditer(segment):
                    prefix = segment[max(0, match.start() - 35):match.start()]
                    if key != "secrecy_request" and (NEGATION.search(prefix) or NEGATION.search(match.group())):
                        continue
                    if key == "secrecy_request" and match.group().startswith(("keep", "nech")) and NEGATION.search(prefix):
                        continue
                    # Advice not to disclose secrets is not concealment pressure.
                    if key == "secrecy_request" and (re.search(SECRET, match.group()) or re.match(rf"\s+(?:(?:your|the|sve|svoje|svuj)\s+)?{SECRET}\b", segment[match.end():])):
                        continue
                    left, right = start + match.start(), start + match.end()
                    found.setdefault(key, RuleMatch(key, indices[left], indices[right - 1] + 1))
    return list(found.values())
