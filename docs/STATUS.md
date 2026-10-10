# Stav projektu

Poslední změna: **10. 10. 2026, Europe/Prague — Goal 03 skutečný analyzační tok
lokálně implementován a ověřen.** Frontend → vlastní Goal02 model → verzovaná
policy/pravidla → CZ/EN postup a neutrální návrh pomoci. Žádný další trénink,
freeze, otevření held-out/blind zpráv, publikování ani další goal.

**Model zůstává provizorní:** 41 pending lidských kontrol, původní labely,
jazykový výkon neověřen. API načte skutečný hashově ověřený model, ale vrací
vždy `analysis_complete=false`; pouze `suspicious` s pravdivým podkladem nebo
`review`. `no_strong_signals` je zablokován, nikoli simulován.

| Oblast | Stav | Důkaz / blokátor |
|---|---|---|
| Pravidla a harmonogram | Původní podklady zachovány | AGENTS.md, PROJECT_PLAN.md, RESEARCH.md, ACCEPTANCE.md a prompty beze změn. Reuse stále čeká na vyjasnění pořadatelem. |
| Frontend / API | Ověřeno lokálně | Skutečný POST přes Vite proxy i frontend build servírovaný FastAPI; 14 Playwright testů v Goal03. |
| Kontrakt | Ověřeno | Pydantic → docs/openapi.json → generovaný TypeScript; kontroly driftu prošly. |
| Model | Skutečný provizorní artefakt připojen | TF-IDF/LR, ověřený SHA, interní skóre; analysis_complete=false, model_version se skutečným hash prefixem. Při chybě rules-only. |
| Testy / build | PASS dostupných kontrol | 140 pytest, 26 Vitest, 14 Playwright, build/kontrakt/pip check; 82 API/policy testů také v čistém prostředí. Stávající warning zachován. |
| Docker | Připraven, neověřený build/run | Docker CLI ani daemon nejsou dostupné; base image manifesty/digesty ověřeny pouze čtením registry. |
| Deployment účet | Nepotvrzen | Žádná existující projektová konfigurace s cílovým účtem/serverem; globální HF CLI nefunguje. |
| Veřejné nasazení | Neprovedeno | Žádné publikování, platby ani čtení přihlašovacích údajů. |
| Dataset | Importován; review nedokončen | 5 971 řádků. Uložena 4 rozhodnutí: 2 shody, 2 návrhy smishing → spam; 41 pending. Atribuce/jazyky a schválení konfliktů chybí. Původní labely zachovány. |
| Datové nástroje | Ověřeno i nad skutečnými daty | CSV/ZIP import → audit → candidate skupinový split → verify + testy skutečného manifestu. Finální freeze odmítá pending review, žádný reviewed finální split. |
| České development / challenge | Pouze formát a postup | Pydantic + JSON Schema, nezávislá tvorba/kontrola, rodiny/provenance; 0 skutečných příkladů. Blind odpovědi nečteny. |
| Trénink | Provizorní experiment ověřen | Na výslovné povolení původních labelů: 2 TF-IDF + 2 frozen-MiniLM/LR kandidáti, majority, validation selection, test až poté. Schválený preflight zůstává blokován. |
| Git / commit | Lokální repo | Na výslovný požadavek commitu v Goal 01 založen nový Git, bez remote. Lokální commit tohoto kroku ověřit `git log -1`; původní soubory zahrnuty, raw/cache ignorovány. |
| Pomoc / sdílení | Ověřeno lokálně | Pevné CZ/EN šablony, náhled, samostatné gesto, ruční kopírování; žádný clipboard API ani zdrojová zpráva. |
| Devpost / video / OCR | Nezahájeno | Mimo aktuální Goal03. |


## Goal 03 — model, pravidla, postup a prosba o pomoc

Navázáno na čistý commit `570f2f0`; cizí změny nebyly přítomné. Pravidla a
podklady AGENTS/PROJECT_PLAN/RESEARCH/ACCEPTANCE zachovány. Auditní JSON zůstal
beze změny: SHA `7cf04370060bc86e58349a06dc04fc82de680b0404e17eb44b4babe34a30a70c`.
Model beze změny: SHA
`7fe727cfb7868445f07ad32b0449131165268a8c5cbd8bafb71dd2b5178747fa`.

- `backend/inference.py`: malé score/coverage rozhraní, skutečný hashově ověřený
  projektový JSON, jednorázové načtení, jeden neblokující inference slot. Žádný
  pickle/download/fallback ML. Sparse vstup se nezkracuje; pokrytí celého textu
  není tvrzení o porozumění všem slovům. False coverage a chyby nepovolí
  klasifikátorové varování ani úplnost, ale skutečné pravidlo může varovat.
- `analysis-policy-1`, `observed-requests-1`, kontrakt `1.1.0`: pravidla žádosti o
  heslo/OTP, okamžitou platbu a utajení; negace, běžná upozornění, kontrastní
  věty, URL masking. Interní offsets dokazují match, žádné citace ve sdílení.
  Spam/HTTPS/TLD/krátký odkaz/pravopis nejsou samy pravidlovým důkazem podvodu.
- Modelový EN warning má validation threshold **0.60** z nezměněného Goal02
  reportu. CZ/other/nezadaný jazyk dostávají konkrétní pravidlová varování nebo
  review. EN modelový warning zůstává provizorní; výkon není ověřen ani v EN.
  Nízká větev policy je výslovně nevalidovaná a vypnutá. Test-only modely
  zkoušejí hypotetický budoucí nízký výsledek, nejsou v aplikaci.
- `tldextract==5.4.0`: `suffix_list_urls=()`, `cache_dir=None`, bundled snapshot,
  žádný DNS/HTTP/WHOIS/redirect ani disk cache. Instalováno jen lokálně a
  zafixováno skutečné řešení: 28 runtime + 7 dev-only verzí s wheel hashi.
  Licence balíčků + BSD-3-Clause tldextract / MPL-2.0 PSL notice/hash v
  `docs/runtime-licenses.json`. Sparse runtime nepotřebuje torch/ST/encoder.
