# Plan žetve

Napravljeno **2026-10-18**. Cilj: novi partizanski spomenici, spomen-groblja i slično iz pouzdanih izvora (zvanični registri, opštinski registri, akademska i spomenička literatura), po svim republikama bivše Jugoslavije. Šta je već obrađeno piše u [IZVORI.md](IZVORI.md); ovde su samo izvori koji nisu obrađeni ili su obrađeni delimično.

## Pravila

- **Redosled po prinosu:** prvo izvori sa koordinatama ili adresama za mnogo objekata odjednom, zatim katalozi sa opisom mesta, na kraju pojedinačne odluke i članci.
- **Pre kopiranja predlog:** za svaki izvor prvo provera obima i formata (bez preuzimanja u projekat), pa predlog korisniku, pa preuzimanje u `izvori/`.
- **Proba pre celine:** iz svakog novog izvora prvo uzorak od 20 stavki upoređen sa bazom; nastavak samo ako uzorak donese nove ili ispravljene zapise.
- **Bez pretpostavki:** stavka bez tačke ide u `data/bez_lokacije.json`; tačka sela samo uz `priblizno`.
- **Samo javni izvori:** u plan ulaze samo izvori dostupni na mreži; štampana izdanja, registri na zahtev i bibliografski tragovi bez teksta se ne upisuju (korisnik, 2026-10-19).
- **Zatvaranje:** posle svakog izvora ažurirati njegov red u [IZVORI.md](IZVORI.md) i ukloniti ga odavde.

## Prioriteti

