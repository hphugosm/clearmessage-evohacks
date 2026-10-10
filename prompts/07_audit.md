# 07 — Nezávislá kontrola modelu, bezpečnosti a srozumitelnosti

Celý následující blok vlož do Codexu, nebo ho nech načíst z tohoto souboru.

```text
/goal Proveď přejímací audit Klidné zprávy podle docs/ACCEPTANCE.md. Nejprve ji posuzuj jako tester, potom oprav pouze prokázané problémy. Nepřidávej nové funkce a neměň kritéria, aby testy snadněji prošly. Dodrž AGENTS.md.

Ověř čistý install/build, skutečný model, překročení tokenového limitu, krátké/nejisté vstupy, chyby služby, různorodé legitimní, spamové a podvodné zprávy. Žádné skutečné škodlivé weby. Včetně requestu na sdílení OTP bez URL, bezpečnostního upozornění „kód nikomu nesdělujte“, rodinné zprávy, školního oznámení, reklamy, Unicode a HTML/injection obsahu.

Proveď canary testy logů, storage, error response a sdílení. Zakaž egress po načtení modelu a potvrď fungování inference. Zkontroluj neklikatelné odkazy a absenci automatického sdílení. Zvlášť ověř error/timeout/OCR failure tak, aby nikdy nevznikl uklidňující výsledek.

Otevři oddělenou, lidsky zkontrolovanou českou challenge sadu, pokud ji tým skutečně dodal. Zaznamenej původ, počty a metodiku. Když nezávislá sada neexistuje, nevytvářej za ni údajně nezávislé výsledky. EN/CZ, classifier/policy a development/test reportuj odděleně včetně abstention a skutečných chyb. Pokud se rozhodneš na odhalených chybách ladit, tento soubor se stává development/regression sadou a report to musí přiznat. Nezametej false negatives.

Ověř klávesnici, focus, čtečkové stavy, kontrast, 360px mobil, 200% zoom, obě lokalizace a sdílení/copy fallback. Zapiš odděleně automatické a skutečně provedené manuální kontroly. Připrav krátký scénář pro člověka, který appku nezná; nevymýšlej uživatelské studie, které neproběhly.

HOTOVO: AUDIT.md obsahuje prioritu problémů, reprodukci, výsledky oprav, skutečné metriky a přetrvávající limity. Oprav kritické bezpečnostní/integritní chyby, případně vypni bonus. Uveď release/no-release doporučení; nesplněná bezpečnostní brána znamená omezení produktu, ne skrytí vady. Aktualizuj STATUS.md a commit.
```
