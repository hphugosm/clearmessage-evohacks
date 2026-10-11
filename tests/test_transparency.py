"""Published aggregate facts must match frozen hash-verified report identities."""
import json
from pathlib import Path
from scripts.export_transparency import facts
from fastapi.testclient import TestClient
from backend.app import create_app

ROOT = Path(__file__).resolve().parents[1]

def test_aggregate_ui_facts_match_approved_source_reports():
    expected = facts()
    assert json.loads((ROOT / 'frontend/src/model-facts.json').read_bytes()) == expected
    assert expected['datasetCount'] == 5873
    assert expected['classCounts'] == {'ham':4844,'spam':439,'smishing':590}
    assert expected['testCount'] == 880
    assert expected['smishingCorrect'] == 74
    assert expected['perClass']['smishing']['false_negatives'] == 14
    assert expected['languageBenchmarks']['english'] is None
    assert expected['languageBenchmarks']['czech'] is None
    assert not expected['independentBlindValidation']
    assert expected['confusionMatrix'] == [[720,5,1],[10,48,8],[3,11,74]]

def test_transparency_route_serves_same_origin_without_generic_fallback(tmp_path):
    (tmp_path / 'assets').mkdir()
    (tmp_path / 'index.html').write_text('<html lang="en"><title>ClearMessage test-only shell</title></html>')
    with TestClient(create_app(frontend_dir=tmp_path)) as client:
        response=client.get('/how-it-works')
        assert response.status_code == 200
        assert response.headers['cache-control'] == 'no-store'
        assert "worker-src 'self'" in response.headers['content-security-policy']
        assert "'wasm-unsafe-eval'" in response.headers['content-security-policy']
        assert "'unsafe-eval'" not in response.headers['content-security-policy']
        assert client.get('/unregistered-path').status_code == 404
