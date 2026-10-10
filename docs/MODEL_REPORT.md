# ClearMessage provisional experiment report

Computed 2026-10-10. The user explicitly authorized original-label training while human review remains incomplete.
These measure agreement with unapproved source annotations, not verified fraud ground truth or real-world protection.
Source languages are unverified: English and Czech results are unavailable and are not merged into these aggregate results.

Raw messages and dangerous links are excluded. Error IDs and source/predicted labels are in the machine-readable report.

Machine-readable experiment: `ml/reports/goal02-provisional-v2.json`; verification: `ml/reports/goal02-verification-v2.json`.

## Data and selection

| Split | ham | spam | smishing | Total |
|---|---:|---:|---:|---:|
| train | 3391 | 309 | 412 | 4112 |
| validation | 727 | 66 | 88 | 881 |
| test | 726 | 66 | 88 | 880 |

Seed: **20261010**. Selected **tfidf_c2.0** using validation macro-F1 × token coverage.
Internal warning threshold: **0.6**, selected from the predefined grid by validation warning F1, then higher threshold on ties.
Internal scores are not calibrated user-facing fraud probabilities. No test metric changed selection or thresholds.
The source parser routes all public CSV records by ID; test texts are not featurized, embedded or scored before selection is saved.

## Classifier comparison

| Candidate | Validation macro-F1 | Test macro-F1 | Test token coverage | Fit seconds |
|---|---:|---:|---:|---:|
| minilm_c0.5 | 0.809481 | 0.848873 | 1.000000 | 0.022 |
| minilm_c2.0 | 0.804186 | 0.852579 | 1.000000 | 0.026 |
| tfidf_c0.5 | 0.867939 | 0.858517 | 1.000000 | 0.376 |
| tfidf_c2.0 | 0.876209 | 0.863645 | 1.000000 | 0.373 |

Majority baseline (test): macro-F1 **0.301370**, 880 records; fitted only on train.

Majority baseline (validation): macro-F1 **0.301410**, 881 records; fitted only on train.

## minilm_c0.5

### validation: 880 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.991597 | 0.975207 | 0.983333 | 726 | 6 | 18 |
| spam | 0.586207 | 0.772727 | 0.666667 | 66 | 36 | 15 |
| smishing | 0.822785 | 0.738636 | 0.778443 | 88 | 14 | 23 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  708    13     5
    6    51     9
    0    23    65
```

### test: 880 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.992968 | 0.972452 | 0.982603 | 726 | 5 | 20 |
| spam | 0.658537 | 0.818182 | 0.729730 | 66 | 28 | 12 |
| smishing | 0.839080 | 0.829545 | 0.834286 | 88 | 14 | 15 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  706    14     6
    4    54     8
    1    14    73
```

Test provisional policy (same selected threshold for the frozen comparison):

- suspicious: 80; review: 800; no_strong_signals: 0.
- Review/abstention rate: 0.909091; completed-analysis coverage: 0.000000.
- Explicit smishing warnings: TP 68, FP 12; source smishing without explicit warning: 20.
- Warning precision / recall / F1: 0.850000 / 0.772727 / 0.809524.
Review is an abstention, not a reassuring negative. Every analysis_complete remains false because the audit and language validation are incomplete.


## minilm_c2.0

### validation: 880 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.990264 | 0.980716 | 0.985467 | 726 | 7 | 14 |
| spam | 0.585366 | 0.727273 | 0.648649 | 66 | 34 | 18 |
| smishing | 0.822785 | 0.738636 | 0.778443 | 88 | 14 | 23 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  712    12     2
    6    48    12
    1    22    65
```

### test: 880 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.992997 | 0.976584 | 0.984722 | 726 | 5 | 17 |
| spam | 0.689189 | 0.772727 | 0.728571 | 66 | 23 | 15 |
| smishing | 0.826087 | 0.863636 | 0.844444 | 88 | 16 | 12 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  709    12     5
    4    51    11
    1    11    76
```

Test provisional policy (same selected threshold for the frozen comparison):

- suspicious: 84; review: 796; no_strong_signals: 0.
- Review/abstention rate: 0.904545; completed-analysis coverage: 0.000000.
- Explicit smishing warnings: TP 72, FP 12; source smishing without explicit warning: 16.
- Warning precision / recall / F1: 0.857143 / 0.818182 / 0.837209.
Review is an abstention, not a reassuring negative. Every analysis_complete remains false because the audit and language validation are incomplete.


## tfidf_c0.5

### validation: 881 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.986357 | 0.994498 | 0.990411 | 727 | 10 | 4 |
| spam | 0.727273 | 0.848485 | 0.783217 | 66 | 21 | 10 |
| smishing | 0.929577 | 0.750000 | 0.830189 | 88 | 5 | 22 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  723     1     3
    8    56     2
    2    20    66
```

### test: 880 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.982265 | 0.991736 | 0.986977 | 726 | 13 | 6 |
| spam | 0.734375 | 0.712121 | 0.723077 | 66 | 17 | 19 |
| smishing | 0.891566 | 0.840909 | 0.865497 | 88 | 9 | 14 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  720     5     1
   11    47     8
    2    12    74
```

