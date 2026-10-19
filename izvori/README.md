# Lokalni izvori

Svi preuzeti izvori i njihove tekstualne/stranične izvedenice čuvaju se ovde. Folder je u `.gitignore`; ne šalje se na sajt. Obrađenost izvora i preostali posao prate se u `docs/IZVORI.md`, nezavisno od toga što je datoteka preuzeta.

| Folder | Sadržaj | Datoteke | MB |
|---|---|---:|---:|
| `knjige/` | PDF-ovi, skenovi, OCR i izdvojeni tekstovi knjiga | 1866 | 589.9 |
| `cg/` | Crnogorski registri, knjiga/odlomak, tekst i HTML kataloga | 19 | 28.4 |
| `spomenicinob/` | Raniji ulazni HTML, OSM i izdvojeni redovi popisa BiH | 143 | 19.7 |
| `fotografije/` | Originali fotografija preuzetih pri ranijim unosima (Commons, Partizanstvo, registri) | 27 | 14 |
| `osm/` | OSM izvodi: zagrebačka spomen-obeležja i kućni brojevi, kandidati za Crnu Goru | 3 | 4 |
| `pretrage/` | Odgovori API-ja i sajtova, fotografije i izvodi iz prethodnih provera | 1578 | 329.4 |

## Važne putanje

- `pretrage/foto-paket100b-2026-10-19/` — peti paket, bez Makedonije: 100 kandidata, 79 preuzetih snimaka i 5 zamena, 63 dodate fotografije; odluke i metapodaci u `data/provere/fotografije-paket100b-2026-10-19.json`.
- `pretrage/foto-paket100-2026-10-19/` — paket od 100 kandidata: 87 preuzetih snimaka sa zamenama, 69 konačnih fotografija, izvorni metapodaci i snimak aktuelne baze pre upisa; rezultati u `data/provere/fotografije-paket100-2026-10-19.json`.
- `pretrage/foto-paket50c-2026-10-19/` — treći paket: 50 kandidata, 53 preuzeta snimka sa pet zamena, 47 dodatih fotografija; odluke i metapodaci u `data/provere/fotografije-paket50c-2026-10-19.json`.
- `pretrage/foto-paket50b-2026-10-19/` — drugi paket od 50 kandidata: 56 izvornih snimaka, odluke i metapodaci, 48 konačnih fotografija i snimak aktuelne baze pre upisa; rezultati u `data/provere/fotografije-paket50b-2026-10-19.json`.
- `pretrage/foto-paket50-2026-10-19/` — izbor 50 postojećih spomenika bez fotografije, 51 izvorni snimak sa zamenom Zrenjanina, pregled i EXIF, 47 konačnih WebP slika i snimak baze pre upisa; rezultati u `data/provere/fotografije-paket50-2026-10-19.json`.

