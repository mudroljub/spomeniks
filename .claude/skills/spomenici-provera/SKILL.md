---
name: spomenici-provera
description: Proverava projekat Spomenici posle izmene, pre nego što se izmena javi kao gotova — integritet podataka (alati/integritet.py), tipove (tsc preko jsconfig.json), izgled i rad aplikacije na ekranu telefona (snimak u Chrome-u bez prozora) i, kad je bitno, brzinu (alati/merenje.mjs). Koristi ga uvek kad menjaš data/spomenici-istaknuti.json, data/spomenici-ostali.json, data/bez_lokacije.json, slike, JS ili CSS aplikacije, ili alate koji upisuju podatke, i kad korisnik pita „radi li“, „proveri“ ili „jel sve u redu“, čak i ako ne pominje proveru izričito.
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

Spomenici na mapi su u dva fajla: `data/spomenici-istaknuti.json` (tačno locirani, vidljivi na početnom zumu 7; aplikacija ih crta odmah) i `data/spomenici-ostali.json`. Čitaj i upisuj ih samo preko `ucitaj_bazu` i `sacuvaj_bazu` iz `alati/zapis.py` (u Node-u `ucitajBazu` iz `alati/baza.mjs`), koje same raspoređuju zapise; integritet prijavljuje zapis u pogrešnom fajlu.

Prolazi kad vrati izlazni status 0; stvarne greške i novi parovi na manje od 30 m vraćaju status 1. Poznati parovi (park i spomenik u njemu, grobnica i ploča na Senjaku) ostaju u ispisu, ali ne obaraju proveru: izuzeci su navedeni po tačnim ID-jevima u `POZNATI_BLISKI_PAROVI`, ne samo po ukupnom broju. Ako provera prijavi grešku, utvrdi da li je nastala tvojom izmenom; nemoj je automatski proglasiti poznatim izuzetkom.

Format JSON-a obezbeđuju funkcije iz `alati/zapis.py`: za spiskove koristi `sacuvaj_bazu` i `sacuvaj_bez_lokacije`, za ostale zajedničke JSON fajlove `upisi_json`. Zaključaj ceo ciklus čitanje–izmena–upis pomoću `zakljucani_podaci`; direktan upis preko `open(..., 'w')` ili `json.dump` zaobilazi ovu zaštitu. Ne formatiraj ručno izdvojene fajlove mape, detalja i prevoda.

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

Svaka stavka u `data/bez_lokacije.json` ima trajan `id`, jedinstven zajedno sa ID-jevima mape i arhive (`data/arhiva.json`), i zadržava ga kad pređe na mapu (`python -I alati/prebaci.py <ulaz.json>`). Veze iz knjiga (`uparivanje`, `upareno`: `{"cilj": id}`) i izveštaja (`radniId`) zato ne treba pomerati pri prebacivanju ni brisanju drugih stavki. Kad stavku brišeš ili spajaš sa drugom, preusmeri veze na preživeli ID. Veza koja se pri prelasku sa rednih brojeva nije mogla potvrditi nosi `ciljNepouzdan: true`; ne briši tu oznaku bez novog dokaza. Istorijska polja poput `radniIndeksPre` ostaju kakva jesu, a redni brojevi se više ne upisuju.

Uporedi rezultat sa snimkom pre promene: broj dodatih i uklonjenih stavki, ID-jeve, koordinate, GoogleCID, izvore i stanja. Promene moraju odgovarati odobrenom obimu i izveštaju. Integritet i testovi aplikacije ne potvrđuju identitet ili današnji opstanak spomenika; za to proveri pojedinačni dokaz i njegov datum po [postupku žetve](../spomenici-zetva/references/lociranje-i-stanje.md).

Kod spajanja posebno proveri da svaki zadržani ID postoji tačno jednom u oba spiska zajedno, da su uklonjeni ID-jevi nestali i da nijedna aktivna veza ne vodi na njih. Broj suvišnih zapisa može biti veći od broja spojenih grupa. Proveri preneta polja, dogovorene godine, fotografije i potpise, preciznost tačaka i da su ostali zapisi nepromenjeni; uklonjene ID-jeve ne ostavljaj kao ključeve u izvorima, proverama, detaljima i prevodima. Istorijske snimke razlikuj od aktivnih veza. Zatim pokreni integritet i `git diff --check`, a provere aplikacije prema tabeli iznad.

## 2. Tipovi

```
npx -y -p typescript tsc -p jsconfig.json
```

