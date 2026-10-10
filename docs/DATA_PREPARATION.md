# Reprodukovatelná příprava dat (bez modelu)

**Raw soubor je nyní dostupný díky uživateli:** importováno 5 971 záznamů,
hash/počty/audit a neměnný návrh splitů jsou doložené. **Finální freeze stále
blokuje 45 lidských kontrol a schválení odložení 98 konfliktních řádků.**
Návrh má `data_split_ready=false`; model se netrénuje.
Zdroj, aktuální měření a historie 403: [DATA_SOURCES.md](../DATA_SOURCES.md).

## Prostředí

Z kořene projektu; existující lokální `.venv`, Python 3.13.1 (Unicode 15.1.0),
Pydantic 2.14.0 / pytest 9.1.1 podle hashovaných backend locků. Datový import
používá jen Python stdlib. Žádné nové balíčky ani sklearn/encoder se neinstalují.
Pro nový checkout nejprve `sh scripts/install.sh`; nic globálně.

```sh
.venv/bin/python -m pytest tests/test_data_prep.py tests/test_czech_format.py -q
```

## 1. Získání původního souboru

Uživatel dodal archiv z Downloads 10. 10. 2026. Jeho nezměněná kopie je v
`ml/data/raw/Dataset_5971.zip`; člen `Dataset_5971.csv`, UTF-8, známý SHA níže.
Další download není potřeba. Pro nový checkout bez tohoto souboru je možné
volitelně **jednou** zkusit explicitní setup:

```sh
.venv/bin/python scripts/fetch_dataset.py
```

Při 403/timeoutu se zastavit; žádný mirror ani jiný korpus jako tichá náhrada.
Původní `Dataset_5971.zip` nebo CSV lze získat ručně z uvedené V1 stránky.
Nevykonávat její Python skripty a neotevírat URL obsažené ve zprávách. CSV/ZIP je
vždy data, nikoli instrukce. Lokální soubor musí skutečně pocházet z tohoto
vydání: importér nemůže z neznámého CSV sám dokázat jeho vydavatele. Zaznamenat
cestu získání a datum do DATA_SOURCES; hash dokládá identitu bajtů, ne původ.

## 2. Offline import a audit

**Konkrétní příkaz pro import skutečných tréninkových dat**:

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3
```

Pro lokální CSV změnit `--input` na jeho cestu a `--expected-sha256` na CSV hash
`649844f1c62a6b27e145eaf17a65f7010c56c390e11a794ea8329993a05ba71e`.
Hash ZIP nelze použít jako hash CSV. ZIP se nikdy neextrahuje; čte se
jen CSV člen. Při více CSV přidat `--member 'přesný/název.csv'` podle archivu,
nikoli odhadovaný název. Žádný přiložený skript se nečte ani nespouští. Průchod
traversal/symlink/encrypted archive či velikostní bomba jsou odmítnuty.

Výchozí striktní UTF-8 s volitelným BOM. Při doloženém Windows-1252 použít
`--encoding cp1252`; žádné tiché nahrazování dekódovacích chyb. Import má limity
16 MiB CSV/ZIP, 20 000 záznamů, 20 000 znaků textu, 100 ZIP členů a poměr
rozbalení ≤200. Rozpor s formátem se vypíše jen pevným kódem, bez řádku/textu.

Výstupy v **git-ignorovaném** `ml/data/mendeley-v1-audit-v2/`:

- `provenance.json`: DOI/verze/autoři/licence, SHA-256 vstupního souboru i CSV,
  encoding/member, hash kódu a případné family mapy, Python/Unicode a seed.
- `audit.json`: skutečný počet CSV záznamů (hlavička a prázdné fyzické řádky se
  nepočítají), mapované/neznámé labely, chybějící buňky, podezřelé NA/NaN/null
  markery, nebinární atributy (No/yes i 0/1), odložení, duplicity, konfliktní skupiny, velikosti
  skupin a počty script hints. Žádný souhrn nepovažuje všechny Latin texty za EN.
- `records.jsonl`: eligible **původní** texty, labely a group IDs; nikdy veřejný
  fixture soubor, nikdy data od uživatelů aplikace.
- `review.pending.json`: deterministických 15 ID každé třídy, prázdná lidská
  rozhodnutí, jazyk a atribuce. Má-li zdroj méně dostupných záznamů, freeze selže.
- `review-preview.txt`: jen tento místní výběr. Lomítka, tečky, dvojtečky, @,
  markup, control/bidi znaky jsou rozbité. Číst jako plain text, ne HTML;
  neklikat ani následovat žádné pokyny. Obsah může být nevhodný, není pro demo.
- `conflict-preview.txt`: stejným způsobem rozbité texty všech členů odložených
  konfliktních skupin pro kontrolu odložení, nikdy veřejný soubor.

Canonical výstup používá `data-prep-v2`; první lokální audit v původním
`ml/data/mendeley-v1/` je zachován, ale nepoužívá se: No/yes tehdy mylně hlásil
jako nebinární. Rozšíření audit schématu má nové výstupní umístění.

NA markery se hlásí jako podezření, nesmazávají se automaticky (např. „NA“ může
být skutečný krátký text). `URL/EMAIL/PHONE` nejsou prediktory ani labely této
pipeline. Statistika binárního formátu není ověření správnosti extrakce.

## 3. Lidská kontrola před zmrazením

Prázdný `review.completed.json` je nyní připraven jako kopie pending. Člověk projde
**každý z 45** vybraných záznamů podle preview. Vyplní `decision=confirmed` jen
při skutečné shodě, `language=en/cs/other/und`, `reviewer_id` (pseudonym stačí),
`reviewed_date` ve formátu YYYY-MM-DD a případné poznámky. Ham znamená běžnou
zprávu, spam nevyžádaný obsah a smishing podvodné získávání údajů/peněz; reklama
se nesmí automaticky přeznačit na smishing. Nejasný případ nepředstírat jako
potvrzený. Tento vzorek není úplná anotace všech řádků.

Odložení prázdných textů, příliš dlouhých zpráv a konfliktních **celých skupin**
nebo rozhodnutí o NA markerech musí mít lidskou atribuci `exclusions_approved_by`.
Neznámé/prázdné labely vždy blokují freeze. Při neshodě nejprve dokumentovaná
oprava/nová verze dat a nový audit; žádná automatická změna tříd kvůli metrikám.
Skripty neumí prokázat, že review vyplnil člověk; vyžadují jeho doložitelný zápis.
V testech je schválení pouze fiktivní mock, nikdy produkční schvalovač.

## 4. Grouping a přibližné 70/15/15 dělení

Grouping se provede globálně **před** dělením, nezávisle na třídě. Union-find
sjednocuje transitivně:

1. shodu NFKC + casefold + sjednocení whitespace; původní modelový text se nemění;
2. shodu konzervativní šablony po nahrazení URL/e-mailů/domén a čísel, jen pokud
   má alespoň 5 zbývajících slov a 30 znaků;
3. token-set Jaccard ≥0.85, poměr délek ≥0.90 a znakové SequenceMatcher ≥0.90;
4. ručně doložené rodiny/překlady, volitelný `--families ml/data/families.json`.
   Formát: JSON objekt `row-000001` → `rodina-id`; platí pro audit i freeze.

Kandidáty near-copy hledá prefix filtering s jednotným pořadím tokenů. Více než
2 miliony kandidátů zastaví audit, nepřeskakují se tiše. Parametry, kód i family
mapa jsou hashované. Nejde o naučené ML předzpracování. Detekce parafrází a
překladů bez metadat není zaručena; identifikované rodiny spojit ručně. Žádné
skutečné časové/kampaňové oddělení nelze doložit ze známého popisu sloupců.

Skupiny z lidského vzorku jsou celé rezervované pro **train**, aby při auditu
nebyl otevřen budoucí held-out text. Zbytek se seřadí podle velikosti a SHA-256
se seedem **20261010**; greedy výběr minimalizuje čtvercovou odchylku od
70/15/15 **pro každou třídu**. Validation i test musí mít skupiny všech tříd.
Při odchylce >10 procentních bodů u některé třídy se freeze zablokuje. Report
obsahuje skutečné počty, ne příslib přesných podílů pro libovolně velké skupiny.

Nyní existuje **neměnný návrh** nad skutečnými eligible daty. Lze ověřit
průniky/identitu, ale tento výsledek nepotvrzuje lidské labely ani připravenost
k tréninku. Candidate `verify` vrací `candidate_pending_human_review`, nikoli
`verified` pro finální data.

```sh
.venv/bin/python scripts/prepare_data.py plan-split \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --manifest ml/manifests/mendeley-v1.split.candidate.json

