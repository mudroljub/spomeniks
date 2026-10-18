# Lociranje, identitet i stanje

## Prioritet i potvrda tačke

Radi po verovatnoći uspeha, ne redom kroz radni spisak: najpre konkretni objekti, savremene adrese i precizne tačke. Centar sela, škole ili opštine nije koordinata spomenika. Kataloška oznaka „na mapi“ ne znači da je tačka precizna; proveri napomenu o njenom poreklu.

Pre upisa uporedi spomenike na mapi i spisak bez lokacije (`data/bez_lokacije.json`), alatom `alati/pretraga.py` (blizina tačke, isto mesto, zajedničke osnove reči), umesto novog skripta za poređenje. Naziv naselja i opšta posveta nisu dovoljan par. Potvrdi vrstu, posvetu, natpis, izgled i mikrolokaciju; ista osoba može imati zasebnu bistu, ploču i grob u istom mestu. Park i pojedinačno delo u njemu takođe mogu biti različiti zapisi.

Za staru muzejsku adresu proveri današnju ustanovu i postavku. Ime zgrade ili njen centroid ne potvrđuju da je u njoj i dalje muzej NOB-a. Razlikuj raniji objekat od zamene: godina, autor, slika i lokacija ne prenose se automatski na novo delo.

Ako tačka nije potvrđena, sačuvaj kandidata i razlog u radnom zapisu. Uklonjene objekte traži poslednje; i oni se upisuju kad je tačka poznata. Hrvatske kandidate proveri po postupku opstanka ispod; istorija odluka i dozvoljenog obima je u [hrvatskim beleškama](../../../../docs/PROVERA_RUSENJA_HRVATSKA.md).

## Literatura i grobni objekti

Za više nerešenih lokacija biraj izvore po verovatnoći da daju upotrebljiv položaj i po broju otvorenih objekata koje pokrivaju. Prednost imaju regionalni evidencioni kartoni, konzervatorski elaborati, karte i katastarski prilozi; lokalne monografije i zbornici pomažu kada daju mikrotoponime, opis sahrane ili preseljenja. Ne obrađuj automatski redom radni spisak, dostupne knjige ili stotine stranica ratne istorije bez lokacijskog sadržaja.

- Pre preuzimanja proveri `izvori/` i [IZVORI.md](../../../../docs/IZVORI.md). Razlikuj bibliografski zapis, dostupan preglednik i stvarno dostupan pun tekst. Proveri naslovnu stranu, sadržaj i dostupni raspon; broj PDF listova nije broj štampanih strana niti dokaz da nema praznina. Zabeleži šta je zaista pročitano, a šta samo pronađeno ili preuzeto.
- Najpre pregledaj sadržaj, registar i dodatke jednog dokumenta koji pokriva izglednu grupu. OCR/tekst izdvoji jednom, pa pretražuj sve relevantne nazive mesta, stare administrativne granice, imena posvećenih i korene `groblj`, `kosturn`, `grobn`, `ekshum`, `prenes`, `premješt`, `ukop`, `sahran`, `parcela`. Presudan nalaz proveri na skenu.
- Iz jednog izvora izdvoji sve relevantne otvorene objekte uz štampanu/PDF stranu, opis položaja, fotografiju/kartu i datum opisanog stanja. Pre lociranja uporedi glavnu bazu i radni skup. Popis poginulih i mesto pogibije nisu popis današnjih grobova.
- UI kategorija `spomen-groblje` može obuhvatati groblje, kosturnicu, zajedničku ili pojedinačnu grobnicu: u dokazima sačuvaj stvarni oblik. Razlikuj ceo kompleks, pojedinačni grob i istorijskog prethodnika; kod prenosa ostataka poveži staro i novo mesto, ne pravi duplikat.
- Zbirna tabela potvrđuje obuhvat istorijske evidencije, ne pojedinačne lokacije ili današnji broj objekata. Kataloško „postoji“ i datum unosa/objave nisu potvrda današnjeg stanja. Tačka ulaza u groblje, susednog objekta ili fotografa nije precizna tačka traženog groba; približne unose obrađuj po zasebnom pravilu žetve i ne računaj ih kao precizno locirane.
- Po završenom probnom dokumentu odvojeno izmeri nove potvrđene tačke, razrešene identitete/duplikate i nepotvrđene kandidate. Ako nema korisnih opisa položaja ili prenosa, promeni izvor; preuzete strane nisu rezultat lociranja. Ne ponavljaj neuspešan izvor bez novog razloga.

