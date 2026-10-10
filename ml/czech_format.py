"""Record format only; no blind-challenge answers are loaded by preparation."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Provenance(BaseModel):
    model_config = ConfigDict(extra="forbid")
    origin: Literal["manual_fictional", "synthetic", "translation"]
    creator_id: str = Field(min_length=1, max_length=80)
    created_date: date
    method: str = Field(min_length=1, max_length=500)
    source_record_id: str | None = None
    source_family_id: str | None = None


class HumanReview(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["pending", "confirmed", "disagreed"] = "pending"
    reviewer_id: str | None = None
    reviewed_date: date | None = None
    label_rationale: str = Field(default="", max_length=1000)


class CzechExample(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(pattern=r"^cz-[a-z0-9-]+$", max_length=100)
    family_id: str = Field(min_length=1, max_length=100)
    partition: Literal["development", "blind_challenge"]
    language: Literal["cs"]
    label: Literal["ham", "spam", "smishing"]
    text: str = Field(min_length=1, max_length=2000)
    provenance: Provenance
    review: HumanReview

    @model_validator(mode="after")
    def provenance_and_review(self):
        if not self.text.strip():
            raise ValueError("empty_text")
        if self.provenance.origin == "translation":
            if not self.provenance.source_record_id or self.provenance.source_family_id != self.family_id:
                raise ValueError("translation_requires_same_source_family")
        if self.review.status == "confirmed":
            if (not self.review.reviewer_id or self.review.reviewer_id == self.provenance.creator_id
                    or not self.review.reviewed_date or not self.review.label_rationale.strip()):
                raise ValueError("independent_attributed_review_required")
        return self
