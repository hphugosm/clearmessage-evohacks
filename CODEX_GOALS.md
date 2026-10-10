# Codex — kompletní posloupnost /goal promptů

Tento dokument je součást balíčku Klidná zpráva. Nejprve vlož do repozitáře i
AGENTS.md a docs/. Prompty na tyto soubory odkazují; bez nich chybí část pravidel.
Cíle spouštěj jednotlivě v pořadí. Goal 06 je bonus a může se zcela přeskočit.

Po každém kroku si nech ukázat skutečný běh/testy a stav. Pokud se úkol blokuje,
nejdříve vyřeš nebo zvol uvedený menší fallback; nepředstírej zelený výsledek.
Cíl neautorizuje nákup předplatného, změnu oprávnění ani zveřejnění na cizím účtu.

## Stručné spouštěcí příkazy

### 00 — Základ a jeden skutečný průchod

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/00_foundation.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 01 — Legálně použitelné, zkontrolované a rozdělené podklady

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/01_data.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 02 — Vlastní trénink, srovnání a poctivé metriky

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/02_ml.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 03 — Analýza, důvody a bezpečná automatizace

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/03_analysis.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 04 — Rozhraní pro člověka, ne bezpečnostní dashboard

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/04_ux.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 05 — Reprodukovatelné spuštění a včasné nasazení

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/05_deploy.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 06 — Bonus: screenshot bez kamery a bez cloud OCR

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/06_optional_ocr.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 07 — Nezávislá kontrola modelu, bezpečnosti a srozumitelnosti

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/07_audit.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```

### 08 — Odevzdání, dokumentace a důvěryhodné demo

```text
/goal Přečti AGENTS.md a proveď kompletní zadání z prompts/08_submission.md. Ověř jeho akceptační kritéria, aktualizuj docs/STATUS.md a skonči po tomto cíli.
```


---

## Plná zadání

### 00 — Základ a jeden skutečný průchod

```text
/goal Vytvoř ověřitelnou kostru aplikace Klidná zpráva podle AGENTS.md a docs/PROJECT_PLAN.md. Cílem tohoto kroku není hotový detektor, ale spustitelná aplikace se stabilním API kontraktem a pravdivým stavem „model není připraven“.

Nejdříve prohlédni aktuální repozitář a zachovej cizí změny. Použij React + TypeScript + Vite pro frontend a FastAPI + Pydantic pro backend. Jeden Docker kontejner bude obsluhovat frontend build i API. Bez databáze, přihlášení, externího LLM, analytics a přístupu do schránky. Zafixuj skutečně ověřené verze závislostí; neinstaluj globálně.

Vytvoř malou strukturu frontend/, backend/, ml/, tests/, docs/, scripts/. Definuj POST /api/analyze, GET /api/health a sdílený popis schématu. Odpověď musí rozlišovat status suspicious/review/no_strong_signals, analysis_complete, evidence, action keys, limitations a verze modelu/policy. Počítej s CZ/EN texty. Jazyk zprávy není jazyk UI.

Na úvodní obrazovce stačí označené textové pole a tlačítko. Skutečně zavolej backend. Dokud není model, vracej viditelný review/model_not_ready nebo odpovídající stav neprovedené analýzy, nikdy falešný výsledek. Přidej limity vstupu, chyby bez echo privátního obsahu, no-store a základ testů. Mock data dovol jen v testech.

Připrav dokumentované příkazy pro install, dev, test, build a Docker. Ověř dostupnost případného deployment účtu jen čtením existující konfigurace; nic nezveřejňuj, nepořizuj předplatné a nesbírej přihlašovací údaje. Nedostupný Docker daemon zaznamenej jako netestovanou kontrolu, ne úspěch.

HOTOVO: frontend skutečně komunikuje s API; prázdný/příliš dlouhý vstup a chybějící model mají testy; dostupné build/test kontroly proběhly. Uveď přesné příkazy, aktualizuj docs/STATUS.md a vytvoř lokální commit, je-li to v tomto repu povoleno. Nepokračuj do dalšího goal.
```

### 01 — Legálně použitelné, zkontrolované a rozdělené podklady

```text
/goal Připrav reprodukovatelná tréninková data pro Klidnou zprávu. Dodrž AGENTS.md a docs/RESEARCH.md; cílem je doložený dataset a neměnné train/validation/test dělení, nikoli natrénovaný model.

