---
name: spomenici-zetva
description: Dobavljanje podataka za projekat Spomenici iz spoljnih izvora — novi spomenici, lokacije, fotografije, autori, godine i posvete sa Google mapa, Commons-a, OSM-a (Overpass, Nominatim), Vikipedije i Wikidate, registara i sajtova. Pravila prema serverima, postupci koji rade, pregled fotografija i obuhvat (samo NOB i Drugi svetski rat). Koristi ga uvek kad korisnik pošalje link ili članak o spomeniku, traži „dodaj“, „nađi sliku“, „nađi lokaciju“, „dopuni“, „posvećen je…“, ili kad prolaziš kroz `data/bez_lokacije.json` ili neki spisak spomenika.
---

# Žetva podataka

Standard zapisa (polja, nazivi, vrste, obuhvat) je u `references/standard.md`. Nazive određuje skil `spomenici-nazivi`, a posle svake izmene proveru radi skil `spomenici-provera`. Obrađeni izvori i nalazi se zapisuju u beleške projekta, da se posao ne ponavlja.

## Rad sa podacima

Na istim fajlovima istovremeno radi više agenata, pa se podaci čitaju i upisuju samo zajedničkim funkcijama iz `alati/zapis.py`, nikad ručnim `json.dump` u fajlove podataka:

- **Spomenici na mapi** su u `data/spomenici-istaknuti.json` (tačno locirani, vidljivi do zuma 9) i `data/spomenici-ostali.json`; `data/spomeniks.json` više ne postoji. Ceo spisak daje `ucitaj_bazu()`, a `sacuvaj_bazu(spisak)` sam stavlja svaki zapis u pravi fajl. U Node-u čita `ucitajBazu()` iz `alati/baza.mjs`.
- **Spisak bez lokacije** (`data/bez_lokacije.json`) upisuje `sacuvaj_bez_lokacije(spisak)`. Svaka stavka ima trajan `id`, jedinstven zajedno sa mapom, koji zadržava kad pređe na mapu (`alati/prebaci.py`); veze iz knjiga i izveštaja (`cilj`, `radniId`) pokazuju na taj ID i ne pomeraju se.
- **Izvor** zapisa se ne čuva u zapisu: alati ga upišu u polje `izvor`, a funkcije za upis ga premeste u `data/izvori.json` (ID → URL).
- **Kratko čitanje i upis:** učitaj podatke neposredno pre izmene i upiši ih odmah posle, u istom koraku. Spisak učitan ranije, pre dužeg posla ili pretrage na mreži, učitaj ponovo; inače se prepisuju izmene drugog agenta.
- **Posle upisa** proveri da su sopstveni dodati i izmenjeni zapisi i dalje tu, pa pokreni integritet. Nestanak bez odluke znači da je neko upisao stariju kopiju; vrati zapise i javi korisniku.
- **Poređenje sa našim zapisima** (da li već postoji, šta je blizu) radi `alati/pretraga.py`, za oba spiska odjednom, umesto novog skripta. Pre dodavanja proveri i blizinu tačke, ne samo naziv i mesto: isti spomenik često ima drugačiji ID, naziv ili oblik mesta.

Pregled obrađenosti je u [IZVORI.md](../../../docs/IZVORI.md), a rezultati i otvoreni tragovi u [LOCIRANJE_SPOMENIKA.md](../../../docs/LOCIRANJE_SPOMENIKA.md), [PROVERA_RUSENJA_HRVATSKA.md](../../../docs/PROVERA_RUSENJA_HRVATSKA.md) i [DOPUNA_PODATAKA.md](../../../docs/DOPUNA_PODATAKA.md). Preuzeti izvori (knjige, registri, skenovi) čuvaju se u `izvori/` u korenu repozitorijuma, koja je u `.gitignore` (ne objavljuje se): `izvori/knjige/` (Zagreb 1981, Krapina 1966, Jokić 1986, Šibenik 1980, Hrženjak 2002 sa skenovima strana i indeks NOB) i `izvori/cg/`; tu idu i svi novi preuzeti izvori. U gitu je samo opis fascikle (`izvori/README.md`); na računaru gde fajlova nema ne preuzimaj sve ponovo, nego pitaj korisnika. Ranije jednokratne skripte su u `~/.claude/projects/<putanja repozitorijuma>/nazivi-alati`; otvori samo temu potrebnu za zadatak. Naziv dokumentacionog Markdown fajla prati naslov; pri promeni naslova preimenuj fajl i ažuriraj veze. Ponovljive postupke čitaj po potrebi:

