# ClearMessage model card — approved dataset release candidate

11 October 2026 · Goal 01 explicitly approved by the owner following commit `c1a8c9f`.

**Dataset/retraining/integration candidate; not an independently validated fraud detector.**
All 45 staged decisions and reviewer/language metadata were approved, the exact
98-row quarantine is reversible, and the corrected split is frozen. Only the
45 sampled training messages have human language confirmations. No representative
English or Czech benchmark exists. Every current API assessment remains incomplete;
`no_strong_signals` and stronger red presentations remain disabled.

The runtime uses our newly trained sparse artifact, not the provisional original-label
artifact. Historical results and original data remain available:
[previous model card](MODEL_CARD-provisional-20261011.md),
[previous report](../ml/reports/goal02-provisional-v2.json).

## Data, approval and provenance

Sandhya Mishra and Devpriya Soni (2022), Mendeley Data V1,
DOI `10.17632/f45bkkt8pr.1`, **CC BY 4.0**. See [DATA_SOURCES](../DATA_SOURCES.md).
ham, spam and smishing are preserved; spam is not phishing ground truth and ham
does not establish safety. A 45-row approved audit is not full-corpus reannotation.

| Stage | ham | spam | smishing | Total |
|---|---:|---:|---:|---:|
| Original source | 4,844 | 489 | 638 | 5,971 |
| Approved quarantine | 0 | 48 | 50 | 98 |
| Approved eligible | 4,844 | 439 | 590 | 5,873 |
| Train | 3,391 | 307 | 414 | 4,112 |
| Validation | 727 | 66 | 88 | 881 |
| Test | 726 | 66 | 88 | 880 |

Review sample final labels: 15 HAM / 13 SPAM / 17 SMISHING; 45/45 English,
reviewer hugo, 41 dates retained as 2026-10-10 and four explicit re-confirmations
as 2026-10-11 (unknown original dates preserved). Restore 29 earlier SPAM choices;
only source SPAM `row-000565` and `row-000891` change to SMISHING, both singleton
training groups. Raw labels/text remain untouched; manifest records retain
`source_label` separately from corrected `label`. Canonical schema and notes/history
are preserved in hash-pinned snapshots.

Quarantine: 46 conflicting families, 98 exact row IDs, with 32 normalized-identical,
one template and 13 near-copy/combined groups. Originals are retained; no deletion.
Eligible groups: 5,585, zero mixed-label families, empty row/group/text/normalized/
template intersections. Seed **20261010**. Every candidate partition is retained:
no reshuffle of formerly evaluated data. Time/campaign metadata are unavailable;
missed paraphrase/translation families and imperfect labels remain possible.

| Identity | SHA-256 |
|---|---|
| Raw archive | `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3` |
| Raw CSV (source manifest) | `649844f1c62a6b27e145eaf17a65f7010c56c390e11a794ea8329993a05ba71e` |
| Previous canonical review | `4e674147a8a42f144aa90f023430c8e181566da4c8234de52b5b69ca459defa6` |
| Approved staged assessment | `b0644144df2f738c946b2fec60eaad6e43a0aeeede70fea03df03a507d2373bb` |
| Owner approval | `33c707bb012d2ed9a89cfb470c18821adc9c951d31ef52458bf04283ef2d540e` |
| Final canonical review | `0c4748e7400ec54fe7e8dae343f33597a10339e5f68d5453a292b9d255c80b36` |
| Final frozen split | `9fa155bd267fd5492523b297515b3b1a357832ce19e131357ba81198cf89b988` |
| Selected JSON model | `b6e56c3f1d3428c4cc9aee2fe2caa2beb10bd30cabcf35df8da915041e3eb4e1` |
| Experiment report | `3721e1f04a448633e1fb503dd06c4db6f81ce2b10116726ae29acb7faef172cd` |

Immutable review/approval snapshots are under `ml/reviews/`; raw corpus and weights
stay Git-ignored. The archive checksum is local identity, not an independent publisher
authenticity checksum. No added corpora, synthetic training messages or user inputs.

## Our training and reused encoder

