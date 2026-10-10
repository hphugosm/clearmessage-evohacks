# Data sources — Klidná zpráva

Ověření metadat a lokální import: **10. 10. 2026**. Uživatel dodal původní archiv;
**raw soubor a automatický audit jsou dostupné, finální data blokuje lidská
kontrola labelů a odložení konfliktů**. Žádný jiný korpus ani trénink modelu.

## D1 — původní Mendeley dataset, verze 1

| Pole | Doložená hodnota |
|---|---|
| Název | SMS PHISHING DATASET FOR MACHINE LEARNING AND PATTERN RECOGNITION |
| Autoři | Sandhya Mishra, Devpriya Soni |
| Vydavatel | Mendeley Data |
| DOI / verze | `10.17632/f45bkkt8pr.1` / V1 |
| Vydáno | 20. 6. 2022 |
| Zdroj | [Původní stránka V1](https://data.mendeley.com/datasets/f45bkkt8pr/1) |
| Raw archiv / CSV člen | `Dataset_5971.zip` / `Dataset_5971.csv` |
| Původní archive URL | [Archiv z veřejného seznamu](https://data.mendeley.com/public-files/datasets/f45bkkt8pr/files/edb361de-918d-469f-9106-e84823830665/file_downloaded) |
| Licence na stránce | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Datum získání pro projekt | 10. 10. 2026, dodáno uživatelem z jeho Downloads; přesný čas samotného browser downloadu nezjišťován |
| Archiv / CSV velikost | **244 698 / 595 987 bajtů** |
| Archiv SHA-256 | `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3` |
| CSV SHA-256 | `649844f1c62a6b27e145eaf17a65f7010c56c390e11a794ea8329993a05ba71e` |
| Skutečný počet CSV záznamů | **5 971** |
| Skutečné ham / spam / smishing | **4 844 / 489 / 638** |
| Lidská kontrola | **0 skutečných kontrol**; vybráno 15 z každé třídy |
| Skupinový návrh / průnik | Neměnný candidate manifest; průnik skutečných eligible dat **prázdný** |
| Finální zmrazený split | **Nevytvořen**, čeká na lidskou kontrolu; `data_split_ready=false` |

Název archivu, CSV člen, sloupce a počty odpovídají původnímu vydání. Nemáme
nezávislý vydavatelský checksum, takže místní SHA dokládá identitu obdržených
bajtů, nikoli kryptografický důkaz původu. Původ vychází z uživatelem dodaného
archivu v pojmenované složce datasetu a shody s veřejnými metadaty V1.
Původní soubory v Downloads nebyly změněny, přiložené Python skripty nebyly spuštěny.

Deklarované počty vydavatele jsou shodné s **nyní skutečně změřenými** počty.
CSV načteno striktním UTF-8; hlavička `LABEL,TEXT,URL,EMAIL,PHONE`.

## Explicitní mapování labelů a indikátorů

Pouze `LABEL.strip().casefold()` → `ham`, `spam`, `smishing`; žádné číselné
aliasy nebo zaměňování reklamy za phishing.

| Skutečné zdrojové hodnoty | Třída | Počet / význam |
|---|---|---|
| `ham` | `ham` | 4 844; zdrojově běžné/legitimní, nikoli potvrzení bezpečnosti. |
| `spam` (466), `Spam` (23) | `spam` | 489; nevyžádaná zpráva/reklama, ne automaticky phishing. |
| `Smishing` (616), `smishing` (22) | `smishing` | 638; zdrojově SMS phishing, lidský audit významu ještě čeká. |

Neznámý/prázdný label se nemapuje odhadem; blokuje finální freeze. V aktuálním
souboru takové hodnoty nebyly nalezeny. Skupiny s různými platnými labely jsou
odloženy celé, bez automatického přeznačení. Trénovací třídy nejsou API stavy.

`URL/EMAIL/PHONE` obsahují skutečně `No` a `yes`, mapované na 0/1. Nejsou labely,
phishing ground truth ani modelové features této pipeline. Presence counts:
URL 207 ano / 5 764 ne, EMAIL 19 / 5 952, PHONE 844 / 5 127. Audit ověřil formát,
nikoli úplnost nebo správnost cizích extrakčních skriptů.

## Automatický audit a návrh splitů

- Prázdné buňky, NA markery, neznámé labely, odložené prázdné/příliš dlouhé texty:
  **0**. Nebinární indikátory po explicitním mapování No/yes: **0**.
- Normalizované duplicity: **140 nadbytečných řádků**. Po sjednocení přesných
  normalizovaných kopií, konzervativních šablon a near-copy: **5 631 skupin**;
  union edges 140 normalizovaných + 110 šablonových + 90 near-copy.
- **46 skupin / 98 řádků** má po grouping různé labely: odloženo 48 spam a 50
  smishing. Jsou to konflikty identifikovaných rodin, ne tvrzení, že všechny
  jejich texty jsou přesně stejné. Eligible: **5 873 řádků / 5 585 skupin**.
- Script hints: 5 906 Latin unknown, 1 mixed unknown, 64 too short unknown.
  **Žádných 5 971 jazyků nebylo lidsky potvrzeno**; Latin není automaticky EN.
- CSV nemá jazyková, časová ani kampaňová metadata. Parafráze, překlady a skutečné
  kampaně nelze plně ověřit automatickými heuristikami.

Seed **20261010**, rozdělení celých skupin. Všechny rodiny review vzorku jsou
rezervované pro train. **Návrh, stále ne finální reviewed training split:**

| Třída | Train | Validation | Test | Eligible celkem |
|---|---:|---:|---:|---:|
| ham | 3 391 | 727 | 726 | 4 844 |
| spam | 309 | 66 | 66 | 441 |
| smishing | 412 | 88 | 88 | 588 |
| Celkem | 4 112 | 881 | 880 | 5 873 |

Průnik row IDs, group IDs, původních/normalizovaných/template hashů mezi všemi
páry splitů je prázdný **nad skutečným návrhem dat**. Manifest je zafixován SHA:
`51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0`.
[Candidate manifest](ml/manifests/mendeley-v1.split.candidate.json) má
`candidate_pending_human_review`, **`data_split_ready=false`**, 0 lidských kontrol.
To není potvrzení labelů. Finální freeze s nevyplněnou kontrolou skutečně skončil
`human_label_review_pending_or_disagreed`; žádný finální split nevznikl.

Text-free měření: [audit](docs/data/mendeley-v1.audit.json),
[provenance](docs/data/mendeley-v1.provenance.json),
[aktuální stav](docs/data/preparation-status.json). Raw, původní texty, review
poznámky a plain-text previews zůstávají v ignorovaném `ml/data/`.

## Licence, původ a atribuce

Citace vydavatele: mishra, sandhya; Soni, Devpriya (2022), *SMS PHISHING DATASET
FOR MACHINE LEARNING AND PATTERN RECOGNITION*, Mendeley Data, V1,
doi:10.17632/f45bkkt8pr.1. Copyright Sandhya Mishra a Devpriya Soni, 2022.
Při použití zachovat atribuci, zdroj/licenci a popsat úpravy. Naše úpravy jsou
audit, odložení celých konfliktů, normalizace pro grouping a návrh skupinového
dělení. Modelový text zůstává původní, žádný raw obsah není zveřejněn.

Vydavatel popisuje internetové obrázky/screenshoty převedené na text a labelování
podle zdroje. Děkuje Tiago A. Almeida a Dr. Gunikhan Sonowal za zprávy. Podrobný
původ/oprávnění každého převzatého řádku zatím neověřen. Licence na stránce není
potvrzení labelů ani úplný upstream audit. UCI ani jiný korpus nebyly přidány.

## Historie odstraněného download blokátoru

Automatické GET původní stránky/API/archive URL vrátily HTTP 403 a browser
archive download timeout 30 s. Tento neúspěch zůstává v historii, nebyl vydáván
za úspěšný download. Nyní jej odstranilo **lokální dodání souboru uživatelem**;
není nutné zkoušet stahování znovu, měnit ochrany nebo hledat mirror.

Reprodukovatelné příkazy a lidská kontrola: [DATA_PREPARATION.md](docs/DATA_PREPARATION.md).
Aktuální canonical audit má verzi `data-prep-v2`; zachovaný lokální první audit
V1 mylně považoval No/yes za nebinární, není používán. Změna formátu auditů má
novou cestu, staré soubory nebyly přepsány. Žádný model se ještě netrénoval.
