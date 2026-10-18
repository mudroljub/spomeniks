# Prevod engleskih opisa sa spomenicinob.info u domaće nazive

Pravila za pomoćnike koji prevode po delovima; ulaz i izlaz zadaje ko ih pokreće.

Ulaz: JSON niz engleskih opisa spomenika NOB-a (Drugi svetski rat) u Bosni i Hercegovini, sa sajta spomenicinob.info.
Izlaz: JSON objekat `{"engleski opis": "domaći naziv"}`, sa tačno istim ključevima kao ulaz, bez izostavljanja.

## Jezik

- Srpskohrvatski (bosanski) latinicom, **ijekavica** („mjesto“, „strijeljanje“, „svjetski“, „djeca“, „spomen-obilježje“).
- **Doslovan prevod.** Ništa se ne dodaje, ne tumači i ne izmišlja. Kad je engleski nejasan ili dvosmislen, prevedi najdoslovnije i stavi ključ i u niz `"nesigurno"` (vidi dole).
- Vlastita imena (osobe, mesta, jedinice, preduzeća) se ne prevode, ali se **menjaju po padežima** („Plaque to commemorate Ivo Lola Ribar“ → „Spomen-ploča Ivi Loli Ribaru“).
- Naziv počinje velikim slovom, bez tačke na kraju.

## Ustaljeni prevodi (obavezni)

| Engleski | Domaći |
|---|---|
| Plaque to commemorate X | Spomen-ploča + X u dativu („Spomen-ploča palim borcima“), ili „Spomen-ploča na mjestu …“ / „Spomen-ploča boravku …“ kad to engleski kaže |
| Plaque to mark X | Spomen-ploča koja obilježava X → piši kratko: „Spomen-ploča na mjestu X“ ili „Spomen-ploča X“ u dativu |
| Monument to X / Monument to commemorate X | Spomenik + X u dativu |
| Monument at site of X | Spomenik na mjestu X |
| Bust of X | Bista + X u genitivu („Bista Ive Lole Ribara“); više osoba: „Biste A i B“ |
| Statue of X | Statua + genitiv |
| Fountain to commemorate X / Memorial fountain | Spomen-česma + dativ / Spomen-česma |
| Memorial ossuary (of X) / Ossuary | Spomen-kosturnica (X u genitivu) / Kosturnica |
| Collective / Communal grave | Zajednička grobnica |
| Mass grave | Masovna grobnica |
| Memorial grave | Spomen-grobnica |
| Partisans' cemetery | Partizansko groblje |
| Memorial park / complex | Spomen-park / Spomen-kompleks |
| Memorial house / room / hall | Spomen-kuća / Spomen-soba / Spomen-dom |
| Museum of X | Muzej + genitiv |
| fallen fighters | palim borcima (dativ), palih boraca (genitiv) |
| Victims of Fascist Terror | žrtvama fašističkog terora (dativ), žrtava fašističkog terora (genitiv) |
| NH (narodni heroj) | narodni heroj, u padežu („Spomenik narodnom heroju Ivi Loli Ribaru“, „Bista narodnog heroja …“ — **kod bista izostavi „NH“**: „Bista Ive Lole Ribara“) |
| the NOB / the NOR | NOB bez nastavka; NOR-u (dativ), NOR-a (genitiv) — ostale muške skraćenice se menjaju sa crticom |
| the Uprising | ustanak („Spomenik ustanku“) |
| People's Liberation Committee | narodnooslobodilački odbor |
| Supreme Command / Supreme Headquarters | Vrhovni štab |
| Brigade, Division, Detachment, Battalion, Corps | brigada, divizija, odred, bataljon, korpus („I krajiška brigada“, „Prva proleterska brigada“ — piši redni broj kako je u engleskom: „I“ ostaje „I“, „1st“ → „Prva“) |
| Krajinan | krajiški |
| execution / executed | strijeljanje / strijeljani |
| residence / stay of | boravak („Spomen-ploča boravku Josipa Broza Tita“) |
| founding / formation of | osnivanje / formiranje |
| SKOJ, USAOJ, AFŽ, AVNOJ, ZAVNOBiH (muški rod) | menjaju se sa crticom („SKOJ-a“, „AVNOJ-u“) |
| KPJ, KPH, NOV, NOVJ, JNA (ženski rod) | ne menjaju se („članovima KPJ“, „borcima NOV“) |
| regional committee | po nivou: Pokrajinski komitet KPJ za BiH; oblasni za veliku oblast (Bosanska krajina, Hercegovina); okružni za grad i okolinu („Okružni komitet KPJ za Banju Luku“); izvor: znaci.org |
| World War II / Second World War | Drugi svjetski rat (veliko D) |
| 1941-45, 1941–1945 | 1941-1945 (crtica, bez razmaka i tačaka) |

- Složenice sa „spomen“ uvek sa crticom: Spomen-ploča, Spomen-česma, Spomen-obilježje.
- Navodnici „…“ (donji pa gornji), nikad "…" ni '…'.
- Ako opis sadrži dodatne podatke (broj sahranjenih, „with 486 burials“), prevedi i njih kratko: „Partizansko groblje sa 486 sahranjenih“.

## Izlaz

U izlazni fajl koji ti je zadat upiši:

```json
{"prevodi": {"engleski": "domaći", ...}, "nesigurno": ["engleski ključ", ...]}
```

Upis: UTF-8, `ensure_ascii=False`. Proveri skriptom da je broj ključeva u `prevodi` jednak broju elemenata ulaza i da su ključevi identični. Ne menjaj ništa drugo, ne diraj repozitorijum.