- CZ/EN důvody a kroky nejvýše tři; observed signal odlišen od obecného
  klasifikátorového výstupu. Bez konkrétní evidence poctivé obecné omezení.
  Preview prosby z pevných neutrálních šablon, další gesto pro Web Share,
  ruční kopírování bez clipboard API. Žádný source/evidence/URL/jméno/účet/kód
  v payloadu. Tři stručné rady „už jsem klikl/a“, bez dalšího formuláře/tajemství.
- Dockerfile obsahuje sparse runtime a explicitně připravený vlastní model;
  `scripts/prepare_model.py` zkontroluje model/report/threshold a připraví
  ignorovaný build asset. Raw data, encoder a uživatelské zprávy se nekopírují.

### Skutečné příkazy a výsledky Goal03

```sh
.venv/bin/python -m pip install --only-binary=:all: tldextract==5.4.0
.venv/bin/python scripts/lock_dependencies.py
python3 -m venv .cache/goal03-runtime
.cache/goal03-runtime/bin/python -m pip install --only-binary=:all: --require-hashes -r backend/requirements-dev.txt
.cache/goal03-runtime/bin/python -m pip check
.cache/goal03-runtime/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
.venv/bin/python scripts/export_contract.py
npm --prefix frontend run contract:generate
.venv/bin/python scripts/prepare_model.py
sh scripts/test.sh
.venv/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
npm --prefix frontend run build
.venv/bin/python scripts/verify_analysis.py
git diff --check
```

| Kontrola | Skutečný výsledek |
|---|---|
| Install/lock/čisté prostředí | **PASS**, pouze lokálně, hash-verified wheels, pip check bez konfliktů. |
| Čistý API/policy pytest | **PASS 82**, 73.17 s včetně prvního studeného importu; 1 existující Starlette/httpx warning. Fresh-process API uvnitř testu prošlo. |
| `sh scripts/test.sh` | **PASS exit 0**: pip check, OpenAPI/TS drift, **140 pytest** (2.88 s), **26 Vitest**, TypeScript/Vite build, **14 Playwright** (5.1 s). |
| Finální cílená kontrola po zpřesnění coverage/úklidu copy | **PASS 82**, TypeScript/Vite build znovu prošel; nezměněné frontend testy nebyly zbytečně opakovány. |
| No-egress | **PASS**: skutečný model volán, DNS/socket/requests zakázány, studený PSL i opakované URL; **0 pokusů**. Také localhost/privátní IP/IPv6/IDNA/@/HTML/instrukce jako data. |
| Konflikty, legitimní upozornění, reklama, žádost bez URL, absence/výpadek/invalid scores/overflow/busy/input limits | **PASS**, fikční/inertní fixtures; žádné blind/held-out příklady. |
| Canary logy / odpovědi / sdílení | **PASS**, stdout/stderr/caplog i browser console, žádná soukromá canary ve výstupu/share. Native share ve browser testu test-only stub, API/model skutečné. |
| Model reload/maximum input/API v novém procesu | **PASS**, scores shodné s Goal02 JSON loaderem; 2 000 znaků celé, 2 001 odmítnuto. |
| Offline příprava `build/model.json` | **PASS**, přesný artefakt/selection report/threshold; nic nestaženo či trénováno. |
| Docker COPY layout v čistém Python prostředí | **PASS**, pouze soubory skutečně kopírované Dockerfile; frontend/API/model fungují. **Není to Docker build**. |
| Docker CLI/daemon/build/run | **NETESTOVÁNO**, `command -v docker` nenalezl CLI; žádný daemon nebyl instalován/měněn. |
| Diff/hash/ignore kontrola | **PASS**, bez whitespace chyb; review/model hash zachován, build/raw/cache mimo staging. |
| Nasazení / další goal / model retraining | **NEPROVEDENO**, není součást tohoto kroku. |

Strojový integrační report: `ml/reports/goal03-integration.json`; dokumentace
`docs/API.md`, `docs/POLICY.md`, aktualizovaný `docs/MODEL_CARD.md` a README.
Měřeno na macOS 26.6.2 arm64, Python 3.13.1, Apple M5 z Goal02. **25 in-process
requestů s načteným modelem**, včetně HTTP/ASGI/pravidel a studeného PSL, bez
prvního importu: p50 **0.893 ms**, p95 **3.396 ms**, maximum **30.606 ms**, process
peak RSS **178 503 680 B**. Továrna aplikace v již importovaném procesu **15.819 ms**.
To není měření síťové latence, Docker výkonu ani jazykové přesnosti.

Pět vlastních syntetických development smoke případů: CZ žádost bez URL a EN
okamžitá platba → suspicious s observed evidence; EN bezpečnostní upozornění,
reklama a školní zpráva → review bez evidence. Všech pět neúplné; nejsou to
modelové metriky či real-world validace. Held-out výsledky Goal02 zůstávají
historickým měřením modelu, nová kombinovaná pravidlová policy na nich nebyla laděna.

**Zbývající omezení:** lidský review a schválený finální split, chybějící EN/CZ
benchmark, konečná pattern pravidla (možné chyby u složité negace/kontextu),
Docker/Linux/Safari/Firefox a hosting privacy/HTTPS neověřeny. Skutečné native
sdílení závisí na browseru/secure context; odeslání člověkem nebylo provedeno.
Nový klon potřebuje vlastní vybraný Goal02 artefakt se stejným SHA, jinak
příprava modelu hlásí blokátor a API přizná rules-only. Warning Starlette/httpx
ani NO_COLOR/FORCE_COLOR z prostředí nebyly potlačeny. Jedna první patch operace
byla odmítnuta pro dvojí cíl souboru (žádné částečné změny); opraveno standardním
update. Žádná neúspěšná kontrola není označena jako úspěch.

