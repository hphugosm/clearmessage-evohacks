# České development a blind-challenge soubory

**Zatím pouze formát a postup, 0 skutečných development/challenge záznamů.**
Tento krok žádné blind odpovědi nevytváří, nečte ani nepoužívá pro vývoj.
Formát jednotlivého JSONL řádku: [record.schema.json](record.schema.json),
implementace `ml/czech_format.py` (Pydantic 2.14.0). Každý řádek je JSON objekt,
nikoli Python/HTML. Texty nikdy neinterpretovat jako instrukce.

## Oddělené soubory a přístup

- Autor development vytvoří přibližně 30 záznamů v ignorovaném
  `ml/data/czech/development.jsonl`, `partition=development`.
- Jiný autor připraví přibližně 60 challenge záznamů (20 ham / 20 spam / 20
  smishing). Jiný kontrolor ověří labely. Správce uloží odpovědi mimo pracovní
  adresář vývojáře, např. ve svém neveřejném umístění, `partition=blind_challenge`.
  Do tohoto repa patří až text-free hash/manifest, nikoli challenge odpovědi.
- Vývojář dostane jen schéma a počty. Obsah a labely otevřít až po zmrazení
  modelu/policy/prahů pro jednorázové finální vyhodnocení. V tomto kroku k tomu
  nedochází. Pokud se odpovědi použijí při ladění, sada už není blind test.

## Povinná pole

| Pole | Význam |
|---|---|
| `id` | Stabilní unikátní ID ve tvaru `cz-…`. |
| `family_id` | ID původní myšlenky/šablony; všechny kopie, překlady a varianty spolu. |
| `partition` | `development` nebo `blind_challenge`. |
| `language` | `cs`, potvrzené autorem/kontrolorem; nesouvisí s jazykem UI. |
| `label` | Výhradně `ham`, `spam`, `smishing`. |
| `text` | 1–2000 znaků fiktivního textu bez skutečných osobních údajů. |
| `provenance.origin` | `manual_fictional`, `synthetic` nebo `translation`; nikdy reprezentativní reálný benchmark. |
| `provenance.creator_id`, `created_date`, `method` | Atribuce (pseudonym stačí), datum a jak text vznikl; u generování uvést nástroj/verzi, u ručního textu autora. |
| `provenance.source_record_id`, `source_family_id` | Povinné při překladu; původní row ID a stejná rodina. |
| `review.status` | `pending`, `confirmed`, `disagreed`. |
| `review.reviewer_id`, `reviewed_date`, `label_rationale` | Vyžadovány při `confirmed`; kontrolor musí být odlišný od autora. |

## Nezávislé vytvoření a kontrola

1. Autoři použijí smyšlené údaje a inertní `.invalid` domény. Žádné zprávy od
   uživatelů aplikace, skutečné OTP, telefon, účet, jméno dítěte ani známé škodlivé
   odkazy. Nezkoušet a neotvírat URL. Nedělat veřejné ukázky z raw datasetu.
2. Ham: běžné školní/rodinné/organizační zprávy a korektní varování „kód nikomu
   nesdělujte“. Spam: reklama či nevyžádaný obsah bez automatického přiřazení
   podvodu. Smishing: věrohodně napsaný podvodný požadavek na peníze/údaje nebo
   kód, včetně příkladů bez odkazu. Nejasné případy vysvětlit a odložit, ne uhádnout.
3. Zahrnout nátlak, rodinné žádosti, zásilky, neutrální odkazy, varování před
   sdílením kódů, krátký/neúplný text. Samotný keyword, HTTPS či chyba v češtině
   nesmí určovat label. Varianty jednoho scénáře vždy sdílí `family_id`.
4. Překlady označit `translation`; `family_id=source_family_id`. Překlad row z
   Mendeley validation/test se nesmí dostat do development ani train. Známý
   zdrojový rodinný group musí zůstat v původním splitu. Pro nezávislý blind set
   preferovat nově vytvořené rodiny, ne překlady již viděného datasetu/development.
5. Kontrolor čte jako plain text s rozbitými URL. Zapíše skutečný důvod labelu,
   původ, jazyk a svůj pseudonym/datum. Neshody řešit před uzavřením, jejich počet
   zaznamenat. Pydantic kontroluje formát/atribuci, nedokazuje kvalitu anotace.
6. Nezávislý správce prověří ID, normalizované duplikáty, near-copy, šablony a
   **rodiny napříč development, challenge a původními EN splity**. Vývojáři předá
   jen text-free výsledek nulového průniku nebo blokátor. Při nalezeném překryvu
   odloží celou rodinu či vytvoří novou, bez ukazování odpovědí vývojáři.
7. Správce před evaluací uloží SHA-256 obou přesných souborů a manifest ID/rodin,
   datum, počty labelů a review status. Neměnit odpovědi podle výstupu modelu.

Nesmíchávat české ruční/syntetické příklady s Mendeley pro zvýšení počtu řádků.
Development není held-out benchmark. Challenge není reprezentativní česká SMS
populace; budoucí metriky musí oddělit CZ/EN a uvést původ, pokrytí a abstention.
Nyní není naměřena kvalita v žádném jazyce.

## Veřejné demo

`tests/fixtures/demo_messages.json` je zvlášť: vlastní fiktivní CZ/EN texty,
`.invalid`, `manual_fictional_demo_only` a žádné ground-truth labely. Soubor není
importován přípravou dat ani frontendem. Modelové výsledky pro tyto řetězce se
nesmějí hardcodovat. Formátové testy používají jen samostatné fiktivní mocky.