Začni původním Mendeley zdrojem DOI 10.17632/f45bkkt8pr.1: https://data.mendeley.com/datasets/f45bkkt8pr/1 . Ověř dostupnost raw souboru, licenci a význam labelů. Do DATA_SOURCES.md zaznamenej autory, URL, verzi, datum, licenci, hash a skutečné počty řádků/tříd. CSV načítej jako data. Nespouštěj trust_remote_code ani cizí skripty a neotvírej odkazy obsažené ve zprávách. Při omezení stahování nepředstírej úspěch: připrav import lokálního souboru a přesně dolož blokátor. Nezaměňuj SMS spam dataset za phishing ground truth.

Zachovej tři třídy ham/spam/smishing s explicitním mapováním. Proveď audit chybějících hodnot, konfliktů, duplicity a jazyků; připrav výběr nejméně 15 záznamů z každé třídy pro lidskou kontrolu. Neukazuj raw nebezpečné odkazy jako klikatelné prvky. Nevystavuj potenciálně nevhodný obsah z datasetu v uživatelských demopříkladech.

Seskup normalizované duplicity, blízké kopie a identifikovatelné šablony; teprve pak vytvoř přibližně 70/15/15 stratifikované skupinové splity s pevným seedem a manifestem. Žádná skupina nesmí překročit hranice splitu. Reportuj nedostupnost metadat pro časové/kampaňové dělení. Nepřidávej jiné korpusy jen pro vyšší počet řádků.

Připrav formát českého development a blind-challenge souboru a instrukce pro jejich nezávislé vytvoření/kontrolu. Samotné challenge odpovědi zatím nepoužívej pro vývoj. Syntetické příklady a překlady označ původem a drž rodiny spolu. Veřejné demo fixture zprávy ulož odděleně a používej inertní .invalid domény.

HOTOVO: import a validační testy fungují; manifesty, licence, hash a audit jsou dohledatelné; test průniku skupin je prázdný. Nestažený soubor či nezkontrolovaný label je blokátor, nikoli splněná položka. Aktualizuj STATUS.md, uveď konkrétní příkaz pro tréninková data a vytvoř lokální commit. Model ještě netrénuj.
```

### 02 — Vlastní trénink, srovnání a poctivé metriky

```text
/goal Natrénuj a vyhodnoť vlastní klasifikátor krátkých zpráv pro Klidnou zprávu nad schválenými daty z goal 01. Přečti AGENTS.md, stav auditu a manifesty. Pokud chybí skutečná data nebo není vyjasněn význam labelů, nevyrob náhražku a zapiš blokátor.

Implementuj reprodukovatelný baseline TF-IDF word/char + LogisticRegression ve sklearn Pipeline pro ham/spam/smishing. Všechny naučené transformace fituj výhradně na tréninku. Zaznamenej majoritní baseline, seed, verze knihoven a skutečné počty. Proti němu porovnej zmrazený sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 a naši vlastní LogisticRegression hlavu. Encoder není náš vlastní od základu natrénovaný model. Zafixuj konkrétní revizi a licenci.

Začni rychlostním testem encoderu na malé dávce. Nezkoušej rozsáhlý hyperparameter search ani trénování transformeru od nuly. Máš nejvýše několik předem definovaných variant; dokumentuj je. Cache smí obsahovat pouze veřejná vývojová data, nikdy vstupy uživatelů. Při příliš velkých nárocích ponech doložený baseline a jasně omez jeho jazykovou podporu.

Na validaci vyber kandidáta a prahy pro policy se stavem review. Samotné score není pravděpodobnost podvodu pro uživatele. Připrav kontrolu pokrytí tokenizerem: přetečení/tiše zkrácený vstup se nesmí vydávat za úplnou kontrolu. Otestuj reload artefaktu a shodu inference. Neprováděj runtime síťové downloady; neber cizí pickle.

Vygeneruj strojově čitelné i lidské výsledky: per-class precision/recall/F1, confusion matrix, počty a false positives/negatives; model a policy zvlášť, coverage/abstention. Test otevři až po výběru kandidáta/prahů a dál podle něj netunuj. České development výsledky neslučuj s EN testem. Slepý český test si ponech pro audit.

HOTOVO: inference pracuje se skutečně uloženým modelem, existuje příkaz pro retraining, metriky jsou skutečně spočtené, MODEL_CARD.md popisuje data, licence, jazyková omezení a vlastní vs převzatou práci. Nedosažené ambice přiznej. Aktualizuj STATUS.md a commit. Nevyráběj fake skóre ani demo-specifické odpovědi.
```

### 03 — Analýza, důvody a bezpečná automatizace

```text
/goal Implementuj skutečný analyzační tok Klidné zprávy: text → vlastní model z goal 02 → transparentní pravidla → srozumitelný bezpečný postup a návrh prosby o pomoc. Dodrž AGENTS.md; nebuduj externí agenty ani integrace.

