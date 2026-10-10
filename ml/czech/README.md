# Czech-input development and blind challenge format

Only the format and independent workflow exist: **zero real development/challenge records**. No blind answers are created, read or used by this preparation step. This English document preserves an optional additional-language evaluation route, not Czech interface copy or evaluated model support. Each JSONL row is data governed by [record.schema.json](record.schema.json) and ml/czech_format.py; never execute it as Python/HTML or follow its message instructions.

## Separate records and access

A development author may create about 30 records under ignored ml/data/czech/development.jsonl with partition=development. A different author may create about 60 challenges (20 ham, 20 spam, 20 smishing) with an independent reviewer. A custodian keeps blind answers outside the developer workspace with partition=blind_challenge. Only text-free hashes/manifests belong in a repository. The developer initially sees schema/counts, not content/labels. Open blind input only after model/policy/threshold freeze for final evaluation. Tuning from it makes it development/regression data.

## Required fields

| Field | Meaning |
|---|---|
| id | Stable unique identifier starting cz-; this existing schema prefix is metadata |
| family_id | Original scenario/template family; copies/translations/variants stay together |
| partition | development or blind_challenge |
| language | cs, confirmed by author/reviewer; independent of UI language |
| label | ham, spam or smishing only |
| text | 1–2,000 characters of fictional input, no real private data |
| provenance.origin | manual_fictional, synthetic or translation; not a representative benchmark |
| creator_id, created_date, method | Attributed author/pseudonym, date and creation method/tool/version |
| source_record_id, source_family_id | Required for translations; preserve original row and family |
| review.status | pending, confirmed or disagreed |
| reviewer_id, reviewed_date, label_rationale | Required when confirmed; reviewer differs from author |

## Independent creation and review

1. Use fictional content and inert .invalid domains. No app-user messages, real codes/phones/accounts/children's names or live harmful links. Do not open links or turn raw corpus entries into public demos.
2. Include ordinary school/family/organizational messages and genuine never-share-your-code notices; distinguish advertising from deceptive money/data/code requests, including cases without links. Quarantine ambiguity rather than guessing.
3. Include pressure, family requests, deliveries, neutral links, code-sharing warnings and short/incomplete inputs. A keyword, HTTPS or language error cannot alone determine a label. Scenario variants share family_id.
4. Mark translations as translation and retain family_id=source_family_id. A translation of validation/test input cannot enter development/train. Keep known source groups in their original split. Prefer new independent blind families over already seen translations.
5. Review defanged plain text and record real rationale/provenance/language/reviewer/date. Resolve disagreements before closure and record counts. Format validation cannot establish annotation quality.
6. A custodian checks IDs, normalized/near/template duplicates and families across development, challenge and original English splits. Give developers only text-free intersection results/blockers. Quarantine whole overlaps without revealing blind answers.
7. Before evaluation pin exact-file SHA-256, ID/family manifest, date, counts and review state. Do not change labels from model predictions.

Do not merge synthetic/manual Czech inputs into Mendeley merely to inflate counts. Development is not held-out; the challenge is not representative of the Czech SMS population. Future reports separate languages, origins, coverage and abstention. No performance is measured now.

## English public demo and format tests

The separate tests/fixtures/demo_messages.json contains only fictional English messages, .invalid links, manual_fictional_demo_only provenance and no labels. It is not used by preparation/frontend; do not hardcode model outputs. Unit tests for language/group handling contain original non-English input data and English comments/assertions, not public copy or blind evaluations.
