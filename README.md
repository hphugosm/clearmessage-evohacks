# Klidná zpráva — EVOHACKS 2026

Skutečný lokální tok: React + TypeScript + Vite → FastAPI/Pydantic → náš
Goal02 TF-IDF + LogisticRegression → pozorovaná textová pravidla → CZ/EN rady
a neutrální prosba o pomoc. Backend servíruje frontend build i API v jednom procesu.

**Model je provizorní, audit není dokončen a jazykový výkon není ověřen.**
Aktuální API může vydat `suspicious` se skutečným podkladem nebo `review`, vždy
`analysis_complete=false`. Nevydává `no_strong_signals`, procenta ani záruky
bezpečnosti. Bez modelu přizná `model_not_ready/rules_only`. [Policy](docs/POLICY.md)
a [model card](docs/MODEL_CARD.md) popisují rozsah, zdroje, metriky a licence.

Čeština je výchozí UI, angličtina překlad. Jazyk zprávy se nastavuje samostatně.
Žádná databáze, účet, historie, analytika, externí LLM ani přístup do schránky.
Zprávy se zpracují jen v RAM našeho backendu; žádné odchozí síťové dotazy při
analýze. Sdílení vyžaduje náhled a další lidské gesto, přebírá jen pevné věty.

## Požadavky

- Python **3.13**; ověřeno na 3.13.1 / macOS arm64.
- Node **24 nebo 25**; ověřeno na 25.8.2 s npm 11.11.1. Balíčky podporují i
  další verze podle `frontend/package.json`; ty zde nebyly ověřeny.
- Docker s běžícím daemonem jen pro kontejner. Na vývojovém stroji nebyl Docker
  nainstalovaný; Docker build/run jsou **neověřené**.
- Internet při explicitní instalaci balíčků a testovacího Chromium. Analýza
  žádné odchozí spojení neprovádí.

Všechny následující příkazy spouštějte z kořene projektu. Závislosti se instalují
jen do `.venv`, `frontend/node_modules` a testovací prohlížeč do `.cache`.

## Install

```sh
sh scripts/install.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" frontend/node_modules/.bin/playwright install chromium
```

Python runtime i testovací závislosti jsou v `backend/requirements*.txt`
zafixované včetně SHA-256 hashů wheelů. npm používá `frontend/package-lock.json`
s integritami; přímé závislosti mají přesné verze. `.in` soubory jsou vstupem pro
vědomý update, nikoli běžnou instalací. Verze a ověření: [STATUS](docs/STATUS.md).

## Dev — dva terminály

Backend:

```sh
.venv/bin/python scripts/serve.py
```

Frontend:

```sh
npm --prefix frontend run dev
```

