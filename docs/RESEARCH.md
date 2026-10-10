# Rešerše — zdroje, licence a rozhodnutí

Ověřeno v primárních veřejných popisech 10. 10. 2026. Uvedení licence na stránce
nenahrazuje kontrolu staženého souboru, původu kombinovaných dat a podmínek akce.
Binární soubory ani dataset nebyly při přípravě tohoto balíčku staženy či otestovány.

## Akce

**R1 — pravidla:** https://evohackathon2026.devpost.com/rules
Pravidla uvádějí 11. 10. 2026 11:59 PDT, tedy 20:59 Praha. Hlavička uvádí
12:00 PDT (21:00 Praha). Použít dřívější čas. Čtyři kritéria mají po 25 %:
užitečnost/dopad, technické provedení, kreativita, prezentace. Nová práce má vznikat
během akce; přesné povolení předtrénovaných částí či veřejných dat vyjasnit s pořadatelem.

**R2 — submission:** https://evohackathon2026.devpost.com/
Popis, veřejný zdrojový kód, 2–3min demo a live deployment nebo lokální instrukce.

## Data

**D1 — primární dataset, doporučeno:**
https://data.mendeley.com/datasets/f45bkkt8pr/1
SMS PHISHING DATASET FOR MACHINE LEARNING AND PATTERN RECOGNITION;
Sandhya Mishra, Devpriya Soni; 20. 6. 2022; DOI 10.17632/f45bkkt8pr.1;
**CC BY 4.0**. Popis uvádí 5 971 záznamů: 4 844 ham, 489 spam, 638 smishing.
Sloupce LABEL, TEXT, URL, EMAIL, PHONE. Výhoda: reklamu/spam nerozpouští automaticky
v phishingu. Omezení: krátké zprávy, stáří a původ dat, jazykový přenos do češtiny,
možné překryvy se zdroji typu SMS Spam Collection. Soubor a labely musí projít auditem.

**D2 — kandidát pro pozdější e-mailovou větev:**
https://figshare.com/articles/dataset/11_Phising_Email_Datasets/25437178
11 Phising Email Datasets; stránka/index uvádí **CC BY 4.0**. Při rešerši byl přímý
fetch omezený; celý obsah souborů a skutečný rozsah povolení nebyly ověřeny.
Není závislost MVP. Prověřit význam labelů spam vs phishing a opakované zdroje.

**D3 — doplňkový zdroj, ne samostatná phishing ground truth:**
https://archive.ics.uci.edu/dataset/228/sms+spam+collection
UCI SMS Spam Collection; **CC BY 4.0**. Ham/spam není benign/phishing.
Při spojení s D1 hrozí překryv, proto nejdříve deduplikace a kontrola původu.

**D4 — samostatný URL projekt, nyní odložit:**
https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset
PhiUSIIL; **CC BY 4.0**; popis uvádí 235 795 URL a 54 features. Část features je
z HTML stránky, ne ze samotné URL. Label **1 = legitimní, 0 = phishing**. Bez
ověření dostupnosti stejných features při inference nepřebírat hotový notebook.
Naše aplikace stránky nestahuje. Druhý URL model by zbytečně zvětšil rozsah.

**D5 — nedoporučeno převzít bez auditu:**
https://huggingface.co/datasets/zefang-liu/phishing-email-dataset
Karta uvádí LGPL-3.0. V náhledu jsou pod phishingem i reklamní/spamové zprávy.
Není vhodné slepě interpretovat tuto cílovou proměnnou jako potvrzený podvod.

**D6 — kombinovaný zdroj, nyní vynechat:**
https://huggingface.co/datasets/ealvaradob/phishing-dataset
Kombinuje URL, HTML, SMS a e-mail. Karta zmiňuje Apache-2.0, ale je nutné
prověřit licence jednotlivých zdrojů. Návod používá trust_remote_code=True;
pro tento projekt to není potřeba ani žádoucí. Volíme jednoduchý raw CSV zdroj.

**Čeština:** během této rešerše nebyl ověřen vhodný hotový veřejný český korpus
pro náš přesný účel. To není tvrzení, že žádný neexistuje. Pro hackathon navrhujeme
oddělené ručně kontrolované české vývojové a challenge příklady a přiznané omezení.

## Model a komponenty

