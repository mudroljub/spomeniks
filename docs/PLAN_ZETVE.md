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
| 1 | Partisan Memorials Wiki, ponovni prolaz | sve | Lokalna kopija već postoji (`izvori/xiwl/`); poznat propust (Brod, Crna Trava). Oko 490 stranica sa našim zapisom iste vrste u istom selu nije uvezeno. Bez mrežnih zahteva. | spreman |
| 2 | Popović-Žuma, *Spomenici NOB i revolucije SR Srbije 1941–45* ([PDF, afterart](https://afterart.files.wordpress.com/2017/05/spomenici-narodnooslobodilacke-borbe-i-revolucije-sr-srbije-1941-45_popovic-zuma.pdf)) | Srbija | Celovit katalog za Srbiju, koji do sada nismo koristili; citira ga i wiki. | dostupan, 214 MB; sadržaj i tekstualni sloj nisu provereni |
| 3 | OSM, ponovni prolaz po državi | Srbija, S. Makedonija, Kosovo, Slovenija | Za BiH, Hrvatsku i Crnu Goru postoje izvozi u `izvori/osm/`; ostale države nisu prošle isti postupak (`historic=memorial`, dalje od 250 m od naših tačaka). | nije počelo |
| 4 | Kosovo, spisak kulturne baštine pod zaštitom (Ministarstvo kulture) | Kosovo | Zvanični spisak sa memorijalnim spomenicima; imamo malo kosovskih zapisa. | nije provereno |
| 5 | S. Makedonija, Nacionalni registar kulturnog nasleđa (Uprava za zaštitu kulturnog nasleđa) | S. Makedonija | Zvanični registar; Trajkovski 1986 je pregledan samo uzorkom i nema tekstualni sloj. | nije provereno |
| 6 | Zavod za zaštitu spomenika kulture Republike Srpske i Zavod FBiH | BiH | Registri entitetskih zavoda; Tihićeva evidencija 1966–1973 (476 grobalja i grobnica) je kod Zavoda FBiH. | nije provereno; kartoni verovatno samo na zahtev |
| 7 | Regionalni zavodi u Srbiji (Niš, Kraljevo, Kragujevac, Valjevo, Pokrajinski zavod Vojvodine) | Srbija | Spiskovi „znamenitih mesta“ i elaborati po opštinama. | nije provereno |
| 8 | Registar ratnih memorijala, Ministarstvo za rad, zapošljavanje, boračka i socijalna pitanja | Srbija | Vodi se po Zakonu o ratnim memorijalima, ali nije javno objavljen; moguć zahtev za pristup informacijama od javnog značaja. | odluka korisnika |
| 9 | Sanja Horvatinčić, doktorska disertacija o spomenicima NOB u Hrvatskoj (Zagreb) | Hrvatska | Akademski katalog sa autorima i godinama; dopuna Hrženjaka. | nije provereno |
| 10 | Znaci.org, spomeničke monografije opština | sve | Pored pet obrađenih knjiga ima još lokalnih izdanja „Spomenici revolucije …“; jedan pregled kataloga daje spisak. | nije provereno |
| 11 | Otvoreni tragovi iz [IZVORI.md](IZVORI.md#literatura-za-spomen-groblja) | BiH | Mramorje evidencioni listovi (TLS greška), Bešlagić 1958 i Vojinović 1969 (Jajce), Hozić (Teslić), Bokan (Sanski Most). | tragovi postoje, nisu pročitani |

Crna Gora je zatvorena odlukom korisnika (vidi [IZVORI.md](IZVORI.md#crna-gora)); Slovenija je posle drugog prolaza kroz RNPD (2026-10-18, 201 nov) praktično iscrpljena zvaničnim izvorima.

## Prvi korak

Stavka 1: ponovo upariti lokalnu kopiju wikija sa bazom i spiskom bez lokacije, posebno stranice koje je prvi uvoz upario sa stavkom iz bez_lokacije ili sa drugim zapisom u istom selu, i korisniku predložiti spisak propusta pre upisa.
