# Plan žetve

Napravljeno **2026-10-18**. Cilj: novi partizanski spomenici, spomen-groblja i slično iz pouzdanih izvora (zvanični registri, opštinski registri, akademska i spomenička literatura), po svim republikama bivše Jugoslavije. Šta je već obrađeno piše u [IZVORI.md](IZVORI.md); ovde su samo izvori koji nisu obrađeni ili su obrađeni delimično.

## Pravila

- **Redosled po prinosu:** prvo izvori sa koordinatama ili adresama za mnogo objekata odjednom, zatim katalozi sa opisom mesta, na kraju pojedinačne odluke i članci.
- **Pre kopiranja predlog:** za svaki izvor prvo provera obima i formata (bez preuzimanja u projekat), pa predlog korisniku, pa preuzimanje u `izvori/`.
- **Proba pre celine:** iz svakog novog izvora prvo uzorak od 20 stavki upoređen sa bazom; nastavak samo ako uzorak donese nove ili ispravljene zapise.
- **Bez pretpostavki:** stavka bez tačke ide u `data/bez_lokacije.json`; tačka sela samo uz `priblizno`.
- **Zatvaranje:** posle svakog izvora ažurirati njegov red u [IZVORI.md](IZVORI.md) i ukloniti ga odavde.

## Prioriteti

| # | Izvor | Republika | Zašto | Stanje provere |
|---|---|---|---|---|
| 1 | Partisan Memorials Wiki, preostali propusti | sve | Raniji ponovni prolaz već je doneo 18 + 99 novih markera i 45 prenosa; stara procena od oko 490 preskočenih nije današnji preostali obim. Novi uzorak od 20 dao je 14 novih lokacija i 5 preciziranih tačaka. | delimično; [odluke i uzorak](../data/provere/wiki-propusti-2026-10-18.json), ne ponavljati pregledane |
| 3 | OSM, ponovni prolaz po državi | S. Makedonija, Kosovo, Slovenija (Srbija urađena 2026-10-18) | Za BiH, Hrvatsku i Crnu Goru postoje izvozi u `izvori/osm/`; ostale države nisu prošle isti postupak (`historic=memorial`, dalje od 250 m od naših tačaka). | nije počelo |
| 4 | Kosovo, spisak kulturne baštine pod zaštitom (Ministarstvo kulture) | Kosovo | Zvanični spisak sa memorijalnim spomenicima; imamo malo kosovskih zapisa. | nije provereno |
| 5 | S. Makedonija, Nacionalni registar kulturnog nasleđa (Uprava za zaštitu kulturnog nasleđa) | S. Makedonija | Zvanični registar; Trajkovski 1986 je pregledan samo uzorkom i nema tekstualni sloj. | nije provereno |
| 6 | Zavod za zaštitu spomenika kulture Republike Srpske i Zavod FBiH | BiH | Registri entitetskih zavoda; Tihićeva evidencija 1966–1973 (476 grobalja i grobnica) je kod Zavoda FBiH. | nije provereno; kartoni verovatno samo na zahtev |
| 7 | Regionalni zavodi u Srbiji (Niš, Kraljevo, Kragujevac, Valjevo, Pokrajinski zavod Vojvodine) | Srbija | Spiskovi „znamenitih mesta“ i elaborati po opštinama. | nije provereno |
| 8 | Registar ratnih memorijala, Ministarstvo za rad, zapošljavanje, boračka i socijalna pitanja | Srbija | Vodi se po Zakonu o ratnim memorijalima, ali nije javno objavljen; moguć zahtev za pristup informacijama od javnog značaja. | odluka korisnika |
| 9 | Sanja Horvatinčić, doktorska disertacija o spomenicima NOB u Hrvatskoj (Zagreb) | Hrvatska | Akademski katalog sa autorima i godinama; dopuna Hrženjaka. | nije provereno |
| 10 | Znaci.org, spomeničke monografije opština | sve | Pored pet obrađenih knjiga ima još lokalnih izdanja „Spomenici revolucije …“; jedan pregled kataloga daje spisak. | nije provereno |
| 11 | Saopštenja RZZSK X (1974), *Prilog evidenciji spomenika posvećenih 1941. u Srbiji* ([PDF](https://www.heritage.gov.rs/cirilica/Download/Saopstenja/Saopstenje-X-1974/Saopstenje_X_1974_Prilog_evidenciji_spomenika_posvecenih_u_Srbiji_1941.pdf)) | Srbija | Stručna evidencija Republičkog zavoda sa autorima; dopuna Popović-Žume za spomenike ustanka. | pronađen, nije pročitan |
| 12 | Vulović, katalog NOR spomenika čačanskog kraja, *Zbornik radova Narodnog muzeja Čačak* ([PDF](https://zbornik.cacakmuzej.org.rs/files/zbornik/6/ZRNMC_06_16.pdf)) | Srbija | Katalog sa opisom i dimenzijama svakog spomenika; vidi i [drugi broj](https://zbornik.cacakmuzej.org.rs/files/zbornik/3/ZRNMC_03_13.pdf). | pronađen, nije pročitan |
| 13 | Otvoreni tragovi iz [IZVORI.md](IZVORI.md#literatura-za-spomen-groblja) | BiH | Mramorje evidencioni listovi (TLS greška), Bešlagić 1958 i Vojinović 1969 (Jajce), Hozić (Teslić), Bokan (Sanski Most). | tragovi postoje, nisu pročitani |

Crna Gora je zatvorena odlukom korisnika (vidi [IZVORI.md](IZVORI.md#crna-gora)); Slovenija je posle drugog prolaza kroz RNPD (2026-10-18, 201 nov) praktično iscrpljena zvaničnim izvorima.

## Prvi korak

Stavka 1: nastavak od preostalih kandidata u `izvori/pretrage/wiki-propusti-2026-10-18/kandidati.json`, uz preskakanje pregledanog uzorka i ponovno poređenje sa trenutnom bazom. Prednost imaju fotografisani objekti sa konkretnim opisom tačke; isti objekat iz knjige najpre precizirati, umesto novog markera. Lista kandidata sadrži i sadržaje van obuhvata i duplikate; njen broj nije broj novih spomenika.