Připoj reálný model přes malé rozhraní a verzuj policy. Rozliš stav suspicious, review a no_strong_signals a samostatně analysis_complete. Rozhodnutí nezalož jen na nejvyšší třídě: respektuj nastavené prahy, jazykový rozsah, neúplné pokrytí tokenizerem a chyby. Při chybě modelu nemůže vzniknout uklidňující výsledek. Spojení pravidel a modelu musí být vysvětlitelné a testované. Když fungují jen pravidla, přiznej omezenou kontrolu.

Vytvoř malý soubor pravidel s důkazem v textu: žádost o sdělení hesla/OTP, nátlak na okamžitou platbu, utajení před důvěryhodnou osobou. Dbej na negaci a běžná bezpečnostní upozornění. Samotný spam, HTTPS, konkrétní TLD, pravopisná chyba či krátký odkaz nejsou důkaz podvodu. URL pouze syntakticky parsuj; tldextract musí mít vypnuté načítání PSL. Žádné navštěvování, DNS, WHOIS, screenshoty webů ani rozbalování přesměrování.

Připrav CZ/EN šablony nejvýše tří důvodů a tří kroků. Každý konkrétní důvod musí odpovídat skutečnému signálu, nikoli vymyšlenému vysvětlení ML. Není-li konkrétní důkaz, dej obecnou poctivou formulaci a omezení. Doporuč ověření nezávislou známou cestou, ne linkem/telefonem ze zprávy. Nízký nález nikdy nenazývej bezpečím.

Návrh prosby o pomoc sestav jen z neutrálních schválených šablon. Nikdy do sdíleného payloadu nevkládej zdrojovou zprávu, evidence snippet, URL, jméno, účet či kód. Odeslání musí zůstat lidským rozhodnutím. Přidej stručné ručně kontrolovatelné rady pro situaci „už jsem klikl/a“ bez sběru dalších tajných údajů.

HOTOVO: integrovaná API analýza funguje na reálném modelu; jsou otestované konfliktní signály, reklamní i legitimní zprávy, požadavek bez URL, výpadek a překročení limitu. Test no-egress potvrzuje nulové síťové dotazy při analýze. Přidej canary testy logů/sdílení, aktualizuj STATUS.md a commit.
```

### 04 — Rozhraní pro člověka, ne bezpečnostní dashboard

```text
/goal Dokonči jednoduché, přístupné CZ/EN webové rozhraní Klidné zprávy nad skutečným API. Cíloví uživatelé zahrnují seniory a děti; nevyžaduj věk, účet ani technické znalosti. Dodrž AGENTS.md a docs/ACCEPTANCE.md.

Udělej jednu hlavní obrazovku: jednoduchá otázka, řádně označené pole pro zprávu, krátké upozornění na soukromí a tlačítko „Zkontrolovat zprávu“. Vedlejší příklady musí být označené jako ukázky. Výsledek má jednu hlavní větu, nejvýše tři konkrétní důvody a nejvýše tři kroky. Nezobrazuj risk score, grafy, falešné bezpečnostní štíty, fake skenovací animace či marketingový odpočet. Není to chatbot.

Použij malé komponenty shadcn/ui nebo stejně jednoduché přístupné HTML. Zaměř se na přibližně 20px základní text, alespoň 48px tlačítka, čitelný kontrast, viditelný focus, ovládání klávesnicí, oznámení výsledku čtečce, 360px mobil a 200% zoom. Zprávu vykresluj pouze jako text. Odkazy uvnitř se nesmějí stát klikacími.

Přidej preview neutrální prosby o pomoc a tlačítko pro ruční kopírování; nativní Web Share jen po explicitním kliknutí, s fallbackem. Nikdy nesdílej původní text ani automaticky nevybírej kontakt. Když API nefunguje, ukaž „Kontrolu se nepodařilo dokončit“, nikoli bezpečný výsledek. U review vysvětli omezení srozumitelně.

Udrž oddělené CZ/EN slovníky, jazyk zprávy a jazyk rozhraní. Texty musí být klidné, bez obviňování a bez infantilizace. Nebuduj navíc módy pro každou věkovou skupinu. Žádná historie, localStorage zpráv, analytics ani externí API.

HOTOVO: end-to-end testy pokrývají skutečnou analýzu, dvě lokalizace, review/error, keyboard flow a bezpečné kopírování. Proveď vizuální kontrolu mobil/desktop a kontrast; přesně uveď, co bylo skutečně zkontrolované. Poté aktualizuj STATUS.md a commit. OCR patří až do samostatného bonusového goal.
```

### 05 — Reprodukovatelné spuštění a včasné nasazení

```text
/goal Připrav a ověř odevzdatelnou verzi Klidné zprávy v jednom Docker kontejneru. Použij již implementovaný model/API/frontend, nepřidávej nové funkce. Dodrž AGENTS.md a odděl ověřené lokální spuštění od veřejného nasazení.

