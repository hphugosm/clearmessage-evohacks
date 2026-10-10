# API kontrakt 1.0.0

Zdrojem je `backend/contracts.py`. `docs/openapi.json` je export FastAPI;
`frontend/src/api.schema.ts` je z něj generovaný TypeScript. Kontroly driftu jsou
součástí `sh scripts/test.sh`. Při záměrné změně kontraktu spusťte:

```sh
.venv/bin/python scripts/export_contract.py
npm --prefix frontend run contract:generate
```

## POST /api/analyze

JSON s `Content-Type: application/json`:

```json
{"text":"Fictional message: meeting at school tomorrow.","message_language":"en"}
```

`text` má 1–2 000 Unicode znaků (code points), bez tichého oříznutí. Prázdný nebo
jen bílý text je neplatný. Tělo má limit 32 768 bajtů, včetně JSON escapování;
streamovaný vstup je omezen i bez důvěry v Content-Length. Číselné texty, pole,
neznámá pole a nesprávné typy se odmítají.

`message_language`: `auto` (výchozí), `cs`, `en`, `other`. Je to vstupní jazyková
nápověda, nikoli zjištěný jazyk ani tvrzení o modelovém pokrytí. `auto` v této
verzi znamená nezadaný jazyk; detekce se zatím neprovádí. UI jazyk se neposílá.
Anglický text i anglické UI jsou dostupné, výkon modelu není ověřen v žádném jazyce.

Platný vstup aktuálně vždy vrátí HTTP 200 s tímto **stavem služby**, bez analýzy:

```json
{
  "status": "review",
  "analysis_complete": false,
  "headline_key": "model_not_ready",
  "evidence": [],
  "action_keys": ["verify_independently", "do_not_send_secrets", "ask_trusted_person"],
  "limitations": ["model_not_ready", "language_not_evaluated", "not_a_safety_confirmation"],
  "message_language": "en",
  "model_version": null,
  "policy_version": "foundation-1",
  "contract_version": "1.0.0",
  "share_summary_keys": ["analysis_not_completed", "help_verify_independently"]
}
```

HTTP 200 pouze potvrzuje zpracování požadavku, nikoli dokončenou kontrolu zprávy.
Není evidence, klasifikace, procento ani tvrzení o bezpečnosti. Obecné rady nejsou
nálezy v textu. `model_version: null` je skutečně nepřítomný model.

Schéma už rezervuje `suspicious`, `review`, `no_strong_signals`. Tyto stavy nejsou
trénovací labely ham/spam/smishing. `no_strong_signals` smí později vzniknout jen
při dokončené analýze v ověřeném rozsahu, s neprázdnou verzí modelu a výslovným
omezením `not_a_safety_confirmation`. Validator odmítá neúplnou uklidňující
odpověď. Frontend zatím přijímá pouze kontrakt nepřítomného modelu; jiný či
poškozený payload znamená neprovedenou kontrolu. Napojení skutečné policy musí
tento gate vědomě rozšířit v pozdějším goalu.

`evidence` rezervuje nejvýše tři pevné klíče s původem `classifier` nebo
`observed_text_signal`; žádný volný text vstupu. Pravidla budou označena jako
pozorované textové signály, ne jako vysvětlení vah klasifikátoru. Action/limitation
klíče se překládají pevnými texty v UI. `share_summary_keys` obsahují jen pevné
neutrální klíče; v Goal 00 není sdílecí funkce ani automatické odesílání.

## Chyby

Chyby mají vždy `analysis_complete: false`, pevný `error_key` a `contract_version`.
Neobsahují vstup, Pydantic `input/loc/ctx`, výjimku ani raw odpověď služby.

| HTTP | error_key | Situace |
|---|---|---|
| 400 | unexpected_query / invalid_input / request_rejected | Query na API, poškozená hlavička nebo JSON |
| 413 | body_too_large | Tělo přes 32 KiB |
| 415 | json_required | Jiný Content-Type |
| 422 | invalid_input | Prázdný / dlouhý text, typy, neznámá pole, neplatný JSON |
| 404 / 405 | not_found / method_not_allowed | Neznámá cesta / metoda |
| 500 | service_unavailable | Vnitřní chyba; neprovedená analýza |

Klient má timeout 10 sekund. Timeout, síťová chyba, serverová chyba i neznámý
payload zobrazí „Kontrola neproběhla“. Po změně textu/jazyka zprávy se starý
výsledek odstraní. Chyba nikdy nevytváří výsledek `no_strong_signals`.

## GET /api/health

Živá služba: `service_status: ok`; chybějící model: `model_ready: false`,
`model_version: null`, `evaluated_message_languages: []`. Vrací také verze
kontraktu/policy a limity. Běh služby není důkaz připravenosti detektoru.
Strojově čitelné schéma je na `/api/openapi.json`; Swagger/externí CDN jsou vypnuté.

## Soukromí a provoz

Pouze vlastní backend a RAM během požadavku. Zprávy nejsou v URL, historii,
cookies, browser storage, logách, telemetry, tréninku ani třetím API. API odmítá
query string; schválený launcher vypíná Uvicorn access log a nastavuje limit
32 souběžných spojení na jediný proces. V této verzi není žádná inference, takže
tokenové pokrytí a souběh inference zatím nelze ověřit a musí být omezeny před
napojením modelu.

Všechny odpovědi API i servírovaného buildu mají `Cache-Control: no-store`,
`nosniff`, `no-referrer` a CSP bez externích zdrojů. Vite dev server je pouze pro
lokální vývoj. Text se nevykresluje jako HTML, žádné vložené odkazy se neotevírají
ani neposílají do DNS/HTTP. Není tldextract, model loader ani runtime stahování.
Traces, metriky, native logs a autokonfigurace FastAPI jsou výslovně vypnuté;
povinná knihovna OpenTelemetry API je v locku, bez SDK/exporteru a bez instrumentace.

Před veřejným nasazením bude nutné ověřit HTTPS, limity a logování konkrétního
hostingu/reverse proxy. Jejich konfigurace v tomto goalu není ověřena.
