# Procena projekta

Pregled 2026-10-17. Provereni su aplikacija, lokalni podaci, alati, dokumentacija i projektni skilovi. Ovo je procena i evidencija nalaza; kod i spomenici nisu popravljani u okviru pregleda. Tokom rada postoje i nezavisne izmene podataka, pa brojke ispod predstavljaju snimak u trenutku merenja.

## Ocena

Aplikacija prolazi postojeće testove i proveru tipova. Dokumentacija ima jasnu podelu na izvore, rezultate i postupke u skilovima; nijedna proverena lokalna veza nije prekinuta. Osnovna struktura projekta je uredna.

Automatska kontrola još ne pokriva sav materijal; preostali nalazi ispod odnose se na alate i doslednost dokumentacije. Postojeći istorijski i neizvesni nalazi u dokumentaciji pravilno su označeni; njihova neizvesnost nije sama po sebi greška koju treba ukloniti.

## Izvršene provere

| Oblast | Dokaz i rezultat |
|---|---|
| Osnovni tokovi aplikacije | `node --test alati/test.mjs`: svih 7 testova prolazi u Chrome-u. Mapa, otvaranje preko `#id`, istorijski izvor stanja, pretraga, filteri i ruta rade u tim scenarijima. |
| Tipovi | `npx -y -p typescript tsc -p jsconfig.json`: prolazi bez ispisa. U ograničenom okruženju alat nije bio dostupan; konačna provera je uspešno izvršena uz odobreno pokretanje izvan njega. |
| Sintaksa | Python alati prolaze `ast.parse`; sopstveni JavaScript i Node alati prolaze `node --check`. Bash skripta prošla je prethodni `bash -n`. |
| Glavna baza | `python -I alati/integritet.py`: 4.590 spomenika, samo 17 poznatih bliskih parova. To potvrđuje pravila tog alata, ne istorijsku tačnost svakog unosa. |
| JSON | Svih 20 proveravanih JSON fajlova iz `data/` i manifest uspešno se učitavaju, bez ponovljenih ključeva. |
| Dokumentacija i skilovi | U 17 Markdown fajlova provereno 99 lokalnih veza, uključujući sidra; nema prekinutih veza. Ranija provera sva tri skila ostavila je četiri otvorena sadržinska nalaza u README. |
| Knjiške veze | Svi provereni objekti `uparivanje` ka mapi i radnom spisku imaju postojeći cilj. Svih 26 aktivnih `radniIndeks` pokazivača u izveštajima nalazi se unutar radnog spiska. Granica: ispravan indeks ne dokazuje identitet; zapisi bez strukturirane veze ovim nisu upareni. |
| Radni spisak | 4.511 stavki; svaka ima naziv, mesto, državu i vrstu. Svih 6 lokalnih fotografija postoji i ima potpis i odnos dimenzija. |
| Fotografije mape | ImageMagick uspešno čita svih 2.719 WebP fotografija; njihovi odnosi dimenzija odgovaraju upisanom `slikaOdnos`. Za 773 zapisa sa fotografijom nedostaje `slikaPotpis`. |
| Git | Na početku pregleda radno stablo bilo je čisto. Naknadne izmene podataka i evidencije iz drugog rada nisu menjane niti vraćane ovom procenom. |

## Najvažniji novi nalazi

### Granice alata za integritet

Alat ne proverava ceo `bez_lokacije.json`, knjiška uparivanja i radne pokazivače. Zasebne provere u ovom pregledu nisu našle nepostojeće ciljeve, ali to nije trajna zaštita. Tip `SpomenikBezLokacije` takođe ne opisuje postojeća polja `proveraLokacije` i `proveraOpstanka`, koja se pojavljuju u 10 odnosno 26 stavki snimka. Proveru i opis radnih podataka treba dopuniti bez brisanja tih nalaza.

### Dodavanje sa Google mapa

`alati/dodaj_google.py` pravi skup `cidovi` pre prolaska kroz ulaz, ali nakon dodavanja ne dopisuje novi CID u taj skup. Dva ista nova Google mesta u jednoj turi mogu zato proći proveru i dobiti različite ID-jeve. Nalaz je iz pregleda koda; spoljne zahteve nisam slao. Alat ujedno čeka 2 sekunde između zahteva, dok skil žetve propisuje najmanje 8 sekundi za Google mape.

### Aktuelnost dokumentacije

**Rešeno 2026-10-18:** status i brojke u [evidenciji izvora CG](IZVORI.md#crna-gora) usklađeni sa zatvaranjem žetve i FB pregleda po korisnikovoj odluci: 134 markera, 30 stavki bez lokacije. Raniji nalaz razlike 96/12 prema 97/17 odnosio se na stari snimak; istorijske brojke datiranih prolaza sačuvane su. Završena žetva uklonjena je iz aktivnog TODO-a.

Četiri ranija nalaza o skilovima ostaju u jedinstvenom [TODO spisku](../README.md#todo): `stanjeIzvor` u standardu, obrada radnih fotografija, nedostajući `autori_wiki.py` i gašenje tuđeg procesa na portu 8765. Nisu ponovo otvarani kao zasebni zadaci.

## Granice ove procene

Nije izvršena nova provera identiteta, koordinata i današnjeg opstanka svih spomenika, niti je nastavljena obustavljena hrvatska provera. Nisu proverene sve spoljne veze, aktuelni cenovnici i pravila iz dokumenta o Android objavi, ponašanje na pravom telefonu, pristupačnost svih ekrana ili nova merenja brzine. Postojećih sedam testova ne pokriva sve greške mreže i sve scenarije rada bez signala.

Pre konačne ocene da je projekat besprekorno uređen treba rešiti potvrđene nalaze, zatim proveriti samo pogođene oblasti. Preimenovanje fajlova, nova arhitektura i masovno prepisivanje istorijskih beleški nisu potrebni na osnovu ovog pregleda.