- `knjige/zagreb-1981.pdf`, `knjige/krapina-1966.pdf`, `knjige/jokic-1986.pdf`, `knjige/sibenik-1980.pdf`
- `knjige/hrzenjak-indeks-nob.pdf`, `knjige/hrzenjak-2002/strane/` i `knjige/hrzenjak-2002/ocr/`
- `knjige/jokic-1986/tekst.txt`, `knjige/jokic-1986/strane/`; isto za Šibenik, dok je Krapina u `knjige/krapina-1966/`
- `knjige/baranja-2022/` — katalog Jovana Nedića (2022), PDF od 45 listova, tekst, 105 izdvojenih slika i vizuelne provere; završen prolaz relevantnih jedinica, 29 novih markera i jedan radni unos ukupno. Prvi uzorak i nastavak u `data/provere/baranja-2022-*.json`; nerešeni položaji i stanja ostaju navedeni u nastavku. Dodatno sačuvani članak i fotografija Spomen-sobe Bolmanske bitke iz 2023.
- `knjige/dimitrovgrad-2023/` — Miša Anđelković, *Pirotski zbornik* 48 (2023), 73–92; ceo PDF od 20 strana, tekst, dve izdvojene fotografije, dopunski Google/OSM i lokalni novinski dokazi, snimak baze pre unosa i provere telefona. Obrađeno svih 16 obeležja Drugog svetskog rata; rezultati i otvoreni slučajevi u `data/provere/dimitrovgrad-2023-2026-10-19.json`.
- `pretrage/wiki-propusti-2026-10-18/` — izbor kandidata, tekstovi, fotografije i njihove provere; podfolderi `nastavak-2026-10-19/`, `paket3-2026-10-19/` i `paket4-2026-10-19/` čuvaju naredna tri obrađena paketa, snimke baze pre upisa, metapodatke i provere telefona. Sva četiri izveštaja su u `data/provere/wiki-propusti*.json`; `nastavak-pregled.py` preskače pregledane iz svih izveštaja.
- `knjige/zagreb-sjecanje-je-borba/` — Šimunković i Delač, *Sjećanje je borba* (online izdanje, 2014), PDF od 520 strana sa tekstom (preuzeo korisnik sa Academia.edu), `tekst.txt` i `tekst-raw.txt`; `stavke.json` je 457 rasčlanjenih obeležja (deo grada, adresa, opis), `kandidati.json` i `kandidati-pregled.txt` oko 90 spomenika i bisti sa tačkama po kućnim brojevima i susednim zapisima baze. Unos nije urađen; stavka 15 u `docs/PLAN_ZETVE.md`.
- `knjige/zapresic-naslijede-revolucije/` — Mario Šimunković, *Naslijeđe revolucije. Vodič kroz spomen-obilježja NOB-u u zaprešićkom kraju* (Proksima i UABA Zaprešić, 2019), PDF od 81 strane sa tekstom (sa Academia.edu); nije obrađen, stavka u `docs/PLAN_ZETVE.md`.
- `knjige/literatura-horvatincic/` — radovi Sanje Horvatinčić (sa Academia.edu): *Stepenice bez završetka* (Spomen-park Dotrščina), *Footprints of Resistance*, *Formalna heterogenost spomeničke skulpture* (Anali Galerije Antuna Augustinčića 31, 2011), poglavlje *Memorial Sculpture and Architecture* iz kataloga MoMA *Toward a Concrete Utopia* (2018, sken bez teksta) i *Žena nakon borbe* (zbornik *Pojavnost moderne skulpture u Hrvatskoj*, OCR slab). Stručna literatura za autore, godine i preseljenja, ne katalozi.
- `knjige/vojvodina-bede-2024/` — Aleksandar Bede, *Visions and Narratives of Large-Scale Projects of Socialist Vojvodina*, AGG+ 2024, str. 90–113 (DOI 10.61892/AGG20240290B); literatura o vojvođanskim memorijalnim kompleksima.
- `cg/` zadržava ranija imena datoteka
- `pretrage/<raniji-naziv-temp-foldera>/` zadržava nazive preuzetih odgovora
- `pretrage/godine-paket50-2026-10-19/` — rangirani kandidati, odluke za prvih 50, snimci baze neposredno pre upisa i tri mobilna pregleda; 30 dopuna godina prema sačuvanim redovima `spomenicinob/redovi.json`, registru CG i OCR-u Popović-Žuma. Javni pregled dokaza i svih preskočenih slučajeva je u `data/provere/godine-paket50-2026-10-19.json`; nove datume ne zaključivati samo iz oznake `Built` starijeg Wikija.
- `pretrage/posvete-nazivi-2026-10-19/` — obuhvat svih naziva mape i spiska bez lokacije, izdvojeni kandidati, snimci neposredno pre upisa i mobilni pregledi; 3.159 dopuna samo polja `posveta`. Izvor je postojeći naziv, bez preuzimanja novih istorijskih izvora; trajni pregled u `data/provere/posvete-iz-naziva-2026-10-19.json`.
- `skulptura-hronologija/` — svih 83 objave kategorije Spomenička skulptura (7 stranica), mapa 80 tačaka, izdvojeni podaci i 423 reference na galerijske fotografije sa potpisima; 28 fotografija preuzeto za pregled, OSM/Commons/Google provere i snimci pre upisa. Rezultati su u `data/provere/skulptura-hronologija-2026-10-18.json`.

`KONSOLIDACIJA.json` beleži izvornu i novu putanju, SHA-256, veličinu i ishod za svaku premeštenu ili uklonjenu kopiju. Datoteke su uklanjane sa stare lokacije tek nakon provere identičnog sadržaja na novoj. Numerisane strane i OCR ostaju na svojim logičkim putanjama i kada dve strane imaju isti sadržaj.

Aplikacioni podaci u `data/`, rezervni snimci stanja, snimci aplikacije i jednokratne skripte nisu duplikati preuzetih izvora i nisu brisani ovom konsolidacijom. Stare skripte koje imaju ugrađenu temp putanju prilagoditi pre ponovnog pokretanja; ulaz tražiti ovde, ne ponovo na mreži.

## Makedonija 1986

`knjige/makedonija-1986.pdf` — preuzet 2026-10-18 sa AfterArt; 681.106.563 bajta, 129 PDF listova (dvostrani skenovi), izdanje navodi 260 strana. Tekstualni sloj ne postoji; `makedonija-1986.txt` sadrži samo razdelnike. `knjige/makedonija-1986/strane/` čuva odabrane izvedene slike, a `postojece-fotografije.jpg` pregled već unetih objekata za poređenje. Probni pregled 20 zapisa i obrađenost su u `docs/IZVORI.md` i `data/provere/makedonija-pilot-2026-10-18.json`; preuzimanje ne znači da je cela knjiga obrađena.
