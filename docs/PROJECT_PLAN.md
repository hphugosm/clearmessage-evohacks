# Klidná zpráva — kompletní plán do konce EVOHACKS

**Stav dokumentu:** návrh z 10. 10. 2026. Není to zpráva o hotové implementaci.
Všechny časové údaje jsou Europe/Prague. Ověřené zdroje a licence jsou v RESEARCH.md.

## 1. Produkt jednou větou

Vlož krátkou zprávu a aplikace ti srozumitelně ukáže její varovné znaky a bezpečný
postup, případně připraví stručnou prosbu o pomoc někomu, komu důvěřuješ.

Nejde o antivirus, ověření identity odesílatele ani potvrzení bezpečnosti odkazu.
MVP pracuje s textem SMS, krátkého chatu nebo krátkého e-mailu. Kvalita na dlouhých
mailech, přílohách, celých konverzacích a jiných jazycích se nesmí předstírat.

### Proč tento rozsah

Chceme vlastní ML a reálnou automatizaci. Automatizujeme čtení, hledání signálů,
prioritizaci a přípravu dalšího kroku. Nepotřebujeme rizikový přístup do schránky.
Těžiště demonstrace není barevné procento, ale okamžik, kdy uživatel rozumí tomu,
co nemá posílat a jak si tvrzení ověřit bez použití kontaktu z podezřelé zprávy.

### Přesný průchod

1. Úvod: „Přišla vám zpráva, kterou si nejste jistí?“ a jedna velká textová plocha.
   Hlavní tlačítko „Zkontrolovat zprávu“. Volitelně tři zřetelně označené příklady.
2. Krátké upozornění před odesláním: nevkládat hesla a ověřovací kódy; text se
   zpracuje na našem serveru, neukládá se do historie ani nepoužívá k trénování.
   Toto tvrzení musí odpovídat skutečné konfiguraci aplikace a logování hostingu.
3. Analýza: syntaktické zpracování, skutečný model, pravidla, kontrola omezení.
4. Výsledek: jedna věta, nejvýše tři důvody a nejvýše tři bezpečné kroky.
5. Volitelné „Požádat někoho o pomoc“ připraví neutrální shrnutí bez soukromého
   obsahu. Uživatel ho nejdříve uvidí a sám zkopíruje nebo sdílí.
6. Malý rozbalovací oddíl „Už jsem klikl/a nebo něco poslal/a“ poskytne předem
   zkontrolovanou obecnou radu podle situace. Nevyžaduje zadání údajů o účtu.

### Tři výsledky

**suspicious:** „Zpráva má podezřelé znaky. Zatím nic neposílejte.“ Důvody musí být
skutečně nalezené. Pokud je jediným podkladem klasifikátor, říci to obecně; nevymýšlet
konkrétní doménu, žádost o heslo ani telefonát, které text neobsahuje.

**review:** „Tuto zprávu neumíme spolehlivě posoudit. Ověřte ji jinou cestou.“ Tento
stav je správný u nejistoty, ne chybou produktu. Výpadek služby se navíc jasně označí
jako neprovedená kontrola, nikoli jako úspěšně dokončené hodnocení.

**no_strong_signals:** „Nenašli jsme výrazné varovné znaky. To nepotvrzuje bezpečnost
zprávy.“ Jen při dokončené analýze a v deklarovaném rozsahu. Žádný zelený štít se
slovem bezpečné. Ani tento stav neopravňuje nabídnout kliknutí na původní odkaz.

Příklady signálů: požadavek na předání hesla nebo kódu, nátlak na okamžitou platbu,
žádost o utajení před blízkými. Samotná reklama, chyba v češtině, HTTPS, krátký odkaz,
slovo „banka“ nebo internacionalizovaná doména nesmějí rozhodovat o podvodu.
Pravidla musí rozlišovat žádost o sdělení kódu od věty „svůj kód nikomu nesdělujte“.

## 2. Co ano a co ne

| Priorita | Rozsah |
|---|---|
| Povinné | Vložení textu, vlastní natrénovaný klasifikátor, tři výsledky včetně nejistoty, pravdivé důvody, bezpečné další kroky, kopie bezpečného shrnutí, CZ/EN UI, testy, spuštění podle README, Devpost a demo. |
| Bonus po funkčním jádru | Screenshot PNG/JPEG → lokální OCR → kontrola rozpoznaného textu uživatelem. |
| Vynechat | Přihlášení, historie, databáze, Gmail/WhatsApp integrace, telefonní aplikace navíc, automatické blokování, přílohy/PDF, reputační crawling, vlastní LLM, druhý URL model, hlasový asistent, placené externí inference API. |

