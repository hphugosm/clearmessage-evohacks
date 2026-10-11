# ClearMessage staged review assessment

Assessed **11 October 2026, Europe/Prague**. This is an independent read-only
check of the existing approval workspace at `http://127.0.0.1:8767`.
**No submitted approval-draft file exists.** The workspace reports
`draft_submitted=false`, `quarantine_proposed=true`, and zero unrechecked labels.
No final approval is inferred from the request to review this draft. Canonical
review, original archive, candidate assignments and model remain unchanged.

## Verification summary

| Item | Verified state |
|---|---|
| Sample | 45 expected unique IDs, 15 original entries per class; all in candidate train |
| Staged labels | 15 HAM / 13 SPAM / 17 SMISHING; two original SPAM labels corrected to SMISHING |
| Rechecks | 45 explicitly rechecked; zero missing |
| Languages | All 45 explicitly confirmed English; pending → en |
| Reviewer | hugo for all 45; 41 existing dates preserved as 2026-10-10 |
| Missing historical metadata | Four explicitly re-confirmed as hugo, 2026-10-11; original date unknown, not backfilled |
| Individual exclusions | None |
| Source conflicts | 46 groups / 98 rows, 48 SPAM and 50 SMISHING; quarantine proposed, final approval withheld |
| Additional eligible conflicts | Zero after current staged labels; saved canonical corrections would create seven groups / 29 rows |
| Conditional eligible dataset | 5,873 rows / 5,585 groups, HAM 4,844 / SPAM 439 / SMISHING 590 after two corrections |
| Submission readiness | Ready to submit: zero blockers; not submitted or finally approved |

The sample balance is distinct from the full-dataset balance. Staged flags are
human attestations in the tool, not independent proof that every label/language
is correct. English input confirmation is not an evaluated model-performance claim.

## Exact proposed changes to the saved review

Conditional on draft submission and separate final approval:

- Restore 14 saved HAM → SPAM corrections to original HAM and 15 saved
  SMISHING → SPAM corrections to original SMISHING. These 29 decisions would
  become agreement with the source label; preserve old notes/history rather than
  erase earlier decisions. Retain the raw archive and original `source_label`;
  approved corrections belong in a separate reviewed data revision.
- Change source SPAM entries `row-000565` and `row-000891` to SMISHING.
  Both are singleton groups reserved for train; no family propagation is needed.
- Keep one original HAM agreement and the remaining 13 SPAM agreements.
  All 45 label rechecks are explicitly recorded. These choices would make 31
  changes to saved requested labels; only two differ from original corpus labels.
- Change all 45 review `language` fields from `pending` to `en`, using the
  recorded explicit language confirmations.
- For `row-000188`, `row-000244`, `row-000490`, `row-000565`, fill reviewer
  `hugo` and date `2026-10-11` from explicit `reconfirm_now` attestations.
  Record that the original historical date is unknown; retain original snapshots.
- Preserve reviewer/date on the other 41 entries.
- Whole-group quarantine is explicitly proposed in the workspace; final approval
  remains withheld. Do not fill `exclusions_approved_by` or remove rows
  until separate final approval.

Canonical saved distribution is currently **1 HAM / 44 SPAM / 0 SMISHING**.
The staged restoration proposes **15 HAM / 13 SPAM / 17 SMISHING**. The model
still uses original corpus labels. The draft has **two corpus label overrides**.
The workspace flags retraining as required if this data revision is approved.
Neither this assessment nor readiness to submit authorizes training, changes
the existing model or establishes model quality or a final split.

## All 45 decisions

All rows below have explicitly confirmed language `en` and reviewer `hugo`.
Dates are the proposed/preserved review dates. All 45 explicit label rechecks
and language confirmations have recorded timestamps.

| Entry ID | Source | Saved choice | Staged final | Label rechecked | Reviewer date |
|---|---|---|---|---|---|
| row-000244 | HAM | HAM | HAM | Yes | 2026-10-11 |
| row-000867 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-001136 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-001372 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-001607 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-001939 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-002290 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-002546 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-002692 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-002882 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-003948 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-005154 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-005324 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-005397 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-005506 | HAM | SPAM | HAM | Yes | 2026-10-10 |
| row-000188 | SMISHING | SPAM | SMISHING | Yes | 2026-10-11 |
| row-000490 | SMISHING | SPAM | SMISHING | Yes | 2026-10-11 |
| row-000711 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-000810 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-001324 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-001593 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-002354 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-003032 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-003654 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-003734 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-004498 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-004597 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-004657 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-005144 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-005600 | SMISHING | SPAM | SMISHING | Yes | 2026-10-10 |
| row-000565 | SPAM | SPAM | SMISHING | Yes | 2026-10-11 |
| row-000891 | SPAM | SPAM | SMISHING | Yes | 2026-10-10 |
| row-001078 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-001145 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-001291 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-001392 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-002915 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-003088 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-003347 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-003706 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-003848 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-004805 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-005106 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-005131 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |
| row-005455 | SPAM | SPAM | SPAM | Yes | 2026-10-10 |

