"""Versioned decisions: thresholds + scope + coverage + observed requests."""
from dataclasses import dataclass
import math
import re
from backend.contracts import AnalyzeRequest, AnalyzeResponse, CONTRACT_VERSION, Evidence, POLICY_VERSION, Status
from backend.inference import Classifier, CONFIG, Prediction
from backend.rules import observed_rules
from backend.urls import parse_urls

@dataclass(frozen=True)
class Policy:
    warning_threshold: float = CONFIG["warning_threshold"]  # Goal02 validation.
    reassurance_validated: bool = CONFIG["reassurance_policy_validated"]
    # Reserved, NOT selected/evaluated in Goal02. Disabled in production; tests
    # exercise invariants with test-only models. A new validated policy is needed.
    ham_threshold: float = 0.90
    spam_ceiling: float = 0.15
    smishing_ceiling: float = 0.10

def valid_prediction(prediction: Prediction) -> bool:
    values = (prediction.ham, prediction.spam, prediction.smishing)
    return all(math.isfinite(v) and 0 <= v <= 1 for v in values) and abs(sum(values) - 1) < 1e-6 and type(prediction.full_text_coverage) is bool

def analyze_text(payload: AnalyzeRequest, classifier: Classifier, policy: Policy = Policy()) -> AnalyzeResponse:
    urls = parse_urls(payload.text)
    rule_text = list(payload.text)
    for url in urls:
        # Path/domain words are not direct human-language instructions.
        rule_text[url.start:url.end] = " " * (url.end - url.start)
    rules = observed_rules("".join(rule_text))
    limitations = []
    prediction = None
    language = payload.message_language
    if language == "auto":
        limitations.append("language_unspecified")
    if language not in classifier.evaluated_languages:
        limitations.append("language_not_evaluated")
    if not classifier.ready:
        limitations.extend(["model_not_ready", "rules_only"])
    else:
        if not classifier.human_review_complete:
            limitations.append("human_review_incomplete")
        if len(re.findall(r"[^\W\d_]+", payload.text, re.UNICODE)) < 3:
            limitations.extend(["insufficient_text", "rules_only"])
        else:
            try:
                prediction = classifier.predict(payload.text, language)
                if not valid_prediction(prediction):
                    raise ValueError("invalid_model_output")
                if not prediction.full_text_coverage:
                    limitations.extend(["incomplete_coverage", "rules_only"])
            except Exception:
                prediction = None
                limitations.extend(["inference_unavailable", "rules_only"])
    if not policy.reassurance_validated:
        limitations.append("policy_not_validated")
    complete = not limitations
    status = Status.review
    evidence = [Evidence(key=m.key, basis="observed_text_signal") for m in rules][:3]
    # Only EN may use the experimental model warning. This is not evaluated EN
    # performance: it cannot complete analysis. CZ/unknown use observed rules.
    if prediction and prediction.full_text_coverage and language == "en" and prediction.smishing >= policy.warning_threshold:
        if len(evidence) < 3:
            evidence.append(Evidence(key="model_signal", basis="classifier"))
    if evidence:
        status = Status.suspicious
    elif complete and prediction and prediction.ham >= policy.ham_threshold and prediction.spam <= policy.spam_ceiling and prediction.smishing <= policy.smishing_ceiling:
        status = Status.no_strong_signals
    actions = ["verify_independently"]
    keys = {e.key for e in evidence}
    if "request_for_secret" in keys:
        actions.append("do_not_send_secrets")
    elif "payment_pressure" in keys:
        actions.append("pause_payment")
    actions.append("ask_trusted_person")
    return AnalyzeResponse(
        status=status, analysis_complete=complete,
        headline_key="model_not_ready" if status == Status.review and not classifier.ready else {Status.review: "review_required", Status.suspicious: "suspicious_signals", Status.no_strong_signals: "no_strong_signals"}[status],
        evidence=evidence, action_keys=actions,
        limitations=[*dict.fromkeys(limitations), "not_a_safety_confirmation"],
        message_language=language, model_version=classifier.version,
        policy_version=POLICY_VERSION, contract_version=CONTRACT_VERSION,
        share_summary_keys=(["analysis_not_completed"] if not complete else []) + ["help_verify_independently"],
    )
