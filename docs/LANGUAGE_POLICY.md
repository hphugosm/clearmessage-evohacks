# ClearMessage language and naming policy

Version 1.0.0 · 10 October 2026

ClearMessage is the product name. EVOHACKS is the event context. Use **ClearMessage — EVOHACKS 2026** for the repository description and submission title. Use `clearmessage-evohacks` for the project directory and repository slug, `clearmessage` for npm and container identifiers, and `clearmessage-evohacks-codex.zip` for the delivery archive.

All first-party documentation, prompts, comments, filenames, UI strings, accessible names, metadata, error messages, examples and submission materials must be English. Use sentence case and plain international English. HTML declares `lang="en"`. Use one English copy dictionary; no interface language switcher, Czech fallback or bilingual README. The tagline is **Understand messages. Make safer decisions.**

Interface language and message language are separate. The existing API accepts `auto`, `en`, `cs` and `other` as message-language hints. `cs` is a language identifier, not untranslated UI. The selector displays **Not specified**, **English**, **Czech** and **Other language**, all in English. No language has verified model performance in the current provisional integration. `auto` means not specified, not automatic detection.

Never translate raw research datasets, blind evaluation inputs, immutable upstream licenses, bibliographic titles or third-party code simply to pass a language scan. Such changes can invalidate evidence or attribution. Record any retained reference material by exact path and purpose. Raw public research data and the four-decision review remain under ignored ml/data/; no actual blind set exists. The bundled Inter font retains its full English upstream license.

The migration scanner contains old identifiers only as diagnostic patterns. Czech test inputs and multilingual rule expressions are permitted data/code exceptions, listed by exact path in MIGRATION_REPORT. Czech prose is not permitted in owned UI, documentation or instructions. The existing workspace directory name is an operational exception: moving it would break local environments and the attached checkout. Use the ClearMessage slug for new directories. The owner-supplied clearmessage-evohacks/ reference package is preserved outside the active tracked project. A Unicode/legacy scan is a reproducible aid; editorial review remains necessary for ASCII-only untranslated prose.

This policy governs naming and language; [BRAND_BIBLE.md](BRAND_BIBLE.md) governs design; [UI_COPY.md](UI_COPY.md) governs wording; [API.md](API.md) and `backend/contracts.py` govern the API; [STATUS.md](STATUS.md) records actual implementation. All goal prompts follow these authorities.

Language/group-format unit tests retain original non-English input as test data, with English assertions/comments. No raw dataset or blind evaluation content was translated. Public demonstration fixtures are entirely English.
