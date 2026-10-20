---
name: spomenici-lociranje-online
description: Metoda za nalaženje tačne lokacije spomenika pretragom na mreži kad sačuvani zbirni izvori (Partisan Memorials Wiki, OSM, Partizanstvo, spomenicinob, knjige) ne daju tačku — kuće heroja, spomen-domovi, seoski spomenici, srušeni i uklonjeni. Koristi ga uvek kad treba „detaljna online pretraga“ za spomenik ili spisak spomenika bez tačne lokacije (`priblizno`), kad korisnik traži „nađi gde je“, „potraži online“, ili kad Google mape po nazivu ne nađu mesto. Dopunjuje skil spomenici-zetva (pravila prema serverima, upis, fotografije).
---

# Lociranje spomenika na mreži

Cilj je tačka na karti sa izvorom, a ne lista linkova. Pretraga se meri prinosom: koliko stavki je dobilo tačku po broju upita.

## Pre mreže

Proveri šta već imamo, jer je besplatno: `izvori/xiwl/` (stranica spomenika i stranica sela sa opisom mesta), `izvori/spomenicinob/redovi.json` (adresa), `izvori/osm/`, knjige u `izvori/knjige/`, `data/provere/odluke.json` (raniji tragovi). Opis iz njih („ispred škole“, „u zaseoku X“) je često dovoljan za OSM korak ispod.

Stranice susednih zapisa su često bolje od same stavke: wiki stranica stele „pored doma“ ili groblja „ispred škole“ daje tačku i za dom ili školu. Pre mreže proveri sve stranice istog sela, ne samo onu o traženom objektu.

Za groblja, kosturnice i grupe slabo opisanih zapisa prvo traži regionalnu evidenciju ili literaturu koja pokriva više otvorenih objekata. Prati [postupak za literaturu i grobne objekte](../spomenici-zetva/references/lociranje-i-stanje.md#literatura-i-grobni-objekti): probni dokument sa mikrolokacijama ima prednost nad ponavljanjem opštih upita za svaki grob. Dostupnost i obrađenost konkretnih knjiga proveri u `docs/IZVORI.md`.

## Odakle se zna gde je

Spomenik se retko opisuje sam; o njemu piše ono čemu je posvećen. Redom:

1. **Članak o heroju, jedinici ili događaju** na sr, hr ili bs Vikipediji (i ćirilica i latinica): „rođen u zaseoku…“, „rodna kuća je danas…“, „spomenik je podignut kod…“. Q-id i povezane strane daju i Commons kategoriju.
2. **Commons**: prvo kategorija spomenika ili kompleksa (opisi fajlova često kažu gde stoji, npr. „ispred zgrade muzeja“), pa kategorija heroja ili sela; `geosearch` oko sela je dopuna; geotag fotografije daje kandidata, a položaj samog spomenika proverava se zasebno.
3. **Lokalne vesti sa komemoracija**: „položeni vijenci kod spomen-kuće u…“, „obilježena godišnjica…“ — opština, SUBNOR/SABA, lokalni portali.
4. **Sajt opštine, turističke zajednice, registri kulturnog nasleđa** (zavodi za zaštitu spomenika, komisije za nacionalne spomenike).
5. **Google mape na jeziku i pismu mesta** (CDP, kao u skilu žetve), sa varijantama imena.

## Upiti

- Tačna fraza u navodnicima, na jeziku i pismu mesta; za Srbiju, BiH (RS) i Crnu Goru i ćirilicu.
- Varijante: padeži („Mire Popare“, „Miro Popara“), nadimak, sa i bez „narodni heroj“, staro i novo ime mesta i ulice.
- `allowed_domains` na domaće sajtove kad opšti upit vraća strane izvore; `mode: "extended"` tek kad standardna pretraga ne vrati ništa upotrebljivo.
- Nekoliko upita za istu stavku šalji u istom potezu.
- Opšta pretraga slabo nalazi lokalni sadržaj (seoske kuće heroja, spomen-domovi): i tačne fraze na ćirilici sa domaćim sajtovima vraćaju uglavnom Vikipediju. Tada pređi na brošure i knjige sa znaci.org i na zbirne izvore pre nego što trošiš još upita.
- Pročitaj najviše dva-tri najbolja izvora (WebFetch sa pitanjem o mestu), ne sve rezultate.

## Od teksta do tačke

- Opis mesta se pretvara u objekat: škola, dom, crkva, groblje, raskršće, zaselak — jedan zbirni Overpass upit za sve stavke, zatim Nominatim za adresu.
- Fotografija: GPS iz metapodataka (skil žetve) i poređenje sa Street View-om/Google fotografijama mesta.
- Tačka je tačna kad opis jednoznačno pokazuje na jedan objekat; inače se zapis samo pomera bliže i `priblizno` ostaje.
- Svaki trag, i neuspeh sa razlogom, upiši u `data/provere/odluke.json`, da se sledeći put ne ponavlja.

## Prinos

Posle svakih 5 pojedinačnih pretraga, odnosno završenog probnog dokumenta pri obradi literature, proveri prinos. Odvojeno broji potvrđene tačke, razrešene identitete/duplikate i kandidate. Ako nema korisnog novog dokaza, promeni pristup ili izvor; ne nastavljaj istim putem i ne predstavljaj samo preuzimanje ili čitanje kao uspešno lociranje.
