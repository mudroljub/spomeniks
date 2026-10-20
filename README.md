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
- uklanjati duplikate i greške koji su se uvukli u bazu
    - "Zgrada u kojoj je prvi put objavljen list „Oslobođenje“" sigurno nije muzej a svrstana je tako. nemamo pojma šta je, možda nema ni spomen ploču više.
    - najsumnjiviji su podaci za bosnu. posebno stotine i hiljade njih bez poznatog statusa, vrste i lokacije. putnike i korisnike aplikacije to može ozbiljno da zavede. smisli kao to rešiti. možda da uvedemo kriterije za pouzdanost podataka?

UI
- previše natrpano - text, linkovi, info... "D:\Pictures\Screenshots\Snimka zaslona 2026-10-20 170533.png"

REFAKTOR
- code review i uklanjanje tehničkog duga

OPTIMIZACIJA
- na lošem wifi-ju prvo crtanje i dalje čeka biblioteku mape (144 KB); ostalo je optimizovano 2026-10-20 (merenje: `alati/merenje.mjs`, [alati](docs/ALATI.md))

PRED OBJAVLJIVANJE
- ručno postaviti `devMode` na `false`, pokrenuti `node alati/otisak.mjs` i proveriti rad bez interneta pre objave na GitHub Pages-u

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
