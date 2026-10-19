# Alati (fascikla `alati/`)

Pokreću se iz korena repozitorijuma: Python sa `python -I alati/<alat>.py`, a Node sa `node alati/<alat>.mjs`.

| Alat | Namena |
|---|---|
| `integritet.py` | Provera spomenika na mapi (oba fajla, i da je svaki zapis u pravom): polja, pismo, slike, duplikati na manje od 30 m; i spiska bez lokacije: jedinstveni ID-jevi u oba spiska i veze iz knjiga i izveštaja koje se razrešavaju. Pokreće se posle svake izmene podataka. |
| `test_integritet.py` | `python -I alati/test_integritet.py`: izolovana provera izlaznog statusa; stvarne greške vraćaju 1, ispravni podaci i tačno navedeni poznati bliski parovi vraćaju 0. |
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
| `test.mjs` | `node --test alati/test.mjs`: glavni tokovi aplikacije u Chrome-u bez prozora. |
| `test_zapis.py` | `python -I -B alati/test_zapis.py`: proverava zaključavanje između procesa, oslobađanje posle pada, ugnježdene pozive i atomaran upis JSON-a. |
| `snimi.mjs <izlaz.png> [js] [ms]` | Snimak aplikacije na ekranu telefona. |
| `merenje.mjs [url]` | Brzina aplikacije na sporom telefonu i sporoj vezi. |
| `pregledac.mjs` | Zajednički kod za upravljanje Chrome-om, za `snimi.mjs`, `merenje.mjs` i `test.mjs`. |

Pri paralelnom radu obuhvati čitanje i upis blokom `with zakljucani_podaci():` iz `zapis.py`; pravila i primer su u [AGENTS.md](../AGENTS.md). Samo zaključavanje završnog upisa ne sprečava prepisivanje novijih podataka starom kopijom.
