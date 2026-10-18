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
- obraditi izdvojene akademske izvore ([nalazi i dostupnost](docs/IZVORI.md#akademski-portali--pregled-18102026), [prioriteti](docs/PLAN_ZETVE.md))

POTPUNOST PODATKA:
- locirati spomenike bez lokacije i bez tačne lokacije ([lociranje](docs/LOCIRANJE_SPOMENIKA.md))
- dodavati fotografije gde nedostaju ([obrađeni izvori fotografija](docs/IZVORI.md#commons-i-fotografije))
- popunjavati druge atribute na osnovu dostupnih izvora ([dopuna podataka](docs/DOPUNA_PODATAKA.md))

KVALITET PODATAKA (`data/spomeniks.json`):
- nedosledan oblik `mesta` za delove gradova („Beograd (Zemun)“ pored „Zemun“): ujednačiti
- 693 slike su fotografije korisnika Google mapa, koje nemaju licencu za ponovnu objavu: naći zamenu sa slobodnom licencom, pa ukloniti Google slike

UI:
- iz perspektive turiste koji obilazi ww2 spomenike bivše Jugoslavije (domaći i stranci): preispitati UI, prikazivanje po važnost podataka, prioritet vrsti spomenika, ponuđene ture i tome slično.

REFAKTOR
- code review i popravke
- uklanjanje tehničkog duga

OPTIMIZACIJA
- od poslednje optimizacije količina podataka se više nego udvostručila. optimizovati sa stare mobilne uređaje sa sporim internetom (merenje: `alati/merenje.mjs`, [alati](docs/ALATI.md))
- cilj je na svakom zumu prikazati približno sličan, najmanji mogući, broj ikona na ekranu

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