- [Lociranje, identitet i stanje](references/lociranje-i-stanje.md): pre prebacivanja radnog unosa na mapu ili razrešavanja starih podataka; odeljak o literaturi pri traženju knjiga, monografija i podataka o grobljima.
- [Zbirne pretrage i fotografije](references/pretrage-i-fotografije.md): pri radu sa Partizanstvo API-jem, drugim izvorima, licencama i poreklom koordinata ili datumom snimka.
- [Autori i posvete](references/autori-i-posvete.md): pri dopunjavanju autora i povezivanju sa Wikidatom.

## Pravila prema serverima

- **Zahtevi:**
  - šalju se jedan po jedan, sa pauzom od najmanje 3 s (Wikidata `wbgetentities` 10 s, Google mape 8 s);
  - nose User-Agent `spomeniks/1.0 (https://mudroljub.github.io/spomeniks)`;
  - kad postoji zbirni upit, koristi se on: Wikimedia `titles=` i Commons `prop=coordinates|imageinfo` do 50 naslova; duge liste idu POST-om, jer GET vraća 414.
- **Greške:** na 429, 504 ili captcha odmah stani. Nastavi tek posle duže pauze, sporije, ili lakšim upitom (npr. po državama).
- **Više od oko 500 zahteva** ka istom serveru traži pitanje korisniku.
- **spomenikdatabase.org** blokira posle oko 70 brzih zahteva, pa se čita samo pojedinačna stranica.
- **Overpass:**
  - `overpass-api.de` često vraća 502 ili 504;
  - rezerva je `overpass.kumi.systems`, ili ranije preuzeti OSM podaci sa diska;
  - posle greške probaj ponovo samo jednom.
- **Commons pretraga** (geosearch, cirrussearch) zna da vrati „too busy“; zbirni upiti preko `titles` rade.
- **Nominatim:** najviše jedan zahtev u sekundi. Dobar je za ulicu, trg ili selo, ali tačka trga nije tačka spomenika.

## Postupci koji rade