Screenshot není fyzická kamera. Nepotřebuje vlastní hardware. Přesto není podmínkou
odevzdání; obtížné OCR by nemělo ohrozit textové MVP.

## 3. Harmonogram

Časy jsou rozpočty práce a kontrolní body, ne příslib rychlosti agenta. Pokud se
začne později, škrtají se bonusy. Model bez ověření ani video bez aplikace se
nevydávají za dokončený projekt.

### Sobota 10. 10. — od aktuální chvíle

| Blok | Činnost | Co musí existovat na konci |
|---|---|---|
| 0–20 min | Potvrdit rozsah, otevřít repo, založit koncept Devpostu, poslat dotaz organizátorovi, zvolit dostupný hosting. | Jedna věta produktu, cesta k repu, známé omezení hostingu. |
| Dalších 45–60 min | Goal 00. | Frontend skutečně volá API; Docker sestaví kostru; absence modelu se přiznává. |
| Dalších 45–75 min | Goal 01. | Stažená a zkontrolovaná data nebo doložený datový blokátor, licence a pevné dělení dat. |
| Dalších 60–90 min | Goal 02. | Natrénovaný baseline, první skutečné metriky; porovnání embeddingové varianty v omezeném rozsahu. |
| Do přibližně 23:30 | Goal 03 a jednoduché propojení. | Skutečný model → API → důvody a postup. Alespoň lokální end-to-end průchod. |

Do noci neslibujeme hotové OCR ani mnoho integrací. Přerušit práci v uloženém,
reprodukovatelném stavu a vyspat se je součástí plánu.

### Neděle 11. 10.

| Čas | Priorita |
|---|---|
| 09:00–10:30 | Goal 04: dokončit jednoduché CZ/EN UI a srozumitelné texty. |
| 10:30–12:00 | Goal 05: otestovat skutečné nasazení nebo čistý lokální Docker jako odevzdatelnou zálohu. |
| 12:00–13:00 | Pouze je-li jádro zelené: Goal 06 OCR. Jinak chyby, model a čitelnost. |
| 13:00–14:30 | Goal 07: nezávislé české příklady, funkční/bezpečnostní testy, několik skutečných uživatelských pozorování, je-li kdo dostupný. |
| 14:30–15:00 | Opravit kritické problémy a zmrazit funkce/model/policy. Po zásahu do modelu přiznat, které testy byly použity pro ladění. |
| 15:00–17:00 | Goal 08: README, model card, licence, popis Devpostu, záznam 2–3min videa. |
| 17:00–19:00 | Nahrát, projít jako anonymní porotce, ověřit veřejnost repa, přehrání videa a odkaz/aplikaci. **Odevzdat do 19:00.** |
| 19:00–20:59 | Rezerva pro chyby odevzdání; ne stavba nových funkcí. |
| 21:00–22:00 | Být připraven na živé hodnocení podle pravidel a pokynů organizátora. |

## 4. Data a poctivý ML experiment

### Hlavní dataset

Mishra/Soni, Mendeley, DOI 10.17632/f45bkkt8pr.1. Popis uvádí 5 971 zpráv:
4 844 ham, 489 spam a 638 smishing. Pole zahrnují LABEL, TEXT a indikátory URL,
EMAIL, PHONE. Licence CC BY 4.0. Při implementaci zkontrolovat skutečný soubor,
počet řádků, chybějící hodnoty, jazyk a shodu s dokumentací; nepředpokládat je.

Záměrně začínáme krátkými zprávami. Není to validační sada dlouhých e-mailů ani
současných českých rodinných/chatových podvodů. Rozšíření e-mailovými korpusy
odložit, dokud nejsou vyřešené jejich labely, překryvy a licence.

### Pipeline

A. Import raw CSV bez vykonávání kódu; zdroj, datum, verze, hash, licence, autor.
B. Audit alespoň 15 náhodných zpráv z každé třídy, konfliktní labely odložit.
C. Kanonizace pro deduplikaci, shluky opakovaných šablon; text pro model zachovat
   tak, aby se nesmazaly bezpečnostně významné znaky. Duplicitní varianty držet spolu.
D. Skupinové dělení přibližně 70 % trénink / 15 % validace / 15 % test při zachování
   rozumného zastoupení tříd. Pokud metadata dovolí, ověřit i držení zdrojů odděleně.
   Uvést, když časové/kampaňové oddělení nelze z dat spolehlivě zjistit.
E. TF-IDF word/char + LogisticRegression ve sklearn Pipeline. Výpočet slovníku a
   další naučené předzpracování pouze na tréninku. Uložit i jednoduchý majoritní baseline.
