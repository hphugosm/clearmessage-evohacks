"""Offsets describe existing observed rules; no classifier or policy changes."""
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient
from backend.app import create_app
from backend.contracts import Evidence, EvidenceSpan

@pytest.mark.parametrize('text,expected', [
    ('Please send me your password.', [('request_for_secret', 'send me your password')]),
    ('😀 Please send me your login code. Pay me now. Keep this secret.', [('request_for_secret', 'send me your login code'), ('payment_pressure', 'Pay me now'), ('secrecy_request', 'Keep this secret')]),
    ('https://notice.invalid/send-me-your-password Please send me your login code.', [('request_for_secret', 'send me your login code')]),
    ('Never share your password. But please send me your login code.', [('request_for_secret', 'send me your login code')]),
    ('Please send <b>your</b> password.', [('request_for_secret', 'send <b>your</b> password')]),
])
def test_actual_api_exact_offsets_without_returning_source_text(text, expected):
    with TestClient(create_app()) as client:
        response = client.post('/api/analyze', json={'text': text, 'message_language': 'auto'})
    assert response.status_code == 200
    data = response.json()
    assert not data['analysis_complete']
    assert [(item['key'], text[item['span']['start']:item['span']['end']]) for item in data['evidence']] == expected
    assert all(set(item) == {'key', 'basis', 'span'} and set(item['span']) == {'start', 'end'} for item in data['evidence'])
    assert text not in response.text

@pytest.mark.parametrize('span', [{'start': 1, 'end': 1}, {'start': -1, 'end': 4}, {'start': 0, 'end': 2001}, {'start': '0', 'end': 3}])
def test_invalid_span_is_rejected(span):
    with pytest.raises(ValidationError):
        EvidenceSpan.model_validate(span)


def test_classifier_has_no_word_attribution_and_old_evidence_still_works():
    assert Evidence(key='request_for_secret', basis='observed_text_signal').span is None
    with pytest.raises(ValidationError):
        Evidence(key='model_signal', basis='classifier', span=EvidenceSpan(start=0,end=3))
