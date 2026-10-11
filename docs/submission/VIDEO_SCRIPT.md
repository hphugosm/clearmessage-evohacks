# ClearMessage demo video — 2:30 target

English narration. Record the actual local app after the continuation; use only
fictional messages and inert `.invalid` links. Do not record personal tabs,
notifications, tokens, private messages or the raw corpus. Frame the app and use
large text. Timing is a target, not proof of a completed film. Verify audible
Read Aloud on the recording device before showing it.

| Time | Picture | Narration |
|---|---|---|
| 0:00–0:15 | Home, then the project name | A strange message can make anyone hesitate. ClearMessage helps people notice warning signs and choose a clearer next step. We built it for EVOHACKS 2026. |
| 0:15–0:45 | In the real local app, choose Try an example. Show Suspicious message and its next step. | This is a fictional delivery message. Our actual trained classifier and rules check the text. Here, the message pressures the person to pay immediately. The result stays brief, with a practical next step and a visible limit. |
| 0:45–1:05 | Tab to the highlighted payment phrase and press Enter. Open Why this result? | Each highlight comes from an exact rule span. Selecting it explains the request we observed. These highlights are not explanations of the classifier’s individual words. We never turn message links into clickable links. |
| 1:05–1:25 | Hide personal details; open help preview. Optionally show Listen if device audio works. | You can mask details before showing the screen, listen to fixed guidance, or preview a neutral help request. The draft excludes the original message. Nothing is sent without your action, and masking can miss details. |
| 1:25–1:45 | Start again; use the tracked fictional screenshot; show edit and confirmation. | The full local app can read an English screenshot in your browser. The image is not uploaded. You review and confirm the extracted text before sending it to our backend. |
| 1:45–2:05 | Behind the AI, class results and brief source view of inference/rules | We trained TF-IDF plus logistic regression and compared it with frozen MiniLM embeddings. Validation selected TF-IDF. On 880 previously evaluated test messages, macro-F1 was 0.864. It matched 74 of 88 SMISHING annotations and missed 14. This is annotation agreement, not independently verified fraud accuracy. |
| 2:05–2:20 | Ordinary fictional message → incomplete review; show limits | Every current check remains incomplete. Language-specific performance is unverified. ClearMessage cannot verify a sender or confirm safety. It helps you pause and verify through an official channel. |
| 2:20–2:30 | Public recorded-demo banner, project page and repository | Our public Pages demo clearly replays a recorded local result; it cannot check your own messages. The repository and team page explain the implementation and limitations. We are Team Trampolin. |

## Capture order

1. Start the actual live local app; warm the model before recording.
2. Hide personal notifications and unrelated tabs. Use `docs/data/goal09-demo-screenshot.png` for OCR.
3. Record the shots above. Keep the public recorded-mode banner visible when showing Pages.
4. Speak the narration or record it separately; target 2–3 minutes total. Cut silence, not limitations or labels.
5. Export a real video, upload to the owner's approved video account, and check anonymous access, readable UI and audible narration.
6. Put the verified URL into DEVPOST.md and the project page, replacing the explicit pending-video text.

Do not call this document a completed video or submit without the actual video URL.
