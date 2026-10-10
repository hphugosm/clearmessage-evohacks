# 00 — Základ a jeden skutečný průchod

Celý následující blok vlož do Codexu, nebo ho nech načíst z tohoto souboru.

```text
/goal Vytvoř ověřitelnou kostru aplikace Klidná zpráva podle AGENTS.md a docs/PROJECT_PLAN.md. Cílem tohoto kroku není hotový detektor, ale spustitelná aplikace se stabilním API kontraktem a pravdivým stavem „model není připraven“.

Nejdříve prohlédni aktuální repozitář a zachovej cizí změny. Použij React + TypeScript + Vite pro frontend a FastAPI + Pydantic pro backend. Jeden Docker kontejner bude obsluhovat frontend build i API. Bez databáze, přihlášení, externího LLM, analytics a přístupu do schránky. Zafixuj skutečně ověřené verze závislostí; neinstaluj globálně.

Vytvoř malou strukturu frontend/, backend/, ml/, tests/, docs/, scripts/. Definuj POST /api/analyze, GET /api/health a sdílený popis schématu. Odpověď musí rozlišovat status suspicious/review/no_strong_signals, analysis_complete, evidence, action keys, limitations a verze modelu/policy. Počítej s EN texty. Jazyk zprávy není jazyk UI.

Na úvodní obrazovce stačí označené textové pole a tlačítko. Skutečně zavolej backend. Dokud není model, vracej viditelný review/model_not_ready nebo odpovídající stav neprovedené analýzy, nikdy falešný výsledek. Přidej limity vstupu, chyby bez echo privátního obsahu, no-store a základ testů. Mock data dovol jen v testech.

Připrav dokumentované příkazy pro install, dev, test, build a Docker. Ověř dostupnost případného deployment účtu jen čtením existující konfigurace; nic nezveřejňuj, nepořizuj předplatné a nesbírej přihlašovací údaje. Nedostupný Docker daemon zaznamenej jako netestovanou kontrolu, ne úspěch.

HOTOVO: frontend skutečně komunikuje s API; prázdný/příliš dlouhý vstup a chybějící model mají testy; dostupné build/test kontroly proběhly. Uveď přesné příkazy, aktualizuj docs/STATUS.md a vytvoř lokální commit, je-li to v tomto repu povoleno. Nepokračuj do dalšího goal.
```
