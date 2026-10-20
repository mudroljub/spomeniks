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
- locirati spomenike ([lociranje](docs/LOCIRANJE_SPOMENIKA.md))
- dodavati fotografije ([obrađeni izvori fotografija](docs/IZVORI.md#commons-i-fotografije))
- popunjavati druge atribute ([dopuna podataka](docs/DOPUNA_PODATAKA.md)). prioritet su: autor, posveta, wiki...
- uklanjati duplikate i greške koji su se uvukli u bazu
    - najsumnjiviji su podaci za bosnu. posebno stotine i hiljade njih bez poznatog statusa, vrste i lokacije. putnike i korisnike aplikacije to može ozbiljno da zavede. smisli kao to rešiti. možda da uvedemo kriterije za pouzdanost podataka?

UI
- previše natrpano - text, linkovi, info... "D:\Pictures\Screenshots\Snimka zaslona 2026-10-20 170533.png"

REFAKTOR
- code review i uklanjanje tehničkog duga

PRED OBJAVLJIVANJE
- ručno postaviti `devMode` na `false`, pokrenuti `node alati/otisak.mjs` i proveriti rad bez interneta pre objave na GitHub Pages-u

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
