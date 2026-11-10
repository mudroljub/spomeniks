# Spomeniks

Yugoslav WWII monuments travel app.

Visit: [mudroljub.github.io/spomeniks](https://mudroljub.github.io/spomeniks/)

[![](screen.png)](https://mudroljub.github.io/spomeniks/)

## Development

```
live-server
```

## TODO

POTPUNOST PODATKA:
- dodavati fotografije ([lista prioriteta](docs/FOTOGRAFIJE_PRIORITETI.md), [obrađeni izvori fotografija](docs/IZVORI.md#commons-i-fotografije))
- popunjavati druge atribute prema [listi prioriteta dopune](docs/DOPUNA_PODATAKA.md#prioriteti-dopune--10112026), po važnosti i šansi za dopunu.
- uklanjati duplikate i greške koji su se uvukli u bazu

UI

REFAKTOR
- code review i uklanjanje tehničkog duga

PRED OBJAVLJIVANJE
- ručno postaviti `devMode` na `false`, pokrenuti `node alati/otisak.mjs` i proveriti rad bez interneta pre objave na GitHub Pages-u

MOBILNA APLIKACIJA
- napraviti android aplikaciju ([plan](docs/ANDROID_APLIKACIJA.md))
