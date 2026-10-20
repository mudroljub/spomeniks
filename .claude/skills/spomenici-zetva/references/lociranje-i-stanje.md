# Lociranje, identitet i stanje

## Prioritet i potvrda tačke

Radi po verovatnoći uspeha, ne redom kroz radni spisak: najpre konkretni objekti, savremene adrese i precizne tačke. Centar sela, škole ili opštine nije koordinata spomenika. Kataloška oznaka „na mapi“ ne znači da je tačka precizna; proveri napomenu o njenom poreklu.

Pre upisa uporedi spomenike na mapi i spisak bez lokacije (`data/van-mape/bez_lokacije.json`), alatom `alati/pretraga.py` (blizina tačke, isto mesto, zajedničke osnove reči), umesto novog skripta za poređenje. Naziv naselja i opšta posveta nisu dovoljan par. Potvrdi vrstu, posvetu, natpis, izgled i mikrolokaciju; ista osoba može imati zasebnu bistu, ploču i grob u istom mestu. Park i pojedinačno delo u njemu takođe mogu biti različiti zapisi.

**Potvrda duplikata i različite godine (korisnik, 20.10.2026):** kada korisnik potvrdi da su dva zapisa duplikat, prihvati tu potvrdu; ne vraćaj zaključak na „verovatan duplikat“ samo zbog različitih godina. Razlika u godini sama po sebi nije dokaz drugog objekta niti nužno greška izvora: novija godina obično označava renoviranje, premeštanje, dogradnju ili zamenu. Kod potvrđenih duplikata zadrži stariju godinu kao godinu prvobitnog podizanja, a ostale godine i njihovo poreklo sačuvaj u postojećoj evidenciji odluka. Potvrđene kasnije faze sačuvaj u dvojezičnom opisu; bez dokaza ne izmišljaj šta se desilo novije godine. Brnjik je primer korisnikove potvrde: jedan zapis, godina 1953, uz sačuvan trag o 1983.

Za staru muzejsku adresu proveri današnju ustanovu i postavku. Ime zgrade ili njen centroid ne potvrđuju da je u njoj i dalje muzej NOB-a. Razlikuj raniji objekat od zamene: godina, autor, slika i lokacija ne prenose se automatski na novo delo.

Istorijska uloga zgrade sama po sebi ne potvrđuje muzej, spomen-kuću ni spomen-ploču. Vrstu `muzej` ne određuj samo po nekadašnjoj postavci; potvrđena mala spomen-kuća prati vrstu `spomen-kuca` iz standarda. Ako je postavka preneta, sačuvaj to u opisu sa datumom dokaza, bez pretpostavke da se unutrašnjost može obići ili da ploča danas postoji (Donja Trnova, spomen-kuća „Oslobođenje“: reportaža iz 2023. potvrđuje prenos postavke u depo Muzeja Semberije).

