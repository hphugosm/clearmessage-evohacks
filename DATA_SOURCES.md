# Data sources — Klidná zpráva

Ověření metadat: **10. 10. 2026**. Stav: **raw download blokován; dataset není
připraven k tréninku**. Níže oddělujeme popis vydavatele od vlastních měření.
Nepřidali jsme žádný další korpus. Žádný model nebyl trénován.

## D1 — původní Mendeley dataset, verze 1

| Pole | Doložená hodnota |
|---|---|
| Název | SMS PHISHING DATASET FOR MACHINE LEARNING AND PATTERN RECOGNITION |
| Autoři | Sandhya Mishra, Devpriya Soni |
| Vydavatel | Mendeley Data |
| DOI / verze | `10.17632/f45bkkt8pr.1` / V1 |
| Vydáno | 20. 6. 2022 |
| Zdroj | [Původní stránka V1](https://data.mendeley.com/datasets/f45bkkt8pr/1) |
| Raw archiv v seznamu souborů | `Dataset_5971.zip`, stránka uvádí 239 KB |
| Odkaz z veřejného seznamu | [Původní archiv](https://data.mendeley.com/public-files/datasets/f45bkkt8pr/files/edb361de-918d-469f-9106-e84823830665/file_downloaded) |
| Licence na stránce | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Datum stažení | **Není: žádný úspěšně stažený soubor** |
| SHA-256 archivu / CSV | **Nezjištěn** (`null`), nikoli hash náhradního souboru |
| Skutečný počet CSV řádků | **Nezměřen** (`null`) |
| Skutečné počty ham / spam / smishing | **Nezměřeny** (`null`) |
| Lidská kontrola | **0 skutečných kontrol**; požadováno ≥15 každé třídy |
| Split / průnik skutečných dat | **Nevytvořen / netestován** |

**Pouze deklarace vydavatele:** 5 971 zpráv: 4 844 ham, 489 spam a 638 smishing.
Žádné z těchto čísel nevydáváme za výsledek importu. Sloupce podle popisu:
`LABEL`, `TEXT`, `URL`, `EMAIL`, `PHONE`. Poslední tři jsou indikátory přítomnosti,
nikoli phishing ground truth. Skutečné názvy a obsah CSV zatím nebyly ověřeny.

## Význam a explicitní mapování labelů

`LABEL.strip().casefold()` mapujeme výhradně takto:

| Zdrojový label | Kanonická třída | Význam podle vydavatele / omezení |
|---|---|---|
| ham / Ham | `ham` | Zdrojově legitimní/běžná zpráva; ne potvrzení bezpečnosti. |
| spam / Spam | `spam` | Nevyžádaná zpráva/reklama; ne automaticky phishing. |
| smishing / Smishing | `smishing` | Zdrojově SMS phishing; lidský audit významu dosud chybí. |

Číselné labely, `phishing`, prázdné nebo jiné hodnoty se **nemapují odhadem**.
Záznam se odloží a zmrazení se zablokuje. Skupina s různými platnými labely se
celá vyřadí z eligible dat; člověk musí schválit odložení. Nesouhlas při kontrole
se nesmí přepsat na „confirmed“ kvůli průchodu testu. Oprava vyžaduje doloženou
novou datovou revizi a nový audit. Trénovací třídy nejsou stavy výsledku API.

## Licence, původ a atribuce

Citace vydavatele: mishra, sandhya; Soni, Devpriya (2022), *SMS PHISHING DATASET
FOR MACHINE LEARNING AND PATTERN RECOGNITION*, Mendeley Data, V1,
doi:10.17632/f45bkkt8pr.1. Copyright Sandhya Mishra a Devpriya Soni, 2022.
Při použití zachovat atribuci, odkaz na zdroj/licenci a popsat úpravy. Naše
úpravy budou audit, odložení řádků, normalizace pro grouping a skupinové dělení;
modelový text zůstává původní. Public repozitář neobsahuje raw zprávy.

Vydavatel popisuje internetové obrázky/screenshoty převedené na text a labelování
podle zdroje. Děkuje Tiago A. Almeida a Dr. Gunikhan Sonowal za zprávy. Podrobný
původ a oprávnění každého převzatého řádku nebyly ověřeny. Licence na stránce
není potvrzení kvality labelů ani úplný audit této upstream lineage. Tuto mezeru
uvést v pozdější dataset/model card. UCI SMS Spam Collection nebyla přidána.

## Konkrétní blokátor a jeho reprodukce

Python urllib GET původní stránky, veřejného metadata API a **odkazu na původní
archiv nalezeného ve veřejném browser seznamu** vrátily HTTP 403 Forbidden.
Veřejná stránka i seznam byly v prohlížeči čitelné; stažení archivu přes její
odkaz skončilo timeoutem 30 s. Neprováděli jsme přihlášení, obcházení ochrany,
stahování mirroru ani spuštění přiložených Python souborů.

```sh
.venv/bin/python scripts/fetch_dataset.py
# Skutečný výsledek 10. 10. 2026: exit 2,
# {"status": "blocked", "code": "http_error", "http_status": 403}
```

CLI nedělá retry. Je to explicitní setup, není součástí instalace/aplikační
analýzy. Lokální import funguje offline; postup v [docs/DATA_PREPARATION.md](docs/DATA_PREPARATION.md).
Úspěšně stažený soubor je třeba uložit do ignorovaného `ml/data/raw/` nebo předat
jako absolutní cestu. Bez souboru nevytváříme reálný split ani prázdný „úspěšný“
manifest. Strojový záznam blokátoru: [preparation-status.json](docs/data/preparation-status.json).

Po importu **skutečného původního souboru** jsou naměřené hodnoty v lokálních
`provenance.json` (archive + CSV hash), `audit.json` (počty, chyby, skupiny, jazyky)
a po lidské kontrole v `ml/manifests/mendeley-v1.split.json` + `.sha256`.
Při odblokování aktualizovat tuto tabulku, stavový JSON a STATUS skutečnými
hodnotami; raw obsah ani lokální review preview do commitu nevkládat.
