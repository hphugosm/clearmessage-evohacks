# Klidná zpráva — EVOHACKS 2026
## Plán a zadání pro Codex, nikoli hotová aplikace

Vytvořeno 10. října 2026. Jazyk produktu: primárně čeština, anglické UI pro porotu.
Pracovní název není ověřená ochranná známka. Balíček neobsahuje natrénovaný model,
stažený dataset ani implementaci aplikace. Obsahuje konkrétní implementační zadání.

**Cíl:** pomoci lidem, zejména seniorům a dětem, porozumět podezřelé krátké zprávě
bez technických znalostí. Vloží text, dostanou srozumitelné varování nebo přiznání
nejistoty, důvody a bezpečný další postup. Aplikace nikdy nepotvrzuje bezpečnost.

## Jak začít

1. Otevři nový prázdný repozitář v Codexu a zkopíruj do něj obsah tohoto adresáře.
   V existujícím repozitáři nejdříve porovnej soubory; zejména nepřepisuj existující
   AGENTS.md ani README bez sloučení s dosavadními pravidly.
2. Přečti `docs/PROJECT_PLAN.md`. Připrav si odpověď organizátora na využití
   veřejných dat, předtrénovaných modelů a open-source komponent; otázka je níže.
3. Postupně spouštěj prompty z `prompts/00_foundation.md` až `08_submission.md`.
   Jejich souhrn najdeš v `CODEX_GOALS.md`. Goal 06 je výslovně nepovinný.
4. Po každém kroku si nech předvést aplikaci nebo skutečný výstup testů, prohlédni
   diff a nech vytvořit lokální commit. Zelené testy nejsou náhradou kontroly textů.
5. Udržuj `docs/STATUS.md`; právě ten dovolí navázat v novém chatu bez opakování
   celého vývoje. Nespouštěj několik zapisujících agentů nad stejnými soubory.

Příklad spuštění po vložení balíčku do repozitáře:

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/00_foundation.md.
Skonči po splnění jeho akceptačních kritérií nebo po doložení skutečného blokátoru.
```

## Termíny v Europe/Prague

Pravidla: neděle **11. 10. 2026, 20:59**. Hlavička Devpostu uvádí 21:00;
počítáme s dřívějším termínem. **Náš cíl pro odevzdání je 19:00.**
Živé hodnocení je podle pravidel v neděli 21:00–22:00.

Otázka organizátorům, kterou odešli sám na oficiálním Discordu:

> May we use public labeled datasets, pretrained sentence embeddings, open-source
> UI components and Codex, with all application code and classifier training
> completed during the event and all reused resources disclosed?

Pravidla požadují novou práci během akce, ale nevymezují jasně výjimku pro tyto
podklady. Jejich použití zde je navržené, nikoli předem schválené organizátorem.

## Obsah

- `docs/PROJECT_PLAN.md` — produkt, harmonogram, architektura, ML a záložní scénáře.
- `docs/RESEARCH.md` — ověřené zdroje, licence, omezení a co převzít.
- `docs/ACCEPTANCE.md` — funkční, ML, bezpečnostní a uživatelské přejímací testy.
- `docs/STATUS.md` — stav vývoje; záměrně vše zatím neověřeno.
- `AGENTS.md` — stálá pravidla pro Codex.
- `prompts/` — devět samostatných zadání, z toho OCR je bonus.
- `CODEX_GOALS.md` — všechny prompty v jednom souboru.

Zdroje byly prozkoumány na úrovni primárních popisů, modelových karet a dokumentace.
Stažení souborů, audit skutečných řádků z hlavního datasetu, běh závislostí a výsledky
trénování jsou úkoly realizace. Žádná přesnost ani latence zde není naměřeným výsledkem.
