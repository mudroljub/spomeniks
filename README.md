# Spomeniks

Yugoslav WWII monuments travel app.

Visit: [mudroljub.github.io/spomeniks](https://mudroljub.github.io/spomeniks/)

[![](screen.png)](https://mudroljub.github.io/spomeniks/)

## Development

```
live-server
```

## TODO

UNOS PODATAKA:
- žetva izvora po [prioritetima](docs/IZVORI.md#prioriteti)

POTPUNOST PODATKA:
- locirati spomenike bez lokacije i bez tačne lokacije ([lociranje](docs/LOCIRANJE_SPOMENIKA.md))
- dodavati fotografije gde nedostaju ([obrađeni izvori fotografija](docs/IZVORI.md#commons-i-fotografije))
- popunjavati druge atribute na osnovu dostupnih izvora ([dopuna podataka](docs/DOPUNA_PODATAKA.md)). prioritet su: autor, posveta, wiki...

KVALITET PODATAKA:
- fotografije korisnika Google mapa nemaju licencu za ponovnu objavu: naći zamenu sa slobodnom licencom, pa ukloniti Google slike
- pri dopuni fotografija prednost dati umetničkim delima i sadržajnim memorijalnim celinama; obična groblja, jednostavni grobovi i ploče ostaju niži prioritet
- Potraži sve naslove "spomen-dom" i prebaci ih da budu vrsta spomen-kuca

UI
- za vrste spomenika negde u aplikaciji koristimo jedninu negde množinu. prebaci svuda na jedninu da probam.
- Search label se menja nakon stizanja glavnog paketa spomenika. to je loše. treba staviti loader umesto labele dok ne stignu svi, ili čak onemogućiti pretragu.
- mala Spomen-kuća, često zapuštena i bez tačne lokacije, ne treba da ima istu važnost kao muzej. osmisliti novu vrstu
- dok se učitavaju slike za donju traku vidi se samo crni tekst na providnoj pozadini, što je bespotrebno i ružno

REFAKTOR
- code review i uklanjanje tehničkog duga

OPTIMIZACIJA
- od poslednje optimizacije količina podataka se više nego udvostručila. optimizovati sa stare mobilne uređaje sa sporim internetom (merenje: `alati/merenje.mjs`, [alati](docs/ALATI.md))
- prioritet je da radi uz veoma loš i spor wifi u planinskim područjima

OBJAVLJIVANJE
- ručno postaviti `devMode` na `false`, pokrenuti `node alati/otisak.mjs` i proveriti rad bez interneta pre objave na GitHub Pages-u

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
