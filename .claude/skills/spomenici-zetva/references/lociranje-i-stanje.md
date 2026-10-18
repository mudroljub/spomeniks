# Lociranje, identitet i stanje

## Prioritet i potvrda tačke

Radi po verovatnoći uspeha, ne redom kroz radni spisak: najpre konkretni objekti, savremene adrese i precizne tačke. Centar sela, škole ili opštine nije koordinata spomenika. Kataloška oznaka „na mapi“ ne znači da je tačka precizna; proveri napomenu o njenom poreklu.

Pre upisa uporedi oba skupa, `data/spomeniks.json` i `data/bez_lokacije.json`. Naziv naselja i opšta posveta nisu dovoljan par. Potvrdi vrstu, posvetu, natpis, izgled i mikrolokaciju; ista osoba može imati zasebnu bistu, ploču i grob u istom mestu. Park i pojedinačno delo u njemu takođe mogu biti različiti zapisi.

Za staru muzejsku adresu proveri današnju ustanovu i postavku. Ime zgrade ili njen centroid ne potvrđuju da je u njoj i dalje muzej NOB-a. Razlikuj raniji objekat od zamene: godina, autor, slika i lokacija ne prenose se automatski na novo delo.

Ako tačka nije potvrđena, sačuvaj kandidata i razlog u radnom zapisu. Uklonjene objekte traži poslednje; i oni se upisuju kad je tačka poznata. Hrvatske kandidate proveri po postupku opstanka ispod; istorija odluka i dozvoljenog obima je u [hrvatskim beleškama](../../../../docs/PROVERA_RUSENJA_HRVATSKA.md).

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

Postojeći `izvor` ne zamenjuj URL-om nove fotografije ili kasnije provere. Dopunske dokaze, stvarne datume, prethodni zapis, odluku i obrazloženje čuvaj u odgovarajućem izveštaju u `data/provere/` i tematskoj belešci; prazan izvor može se dopuniti potvrđenim izvorom.

Posle prebacivanja ili spajanja očuvaj knjiške veze i aktivne radne indekse po [skilu provere](../../spomenici-provera/SKILL.md#veze-radnih-zapisa-i-knjiga). Istorijske rezultate i brojke upiši u [evidenciju lociranja](../../../../docs/LOCIRANJE_SPOMENIKA.md) ili [hrvatske provere](../../../../docs/PROVERA_RUSENJA_HRVATSKA.md), a postupke dopunjavaj ovde.
