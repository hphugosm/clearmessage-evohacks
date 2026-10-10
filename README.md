# Klidná zpráva — EVOHACKS 2026

Spustitelná kostra z Goal 00. React + TypeScript + Vite skutečně volá FastAPI +
Pydantic. Backend umí v jednom procesu obsloužit frontend build i API.
**Model není připraven; žádná zpráva zatím neprochází klasifikací.** Platný vstup
vrátí `review / model_not_ready`, `analysis_complete: false`, bez nálezů a bez
procent. Výstup nepotvrzuje bezpečnost zprávy.

Čeština je výchozí UI, dostupný je anglický překlad. Jazyk zprávy se nastavuje
samostatně. Neexistuje důkaz modelového výkonu v češtině ani angličtině.
Žádná databáze, účet, historie, analytika, externí LLM ani přístup do schránky.
Sdílení, OCR a ML trénink patří do pozdějších samostatných goalů. Datové nástroje
jsou připravené, ale původní dataset a lidský audit zatím blokuje nedostupný
download. Není vytvořen reálný split ani natrénován model.

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
skutečná odpověď API a viditelná informace „Kontrola neprovedena“.

## Test

```sh
sh scripts/test.sh
```

Příkaz kontroluje závislosti, shodu OpenAPI/TypeScript, backend, klienta, build
a Playwright průchod v obou režimech: build servírovaný FastAPI a Vite proxy.
Porty 8000 a 5173 musí být volné; E2E nepřebírá cizí běžící servery.
Testy používají pouze fiktivní texty a inertní `.invalid` adresy.
Browser traces, video a automatické screenshoty jsou vypnuté.

## Tréninková data — bez tréninku, aktuálně blokovaná

Zdroj/licence a skutečný stav: [DATA_SOURCES.md](DATA_SOURCES.md). Offline import,
audit, lidská kontrola a následné neměnné 70/15/15 skupinové dělení:
[DATA_PREPARATION.md](docs/DATA_PREPARATION.md). Žádné nové ML závislosti.

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip --output ml/data/mendeley-v1
.venv/bin/python -m pytest tests/test_data_prep.py tests/test_czech_format.py -q
```

První příkaz vyžaduje původní soubor. V tomto prostředí download vrací HTTP 403;
bez něj příkaz správně skončí `file_missing`, nikoli úspěšným auditem. Freeze
vyžaduje skutečný hash a 45 potvrzených lidských kontrol. Raw texty/preview se
necommitují. České development/blind soubory mají zatím pouze formát a nezávislé
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
docker info
docker build --tag klidna-zprava:foundation .
docker run --rm --name klidna-zprava --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m --cap-drop ALL \
  --security-opt no-new-privileges --memory 256m --cpus 1 \
  -p 127.0.0.1:7860:7860 klidna-zprava:foundation
```

Jeden finální kontejner, neprivilegovaný uživatel 10001, port 7860, jeden Uvicorn
proces. Node sestaví frontend jen v první fázi. Finální image neobsahuje Node,
testy, data ani model. Base images jsou zafixované registry digesty. Jejich
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

Adresář při zahájení nebyl Git repozitář, proto nevznikl lokální commit.
Původní README je beze změn zachováno jako [plánovací poznámky](docs/PLANNING_NOTES.md).
Plán a pravidla zůstávají v [PROJECT_PLAN](docs/PROJECT_PLAN.md),
[RESEARCH](docs/RESEARCH.md), [ACCEPTANCE](docs/ACCEPTANCE.md) a `AGENTS.md`.
Skutečné výsledky a neprovedené kontroly jsou v [STATUS](docs/STATUS.md).
