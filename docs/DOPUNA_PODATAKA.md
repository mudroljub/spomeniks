# Dopuna podataka

Otvorena pitanja i odluke koje sprečavaju ponovni rad pri dopuni autora, godina i posveta postojećih spomenika. Postupci su u [skilu](../.claude/skills/spomenici-zetva/references/autori-i-posvete.md), pojedinačne odluke sa dokazima u [`data/provere/odluke.json`](../data/provere/odluke.json), a istorija prolaza u gitu.

## Izvorni nazivi mesta u Makedoniji (2026-10-18)

Po korisnikovom nalogu polje `mesto` usklađeno je sa makedonskom ćirilicom u **310 zapisa mape i 7 radnih zapisa**. Sačuvani su ID-jevi, koordinate, izvori i ostala polja; istorijski izveštaji zadržavaju tadašnji tekst. Ispravljeni i zatečeni oblici: `Silva` → „Слива“ ([državni katalog](https://portal.mdt.gov.mk/post-body-files/strategii-met-file-BBuX.pdf)), `Kriva Planaka` → „Крива Паланка“ ([opština](https://www.krivapalanka.gov.mk/geografska-polozhba)), `Skoplje` → „Скопје“; `Đavato` i `Gjavato` usaglašeni u „Ѓавато“. Pravilo je u [standardu](../.claude/skills/spomenici-zetva/references/standard.md); pregled promena i snimci pre upisa lokalno u `izvori/pretrage/makedonski-nazivi-mesta/`.

## Autori

- **Bez članka na Vikipediji** (ne tražiti ponovo bez novog izvora): Ante Kuduz, Belizar Bahorić, Lenko Pleština, Marijan Burger, Mirko Ostoja, Vuko Bombardelli i još desetak autora.
- **Sporni parovi autor–delo:** Erzelj (Svetinino delo je 2 km od našeg), Repče/Trebnje, Domžale 1975, Kovor, Rečica ob Savinji, Topola, Jesenice 1960, Našice, Grobnica herojev u Ljubljani (Mihevc ili Ravnikar), Kragujevac („Otpora i slobode“, „Crvena zastava“), Raška, Opovo, Đurđevo, Božurnja, Podgradci i Križe.
- Wikidata dela poznatih autora (oko 150) već su pregledana; nisu dala nova NOB dela.

## Godine

- Godine sa FB stranice za Danilovgrad (1963), Momišiće (1976) i Jasikovac (1972) nisu preuzete, jer jači izvori potvrđuju 1959, 1979 i 1977.
- **Hronologija skulpture, 18.10.2026:** Kadinjača razdvojena na piramidu iz 1952. i prikazanu celinu iz 1979; Baljevac na nacrt 1951. i postavljanje 1956. Ispravljene godine Batine (1947), Simićevog salaša (1966), Melenaca (1954) i čuruških Taoca (1985). Zadržani Zlatibor 1967, Novi Kneževac 1964 i Prijepolje 1953 prema jačim izvorima. U Bajinoj Bašti razdvojeni Dušan Jerković (Oto Logo, 1987) i palim borcima NOVJ (Stevan Bodnarov, 1952). **Raška ostaje otvorena:** Hronologija navodi Glida/1955, postojeći zapis Živkovića/1953, a retrospektiva u Lazarevcu Živkovićevog Borca/1959; autor i godina nisu menjani. [Dokazi i promene](../data/provere/skulptura-hronologija-2026-10-18.json).

## Spomen-parkovi

- Parkovi i pojedinačna dela razdvojeni su u Boriku, Jajincima, Dotrščini, Danici, Beloj Crkvi, Šubićevcu i Crnoj Ćupriji. Grahovo ostaje jedna Živkovićeva celina.
- Otvoreno: tačka „Vješala“ u Danici nije potvrđena (zapis stoji kod „Izvidnice“); Rajčetićev lokvanj u Crnoj Ćupriji nema lokaciju; Brdo mira i Jadovno preskočeni zbog nejasnog identiteta slike i tačke.

## Posvete

- Odbačena uparivanja: drugi Kovačič umesto Ivana Gorana Kovačića, slična slovenačka imena, istoimene ili drugačije numerisane jedinice, posvete susednih obeležja. Bakićev „Poziv na ustanak“ ne dobija automatski posvetu ustanku.
- Bez odgovarajućeg članka (ne tražiti ponovo bez novog izvora): neodređena divizija „Garibaldi“, Primorsko-goranska brigada bez broja, 9. makedonska brigada, Dragačevski bataljon, „XIV Brigata Trieste“, Kokrški, Loški, Škofjeloški i Kamniški odred, čete i VDV.
- Kad nema članka, `posveta` je kratak tekst; postojeće povezane posvete se ne zamenjuju tekstom.
- Spomen-dom Razlovečkog ustanka (1876) uklonjen je jer nije NOB.