Dokonči multi-stage build, v němž FastAPI servíruje frontend i /api. Model a tokenizer připrav při explicitním setup/build kroku s fixovanou revizí a hashem, ne při každé analýze. Netrénuj model při requestu nebo každém restartu. Nevyžaduj GPU. Změř skutečný start, paměť a latenci; nastav rozumnou malou souběžnost, limity requestů a zdravotní kontrolu modelu.

Vytvoř reprodukovatelné instrukce od čistého klonu. Pokud modelový artefakt není v repu, popiš jednoznačný způsob jeho získání či lokálního tréninku a integritní kontrolu. Nespouštěj cizí pickle. Nezaměňuj lokální testy za nasazení na cizím účtu. README musí uvádět skutečně vyzkoušené příkazy a všechny limity.

Pro veřejný host použij pouze již známý a uživatelem autorizovaný server/účet. Ověř HTTPS, veřejnou dostupnost porotci, no-store, absence logování těl i v proxy a zákaz egress při analýze. Nikdy nevytvářej placený plán ani nezveřejňuj repozitář bez souhlasu. Aktuální dokumentace Hugging Face uvádí placený plán pro vytvoření Docker Spaces, proto neslibuj univerzálně bezplatné nasazení. Není-li přístup vyřešený, připrav konfiguraci, dolož blokátor a dokonči lokální variantu; Devpost umožňuje lokální instrukce.

Projeď tři end-to-end příklady a chybu modelu v čistém prostředí. Zkontroluj, že produkce nepoužívá fixture model ani mock API. Diagnostika nesmí zveřejňovat texty zpráv, interní cesty či tajné proměnné.

HOTOVO: existuje opravdu otestované spuštění a deployment report se skutečnou URL, pouze pokud se nasazení uskutečnilo. Jinak explicitní blokátor a plně doložený lokální fallback. Aktualizuj STATUS.md a commit; nepředstírej veřejnou dostupnost a automaticky nic neposílej na Devpost.
```

### 06 — Bonus: screenshot bez kamery a bez cloud OCR

```text
/goal Tento goal je nepovinný. Nejdříve ověř v STATUS.md a testech, že textové MVP, skutečný model, bezpečná policy a odevzdatelné spuštění jsou funkční. Pokud ne, OCR nepřidávej a vysvětli důvod. Jinak přidej pouze screenshot PNG/JPEG → editovatelný text pomocí Tesseract.js v prohlížeči.

Dodrž AGENTS.md. Žádný přístup ke kameře, PDF, cizí webové screenshoty, cloud OCR ani externí multimodální API. Uživatel ručně vybere soubor, obraz zůstane v prohlížeči. Ověř skutečnou dostupnost českých a anglických jazykových dat a jejich licence. Worker, WASM a jazyky pokud možno servíruj z vlastního originu; stáhni je při přípravě, ne z URL ve zprávě.

Omez velikost souboru i dekódovaného obrazu, akceptuj pouze skutečné PNG/JPEG. Rozpoznaný text se musí zobrazit v editovatelném poli, aby ho uživatel opravil a sám potvrdil odeslání do analyzátoru. Nepouštěj model automaticky nad skrytým OCR výstupem. Prázdný, rozmazaný nebo nesmyslný výsledek nabídne ruční vložení. OCR nejistota nikdy nesmí skončit falešným uklidněním.

Uvolňuj object URLs/worker a paměť; žádné lokální uchovávání screenshotů mezi návštěvami. Za feature flagem musí stále fungovat původní textová aplikace. Neprováděj velký refactoring ostatních částí.

HOTOVO: testy na několika umělých CZ/EN screenshotech včetně rozmazaného obrázku a chybného formátu; ověřeno, že obraz neopouští browser, text se odesílá až po potvrzení a fallback funguje. Při potížích bonus vypni a zachovej textové MVP. Reportuj skutečnou kvalitu, aktualizuj STATUS.md a commit.
```

### 07 — Nezávislá kontrola modelu, bezpečnosti a srozumitelnosti

```text
/goal Proveď přejímací audit Klidné zprávy podle docs/ACCEPTANCE.md. Nejprve ji posuzuj jako tester, potom oprav pouze prokázané problémy. Nepřidávej nové funkce a neměň kritéria, aby testy snadněji prošly. Dodrž AGENTS.md.

