---
name: spomenici-provera
description: Proverava projekat Spomenici posle izmene, pre nego što se izmena javi kao gotova — integritet podataka (alati/integritet.py), tipove (tsc preko jsconfig.json), izgled i rad aplikacije na ekranu telefona (snimak u Chrome-u bez prozora) i, kad je bitno, brzinu (alati/merenje.mjs). Koristi ga uvek kad menjaš data/spomeniks.json, data/bez_lokacije.json, slike, JS ili CSS aplikacije, ili alate koji upisuju podatke, i kad korisnik pita „radi li“, „proveri“ ili „jel sve u redu“, čak i ako ne pominje proveru izričito.
---

# Provera posle izmene

Korisnik komituje sam i oslanja se na to da je izmena proverena kad kažeš da je gotova. Zato pokreni korake koji se odnose na izmenu, iz korena repozitorijuma (Python uvek sa `python -I`), i javi šta je provereno i kako.

| Izmena | Koraci |
|---|---|
| podaci (`data/*.json`) | 1, a 3 ako se menja nešto što aplikacija prikazuje |
| nove slike | 1, sa alatima za slike |
| JS, CSS, HTML aplikacije | 2 i 3; 4 ako može da uspori |
| polja podataka (dodato, preimenovano) | 1, 2 i 3, plus `data/tipovi.d.ts` |

## 1. Podaci

```
python -I alati/integritet.py
```

Prolazi kad vrati izlazni status 0; stvarne greške i novi parovi na manje od 30 m vraćaju status 1. Poznati parovi (park i spomenik u njemu, grobnica i ploča na Senjaku) ostaju u ispisu, ali ne obaraju proveru: izuzeci su navedeni po tačnim ID-jevima u `POZNATI_BLISKI_PAROVI`, ne samo po ukupnom broju. Ako provera prijavi grešku, utvrdi da li je nastala tvojom izmenom; nemoj je automatski proglasiti poznatim izuzetkom.

JSON se upisuje u formatu koji čuva čiste razlike u gitu (UTF-8, CRLF, uvlačenje 2):

```python
open(P, 'w', encoding='utf8', newline='').write(json.dumps(d, ensure_ascii=False, indent=2).replace('\n', '\r\n') + '\r\n')
```

Posle upisa `git diff --stat` treba da pokaže samo redove koje si menjao; hiljade izmenjenih redova znače da je format pokvaren.

### Obrada novih slika

Pre uklanjanja metapodataka zabeleži izvor, autora, licencu i datum dokaza. Sliku pravilno orijentiši i iseci pre umanjivanja na 400 px i WebP; zatim iz korena repozitorijuma pokreni:

```powershell
python -I alati/bez_metapodataka.py --upisi
python -I alati/male_slike.py
python -I alati/slike_odnos.py
python -I alati/integritet.py
```

Prvi alat menja slike u `slike/spomenici/` i `slike/bez-lokacije/` bez ponovnog sažimanja; čuva ICC profil i EXIF potreban za orijentaciju. Drugi pravi male slike iz konačnih velikih slika i prati njihovo vreme izmene, pa ide posle čišćenja; spisak bez lokacije male slike ne treba, jer se ne prikazuje u traci. Treći upisuje `slikaOdnos` iz dimenzija slika i u bazu i u spisak bez lokacije, gde ne menja redosled polja; integritet proverava konačne podatke. Ovo je zajednički redosled za žetvu, standard i dokumentaciju alata; ne održavati različite redoslede na drugim mestima.

### Veze radnih zapisa i knjiga

Kad brišeš, spajaš ili prebacuješ stavke iz `data/bez_lokacije.json`, proveri `uparivanje` u svim `data/knjige/*.json` i aktivne `radniIndeks` pokazivače u `data/provere/`. Numeričke indekse pomeri tako da i dalje označavaju isti objekat; istorijske pokazivače poput `radniIndeksPre` sačuvaj. Ciljevi ka ID-jevima moraju i dalje postojati ili biti dokumentovano prevezani na postojeći unos.

