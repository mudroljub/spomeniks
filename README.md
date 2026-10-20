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

UI
- za vrste spomenika negde u aplikaciji koristimo jedninu negde množinu. prebaci svuda na jedninu da probam.
- Search label se menja nakon stizanja glavnog paketa spomenika. to je loše. treba staviti loader umesto labele dok ne stignu svi, ili čak onemogućiti pretragu.

REFAKTOR
- code review i uklanjanje tehničkog duga

OPTIMIZACIJA
- na lošem wifi-ju prvo crtanje i dalje čeka biblioteku mape (144 KB); ostalo je optimizovano 2026-10-20 (merenje: `alati/merenje.mjs`, [alati](docs/ALATI.md))

PRED OBJAVLJIVANJE
- ručno postaviti `devMode` na `false`, pokrenuti `node alati/otisak.mjs` i proveriti rad bez interneta pre objave na GitHub Pages-u

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
