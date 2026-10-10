import json
import re
from pathlib import Path
from urllib.parse import urlsplit

import pytest
from pydantic import ValidationError

from ml.czech_format import CzechExample


def record():
    return {"id": "cz-dev-fictional", "family_id": "fictional-family", "partition": "development", "language": "cs",
            "label": "ham", "text": "Fiktivní zpráva: zítra bude výuka od devíti.",
            "provenance": {"origin": "manual_fictional", "creator_id": "test-author", "created_date": "2026-10-10", "method": "Fictional test fixture"},
            "review": {"status": "pending"}}


@pytest.mark.parametrize("partition", ["development", "blind_challenge"])
def test_format_supports_separate_partitions_without_loading_real_answers(partition):
    value = record()
    value["partition"] = partition
    assert CzechExample.model_validate(value).partition == partition


def test_translation_must_keep_original_family():
    value = record()
    value["provenance"].update(origin="translation", source_record_id="fictional-source", source_family_id="different-family")
    with pytest.raises(ValidationError):
        CzechExample.model_validate(value)
    value["family_id"] = "different-family"
    assert CzechExample.model_validate(value).provenance.origin == "translation"


def test_author_cannot_confirm_own_label():
    value = record()
    value["review"] = {"status": "confirmed", "reviewer_id": "test-author", "reviewed_date": "2026-10-10", "label_rationale": "Fictional rationale"}
    with pytest.raises(ValidationError):
        CzechExample.model_validate(value)
    value["review"]["reviewer_id"] = "test-independent-reviewer"
    assert CzechExample.model_validate(value).review.status == "confirmed"


def test_czech_schema_has_not_drifted():
    expected = json.loads(Path("ml/czech/record.schema.json").read_text())
    assert expected == CzechExample.model_json_schema()


def test_public_demo_fixtures_are_fictional_inert_and_not_ground_truth():
    records = json.loads(Path("tests/fixtures/demo_messages.json").read_text())
    assert {row["language"] for row in records} == {"cs", "en"}
    for row in records:
        assert row["origin"] == "manual_fictional_demo_only"
        assert "label" not in row
        for url in re.findall(r"https?://[^\s]+", row["text"]):
            assert urlsplit(url).hostname.endswith(".invalid")
