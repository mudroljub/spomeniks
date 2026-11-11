# Pretrage izvora i fotografije

## Prepoznavanje vrednog izvora

Pojedinačni uspeh može otkriti bolji izvor za ceo skup. Pri svakom novom korisnom pogotku pogledaj da li stranica ima popis, galeriju, mapu, povezane kartone ili bibliografiju za druge naše nerešene predmete; nemoj uzeti jednu sliku i prevideti zbirku iz koje dolazi.

- **Vrednost meri prema našim prazninama:** više imenovanih objekata, fotografije sa proverljivim mestom i posvetom, konkretne adrese/parcele, autori, datumi snimaka, preseljenja i razlike između istoimenih obeležja. Jedna dobra fotografija jeste povod za procenu, ali ne dokazuje visok prinos celog sajta.
- **Razdvoji vrednost i autoritet:** lokalno udruženje, muzej, inicijativa ili stranački sajt može imati jedinstvene terenske fotografije i precizne opise. Navedi izdavača i ograničenja; ne predstavljaj ga kao zvanični registar i ne odbacuj ga samo zato što nije državni. Proveri poreklo slika i teksta: prepis istog kataloga ili prenos Google fotografije nije novi nezavisan dokaz.
- **Proveri šta je zaista novo:** uporedi sa `docs/IZVORI.md` i postojećim evidencijama u `data/provere/`. Novi naziv domena, preseljeni PDF i ranije obrađen izvod nisu nova neobrađena zbirka. Ako izvor već imamo, dopuni njegov red umesto pravljenja paralelne evidencije.
- **Zabeleži ga odmah:** u `docs/IZVORI.md` upiši naziv, vezu, oblast, šta konkretno može dati, datum provere, dostupan i stvarno pročitan obim, dosadašnji prinos i uslov za ponavljanje. Za još neproverenu zbirku jasno napiši „prinos neproveren“; preuzimanje nije obrada. Pojedinačne dokaze i ishode čuvaj u postojećoj tematskoj evidenciji (`data/provere/izvori.json`, `fotografije.json` ili `lociranje.json`), po pravilima zajedničkog upisa.
- **Proceni širu korist bez gubljenja reda:** u okviru odobrene obrade izvora poredi uzorak od 20 stavki, ili ceo izvor ako ih ima manje, sa mapom, spiskom bez lokacije i arhivom. Prvo važnija autorska dela i memorijalne celine; fotografije i dopune iz istog odeljka mogu se obraditi zajedno. Broj odeljaka, osoba, slika i spomenika vodi odvojeno. Registruj i ispravke i potvrde, ne samo nove markere; arhivirane predmete ne vraćaj bez dokaza.
- **Ne širi nalog zbog dobrog nalaza:** pojedinačna pretraga dopušta kratku procenu i beleženje relevantnog izvora, ali ne znači da je odobrena žetva celog sajta, prelazak na niže prioritete ili ponavljanje zatvorene grane rada. Ako šira obrada nije obuhvaćena nalogom, sačuvaj konkretan predlog; nastavi odobreni paket. Završen pregled ne ostavljaj kao budući posao.
- **Sačuvaj rezultat i granice:** razdvoji nove fotografije, lokacije, dopune, ranije već obrađene parove i nerešene identitete. Blokiran HTML ili API nije dokaz odsustva; zabeleži šta je ostalo dostupno i proverljivo. Posle uzorka nastavi samo ako donosi korisne nove podatke; neuspehe ponavljaj uz konkretan nov trag, ne istim opštim upitima.

Primer: „Kladuša je naša“ otkrivena je tokom traženja fotografije Bosanske Bojne; lokalni popis je dao i druge imenovane snimke. Pouka je prepoznati zbirku i proveriti njeno preklapanje sa bazom, a ne zaključiti da su svi lokalni sajtovi jednako korisni; aktuelni obuhvat i rezultat tog izvora ostaju u `docs/IZVORI.md`.

## Prvo sačuvani podaci, zatim zbirni upit

Pre nove mrežne pretrage pogledaj [obrađene izvore](../../../../docs/IZVORI.md) i [ranije lociranje](../../../../docs/LOCIRANJE_SPOMENIKA.md). Iskoristi ranije skinute OSM podatke, fotografije i PDF-ove u `izvori/`; raspored je u `izvori/README.md`, a preseljene putanje u `izvori/KONSOLIDACIJA.json`. Stare temp putanje iz istorijskih izveštaja nisu razlog za ponovno preuzimanje. Jednokratnu skriptu sa ugrađenom starom putanjom prilagodi pre pokretanja. Zabeleženi prinos pretrage pomaže izboru sledećeg postupka; ne predstavlja pouzdanost svakog pogotka.