Lokální commit Goal03 ověřit `git log -1`; bez remote/publikování. **Další goal
nezahájen.** Následující oddíly jsou historické reporty předchozích goalů.

## Goal 02 — provizorní trénink po výslovném povolení

Uživatel přerušil review a výslovně zvolil „Povoluji provizorní trénink na
původních labelech; audit označit jako nedokončený“. Čtyři uložená rozhodnutí
zachována (2 shody, 2 požadované změny smishing → spam; 41 pending).
Žádná automatická lidská potvrzení ani approved freeze. Před změnami čistý Git
strom; frontend/backend a původní kandidátní split beze změn.

Neměnný provizorní authorization manifest odkazuje na původní candidate hash,
zachovává seed 20261010 a skupiny/řádky **4 112 / 881 / 880**, nadále
`data_split_ready=false`. Trénink vyžaduje explicitní CLI flag. Schvalovací
preflight nebyl oslaben; schválený manifest stále chybí.

- Sklearn Pipeline: word/char TF-IDF → balanced LogisticRegression, C=0.5/2.0.
  Slovník/IDF/head fit jen train; majority baseline rovněž jen train.
- Frozen multilingual MiniLM, Apache-2.0, revize
  `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`, vlastní LR head C=0.5/2.0.
  CPU, bez fine-tuning/pretraining. Nejdříve 32 train zpráv benchmarkováno:
  **0.116693 s**; až potom embeddings. Jen veřejné train/validation cache.
- Tokenizování bez truncation, limit **128 včetně special tokens**. Coverage:
  train 4 103/4 112, validation 880/881, test 880/880. Overflow zůstává review.
  Metriky používají zveřejněné covered denominátory, výběr penalizuje coverage.
- Validation vybrala **TF-IDF C=2**, macro-F1 **0.876209**, interní threshold
  **0.60** z pevné mřížky podle validation warning F1. Selection uložen před
  test featurization/scoring; CSV parser předtím routuje veřejné řádky podle ID.
- Test source-label macro-F1: vybraný TF-IDF **0.863645**, majority **0.301370**,
  MiniLM C=0.5 **0.848873**, MiniLM C=2 **0.852579**. Test neovlivnil výběr.
  Nejde o ground-truth fraud výkon; EN/CZ výsledky nejsou dostupné, jazyky
  zdroje neověřeny. Blind challenge neotevřena.
- Provizorní policy test: **75 suspicious / 805 review / 0 no_strong_signals**,
  všechny analysis_complete=false; 68 source-smishing warnings, 7 FP,
  20 source-smishing bez explicitního warning. Abstention 0.914773,
  dokončené coverage 0. Žádné uživatelské fraud procento.
- Projektové JSON, encoder safetensors, NPY bez pickle; hash loaderů/assets
  ověřeny. Reload score rozdíl **0**; opakovaný TF-IDF fit byte-identický,
  opakovaný head fit na fixních embeddings identický. Nezávisle přepočítáno 32
  encoder vektorů: max rozdíl 3.88e-7 při jiném padding batchi. Cross-platform
  byte identita se netvrdí.
- **Apple M5, macOS arm64, 24 GiB, CPU/4 threads**: vybraný model median
  **0.424 ms**, p95 **0.640 ms**, 32 validation zpráv včetně policy, bez load.
  Batch throughput zvlášť. Všechny 4 modely prošly offline fresh-process
  inference; TF-IDF i v čistém wheel-hash prostředí.

Doklady: `docs/MODEL_CARD.md`, anglický `docs/MODEL_REPORT.md`,
`ml/reports/goal02-provisional-v2.json`, `goal02-verification-v2.json`,
`goal02-verification-clean-v2.json`, aktuální index `goal02-latest.json`.
Per-class metriky, confusion matrices, FP/FN a error IDs skutečně spočítány;
raw texty, nebezpečné odkazy, váhy a cache nejsou v commitu. Původní blocker
report je historický. Projektová distribuční licence zatím nebyla zvolena.

### Skutečné příkazy Goal 02 — provizorní běh

```sh
.venv/bin/python scripts/lock_ml_dependencies.py
.venv/bin/python -m pip install --only-binary=:all: --require-hashes -r ml/requirements-encoder.txt
.venv/bin/python scripts/setup_encoder.py
.venv/bin/python scripts/train.py \
  --allow-provisional-original-labels --encoder-directory ml/artifacts/encoder \
  --output ml/artifacts/goal02-provisional-v2 --report ml/reports/goal02-provisional-v2.json
python3 -m venv .cache/ml-verify
.cache/ml-verify/bin/python -m pip install --only-binary=:all: --require-hashes -r ml/requirements.txt
.venv/bin/python scripts/verify_model.py \
  --report ml/reports/goal02-provisional-v2.json --output ml/reports/goal02-verification-v2.json
.venv/bin/python scripts/verify_model.py \
  --report ml/reports/goal02-provisional-v2.json --output ml/reports/goal02-verification-clean-v2.json \
  --fresh-python .cache/ml-verify/bin/python
.venv/bin/python scripts/write_model_report.py \
  --report ml/reports/goal02-provisional-v2.json --verification ml/reports/goal02-verification-v2.json \
  --output docs/MODEL_REPORT.md
.venv/bin/python scripts/training_preflight.py
.venv/bin/python -m pip check
.venv/bin/python -m pytest -q
```

Původní ověřené install kroky před generováním locků:

```sh
.venv/bin/python -m pip install --only-binary=:all: scikit-learn==1.9.1 numpy==2.5.3 scipy==1.18.1 joblib==1.6.0 threadpoolctl==3.7.0
.venv/bin/python -m pip install --only-binary=:all: sentence-transformers==6.1.0 torch==2.14.1 transformers==5.19.0 'huggingface-hub>=1.31.0,<2.0.0' safetensors==0.8.0
```

