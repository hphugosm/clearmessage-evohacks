# ClearMessage — EVOHACKS 2026

## Tagline

Understand suspicious messages. Choose a clearer next step.

## Inspiration

A strange delivery notice or urgent account message can be difficult to judge,
especially when the interface meant to help is just as confusing. We wanted a
small, readable flow that explains what caught our attention and gives people
one practical next step.

## What it does

ClearMessage checks short messages using our trained classifier and transparent
rules. Its English interface offers paste input, browser screenshot OCR,
interactive highlights of exact observed requests, short or detailed guidance,
Read Aloud, display masking and a neutral help request you can choose to share.

The public GitHub Pages demo replays one actual local model result for a clearly
fictional message. It accepts no personal message input and performs no live
analysis. The complete application runs locally with FastAPI and the approved
model artifact. A public inference backend has not been deployed.

## How we built it

We used React, TypeScript and Vite for the interface, FastAPI/Pydantic for bounded
requests, and scikit-learn to train a word-and-character TF-IDF + logistic
regression classifier for HAM, SPAM and SMISHING source annotations. We compared
it with a frozen pretrained multilingual MiniLM encoder plus our own linear
heads; validation selected TF-IDF. We did not pretrain an encoder or train an LLM.

Related messages were grouped before the frozen split. The reviewed dataset has
5,873 eligible messages, split into 4,112 training, 881 validation and 880 test
examples. Our existing 45-row human audit, 98 quarantined conflicting records and
two training-label corrections do not independently validate all annotations.

The selected classifier achieved test macro-F1 0.864. It matched 74 of 88
SMISHING annotations (recall 0.841), missing 14. These measure agreement with
source annotations on a previously evaluated test set, not independent blind
validation or real-world fraud accuracy. English and Czech language-specific
performance remains unverified. The model card includes class results and errors.

## AI for automation

AI automates the initial classification of a message. Rules attach exact evidence
to supported requests, and a separate policy combines findings with model/service
limits. The user inspects the result and chooses what to do. The app does not
block messages, contact a bank, send drafts or browse suspicious links.

## Challenges

We kept source labels distinct from safety outcomes, grouped related templates
before splitting, and preserved conservative incomplete assessments. Highlighting
uses Python Unicode code-point spans correctly in JavaScript and never attributes
specific words to classifier-only findings. Privacy tests check neutral sharing,
masked displays, errors, logs and absence of runtime outgoing analysis requests.
GitHub Pages cannot run our Python backend, so the public demo honestly exposes
its recorded mode rather than pretending to analyze new messages.

## Accomplishments

The working local prototype combines real inference, screenshot text recognition,
keyboard-operable rule highlights and practical guidance in one readable journey.
We shortened repetitive wording while keeping an understandable uncertainty
statement. Detailed validation and remaining limitations are in the repository.
No human usability, physical-device or spoken screen-reader certification is claimed.

## What we learned

A suspicious prediction is useful only when people can understand its limits and
act on it. Exact rule evidence, a readable next step and user-controlled help
sharing are as important to the experience as a classification score.

## What's next

Verify an approved public backend and its privacy settings, independently evaluate
language-specific performance, and test readability and accessibility with people.
Every current assessment remains incomplete and cannot establish safety.

## Built with

React, TypeScript, Vite, Python, FastAPI, Pydantic, scikit-learn, Tesseract.js.

## Links and disclosure

- Repository: https://github.com/hphugosm/clearmessage-evohacks
- Recorded interactive demo: https://hphugosm.github.io/clearmessage-evohacks/
- Team project page: https://tymtrampolin.cz/clearmessage/
- Video: pending actual recording/upload/playback verification; do not submit a placeholder.
- Full local setup and trusted-artifact requirement: repository README.
- Dataset: Mishra & Soni, Mendeley V1, DOI 10.17632/f45bkkt8pr.1, CC BY 4.0.
- Reused pretrained comparison encoder, OCR resources, libraries and font are credited.
- Codex assisted implementation and testing. No claim of training these upstream resources.
- First-party code has no selected open-source distribution license.

This is a draft for owner review, not a submitted entry. Confirm participants,
event eligibility and interpretation of reused resources with the organizer;
no organizer permission or enrollment is invented.