**M1 — doporučený zmrazený encoder:**
https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
Oficiální modelová karta: **Apache-2.0**, 50 jazyků, 384dimenzionální embeddingy.
Natrénujeme vlastní jednoduchý klasifikátor nad těmito vektory. Nepředstíráme,
že jsme vytvořili encoder od nuly. Podporu a kvalitu na češtině měříme odděleně.
Zafixovat revizi, tokenizer, maximální tokeny a hash artefaktů.

**C1 — ML pipeline a prevence úniku dat:**
https://scikit-learn.org/stable/common_pitfalls.html
Použít Pipeline a dělit před fitováním předzpracování. Sklearn není zdrojem labelů
ani důkazem spolehlivosti našeho modelu. Model a všechny prahy sami vyhodnotíme.

**C2 — přístupné UI stavebnice:** https://github.com/shadcn-ui/ui
**MIT**. Vzít pouze malé komponenty typu tlačítko, pole, karta a stav chyby.
Použití knihovny samo o sobě nepotvrzuje přístupnost celé aplikace.

**C3 — volitelný screenshot OCR:** https://github.com/naptha/tesseract.js
**Apache-2.0**; běží v prohlížeči/Node, OCR obrázků. Není to PDF parser.
Modely/jazyková data mají mít doložený původ a licence. Preferovat self-hosted
WASM/worker/languages, žádné odesílání screenshotu. Uživatel opraví text před analýzou.

**C4 — syntaktické zpracování domén:**
https://github.com/john-kurkowski/tldextract
Použít `tldextract.TLDExtract(suffix_list_urls=())` pro vypnutí síťového načítání PSL.
Nejde o reputační databázi ani důkaz vlastnictví domény. URL a IDNA validovat zvlášť.
Ověřit konkrétní verzi a její licenční soubor při přidání závislosti.

**C5 — sdílení uživatelem:**
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
Web Share má omezenou dostupnost podle prohlížeče a potřebuje zabezpečený kontext
/user gesture. Proto ponechat kopírování jako rovnocenný fallback. Předat jen pevné
neutrální shrnutí, žádnou zprávu či původní URL.

## Přístupnost a bezpečné rady

**A1 — kontrast:**
https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
Normální text nejméně 4.5:1, velký text 3:1 podle příslušného kritéria.

**A2 — větší ovládací cíle:**
https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
44 × 44 CSS px je enhanced kritérium; naše volba 48px tlačítek je produktový návrh,
ne tvrzení, že takovou hodnotu obecně vyžaduje WCAG AA.

**A3 — bezpečný postup u phishingu:**
https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams
Ověřovat jinou známou cestou, nepřebírat kontakt či link z podezřelé zprávy.
Texty našeho průvodce musí odpovídat tomu, co uživatel skutečně udělal.

## Hosting

**H1 — Docker Spaces:** https://huggingface.co/docs/hub/spaces-sdks-docker
Vhodná cílová forma pro jeden FastAPI/frontend kontejner, není jediná možnost.

**H2 — aktuální podmínky:** https://huggingface.co/docs/hub/spaces-overview
Dokumentace při ověření uvádí placený plán pro vytvoření Docker/Gradio Spaces;
CPU Basic přitom nemá hodinový poplatek. Není korektní slibovat všem hosting zdarma.
Preferovat již dostupný účet/server. Nová platba vždy vyžaduje souhlas uživatele.

## Codex

**X1 — cíle a ověřitelné dokončení:** https://learn.chatgpt.com/docs/long-running-work
Dokumentace popisuje /goal v desktopu, Codex CLI a IDE. Uvést výsledek, omezení a
ověření. Goal automaticky nerozšiřuje oprávnění ani neobchází approval režim.

**X2 — instrukce repozitáře:**
https://learn.chatgpt.com/docs/agent-configuration/agents-md
Sdílená pravidla uložit do AGENTS.md. Postup a aktuální stav patří do docs/STATUS.md.

## Co je naše vlastní práce

Naše jsou aplikace, zpracování a audit dat, trénink klasifikační hlavy, výběr policy,
české srozumitelné vysvětlení, workflow bezpečné pomoci, evaluace, testy a prezentace.
Převzaté jsou řádně uvedené datasetové zdroje, encoder a knihovny. Použití Codexu
se přiznává. Vlastní model neznamená vytrénovat velký jazykový model od nuly.