| Kontrola | Skutečný výsledek |
|---|---|
| První encoder install s hub 2.2.0 | **FAIL resolver**, ST vyžaduje hub <2; opraveno podle metadata, hub 1.33.0. |
| ML locks / čistý baseline install | **PASS**, ověřené verze/wheel hash; 7 baseline + 34 encoder balíčků, pip check bez konfliktů. |
| Explicitní encoder setup | **PASS**, 11 allowlisted souborů, revize/licence/hashi; žádný pickle či cizí kód. |
| První training v1 | **FAIL před testem**, reload změnil float32 hlavu na float64. Žádné test skóre z pokusu, částečné ignored artefakty zachovány. |
| Training v2 | **PASS**, zachován původní dtype, reload parity 0, skutečný fit/selection/test. |
| První clean fresh-process ověření | **TIMEOUT 60 s** při cold importu; nezapočítán jako úspěch. Následný clean import a opakované ověření PASS v clean reportu. |
| Offline fresh-process / hash / overflow / latency | **PASS**, všechny 4 modely, síť zakázána; žádný runtime download, overflow nedokončené review. |
| Plný pytest | **PASS 89 testů, 1 existující Starlette/httpx warning**, 1.89 s; 11 ML testů navíc. |
| Approved Goal 01 preflight | **OČEKÁVANĚ BLOKOVÁN exit 2**, 2 confirmed bez atribuce, 41 pending, 2 disagreed; žádný final manifest. |
| Frontend / Docker / deployment / API integrace | **NEPROVEDENO**, frontend/backend nezměněny, Docker dříve nedostupný; mimo tento krok. |

Reprodukci spouštět s novými output/report cestami podle MODEL_CARD; známý test
při dalším ladění označit jako development. Lokální commit ověřit `git log -1`;
žádný remote/publikování. Schválený detektor a Goal 03 nejsou součástí výsledku.

## Goal 02 — historie prvního blokovaného běhu: training preflight

Před změnami čistý Git strom na commitu `92142ab`; cizí změny nebyly přepsány.
Čteny pravidla, plán, rešerše, acceptance, aktuální status, veřejný audit/provenance
a manifest metadata. Kontrola lokálního review potvrdila **0/45 confirmed**, bez
atribuce a s prázdným `exclusions_approved_by`. Název `review.completed.json`
neznamená, že review proběhlo. Význam labelů nebyl lidsky schválen; není vytvořen
náhradní korpus ani automaticky vyplněna lidská potvrzení.

`ml/training_preflight.py` a CLI `scripts/training_preflight.py` odmítají pending
review/candidate ještě před načtením zdrojových bajtů nebo textů pro trénink.
Pro schválené vstupy ověřují hash manifestu/review/archivu, datovou verzi,
atribuci/jazyky 15 kontrol každé třídy, train zařazení kontrolovaných ID, schválení
odložení, počty tříd a nulový průnik skupin. Výstup používá pevné diagnostické
kódy bez review poznámek nebo zpráv. Úspěšný preflight by znamenal pouze
připravenost dat, nikoli správnost modelu.

Anglický `docs/MODEL_CARD.md` a `ml/reports/goal02-status.json` uvádějí skutečné
počty, seed, hash/provenance, prostředí a chybějící výsledky jako **null / not
computed**. Většinová train třída ham vychází pouze z candidate metadata;
majority baseline nebyla vyhodnocena. Žádné testové ani blind texty nebyly v tomto
kroku otevřeny. Jazyk datasetu stále není ověřen; žádná EN/CZ metrika se netvrdí.

### Skutečné příkazy a výsledky Goal 02

```sh
.venv/bin/python scripts/training_preflight.py
.venv/bin/python scripts/training_preflight.py \
  --manifest ml/manifests/mendeley-v1.split.candidate.json
.venv/bin/python -m pytest tests/test_training_preflight.py -q
.venv/bin/python -m pytest -q
```

| Kontrola | Skutečný výsledek |
|---|---|
| Preflight výchozího finálního manifestu | **BLOKOVÁNO, exit 2**: `approved_manifest_missing`, `human_label_review_incomplete`, `human_review_requires_15_per_class`. |
| Preflight candidate manifestu | **BLOKOVÁNO, exit 2**: `manifest_not_approved` a stejné human-review blokátory; SHA candidate odpovídá. |
| Targeted preflight pytest | **PASS 9 testů**, pouze fiktivní schválení v testech; tampering, pending review, leakage a bez echo poznámek. |
| Plný pytest | **PASS 78 testů, 1 warning**, existující Starlette/httpx deprecation; 1.76 s. Nejde o modelové metriky. |
| TF-IDF/LR fit, validation selection, majority/test metrics | **NEPROVEDENO**, neschválená vstupní data; žádný fitted Pipeline, žádné prahy. |
| Encoder/revision/license acquisition a small-batch benchmark | **NEPROVEDENO**, stejný datový blokátor; žádný download, cache ani nový balíček. |
| Tokenizer coverage, reload parity, fresh-process inference, retraining reproducibility | **NEPROVEDENO**, modelový artefakt neexistuje. |
| Frontend build / Docker / deployment | **NEOPAKOVÁNO / NEPROVEDENO**; frontend/backend nezměněny, Docker dříve nedostupný; žádné zveřejnění. |

**Požadovaný vstup k odblokování:** skutečně vyplněný a připsaný lidský review
JSON (45 label/language kontrol a rozhodnutí o konfliktech), následně finální
freeze podle `docs/DATA_PREPARATION.md`. Teprve potom lze zahájit skutečný
trénink a výběr na validation před jednorázovou test evaluací. Přesný kontrolní
příkaz je výše; funkční retraining příkaz zatím neexistuje. Lokální commit tohoto
kroku ověřit `git log -1`; bez remote/publikování. Další goal nebyl zahájen.

