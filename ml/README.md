# ML — skutečný provizorní model, audit nedokončen

Mendeley V1 import: 5 971 řádků, raw/CSV hash, ham/spam/smishing, doložený
automatický audit. Candidate nad 5 873 eligible řádky má nulové průniky skupin.
46 konfliktních skupin / 98 řádků odloženo. Čtyři explicitní review rozhodnutí
uložena: 2 shody, 2 požadované změny; 41 pending, atribuce/jazyky chybí.

Uživatel výslovně povolil **provizorní trénink na původních labelech**.
Authorization manifest odkazuje na nezměněný candidate; data_split_ready=false,
žádný approved freeze. Schvalovací training_preflight zůstává blokován.

Skutečně natrénován sklearn Pipeline word/char TF-IDF + LR i vlastní LR head nad
frozen MiniLM. Validation vybrala TF-IDF C=2, uložen hashově ověřený JSON.
Audit/jazyky neověřeny: experiment proti source labelům, nikoli schválený detektor.
API dosud není propojeno a stále pravdivě hlásí model_not_ready.

- Install/setup/train/verification příkazy: [MODEL_CARD](../docs/MODEL_CARD.md).
- Anglický měřený [MODEL_REPORT](../docs/MODEL_REPORT.md) a [JSON](reports/goal02-provisional-v2.json).
- Aktuální stav/index: [goal02-latest.json](reports/goal02-latest.json).
- Zdroj/licence/counts: [DATA_SOURCES](../DATA_SOURCES.md).
- Audit/freeze postup: [DATA_PREPARATION](../docs/DATA_PREPARATION.md).
- České development/blind formáty: [czech/README.md](czech/README.md), 0 záznamů.

`scripts/infer_model.py` načte náš model jen s očekávaným SHA-256, čte JSON ze
stdin a nevrací zprávu ani interní skóre. Provizorní policy neprodukuje
no_strong_signals ani analysis_complete=true. Encoder používá jen ověřené místní
safetensors a odmítá token overflow; žádný runtime download nebo pickle.

Raw texty, review poznámky, cache a váhy jsou Git-ignorovány. Veřejné reporty mají
pouze metriky, hash/IDs a provenance; žádný datasetový obsah v demo fixtures.
No/yes indikátory nejsou modelové features. Třídy nejsou stavy API.
