# ClearMessage Goal 10 handoff

11 October 2026, Europe/Prague. **GO for reviewed local research-prototype integration and demonstration. NO-GO for an independently validated public detector.** All six requested features are implemented and the local verification passed. No merge, deployment, publication, purchase or Devpost submission occurred. Feature work finished before the 18:00 cutoff; the user retains the 19:00 submission decision.

## Experience and completed scope

The first screen offers Upload a screenshot, Paste a message and a real Try an example. Large native-font controls, quiet surfaces, generous space and a small warm accent make the primary task clear. Results lead with a short finding, a fixed reason and immediate action. Uncertainty remains visible; the optional explanation exposes exact observed phrases and appropriate context. Technical model details stay behind How it works / Behind the AI.

| Feature | Delivered behavior |
|---|---|
| Read Aloud | Gesture-only fixed guidance, English voice preference, Stop reading, revision-safe cancellation and unavailable/error fallback; browser/device online behavior disclosed |
| Interactive message bubble | Exact verified rule spans; keyboard explanations; Unicode/emoji/multiline/repeats/overlaps handled; hostile text and URLs remain inert |
| One-tap demo | Clearly fictional delivery request through the real approved API/model; genuine incomplete result, no hardcoded verdict |
| Simple/detailed explanations | Details start closed, toggle without losing focus; critical failure/coverage/language/incomplete/safety information stays visible |
| Privacy Shield | Real automatic display masking plus manual selected ranges; same masked bubble/evidence/selection display; fixed neutral preview/copy/share; reset on edit/new analysis/home |
| Scam recognition | At most one cautious possible delivery/account/bank request pattern, supported by valid existing evidence/context and suppressed by negated/educational wording |

No requested feature is left as a mock, stub or partial implementation within this scope. Platform-dependent speech and the physical accessibility checks listed below remain unverified. Automatic masking is deliberately incomplete; it can miss names/unknown formats or overmask ordinary long numbers. Pattern context is a narrow explanation, not a new validated classifier or sender verification. There is no screenshot preview to expose in either shield state. Source/mask state is RAM-only; masking does not erase processed backend data.

Screenshot OCR, complete editable extraction, explicit text confirmation, actual frozen model inference, rules, policy, ActionGuide, neutral sharing, cancellation/errors, English branding and transparency are preserved. No backend/model/data/split/threshold/evaluation/review history changed. All current analyses remain incomplete and cannot confirm safety.

## Branch, location and commits

Branch: `feature/clearmessage-human-first`. Exact base: `c91cf63edbb7b2a00984a141e2984e4c5bb8530f` from the clean Goal 09 worktree. Managed worktree parent: `/Users/hugo/.codex/worktrees/clearmessage-human-first/`; its existing checkout basename is retained. Obtain the exact root with:

```sh
cd /Users/hugo/.codex/worktrees/clearmessage-human-first/*
git rev-parse --show-toplevel
git status --short
git log --oneline c91cf63..HEAD
```

- `2277dfa` — integrated and tested A–D human-first implementation, shared tokens, helper/component tests and retained browser adaptations.
- `a1148b0` — actual cross-engine/UI/OCR-disabled/fresh-release evidence, reproducible verification adapters, fixed copy inventory and implementation documentation.
- Final documentation milestone — identified by the latest `docs: complete Goal 10 verification and handoff` entry in the command above. A commit cannot include its own hash; the user-facing final response supplies that hash.

Main and Goal 09 remain clean at their original commits. The branch includes all inherited Goal 09 work as well as Goal 10; a future merge into main therefore brings both. Review `c91cf63..HEAD` for this goal alone and `main...HEAD` for the complete integration. No automatic merge occurred.

## Actual verification

Final **217 Python + 131 frontend tests + 174 browser instances PASS**: 88 Chromium (44 production + 44 development proxy), 42 Firefox and 44 WebKit. Two Firefox native clipboard read-back exclusions are explicit; the cases pass in Chromium/WebKit. All 33 earlier scenarios remain, with 11 new feature scenarios. Build, dependency, API/TypeScript/transparency drift, migration, whitespace and frozen-source/hash checks pass.

UI: 27 layouts, 7 actual native Chromium 200% page-zoom captures and 17 contrast pairs; minimum normal text 4.694:1. 360/320px and text enlargement have no measured horizontal overflow; targets at least 48px, body 20px, secondary text at least 16px. Keyboard/focus/status/disclosure semantics, reduced motion and forced colors are checked. Actual pixels and the live in-app UI were inspected. This is not spoken screen-reader or physical-user testing.

Privacy: no raw source in neutral preview/copied/native-share payload, source canaries removed from masked DOM values/attributes, no screenshot upload/clickable message links/automatic sharing/storage. Fresh actual/failed/offline runtimes had empty application logs and zero outbound socket/DNS attempts. Existing model/hash/policy/uncertainty preserved. [Full test report](GOAL_10_TEST_REPORT.md) distinguishes mocks, actual integrations, failed attempts, corrections and unperformed checks; [aggregate evidence](data/goal10-verification.json) records source identities.