## Goal 01 — pokračování po dodání archivu uživatelem

Download blokátor byl odstraněn lokálním vstupem; HTTP 403 se nepřeklasifikovalo
na úspěšné automatické stažení. Uživatelská složka v Downloads a její soubory
zůstaly beze změny. Z přiloženého ZIP se v RAM četl jen CSV člen; přiložené
Python soubory/PDF nebyly spuštěny a žádná URL ze zpráv nebyla otevřena.

- Archiv `Dataset_5971.zip`: **244 698 B**, SHA-256
  `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3`.
- CSV člen `Dataset_5971.csv`: **595 987 B**, SHA-256
  `649844f1c62a6b27e145eaf17a65f7010c56c390e11a794ea8329993a05ba71e`.
- **5 971** skutečných řádků, **4 844 ham / 489 spam / 638 smishing**. Zdrojová
  case varianta `Smishing/smishing`, `Spam/spam` se explicitně normalizuje.
  Sloupce jsou LABEL/TEXT/URL/EMAIL/PHONE, striktní UTF-8.
- Indikátory skutečně obsahují **No/yes**. Opraven audit schématu `data-prep-v2`
  a přidán test: format binary valid, nikoli phishing label ani modelová feature.
  První lokální audit V1 nesprávně hlásil tyto hodnoty jako nebinární a je
  zachován v jiné cestě; canonical nový audit jej nepoužívá ani nepřepisuje.
- Chybějící buňky/NA/unknown labels/invalid indicator values: **0**.
  Normalizovaných duplicate extra rows **140**; po grouping **5 631 skupin**.
  **46 konfliktních skupin / 98 řádků** odloženo (48 spam, 50 smishing).
  Eligible **5 873 řádků / 5 585 skupin**. Nejde o automatické přeznačení tříd.
- Jazyk pořád **neověřen u všech 5 971**. Script hints 5 906 Latin unknown,
  1 mixed unknown, 64 too short unknown. Časová/kampaňová/jazyková metadata
  nejsou ve skutečné CSV hlavičce. Úplná upstream row lineage neověřena.
- Připraveno 15 ID každé třídy, lokální `review-preview.txt` a
  `conflict-preview.txt` s rozbitými odkazy/markup. `review.completed.json` je
  jen nevyplněná kopie pending formuláře: **0 skutečných lidských kontrol**.
- Candidate návrh fixuje seed/skupiny/kód/hash vstupu, má nulové průniky skutečných
  ID/skupin/textových/normalizovaných/template hashů. Candidate SHA-256:
  `51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0`.
  Stav **candidate_pending_human_review**, **data_split_ready=false**;
  `ml/manifests/mendeley-v1.split.json` (finální) nevznikl.

| Třída | Candidate train | Candidate validation | Candidate test |
|---|---:|---:|---:|
| ham | 3 391 | 727 | 726 |
| spam | 309 | 66 | 66 |
| smishing | 412 | 88 | 88 |
| Celkem | 4 112 | 881 | 880 |

Text-free veřejné artefakty: `docs/data/mendeley-v1.audit.json`,
`docs/data/mendeley-v1.provenance.json`, source config a
`ml/manifests/mendeley-v1.split.candidate.json` + `.sha256`. Raw, texty a
previews jen v ignorovaném `ml/data/`, nejsou v commitu. Čeština zůstává pouze
formát a nezávislý postup, žádné blind odpovědi nebyly vytvořeny/čteny.

### Skutečné příkazy pokračování (10. 10. 2026, Europe/Prague)

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3

.venv/bin/python scripts/prepare_data.py plan-split \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --manifest ml/manifests/mendeley-v1.split.candidate.json

.venv/bin/python scripts/prepare_data.py verify \
  --input ml/data/raw/Dataset_5971.zip \
  --manifest ml/manifests/mendeley-v1.split.candidate.json

.venv/bin/python scripts/prepare_data.py freeze \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --review ml/data/mendeley-v1-audit-v2/review.completed.json \
  --manifest ml/manifests/mendeley-v1.split.json

