# API kontrakt 1.1.0 — analysis-policy-1

Zdrojem je `backend/contracts.py`; `docs/openapi.json` a generovaný
`frontend/src/api.schema.ts` se kontrolují na drift. Aktualizace:

```sh
.venv/bin/python scripts/export_contract.py
npm --prefix frontend run contract:generate
```

## POST /api/analyze

```json
{"text":"Please send me your password.","message_language":"en"}
```

JSON, 1–2 000 Unicode code points, nebílý text, nejvýše 32 768 bajtů těla
včetně JSON. Žádné tiché zkrácení. Neplatné typy/extra fields/query se odmítají.
`message_language` je `auto/cs/en/other`. `auto` znamená nezadáno; UI jazyk
se neposílá, není detekcí jazyka a neopravňuje k českým/anglickým tvrzením o výkonu.

Příklad skutečné odpovědi uloženého Goal02 modelu (nejde o vložený fixture verdict):

```json
{
  "status": "suspicious",
  "analysis_complete": false,
  "headline_key": "suspicious_signals",
  "evidence": [{"key":"request_for_secret","basis":"observed_text_signal"}],
  "action_keys": ["verify_independently","do_not_send_secrets","ask_trusted_person"],
  "limitations": ["language_not_evaluated","human_review_incomplete","policy_not_validated","not_a_safety_confirmation"],
  "message_language": "en",
  "model_version": "clearmessage-sparse-v1:7fe727cfb786",
  "policy_version": "analysis-policy-1",
  "contract_version": "1.1.0",
  "share_summary_keys": ["analysis_not_completed","help_verify_independently"]
}
```

`status` je doporučený výstup, nikoli datasetový label:

- `suspicious`: pozorovaný textový požadavek nebo omezené klasifikátorové varování.
- `review`: další nezávislé ověření; také nejisté skóre, samotný spam, chybějící
  model, chyby, nedostatek textu, nepodporovaný jazyk či neúplné pokrytí.
- `no_strong_signals`: rezervovaný nízký nález, který **není v této verzi povolen**.
  Vyžaduje dokončenou analýzu, ověřený model/jazyk/policy a nulovou evidence.

`analysis_complete` je nezávislý stav úplnosti. Aktuální artefakt vždy vrací
`false`: 41 lidských review pending, jazykový výkon neověřen, nízká policy
nevalidovaná. Pozitivní pravidlo může varovat i při výpadku modelu, ale odpověď
pak přizná `inference_unavailable/rules_only`. HTTP 200 ≠ dokončené posouzení.
Při neexistujícím/poškozeném artefaktu je `model_version=null` a `model_not_ready`.

Evidence obsahuje nejvýše tři pevné klíče, žádné citace, URL či skóre:
`request_for_secret`, `payment_pressure`, `secrecy_request` mají
`observed_text_signal`; `model_signal` má `classifier` a jen obecnou formulaci
podobnosti s tréninkovou třídou, nikoli vymyšlené důležité slovo. Samotný spam
se nemění na phishing. Podrobnosti a omezení: `docs/POLICY.md`.

Nejvýše tři `action_keys`: nezávislé ověření známou cestou, podle signálu
nesdělit tajný údaj nebo zastavit platbu, požádat důvěryhodnou osobu.
`limitations` vždy obsahují `not_a_safety_confirmation`. Podoba CZ/EN je pevná.
Klient kontroluje celý kontrakt, evidence basis i invariant úplnosti;
neznámá či poškozená odpověď zobrazí neprovedenou kontrolu.

`share_summary_keys` umožňují pouze dvě neutrální pevné věty. Po explicitním
otevření náhledu může uživatel ručně kopírovat nebo dalším gestem otevřít systémový
Web Share dialog. Payload má **jen `text` sestavený z pevných šablon**: žádný
zdrojový text, status, evidence, URL, příjemce ani osobní údaje. Zrušení dialogu
není chyba analýzy. Žádný clipboard API, automatické odeslání ani integrace.

## Chyby a health

Pevné chyby mají `analysis_complete=false`, `error_key`, `contract_version`;
nikdy Pydantic input/loc/ctx, text výjimky či zdrojovou zprávu.

| HTTP | error_key | Situace |
|---|---|---|
| 400 | unexpected_query / invalid_input / request_rejected | Query nebo poškozený požadavek |
| 413 | body_too_large | Tělo přes 32 KiB |
| 415 | json_required | Nesprávný Content-Type |
| 422 | invalid_input | Prázdný/dlouhý text, typy, extra fields, JSON |
| 404 / 405 | not_found / method_not_allowed | Cesta/metoda |
| 500 | service_unavailable | Sanitizovaná vnitřní chyba |

Inference chyba/obsazený slot vrátí HTTP 200 s omezeným review nebo konkrétním
pravidlovým varováním. Klient má timeout 10 s a nikdy z timeoutu nevytvoří nález.
Změna textu nebo jazyka zprávy odstraní předchozí výsledek i share preview.

`GET /api/health`: `service_status=ok`, `model_ready` znamená načtený hashově
ověřený artefakt, **nikoli schválenou kvalitu detektoru**.
Aktuálně `human_review_complete=false`, `evaluated_message_languages=[]`.
Health vrací verze a limity. `/api/openapi.json` nevyžaduje externí CDN.

## Soukromí a provoz

Text jen v RAM vlastního backendu; žádná historie, user cache, telemetry,
trénink z uživatelských vstupů, třetí API, cookies nebo browser storage.
Launcher vypíná access log; všechny odpovědi mají no-store/nosniff/no-referrer/CSP.
API odmítá query string. Souběh: jeden proces, 32 přijatých spojení a jeden
neblokující modelový slot, bez fronty soukromých textů na inference.

Sparse model zpracuje celý povolený text bez tokenizer cap; to není tvrzení,
že rozumí každému slovu. Interface výslovně přenáší full_text_coverage; false
nedovolí klasifikátorové varování ani dokončený nízký nález. URL se jen syntakticky
parsují. `tldextract` má `suffix_list_urls=()`, `cache_dir=None`, vestavěný PSL
snapshot bez refresh/DNS/HTTP. Doména, HTTPS ani zkracovač nejsou fraud evidence.
Při analýze se nic nestahuje. Hosting/proxy logy a HTTPS vyžadují ověření před
případným zvlášť schváleným nasazením; v tomto kroku žádné neproběhlo.