Ako tačka nije potvrđena, sačuvaj kandidata i razlog u radnom zapisu. Uklonjene objekte traži poslednje; i oni se upisuju kad je tačka poznata. Hrvatske kandidate proveri po postupku opstanka ispod; istorija odluka i dozvoljenog obima je u [hrvatskom odeljku lociranja](../../../../docs/LOCIRANJE_SPOMENIKA.md#hrvatska-rušenje-i-opstanak).

## Traženje i spajanje duplikata

- Poredi oba spiska preko zajedničkih čitača. Kombinuj normalizovan naziv, puno mesto i opštinu, posvetu, autora, fotografiju, blizinu i izvor; ne zahtevaj istu godinu, vrstu ili naziv. Širi poređenje i na različite nazive istog autora i iste posvete. Približne tačke u centru sela nisu dokaz istog objekta, a velika razlika tačaka može biti greška lokacije; istoimena sela proveri prema opštini izvora.
- Prvo čitaj sačuvane kataloge i Wiki kopije. Isti izvor može imati istorijski i noviji red istog objekta, ili različitu godinu u zaglavlju i u tekstu. Wiki koji prepisuje katalog nije nezavisna potvrda; potraži izričitu vezu, isti natpis, broj žrtava, fotografiju ili adresu. Različite posvete, kuće, jame i delovi naselja mogu potvrditi zasebne objekte uprkos istom naslovu.
- Razlikuj preseljenje istog predmeta, zamenu na istom mestu i dve istovremeno postojeće celine. Potvrđeno preseljenje nema dva aktuelna zapisa. Kada se objedine istorijske verzije iste ploče ili obeležja, u opisu zadrži godine i istoriju zamene; uklanjanje ranije ploče ili pojedinačne statue ne prenosi se kao stanje čitave sačuvane celine. Park i samostalno delo u njemu ne spajaj samo zbog zajedničkog mesta.
- Pre upisa pripremi mapu uklonjeni ID → zadržani ID i očekivane stare vrednosti. Pod jednom bravom ponovo učitaj oba spiska i povezane metapodatke. Zadrži potvrđenu tačku i postojeći ID, prenesi nedostajuće podatke i sva potvrđena imena autora, izvor, izvor stanja i provere; nesaglasne podatke sačuvaj uz dokaz odluke. Ne vraćaj polja koja su uklonjena iz važećih tipova.
- Preusmeri aktivne `cilj` i `radniId` veze iz knjiga i izveštaja; istorijske ID-jeve i snimke ne prepravljaj. Sačuvaj poreklo obe stavke pre nego što zajednički upis očisti metapodatke uklonjenog ID-ja. Ako se menjaju oba spiska, završni upis mape mora da prati konačan sastav spiska bez lokacije, da ne ostanu izdvojeni detalji i prevodi obrisanih markera.
- Izaberi jednu postojeću fotografiju sa odgovarajućim potpisom. Korisnu alternativu pre uklanjanja sa sajta sačuvaj u `izvori/` sa poreklom; javnu sliku i njenu malu verziju ukloni tek kad proveriš da ih nijedan preostali zapis ne koristi. Posle spajanja primeni [proveru podataka i veza](../../spomenici-provera/SKILL.md#veze-radnih-zapisa-i-knjiga).

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

**Hrvatska:** približno pola spomenika NOB u Hrvatskoj je uništeno. Pri žetvi izvora nastalih pre 1991. sačuvaj korisne istorijske podatke, ali proveri kasnije izvore, posebno Hrženjaka (2002), pre zaključka o opstanku. Stari opis ili fotografija nisu potvrda današnjeg postojanja; podatak o ukupnim razmerama uništavanja nije dokaz rušenja pojedinačnog spomenika.

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
| srušeno, uklonjeno ili u depou, bez dokaza povratka | ostaviti na mapi na poznatoj tački, sa `stanje` (`rusevine` ako se ostaci vide, inače `uklonjen`) i izvorom u `data/izvori/izvori-stanja.json`; uklonjeni koji nisu istaknuti, spomen-park, muzej ni spomenik i srušeni bez tačne tačke koji nisu istaknuti idu u `data/van-mape/arhiva.json`; bez tačke u `data/van-mape/bez_lokacije.json` |
| nedovoljno dokaza | vratiti u `data/van-mape/bez_lokacije.json`; ne označavati kao srušeno |
| drugi objekat ili duplikat | razdvojiti ili spojiti, uz očuvanje porekla |

Ploče se preskaču osim veoma bitnih; dokaz da ploča postoji ne znači da ulazi u izbor. Sama provera ne odobrava nove promene izvan dogovorenog obima.

## Poreklo podataka i izveštaj

Postojeći `izvor` ne zamenjuj URL-om nove fotografije ili kasnije provere. Dopunske dokaze, stvarne datume, prethodni zapis, odluku i obrazloženje čuvaj mašinski čitljivo u `data/provere/`: pojedinačnu odluku kao novi zapis u zajedničkom `data/provere/odluke.json` (sa poljem `odluka`, kratkim imenom), a zbirni prolaz kroz mnogo stavki kao nov ključ u fajlu svoje vrste u `data/provere/`. `docs/` je za ljude: tamo ide sažetak i veza na izveštaj, ne pojedinačni dokazi (korisnik, 2026-10-18). Prazan izvor može se dopuniti potvrđenim izvorom.

Stavke bez lokacije prebacuj alatom `alati/prebaci.py`, koji čuva ID, pa knjiške veze i radni ID-jevi ostaju tačni; pri spajanju ih preusmeri po [skilu provere](../../spomenici-provera/SKILL.md#veze-radnih-zapisa-i-knjiga). Istorijske rezultate i brojke upiši u [evidenciju lociranja](../../../../docs/LOCIRANJE_SPOMENIKA.md) ili [hrvatski odeljak](../../../../docs/LOCIRANJE_SPOMENIKA.md#hrvatska-rušenje-i-opstanak), a postupke dopunjavaj ovde.