.venv/bin/python -m pytest -q
```

| Kontrola | Skutečný výsledek |
|---|---|
| Před změnami `git status --short` | Čistý strom; navázáno na commit `9d1e6c6`. |
| Lokální raw copy + archive/CSV hash | **PASS**, neměnná kopie obdrženého archivu; bez extrakce/scripts. |
| `audit` s explicitním SHA | **PASS**, 5 971 řádků, 15 review každé třídy; source mapping a formát ověřeny automaticky, lidský audit pending. |
| `plan-split` s explicitním SHA | **PASS**, výše uvedené skutečné candidate počty, all intersections empty; **NE reviewed final data**. |
| `verify` candidate | **PASS integrity/leakage**, stále `candidate_pending_human_review`, `data_split_ready=false`. |
| `freeze` s nevyplněným review | **OČEKÁVANĚ BLOKOVÁNO**, exit 2 `human_label_review_pending_or_disagreed`; finální manifest neexistuje. |
| Targeted data/format pytest | **PASS**, 36 testů; poté přidány 2 nezávislé testy skutečného candidate manifestu. |
| Plný pytest | **PASS 69 testů**, 1 stávající nepotlačený Starlette/httpx warning. |
| Diff / ignore kontrola | Pouze dataset tooling/docs/testy/text-free artefakty; frontend/backend/locky beze změn; raw/previews mimo staging. |
| Docker / deployment / model | **NEPROVEDENO**, mimo pokračování; Docker není dostupný z předchozí kontroly, žádný model ani zveřejnění. |

**Stále blokované HOTOVO:** 45 skutečných lidských label/language kontrol,
lidský zápis o odložení konfliktů a následný finální freeze. Toto plyne z
původního zadání: nezkontrolovaný label je blokátor. Agent nepředstírá lidskou
kontrolu a nedává návrh do tréninku. Návod/konkrétní soubory v
`docs/DATA_PREPARATION.md`; model ani další goal se nespouští. Lokální commit
pokračování ověřit `git log -1`, bez remote/publikování.

## Goal 01 — historie prvního běhu bez souboru (před jeho dodáním)

**HOTOVO nejsou skutečná tréninková data.** Stažení původního souboru a skutečný
lidský audit jsou nezbytné blokátory. Žádné deklarované počty vydavatele nebyly
zaměněny za naměřené. Reálný test průniku datasetu je **neproveden**, nikoli
zelený test na prázdných datech. Není vytvořen náhradní korpus ani falešný hash.

- `DATA_SOURCES.md`, `ml/sources/mendeley-v1.json`,
  `docs/data/preparation-status.json`: autoři, DOI/verze/datum, CC BY 4.0,
  skutečný původní archive URL z veřejného seznamu, explicitní tři labely,
  deklarované počty oddělené od `null` pozorovaných hodnot a konkrétní download
  blokátor. Upstream row provenance ještě není zkontrolována.
- `ml/data_prep.py`, `scripts/prepare_data.py`: bounded striktní offline CSV/ZIP
  import, SHA-256 archivu/CSV/kódu/family mapy, audit chybějících hodnot/NA markerů,
  neznámých labelů, binárních atributů, konfliktů, duplicit a script coverage.
  Latin texty se neoznačují automaticky za anglické.
- Normalizované kopie, šablony s variabilními kontakty/čísly, near-copy
  (Jaccard/SequenceMatcher) a doložené rodiny se sjednocují před splitováním.
  Celé konfliktní skupiny jsou odloženy. Časová/kampaňová metadata z popisu
  nedostupná; nedetekované parafráze/překlady jsou přiznané omezení.
- Výběr ≥15 každé třídy, lokální plain-text preview s rozbitými odkazy/markup a
  prázdná lidská review pole. Freeze bez potvrzení 45 skutečných kontrol,
  jazyka/atribuce a případného odložení odmítne. Všechny review rodiny jsou train.
- Seed 20261010, přibližně 70/15/15 stratifikované skupinové dělení, povinné
  zastoupení tříd a limit odchylky, hashovaný text-free manifest. Opakovaný
  identický výstup je povolen; přepsání různých bajtů se odmítá.
- České JSONL schéma/nezávislé instrukce; překlady musí mít původ a stejnou
  rodinu, autor si nemůže sám potvrdit český label. Blind sada zatím nevytvořena.
- Oddělené vlastní public demo fixtures v `tests/fixtures/demo_messages.json`,
  `.invalid`, bez ground-truth labelů. Žádný raw korpus v UI/demu/commitu.

### Skutečně provedené příkazy Goal 01

macOS arm64, Python 3.13.1 / Unicode 15.1.0; finální kontroly kolem 20:08 Praha
10. 10. 2026. Žádná nová závislost ani globální instalace.

| Příkaz / kontrola | Skutečný výsledek |
|---|---|
| `git status --short` před změnami | Exit 128, repo neexistovalo. 54 původních souborů zachyceno hash snapshotem mimo projekt. |
| Read-only origin page/API/archive GET | HTTP 403; veřejný browser seznam ukázal přesný původní archive URL. Browser download timeout 30 s. Žádné přihlášení/obcházení. |
| `.venv/bin/python scripts/fetch_dataset.py` | **BLOKOVÁNO**, exit 2: `http_error`, `http_status=403`. Žádný soubor získán. |
| `.venv/bin/python scripts/prepare_data.py audit --input ml/data/raw/Dataset_5971.zip` | **BLOKOVÁNO**, exit 2: `file_missing`. Žádný skutečný audit ani split. |
| `.venv/bin/python -m pytest tests/test_data_prep.py tests/test_czech_format.py -q` | Průběžně 30 testů prošlo; přidané 4 další testy poté zahrnuty v níže uvedeném plném běhu (celkem 34 data/format). |
| `.venv/bin/python -m pytest -q` | **PASS: 65 testů**, 1 existující Starlette/httpx deprecation warning; varování nebylo potlačeno. |
| Audit/freeze/verify CLI round-trip v pytest | **PASS na fiktivním korpusu**: 100 každé třídy → 70/15/15 každé třídy; všechny průniky ID/skupin/textových/normalizovaných/template hashů prázdné. Změna manifestu odmítnuta. |
| `.venv/bin/python -m pip check` | **PASS**, No broken requirements found. |
| `.venv/bin/python scripts/export_contract.py --check` | **PASS**, OpenAPI contract matches backend. |
| `npm --prefix frontend run build` | **PASS**, `tsc --noEmit` + Vite 8.3.4, 18 modules. |
| Původní soubory vs SHA snapshot + diff | Jen README.md, ml/README.md a aktuální STATUS mají zamýšlené změny. AGENTS/plán/rešerše/acceptance, frontend/backend/locky zachovány. |
| Docker build/run | **NEPROVEDENO**, Docker CLI/daemon nejsou dostupné podle Goal 00; v tomto datovém kroku se netvrdí úspěch kontejneru. |
| Skutečný Mendeley leak test / label kontrola / manifest | **NEPROVEDENO**, chybí raw vstup a 45 skutečných lidských kontrol. |
| `git init -b main` | **PASS**, výslovný požadavek aktuálního goalu na lokální commit; žádný remote/publikování. |

### Konkrétní další příkaz po získání původního souboru

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip --output ml/data/mendeley-v1
```

Po lidské kontrole teprve `freeze --expected-sha256 … --review …` a `verify`
podle `docs/DATA_PREPARATION.md`. Doplnit naměřené hash/počty, nezveřejnit raw
texty a doložit nevyřešenou source lineage/jazyky. Tento krok **netrénuje model**
a nepokračuje do Goal 02.