## Exact 98-row conditional quarantine

Quarantine retains the raw archive and separates whole mixed-label families;
it is not deletion or automatic relabeling. **It is proposed, with final approval withheld.**
The 46 group IDs exactly match the existing candidate. Every listed row is
already outside that candidate; no new held-out row is proposed for exclusion.

Reasons recomputed from the original archive:

- **N:** identical after whitespace/case/Unicode normalization — 32 groups.
- **T:** same conservative template with variable contacts/numbers — 1 group.
- **M:** near-copy or combined normalization/template links — 13 groups.

All groups contain both original SPAM and SMISHING annotations. This establishes
a family annotation conflict, not which member label is correct. Blanket
propagation of a label was not performed. Each listed row retains its source label.

| Group ID | Reason | SPAM rows | SMISHING rows |
|---|---|---|---|
| group-05bcf4813f6687717e953486 | N | row-003442 | row-004884 |
| group-098f77dffaf5c5e17b986db5 | N | row-003007 | row-001986 |
| group-0a2b171d0d4e7b3c058fb4a3 | N | row-000773 | row-003534 |
| group-0c30bac940863f9814d72fc3 | N | row-000484 | row-000470 |
| group-0d59c7687b9e79e3ee3170a5 | N | row-003977 | row-004322 |
| group-12f6d31925ec4779364e019f | M | row-005560 | row-003049 |
| group-1555be072affc619727d50f2 | N | row-004244 | row-004911 |
| group-1bfcb2cb1b9ef0da81918744 | N | row-004138 | row-001088 |
| group-3159389cf6576a027a24bf26 | N | row-005339 | row-004780 |
| group-468e168d986865f24a2b27ed | M | row-003685 | row-002547, row-002669 |
| group-483c98e1b36113b53e9353f9 | N | row-004217 | row-002858 |
| group-4d5797a0e9239e8e10e386b9 | N | row-002925 | row-000232 |
| group-4ed50355c6ae29d10c1c2377 | M | row-004071 | row-004566 |
| group-506dc8c44c7de68af1249e9c | N | row-001059 | row-003643 |
| group-5cf200afc87f6b68d35a9df7 | N | row-000752 | row-005352 |
| group-5f9bbacb1d90eba8fbd4a287 | M | row-005919 | row-004256 |
| group-7446e6de84f9c37b45560606 | N | row-000597 | row-003503 |
| group-7823edb543e3db6e7f894ad5 | N | row-002145 | row-005386 |
| group-791e0a497a91e90de039fb18 | M | row-001082 | row-001019, row-003653 |
| group-7a29fd13c9d43e9b6d6e2d41 | M | row-000958 | row-002505, row-003113, row-004238 |
| group-83a72aa7a06f2edf39f889e9 | N | row-000068 | row-001407 |
| group-8be62fbaaa35a74ec1df154c | N | row-003294 | row-001326 |
| group-8e306523dc28c8bcd90a1985 | M | row-004412 | row-001298 |
| group-92bb94d789fadaf943bd3af3 | N | row-002430 | row-005677 |
| group-9723b8c8f2e5647399a62ae7 | N | row-001119 | row-001487 |
| group-9c08e68b013967737af12ff6 | N | row-000382 | row-003429 |
| group-9ef3e89196a57cb962eda2be | N | row-002449 | row-000181 |
| group-ad3b36467b301db4456337d8 | N | row-000333 | row-003675 |
| group-ad5768ee9692cf2ebbc1a37f | N | row-000460 | row-001036 |
| group-b060978914ea98805a1dcf3f | N | row-003590 | row-003570 |
| group-bee36e0653d9d771c5e3119f | N | row-003353 | row-002705 |
| group-c2b2f18ea7290ea03c9dccb0 | N | row-000255 | row-000322 |
| group-c3533d0ac0cd1f276e969f47 | M | row-004579 | row-003341 |
| group-c937d11013c5dc414cf64c7a | M | row-000235 | row-001164 |
| group-cb32c60512fdc43fd2271604 | N | row-003814 | row-000906 |
| group-cb82972f7b2721e411222233 | N | row-004659 | row-005256 |
| group-ce8e40517198d468f0e38b5b | N | row-002790 | row-001630 |
| group-d12c5d721013752f05ec3fa5 | M | row-005078 | row-005734 |
| group-d27e68f38262ac071e23c425 | T | row-003575 | row-003806 |
| group-d2eb19afdad0f8c80ac5e60f | N | row-004789 | row-003083 |
| group-d610eded8ce45e07d199d73c | N | row-003580 | row-004447 |
| group-df21a98a97e0af603a878f5f | N | row-003061 | row-004500 |
| group-dfb422bbdd3cc3f067762b5c | N | row-001214 | row-000214 |
| group-e1ae77502b4eb8984e158126 | M | row-002931, row-004405 | row-001315 |
| group-e28cf94e058bc76907518cdd | M | row-002357, row-004128 | row-001435 |
| group-fbff0a3b7b966a90afbd2bf9 | M | row-004108 | row-001047 |