Test provisional policy (same selected threshold for the frozen comparison):

- suspicious: 65; review: 815; no_strong_signals: 0.
- Review/abstention rate: 0.926136; completed-analysis coverage: 0.000000.
- Explicit smishing warnings: TP 61, FP 4; source smishing without explicit warning: 27.
- Warning precision / recall / F1: 0.938462 / 0.693182 / 0.797386.
Review is an abstention, not a reassuring negative. Every analysis_complete remains false because the audit and language validation are incomplete.


## tfidf_c2.0

### validation: 881 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.986395 | 0.997249 | 0.991792 | 727 | 10 | 2 |
| spam | 0.736842 | 0.848485 | 0.788732 | 66 | 20 | 10 |
| smishing | 0.957143 | 0.761364 | 0.848101 | 88 | 3 | 21 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  725     1     1
    8    56     2
    2    19    67
```

### test: 880 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.982265 | 0.991736 | 0.986977 | 726 | 13 | 6 |
| spam | 0.750000 | 0.727273 | 0.738462 | 66 | 16 | 18 |
| smishing | 0.891566 | 0.840909 | 0.865497 | 88 | 9 | 14 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  720     5     1
   10    48     8
    3    11    74
```

Test provisional policy (same selected threshold for the frozen comparison):

- suspicious: 75; review: 805; no_strong_signals: 0.
- Review/abstention rate: 0.914773; completed-analysis coverage: 0.000000.
- Explicit smishing warnings: TP 68, FP 7; source smishing without explicit warning: 20.
- Warning precision / recall / F1: 0.906667 / 0.772727 / 0.834356.
Review is an abstention, not a reassuring negative. Every analysis_complete remains false because the audit and language validation are incomplete.


## majority_baseline

### validation: 881 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.825199 | 1.000000 | 0.904229 | 727 | 154 | 0 |
| spam | 0.000000 | 0.000000 | 0.000000 | 66 | 0 | 66 |
| smishing | 0.000000 | 0.000000 | 0.000000 | 88 | 0 | 88 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  727     0     0
   66     0     0
   88     0     0
```

### test: 880 scored records

| Class | Precision | Recall | F1 | Support | False positives | False negatives |
|---|---:|---:|---:|---:|---:|---:|
| ham | 0.825000 | 1.000000 | 0.904110 | 726 | 154 | 0 |
| spam | 0.000000 | 0.000000 | 0.000000 | 66 | 0 | 66 |
| smishing | 0.000000 | 0.000000 | 0.000000 | 88 | 0 | 88 |

Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.

```text
  726     0     0
   66     0     0
   88     0     0
```

## Encoder benchmark and coverage

Frozen encoder revision `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`, license Apache-2.0; CPU, max 128 tokens including special tokens.
First batch: 32 train messages in 0.116693 s; load 2.321944 s.
Coverage: train 4103/4112, validation 880/881.
Overflow rows are excluded from encoder fitting/scoring, counted in coverage and remain review in policy. The TF-IDF vocabulary and both classifiers fit only train.
All candidates use the identical row/group split assignments; encoder validation metrics have a smaller covered denominator, explicitly penalized during selection.
The encoder was not pretrained or fine-tuned by this project. Only our linear head was trained. Cached NPY files contain public development embeddings only.

## Integrity and latency

Measured device: Apple M5, Darwin arm64, RAM 25769803776 B. CPU execution, four numerical compute threads.
Fresh-process inference disables network connections. Warm single-message latency uses 32 public validation messages, includes policy, excludes model loading.

| Model | Median ms | P95 ms | Fresh-process wall s | Batch amortized ms/message |
|---|---:|---:|---:|---:|
| minilm_c0.5 | 6.329 | 8.098 | 3.761 | 1.826 |
| minilm_c2.0 | 6.310 | 7.717 | 3.692 | 1.830 |
| tfidf_c0.5 | 0.442 | 0.707 | 0.680 | 0.044 |
| tfidf_c2.0 | 0.424 | 0.640 | 0.677 | 0.043 |

All saved artifacts passed hash and reload checks; validation score differences were zero.
Repeated TF-IDF training produced identical artifact bytes; repeated encoder-head fitting produced identical weights on fixed embeddings.
Encoder recomputation and fresh-process predictions are recorded separately in verification JSON. JSON/safetensors/NPY only; no pickle or runtime downloads.

## Limitations

Human review paused after four decisions, including two requested corrections; original training labels deliberately remain unchanged under the user's provisional authorization.
41 sample entries remain pending and exclusion approval is absent. The approved Goal 01 gate still blocks. Grouping may miss paraphrases or campaigns; time/campaign metadata are unavailable.
No verified English or Czech benchmark exists. No blind Czech challenge was opened. No application API integration or deployment occurred in this phase.
Test results are now known: future changes selected using them would make this a development test, not a new blind evaluation.
