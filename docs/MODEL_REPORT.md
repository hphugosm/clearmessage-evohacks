# ClearMessage approved-data model report

11 October 2026. Actual approved-data results, per-class precision/recall/F1,
confusion matrices, FP/FN, coverage and exact commands are in
[MODEL_CARD](MODEL_CARD.md). Complete machine-readable results and error IDs:
[training report](../ml/reports/goal02-approved-v1.json),
[recomputed old/new comparison and integrated policy](data/approved-model-audit-v1.json).

Selected TF-IDF C=2.0, validation macro-F1 0.876209, reused test macro-F1 0.863645.
The selected provisional model has the same aggregate metrics and predictions;
two approved train-label corrections changed weights/hash, not these predictions.
Smishing test precision 0.891566, recall 0.840909, F1 0.865497, nine FP and 14 FN.

The 880-row test has already been evaluated: no fresh blind or independent benchmark.
Language-specific English and Czech metrics are separately unavailable. Synthetic
regression cases establish behavior only. Current unspecified-language API checks
all abstain to review and never establish safety. No results were fabricated.

Prior experiment: [historical report](MODEL_REPORT-provisional-20261011.md).
