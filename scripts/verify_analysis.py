"""Measured synthetic API smoke/latency report; never a language benchmark."""
import hashlib
import json
from pathlib import Path
import platform
import resource
import socket
import sys
import time
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from fastapi.testclient import TestClient
from backend.app import create_app
from backend.inference import CONFIG
from backend.rules import RULES_VERSION

# Our fictional development fixtures, not corpus/test/blind examples.
CASES = (
    ("cz_secret_no_url", "Pošli mi prosím své heslo.", "cs"),
    ("en_payment", "Please pay this fictional invoice immediately.", "en"),
    ("en_security_advice", "Never share your password with anyone.", "en"),
    ("en_advertisement", "Fictional notebook sale: buy two, get one free. https://shop.invalid/offer", "en"),
    ("en_school", "Our fictional school meeting is tomorrow.", "en"),
)

def main():
    network_calls = []
    def deny(*args, **kwargs):
        network_calls.append(True)
        raise AssertionError("network_forbidden")
    timings, outcomes = [], []
    started = time.perf_counter()
    with patch.object(socket, "getaddrinfo", deny), patch.object(socket.socket,"connect",deny), patch.object(socket.socket,"connect_ex",deny), patch.object(socket,"create_connection",deny):
        app = create_app()
        load_ms = (time.perf_counter() - started) * 1000
        with TestClient(app) as client:
            health = client.get("/api/health").json()
            if not health["model_ready"]:
                raise SystemExit("Verification blocked: actual selected model unavailable")
            for name, text, language in CASES:
                for repeat in range(5):
                    start = time.perf_counter()
                    response = client.post("/api/analyze",json={"text":text,"message_language":language})
                    timings.append((time.perf_counter()-start)*1000)
                    data = response.json()
                    assert response.status_code == 200 and response.headers["cache-control"] == "no-store"
                    assert data["analysis_complete"] is False and data["status"] != "no_strong_signals"
                    if repeat == 0:
                        outcomes.append({"fixture_id":name,"message_language":language,**data})
    assert not network_calls
    timings.sort()
    report = {
        "fixture_origin":"project-written synthetic development fixtures; not performance validation",
        "held_out_or_blind_data_opened":False, "training_performed":False,
        "model_sha256":CONFIG["sha256"],"rules_version":RULES_VERSION,"health":health,
        "checks":{"real_api":"passed","no_egress":{"attempted_calls":len(network_calls)},"no_reassurance":"passed"},
        "measurements":{"device":platform.platform(),"machine":platform.machine(),"python":platform.python_version(),"application_factory_ms":load_ms,
            "timing_scope":"25 loaded-model in-process TestClient requests, including HTTP/ASGI + model + rules and cold bundled PSL; excludes first module import",
            "requests":len(timings),"p50_ms":timings[len(timings)//2],"p95_ms":timings[int(len(timings)*.95)],"max_ms":max(timings),"process_peak_rss_bytes":resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * (1 if sys.platform == "darwin" else 1024)},
        "outcomes":outcomes,
    }
    destination = ROOT / "ml/reports/goal03-integration.json"
    destination.write_text(json.dumps(report,ensure_ascii=False,indent=2,sort_keys=True)+"\n")
    print("Saved measured synthetic verification: ml/reports/goal03-integration.json")

if __name__ == "__main__":
    main()
