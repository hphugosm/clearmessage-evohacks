"""Canonical API contract. Exported as OpenAPI and generated TypeScript."""

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MAX_TEXT_LENGTH = 2000
MAX_BODY_BYTES = 32768
CONTRACT_VERSION = "1.1.0"
POLICY_VERSION = "analysis-policy-1"


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, hide_input_in_errors=True)


class AnalyzeRequest(ContractModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)
    message_language: Literal["auto", "cs", "en", "other"] = "auto"

    @field_validator("text")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text_empty")
        return value  # No silent truncation or rewriting of the message.


class Status(StrEnum):
    suspicious = "suspicious"
    review = "review"
    no_strong_signals = "no_strong_signals"


class Evidence(ContractModel):
    key: Literal["model_signal", "request_for_secret", "payment_pressure", "secrecy_request"]
    basis: Literal["classifier", "observed_text_signal"]
    # No source text, URL, phone number, sender name or invented attribution.


class AnalyzeResponse(ContractModel):
    status: Status
    analysis_complete: bool
    headline_key: Literal["model_not_ready", "review_required", "suspicious_signals", "no_strong_signals"]
    evidence: list[Evidence] = Field(max_length=3)
    action_keys: list[Literal["verify_independently", "do_not_send_secrets", "pause_payment", "ask_trusted_person"]] = Field(min_length=1, max_length=3)
    limitations: list[Literal["model_not_ready", "language_not_evaluated", "not_a_safety_confirmation", "inference_unavailable", "incomplete_coverage", "human_review_incomplete", "rules_only", "insufficient_text", "language_unspecified", "policy_not_validated"]] = Field(min_length=1)
    message_language: Literal["auto", "cs", "en", "other"]
    model_version: str | None
    policy_version: str
    contract_version: str
    share_summary_keys: list[Literal["analysis_not_completed", "help_verify_independently"]] = Field(max_length=2)

    @model_validator(mode="after")
    def no_reassurance_without_analysis(self) -> "AnalyzeResponse":
        if self.status == Status.no_strong_signals and (
            not self.analysis_complete
            or not (self.model_version and self.model_version.strip())
            or any(key != "not_a_safety_confirmation" for key in self.limitations)
        ):
            raise ValueError("incomplete_analysis_cannot_reassure")
        if self.status == Status.no_strong_signals and "not_a_safety_confirmation" not in self.limitations:
            raise ValueError("safety_limitation_required")
        if self.analysis_complete and (not self.model_version or any(key != "not_a_safety_confirmation" for key in self.limitations)):
            raise ValueError("limited_analysis_cannot_complete")
        if "not_a_safety_confirmation" not in self.limitations:
            raise ValueError("safety_limitation_required")
        expected_headline = "model_not_ready" if self.status == Status.review and "model_not_ready" in self.limitations else {Status.review: "review_required", Status.suspicious: "suspicious_signals", Status.no_strong_signals: "no_strong_signals"}[self.status]
        if self.headline_key != expected_headline:
            raise ValueError("headline_status_mismatch")
        for item in self.evidence:
            if (item.key == "model_signal") != (item.basis == "classifier"):
                raise ValueError("evidence_basis_mismatch")
            if item.basis == "classifier" and (not self.model_version or any(key in self.limitations for key in ("model_not_ready", "inference_unavailable", "incomplete_coverage"))):
                raise ValueError("unavailable_classifier_cannot_supply_evidence")
        if (self.status == Status.suspicious) != bool(self.evidence):
            raise ValueError("evidence_status_mismatch")
        if len({item.key for item in self.evidence}) != len(self.evidence):
            raise ValueError("duplicate_evidence")
        if ("analysis_not_completed" in self.share_summary_keys) == self.analysis_complete:
            raise ValueError("share_completion_mismatch")
        return self


class HealthResponse(ContractModel):
    service_status: Literal["ok"]
    model_ready: bool
    model_version: str | None
    evaluated_message_languages: list[Literal["cs", "en"]]
    human_review_complete: bool
    policy_version: str
    contract_version: str
    max_text_length: int
    max_body_bytes: int


class ErrorResponse(ContractModel):
    analysis_complete: Literal[False] = False
    error_key: Literal["invalid_input", "body_too_large", "json_required", "unexpected_query", "not_found", "method_not_allowed", "service_unavailable", "request_rejected"]
    contract_version: str = CONTRACT_VERSION
