# 05 — Reprodukovatelné spuštění a včasné nasazení

Celý následující blok vlož do Codexu, nebo ho nech načíst z tohoto souboru.

```text
/goal Připrav a ověř odevzdatelnou verzi Klidné zprávy v jednom Docker kontejneru. Použij již implementovaný model/API/frontend, nepřidávej nové funkce. Dodrž AGENTS.md a odděl ověřené lokální spuštění od veřejného nasazení.

Dokonči multi-stage build, v němž FastAPI servíruje frontend i /api. Model a tokenizer připrav při explicitním setup/build kroku s fixovanou revizí a hashem, ne při každé analýze. Netrénuj model při requestu nebo každém restartu. Nevyžaduj GPU. Změř skutečný start, paměť a latenci; nastav rozumnou malou souběžnost, limity requestů a zdravotní kontrolu modelu.

Vytvoř reprodukovatelné instrukce od čistého klonu. Pokud modelový artefakt není v repu, popiš jednoznačný způsob jeho získání či lokálního tréninku a integritní kontrolu. Nespouštěj cizí pickle. Nezaměňuj lokální testy za nasazení na cizím účtu. README musí uvádět skutečně vyzkoušené příkazy a všechny limity.

Pro veřejný host použij pouze již známý a uživatelem autorizovaný server/účet. Ověř HTTPS, veřejnou dostupnost porotci, no-store, absence logování těl i v proxy a zákaz egress při analýze. Nikdy nevytvářej placený plán ani nezveřejňuj repozitář bez souhlasu. Aktuální dokumentace Hugging Face uvádí placený plán pro vytvoření Docker Spaces, proto neslibuj univerzálně bezplatné nasazení. Není-li přístup vyřešený, připrav konfiguraci, dolož blokátor a dokonči lokální variantu; Devpost umožňuje lokální instrukce.

Projeď tři end-to-end příklady a chybu modelu v čistém prostředí. Zkontroluj, že produkce nepoužívá fixture model ani mock API. Diagnostika nesmí zveřejňovat texty zpráv, interní cesty či tajné proměnné.

HOTOVO: existuje opravdu otestované spuštění a deployment report se skutečnou URL, pouze pokud se nasazení uskutečnilo. Jinak explicitní blokátor a plně doložený lokální fallback. Aktualizuj STATUS.md a commit; nepředstírej veřejnou dostupnost a automaticky nic neposílej na Devpost.
```
