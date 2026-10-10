# 03 — Analýza, důvody a bezpečná automatizace

Celý následující blok vlož do Codexu, nebo ho nech načíst z tohoto souboru.

```text
/goal Implementuj skutečný analyzační tok Klidné zprávy: text → vlastní model z goal 02 → transparentní pravidla → srozumitelný bezpečný postup a návrh prosby o pomoc. Dodrž AGENTS.md; nebuduj externí agenty ani integrace.

Připoj reálný model přes malé rozhraní a verzuj policy. Rozliš stav suspicious, review a no_strong_signals a samostatně analysis_complete. Rozhodnutí nezalož jen na nejvyšší třídě: respektuj nastavené prahy, jazykový rozsah, neúplné pokrytí tokenizerem a chyby. Při chybě modelu nemůže vzniknout uklidňující výsledek. Spojení pravidel a modelu musí být vysvětlitelné a testované. Když fungují jen pravidla, přiznej omezenou kontrolu.

Vytvoř malý soubor pravidel s důkazem v textu: žádost o sdělení hesla/OTP, nátlak na okamžitou platbu, utajení před důvěryhodnou osobou. Dbej na negaci a běžná bezpečnostní upozornění. Samotný spam, HTTPS, konkrétní TLD, pravopisná chyba či krátký odkaz nejsou důkaz podvodu. URL pouze syntakticky parsuj; tldextract musí mít vypnuté načítání PSL. Žádné navštěvování, DNS, WHOIS, screenshoty webů ani rozbalování přesměrování.

Připrav CZ/EN šablony nejvýše tří důvodů a tří kroků. Každý konkrétní důvod musí odpovídat skutečnému signálu, nikoli vymyšlenému vysvětlení ML. Není-li konkrétní důkaz, dej obecnou poctivou formulaci a omezení. Doporuč ověření nezávislou známou cestou, ne linkem/telefonem ze zprávy. Nízký nález nikdy nenazývej bezpečím.

Návrh prosby o pomoc sestav jen z neutrálních schválených šablon. Nikdy do sdíleného payloadu nevkládej zdrojovou zprávu, evidence snippet, URL, jméno, účet či kód. Odeslání musí zůstat lidským rozhodnutím. Přidej stručné ručně kontrolovatelné rady pro situaci „už jsem klikl/a“ bez sběru dalších tajných údajů.

HOTOVO: integrovaná API analýza funguje na reálném modelu; jsou otestované konfliktní signály, reklamní i legitimní zprávy, požadavek bez URL, výpadek a překročení limitu. Test no-egress potvrzuje nulové síťové dotazy při analýze. Přidej canary testy logů/sdílení, aktualizuj STATUS.md a commit.
```
