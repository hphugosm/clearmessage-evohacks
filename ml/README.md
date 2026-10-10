# ML — původní data importovaná, model není připraven

Uživatel dodal Mendeley V1 `Dataset_5971.zip`. Raw/CSV SHA-256, 5 971 řádků,
tři třídy a automatický audit jsou doloženy. Konzervativní grouping odložil
46 konfliktních skupin (98 řádků). Neměnný návrh 70/15/15 nad 5 873 eligible
záznamy má prázdné průniky ID/skupin/hashů a **`data_split_ready=false`**.
Finální freeze stále vyžaduje 45 skutečných lidských label/language review a
lidské schválení odložení konfliktů. Žádné rozhodnutí nebylo automaticky potvrzeno.

- Zdroj, licence, skutečné počty/hashi a omezení: [DATA_SOURCES.md](../DATA_SOURCES.md).
- Audit/plan-split/freeze/verify příkazy: [DATA_PREPARATION.md](../docs/DATA_PREPARATION.md).
- České development/blind formáty: [czech/README.md](czech/README.md), zatím 0 záznamů.
- Raw texty a review previews pouze v ignorovaném `ml/data/`; veřejný candidate
  v `ml/manifests/` neobsahuje žádný text zprávy. Nepovažovat jej za reviewed data.

`backend/inference.py` stále hlásí `ready=False`, `version=None`,
`model_not_ready`. Žádný model, artefakt, metriky, sklearn ani encoder se nyní
nestahují ani netrénují. Třídy ham/spam/smishing nejsou stavy API. Později fitovat
learned preprocessing pouze na train a oba modely porovnat na stejném finálním
splitu. No/yes indikátory nejsou phishing labels ani modelové features.
