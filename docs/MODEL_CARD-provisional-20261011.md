# Historical provisional model card

Superseded by [MODEL_CARD](MODEL_CARD.md) after explicit owner approval and retraining.

# ClearMessage — provisional model card

Runtime note updated **2026-10-11, Europe/Prague**; experiment results below are
from 10 October. A genuine short-message classifier has
been trained, saved and evaluated. **It is experimental: human label review is
incomplete, source languages are unverified, and it is not an approved detector.**
Goal03 now connects the verified sparse artifact to the application API.
The 11 October integration uses `analysis-policy-2` and `observed-requests-2`.
It verifies the selection report and unchanged validation threshold at startup;
weights, source labels and model metrics were not changed or retrained. Final
reviewed-data approval is still pending. See [POLICY](POLICY.md) and [STATUS](STATUS.md)
for current runtime checks; historical experiment metrics below retain their
original scope.
`model_ready=true` means the asset loaded; all actual results still have
`analysis_complete=false`. No language has verified performance, the human review
remains incomplete, and production `no_strong_signals` is disabled. The model still
has its Goal02 scope and original-label provenance; integration does not improve
its measured quality. See [API](API.md), [policy](POLICY.md) and the separate
synthetic integration report `ml/reports/goal03-integration.json`.

The user explicitly authorized provisional training on **original** source labels
after pausing human review. This permits the experiment; it does not invent human
approval. At training time four human decisions were saved: two agreements and two
requested smishing → spam changes, with 41 entries pending. The owner has since
saved all 45 label decisions: 16 agreements and 29 corrections, zero pending
labels. All 45 languages and four reviewer/date attributions remain missing;
conflict exclusion approval is empty. Requested corrections (44 final spam /
1 ham / 0 smishing) have not been applied to this original-label model or corpus. The previous blocker report remains as historical evidence.
The separate staged review now has all 45 label/language confirmations and
complete attribution, proposing 15 HAM / 13 SPAM / 17 SMISHING plus the 98-row
quarantine. It has not been submitted or finally approved; canonical review and
this original-label model remain unchanged. See [review assessment](REVIEW_DRAFT_ASSESSMENT.md).

## Data and licenses

Sandhya Mishra and Devpriya Soni (2022), *SMS PHISHING DATASET FOR MACHINE LEARNING
AND PATTERN RECOGNITION*, Mendeley Data V1, DOI `10.17632/f45bkkt8pr.1`, CC BY 4.0.
Attribution, source links and provenance limitations: [DATA_SOURCES](../DATA_SOURCES.md).
This is a three-class source-label corpus, not independently verified phishing
ground truth. Spam is not interchangeable with smishing; ham does not establish safety.

Archive SHA-256:
`9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3`.
CSV SHA-256:
`649844f1c62a6b27e145eaf17a65f7010c56c390e11a794ea8329993a05ba71e`.
Local hash identity is not proof of authenticity; no independent publisher
checksum was available. The supplied archive and original labels remain unchanged.

| Stage | ham | spam | smishing | Total |
|---|---:|---:|---:|---:|
| Original | 4,844 | 489 | 638 | 5,971 |
| Eligible | 4,844 | 441 | 588 | 5,873 |
| Train | 3,391 | 309 | 412 | 4,112 |
| Validation | 727 | 66 | 88 | 881 |
| Test | 726 | 66 | 88 | 880 |

46 conflicting groups / 98 rows are excluded under the existing automatic audit;
human approval remains pending. No additional corpus or synthetic training data.
Seed **20261010**, preparation `data-prep-v2`. Exact/normalized duplicates,
conservative templates, near copies and known families were grouped before split.
All row/group/text/normalized/template intersections are empty. Review families
belong to train. Time/campaign metadata are unavailable; missed paraphrases,
translations and grouping errors remain possible.

The original candidate is unchanged. A small immutable provisional authorization
manifest references its hash and identical assignments, with
`data_split_ready=false`; no approved split was frozen:

- Candidate SHA: `51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0`.
- Provisional SHA: `21b3089b3e0aa56d076efef258f16cf4a2b8e9a4a27494d0ecf902a02bf2f9f5`.

## Our model and reused encoder

Baseline: scikit-learn Pipeline → FeatureUnion of word TF-IDF (1–2 grams,
5,000 feature cap) and character-within-word TF-IDF (3–5 grams, 15,000 cap),
min_df=2, sublinear TF, L2 normalization → balanced LogisticRegression, lbfgs,
max_iter=1000. Vocabulary/IDF/classifier fit **only train**. A separate
train-fitted majority baseline predicts ham.

Two predefined C values, **0.5 and 2.0**, were tested; no broad search. The frozen
comparison uses `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`,
revision `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`, **Apache-2.0**; 384-D mean
pooling embeddings plus our balanced LogisticRegression head on identical split
assignments. We did **not** pretrain or fine-tune this encoder. Credit and license:
[Sentence Transformers pinned model card](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/blob/e8f8c211226b894fcb81acc59f3b34ba3efd5f42/README.md).

Explicit setup acquired safetensors/config/tokenizer assets; hashes and license
provenance are in `ml/encoder-assets.json`. Runtime verifies hashes, uses local
files only, disables remote code and freezes weights. No pickle is loaded.
Public train/validation embeddings are cached locally; app inputs and held-out
embeddings are never cached.

The full-tokenizer limit is **128 tokens including special tokens**. Coverage
is checked without truncation before encoding; overflow is rejected. Encoder
coverage: train 4,103/4,112; validation 880/881; test 880/880. Metrics use covered
rows, with denominators disclosed; uncovered rows are review in policy.
TF-IDF processes full text without a transformer token limit; vocabulary pruning
does not mean every word has a learned feature.