## Goal 00 — historie dokončené kostry

- `frontend/`, `backend/`, `ml/`, `tests/`, `docs/`, `scripts/`; CZ/EN formulář,
  skutečný fetch, bezpečné chybové stavy a přiznání neprovedené kontroly.
- Samostatný `message_language` (`auto/cs/en/other`); UI jazyk se neposílá do API.
  `auto` nyní znamená nezadáno, ne automaticky rozpoznaný jazyk. EN texty jsou
  přijímány, modelový výkon není ověřen v žádném jazyce.
- `POST /api/analyze`, `GET /api/health`, `/api/openapi.json`. Kontrakt rezervuje
  `suspicious/review/no_strong_signals`, evidence s původem, action/limitation keys,
  verze modelu/policy/kontraktu a pouze pevné share-summary keys.
- Limit 2 000 Unicode code points; prázdné/bílé vstupy odmítnuty. Tělo nejvýše
  32 KiB včetně JSON, kontrola streamu i při chybějícím/nepravdivém Content-Length.
  Dlouhý text se nezkracuje. Zamítnuté vstupy mají `analysis_complete=false`.
- Pevné chyby bez textu/Pydantic input/loc/ctx; no-store, no-referrer, nosniff, CSP.
  Žádné HTML vykreslení zprávy, návštěva jejího odkazu, storage, cookies, analytika,
  externí LLM ani odchozí síť při zpracování. Text jen v RAM vlastního backendu.
- Launcher vypíná access log a má limit 32 souběžných spojení v jednom procesu.
  Nativní tracing/metriky/logy/autokonfigurace FastAPI jsou výslovně vypnuty,
  i při `FASTAPI_OTEL_AUTO_CONFIGURE=true`. OpenTelemetry API je povinná transitivní
  závislost této FastAPI; žádné SDK, exporter ani instrumentace nebyly přidány.
- Jeden multi-stage Dockerfile: frontend build → neprivilegovaný Python proces
  servírující frontend i API. Jeho skutečné sestavení nebylo možné ověřit.
- README s install/dev/test/build/Docker příkazy, docs/API.md se sdíleným kontraktem.
  Původní README zůstalo **bajtově shodné** v docs/PLANNING_NOTES.md.

## Skutečně provedené příkazy a výsledky

Běhy na macOS arm64; poslední úplný testovací běh začal 10. 10. 2026 v 19:36 Praha.

| Příkaz | Výsledek |
|---|---|
| `git status --short` | Exit 128: není Git repozitář. Commit přeskočen. |
| `node --version`, `npm --version`, `python3 --version` | 25.8.2, 11.11.1, Python 3.13.1. |
| `python3 -m venv .venv` | Prošlo; pouze lokální prostředí. |
| `.venv/bin/python -m pip install -r backend/requirements-dev.in` | Prošlo; vstupní řešení přesných přímých verzí. |
| `.venv/bin/python scripts/lock_dependencies.py` | Prošlo; 14 runtime + 8 výhradně dev balíčků, přesné verze a SHA-256 wheelů z PyPI. Pouze explicitní setup, nikdy request. |
| `.venv/bin/python -m pip install --only-binary=:all: --require-hashes -r backend/requirements-dev.txt` | Prošlo; již instalované stejné verze. |
| `python3 -m venv .cache/venv-check` | Prošlo; nové projektové kontrolní prostředí. |
| `.cache/venv-check/bin/python -m pip install --only-binary=:all: --require-hashes -r backend/requirements-dev.txt` | Prošlo; čistá instalace včetně ověření hashů, bez zdrojového buildu. |
| `npm install --prefix frontend --no-audit --no-fund` | Prošlo; vytvořen package-lock.json. |
| `npm ci --prefix frontend --no-audit --no-fund` | Prošlo z locku. Žádná globální instalace. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" frontend/node_modules/.bin/playwright install chromium` | Prošlo; Chromium 156.0.8078.4 / Playwright revision 1248, projektová cache. |
| `.venv/bin/python scripts/export_contract.py` | Prošlo; vytvořen OpenAPI snapshot. |
| `npm --prefix frontend run contract:generate` | Prošlo; TypeScript z OpenAPI. |
| `sh scripts/test.sh` | **Finální běh exit 0**; všechny následující kontroly prošly. |
| `.venv/bin/python -m pip check` | `No broken requirements found.` |
| `.venv/bin/python scripts/export_contract.py --check` | `OpenAPI contract matches backend.` |
| `npm --prefix frontend run contract:check` | Prošlo; generované TS typy aktuální. |
| `.venv/bin/python -m pytest -q` | **31 passed**, jeden nepotlačený StarletteDeprecationWarning. |
| `npm --prefix frontend test` | **13 passed**. |
| `npm --prefix frontend run build` | TypeScript prošel; Vite 8.3.4 build prošel, JS 228.78 kB / gzip 72.30 kB. |
| `npm --prefix frontend run test:e2e` | **12 passed**: 6 proti skutečnému jednomu serveru + 6 přes Vite proxy; finální běh 4.7 s. |
| `sh -n scripts/install.sh scripts/test.sh` | Shell syntax prošla. Install skript odpovídá výše ověřeným krokům; nebyl spuštěn samostatně jako celek. |
| `.venv/bin/python scripts/serve.py --port 7860` | Lokální build spuštěn na 127.0.0.1:7860 pro náhled; skutečný browser POST HTTP 200, review, neprovedená analýza, no-store. |
| `npm ls --prefix frontend --depth=0` | Přímé verze odpovídají locku. Navíc nalezeny nepoužívané prázdné adresáře s příponou ` 2` označené npm jako extraneous; nepatří do locku/build kontextu. |
| `hf --help` | Selhalo v existující globální instalaci: `Typer.__init__()` nezná `suggest_commands`. Nic se neopravovalo globálně; účet nebyl dotazován. |

