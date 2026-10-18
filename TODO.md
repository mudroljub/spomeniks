# Plan stabilnih ID-jeva za reference na `bez_lokacije`

- [ ] **Popisati žive reference i potrošače.** Obuhvatiti `upareno`, `uparivanje` i aktivne `radniIndeks` reference; `radniIndeksPre` ostaviti kao istorijski podatak.
- [ ] **Dodeliti nepromenljive ID-jeve** svim redovima u `data/bez_lokacije.json`. Svaki red dobija jedinstven ID, uključujući duplikate; ID se ne izvodi iz naziva ili lokacije.
- [ ] **Prilagoditi integritet i format podataka** da reference koriste ID, uz podršku za oba oblika uparivanja (`upareno` i `uparivanje`). Za aktivne izveštaje koristiti `radniId`.
- [ ] **Prevesti postojeće reference** koristeći zamrznutu kopiju trenutnog redosleda kao mapu stari indeks → ID. Ne preračunavati istorijska polja.
- [ ] **Proveriti migraciju:** broj veza pre i posle mora biti isti; svi ID-jevi jedinstveni i razrešivi; promena redosleda ili brisanje reda ne sme promeniti cilj drugih veza.
- [ ] **Ažurirati dokumentaciju i pregledati diff** u zasebnoj izmeni; ukloniti numeričke aktivne reference tek kad provere potvrde da su sve prevedene.
