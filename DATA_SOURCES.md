# ClearMessage data sources

Metadata verification and local acquisition: **10 October 2026**. The owner
supplied the original archive after automatic acquisition failed. Actual data and
automatic audit are available; human label review and conflict approval remain
incomplete. A separately authorized provisional experiment uses original labels;
it does not constitute approved training data. No extra corpus was added.

## D1 — original Mendeley dataset, version 1

| Field | Recorded value |
|---|---|
| Title | SMS PHISHING DATASET FOR MACHINE LEARNING AND PATTERN RECOGNITION |
| Authors | Sandhya Mishra; Devpriya Soni |
| Publisher | Mendeley Data |
| DOI / version | `10.17632/f45bkkt8pr.1` / V1 |
| Publication date | 20 June 2022 |
| Source | [Original V1 page](https://data.mendeley.com/datasets/f45bkkt8pr/1) |
| Archive / member | `Dataset_5971.zip` / `Dataset_5971.csv` |
| Published archive | [Original file listing download](https://data.mendeley.com/public-files/datasets/f45bkkt8pr/files/edb361de-918d-469f-9106-e84823830665/file_downloaded) |
| Published license | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Project acquisition | 10 October 2026; supplied from the owner's Downloads; original browser acquisition time unknown |
| Archive / CSV bytes | 244,698 / 595,987 |
| Archive SHA-256 | `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3` |
| CSV SHA-256 | `649844f1c62a6b27e145eaf17a65f7010c56c390e11a794ea8329993a05ba71e` |
| Actual rows | 5,971 |
| Actual ham / spam / smishing | 4,844 / 489 / 638 |
| Human sample | 15 entries per class; 45 decisions: 16 agreements / 29 corrections, zero pending labels; attribution/language incomplete |
| Group proposal | Immutable candidate; all actual eligible-data intersections empty |
| Approved final split | Absent; `data_split_ready=false` |

Archive name, member, columns and counts match the published description.
No independent publisher checksum is available: our hashes establish identity of
received bytes, not cryptographic authenticity. Provenance rests on the supplied
archive and its agreement with V1 metadata. Downloads originals were untouched;
attached Python scripts were not executed. CSV was read strictly as UTF-8 data.
Header: `LABEL,TEXT,URL,EMAIL,PHONE`. Observed counts match the published counts.

## Explicit labels and indicators

Only `LABEL.strip().casefold()` maps to `ham`, `spam`, `smishing`. Unknown/blank
labels block final freeze; none were observed. No numeric aliases or guessing.

| Source values | Class | Observed count and meaning |
|---|---|---|
| `ham` | ham | 4,844; source ordinary/legitimate messages, not a safety confirmation |
| `spam` (466), `Spam` (23) | spam | 489; unsolicited/advertising content, not automatically phishing |
| `Smishing` (616), `smishing` (22) | smishing | 638; source SMS phishing annotation, human meaning audit incomplete |

Whole groups with conflicting valid labels are quarantined without relabeling.
Training labels are distinct from API statuses. `URL/EMAIL/PHONE` use `No` and
`yes`, explicitly mapped to 0/1. They are audit-only attributes, neither targets
nor model features or phishing ground truth. Presence counts: URL 207 / 5,764;
EMAIL 19 / 5,952; PHONE 844 / 5,127. Format checks do not validate the upstream
extractors' correctness or completeness.

## Actual automatic audit and candidate splits

- Missing cells, NA markers, unknown labels, blank/overlong text exclusions and
  invalid mapped indicators: **0**.
- Normalized duplicates: **140 extra rows**. Normalized copies, conservative
  templates and near-copies form **5,631 groups**; union edges: 140 normalized,
  110 template and 90 near-copy.
- **46 conflicting groups / 98 rows** quarantined: 48 spam and 50 smishing.
  These are identified family conflicts, not necessarily identical texts.
  Eligible: **5,873 rows / 5,585 groups**.
- Script hints: 5,906 Latin unknown, 1 mixed unknown, 64 too-short unknown.
  All 5,971 message languages remain unverified; Latin script is not English.
- No language, time or campaign metadata in the CSV. Upstream row lineage,
  translations, paraphrases and real campaign separation remain unverified.

Seed **20261010**, whole-group splitting; all human-review families reserved for
train. This is an unapproved candidate, not a reviewed final split:

| Class | Train | Validation | Test | Eligible |
|---|---:|---:|---:|---:|
| ham | 3,391 | 727 | 726 | 4,844 |
| spam | 309 | 66 | 66 | 441 |
| smishing | 412 | 88 | 88 | 588 |
| Total | 4,112 | 881 | 880 | 5,873 |

Row IDs, group IDs and original/normalized/template hashes have empty
intersections across every split pair. Candidate SHA-256:
`51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0`.
[Candidate manifest](ml/manifests/mendeley-v1.split.candidate.json) records the
historical pending review at creation, not later human decisions. The unchanged
candidate remains `candidate_pending_human_review`, `data_split_ready=false`.
Final freeze failed with `human_label_review_pending_or_disagreed`; no final
approved manifest was produced. At provisional training time two agreements and
two requested smishing → spam
changes were saved. The owner has since saved 16 agreements and 29 corrections
across all 45 entries; zero label decisions remain pending. No corrections were
silently applied to original-label training. All 45 languages and four
reviewer/date attributions remain missing; current verification is in STATUS.
Exclusion approval is still empty.

Text-free evidence: [audit](docs/data/mendeley-v1.audit.json),
[provenance](docs/data/mendeley-v1.provenance.json),
[preparation status at import](docs/data/preparation-status.json).
Raw text, review notes and defanged previews remain in ignored `ml/data/`.
Current experiment and authorization: [MODEL_CARD](docs/MODEL_CARD.md).

## License, provenance and attribution

Publisher citation: mishra, sandhya; Soni, Devpriya (2022), *SMS PHISHING DATASET
FOR MACHINE LEARNING AND PATTERN RECOGNITION*, Mendeley Data V1,
doi:10.17632/f45bkkt8pr.1. Copyright Sandhya Mishra and Devpriya Soni, 2022.
Retain attribution, license/source and changes when using the data. Our changes:
audit, conflict quarantine, normalization for grouping and proposed group splits.
Original model text is preserved; raw corpus content is not published.

The publisher describes internet pictures/screenshots converted to text and
source-based labeling, thanking Tiago A. Almeida and Dr. Gunikhan Sonowal.
Complete provenance/permissions for every reused row are unverified. A page
license does not establish annotation quality or full upstream clearance.
UCI or other corpora were not added.

## Acquisition history

Automatic original page/API/archive GET returned HTTP 403; browser archive
download timed out after 30 seconds. These were failures, not successful
acquisition. Owner-supplied local bytes resolved that blocker; no mirror or
bypass was used. Canonical preparation is `data-prep-v2`; preserved initial V1
audit incorrectly treated No/yes as invalid and is not used or overwritten.
Reproducible import/review commands: [DATA_PREPARATION](docs/DATA_PREPARATION.md).