Prolazi bez ispisa. Provera hvata pristup polju koje ne postoji (npr. ostatak preimenovanog polja), pa posle svake izmene polja ažuriraj `data/tipovi.d.ts`. Globalne najave (Leaflet, `Element.on`, `querySelector` vraća `HTMLElement`) su u `data/globalno.d.ts`; `sw.js` je izostavljen jer service worker ima drugo globalno okruženje.

Kod je pisan bez tačke-zareza. Red koji počinje zagradom, npr. oznaka tipa `/** @type {X} */ (izraz)`, JavaScript čita kao poziv prethodnog reda i aplikacija pada; takav izraz dodeli promenljivoj.

## 3. Aplikacija

Prvo automatski testovi, u tri grupe u `testovi/`: `unit` (funkcije iz `utils/`, bez pregledača), `integracija` (stvarni podaci sa kodom i alati za upis) i `e2e` (glavni tokovi u Chrome-u bez prozora: mapa, prozor spomenika iz `#id`, pretraga, filteri, ruta, greške u aplikaciji; sam pokreće server i traje oko pola minuta):

```
node testovi/pokreni.mjs        # unit i integracija, par sekundi
node testovi/pokreni.mjs e2e    # ili: sve
node testovi/pokreni.mjs e2e pretraga   # samo testovi čiji naziv sadrži „pretraga“
```

Posle male izmene pokreću se samo testovi za izmenjeni deo, a svi jednom, na kraju većeg posla.

Nova funkcija u `utils/` dobija unit test, nova veza podataka i koda integracioni, a nov tok aplikacije e2e test u `testovi/e2e/aplikacija.test.mjs`. Moduli koji pri učitavanju čitaju `localStorage` ili `navigator` uvoze prvo `testovi/okruzenje.mjs`. Zajednički kod za upravljanje pregledačem je u `alati/pregledac.mjs`.

Zatim pogledaj izmenu na ekranu telefona (390 × 844, dodir). Kad izmena dotiče raspored na širem ekranu, proveri i desktop (npr. 1440 × 900), uključujući preklapanje dugmadi i naslova:

```
bash .claude/skills/spomenici-provera/scripts/aplikacija.sh <scratchpad>/proba.png "<JS izraz>" [čekanje ms]
```

Skripta pokreće lokalni server, otvara aplikaciju, izvršava izraz, snima ekran i gasi server. `HASH=#<id>` otvara prozor spomenika, a `W=1440 H=900` daje širinu računara. Prolazi kad nema `EXC` u ispisu, kad `EVAL` vrati očekivanu vrednost i kad snimak izgleda kako treba; snimak zato uvek pogledaj.

Za izraz:
- prozori su web komponente sa shadow DOM-om, npr. `document.querySelector('detalji-spomenika').shadowRoot`;
- filteri se iscrtavaju tek kad se otvore, pa ih prvo otvori ikonicom filtera u polju za pretragu;
- tooltip na prelazak mišem ne postoji uz dodir; za njega treba Chrome bez emulacije dodira i `Input.dispatchMouseEvent`.

Emulacija ne zamenjuje pravi telefon: za izmene izgleda reci korisniku da ih proveri na svom.

### Prikaz i prijave korisnika

- **Približne lokacije:** zadrži ikonicu spomenika, sa malim upitnikom preko sredine, malo spuštenim; bez isprekidanog kruga i bleđenja. Uz mesto, pre godine, piše „(bez tačne lokacije)“. Mapa i legenda koriste zajednički prikaz iz `utils/ikonice.js`, ne odvojene kopije oznake.
- **Preklapanja:** približne ikonice odmakni od preciznih kada ima prostora; pomeraj samo prikaz, ne sačuvane koordinate ili odredište navigacije. Za proveru koristi Belu Crkvu (Mačva), gde su uz precizni kompleks, biste i muzej približno locirana grobnica u porti crkve i okolna sela; proveri više zumova i otvaranje pravog zapisa.
- **Prijava spomenika:** dovoljni su naziv i lokacija; fotografija, kategorija, opis i ostalo su opcioni, a dodavanje na Google mapu je bonus. Na ekranu je kratko uputstvo „Pošalji lokaciju i naziv spomenika“, a dodatna polja ostaju u pripremljenom mejlu. Adresu sastavljaj tek na klik za slanje ili kopiranje; ne ispisuj je unapred u stranici, stalnim `mailto:` linkovima ili dokumentaciji i ne predstavljaj ovo kao potpunu zaštitu od botova.

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