F. Alternativa: zmrazený paraphrase-multilingual-MiniLM-L12-v2 → 384D vektor →
   vlastní LogisticRegression head. Nejdříve malý rychlostní experiment, pak cache
   veřejných tréninkových embeddingů. Bez jemného dotrénování celého transformeru.
G. Výběr varianty a rozhodovacích prahů pouze podle validace, chyb a naměřené
   latence. Žádné rozsáhlé hledání hyperparametrů; nejvýše několik předem stanovených
   variant a stejné splity pro srovnání.
H. Finální vyhodnocení na dosud nepoužitém testu; zapsat skutečné počty a výsledky.

Tři trénovací třídy nejsou totéž co tři výstupní stavy UI. Nad modelem je samostatná
policy zohledňující nejistotu, pravidla, jazyk, pokrytí textu a zdravotní stav služby.

### Čeština

Vícejazyčný encoder je rozumný kandidát, nikoli důkaz, že anglické labely fungují
v češtině. Doporučení: vytvořit přibližně 30 českých vývojových příkladů a odděleně
60 nezávislých zkušebních příkladů (20 běžných, 20 spamových, 20 podvodných).
Zahrnout platné kódy s varováním před sdílením, školní zprávy, reklamní SMS,
rodinné žádosti, zásilky, platební nátlak, neutrální odkazy a neúplné zprávy.

Tým musí labely ručně zkontrolovat. AI může navrhnout rozmanité příklady, ale ty
jsou syntetické. Oddělený test nesmí agent při tvorbě pravidel číst. Překlady a
parafráze stejné zprávy patří do stejné skupiny; nesmějí prosakovat mezi splity.
Pokud se challenge set použije na opravy, už není slepý test a musí být tak označen.
Značně slabší čeština znamená přísnější přiznávání nejistoty nebo omezení rozsahu,
ne nahrazení výsledků pěknou číslicí.

### Co zveřejnit

Počty v každé třídě a splitu, per-class precision/recall/F1, confusion matrix,
počty false negatives/false positives, výsledky základního modelu i celé policy,
kolik vstupů končí nejistotou a kolik podezřelých mezi zbylými bylo přehlédnuto.
EN a CZ zvlášť. Uvést čas inference a zařízení, na němž se měřil. Žádné garantované
procento přesnosti, žádné tvrzení o ochraně proti všem podvodům.

## 5. Technická architektura

```text
React + TypeScript + Vite (CZ/EN)
           |
           | POST /api/analyze (text, language)
           v
FastAPI + Pydantic
   ├── omezení vstupu, normalizace, žádné logování zpráv
   ├── lokální zpracování URL bez síťových dotazů
   ├── skutečný ML klasifikátor
   ├── verzovaná pravidla a rozhodovací policy
   └── pevné bezpečné texty / shrnutí pro pomoc

Jeden Docker kontejner: API zároveň servíruje frontend build.
Žádná DB, žádný externí LLM, žádný přístup do osobní schránky.
```

Doporučené rozhraní: `POST /api/analyze`, `GET /api/health`. Odpověď nese
`status`, `analysis_complete`, `headline_key`, `evidence`, `action_keys`,
`limitations`, `model_version`, `policy_version`, `share_summary_keys`.
Interní skóre lze měřit v testech; uživateli se nepředkládá jako pravděpodobnost podvodu.
Z UI se nesmí vytvořit odkaz na původní detekovanou URL.

MVP hard limit navrhnout 2 000 znaků. Před inference ověřit skutečný tokenový limit
encoderu. Příliš dlouhý text nesmí být tiše oříznut a potom „uklidněn“; vrací review
s vysvětlením omezení, případně podezřelé znaky z úplně provedených pravidel.
Chunkování je možné až jako samostatně otestované rozšíření, ne improvizace těsně
před uzávěrkou. UI jazyk a jazyk zprávy se nesmějí zaměňovat.

### Přístupnost

Jeden sloupec, základní text navržený okolo 20 px, tlačítka alespoň 48 px vysoká,
viditelný focus, ovládání klávesnicí, správné labely, stav čitelný čtečkou, bez
významu ukrytého jen v barvě. Zkontrolovat kontrast, mobil, 200% přiblížení,
`prefers-reduced-motion` a chybové stavy. Nevyžadovat datum narození ani označení
„senior“. Žádné patronizování, strašení či obviňování. Žádný marketingový odpočet.

## 6. Bezpečnost a soukromí

Nedělat HTTP/DNS/WHOIS/reputační dotazy na odkazy ze zpráv. tldextract s vypnutým
stahováním PSL; hostnames pouze parsovat. Žádný `dangerouslySetInnerHTML` ani
zobrazení vzdálených obrázků. Cizí zpráva nesmí změnit zadání modelu ani agenta.