Ověř čistý install/build, skutečný model, překročení tokenového limitu, krátké/nejisté vstupy, chyby služby, různorodé legitimní, spamové a podvodné zprávy. Žádné skutečné škodlivé weby. Včetně requestu na sdílení OTP bez URL, bezpečnostního upozornění „kód nikomu nesdělujte“, rodinné zprávy, školního oznámení, reklamy, Unicode a HTML/injection obsahu.

Proveď canary testy logů, storage, error response a sdílení. Zakaž egress po načtení modelu a potvrď fungování inference. Zkontroluj neklikatelné odkazy a absenci automatického sdílení. Zvlášť ověř error/timeout/OCR failure tak, aby nikdy nevznikl uklidňující výsledek.

Otevři oddělenou, lidsky zkontrolovanou českou challenge sadu, pokud ji tým skutečně dodal. Zaznamenej původ, počty a metodiku. Když nezávislá sada neexistuje, nevytvářej za ni údajně nezávislé výsledky. EN/CZ, classifier/policy a development/test reportuj odděleně včetně abstention a skutečných chyb. Pokud se rozhodneš na odhalených chybách ladit, tento soubor se stává development/regression sadou a report to musí přiznat. Nezametej false negatives.

Ověř klávesnici, focus, čtečkové stavy, kontrast, 360px mobil, 200% zoom, obě lokalizace a sdílení/copy fallback. Zapiš odděleně automatické a skutečně provedené manuální kontroly. Připrav krátký scénář pro člověka, který appku nezná; nevymýšlej uživatelské studie, které neproběhly.

HOTOVO: AUDIT.md obsahuje prioritu problémů, reprodukci, výsledky oprav, skutečné metriky a přetrvávající limity. Oprav kritické bezpečnostní/integritní chyby, případně vypni bonus. Uveď release/no-release doporučení; nesplněná bezpečnostní brána znamená omezení produktu, ne skrytí vady. Aktualizuj STATUS.md a commit.
```

### 08 — Odevzdání, dokumentace a důvěryhodné demo

```text
/goal Připrav finální odevzdávací materiály Klidné zprávy pro EVOHACKS 2026 ze skutečného stavu repozitáře a auditních výsledků. Funkce už nepřidávej. Dodrž AGENTS.md a nepublikuj ani neodesílej nic bez výslovného souhlasu uživatele.

Vytvoř čitelné README v angličtině s krátkou českou verzí: co aplikace řeší, jak ji spustit od čistého klonu, skutečné požadavky/modelové artefakty, architektura, trénink a evaluace, omezení a soukromí. Doplň MODEL_CARD.md, DATA_SOURCES.md, THIRD_PARTY_NOTICES.md a skutečné příkazy testů. Rozliš naše trénovaná klasifikační hlava vs převzatý encoder/knihovny/data. Použití Codexu uveď otevřeně. Nedávej všem cizím součástem automaticky naši licenci.

Připrav DEVPOST_DRAFT.md: Inspiration, What it does, How we built it, Challenges, Accomplishments, What we learned, What's next a jasný odstavec k AI for Automation. Popiš skutečnou automatizaci od interpretace k bezpečnému postupu a návrhu pomoci. Použij pouze reálné metriky s denominátory a oddělenými jazyky. Nepřipisuj projektu automatické blokování/ochranu inboxu ani zabráněné škody.

Připrav DEMO_SCRIPT.md pro 2:30: problém; funkční podezřelá zpráva; bezpečný postup a ručně sdílené neutrální shrnutí; legitimní/reklamní příklad; poctivá nejistota; krátký pohled na kód a reálné ML výsledky; limity a dostupnost. Všechny ukázky jsou umělé a tak označené. Pokud OCR nefunguje, ve scénáři není. Když nedokážeš nahrát video, dodej scénář a přesný checklist, nikdy netvrď, že video bylo vytvořené.

Připrav RELEASE_CHECKLIST.md pro člověka: přístup k veřejnému repu, funkční URL nebo lokální instrukce, přehrání 2–3min videa, vyplnění všech povinných polí, kontrola licence/reuse, uložení a skutečné odeslání. Náš termín je 11. 10. 2026 19:00 Europe/Prague; pravidla uvádějí 20:59, hlavička Devpostu 21:00, používej dřívější limit. Živé hodnocení je 21:00–22:00 podle pravidel.

HOTOVO: dokumentace neobsahuje placeholders vydávané za hotová tvrzení, odpovídá repu a projde závěrečný smoke test. Shrň neprovedené ruční úkony pro uživatele, aktualizuj STATUS.md a vytvoř poslední lokální commit. Nepředstírej odevzdání, publikaci nebo naměřené výsledky.
```
