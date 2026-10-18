# Žetva: Crna Gora

Plan i ishod prikupljanja spomenika NOB-a u Crnoj Gori. Pravila su u skilu `spomenici-zetva`, pregled svih izvora u [IZVORI.md](IZVORI.md), a preuzeti fajlovi u `izvori/cg/`, `izvori/osm/` i `izvori/commons/`.

## Stanje

Na mapi je 118 crnogorskih spomenika, a u `data/bez_lokacije.json` još 39 (2026-10-18). SUBNOR procenjuje oko 1.700 spomenika i spomen-obeležja ([Istorijski zapisi](https://istorijskizapisi.me/wp-content/uploads/2022/04/31-D-Vlahovic-387-394.pdf)), pa je pokrivenost mala. Otvoren državni registar sa koordinatama ne postoji.

## Obrađeno

| Izvor | Datum | Na mapi | Bez lokacije | Napomena |
|---|---|---|---|---|
| [StoryMap NOB spomenika](https://uploads.knightlab.com/storymapjs/d68e44a5a6fd5fe5aa97d31f7b027ae3/mapa-spomenika-narodnooslobodilacke-borbe/index.html) (Vijesti) | 17.10. | 1 | 5 | 28 tačaka, 18 već imamo; tačke su približne. |
| Biste u Pljevljima | 17.10. | — | — | Park zaslužnih Pljevljaka iz više epoha, ne NOB. |
| [Registar Herceg Novog](https://www.hercegnovi.me/downloads/Kultura/REGISTAR%20SPOMEN%20OB%20O%20HN.pdf), 2016 | 17.10. | 1 i 2 dopune | 9 | 42 NOB upisa, od toga 22 ploče. |
| OSM, cela Crna Gora | 18.10. | 2 | — | 300 objekata, većina bez imena, ploče ili druge epohe. |
| [Danilovgrad](https://www.spomenikdatabase.org/_files/ugd/e73a14_0bc2984a2f72446b9f40641ff26a558f.pdf), SUBNOR 2017 | 18.10. | 5 novih, 3 dopune | 13 | Od prvobitnih 19 radnih stavki Dabovići, Grlić, Dolovi Kovačevića, Gostilj i Viš prebačeni na mapu; Ostrog povezan sa postojećim markerom. Grlić, Dolovi i Gostilj provereni preko konkretnog Google mesta ili vidljivih postolja na satelitu, uz knjigu i terenski katalog; Viš dodatno potvrđen video-snimkom sa GPS-om od 10.08.2019. ([izveštaj](../data/provere/lociranje-danilovgrad-2026-10-18.json)). |
| [Registar Budve](https://api.budva.me/media/files/PDF/Informacije/spomen_obiljezja-2023.pdf), 2015 | 18.10. | 2 i 1 dopuna | 1 | 29 upisa, 17 ploča; bez fotografija. |
| [Katalog Narodni heroji](https://www.narodniheroji.me/index.php/istrazi/spomenici) | 18.10. | 8 | 2 | 115 zapisa; tačke su centri opština, osim 10 ručno postavljenih u Mojkovcu. |
| Commons, kategorije spomenika | 18.10. | 1 | — | 230 fajlova, 187 bez GPS-a. |
| [Tragovima maršala](https://tragovimamarsala.rs/crna-gora/) i [CdM forum](https://forum.cdm.me/showthread.php?203141-Spomenici-Narodnooslobodila%C4%8Dke-borbe/page2) | 18.10. | 5 dopuna | — | Samo veći spomenici, koje već imamo; dopunjeni autori i godine. |

Probni prolaz po školskim adresama prebacio je na mapu biste Daša Pavičića i Ilije Kišića ([izveštaj](../data/provere/lociranje-probni-2026-10-18.json)).

## Otvoreno

- **Herceg Novi:** Kameno i Baošići imaju po dva objekta u registru, a mi po jedan zapis; Bezmetković u registru ima i Luku Tomanovića kao autora; Đurkovićev zapis je vrste `spomenik`, a to je bista.
- **OSM:** „Spomenik Lovćenski odred“ (n5519788722), jer Google na tom mestu daje „Lovćenska vila“; bista Jakuba Kubura kod Boljanića (n8991363785), identitet nepotvrđen; 12 neimenovanih `war_memorial` tačaka.
- **StoryMap:** Krstac na Goliji (1,1 km od našeg u Gornjem Čarađu), „Voda Partizanka“ u Stravču; Stražica je verovatno naš `pljevlja-fallen-fighters`.
- **Danilovgrad:** 13 stavki bez potvrđene tačke. Terenski katalog ima i procenjene lokacije; ne uvoziti ih automatski, posebno dve gradske kosturnice (rodoljubima iz 1974. autor nije našao tokom obilaska 2025). Knjiga beleži i ukradene ili pohranjene biste (Miladin Pavličić, Vasilije-Žarko Đurović): ne mapirati ih na starom mestu.
- **Ulcinj:** „Spomenik palim borcima“ iz kataloga je verovatno naš Spomenik Pobjede.

## Sledeći izvor

[Facebook „Spomenici NOB u Crnoj Gori“](https://www.facebook.com/spomenicinobucrnojgori/?locale=sr_RS) je najveći preostali izvor fotografija i opisa. Bez prijave je nedostupan, pa će ga korisnik, prijavljen, ručno sačuvati, a zatim se čita lokalno. Knjige bez javnog PDF-a vode se u [IZVORI.md](IZVORI.md).