Naslovi, dostupnost i obrađenost ostaju u `docs/IZVORI.md`, a trenutni prioriteti i rezultati u `docs/LOCIRANJE_SPOMENIKA.md` i postojećim izveštajima u `data/provere/`; njihove promenljive brojke ne kopiraj u skil. Proveru integriteta podataka radi po završenom paketu, ne za svaki pojedinačni unos.

## Staro oštećenje i kasniji dokaz

Pročitaj odlučujući knjiški nalaz na originalnom skenu, sa štampanom stranom i brojem skena. Koristi već preuzete strane. Indeks i opis istog objekta računaj kao jedan dokaz. Proveri legendu oznaka i dodatke sa ispravkama; indeks, osnovni tekst i dodatak mogu opisivati različita stanja ili različite objekte.

Za kasniji dokaz koristi datiran obilazak, fotografiju konkretnog objekta sa potvrđenim mestom, izveštaj o obnovi ili komemoraciji ili konzervatorski/muzejski izvor. Kod rušenja ili uklanjanja iz Hrženjaka traži konkretan dokaz obnove ili preseljenja posle 2002.

Složi hronologiju: podizanje, zabeleženo oštećenje ili uklanjanje, kasnija obnova ili premeštanje, poslednji datirani dokaz. Kasnija fotografija potvrđuje postojanje tada, ne automatski danas. Najava radova ili preseljenja nije potvrda da su završeni; odsustvo iz popisa nije potvrda očuvanosti. Bez dokaza ostavi zaključak neizvestan.

Razlikuj fizičko oštećenje od promene simbola ili opšte oznake oskvrnuća. Poznata kasnija obnova ima prednost nad starim oštećenjem. Zatečeno stanje ne zamenjuj starijim nalazom; istorijski podatak prenosi samo u izričito odobrenom obimu, uz zaseban izvor i vidljivu godinu. Ograničeni prenos ili pilot ne odobrava širu proveru.

## Odluka u odobrenom obimu

| Ishod | Postupak |
|---|---|
| očuvano ili obnovljeno, na tačnoj tački | zadržati; dokaz i njegov datum u evidenciji |
| oštećeno, ali stoji | zadržati; `stanje: ostecen` samo uz dokaz o tom stanju |
| premešteno | potvrđena današnja tačka; stara samo u evidenciji, bez drugog markera |
| srušeno, uklonjeno ili u depou, bez dokaza povratka | ostaviti na mapi na poznatoj tački, sa `stanje` (`srusen`, `uklonjen`) i `stanjeIzvor`; bez tačke u `data/bez_lokacije.json` |
| nedovoljno dokaza | vratiti u `data/bez_lokacije.json`; ne označavati kao srušeno |
| drugi objekat ili duplikat | razdvojiti ili spojiti, uz očuvanje porekla |

Ploče se preskaču osim veoma bitnih; dokaz da ploča postoji ne znači da ulazi u izbor. Sama provera ne odobrava nove promene izvan dogovorenog obima.

## Poreklo podataka i izveštaj

Postojeći `izvor` ne zamenjuj URL-om nove fotografije ili kasnije provere. Dopunske dokaze, stvarne datume, prethodni zapis, odluku i obrazloženje čuvaj mašinski čitljivo u `data/provere/`: pojedinačnu odluku kao novi zapis u zajedničkom `data/provere/odluke.json` (sa poljem `odluka`, kratkim imenom), a poseban fajl pravi samo za zbirni prolaz kroz mnogo stavki. `docs/` je za ljude: tamo ide sažetak i veza na izveštaj, ne pojedinačni dokazi (korisnik, 2026-10-18). Prazan izvor može se dopuniti potvrđenim izvorom.

Stavke bez lokacije prebacuj alatom `alati/prebaci.py`, koji čuva ID, pa knjiške veze i radni ID-jevi ostaju tačni; pri spajanju ih preusmeri po [skilu provere](../../spomenici-provera/SKILL.md#veze-radnih-zapisa-i-knjiga). Istorijske rezultate i brojke upiši u [evidenciju lociranja](../../../../docs/LOCIRANJE_SPOMENIKA.md) ili [hrvatske provere](../../../../docs/PROVERA_RUSENJA_HRVATSKA.md), a postupke dopunjavaj ovde.