- **Hronologija izlaganja skulpture u Srbiji ima prednost** (korisnik, 2026-10-18): [ovaj akademski izvor](https://skulptura-hronologijaizlaganja.rs/category/spomenicka-skulptura/) ima prednost nad drugim izvorima za podatke o istom spomeniku, uključujući autora, godinu i naziv. Razlikuj godinu nastanka dela od postavljanja odlivka, pojedinačno delo od celine i različite spomenike u istom mestu; prednost izvora ne znači da su to isti objekti. Sačuvaj izvorni `izvor`, a dopunski dokaz i ranije razlike zabeleži u izveštaju.
- **Pre izveštaja „nema dovoljno podataka“ prvo traži na mreži** (korisnik, 2026-10-18): članak na Vikipediji, vesti, sajt opštine ili muzeja, Google mape, OSM i Commons. Korisniku se javlja nalaz, ili tek posle te pretrage šta je traženo i nije nađeno, uz linkove pregledanih izvora.
- **Izvor koji ima tačke odmah se meri i preuzima zbirno** (korisnik, 2026-10-18): kad izvor da tačnu tačku makar jednom spomeniku, odmah proveri koliko je velik (npr. MediaWiki `meta=siteinfo&siprop=statistics`) i da li se može preuzeti ceo (API, izvoz, sloj mape). Ne koristi ga samo za mesto zbog kog je nađen. Tako je Partisan Memorials Wiki (xiwl.com, oko 8.300 članaka sa tačkama, uglavnom BiH) ostao neiskorišćen posle žetve za Danilovgrad.
- **Komentari sa Twittera (X) imaju prednost** (korisnik, 2026-10-18): to su zapažanja i fotografije ljudi sa terena. Njihov podatak (mesto, stanje, autor, godina, fotografija) ima prednost nad starijim katalogom ili bazom; tvit se čita preko `https://cdn.syndication.twimg.com/tweet-result?id=<id>&token=a`, a fotografija ide uz potpis „Ime (@nalog), X“.
- **Google link od korisnika:**
  - `alati/proveri.py` iz linka čita ime, koordinate i id (heksadecimalni CID posle `0x…:0x`) i nalazi najbliže naše spomenike;
  - `alati/upisi_cid.py` i `alati/dodaj_google.py` upisuju podatke.
  - Kratak link `maps.app.goo.gl` se otvara sa `curl -s -o /dev/null -w "%{redirect_url}"`. Proveri da li link vodi na traženi spomenik: zna da pokazuje na drugi.
- **Google mape bez linka:** samo preko Chrome-a bez prozora (CDP), jer bez pregledača pretraga nema rezultata.
  - `maps?cid=<id>` otvara mesto, a `maps/search/<naziv, mesto>` pretragu;
  - kad pretraga vodi pravo na `/maps/place/`, koordinate su posle `!3d` i `!4d`;
  - glavna fotografija je prva `img` sa `googleusercontent.com/(gps-cs-s|grass-cs|p)/` šira od 200 px, a pun oblik se dobija sa `=w800-k-no` na kraju adrese;
  - potpis je „Google Maps“; Street View se ne koristi;
  - primer je `alati/google_slike.mjs`. Istoimena mesta su česta (Trg mladih u Ćićevcu i u drugom mestu), pa proveri koordinate;
  - NOB spomenik koji pretraga usput vrati, a nemamo ga, dodaje se odmah (korisnik, 2026-10-18), i kad nije onaj koji se traži; ostali pogoci iz pretrage proveravaju se protiv približnih zapisa u istom selu.
- **Commons:**
  - GPS fotografije dolaze preko `prop=coordinates`, `coprimary=all` i `imageinfo` (autor, licenca, `iiurlwidth=640`);
  - `alati/commons_dodaj.py` traži naslove sa prefiksom `File:`;
  - GPS fotografije je tačka snimka, ne objekta; kategorija fajla (npr. „AVNOJ Museum, Jajce“) i adresa iz izvora potvrđuju mesto.
- **Wikipedija i Wikidata:**
  - Q-id članka daje `prop=pageprops` (`wikibase_item`);
  - nazive i linkove daje `wbgetentities` sa `props=labels|sitelinks/urls`, po 50 id-ova;
  - `P31 = Q5` znači da je članak o osobi.
- **Prolaz kroz `data/bez_lokacije.json`:** obavezno po verovatnoći uspeha, ne redom. Prednost imaju konkretni objekti (muzej, škola, dom), savremene adrese i precizne tačke; uklonjeni i srušeni dolaze poslednji.
- **Opstanak, posebno u Hrvatskoj** (mnogo je srušeno i uklonjeno 1990–2000):
  - razlikuj godinu podizanja, datum opisanog stanja, datum fotografije ili obilaska i godinu izdanja izvora; noviji sajt koji prenosi vodič iz 1978. nije noviji dokaz od Hrženjaka (2002, `data/knjige/hrzenjak-2002.json`);
  - Hrženjakov nalaz o rušenju ili uklanjanju ima prednost nad starijim opisom; promeniti ga može samo konkretan kasniji dokaz obnove ili premeštanja (šta, kada, gde). Izostanak iz Hrženjaka ne znači da spomenik stoji;
  - nedatirana fotografija, aktivan marker na karti i OSM objekat ne potvrđuju da spomenik danas postoji;
  - izvorni `izvor` zapisa se čuva; kasniji dokaz opstanka ne zamenjuje ga.
- **Približna tačka** (korisnik, 2026-10-18): kad znamo samo selo, spomenik ide na mapu u centar sela iz `alati/naselja_osm.json`, sa `priblizno: true`. Važi samo za sela, ne za gradove, gde je centar predaleko; ploče dolaze poslednje. Isto ime sela nije dokaz: selo mora biti u opštini iz izvora (npr. „Dubica“ na spomenicinob.info je Kozarska Dubica, a ne istoimeno selo 75 km dalje), a imena se upoređuju samo unutar iste države. Kad se nađe prava tačka, `priblizno` se briše. Za približne tačke prvo se uparuju sačuvani zbirni izvori offline (Partisan Memorials Wiki, OSM), pa tek onda Google, i to po opštini ili po spomeniku iz grupe najvišeg prioriteta (redosled je u README TODO), nikad pretraga po svakom zapisu. Pravila prikaza su u [proveri aplikacije](../spomenici-provera/SKILL.md#prikaz-i-prijave-korisnika).
- **Lokacija bez Google id-a**, redom:
  1. GPS fotografije na Commons-u, ili iz metapodataka bilo koje fotografije spomenika (preuzeti original: `magick identify -format '%[EXIF:GPSLatitude]'`; MediaWiki fajl: `prop=imageinfo&iiprop=metadata`, bez preuzimanja);
  2. jedan Overpass upit `nwr(around:2000,lat,lon)[historic~"memorial|monument"]` oko sela iz `alati/naselja_osm.json`;
  3. uparivanje po imenu;
  4. sajt opštine ili lokalne vesti često imaju godinu, autora i tačno mesto („ispred biblioteke“).

## Fotografije

- Svaka nova fotografija prolazi pregled u montaži:
  `magick montage -label '%t' <fajlovi> -tile 5x3 -geometry 220x165+3+3 pregled.png`, pa pogledaj sliku.
- **Odbacuje se:**
  - fotografija bez vidljivog spomenika (pejzaž, zgrada, crkva, automobil, životinje);
  - kolaž;
  - fotografija sa čovekom u prvom planu;
  - spomenik išaran grafitima;
  - drugo mesto;
  - natpis koji pokazuje drugi rat, npr. ploča udruženja solunskih dobrovoljaca.
- **Obrada posle upisa:** prati [zajednički redosled iz skila provere](../spomenici-provera/SKILL.md#obrada-novih-slika).
- **Fotografija se uvek kopira kod nas, nikad samo link** (korisnik, 2026-10-17): u bazi u `slike/spomenici/<id>.webp`, a za spisak bez lokacije u `slike/bez-lokacije/<ime>.webp`, sa `slikaPotpis` i `slikaOdnos`; original ide u `izvori/`.
- **Spomenik se nikad ne dodaje bez fotografije ako fotografija postoji** (korisnik, 2026-10-17). Uzima se i kad licenca nije poznata (čitaoci novina, forum, knjiga, sajt): mala rezolucija (400 px) uz navođenje izvora je poštena upotreba. Potpis je „Autor, licenca“, a bez poznate licence „Autor, izvor“ (npr. „Čitalac Vijesti, StoryMap Mapa spomenika NOB“); bez posebnih fajlova sa licencama.
- Prazno nebo i višak se seku pre umanjivanja na 400 px.

## Posvete

- Spomeniku posvećenom događaju, logoru, bici ili ličnosti upisuje se Q-id u `posveta`, a stavka u `data/posvete.json`:
  - `naziv` je naslov sh članka;
  - `name` je engleski naziv sa Wikidate, kad se razlikuje;
  - `wiki` i `wikiEn` su linkovi.
- Bez odgovarajućeg članka u isto polje `posveta` upiši kratak tekst o tome kome je spomenik posvećen, prema potvrđenom opisu ili natpisu. Tekst je običan string, bez HTML-a i bez novog unosa u `posvete.json`; povezane posvete ostaju spisak Q-id oznaka. Ne mešaj opis i Q-id oznake u istom spisku.
- Stavka iz `posvete.json` koju više nijedan spomenik ne koristi kao povezanu posvetu briše se iz tog spiska.
- Opšte posvete („palim borcima“, Drugi svetski rat) se ne upisuju.

## Obuhvat u praksi

- Pre dodavanja proveri rat. Ovo nije bilo NOB:
  - Mojkovačka bitka (1916);
  - Neznani junak na Avali (Prvi svetski rat);
  - železničke nesreće;
  - manastiri, iako su nekad mesto događaja (Prohor Pčinjski; tu važi Memorijalni centar ASNOM-a u Pelincu).
- Spomenik posvećen svim ratovima, sa delom za NOB, ostaje (Trubjela).
- **Srušeni, uklonjeni i deponovani spomenici idu na mapu kad im je poznata tačka**, sa `stanje` (korisnik, 2026-10-18); dokaz se čuva u `data/izvori-stanja.json`, po pravilima za `stanjeIzvor` u standardu. Bez tačke ostaju u `data/bez_lokacije.json`, takođe sa stanjem i izdvojenim izvorom.
- Mesto u polju `mesto` uzima se iz samog izvora ili iz OSM-a, a ne iz najbližeg sela u alatu: tako je česma u Rakovici bila upisana kao Pinosava.