Uporedi rezultat sa snimkom pre promene: broj dodatih i uklonjenih stavki, ID-jeve, koordinate, GoogleCID, izvore i stanja. Promene moraju odgovarati odobrenom obimu i izveštaju. Integritet i testovi aplikacije ne potvrđuju identitet ili današnji opstanak spomenika; za to proveri pojedinačni dokaz i njegov datum po [postupku žetve](../spomenici-zetva/references/lociranje-i-stanje.md).

## 2. Tipovi

```
npx -y -p typescript tsc -p jsconfig.json
```

Prolazi bez ispisa. Provera hvata pristup polju koje ne postoji (npr. ostatak preimenovanog polja), pa posle svake izmene polja ažuriraj `data/tipovi.d.ts`. Globalne najave (Leaflet, `Element.on`, `querySelector` vraća `HTMLElement`) su u `data/globalno.d.ts`; `sw.js` je izostavljen jer service worker ima drugo globalno okruženje.

Kod je pisan bez tačke-zareza. Red koji počinje zagradom, npr. oznaka tipa `/** @type {X} */ (izraz)`, JavaScript čita kao poziv prethodnog reda i aplikacija pada; takav izraz dodeli promenljivoj.

## 3. Aplikacija

Prvo automatski test glavnih tokova (mapa, prozor spomenika iz `#id`, pretraga, filteri, ruta, greške u aplikaciji); sam pokreće server i traje oko pola minuta:

```
node --test alati/test.mjs
```

Kad dodaješ novu funkciju aplikacije, dodaj i njen tok u `alati/test.mjs`. Zajednički kod za upravljanje pregledačem je u `alati/pregledac.mjs`.

Zatim pogledaj izmenu. Aplikacija se koristi samo na telefonu, pa se gleda na ekranu telefona (390 × 844, dodir):

```
bash .claude/skills/spomenici-provera/scripts/aplikacija.sh <scratchpad>/proba.png "<JS izraz>" [čekanje ms]
```

Skripta pokreće lokalni server, otvara aplikaciju, izvršava izraz, snima ekran i gasi server. `HASH=#<id>` otvara prozor spomenika, a `W=1440 H=900` daje širinu računara. Prolazi kad nema `EXC` u ispisu, kad `EVAL` vrati očekivanu vrednost i kad snimak izgleda kako treba; snimak zato uvek pogledaj.

Za izraz:
- prozori su web komponente sa shadow DOM-om, npr. `document.querySelector('detalji-spomenika').shadowRoot`;
- filteri se iscrtavaju tek kad se otvore, pa ih prvo otvori dugmetom „Filteri“;
- tooltip na prelazak mišem ne postoji uz dodir; za njega treba Chrome bez emulacije dodira i `Input.dispatchMouseEvent`.

Emulacija ne zamenjuje pravi telefon: za izmene izgleda reci korisniku da ih proveri na svom.

## 4. Brzina

```
bash -c 'python -m http.server 8765 >/dev/null 2>&1 & s=$!; sleep 2; node alati/merenje.mjs; kill $s'
```

Ciljevi (procesor usporen 6 puta, ekran 390 px):

| Merilo | Cilj |
|---|---|
| Prvi obelisci (lokalno) | < 2,5 s |
| Najduži zadatak pri otvaranju | < 0,5 s |
| Korak zuma | < 0,2 s |
| Slovo u pretrazi | < 0,1 s |
| Preneto pri hladnom otvaranju | < 0,8 MB |

Isto merenje varira 20–30%, pa su značajne samo veće razlike. Ako server ostane upaljen, ugasi ga kao u `scripts/aplikacija.sh`.

## Javljanje

Kratko, na srpskom: šta je izmenjeno, koji koraci su prošli i, ako neki nije urađen ili nije prošao, koji i zašto.
