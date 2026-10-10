# ML — data tooling, model není připraven

Aktuální krok připravil offline import původního Mendeley V1 CSV/ZIP, audit,
lidský review vzorek, konzervativní seskupení a neměnný split po lidské kontrole.
**Raw download je blokován HTTP 403: žádná skutečná data, hash, split ani lidský
label audit nejsou hotové.** Testy mají pouze vlastní fiktivní zprávy.

- Zdroj, licence, význam labelů a blokátor: [DATA_SOURCES.md](../DATA_SOURCES.md).
- Přesné audit/freeze/verify příkazy: [DATA_PREPARATION.md](../docs/DATA_PREPARATION.md).
- České development/blind formáty a nezávislý postup: [czech/README.md](czech/README.md).
- Raw texty a review preview zůstávají v ignorovaném `ml/data/`; až po skutečném
  auditu vznikne veřejný text-free `ml/manifests/*.split.json` + SHA-256.

`backend/inference.py` stále hlásí `ready=False`, `version=None`,
`model_not_ready`. Žádný model, artefakt, metriky, sklearn ani encoder se nyní
nestahují ani netrénují. Žádný keyword fallback nebo datasetové demo matching.
Třídy ham/spam/smishing nejsou stavy API. Pozdější model musí zachovat pevné
splity, fitovat preprocessing pouze na train a doložit jazyky/pokrytí.
