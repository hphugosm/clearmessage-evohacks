# 01 — Legálně použitelné, zkontrolované a rozdělené podklady

Celý následující blok vlož do Codexu, nebo ho nech načíst z tohoto souboru.

```text
/goal Připrav reprodukovatelná tréninková data pro Klidnou zprávu. Dodrž AGENTS.md a docs/RESEARCH.md; cílem je doložený dataset a neměnné train/validation/test dělení, nikoli natrénovaný model.

Začni původním Mendeley zdrojem DOI 10.17632/f45bkkt8pr.1: https://data.mendeley.com/datasets/f45bkkt8pr/1 . Ověř dostupnost raw souboru, licenci a význam labelů. Do DATA_SOURCES.md zaznamenej autory, URL, verzi, datum, licenci, hash a skutečné počty řádků/tříd. CSV načítej jako data. Nespouštěj trust_remote_code ani cizí skripty a neotvírej odkazy obsažené ve zprávách. Při omezení stahování nepředstírej úspěch: připrav import lokálního souboru a přesně dolož blokátor. Nezaměňuj SMS spam dataset za phishing ground truth.

Zachovej tři třídy ham/spam/smishing s explicitním mapováním. Proveď audit chybějících hodnot, konfliktů, duplicity a jazyků; připrav výběr nejméně 15 záznamů z každé třídy pro lidskou kontrolu. Neukazuj raw nebezpečné odkazy jako klikatelné prvky. Nevystavuj potenciálně nevhodný obsah z datasetu v uživatelských demopříkladech.

Seskup normalizované duplicity, blízké kopie a identifikovatelné šablony; teprve pak vytvoř přibližně 70/15/15 stratifikované skupinové splity s pevným seedem a manifestem. Žádná skupina nesmí překročit hranice splitu. Reportuj nedostupnost metadat pro časové/kampaňové dělení. Nepřidávej jiné korpusy jen pro vyšší počet řádků.

Připrav formát českého development a blind-challenge souboru a instrukce pro jejich nezávislé vytvoření/kontrolu. Samotné challenge odpovědi zatím nepoužívej pro vývoj. Syntetické příklady a překlady označ původem a drž rodiny spolu. Veřejné demo fixture zprávy ulož odděleně a používej inertní .invalid domény.

HOTOVO: import a validační testy fungují; manifesty, licence, hash a audit jsou dohledatelné; test průniku skupin je prázdný. Nestažený soubor či nezkontrolovaný label je blokátor, nikoli splněná položka. Aktualizuj STATUS.md, uveď konkrétní příkaz pro tréninková data a vytvoř lokální commit. Model ještě netrénuj.
```
