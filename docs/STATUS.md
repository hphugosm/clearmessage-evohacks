# Stav projektu

Poslední změna: **10. 10. 2026, Europe/Prague — Goal 01 datové nástroje ověřeny,
skutečný dataset BLOKOVÁN.** Goal 00 zůstává funkční kostrou; model není připraven.
Původní raw soubor vrací 403, skutečné hash/počty/label audit/split nejsou hotové.
Goal 02 (trénink) nebyl zahájen.

| Oblast | Stav | Důkaz / blokátor |
|---|---|---|
| Pravidla a harmonogram | Původní podklady zachovány | AGENTS.md, PROJECT_PLAN.md, RESEARCH.md, ACCEPTANCE.md a prompty beze změn. Reuse stále čeká na vyjasnění pořadatelem. |
| Frontend / API | Ověřeno lokálně | Skutečný POST přes Vite proxy i frontend build servírovaný FastAPI; 12 Playwright testů. |
| Kontrakt | Ověřeno | Pydantic → docs/openapi.json → generovaný TypeScript; kontroly driftu prošly. |
| Model | Není připraven | `review`, `analysis_complete=false`, `headline_key=model_not_ready`, prázdná evidence, `model_version=null`. |
| Testy / build | Dostupné kontroly prošly | Aktuálně 65 pytest (31 API + 34 data/format), pip check, OpenAPI check a TypeScript/Vite build. 13 Vitest + 12 Playwright z Goal 00 v tomto datovém kroku znovu nespouštěny. |
| Docker | Připraven, neověřený build/run | Docker CLI ani daemon nejsou dostupné; base image manifesty/digesty ověřeny pouze čtením registry. |
| Deployment účet | Nepotvrzen | Žádná existující projektová konfigurace s cílovým účtem/serverem; globální HF CLI nefunguje. |
| Veřejné nasazení | Neprovedeno | Žádné publikování, platby ani čtení přihlašovacích údajů. |
| Dataset | BLOKOVÁN | Metadata Mendeley V1/CC BY 4.0 ověřena, raw download HTTP 403 / browser timeout; skutečné počty/hash/45 lidských review/split chybí. DATA_SOURCES.md. |
| Datové nástroje | Ověřeno na fiktivních datech | CSV/ZIP import → audit → lidský review gate → deterministické skupiny/splity → verify; nulové průniky v testech, žádný skutečný manifest. |
| České development / challenge | Pouze formát a postup | Pydantic + JSON Schema, nezávislá tvorba/kontrola, rodiny/provenance; 0 skutečných příkladů. Blind odpovědi nečteny. |
| Trénink | Nezahájen | Žádný model, artefakt, metriky, sklearn ani encoder. |
| Git / commit | Lokální repo | Na výslovný požadavek commitu v Goal 01 založen nový Git, bez remote. Lokální commit tohoto kroku ověřit `git log -1`; původní soubory zahrnuty, raw/cache ignorovány. |
| Devpost / video / OCR / sdílení | Nezahájeno | Mimo Goal 00. |

## Goal 01 — co bylo připraveno a co zůstává blokované

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
