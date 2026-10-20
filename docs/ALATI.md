# Alati (fascikla `alati/`)

Pokreću se iz korena repozitorijuma: Python sa `python -I alati/<alat>.py`, a Node sa `node alati/<alat>.mjs`.

Alati koji uvoze `zapis.py` takođe zahtevaju `node` na PATH-u: pri učitavanju preuzimaju gotov izračun zumova iz `utils/vaznost.js`, istog modula koji koristi aplikacija.

| Alat | Namena |
|---|---|
| `integritet.py` | Provera spomenika na mapi (oba fajla, i da je svaki zapis u pravom): polja, pismo, slike, duplikati na manje od 30 m; i spiska bez lokacije: jedinstveni ID-jevi u oba spiska i veze iz knjiga i izveštaja koje se razrešavaju. Pokreće se posle svake izmene podataka. |
| `prebaci.py <ulaz.json>` | Prebacuje stavke iz `data/bez_lokacije.json` na mapu po ID-ju (`[{id, lat, lng, priblizno}]`); stavka zadržava ID, pa veze iz knjiga i izveštaja ostaju tačne. |
| `pretraga.py` | Pronalaženje naših zapisa iz oba spiska: po blizini tačke, po mestu i po zajedničkim osnovama reči u nazivu (ćirilica, latinica i OCR tekst se porede posle normalizacije). Modul za skripte uparivanja i komanda: `python -I alati/pretraga.py blizu <lat> <lng> [m]`, `mesto <mesto> [država]`, `naziv <tekst>`. |
| `zapis.py` | Čitanje i upis podataka, zajednički za sve alate: `ucitaj_bazu` i `sacuvaj_bazu` za spomenike na mapi (raspoređuje ih u `data/spomenici-istaknuti.json` i `data/spomenici-ostali.json`), `sacuvaj_bez_lokacije`, redosled polja (`poredaj`); polje `izvor` premeštaju u `data/izvori.json`. U Node-u isto čita `baza.mjs`. |
| `commons_dodaj.py <spisak.json> <fajlovi.json>` | Dodaje spomenike ili fotografije sa Commons-a: preuzima sliku, pravi webp, potpis i mesto iz najbližeg naselja. |
| `proveri.py <link>` | Iz Google linka čita ime, koordinate i id i nalazi najbliže spomenike u bazi. |
| `upisi_cid.py <id> <link>` | Upisuje Google id i lokaciju postojećem spomeniku. |
| `dodaj_google.py <vrsta> <link> <naziv> …` | Dodaje nove spomenike sa Google linkova. |
| `google_slike.mjs <izlaz.json>` | Za spomenike bez slike sa Google id-om pamti adresu glavne fotografije sa Google mapa. |
| `bez_metapodataka.py`, `male_slike.py`, `slike_odnos.py` | Čišćenje metapodataka, male slike i odnos širine/visine; redosled i komande su u [skilu provere](../.claude/skills/spomenici-provera/SKILL.md#obrada-novih-slika). |
| `naselja_osm.json` | Naselja iz OSM-a, za polje `mesto`. |
| `snimi.mjs <izlaz.png> [js] [ms]` | Snimak aplikacije na ekranu telefona. |
| `merenje.mjs [url]` | Brzina aplikacije na sporom telefonu i sporoj vezi. |
| `pregledac.mjs` | Zajednički kod za upravljanje Chrome-om, za `snimi.mjs`, `merenje.mjs` i e2e testove. Chrome traži na uobičajenim mestima, a drugu putanju prima iz promenljive `CHROME`. |

## Testovi (fascikla `testovi/`)

`node testovi/pokreni.mjs [unit|integracija|e2e|sve]`; bez argumenta pokreće unit i integraciju (par sekundi). Isto preko `npm test`, `npm run test:e2e` i `npm run test:sve` (`package.json` ima samo skripte, bez paketa).

| Grupa | Sadržaj |
|---|---|
| `unit/` | Funkcije iz `utils/` bez pregledača: pretraga i HTML, jezik i padeži, ruta i oznake na uređaju, raspored oznaka, ikonice, prijava, članci, ture i važnost; odluke `sw.js` o kešu, sa lažnim kešom i mrežom. `okruzenje.mjs` daje `localStorage` i `navigator`. |
| `integracija/` | Stvarni podaci sa kodom (linkovi članaka, ture iz `data/ture.json`, slike markera, nazivi država i stanja); `test_zapis.py` (zaključavanje između procesa, atomaran upis) i `test_integritet.py` (izlazni status `integritet.py` na izolovanim podacima). |
| `e2e/` | Glavni tokovi aplikacije u Chrome-u bez prozora, na ekranu telefona; sam pokreće server. |

Pri paralelnom radu obuhvati čitanje i upis blokom `with zakljucani_podaci():` iz `zapis.py`; pravila i primer su u [AGENTS.md](../AGENTS.md). Samo zaključavanje završnog upisa ne sprečava prepisivanje novijih podataka starom kopijom.

## Objavljivanje aplikacije i offline keš

Dok je `devMode` u `utils/podesavanja.js` uključen, aplikacija ne registruje worker i gasi ranije instaliran, pa se otisak ne računa i integritet ga ne proverava. Pred objavu postavi `devMode` na `false` i pokreni `node alati/otisak.mjs` (ili `npm run otisak`). Alat računa otisak iz sadržaja svih resursa sa spiska u `sw.js` i samog workera, uz isti rezultat za LF i CRLF. Otisak označava sadržaj offline keša i nije semantički broj verzije. `python -I -B alati/integritet.py` proverava otisak i pada ako nije osvežen; zasebno ga proverava `npm run otisak:provera`. Komanda ne objavljuje aplikaciju.

Instalacija unapred preuzima komplet resursa u zaseban nepromenljiv keš izdanja. Dok je aplikacija na ekranu, novo izdanje čeka; kada ode u pozadinu (`visibilitychange`), worker prvo sačuva vezu svakog starog klijenta sa njegovim izdanjem, zatim se aktivira i traži ponovno učitavanje svih kartica. Stara kartica, čak i ako odloži ponovno učitavanje, dobija stare resurse; nova navigacija dobija novo izdanje. Stari keš se briše tek kad više nema njegovih klijenata. Ne dodavati bezuslovni `skipWaiting()` ili `clients.claim()`. Prva migracija sa izdanja koja još nemaju ovu poruku zahteva zatvaranje starih kartica jednom.

Fotografije imaju poseban keš: sačuvana slika se prikazuje odmah. Mrežna provera se ponavlja tek posle jednog dana ili novog izdanja; vreme provere ostaje sačuvano i kad se worker ugasi. Posle uspešne provere ažurirana slika se koristi pri sledećem učitavanju, dok neuspešna provera zadržava postojeću. Isto važi za male slike. Granice od 4.000 pločica i 1.500 slika primenjuju se pri svakom upisu i aktivaciji, nezavisno od broja zahteva pre gašenja workera.
