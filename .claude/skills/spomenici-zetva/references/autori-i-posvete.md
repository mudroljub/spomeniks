# Autori i posvete

Istorijski rezultati i pojedinačni izuzeci su u [beleškama o autorima i posvetama](../../../../docs/DOPUNA_PODATAKA.md). Ova referenca sadrži postupke; format zapisa i osnovna pravila posveta ostaju u glavnom skilu i standardu.

## Autori

- **Prioritet su puna imena i prezimena** (korisnik, 2026-10-19): prvo razrešavati već upisane inicijale i nepotpune potpise. Potvrditi osobu, zanimanje i period rada; isti inicijal i prezime nisu dovoljni ako postoji više kandidata. Sačuvati prethodni oblik i dokaz u `data/provere/`, a preostale slučajeve proveravati po važnosti spomenika.

- **Odluke o identitetu autora** (korisnik): „S. Cvetković“ je Stojan Cvetković, vajar iz Belanovca (2026-10-20). Takav inicijal se upisuje punim imenom bez dodatne potvrde.

- Članak o autoru traži na sh, hr, sr (ćirilicom), sl, mk i en Wikipediji, zbirno po 50 naslova (`titles=`, pa `pageprops` za Q-id). Prihvati ga samo ako je na Wikidati P31 = Q5 i P106 umetnik, vajar ili arhitekta. Ranija skripta za ovo (`autori_wiki.py`) nije sačuvana, pa se postupak piše iznova.

- Dela autora na Wikidati traži preko P170/P84 sa koordinatama, a spiskove dela iz članaka preuzimaj zbirno po jeziku. Poznato ime autora u opisu ne dokazuje autorstvo svakog dela u parku.
- Slovenački padežni oblik u opisu sa rečima „delo“, „avtor“, „kipar“ ili „arhitekt“ koristi kao kandidata; potvrdi osobu i konkretno delo pre upisa.
- Park ima autora samo kada su sva dela u njemu jednog autora. Razlikuj autora celine i autora pojedinačnog spomenika; pojedinačna dela odvajaj tek kada su identitet i lokacija potvrđeni.
- Geopedia koordinate `_x…_y…` iz slovenačkih članaka su D48/GK, ne WGS84. Koristi postojeći konverter ako je sačuvan i proveri rezultat na poznatoj tački; ne prepisuj te brojeve kao geografsku širinu i dužinu.
  - Raniji `gk.py` koristio je Helmert TOWGS84 `409.545,72.164,486.872,3.085957,5.469110,-11.020289,17.919665`; provera na Poljčama odstupala je 21 m. To je trag za ponovno nalaženje postupka, ne potvrda tačnosti svake prevedene tačke.

## Posvete

- Polje `posveta` je spisak Wikidata stavki sa nazivima i linkovima u `data/posvete.json`, ili kratak običan tekst kada nema odgovarajućeg članka. Prozor prikazuje „Posvećeno: …“ sa linkovima za Q-id spisak, odnosno bez linka za tekst. Oblik i primeri su u [standardu zapisa](standard.md).

- Kandidate traži preko OSM `subject:wikidata` i Wikidata P547. Uparivanje po OSM ID-ju ili blizini potvrdi nazivom, vrstom i posvetom: susedno obeležje može biti posvećeno drugoj osobi.
- Za narodne heroje koristi P166 = Q1262166 (Orden narodnog heroja), dopunjeno kategorijama na sr i sh Wikipediji. Za ostale ličnosti koriste se jezička stabla kategorija partizana; pripadnost kategoriji i slična osnova prezimena nisu dovoljan dokaz identiteta.
- Jedinice traži u kategorijama brigada, odreda, divizija i korpusa NOVJ, uz nazive i alijase. Veze P361/P749 same daju nepotpun spisak. Potvrdi vrstu jedinice, redni broj i puno ime: Gorenjski nije crnogorski, Kosovelova nije kosovska brigada, a ista brojka se javlja kod različitih jedinica. Bataljon ili četa dobija posvetu brigade/odreda samo kada je ona navedena u nazivu.
- Osnivanje jedinice upućuje na tu jedinicu. Kod ustanka potvrdi konkretan događaj i članak; „Poziv na ustanak“ kao naziv skulpture sam ne potvrđuje posvetu određenom ustanku.
  - U ranijem prolazu korišćeni su članci „Ustanak u Srbiji 1941.“, „Ustanak u Crnoj Gori 1941.“, „Ustanak u NDH“ za Hrvatsku/BiH i makedonski članak o ustanku 1941; za slovenačku „vstaju“ i opšte jugoslovenske godišnjice „Ustanak u okupiranoj Jugoslaviji“. Potvrdi da se konkretan natpis odnosi na taj događaj pre ponavljanja veze.
  - Ploče odborima i aktivistima Osvobodilne fronte poveži sa OF kada to potvrđuje posveta; razlikuj OF, VOS i osnivanje KPH kao zasebne organizacije/događaje.
- Bez odgovarajućeg članka prenesi konkretne podatke o posveti kao kratak tekst, prema potvrđenom izvoru. Ne dodaj samo opšte pojmove poput NOB-a, NOVJ, Drugog svetskog rata ili bratstva i jedinstva; članak o samom spomeniku nije njegova posveta.
