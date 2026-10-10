# ClearMessage Codex goals

Run one goal at a time after reading AGENTS.md and current STATUS. Goals 00–03 have local evidence; Goal 01 human approval remains incomplete and Goal 02 training was explicitly provisional. Read STATUS; do not restart completed work or continue automatically. Goal 06 is optional. Run the English migration/repair prompt first when updating an older checkout. The /goal prefix is preserved from the original workflow; if unavailable, submit the task body as an ordinary prompt. No goal grants new publication or spending authorization.

## Launch prompts

### 00 — Foundation and a real request

```text
/goal Read AGENTS.md and execute prompts/00_foundation.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 01 — Verified data and frozen splits

```text
/goal Read AGENTS.md and execute prompts/01_data.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 02 — Genuine training and honest evaluation

```text
/goal Read AGENTS.md and execute prompts/02_ml.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 03 — Real analysis and safer next steps

```text
/goal Read AGENTS.md and execute prompts/03_analysis.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 04 — Accessible English Style A interface

```text
/goal Read AGENTS.md and execute prompts/04_ux.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 05 — Reproducible release and hosting

```text
/goal Read AGENTS.md and execute prompts/05_deploy.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 06 — Optional browser screenshot text extraction

```text
/goal Read AGENTS.md and execute prompts/06_optional_ocr.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 07 — Model privacy and usability audit

```text
/goal Read AGENTS.md and execute prompts/07_audit.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### 08 — Accurate submission and demo materials

```text
/goal Read AGENTS.md and execute prompts/08_submission.md. Verify its acceptance criteria, update docs/STATUS.md with actual evidence and stop after this goal.
```

### Migration and repair

```text
/goal Read AGENTS.md and execute prompts/09_english_migration_repair.md. Deliver the repaired English repository migration with actual verification evidence and stop after migration.
```


## Canonical English prompts

- [00 foundation](prompts/00_foundation.md)
- [01 data](prompts/01_data.md)
- [02 ml](prompts/02_ml.md)
- [03 analysis](prompts/03_analysis.md)
- [04 ux](prompts/04_ux.md)
- [05 deploy](prompts/05_deploy.md)
- [06 optional ocr](prompts/06_optional_ocr.md)
- [07 audit](prompts/07_audit.md)
- [08 submission](prompts/08_submission.md)
- [09 english migration repair](prompts/09_english_migration_repair.md)

Use `/goal Read AGENTS.md and execute prompts/04_ux.md` only when that goal is explicitly requested. If the client has no goal command, submit the task body as an ordinary prompt. Complete the selected goal and stop.