- Za Commons je glavni put obilazak kategorija NOB spomenika (glavni skil, odeljak Commons); pretraga ispod je dopuna za fotografije sa GPS-om. Za nju koristi `generator=search` sa `prop=coordinates` u istom odgovoru. Kombinuj `deepcat:"World War II memorials in Slovenia"` ili odgovarajuću državu sa `nearcoord:30km,lat,lng` i rečima za NOB. Mreža tačaka ili pokrivanje regiona krugovima smanjuje broj upita u odnosu na svaki spomenik zasebno.
- Za slovenačke fotografije može se tražiti šablon `Cultural Heritage Slovenia` sa EŠD-om: `hastemplate:"Cultural Heritage Slovenia" insource:/Heritage Slovenia\|(id1|id2|…)\}/`. EŠD je veza ka kandidatu, ne potvrda da fotografija prikazuje pravo delo.
- Opise i metapodatke kandidata preuzmi zbirno, do 50 naslova; pregledaj fotografije pre upisa. Blizina GPS-a ne potvrđuje identitet: mogu biti crkva, drugi rat ili susedno delo u parku.
- Ako veliki Wikidata SPARQL upit ne prolazi, suzi ga na jednu državu i potrebna polja (`?item ?coord ?tip`). `wbgetentities` šalji po 50 ID-jeva uz razmak od najmanje 10 s, prema pravilima glavnog skila.
- Wikidata tačke spomen-obeležja znaju da odstupaju i nekoliko kilometara; ne prepisuj ih bez druge potvrde.
- Pre ponavljanja nekog postupka pogledaj njegov zabeleženi prinos u `docs/IZVORI.md`; postupak slabog prinosa ponavljaj samo sa novim skupom ili razlogom.
- Adrese iz starih izvora često su na kasnije preimenovanim ulicama; OSM kućni broj tada ne potvrđuje par bez starog i novog imena ulice.
- Za Overpass, kada upit po administrativnoj oblasti ne radi, probaj manji pravougaonik ili sačuvani skup; poštuj pravilo zaustavljanja i najviše jednog ponavljanja posle greške iz glavnog skila.

## Hrvatski registar: karton i geometrija

Proveren postupak u turi `izbor-deset-prag-polovina-2026-11-09`; pre novog zahteva proveri sačuvane odgovore. Prazan odgovor na upit sa numeričkim ID-jem ne dokazuje da karton ne postoji.

1. Karton: `https://registar.kulturnadobra.hr/api/kulturno-dobro/detail/<registarski-broj>`; na primer `Z-7209` ili `ROS-0226-1971.`. Polje `kulturnoDobroId` je numerički ključ, različit od registarskog broja. Uporedi naziv, opis, fotografiju i katastarsku česticu.
2. Geometrija tog kartona: `https://geoportal.kulturnadobra.hr/api/kulturno-dobro/get-geometrija-by-kd-id/<kulturnoDobroId>`. Odgovor je JSON string sa WKT geometrijom. U proverenom geoportalu izvorni koordinatni sistem je EPSG:3765; pre ponovne upotrebe proveri konfiguraciju, ne tumači metre kao geografsku širinu i dužinu.
3. Po potrebi atributna pretraga: `https://geoportal.kulturnadobra.hr/api/kulturno-dobro/atributna?id=<registarski-broj>` ili `kdNaziv=<naziv>&gradOpcina=<matični-broj>`. `Geometrija: null` u ovom odgovoru nije konačan dokaz da nema geometrije: za nju postoji zaseban poziv iz prethodnog koraka.

Sačuvaj izvorni WKT, koordinatni sistem, način transformacije i rezultat u WGS84. Proveri obuhvat na karti: mala određena memorijalna celina može biti dovoljna po korisnikovom kriterijumu, a velika parcela zaštite nije automatski precizna lokacija spomenika. Ne tvrdi da je centroid podnožje, ulaz ili prohodna staza. Registar i stara konzervatorska fotografija nisu današnji terenski nalaz o opstanku.

## Partizanstvo: zbirni sloj, pa pojedinačni opis