scikit-learn Pipeline: FeatureUnion of word TF-IDF (1–2 grams, cap 5,000) and
character-within-word TF-IDF (3–5 grams, cap 15,000), min_df=2, sublinear TF,
L2 normalization → balanced LogisticRegression, lbfgs, max_iter=1000.
Vocabulary/IDF/weights fit only the 4,112 training rows. Majority baseline is
train-fitted HAM. Same predeclared C grid **0.5 / 2.0**, threshold grid
**0.60 / 0.75 / 0.90**; no broad search. Validation selects macro-F1 × token
coverage and warning F1 (higher threshold breaks ties). Saved selection precedes
this run's test scoring; **test did not select candidate or threshold**.

Frozen `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, revision
`e8f8c211226b894fcb81acc59f3b34ba3efd5f42`, Apache-2.0, is a comparison encoder
with our trained balanced LR head. We did not pretrain/fine-tune it. Assets and
licenses are pinned in `ml/encoder-assets.json`; CPU, local safetensors,
remote code disabled. Only public train/validation embeddings are cached;
test embeddings and application inputs are not cached.

Encoder load 3.256 s; first 32 training messages
0.138990 s before full encoding. Full tokenizer
checks a 128-token limit including special tokens without truncation:
train 4,103/4,112, validation 880/881, test 880/880 covered. Overflow abstains.
TF-IDF processes full bounded text; feature pruning is not universal vocabulary
understanding. The encoder is absent from the selected runtime.

## Actual evaluation and provisional comparison

**Previously evaluated comparison set, not fresh blind validation.** All 880 test
rows were already evaluated in Goal 02/07. Their text/groups never enter fitting;
validation/test IDs, labels and partitions are identical for the old/new comparison.
No audited test errors informed this fixed candidate/threshold protocol. There is
no newly obtained independent benchmark, and no blind Czech challenge was opened.

| Candidate | Validation macro-F1 | Reused test macro-F1 |
|---|---:|---:|
| minilm_c0.5 | 0.813473 | 0.845570 |
| minilm_c2.0 | 0.801229 | 0.839003 |
| tfidf_c0.5 | 0.867939 | 0.858517 |
| tfidf_c2.0 | 0.876209 | 0.863645 |
| Majority HAM | 0.301410 | 0.301370 |

**Selected: TF-IDF C=2.0, threshold 0.60.** Provisional selected test macro-F1
**0.863645**, approved selected **0.863645**, delta **0.000000**; zero prediction
disagreements on validation/test. Weights/artifact provenance and hash changed;
identical aggregate predictions are measured, not fabricated improvement.

| Split/class | Precision | Recall | F1 | Support | FP | FN |
|---|---:|---:|---:|---:|---:|---:|
| validation ham | 0.986395 | 0.997249 | 0.991792 | 727 | 10 | 2 |
| validation spam | 0.736842 | 0.848485 | 0.788732 | 66 | 20 | 10 |
| validation smishing | 0.957143 | 0.761364 | 0.848101 | 88 | 3 | 21 |
| test ham | 0.982265 | 0.991736 | 0.986977 | 726 | 13 | 6 |
| test spam | 0.750000 | 0.727273 | 0.738462 | 66 | 16 | 18 |
| test smishing | 0.891566 | 0.840909 | 0.865497 | 88 | 9 | 14 |

Confusion rows annotation / columns prediction: HAM, SPAM, SMISHING.

```text
Validation (881)     Reused test (880)
725   1   1          720   5   1
  8  56   2           10  48   8
  2  19  67            3  11  74
