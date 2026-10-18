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
- žetva izvora po [planu](docs/PLAN_ZETVE.md)
- pretražiti portale sa akademskim radovima (researchgate.net, academia.edu...)

POTPUNOST PODATKA:
- locirati spomenike bez lokacije i bez tačne lokacije ([lociranje](docs/LOCIRANJE_SPOMENIKA.md))
- dodavati fotografije gde nedostaju ([obrađeni izvori fotografija](docs/IZVORI.md#commons-i-fotografije))
- popunjavati druge atribute na osnovu dostupnih izvora ([dopuna podataka](docs/DOPUNA_PODATAKA.md))

UI:
- Slavko Đojić (designer) nije validan prikaz imena autora
- iz perspektive turiste koji obilazi ww2 spomenike bivše Jugoslavije (domaći i stranci): preispitati UI, prikazivanje po važnost podataka, prioritet vrsti spomenika, ponuđene ture i tome slično.

REFAKTOR
- code review i popravke
- uklanjanje tehničkog duga

OPTIMIZACIJA
- od poslednje optimizacije količina podataka se više nego udvostručila. optimizovati sa stare mobilne uređaje sa sporim internetom (merenje: `alati/merenje.mjs`, [alati](docs/ALATI.md))
- cilj je na svakom zumu prikazati približno sličan, najmanji mogući, broj ikona na ekranu

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))