- Prvo potraži već sačuvani odgovor. U ranijim turama korišćeni su `https://partizanstvo.si/api/brief/partisanmemorial/` za slovenački i `https://partizanstvo.si/api/brief/croatianpartisanmemorial/` za hrvatski sloj. Brojevi preuzetih tačaka su istorija u dokumentaciji, ne očekivani današnji obim API-ja.
- Zbirni sloj uporedi lokalno sa mapom i radnim spiskom. Izdvoji NOB objekte i moguće duplikate; prag udaljenosti služi za izbor kandidata, ne potvrđuje različit identitet. Ne uvozi ceo sloj automatski.
- Za odabrane kandidate čitaj `api/full/partisanmemorial/<id>` ili `api/full/croatianpartisanmemorial/<id>`, redom, uz mrežna ograničenja glavnog skila. Proveri posvetu, opis položaja, galeriju i napomene o uklanjanju ili pogrešnim/približnim koordinatama.
- Partizanstvo ima fotografije za mnoge objekte; koristi ih za svaki naš spomenik bez slike koji ima potvrđen par. Galerija nije u `api/full` ni u HTML-u stranice, nego u `https://partizanstvo.si/api/get_images/?model_name=<sloj>&object_id=<id>` (sa kosom crtom pre `?`): `url`, `thumbnail_url`, `author`, `license` i `source` za svaku fotografiju. Početak imena fajla (npr. `2024_08_13_MK_…`) daje datum snimka i inicijale autora.
- Prihvati samo potvrđen identitet i tačku. Isti EŠD, naziv i izgled mogu razrešiti postojeći unos; nesaglasna tačka nije razlog da se postojeća koordinata zameni bez novog dokaza. Hrvatski objekat prolazi i proveru opstanka.
- Sačuvaj odluku i razlog za svaki pregledani kandidat. Preuzeti, ali još nepročitani odgovori ostaju neobrađeni; sledeća tura prvo proverava njih i ranije odluke, umesto ponovnog preuzimanja.

## Partisan Memorials Wiki: lokalna kopija, uparivanje offline

