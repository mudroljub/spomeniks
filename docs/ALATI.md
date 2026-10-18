# Alati (fascikla `alati/`)

Pokreću se iz korena repozitorijuma: Python sa `python -I alati/<alat>.py`, a Node sa `node alati/<alat>.mjs`.

| Alat | Namena |
|---|---|
| `integritet.py` | Provera celog `data/spomeniks.json`: polja, pismo, slike, duplikati na manje od 30 m; i spiska bez lokacije: jedinstveni ID-jevi u oba spiska i veze iz knjiga i izveštaja koje se razrešavaju. Pokreće se posle svake izmene podataka. |
| `test_integritet.py` | `python -I alati/test_integritet.py`: izolovana provera izlaznog statusa; stvarne greške vraćaju 1, ispravni podaci i tačno navedeni poznati bliski parovi vraćaju 0. |
| `prebaci.py <ulaz.json>` | Prebacuje stavke iz `data/bez_lokacije.json` na mapu po ID-ju (`[{id, lat, lng, priblizno}]`); stavka zadržava ID, pa veze iz knjiga i izveštaja ostaju tačne. |
| `razdeli.mjs [--provera]` | Iz `data/spomeniks.json` pravi fajlove koje učitava aplikacija: `mapa-prvo.json` (vidljivi do zuma 9, tačna lokacija) i `mapa-ostalo.json`, bez polja `izvor`. Pokreće se posle svake izmene baze; `--provera` samo javlja zastarelost (koristi je `integritet.py`). |
| `zapis.py` | Redosled polja zapisa (`poredaj`), zajednički za sve alate koji pišu u `data/spomeniks.json`. |
| `commons_dodaj.py <spisak.json> <fajlovi.json>` | Dodaje spomenike ili fotografije sa Commons-a: preuzima sliku, pravi webp, potpis i mesto iz najbližeg naselja. |
| `proveri.py <link>` | Iz Google linka čita ime, koordinate i id i nalazi najbliže spomenike u bazi. |
| `upisi_cid.py <id> <link>` | Upisuje Google id i lokaciju postojećem spomeniku. |
| `dodaj_google.py <vrsta> <link> <naziv> …` | Dodaje nove spomenike sa Google linkova. |
| `google_slike.mjs <izlaz.json>` | Za spomenike bez slike sa Google id-om pamti adresu glavne fotografije sa Google mapa. |
| `bez_metapodataka.py`, `male_slike.py`, `slike_odnos.py` | Čišćenje metapodataka, male slike i odnos širine/visine; redosled i komande su u [skilu provere](../.claude/skills/spomenici-provera/SKILL.md#obrada-novih-slika). |
| `naselja_osm.json` | Naselja iz OSM-a, za polje `mesto`. |
| `test.mjs` | `node --test alati/test.mjs`: glavni tokovi aplikacije u Chrome-u bez prozora. |
| `snimi.mjs <izlaz.png> [js] [ms]` | Snimak aplikacije na ekranu telefona. |
| `merenje.mjs [url]` | Brzina aplikacije na sporom telefonu i sporoj vezi. |
| `pregledac.mjs` | Zajednički kod za upravljanje Chrome-om, za `snimi.mjs`, `merenje.mjs` i `test.mjs`. |
