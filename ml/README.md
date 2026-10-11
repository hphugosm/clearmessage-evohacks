# ClearMessage ML — approved dataset release candidate

The owner approved all 45 review decisions/metadata and reversible quarantine of
98 records in 46 families. Corrected eligibility: 5,873 = 4,844 ham / 439 spam /
590 smishing. Seed 20261010; approved manifest is `manifests/mendeley-v1.split.json`.
No row changes partition; train only contains the two source-label corrections.
Original archive/candidate/provisional artifacts and review history are preserved.

The genuine word/character TF-IDF + LogisticRegression Pipeline and frozen MiniLM
comparison heads were retrained on train only. Validation again selected TF-IDF
C=2 and threshold 0.60. Repeated fits/hash/reload checks pass. The existing test
was already evaluated; it is a reused comparison, not independent blind validation.

- Data, licenses, hashes, counts, full commands: [MODEL_CARD](../docs/MODEL_CARD.md).
- Actual metrics/errors: [approved JSON](reports/goal02-approved-v1.json).
- Previous results: [provisional JSON](reports/goal02-provisional-v2.json).
- Fresh-process verification: [verification](reports/goal02-approved-verification-v1.json).
- Approved-data setup: [DATA_PREPARATION](../docs/DATA_PREPARATION.md).
- Preserved Czech format: [czech/README.md](czech/README.md); no actual blind records.

Language performance and completed low-finding policy remain unverified. All API
checks remain incomplete; model-ready and dataset approval do not certify fraud
detection. No risk percentages, untrusted pickles, runtime download, retraining
on requests or cache of user messages. The selected runtime excludes MiniLM/GPU.
Tracked review snapshots contain metadata/tool annotations only; source messages,
previews, embeddings and weights remain ignored. No deployment/publication.
