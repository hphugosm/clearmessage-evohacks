# Akceptační kritéria a red-team kontrola

Zatím nejsou splněna; jde o zadání. Při přejímce zapisovat skutečné příkazy,
verze, datum, výsledek a případný blokátor do STATUS.md / testovacího reportu.
Žádné kritérium se neoznačí za splněné jen proto, že k němu vznikl kód.

## A. Funkční průchod

- Čistá instalace podle README spustí frontend i API. Health endpoint rozlišuje
  běžící službu a připravený skutečný model.
- Vložený text projde skutečnou inference. Žádný matching tří demo řetězců.
- Výstup vždy obsahuje bezpečný další krok a informace o omezeních.
- Ukázky jsou viditelně demonstrační. Neobsahují skutečné škodlivé URL.
- Prázdný, velmi krátký, příliš dlouhý a nepodporovaný vstup nemá uklidňující závěr.
- Timeout, offline API, chybějící model a interní chyba nikdy nevrátí low/safe výsledek.
- Zpráva zmiňující heslo v bezpečnostním upozornění není automaticky považována
  za žádost o heslo. Reklama není automaticky potvrzený podvod.
- Podvodná žádost bez URL se může vyhodnotit jako podezřelá; absence odkazu není
  záruka bezpečnosti. HTTPS, běžná TLD nebo uvedené jméno instituce nejsou záruka.

## B. Soukromí a zpracování nepřátelského obsahu

- Zachytit stdout/stderr, aplikační access/error logy a validační chyby pro zprávu
  s unikátními canary hodnotami. Tyto hodnoty se nikde v záznamech neobjeví.
- Ověřit, že zpráva není v query stringu, localStorage, cookies, DB, cache response,
  URL stránky, analytice, telemetry či volání třetí straně. Nastavit no-store.
- V integračním testu zakázat odchozí síťové spojení po načtení modelu a potvrdit,
  že analýza přesto funguje. Zvlášť zkontrolovat tldextract a runtime model loader.
- Vstupy s localhost, privátní IP, IPv6, URL s @, Unicode/IDNA, javascript:, HTML,
  event handlery a textem „ignore previous instructions“ se nesmějí vykonat/otevřít.
- Nalezené URL nejsou klikatelné. React nesmí vykreslit cizí HTML.
- Sdílený payload je postaven ze schválených šablon; neobsahuje canary e-mail,
  telefon, OTP, účet, původní text, adresu odkazu ani citaci soukromé zprávy.
- Uživatel vidí preview a sám zahájí sdílení/kopírování. Zrušení dialogu není chyba
  analýzy. Neexistuje automatické poslání rodině, bance, policii nebo platformě.
- Ve veřejném repu nejsou tajné klíče, uživatelská data ani raw datasetové škodlivé
  příklady na screenshotu. Instalační skripty nestahují a neprovádějí cizí datasetový kód.

## C. ML

- Zaznamenat původ a hash datasetu, explicitní mapování tří labelů a počty po čištění.
- Test průniku ID/skupin/hashů mezi train/val/test musí být prázdný.
- U překladů, šablon a near-duplicates prověřit skupinové dělení; uvést neřešitelné
  omezení identifikace skutečných kampaní či časového původu.
- Slovník TF-IDF a další naučené transformace se fitují pouze na train.
- Baseline i embeddingová alternativa jsou vyhodnocené na shodných datech.
- Prahy a kandidát vybrané podle validace před finálním testem. Žádné opakované
  přizpůsobování testu. Když se to stane, report říká „development“, nikoli „held-out“.
- Report obsahuje confusion matrix a per-class precision, recall, F1 s počty;
  model a finální policy zvlášť. Abstention rate nesmí skrýt nízké pokrytí.
- CZ výsledky oddělit od EN. U syntetických/ručních příkladů to uvést ve zprávě.
- Skutečný tokenizer nesmí tiše zahodit konec vstupu a vrátit uklidnění. Otestovat
  škodlivý pokyn za limitem, kontradiktorní signály a velmi krátký obsah.
- Žádné pevně zadané metriky, smyšlené SHAP hodnoty, záruky ochrany nebo veřejné
  „pravděpodobnosti podvodu“ bez odpovídající evidence.

## D. UX/přístupnost

- Mobilní šířka 360 px, klávesnice, viditelný focus a 200% zoom bez ztráty funkcí.
- Správný label textového pole, focus/error management a ohlášení změny stavu čtečce.
- Nejvýše tři stručné důvody a kroky; důležité varování se nemusí rozklikávat.
- Barva nikdy není jediná informace. Kontrast změřit, ne odhadnout.
- CZ a EN mají kompletní texty. Nezaměňovat jazyk rozhraní za jazyk zprávy.
- Výsledek nepoužívá slova safe/bezpečné/ověřeno jako potvrzení vstupu.
- Pokud proběhne lidský test: tester bez návodu vloží příklad, popíše význam výsledku
  a vybere bezpečný krok. Zapsat skutečný počet osob a poznatky, ne marketingové metriky.
  Testy s dětmi jedině vhodně s vědomím zákonného zástupce a s fiktivními zprávami.

## E. OCR — pouze při zapnutém bonusu

- Pouze PNG/JPEG, limit velikosti a počtu pixelů, žádný SVG/PDF či ZIP.
- Obraz zůstává v prohlížeči; rozpoznaný text se zobrazí k opravě před odesláním.
- Nekvalitní/blank screenshot vede k ručnímu vložení, ne „neškodný“ výsledek.
- Uvolnit object URL/worker a zdroje po dokončení; neukládat obrázek mezi návštěvami.
- Test s blokovanou vnější sítí při již dostupných lokálních OCR assetech;
  nepoužívat tajně cloud OCR jako fallback.

## F. Odevzdání

- Aplikace nebo lokální postup funguje po čistém klonu podle instrukcí.
- Veřejné repo je pro porotce přístupné bez přihlášení, pokud ho uživatel publikoval.
- Nahrané video má 2–3 min, fungující zvuk a čitelné UI; zkontrolovat jeho přehrání.
- Popis neobsahuje neprovedené testy jako výsledky; uvádí použití Codexu a reuse.
- Model card, dataset credits a third-party licence přiloženy.
- Uživatel skutečně zkontroluje a odešle Devpost nejpozději 19:00 plánovaného dne.