```

Smishing test FN: 3→HAM, 11→SPAM; smishing FP: one HAM, eight SPAM.
These are agreement errors against partially audited source annotations, not
independently adjudicated fraud outcomes. Error IDs are saved without raw text.
[Full experiment JSON](../ml/reports/goal02-approved-v1.json),
[recomputed comparison and policy](data/approved-model-audit-v1.json).

## Policy and language scope

API policy **analysis-policy-2**, rules **observed-requests-2**, contract **1.1.0**.
Scope/coverage/service checks override scores; observed requests can warn during
model failure with rules-only limitations. Specific reasons require actual
textual evidence; classifier-only wording is general. Safe recommendations and
neutral gesture-only sharing use existing templates, never source text.

Human review readiness is true; evaluated languages remain empty and low-finding
policy validation remains false. Thus **analysis_complete=false** for every
current response; absence of warnings never establishes safety. EN hint permits
experimental model warnings, not an evaluated English performance claim.

Threshold-only test calculation: 75 suspicious / 805 review, 68 matching source
smishing, seven other annotations warned, 20 smishing without warning. This is
not integrated API coverage. Actual current policy with honest unspecified language:
**880/880 test review**, zero observed warnings, zero inference errors, zero
completed checks; validation 881/881 review. Narrow rules have no demonstrated
corpus warning coverage in this setting.

| Language | Evaluation |
|---|---|
| English | Unavailable: only 45 training rows confirmed; evaluation languages not independently verified. |
| Czech | Unavailable: no actual development/blind records; preserved synthetic regression inputs are behavior tests only. |

Source aggregate metrics are not renamed English or combined with Czech.

## Integrity, device and reproducibility

Apple M5 / macOS arm64 / 24 GiB; Python 3.13.1, four CPU numerical threads.
Pinned/tested NumPy 2.5.3, SciPy 1.18.1, scikit-learn 1.9.1; encoder dependencies
remain in `ml/requirements-encoder.txt` and `ml/dependency-licenses.json`.
Project model artifacts are JSON; NPY loads disable pickle. No untrusted pickle
or runtime download. All four artifacts pass fresh-process inference/hash/parity:
[verification](../ml/reports/goal02-approved-verification-v1.json).
Repeated TF-IDF train fits produce identical bytes, repeated LR heads identical
weights on fixed embeddings; first-32 encoder repeat difference is disclosed
in that report. Exact byte identity is verified on this stack, not promised across
platforms. Genuine API integration and release scope appear in [FINAL_AUDIT](FINAL_AUDIT.md).

## Reproduce

Restore only the original hash-pinned archive at `ml/data/raw/Dataset_5971.zip`.
The earlier upstream download returned 403; no public artifact download exists.
Review/history/approval/candidate/final manifests are tracked, without message bodies.
From repository root, use isolated environments and new output names:

```sh
sh scripts/install.sh
.venv/bin/python -m pip install --only-binary=:all: --require-hashes -r ml/requirements-encoder.txt
.venv/bin/python scripts/setup_encoder.py
# Restore metadata only if absent; preserves existing canonical files.
.venv/bin/python scripts/finalize_data.py \
  --approval ml/reviews/goal01-owner-approval.json \
  --staged ml/reviews/goal01-approved-staged.json \
  --restore-review-history ml/reviews/goal01-before-finalization.json
.venv/bin/python scripts/training_preflight.py
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  .venv/bin/python scripts/train.py --manifest ml/manifests/mendeley-v1.split.json \
  --encoder-directory ml/artifacts/encoder --output ml/artifacts/goal02-approved-reproduction \
  --report ml/reports/goal02-approved-reproduction.json
.venv/bin/python scripts/verify_model.py --manifest ml/manifests/mendeley-v1.split.json \
  --report ml/reports/goal02-approved-reproduction.json \
  --output ml/reports/goal02-approved-reproduction-verification.json
sh scripts/test.sh
```

Outputs never replace different existing bytes. Restore this project's trusted
selected artifact with its exact configured hash for release setup; new reproduced
output paths do not automatically replace runtime configuration. Full reproduction
report bytes include timings/paths and need not be identical; model weights/JSON
with the same provenance are verified byte-identical. Metadata-only clean restore
was tested twice in a fresh temporary workspace:
[evidence](data/approved-data-clean-restore-v1.json).

Our work: data audit/reconciliation, split, sparse model/linear heads, validation
selection, application/policy/guidance/privacy and tests. Reuse: credited dataset,
frozen encoder, font and libraries. Codex assisted implementation and evaluation.
Project distribution licensing, independent/language evaluation, actual Docker
execution and public hosting remain unresolved. No deployment/publication or new
product features were added.