Backendové testy pokrývají chybějící model, EN/CZ/other, prázdný a dlouhý text,
Unicode limit, neplatné typy/extra fields/JSON, no-store, body limit i stream,
pevnou vnitřní chybu, canary bez úniku do odpovědi/stdout/stderr/logů,
zablokované DNS a socket connect, bezpečnostní invariant výsledku, schéma a static serving.

Vitest pokrývá limity a drift vůči OpenAPI, POST tělo, chybějící model,
odmítnutí falešných výsledků, zákaz requestu při invalidním vstupu a privátní chyby.
Playwright ověřuje skutečné API, oddělení UI/message language, empty/overlong,
síťovou chybu, vadný payload, mobil/klávesnici a inertní HTML. Normální průchod
nemá mock odpovědi; mocks jsou pouze v testech chybových stavů. Zkontrolovány
cookies/storage a nulové externí browser requesty. E2E traces/video jsou vypnuté.

## Selhání během práce — opravena, nejsou vydávána za úspěch

- První `npm --prefix frontend run build`: exit 2; dvě chybějící jazykové hodnoty
  v testech a rozlišení Playwright importu z vnějšího testového adresáře. Testy
  upraveny, E2E přesunuto pod frontend/tests, další build i finální script prošly.
- První celý `sh scripts/test.sh`: backend, Vitest a build prošly, E2E skončilo
  s 12 launch failures. Relativní PLAYWRIGHT_BROWSERS_PATH se vyhodnotilo proti
  jiné pracovní cestě. Opraveno na absolutní cestu v npm skriptu; všech 12 E2E
  v následném i finálním běhu prošlo. Testy ani bezpečnostní kontroly nebyly vypnuty.

## Kontrola změn / vizuální ověření

Protože není Git, před změnami vznikl dočasný snapshot 17 původních souborů.
Porovnání hashů potvrdilo zachování všech původních podkladů kromě zamýšlených
úprav README a STATUS. Nové zdrojové soubory a změna README byly prohlédnuty
jako unified diff; generované typy/schéma ověřeny kontrolou driftu, locky čistou
instalací. Žádné cizí existující implementační změny nebyly přepsány.

Desktopový formulář a mobilní výsledek byly vizuálně prohlédnuty z lokálního buildu.
360 px: žádný horizontální přesah, žádná pageerror, label/focus/klávesnice fungují.
Poměry kontrastu změřeny sRGB výpočtem pro hlavní používané textové kombinace:
10.78:1 (text/pozadí), 6.07:1 (sekundární text), 4.67:1 (placeholder),
11.76:1 (tlačítko), 9.52:1 (stav), 7.39:1 (chyba). Není to úplný audit WCAG.

Závěrečná kontrola zpřesnila invariant výsledku: dokončený `no_strong_signals`
nesmí mít ani prázdnou/bílou verzi modelu. Po této změně znovu proběhlo
`.venv/bin/python -m pytest -q` (**31 passed**) a obě kontroly kontraktu (**prošly**).
Frontend a schéma se touto kontrolou neměnily. Závěrečný hash check původních
souborů potvrdil změny pouze README.md a docs/STATUS.md.

## Neprovedené kontroly a zbývající omezení

- **Docker build/run/healthcheck netestovány:** `docker` není v PATH. Nebyl
  instalován Docker ani měněn daemon. Přesné příkazy pro stroj s Dockerem jsou v README.
  Registry čtení ověřilo manifesty Node 24 a Python 3.13 a zafixovalo jejich digesty;
  architekturní kompatibilita image/npm/native wheelů zatím nebyla spuštěním ověřena.
- **Veřejné nasazení a účet nepotvrzeny:** `.git/config`, `.vercel/project.json`,
  vercel.json, fly.toml, render.yaml, railway.json/toml a compose.yaml chyběly.
  HF cache existuje, ale její existence neprokazuje účet/oprávnění/placený plán.
  Tokeny se nečetly; nebyly volány remote identity/billing endpointy. Globální HF CLI
  je rozbité a nebylo obcházeno. Žádná cílová adresa nebyla schválena.
- **Commit nevznikl:** neexistuje Git repo. Současný zdroj není verzovaný lokálním
  commitem; žádné nové repo ani veřejné repo se automaticky nezakládalo.
- **Model a kvalita:** bez modelu, pravidel, dat, metrik a jazykové detekce.
  Žádný skutečný tokenový limit ani inference concurrency zatím nelze měřit.
  Před ML integrací musí být ověřen hash, jazyky, úplné pokrytí a limit souběhu.
- **Provoz:** HTTPS/proxy/hosting logy nebyly ověřeny; současná pravdivá tvrzení
  platí pro tento kód a jeho lokální launcher. Server vrací no-store; browser pole
  drží právě vložený text v RAM do obnovení/zavření stránky.
- **Testovací warning:** Starlette 1.7.0 označuje httpx 0.28.1 TestClient za deprecated.
  Funguje a není potlačen; případný přechod na httpx2 vyžaduje vědomé ověření.
  Playwright navíc hlásil neškodný konflikt NO_COLOR/FORCE_COLOR z prostředí nástrojů.
- Testy proběhly v Chromium/macOS arm64. Firefox/Safari, plný 200% zoom/čtečka,
  lidské testy, kompletní privacy/ML/UX přejímka a čistý Docker patří do dalších goalů.

## Jak stav reprodukovat

```sh
sh scripts/install.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" frontend/node_modules/.bin/playwright install chromium
sh scripts/test.sh
.venv/bin/python scripts/serve.py --port 7860
```

Otevřít http://127.0.0.1:7860, vložit fiktivní krátký text a stisknout tlačítko.
Očekávat skutečný POST a „Kontrola neprovedena / Model zatím není připraven“.
Další připravené zadání je Goal 01 (data); **nebylo zahájeno**.
