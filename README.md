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
https://sr.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%B0%D0%BA_%D1%81%D0%BF%D0%BE%D0%BC%D0%B5%D0%BD%D0%B8%D0%BA%D0%B0_%D0%9D%D0%9E%D0%91_%D1%83_%D0%92%D0%BE%D1%98%D0%B2%D0%BE%D0%B4%D0%B8%D0%BD%D0%B8
https://sr.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%B0%D0%BA_%D1%81%D0%BF%D0%BE%D0%BC%D0%B5%D0%BD%D0%B8%D0%BA%D0%B0_%D0%9D%D0%9E%D0%91_%D0%BD%D0%B0_%D0%9A%D0%BE%D1%81%D0%BE%D0%B2%D1%83_%D0%B8_%D0%9C%D0%B5%D1%82%D0%BE%D1%85%D0%B8%D1%98%D0%B8
https://sr.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%B0%D0%BA_%D1%81%D0%BF%D0%BE%D0%BC%D0%B5%D0%BD%D0%B8%D0%BA%D0%B0_%D0%9D%D0%9E%D0%91_%D1%83_%D0%A5%D1%80%D0%B2%D0%B0%D1%82%D1%81%D0%BA%D0%BE%D1%98
https://sr.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%B0%D0%BA_%D1%81%D0%BF%D0%BE%D0%BC%D0%B5%D0%BD%D0%B8%D0%BA%D0%B0_%D0%9D%D0%9E%D0%91_%D1%83_%D0%A6%D1%80%D0%BD%D0%BE%D1%98_%D0%93%D0%BE%D1%80%D0%B8

POTPUNOST PODATKA:
- locirati spomenike ([lociranje](docs/LOCIRANJE_SPOMENIKA.md))
- dodavati fotografije ([obrađeni izvori fotografija](docs/IZVORI.md#commons-i-fotografije))
- popunjavati druge atribute ([dopuna podataka](docs/DOPUNA_PODATAKA.md)). prioritet su: autor, posveta, wiki...
- uklanjati duplikate i greške koji su se uvukli u bazu

UI
- napraviti savremeni kriterijum za istaknute spomenike. videti koji su najpopularniji u svetu, najočuvaniji i najposećeniji.

REFAKTOR
- code review i uklanjanje tehničkog duga

PRED OBJAVLJIVANJE
- ručno postaviti `devMode` na `false`, pokrenuti `node alati/otisak.mjs` i proveriti rad bez interneta pre objave na GitHub Pages-u

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