Otevřete [lokální frontend](http://127.0.0.1:5173). Vite proxy předává `/api` na
port 8000. Žádné CORS ani externí adresy nejsou potřeba. Nevkládejte skutečné
heslo ani kód. Pro ověření stačí vlastní fiktivní text: po kliknutí musí přijít
skutečná odpověď API a viditelná informace o omezené analýze.

## Test

```sh
sh scripts/test.sh
```

Příkaz kontroluje závislosti, shodu OpenAPI/TypeScript, backend, klienta, build
a Playwright průchod v obou režimech: build servírovaný FastAPI a Vite proxy.
Porty 8000 a 5173 musí být volné; E2E nepřebírá cizí běžící servery.
Testy používají pouze fiktivní texty a inertní `.invalid` adresy.
Browser traces, video a automatické screenshoty jsou vypnuté.

## Tréninková data — importovaná, lidská kontrola čeká

Zdroj/licence a skutečný stav: [DATA_SOURCES.md](DATA_SOURCES.md). Offline import,
audit, lidská kontrola a následné neměnné 70/15/15 skupinové dělení:
[DATA_PREPARATION.md](docs/DATA_PREPARATION.md). Vlastní provizorní model a
reprodukovatelný trénink popisují [MODEL_CARD.md](docs/MODEL_CARD.md) a
[ML instrukce](ml/README.md). V tomto kroku se žádný další model netrénuje.

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3
.venv/bin/python -m pytest tests/test_data_prep.py tests/test_czech_format.py -q
```

Původní soubor je nyní uložen v ignorovaném `ml/data/raw/` a obsahuje 5 971
záznamů (4 844 ham / 489 spam / 638 smishing). Po odložení 98 řádků z 46
konfliktních skupin má návrh 5 873 záznamů a prázdné průniky skupin. Candidate
manifest je neměnný, ale **`data_split_ready=false`**. Finální freeze vyžaduje
45 skutečných lidských kontrol a schválení odložení. Raw texty/preview se
necommitují. Automatický download v minulém kroku vracel 403; nový checkout
potřebuje původní soubor získat stejným explicitním lokálním importem. České development/blind soubory mají zatím pouze formát a nezávislé
instrukce, žádné skutečné odpovědi nebyly použity.

## Jednotlivé kontroly

```sh
.venv/bin/python -m pytest -q
npm --prefix frontend test
.venv/bin/python scripts/export_contract.py --check
npm --prefix frontend run contract:check
npm --prefix frontend run build
npm --prefix frontend run test:e2e
```

Starlette 1.7.0 při použití testovacího httpx 0.28.1 vypisuje deprecation warning.
Testy fungují; warning není potlačen. Přechod testovacího klienta je úkol pro
pozdější vědomou aktualizaci závislostí.

## Build — jeden lokální proces

```sh
npm --prefix frontend run build
.venv/bin/python scripts/serve.py --port 7860
```

Otevřete [lokální build](http://127.0.0.1:7860). Tento launcher vypíná access log,
má omezený souběh a servíruje HTML/JS/CSS i `/api` ze stejného originu.
`FRONTEND_DIST` lze nastavit na jinou cestu k buildu. Bez buildu vrací `/` 404;
API stále funguje. Health endpoint rozlišuje službu od připravenosti modelu:

```sh
curl --fail http://127.0.0.1:7860/api/health
curl --fail http://127.0.0.1:7860/api/analyze \
  -H 'Content-Type: application/json' \
  --data '{"text":"Fictional message: meeting at school tomorrow.","message_language":"en"}'
```

## Docker — připraveno, build/run zatím neověřeno

```sh
.venv/bin/python scripts/prepare_model.py
docker info
docker build --tag klidna-zprava:analysis .
docker run --rm --name klidna-zprava --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m --cap-drop ALL \
  --security-opt no-new-privileges --memory 512m --cpus 1 \
  -p 127.0.0.1:7860:7860 klidna-zprava:analysis
```

Jeden finální kontejner, neprivilegovaný uživatel 10001, port 7860, jeden Uvicorn
proces. Node sestaví frontend jen v první fázi. Finální image neobsahuje Node,
testy, raw data ani encoder. Obsahuje hashově ověřený vybraný sparse model. Base images jsou zafixované registry digesty. Jejich
dostupnost byla ověřena čtením registry; to není důkaz sestavení kontejneru.
Healthcheck testuje běh služby, nikoli dostupnost detektoru.

## Kontrakt, soukromí a stav

[API kontrakt](docs/API.md) popisuje `POST /api/analyze`, `GET /api/health`,
limity a chybové stavy. Strojově čitelné schéma: `docs/openapi.json` a živé
`/api/openapi.json`. Text zprávy se posílá v těle POST, zpracuje se v RAM našeho
backendu a neukládá se do logů/historie/tréninku. Nejde o zpracování pouze
v prohlížeči. Všechny backendové odpovědi mají `no-store`.

Žádný účet pro nasazení ani veřejná cílová adresa nebyly potvrzeny. Existující
projektová konfigurace neobsahovala vazbu na poskytovatele; nebyly čteny tokeny,
pořizovány platby ani publikován obsah. Veřejné nasazení potřebuje samostatné
explicitní schválení uživatele a ověření logování/HTTPS hostingu.

Projekt je nyní lokální Git repozitář; každý aktuální goal má lokální commit,
bez zveřejnění.
Původní README je beze změn zachováno jako [plánovací poznámky](docs/PLANNING_NOTES.md).
Plán a pravidla zůstávají v [PROJECT_PLAN](docs/PROJECT_PLAN.md),
[RESEARCH](docs/RESEARCH.md), [ACCEPTANCE](docs/ACCEPTANCE.md) a `AGENTS.md`.
Skutečné výsledky a neprovedené kontroly jsou v [STATUS](docs/STATUS.md).

## Příprava artefaktu a ověření skutečné analýzy

```sh
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/verify_analysis.py
.venv/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
```

`prepare_model.py` offline zkontroluje vybraný artefakt a report Goal02, pak
připraví ignorovaný `build/model.json` pro Docker. Nic netrénuje ani nestahuje.
Artefakt `ml/artifacts/goal02-provisional-v2/tfidf_c2.0.json` není v Gitu:
nový checkout jej musí obnovit z vlastního důvěryhodného Goal02 výstupu podle
zaznamenaného SHA. Bez něj API funguje jen v přiznaném rules-only režimu a
příprava image s modelem selže; nejde o dokončený detektor. Pokyny reprodukce
Goal02 mají explicitní provizorní autorizaci, ne schválený finální freeze.

`verify_analysis.py` uloží měřené výsledky vlastních fiktivních development
příkladů v `ml/reports/goal03-integration.json`, bez textů. Nejde o skutečnou
CZ/EN validaci, held-out data ani blind challenge. Základní modelové metriky
zůstávají reportem Goal02; v Goal03 se nedolaďují. Model artefakt při analýze
nikdy nezmění ani nestahuje. Další goal se automaticky nezahajuje.
