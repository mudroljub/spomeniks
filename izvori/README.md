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

- `pretrage/foto-paket50c-2026-10-19/` — treći paket: 50 kandidata, 53 preuzeta snimka sa pet zamena, 47 dodatih fotografija; odluke i metapodaci u `data/provere/fotografije-paket50c-2026-10-19.json`.
- `pretrage/foto-paket50b-2026-10-19/` — drugi paket od 50 kandidata: 56 izvornih snimaka, odluke i metapodaci, 48 konačnih fotografija i snimak aktuelne baze pre upisa; rezultati u `data/provere/fotografije-paket50b-2026-10-19.json`.
- `pretrage/foto-paket50-2026-10-19/` — izbor 50 postojećih spomenika bez fotografije, 51 izvorni snimak sa zamenom Zrenjanina, pregled i EXIF, 47 konačnih WebP slika i snimak baze pre upisa; rezultati u `data/provere/fotografije-paket50-2026-10-19.json`.

- `knjige/zagreb-1981.pdf`, `knjige/krapina-1966.pdf`, `knjige/jokic-1986.pdf`, `knjige/sibenik-1980.pdf`
- `knjige/hrzenjak-indeks-nob.pdf`, `knjige/hrzenjak-2002/strane/` i `knjige/hrzenjak-2002/ocr/`
- `knjige/jokic-1986/tekst.txt`, `knjige/jokic-1986/strane/`; isto za Šibenik, dok je Krapina u `knjige/krapina-1966/`
- `knjige/baranja-2022/` — katalog Jovana Nedića (2022), PDF od 45 listova, tekst, 105 izdvojenih slika i vizuelne provere; završen prolaz relevantnih jedinica, 29 novih markera i jedan radni unos ukupno. Prvi uzorak i nastavak u `data/provere/baranja-2022-*.json`; nerešeni položaji i stanja ostaju navedeni u nastavku. Dodatno sačuvani članak i fotografija Spomen-sobe Bolmanske bitke iz 2023.
- `knjige/dimitrovgrad-2023/` — Miša Anđelković, *Pirotski zbornik* 48 (2023), 73–92; ceo PDF od 20 strana, tekst, dve izdvojene fotografije, dopunski Google/OSM i lokalni novinski dokazi, snimak baze pre unosa i provere telefona. Obrađeno svih 16 obeležja Drugog svetskog rata; rezultati i otvoreni slučajevi u `data/provere/dimitrovgrad-2023-2026-10-19.json`.
- `pretrage/wiki-propusti-2026-10-18/` — izbor kandidata, tekstovi, fotografije i njihove provere; podfolderi `nastavak-2026-10-19/`, `paket3-2026-10-19/` i `paket4-2026-10-19/` čuvaju naredna tri obrađena paketa, snimke baze pre upisa, metapodatke i provere telefona. Sva četiri izveštaja su u `data/provere/wiki-propusti*.json`; `nastavak-pregled.py` preskače pregledane iz svih izveštaja.
- `cg/` zadržava ranija imena datoteka
- `pretrage/<raniji-naziv-temp-foldera>/` zadržava nazive preuzetih odgovora
- `skulptura-hronologija/` — svih 83 objave kategorije Spomenička skulptura (7 stranica), mapa 80 tačaka, izdvojeni podaci i 423 reference na galerijske fotografije sa potpisima; 28 fotografija preuzeto za pregled, OSM/Commons/Google provere i snimci pre upisa. Rezultati su u `data/provere/skulptura-hronologija-2026-10-18.json`.

`KONSOLIDACIJA.json` beleži izvornu i novu putanju, SHA-256, veličinu i ishod za svaku premeštenu ili uklonjenu kopiju. Datoteke su uklanjane sa stare lokacije tek nakon provere identičnog sadržaja na novoj. Numerisane strane i OCR ostaju na svojim logičkim putanjama i kada dve strane imaju isti sadržaj.

Aplikacioni podaci u `data/`, rezervni snimci stanja, snimci aplikacije i jednokratne skripte nisu duplikati preuzetih izvora i nisu brisani ovom konsolidacijom. Stare skripte koje imaju ugrađenu temp putanju prilagoditi pre ponovnog pokretanja; ulaz tražiti ovde, ne ponovo na mreži.

## Makedonija 1986

`knjige/makedonija-1986.pdf` — preuzet 2026-10-18 sa AfterArt; 681.106.563 bajta, 129 PDF listova (dvostrani skenovi), izdanje navodi 260 strana. Tekstualni sloj ne postoji; `makedonija-1986.txt` sadrži samo razdelnike. `knjige/makedonija-1986/strane/` čuva odabrane izvedene slike, a `postojece-fotografije.jpg` pregled već unetih objekata za poređenje. Probni pregled 20 zapisa i obrađenost su u `docs/IZVORI.md` i `data/provere/makedonija-pilot-2026-10-18.json`; preuzimanje ne znači da je cela knjiga obrađena.