| # | Izvor | Republika | Zašto | Stanje provere |
|---|---|---|---|---|
| 1 | Partisan Memorials Wiki, preostali propusti | sve | Raniji ponovni prolaz već je doneo 18 + 99 novih markera i 45 prenosa; stara procena od oko 490 preskočenih nije današnji preostali obim. Novi uzorak od 20 dao je 14 novih lokacija i 5 preciziranih tačaka. Nastavak 19.10: 3 nova + 5 prenosa, 8 preciziranih, 1 popravljena približna i 9 fotografija. Treći paket: 10 novih + 1 prenos, 4 precizirana, 1 ispravka preseljenja, 1 približne tačke i 12 fotografija. Četvrti paket: 8 novih, 4 ispravke tačaka, 1 preciziranje i 9 fotografija; 5 odloženo i 1 van obuhvata. Šesti paket 19.10: 10 prenosa iz `bez_lokacije`, 5 novih, 1 nov bez tačke, 8 odloženo. | delimično; izveštaji `data/provere/wiki-propusti*.json` (šest paketa). Ostatak: oko 260 nepovezanih članaka sa našim zapisom do 3 km — prvenstveno preciziranje približnih zapisa i provera duplikata, ne novi spomenici. |
| 2 | [ZZSK Niš / HeritagePhotogrammetry](https://sketchfab.com/HeritagePhotogrammetry) | Srbija | Stručni modeli s eksplicitnim koordinatama; već potvrđena tačka Kamenice. Profil ima 908 modela razne baštine, NOB podskup nije prebrojan. | Ciljano pročitana tri opisa; prvo naći zbirni izvoz metapodataka i izdvojiti NOB za poređenje, bez teških 3D fajlova. [Nalazi i ograničenja](IZVORI.md#vikipedija-wikidata-i-tematski-sajtovi). |
| 16 | Furbach, *Titomenik* (TU Wien, 2017), [zapis](https://repositum.tuwien.at/handle/20.500.12708/5261?mode=full) | Makedonija, Slovenija, Srbija, Hrvatska, BiH | Nemački terenski katalog i autorske fotografije; prvo uzorak i poređenje sa bazom. | OpenAccess označen; PDF nije preuzet ni pročitan, broj jedinica nepoznat |
| 17 | Živanović, [ruski članak o grobovima crvenoarmejaca](https://interaffairs.ru/jauthor/material/2650), 2022; knjiga *I krst i petokraka* (2020) | Srbija, Hrvatska, Slovenija | Prednost ima razjašnjavanje istorijskih grobova i njihovih odredišnih kosturnica; ne novi markeri za svaku staru grobnicu. | relevantni odlomci članka pročitani, nisu integrisani; knjiga bibliografski potvrđena, puni tekst nepribavljen |
| 18 | Muzej Kumanovo, [spomenici kulture kumanovskog regiona](https://kumanovomuseum.com/post/spomenici-na-kultura-vo-kumanovski-re) | S. Makedonija | Institucionalni pregled sa slikama i Google vezama; brz uzorak samo NOB objekata uz proveru postojećih unosa. | stranica otvorena, poređenje i integracija nisu urađeni |
| 19 | Njomza Krasniqi, *Rikualifikimi i peizazhit urban historik të Fushë Kosovës* (master, 2022), [puni tekst](https://www.researchgate.net/publication/369588174_RIKUALIFIKIMI_I_PEIZAZHIT_URBAN_HISTORIK_TE_FUSHE_KOSOVES) | Kosovo, Kosovo Polje | Ciljano proveriti sliku 4 na str. 14 i njen izvor; spomenik partizanima i civilnim žrtvama 1941–1945. Nije širok NOB inventar. | naslovnica i sadržaj provereni; fotografija, identitet i tačka nisu obrađeni |
| 22 | Petrovič i Lepej, *Spomeniki NOB na Ptujskem*, [Kamra / knjižnica Ptuj](https://www.kamra.si/digitalne-zbirke/spomeniki-nob-na-ptujskem/) | Slovenija | Fotografije i identiteti u 16 opština; prvo uzorak protiv RNPD i Partizanstva, zatim samo stvarne dopune. | uvod i sadržaj otvoreni; 112 iz uvoda je broj boračke evidencije, ne potvrđen obim objavljenih podstranica |

Za dostupnost, ograničenja i ostale jezike videti [višejezične nalaze](IZVORI.md#višejezični-nastavak--18102026), [albanske izvore](IZVORI.md#albanski-izvori--18102026) i [temeljni regionalni pregled](IZVORI.md#temeljni-pregled-izvora-na-jezicima-bivše-jugoslavije--18102026). Baranjski katalog (ranija stavka 20) prošao je unos; njegovi [preostali slučajevi](../data/provere/baranja-2022-nastavak-2026-10-18.json) traže ciljano lociranje ili nov dokaz, ne ponovno čitanje knjige. Završen je i Dimitrovgrad (ranija stavka 21): svih 16 obeležja upareno, sedam novih markera i osam dopuna; [otvoreni položaji i protivrečnosti](../data/provere/dimitrovgrad-2023-2026-10-19.json) ostaju za ciljanu proveru. Brojevi nisu obavezan redosled; prednost imaju izvori sa tačkama, a slovenačke zbirke prvenstveno za dopune. Bibliografski trag bez teksta nije spreman katalog za žetvu.

Crna Gora je zatvorena odlukom korisnika (vidi [IZVORI.md](IZVORI.md#crna-gora)); Slovenija je posle drugog prolaza kroz RNPD (2026-10-18, 201 nov) praktično iscrpljena zvaničnim izvorima.

## Prvi korak

Posle četiri ranija uzorka završen je [peti, ciljani paket od četiri lokacije](../data/provere/wiki-propusti-paket5-2026-10-19.json): dve postojeće tačke popravljene, jedna stavka van obuhvata i jedan odložen identitet. Preskočiti i taj paket; za Lipovac je potreban dokaz posvete, ne ponovno preuzimanje istog modela.

Stavka 1: nastavak od preostalih kandidata u `izvori/pretrage/wiki-propusti-2026-10-18/kandidati.json`, uz preskakanje svih pregledanih paketa prema izveštajima `wiki-propusti*.json` i ponovno poređenje sa trenutnom bazom. [Sedmi paket](../data/provere/wiki-propusti-paket7-2026-10-19.json), 19.10: 20 pregledanih, šest preciziranih postojećih, četiri druga ili već postojeća objekta i deset odloženih; bez novih markera i promena stanja. Stari `nastavak-pregled.py` još čita uklonjeni `data/spomeniks.json`; pre ponovne upotrebe mora preći na `ucitaj_bazu()` iz `alati/zapis.py`. Istorijski redni broj kandidata nije radni ID. Prednost imaju fotografisani objekti sa konkretnim opisom tačke; isti objekat iz knjige najpre precizirati, umesto novog markera. Lista kandidata sadrži i sadržaje van obuhvata i duplikate; njen broj nije broj novih spomenika.
