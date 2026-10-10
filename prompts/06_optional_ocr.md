# 06 — Bonus: screenshot bez kamery a bez cloud OCR

Celý následující blok vlož do Codexu, nebo ho nech načíst z tohoto souboru.

```text
/goal Tento goal je nepovinný. Nejdříve ověř v STATUS.md a testech, že textové MVP, skutečný model, bezpečná policy a odevzdatelné spuštění jsou funkční. Pokud ne, OCR nepřidávej a vysvětli důvod. Jinak přidej pouze screenshot PNG/JPEG → editovatelný text pomocí Tesseract.js v prohlížeči.

Dodrž AGENTS.md. Žádný přístup ke kameře, PDF, cizí webové screenshoty, cloud OCR ani externí multimodální API. Uživatel ručně vybere soubor, obraz zůstane v prohlížeči. Ověř skutečnou dostupnost českých a anglických jazykových dat a jejich licence. Worker, WASM a jazyky pokud možno servíruj z vlastního originu; stáhni je při přípravě, ne z URL ve zprávě.

Omez velikost souboru i dekódovaného obrazu, akceptuj pouze skutečné PNG/JPEG. Rozpoznaný text se musí zobrazit v editovatelném poli, aby ho uživatel opravil a sám potvrdil odeslání do analyzátoru. Nepouštěj model automaticky nad skrytým OCR výstupem. Prázdný, rozmazaný nebo nesmyslný výsledek nabídne ruční vložení. OCR nejistota nikdy nesmí skončit falešným uklidněním.

Uvolňuj object URLs/worker a paměť; žádné lokální uchovávání screenshotů mezi návštěvami. Za feature flagem musí stále fungovat původní textová aplikace. Neprováděj velký refactoring ostatních částí.

HOTOVO: testy na několika umělých CZ/EN screenshotech včetně rozmazaného obrázku a chybného formátu; ověřeno, že obraz neopouští browser, text se odesílá až po potvrzení a fallback funguje. Při potížích bonus vypni a zachovej textové MVP. Reportuj skutečnou kvalitu, aktualizuj STATUS.md a commit.
```