## Remaining mixed families and dataset effect

| Stage | HAM | SPAM | SMISHING | Rows |
|---|---:|---:|---:|---:|
| Original raw corpus | 4,844 | 489 | 638 | 5,971 |
| Conditional quarantine | 0 | 48 | 50 | 98 |
| Eligible before proposed label corrections | 4,844 | 441 | 588 | 5,873 |
| Conditional reviewed eligible corpus | 4,844 | 439 | 590 | 5,873 |

Raw corpus still contains its original **46 mixed families**; they would remain
quarantined. With current staged labels there are **zero mixed families among
the 5,585 eligible groups**. The seven extra conflicts from the saved 29
corrections disappear because those corrections are reversed in the staged draft,
not because a shared label is automatically propagated. The two source-label overrides
affect singleton train groups only and create no additional family conflicts.

Existing candidate totals remain train **4,112**, validation **881**, test **880**.
Integrity/leakage checks pass, but these assignments remain an unapproved
candidate, not a final frozen split. Final eligible size is conditional, not an
approved dataset claim.

## Integrity and reproducibility

| Artifact | SHA-256 |
|---|---|
| `backend/model-config.json` | `6d995909f71b742b365f05169147d1bc5473f2fc951c47cef1480e5cdd440ecc` |
| `ml/artifacts/goal02-provisional-v2/tfidf_c2.0.json` | `7fe727cfb7868445f07ad32b0449131165268a8c5cbd8bafb71dd2b5178747fa` |
| `ml/data/mendeley-v1-audit-v2/review.completed.json` | `4e674147a8a42f144aa90f023430c8e181566da4c8234de52b5b69ca459defa6` |
| `ml/data/raw/Dataset_5971.zip` | `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3` |
| `ml/manifests/mendeley-v1.split.candidate.json` | `51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0` |

Text-free local assessment SHA-256: `b0644144df2f738c946b2fec60eaad6e43a0aeeede70fea03df03a507d2373bb`.

Read-only recomputation checked original source/member hash, unchanged sample IDs/
labels, source/group/text-hash agreement with candidate, candidate checksum,
empty split intersections, all 45 draft fields and recorded confirmations,
quarantine group membership, eligible class counts and exact workspace blockers.
Canonical review/source/candidate/config/model hashes match before and after.

Local reproducible check of the current running workspace:

```sh
PYTHONPATH="$PWD" .venv/bin/python .cache/review-draft-assessment/verify.py
.venv/bin/python -m pytest tests/test_review_validation.py tests/test_review_tool.py tests/test_training_preflight.py -q
python3 scripts/audit_migration.py
git diff --check
```

Results: read-only consistency **PASS**; **34 tests passed**, one existing
Starlette/httpx deprecation warning; migration audit **PASS**, 139 owned files;
diff whitespace check **PASS**. All 45 sampled IDs and all 98 quarantine IDs
are unique and match the independently recomputed source groups.

The local verifier and text-free snapshot remain ignored under `.cache/`.
They read existing first-party data-preparation code and the loopback workspace;
no POST, write to canonical data, model inference, external request, link
navigation, split freeze or training occurs. Source messages are never included
in this report. The staged workspace is mutable RAM; a later change/restart
requires a new assessment. No immutable submitted draft has been created.
