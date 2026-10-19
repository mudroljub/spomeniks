# Lociranje spomenika

Otvoreni slučajevi, razrešeni identiteti koje ne treba ponovo unositi i veze ka dokazima. Aktuelni skup je u `data/bez_lokacije.json` i približnim markerima mape; stare brojke prolaza nisu današnji preostali obim. Prioritet je verovatnoća uspeha uz konkretan izvor, ne redosled tabele.

Raniji ciljani prolaz je završen, žetva CG zatvorena, a šira hrvatska provera obustavljena po odluci korisnika. Ove beleške same ne otvaraju novi zadatak; trenutni odobreni posao je u [planu žetve](PLAN_ZETVE.md).

## Spomen-groblja: strategija dobavljanja podataka

Prednost imaju regionalne evidencije sa položajem, katastarski prilozi, fotografije samog objekta i opisi preseljenja. Literatura i njena stvarna obrađenost su u [izvorima](IZVORI.md#literatura-za-spomen-groblja); ne ponavljati prepisivanje već obrađenih knjiga.

1. Za dostupan izvor prvo proveriti sadržaj i upotrebljivost za više otvorenih zapisa.
2. Jednom izdvojiti relevantne objekte, stranice, mikrotoponime i podatke o prenosu ostataka; porediti i sa drugim vrstama u bazi, jer je grobnica mogla biti uvezena kao opšti spomenik.
3. Potvrditi položaj konkretnog objekta. Mesto pogibije, stari grob, sadašnje groblje i susedni spomenik nisu zamenjive tačke.
4. Posle probnog dokumenta oceniti prinos; bez mikrolokacija ili podataka o preseljenju preći na bolji izvor. Centar naselja ne predstavlja precizno lociranje grobova.

| Otvoreni slučaj | Šta treba potvrditi | Dokazi |
|---|---|---|
| Teslić, zasebno groblje u Ulici Svetog Save; Borci kod Kotor Varoša, Prnjavor, Gornji Ribnik | Tačku grobova, umesto prilaza ili obližnjeg objekta. | [Prvi paket](../data/provere/lociranje-groblja-2026-10-18.json), [drugi paket](../data/provere/lociranje-groblja-drugi-2026-10-18.json). |
| Ljubljenica 1961/1988; Pećigrad 1959; Petrovo 1953; zasebna masovna grobnica u Ljeskarama | Razlikovati prethodnika, kasniji kompleks i zasebnu grobnicu. Zajedničko mesto nije dokaz da su isti objekat. | [Drugi paket](../data/provere/lociranje-groblja-drugi-2026-10-18.json), [preciziranje](../data/provere/groblja-preciziranje-2026-10-18.json). |
| Divičani, Vinac, Pljeva/Majevac | Geolocirati fotografisani spomenik u Divičanima i grobnu parcelu u Vincu; za ostale nedostaje savremen lokacijski izvor. Vinac ima i zaseban spomenik ratu 1992–1995. | [Jajce i literatura](../data/provere/groblja-jajce-literatura-2026-10-18.json). |
| Rataj, Ocrkavlje, Zavait/Humić, nekadašnja grobnica kod Hotela Sutjeska | Rataj: prenos ostataka; Ocrkavlje: grobnica nije spomenik brigadi; Zavait: parcela; Tjentište: istorijska grobnica uklonjena 1958. Parking nije tačka groba. | [Foča](../data/provere/groblja-foca-2026-10-18.json). |
| Visoko, pojedinačni grob Filipa Kljajića | Tačku konkretnog grobnog objekta; fotografije i identitet kompleksa nisu dovoljne. | [Gradske kosturnice](../data/provere/groblja-gradovi-2026-10-18.json). |
| Kalenderovci 1953, Rilić 1963, Korićani 1961, druga ilijaška grobnica iz 1969. | Razlikovati istorijske i sadašnje objekte. Kalenderovska grobnica iz 1974. već je razrešena. | [Zbirni pregled](../data/provere/groblja-zbirni-pregled-2026-10-18.json), [offline nastavci](../data/provere/groblja-gradovi-2026-10-18.json). |
| Jelašinovci/Bojište, Husino, zasebna dobrljinska obeležja | Potvrditi međusobni odnos; blizina i ista godina nisu dovoljni za spajanje. | [Preciziranje i nastavak](../data/provere/groblja-preciziranje-2026-10-18.json). |

## Makedonija: probni pregled kataloga 1986 (2026-10-18)

Katalog je delimično obrađen; pregled probnog skupa nije pregled cele knjige. Прждево je potvrđen knjiški par; zasebna česma u Карбуници nije postojeća skulptura. Imena u bazi prate izvorno makedonsko pismo.

- **Канин:** česma uz prodavnicu je moguć par za 2/195, ali nije potvrđeno da je to zadružno dvorište. Pomen zadruge „Светлост“ iz Породина i pripajanja zadruge „Коле Канински“ ne daje adresu. Piramida 1/194 nema potvrđen par; zaseban kaninski obelisk nije česma.
- **Македонски Брод:** u trećem paketu 19.10. nađen je već postojeći marker `makedonski-brod-spomenik-na-padnatite-borci` sa opisom betonskog kompleksa iz 1981. zapadno od mosta preko Treske. Raniji radni unos `makedonski-brod-spomenik-palim-borcima` ostaje mogući duplikat; ne dodavati treći niti spajati bez provere veza i identiteta.
- **Лабуништа, Старо Село, Дебреште, Подвис i obelisk na Ključu:** u probnom pregledu nisu pouzdano locirani.

[Dokazi i odbijena uparivanja](../data/provere/makedonija-pilot-2026-10-18.json), uključujući `proveraPetUparivanja`; obrađenost knjige u [izvorima](IZVORI.md#obrada-knjiga).

Nastavak 19.10: [20 novih kataloških provera](../data/provere/makedonija-nastavak-2026-10-19.json), šest novih približnih markera i tri nova zapisa bez lokacije. Za Podgorce, Oktisi, Radolištu, Zbaždi i Bosilovo tačke su centri sela; za Brčevo GPS fotografije još ne potvrđuje podnožje. Varnički kompleks, spomenik na Bal Tepeu i Racinova figura kod veleske gimnazije ostaju bez tačke. Ne spajati automatski misleševsku crkvenu ploču sa česmom na trgu, vevčanski knjiški spomenik sa današnjim u parku, radošku piramidu sa česmom iz 1983. ili rudničku žensku figuru sa današnjim obeliskom. Commons česma u Radolišti posvećena je 1913/1914. i nije fotografija traženog NOB spomenika.

Drugi paket 19.10: [39 provera sa str. 40–43](../data/provere/makedonija-paket2-2026-10-19.json). Novi približni markeri Drenok, Velgošti, Dobrevo i Morani imaju samo tačku sela. Drenak iz kataloga je Drenok u opštini Staro Nagoričane, ne Drenak u Kratovu; GPS fotografije Dobreva nije prihvaćen. Slavej Planina na Karaormanu nema potvrđenu tačku i nije selo Slavej u Krivogaštanima. Novi gradski kvartovski spomenici Prilepa, piramida nepoznatom borcu u Kočanima, flotacija u Probištipu i studentska kompozicija u Skoplju ostaju bez tačke. Dva kočanska markera imaju fotografije istog amfiteatra uz oko 600 m razlike; nisu spojeni, niti je njihova tačka preuzeta za nepoznatog borca.

Treći paket 19.10: [preostalih 51 jedinica poglavlja spomenika](../data/provere/makedonija-paket3-2026-10-19.json), tri nova približna markera u Velebrdu, Trebištu i Debrešu kod Gostivara. Pehčevo, dva bitoljska obeležja, čelična kula na Prždevskim Lakama i obeležje na ušću Blaštice ostaju bez tačke. Kula nije seoska česma u Prždevu. Dolanski spomenik već postoji pod Selcem; sačuvani ID i tačka, dopunjena posveta i 1979. Ne poistovećivati automatski Stobi/Smеsu sa Palikurom niti spomenik streljanim rudarima u Štipu sa skulpturom rada pred Makedonkom. Dve fotografije u Lavcima pokazuju isti reljef uz oko 100 m razlike, a dva štipska markera Isarskog kompleksa imaju oko 1 km razlike; mogući duplikati nisu spojeni. Prvi pregled svih 110 jedinica ovog poglavlja je završen, ostala poglavlja knjige nisu.

## Crna Gora: identiteti i sačuvani tragovi

Žetva i pregled dostavljenih FB objava zatvoreni su po korisnikovoj odluci. Nepotvrđeni tragovi ostaju sačuvani za nov konkretan dokaz, bez automatskog nastavka pretrage.

- **Poznati identiteti:** Krstac na Goliji = `gornje-caradje`; Trijebač = `radevici`, mesto Rogami (Trijebač); Lazine = `jastreb`. Ne dodavati drugi marker zbog drugog naziva.
- **Herceg Novi:** Baošići imaju dva objekta u registru naspram jednog zapisa; Đurkovićev spomenik iz beleške treba razlikovati od biste. Za Milana Vukovića razjasniti bronzanu i gipsanu izvedbu u školskom holu.
- **OSM:** Lovćenski odred, n5519788722, naspram Google naziva „Lovćenska vila“; Jakub Kubur kod Boljanića, n8991363785, nepotvrđen identitet; neimenovane `war_memorial` tačke nisu potvrđene NOB posvete.
- **StoryMap:** „Voda Partizanka“ u Stravču nema završenu proveru tačke.
- **Danilovgrad:** dve gradske kosturnice imaju procenjene kataloške položaje; autor kosturnicu rodoljubima iz 1974. nije našao tokom obilaska 2025. Ukradene ili pohranjene biste Miladina Pavličića i Vasilija-Žarka Đurovića ne vraćati na stare tačke. Pažići su već približno locirani u centru sela.
- **Ulcinj:** kataloški „Spomenik palim borcima“ možda je već postojeći Spomenik Pobjede.
- **Velika:** po korisnikovom nalogu približno uz staru školu; tačna pozicija kamena nije potvrđena.

[Izvori CG](IZVORI.md#crna-gora), [Danilovgrad](../data/provere/lociranje-danilovgrad-2026-10-18.json), [probna provera školskih bista](../data/provere/lociranje-probni-2026-10-18.json), [pojedinačne odluke](../data/provere/odluke.json). Fotografije dostavljene u razgovoru su u `izvori/cg/facebook/`.

## Preostale prepreke i koristan novi dokaz

Pre nastavka proveriti zapis po ID-ju, mestu i izvoru: kasnija obrada je mogla razrešiti staru prepreku. Ova tabela je evidencija prethodnih nalaza, ne novi nalog za istraživanje.

| Trag / problem | Potreban dokaz | Evidencija |
|---|---|---|
| Doli i Krvavec | Položaj skulpture, umesto centroida kompleksa ili već poznatog pogrešnog GPS-a. | [Kandidati](../data/provere/lociranje-kandidati-2026-10-18.json). |
| Gornji Podgradci, Dom „Lepa Radić“ | Postojanje istorijske postavke i današnji pristup. Zgrada je identifikovana. | [Husino i otvoreni tragovi](../data/provere/lociranje-husino-2026-10-16.json). |
| Gornja Rijeka | Nova tačka posle najavljenog preseljenja prema groblju; ne vraćati stari parkovski položaj. | Raniji izvori i [pojedinačne odluke](../data/provere/odluke.json). |
| Podoška, Monj, Donji Vrbljani, Omladinska pruga u Nemili, Lušci Palanka, Suhopolje | Identitet i obuhvat kompleksa; za dom i memorijalna namena. Sačuvani su odbijeni pokušaji. | [Odloženi kompleksi](../data/provere/lociranje-kompleksi-2026-10-16.json). |
| Pleterje, Dolenjske Toplice, Uršlja Gora i preostali slovenački kandidati | Tačka ili muzejska namena konkretnog objekta; na Uršljoj Gori razlikovati drugi objekat od ploče na domu. Slovenj Gradec je naknadno razrešen kao današnji gradski muzej. | [Husino](../data/provere/lociranje-husino-2026-10-16.json), [Slovenj Gradec](../data/provere/lociranje-muzej-slovenj-gradec-2026-10-18.json). |
| Vučitrn, Cazin, Kneževo, Rakovačke Bare; Bogomila, Lazar Jauković | Položaj pravog objekta. Cazinski spomenik nije kuća Nurije Pozderca; kuća je već približno locirana. | [Prioritetni prolaz](../data/provere/lociranje-prioritet-2026-10-16.json), [odluke](../data/provere/odluke.json). |
| Palisad, sporni zid u Bečeju, bista u Kamenici; Lipovac kod Aleksinca | Identitet obeležja i podudaranje sa knjiškim opisom. Za Lipovac nije potvrđena veza sa belegom na Obloj glavi. | [Treći paket](../data/provere/wiki-propusti-paket3-2026-10-19.json), [peti paket](../data/provere/wiki-propusti-paket5-2026-10-19.json). |
| Vučje, školski spomenik u Jablanici, Bojčinska šuma, Botoš, Slatina kod Šapca | Preciznija tačka samog objekta; postojeći približni položaj ne predstavljati kao precizan. | [Nastavak](../data/provere/wiki-propusti-nastavak-2026-10-19.json), [treći](../data/provere/wiki-propusti-paket3-2026-10-19.json) i [četvrti paket](../data/provere/wiki-propusti-paket4-2026-10-19.json). |
| Zaton kod Šibenika | Dokaz opstanka. | [Provera rušenja](PROVERA_RUSENJA_HRVATSKA.md). |
| Borba/Obnova na Voždovcu i unutrašnje delo Nebojše Mitrića u Užicu | Zaseban identitet i položaj; Mitrićevo delo nije Anastasijevićev spomenik ispred muzeja. | [Hronologija skulpture](../data/provere/skulptura-hronologija-2026-10-18.json). |

## Korisne odluke o muzejima i složenim celinama

| Objekat | Razrešen identitet ili ograničenje |
|---|---|
| Pula, Slovenj Gradec, Vis | Današnji muzeji povezani sa ustanovama iz starog kataloga. Visov marker označava tvrđavu Gospina Baterija, ne pojedinačnu prostoriju. |
| Makarska, Vila Irena | Lokacija današnjeg izložbenog prostora je potvrđena; kontinuitet nekadašnje memorijalne zbirke nije utvrđen. |
| Podgora, Spomen-dom | Istorijska muzejska lokacija, kasnije prenamenjena u turistički ured i kino. |
| Novi Sad, Vojislava Ilića 15 | Nekadašnji muzej štampe je u postojećoj Partizanskoj bazi; bez drugog markera i bez tvrdnje da muzej danas radi. |
| Beograd, Banjički venac 12 / Rajka Mitića 12 | Zgrada je naknadno locirana; muzej zatvoren 2000, zbirka u depou Muzeja grada Beograda. Stara prepreka sa nepotvrđenim kućnim brojem je razrešena. |
| Ljubljana, Tiskarna Podmornica | Ista kuća na Cesti na Brdo 95; muzejska zbirka ili spominska soba nije potvrđena kao aktivna. |
| Bugojno, Vila Gorica | Istorijski muzej „Tito u ovom kraju“, ruševine; sačuvani dokazi iz 2017. i o požaru 2026. |
| Prohor Pčinjski, ASNOM | Istorijska soba i uklonjene ploče; izgubljena originalna ploča i privremena iz 2022. nisu dokaz trajno očuvanog muzeja. |
| Jabuka kod Prijepolja | Zatvoreni muzej u kompleksu Boško Buha; zbirka je sačuvana u Muzeju u Prijepolju. |
| Mlinište | Muzej partizanske pruge u bivšoj železničkoj stanici je približno lociran; tačan obris zgrade nije potvrđen. |
| Manastir Lovnica | Muzej NOB Birač pripada istom manastirskom kompleksu i markeru spomen-groblja; rad muzeja nije potvrđen. |
| Trnovski gozd, bolnica Pavla | Već povezana sa spomenikom na Hudem polju; ne vraćati radni duplikat. |
| Banja Luka, Trg palih boraca | Spomenik i grupa bisti su različiti objekti. Jovo Bijelić, Ante Jakić, Rade Ličina, Šefket i Vahida Maglajlić i Danko Mitrov povezani su sa grupnim markerom; Kasim Hadžić ima zasebnu potvrđenu tačku. Bista Danka Mitrova u Vrbanji je drugi predmet provere. |

Dokazi: [Pula](../data/provere/lociranje-muzej-pula-2026-10-18.json), [Slovenj Gradec](../data/provere/lociranje-muzej-slovenj-gradec-2026-10-18.json), [Vis](../data/provere/lociranje-muzej-vis-2026-10-18.json) i [pojedinačne odluke](../data/provere/odluke.json). Datum stare knjige ili fotografije ne potvrđuje današnji rad ustanove.

## Evidencija provera

| Obrađen skup | Izveštaji koje proveriti pre ponovnog rada |
|---|---|
| Približno lociranje u sela | [Prebačeni zapisi i izuzeci](../data/provere/priblizno-sela-2026-10-18.json); proveriti i kasnije razrešene identitete. |
| Raniji ciljani prolazi | [Završni](../data/provere/lociranje-zavrsni-prolaz-2026-10-16.json), [prioritetni](../data/provere/lociranje-prioritet-2026-10-16.json), [muzeji](../data/provere/lociranje-muzeji-2026-10-16.json), [Husino](../data/provere/lociranje-husino-2026-10-16.json), [kompleksi](../data/provere/lociranje-kompleksi-2026-10-16.json). |
| Grobni zapisi | [Prvi](../data/provere/lociranje-groblja-2026-10-18.json), [drugi](../data/provere/lociranje-groblja-drugi-2026-10-18.json), [zbirni pregled](../data/provere/groblja-zbirni-pregled-2026-10-18.json), [preciziranje](../data/provere/groblja-preciziranje-2026-10-18.json), [gradovi i offline nastavci](../data/provere/groblja-gradovi-2026-10-18.json). |
| Preskočeni Wiki parovi | [Prvi uzorak](../data/provere/wiki-propusti-2026-10-18.json), [nastavak](../data/provere/wiki-propusti-nastavak-2026-10-19.json), [treći](../data/provere/wiki-propusti-paket3-2026-10-19.json), [četvrti](../data/provere/wiki-propusti-paket4-2026-10-19.json), [peti](../data/provere/wiki-propusti-paket5-2026-10-19.json). |
| Hrvatska, istorijsko rušenje | [Status i otvoreni slučajevi](PROVERA_RUSENJA_HRVATSKA.md); obustavljeni širi obim ne tumačiti kao aktivan nalog. |
| Obrađenost izvora | [Izvori](IZVORI.md); potpuni prepis knjige nije potvrda svih tačaka ili opstanka. |

Sedmi [Wiki paket od 20 kandidata](../data/provere/wiki-propusti-paket7-2026-10-19.json), 19.10.2026: precizirani Remete, Borčec, Dubrava, Hum na Sutli, Mazin i kneževska spomen-grobnica. Četiri kandidata su drugi ili već postojeći objekti, a deset ostaje odloženo; razlozi i tačke kandidata su u izveštaju. Stanja nisu menjana, naročito kod Mazina: potvrda istorijskog položaja nije potvrda obnove.

Osmi [Wiki paket od 20 fotografisanih kandidata](../data/provere/wiki-propusti-paket8-2026-10-19.json), 19.10.2026: precizirani Lazovićev spomenik kod škole na Rudniku, Bojčićev spomenik u Staroj Pazovi, spomenik iz 1952. u Sirigu i česma iz 1952. u Ostri. Trinaest objekata već ima precizne markere; knjiški približni zapisi nisu automatski spojeni i ostaju za ciljano spajanje uz prenos veza. Jedan kandidat je drugi objekat, dva su odložena; svi razlozi i postojeći markeri su u izveštaju.

Deveti [Wiki paket od 20 kandidata](../data/provere/wiki-propusti-paket9-2026-10-19.json), 19.10.2026: potvrđene tačne lokacije osam postojećih zapisa (Jazak, Moravac, Slavkovica, Stajićevo, Sveti Vid pri Cerknici, zagrebački Trg siječanjskih žrtava, Čenta i Golema Njiva). Sedam kandidata već ima precizan marker, jedan je drugi objekat, četiri su odložena. Sredgora ostaje približna zbog izričite napomene izvora; kod Palače nije potvrđen identitet starog i novog objekta, kod Šćitarjeva nije pregledana fotografija, a kod Malog Izvora položaj putničkog pina. U Moravcu je potvrđena postojeća tačka, bez pomeranja; stanja i ostali atributi nisu menjani.

Deseti [Wiki paket od 20 kandidata](../data/provere/wiki-propusti-paket10-2026-10-19.json), 19.10.2026: potvrđene tačne lokacije Jermenovaca, Pršinog spomenika u Poljanici Bistranskoj, Kečaninovog spomenika u Sloboštini, Šurića i obeležja na Buku kod Svilajnca. Tri kandidata već imaju precizan marker, jedan je drugi objekat, jedanaest je odloženo. U Poljanici su ispravljeni mesto (Bistranska) i vrsta (statua), uz isti ID i sačuvano uklanjanje. Samoš ima nesaglasne brojke žrtava, Međa protivrečne tačke, a model Donje Lopušnje nema koordinate u opisu. Stanja i izvori nisu menjani.

Dve uzastopne ture po 50 kandidata, [jedanaesta](../data/provere/wiki-propusti-paket11-2026-10-19.json) i [dvanaesta](../data/provere/wiki-propusti-paket12-2026-10-19.json), 19.10.2026: potvrđeno 13 tačnih lokacija (Banatski Dvor, Balinović, Dugo Polje kod Sokobanje, Kažani, Masurica, Zapađe, Gorina, Perast, Rsovac, Dećeve, Preslap, Bovan i Božica). Još 20 kandidata već ima precizan marker, 17 se odnosi na druge objekte, 48 je odloženo, a 2 nisu uparena. Upisane su samo tačke i uklonjena približnost; stanja, godine, autori i prvobitni izvori su sačuvani. Modeli bez GPS-a nisu precizna potvrda; za česmu u Brodu Wiki povezuje model Simenkovog mehaništa, a u Čukljeniku nije razrešena NOB namena. Darda ima staru tačku pre preseljenja; Padina mogući sudar podnožja biste i spomenika; Pugled nesaglasne tačke i moguće dve celine. Te slučajeve ponavljati samo uz novi konkretan dokaz. Ispravljeno kodiranje razmaka u pomoćnom slikovnom upitu; merodavni su ponovljeni odgovori, ne raniji lažni nedostajući naslovi.

## Šta ne ponavljati bez novog osnova

- Početne Commons pretrage i slovenački/hrvatski slojevi Partizanstva već su lokalno poređeni sa bazom. Nastaviti samo od konkretnog nepregledanog kandidata ili novog izvora.
- Neimenovani marker, centroid, ulaz u groblje ili položaj fotografa nisu nezavisna precizna tačka spomenika. Poznat pogrešan GPS Krvavca ne vraćati kao novi dokaz.
- Razrešene komplekse Drvara, Korčanice i Garavica ne unositi ponovo. Za Dragočaj i Derventu proveriti zabeležene razloge odbijanja para.

## Pravila i održavanje

Postupci su u [žetvi](../.claude/skills/spomenici-zetva/SKILL.md), [identitetu i stanju](../.claude/skills/spomenici-zetva/references/lociranje-i-stanje.md) i [proveri trajnih veza](../.claude/skills/spomenici-provera/SKILL.md#veze-radnih-zapisa-i-knjiga). Posle odobrenog rada ažurirati odgovarajući izveštaj i prepreku, umesto dodavanja dnevnika novih prolaza. Detaljna istorija i stari brojači ostaju u gitu.
