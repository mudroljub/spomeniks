# Provera rušenja — Hrvatska

Da li hrvatski spomenici sa mape i danas stoje, posle rušenja i uklanjanja 1990–2000. Ovde su samo otvoreni slučajevi i ono što sprečava ponovni rad; dokazi po spomeniku su u JSON izveštajima u `data/provere/` ([49 unosa](../data/provere/hrvatska-49-2026-10-16.json), [trijaža ostalih](../data/provere/hrvatska-ostali-2026-10-16.json), [70 povezanih](../data/provere/hrvatska-povezani-70-2026-10-16.json), [pilot 20](../data/provere/hrvatska-pilot-20-2026-10-16.json), [pojedinačne odluke](../data/provere/odluke.json)), a istorija prolaza u gitu.

## Status

- **Šira provera je obustavljena po nalogu korisnika.** Nastavak traži novu odluku o obimu, uz procenu rada i tokena.
- Završeno: 49 najnovijih unosa, ograničen prenos stanja za 70 povezanih spomenika (40 dobilo `ostecen` po Hrženjaku 2002) i pilot 20 rizičnih unosa (bez novih potvrđenih uklanjanja). Trijaža ostalih 792 unosa nije dovršena.
- 2026-10-18: 128 srušenih ili uklonjenih spomenika (bez ploča) iz Hrženjakovog indeksa dodato na mapu sa stanjem i oznakom „Bez tačne lokacije“, u centar sela jedinstvenog imena; veza je upisana u `uparivanje` u `data/knjige/hrzenjak-2002.json`. Preskočeni su nečitljivi zapisi i oni koje već imamo u istom mestu. Istog dana iz gradova još 18 novih i 4 postojeća zagrebačka zapisa, na geokodiranu adresu iz knjige (geokodiranje u [odlukama](../data/provere/odluke.json), `hrzenjak-gradovi`). Ostaje oko 75 gradskih stavki bez pouzdane adrese ili sa uopštenom (vrtić, gimnazija), 54 bez adrese i oko 180 sa nepouzdanim imenom naselja.
- Ne ponavljati: rangiranje „ostatka 792“ zamenjeno je pravilom pilota — prvo potvrđen knjiški par ili konkretna dojava sa terena, a ne nagađanje po imenu sela.

## Otvoreni slučajevi

Nisu aktivan nalog za istraživanje; prednost imaju nove dojave sa terena.

| Slučaj | Poslednje poznato | Šta nedostaje |
|---|---|---|
| **Garešnica**, `garesnica` | Gradska [vest](https://www.garesnica.garesnica.hr/index.php/vijesti/2275-sa-skupstine-garesnickih-antifasista.html) od 31.3.2025. najavljuje premeštanje ploča kod Doma zdravlja i pretvaranje parkovskog spomenika u pozornicu. | Dokaz da su radovi izvršeni i tačka premeštenih ploča. |
| **Krapanj**, `krapanj` | Knjiga beleži rušenje 1992; [vest iz 2008](https://sabh.hr/wp-content/uploads/2021/05/Glas_broj_58.pdf) govori o oštećenju petokrake. | Datiran dokaz baš tog obeliska i hronologija obnove. |
| **Borovo naselje**, `djeletovci-spomenik-nob` | Marker povučen zbog pogrešne tačke, ne zbog rušenja; obeležje iz 1946. postoji, [OSM kandidat](https://www.openstreetmap.org/node/2988662336) nije sasvim saglasan sa ortofotom. | Nezavisna tačka samog postolja. |
| **Vinkovci**, `vinkovci`; **Županja**, `zupanja-bivsi-spomenik-nob` | Povučeni kao nepotvrđeni; Vinkovci su mešali dva spomenika. | Konkretan kasniji dokaz postojanja i tačke; po novom pravilu i uklonjen spomenik može na mapu kad mu je poznata tačka. |

Pravila identiteta, datuma i opstanka su u [referenci žetve](../.claude/skills/spomenici-zetva/references/lociranje-i-stanje.md), a čuvanje veza iz knjiga u [skilu provere](../.claude/skills/spomenici-provera/SKILL.md#veze-radnih-zapisa-i-knjiga).