## Selection and results

Validation macro-F1 × token coverage selected **TF-IDF, C=2.0**. The internal
smishing-warning threshold **0.60** was selected on validation from
0.60 / 0.75 / 0.90 by warning F1, then higher threshold on ties. Scores are not
calibrated fraud probabilities and are not returned to users. Selection was
saved before test text was featurized, embedded or scored. The source parser
routes all public CSV records by ID beforehand; test content was not used for
model or threshold selection.

| Candidate | Validation macro-F1 | Test macro-F1 |
|---|---:|---:|
| TF-IDF C=0.5 | 0.867939 | 0.858517 |
| **TF-IDF C=2.0, selected** | **0.876209** | **0.863645** |
| Frozen MiniLM + LR C=0.5 | 0.809481 | 0.848873 |
| Frozen MiniLM + LR C=2.0 | 0.804186 | 0.852579 |
| Majority baseline | See report | 0.301370 |

These are computed **source-label agreement metrics**, not verified fraud
accuracy. Test results did not change selection. Future tuning on this test must
identify it as development, not claim a new blind evaluation.

Selected test confusion matrix (rows source labels, columns predictions;
ham / spam / smishing):

```text
720   5   1
 10  48   8
  3  11  74
```

Complete per-class precision/recall/F1, supports, false positives/negatives,
confusion matrices for every candidate/baseline, and error IDs:
[English report](MODEL_REPORT.md), [computed JSON](../ml/reports/goal02-provisional-v2.json).
No raw error-message bodies or dangerous links are published.

## Policy, language and limitations

Training classes are separate from application statuses. Provisional policy can
show an explicit classifier-based warning for sufficiently strong smishing
scores; other cases are review. It never produces `no_strong_signals` or a
completed reassuring analysis. Inference rejects empty input and text over
2,000 Unicode characters without echo. There is no runtime message cache.

Selected test policy: **75 suspicious / 805 review / 0 no_strong_signals**;
68 warnings match source smishing, 7 do not; 20 source-smishing rows lack an
explicit warning and remain review. Review/abstention rate 0.914773;
completed-analysis coverage **0**. These are provisional CLI policy results,
not an integrated API deployment or approved protection claim.

All source languages remain unverified. **English results: unavailable. Czech
results: unavailable.** Aggregates are not relabeled English because messages
use Latin script. Blind challenges were not opened. Synthetic test fixtures are
neither training data nor real-world validation.

## Integrity, device and reproducibility

Measured on **Apple M5, macOS arm64, 24 GiB RAM**, CPU, four numerical compute
threads. Encoder first train batch: 32 messages in 0.116693 s; load 2.321944 s.
Selected TF-IDF warm single-message median **0.424 ms**, p95 **0.640 ms**
(32 validation messages, includes policy, excludes loading). Its test batch
amortized 0.0434 ms/message; batch throughput is not single-request latency.
Startup, all candidate latencies and offline fresh-process checks:
[verification JSON](../ml/reports/goal02-verification-v2.json).

All candidates passed validation reload parity with **zero score difference**.
Repeated TF-IDF fits produced identical saved bytes; repeated heads produced
identical weights on fixed embeddings. Encoder recomputation differs by at most
3.88e-7 on the checked first 32 train vectors due to different padding batches;
this is disclosed separately from exact head-fit reproducibility. Genuine saved
models also passed new-process inference with network connections disabled.
Selected artifact: `ml/artifacts/goal02-provisional-v2/tfidf_c2.0.json`, SHA-256
`7fe727cfb7868445f07ad32b0449131165268a8c5cbd8bafb71dd2b5178747fa`.

Models are project-generated JSON and locally verified safetensors. Weights,
raw texts and caches remain Git-ignored. Reproduction requires explicit setup;
models do not download on requests. Exact hashes were checked on this stack;
cross-platform floating-point byte identity is not promised.

Actually installed/tested: Python 3.13.1, scikit-learn 1.9.1, NumPy 2.5.3,
SciPy 1.18.1, sentence-transformers 6.1.0, Torch 2.14.1, Transformers 5.19.0,
huggingface-hub 1.33.0, safetensors 0.8.0. Exact wheel-hash locks and package
license metadata: `ml/requirements*.txt`, `ml/dependency-licenses.json`.
The project's own distribution license is not chosen; nothing was published.

## Reproduce

From the repository root, using project environments only:

```sh
.venv/bin/python -m pip install --only-binary=:all: --require-hashes -r ml/requirements-encoder.txt
.venv/bin/python scripts/setup_encoder.py
.venv/bin/python scripts/train.py \
  --allow-provisional-original-labels \
  --encoder-directory ml/artifacts/encoder \
  --output ml/artifacts/goal02-reproduction \
  --report ml/reports/goal02-reproduction.json
.venv/bin/python scripts/verify_model.py \
  --report ml/reports/goal02-reproduction.json \
  --output ml/reports/goal02-reproduction-verification.json
.venv/bin/python -m pytest -q
```

Use a **new output directory/report filename** for each run; artifacts are not
overwritten. Without the explicit provisional flag, training refuses. Omit
`--encoder-directory` and install `ml/requirements.txt` for baseline-only
reproduction. Neither command implies final Goal 01 approval or freeze.

Our work is the application/data tooling, experiment, trained sparse classifier
and linear heads, validation selection, conservative provisional policy and
evaluation. Reused work is the credited dataset, encoder and libraries. Codex
assisted with implementation, analysis and documentation. No further phase began.