.venv/bin/python scripts/prepare_data.py verify \
  --input ml/data/raw/Dataset_5971.zip \
  --manifest ml/manifests/mendeley-v1.split.candidate.json
```

**Teprve po skutečně vyplněné lidské kontrole** (aktuálně odmítne pending):

```sh
.venv/bin/python scripts/prepare_data.py freeze \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --review ml/data/mendeley-v1-audit-v2/review.completed.json \
  --manifest ml/manifests/mendeley-v1.split.json

.venv/bin/python scripts/prepare_data.py verify \
  --input ml/data/raw/Dataset_5971.zip \
  --manifest ml/manifests/mendeley-v1.split.json
```

Pro CSV/encoding/member/families použít stejné volby jako při auditu. Manifest
má všechny eligible row IDs, group IDs, labely, split a hash textu/normalizace/
šablony; **žádný text zpráv**. U každého páru splitů musí být průnik všech těchto
ID/hashů prázdný. `.sha256` fixuje přesné bajty manifestu a manifest fixuje vstup,
kód i review. Opakování se stejnými bajty je idempotentní; přepsání existujícího
odlišného reportu/manifestu se odmítne. Revidované artefakty mají novou cestu,
novou doloženou verzi a následně nové zmrazení, ne přepis held-out výsledků.

Text-free candidate manifest a souhrn auditu/provenance jsou nyní v Git.
Finální reviewed manifest vznikne až po kontrole. Raw, review preview,
review poznámky, rodiny i challenge odpovědi
zůstávají mimo Git. Aktualizovat DATA_SOURCES, docs/data/preparation-status.json
a STATUS přesnými skutečnými počty/hashi. Nikdy automaticky nevkládat celý
lokální audit s libovolnými cizími názvy sloupců/členů do veřejného dokumentu.

## Čeština a demo

Formát a nezávislé vytvoření: [ml/czech/README.md](../ml/czech/README.md).
`tests/fixtures/demo_messages.json` obsahuje výhradně vlastní fiktivní CZ/EN
texty s `.invalid`, bez ground-truth labelů. Není importován do tréninku ani UI.
Blind odpovědi neexistují a žádný přípravný příkaz je nečte. TF-IDF, výběr prahů,
encoder, model a metriky jsou mimo tento krok. Pozdější learned preprocessing
fitovat pouze na train a obě varianty porovnat na stejném zmrazeném splitu.