Model a balíčky mohou potřebovat internet při explicitní instalaci; při analýze
nikoliv. Text se zpracuje v paměti backendu. V produkci ověřit i reverse proxy,
error tracking a volby hostingu. Nepoužívat cookies ani analytiku pro tento MVP.
Použít HTTPS, `Cache-Control: no-store`, jasné validační chyby bez echo vstupu,
limity těla/requestů a malý limit souběžné inference. Žádné tajné tokeny ve frontendu.

Shrnutí pro pomoc sestavit výhradně z neutrálních šablon. Nejde o dokonalou
anonymizaci volného textu — proto se do sdílení vůbec nepřebírá. Uživatel může
přidat vlastní vysvětlení až mimo aplikaci. Web Share API s fallbackem kopírování;
žádné samovolné odeslání kontaktům.

## 7. Nasazení a náklady

Povinná odevzdatelná varianta je Docker + opravdu ověřené lokální instrukce.
Cílové veřejné nasazení je tentýž kontejner za HTTPS na již dostupném serveru
nebo v povoleném účtu Docker Spaces. Nevyžadovat GPU ani externí LLM kredit.

Pozor: aktuální dokumentace Hugging Face uvádí, že vytváření Docker/Gradio Spaces
vyžaduje placený plán, i když CPU Basic nemá hodinový poplatek. Nepředpokládat
zaručený hosting zdarma. Codex nesmí sám pořizovat předplatné. Dostupnost účtu
ověřit hned, ne v neděli večer. Není-li veřejný host včas, Devpost podle zadání
umožňuje instrukce pro lokální testování; video musí ukazovat skutečnou lokální aplikaci.

## 8. Co dělá člověk a co Codex

Codex: implementuje po malých cílech, píše testy, trénuje, měří, dokumentuje,
navrhuje opravy a poskytuje skutečné příkazy/výstupy. Člověk: kontroluje labely,
rozumí chybám modelu, zkouší UI jako uživatel, schvaluje veřejné publikování,
natočí video a skutečně odešle Devpost. Předplatné, hesla a peníze zůstávají u člověka.

Po každém cíli požadovat: co funguje, co chybí, testy s výsledky, jak to vyzkoušet,
commit a další povolený cíl. Zbývající problém není důvod k předstírání hotovosti.

## 9. Záložní scénáře

| Problém | Rozhodnutí |
|---|---|
| Dataset nelze stáhnout | Doložit chybu a připravit import souboru ručně získaného z původního zdroje. Nahradit jej jen zdrojem s ověřenými labely a licencí; ne vydávat spam corpus za phishing. |
| Encoder je moc pomalý/nejde stáhnout | Zachovat reálně trénovaný TF-IDF baseline, otevřeně omezit jazyky a výkon, CZ bez odpovídajícího ověření pouze review / pravidlová upozornění. |
| Model má mnoho falešných uklidnění | Opravit integraci a zkontrolovat únik dat; zvýšit míru review podle validace, ukázat skutečné limity, neskrývat chyby z výsledků. |
| OCR je nespolehlivé | Vypnout feature flag; textové MVP zůstává plně funkční. |
| Nestíhá se UI | Jeden čistý formulář a výsledek; žádné grafy, animace ani další stránka statistik. |
| Nestíhá se hosting | Ověřit lokální Docker a README; pravdivé video a lokální instrukce. |
| Organizátor nepovolí předtrénované části | Nepoužít je; přehodnotit proveditelnost baseline a doložit zdroje. Změnu netajit. |

## 10. Odevzdání a demo 2:30

0:00–0:20: člověk dostane naléhavou zprávu a neví, jak postupovat.
0:20–1:05: skutečný podezřelý příklad → důvody → bezpečný postup → shrnutí pro pomoc.
1:05–1:30: běžná nebo reklamní zpráva; žádné ztotožnění reklamy s podvodem.
1:30–1:45: neúplný vstup nebo chyba; aplikace přizná, že kontrolu nezvládla.
1:45–2:15: krátký pohled na kód inference, vlastní training pipeline a skutečné
metriky; přesně odlišit předtrénovaný encoder od našeho klasifikátoru.
2:15–2:30: komu aplikace pomáhá, co automatizuje, její omezení a funkční odkaz.

Všechny ukázky jsou označené jako demonstrační. Žádné živé podvodné odkazy,
žádná citlivá data a žádná sestříhaná obrazovka předstírající neexistující funkci.

Devpost obsahuje: veřejný repozitář, video 2–3 min, podrobný popis využití AI a
postupu, live URL nebo funkční instalační instrukce, licence/zdroje a přiznané použití
Codexu. Nevykazovat počty uživatelů, úspory času ani ochranu před podvody bez měření.