Native Chromium listed 41 local English voices in the final run; Firefox/WebKit listed zero initial voices. Actual in-app Listen/Stop/completion controls work, but audible output/voice quality and operating-system behavior require a physical device check. Speech reads fixed guidance only. Docker/actual Safari/physical mobile/spoken screen-reader/human-participant checks were not performed; independent language evaluation, completed low-finding policy, hosting/proxy privacy and distribution licensing remain release gates.

## Start the current application

The review server is running at [ClearMessage Goal 10](http://127.0.0.1:8870/) in the new worktree. Goal 09 remains at port 8869. The reviewer can use the open Goal 10 tab immediately.

To start a separate same-origin instance from the checkout (choose a free port):

```sh
npm --prefix frontend run build
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/serve.py --port 7860
```

Open `http://127.0.0.1:7860/`. Existing isolated `.venv`, node modules, browser binaries and trusted frozen artifacts are prepared. A completely new checkout needs `sh scripts/install.sh`, explicit browser setup and the project's trusted approved artifact; no public model download exists. See [README](../README.md) and [model card](MODEL_CARD.md). Start before demonstrating: the fresh release's measured cold health startup was 61.169s; warm offline restart 0.693s. This is a local observation, not a startup guarantee.

## Demonstrate all six features

1. On Home, activate **Try an example**. Read **Example message** and the actual warning; point out **Limited check · analysis is incomplete** and the language/safety limits. The `.invalid` URL is fictional and inert.
2. Activate **Why this result?**. Select the highlighted payment phrase by mouse or Tab/Enter; its observed explanation opens. Read **Possible pattern / Delivery payment request** and its sender/fraud caveat. Close and reopen details; the incomplete warning remains visible throughout.
3. Activate **What should I do?** for curated steps. **Listen** reads only the fixed result/reason/actions/limits; **Stop reading** cancels it. Verify actual audio on the presentation device; if synthesis is unavailable or errors, use the readable guidance.
4. Activate **Hide personal details**. The displayed URL becomes bullets. Open **Privacy controls**, then **Choose more text to hide**; select another visible fictional phrase and activate **Hide selected text**. The actual verdict and observed evidence remain unchanged. Automatic masking can miss details.
5. Activate **Ask someone for help**. Inspect the neutral help preview before **Copy help request** or the device's explicit share gesture. Confirm it contains no example text or URL. No recipient is selected and nothing is sent automatically.
6. **Start again**. Choose **Upload a screenshot** and the inert tracked fixture `docs/data/goal09-demo-screenshot.png`. Review/edit all extracted text, confirm it, then **Check message**. The screenshot is never uploaded or shown as a result preview. Repeat the optional bubble/shield controls. Choose **Start again**, then **Paste a message**, enter an ordinary fictional message and choose English; it remains an incomplete review, never a safety confirmation. The automated failed-model release demonstrates unavailable-model uncertainty without changing the approved worktree asset.

## Verification and future merge

Run commands in [the test report](GOAL_10_TEST_REPORT.md). They generate only Goal 10 reports when invoked as documented, preserving historical audits. The OCR-disabled verifier retains its scoped `--goal10` switch after automatic review rejected replacing its Goal 09 default.

The following instructions are for a later reviewer-authorized integration; **they were not executed**. First ensure main has no unrelated edits and read both diffs. On main, prepare an inspectable merge without committing:

```sh
git status --short
git diff --stat main...feature/clearmessage-human-first
git diff c91cf63..feature/clearmessage-human-first
git merge --no-ff --no-commit feature/clearmessage-human-first
```

Resolve any conflicts while preserving current safety policy and trusted frozen assets. Stage the trusted ignored model in the destination checkout as documented. Run `sh scripts/test.sh`, cross-engine checks and the Goal 10 UI/OCR-disabled verifiers sequentially, inspect `git diff --cached` and record actual results. Commit only after review/authorization. `git merge --abort` returns to the prior clean main if the pending merge is unsuitable. Do not force-push, publish, deploy or submit as part of these local instructions.

## Remaining limits and recommendation

**GO:** the tested, reviewable local prototype and a truthful hackathon demonstration, after a brief physical presentation-device audio check if Listen will be demonstrated. ClearMessage helps people notice observed requests and choose a cautious next step.

**NO-GO:** claims of independently validated phishing detection, completed safe outcomes, verified senders, complete anonymization, guaranteed offline speech or public production readiness. Independent English/Czech performance, completed low-finding policy, container/hosting/privacy/license checks and human accessibility/usability testing remain separate work. No functionality remains to implement for this active goal.

[Implementation details and changed files](GOAL_10_IMPLEMENTATION.md), [progress/commit history](GOAL_10_PROGRESS.md), [brand](BRAND_BIBLE.md), [fixed English copy inventory](UI_COPY.md) and [actual home screenshot](data/goal10-home.png) complete the handoff.