- Kopija celog wikija je u `izvori/xiwl/deo-*.json` (MediaWiki API, `generator=allpages` sa sadržajem, 50 stranica po zahtevu); dopunjava se sa `python -I izvori/xiwl/preuzmi.py`, koji nastavlja od poslednjeg dela i preskače zaključane stranice (jedna zaključana obara ceo deo). Pre mrežnog upita traži u kopiji.
- Šablon `{{Spomenik` ili `{{Man-Made POI` daje `Name`, `Location` (selo), `Coords`, `Built`, `Reference` (često spomenicinob.info), a `Gmap Notes` i `Directions` kažu odakle je tačka: satelit, Street View, stara karta ili procena („Nothing indicated“, „roughly estimated“, „not traceable“).
- Par sa našim zapisom važi samo uz isto selo, istu vrstu (bista, groblje, česma, ploča, zgrada, spomenik), godinu koja se ne razlikuje i stranicu koja pripada samo jednom zapisu. Jak par: ista godina ili posebna reč naziva (osoba, jedinica, događaj). Opšti nazivi („Spomenik NOB“, „palim borcima“) bez godine nisu dovoljni ako u selu ima više takvih.
- Utvrđena tačka briše `priblizno`; procenjena tačka samo pomera zapis, a `priblizno` ostaje.
- **Preuzimanje polja (Designer, Built, Condition)** (11.11.2026): jedinstvena tačka do 50 m nije dovoljna. Pre upisa uporedi naslov stranice sa našim nazivom, vrstom i mestom; u prolazu za celu bazu 24 od 676 parova bila su pogrešna (kompleks umesto dela, drugi spomenik u mestu, ploča uparena sa česmom, spomenik iz Prvog svetskog rata). Godinu preskoči kad beleška pominje zamenu, premeštanje ili raniji spomenik, a autora kad je naveden inicijalom ili nesigurno; ime uskladi sa postojećim autorima samo kad je razlika očigledna greška kucanja ([provera](../../../../data/provere/odluke.json)).
- **Fotografije** (11.11.2026): wiki čuva slike i kad je polje `Image` prazno, pa spisak traži preko `list=allimages&aiprefix=<Mesto>` (imena prate naslov, npr. `Ludbreg_SpomenKosturnica1.jpg`, ponekad sa greškom, `SutjetskaMjestoRanjavanjaTita`). Stranice fajlova su zaključane, ali `prop=imageinfo&iiprop=metadata` radi. Poreklo određuju metapodaci: `Software: Google` znači snimak sa Google mapa i ne koristi se; bez metapodataka poreklo nije utvrđeno; sopstveni snimci autora wikija (Knoken, `NIKON COOLPIX A10` sa datumom) upotrebljivi su u 400 px uz potpis „Knoken, Partisan Memorials Wiki“. Identitet proveri po opisu objekta na stranici, jer isti prefiks pokriva druge spomenike u mestu ([primer Petrova](../../../../data/provere/fotografije.json#fotografije-redom-xiwl-2026-11-11)).

## Proveri knjigu, ne samo opis kataloga

Pre obrade PDF-a proveri `pdfinfo`, `pdftotext -layout`, naslovnicu, impresum i poslednju dostupnu stranu. Sadržaj koji navodi 60 strana ne dokazuje da javni PDF ima svih 60. Razlikuj sken, štampanu stranu i godinu samog dokumenta od datuma u URL-u ili rezultatu pretrage.

Autora i priređivača uzmi iz impresuma: osoba navedena „za izdavače“ nije automatski autor knjige. Pregled pronađenih izvora vodi u tematskoj belešci, sa dostupnošću punog teksta i ograničenjima; ne računaj bibliografski zapis kao preuzetu knjigu.

Kad OCR ne daje pouzdan natpis, čitaj sken na najmanje 150 dpi. Fotografija natpisa ima prednost nad suprotnim štampanim prepisom; nečitka mesta označi u sirovim zapisima i ne objavljuj nepotpun natpis kao celovit. Proveri uzorak od 20 zapisa prema izvornim stranama; više od dve greške zahteva ispravku postupka i širu proveru pogođenog dela. Godina stradanja, osnivanja ustanove ili početka gradnje nije automatski godina podizanja spomenika.

Posle rada ažuriraj odgovarajući red u [evidenciji izvora](../../../../docs/IZVORI.md): datum, tačno obrađen skup i vrstu posla, rezultat, preostali deo i uslov za ponavljanje. Razlikuj preuzet, delimično obrađen i završen prolaz; ako obim nije poznat, napiši to. Nemoj ponovo prepisivati ceo izvor radi nekoliko otvorenih identiteta.

## Identitet fotografije pre preuzimanja tačke

Pouka iz Izbišta (9.11.2026): naslov Commons fajla i njegova kategorija mogu pogrešno navoditi NOB. Fotografije `Споменик на НОБ во Избишта.jpg` i `Споменик на НОБ во Избишта 2.jpg` imaju čitljiv natpis o borbi 31.1.1903. i Ilindenskom ustanku; njihova bliska GPS tačka nije dokaz položaja našeg NOB memorijala. Pre preuzimanja slike ili koordinata pogledaj delo i natpis, uporedi događaj, oblik i okolinu; ako se ne slažu, sačuvaj odbačeni par i razlog da se isti pogrešan trag ne ponavlja.

Kod metapodataka razlikuj stvarne GPSLatitude/GPSLongitude od samog `GPSVersionID`, koji ne daje položaj. Više slika istog autora sa istom tačkom nije više nezavisnih merenja. Za ovakvu grupu koristi zbirni Commons upit za koordinate, opis i metapodatke, pa preuzmi samo potrebne snimke. Geografsko poreklo tačke i obuhvat prostora ocenjuju se prema [pravilima lociranja](lociranje-i-stanje.md#prioritet-i-potvrda-tačke).

## Fotografija i datum dokaza

Proveri natpis, oblik i okolinu konkretnog objekta. GPS i ime fajla služe kao kandidati; nesaglasnost sa opisom znači da tačka još nije potvrđena. Ne preuzimaj automatski opis slike kao činjenicu.

Koordinate fotografije često označavaju mesto fotografa, ne spomenika. Proveri poreklo koordinata: isti GPS prepisan iz EXIF-a na Commons i drugi sajt nije dva nezavisna dokaza; ni jednaka Wikidata/Commons tačka nije nužno nezavisna potvrda. Razlikuj potvrdu objekta i njegove namene od potvrde tačke i današnjeg opstanka.

Kod prenete galerije proveri autora i licencu u izvornom zapisu fotografije. Podrazumevana oznaka galerije ne nadjačava izvornu licencu: u ranijim turama Partizanstvo je navodilo CC BY 4.0, a izvorni Commons CC BY-SA 3.0/4.0. Potpis i uslove prenesi iz izvora. Kad dozvola nije poznata, slika se ipak objavljuje u maloj rezoluciji uz navođenje izvora, po pravilu glavnog skila; nejasno poreklo (čija je fotografija, koji objekat prikazuje) treba razrešiti pre upisa.

Datum učitavanja na Commons, izmene stranice ili metapodatka `updated` nije datum snimanja. Za Panoramax proveri izvorni zapis `/api/pictures/<id>`, `properties.datetime`, autora i licencu, pa tek onda fotografiju iz `assets`. Na Commons-u razlikuj datum fotografije od istorije učitavanja. Ako datum snimanja nije poznat, tako ga i zabeleži; EXIF je pomoćni, ne nepogrešiv dokaz.

Objavi sliku prema pravilima potpisa, licence, vizuelne provere i obrade iz glavnog skila. Dokaz opstanka može ostati samo veza u izveštaju; nije potrebno objaviti svaku pregledanu fotografiju niti zameniti raniji izvor podataka.
