# Spomeniks

Yugoslav WWII monuments travel app.

Visit: [mudroljub.github.io/spomeniks](https://mudroljub.github.io/spomeniks/)

[![](screen.png)](https://mudroljub.github.io/spomeniks/)

## Development

```
live-server
```

## TODO

ČIŠĆENJE
- očisti iz fajla docs/IZVORI.md sve izvore koje nemamo, koje nismo preuzeli. ne treba nam nabrajanje potencijalnih izvora nego mapiranje i ocena postojećih.

UNOS PODATAKA:
- žetva izvora po [planu](docs/PLAN_ZETVE.md)
- od konzervatorke spomenika iz Hrvatske sam dobio podatak da je pola spomenika NOB u Hrvatskoj uništeno. to treba imati u vidu prilikom žetvi podataka pre 1991.

POTPUNOST PODATKA:
- locirati spomenike bez lokacije i bez tačne lokacije ([lociranje](docs/LOCIRANJE_SPOMENIKA.md))
- dodavati fotografije gde nedostaju ([obrađeni izvori fotografija](docs/IZVORI.md#commons-i-fotografije))
- popunjavati druge atribute na osnovu dostupnih izvora ([dopuna podataka](docs/DOPUNA_PODATAKA.md)). prioritet su: autor, posveta, wiki...

KVALITET PODATAKA:
- 523 slike su fotografije korisnika Google mapa, koje nemaju licencu za ponovnu objavu: naći zamenu sa slobodnom licencom, pa ukloniti Google slike
- 74 slike sa potpisom „HeritagePhotogrammetry“ su sličice 3D modela, ne fotografije: kad se nađe prava fotografija, ona ima prednost

UI:
- iz perspektive turiste koji obilazi ww2 spomenike bivše Jugoslavije (domaći i stranci): preispitati UI, prikazivanje po važnost podataka, prioritet vrsti spomenika, ponuđene ture i tome slično ([nalazi](docs/UI_TURISTA.md)).

REFAKTOR
- code review i popravke
- uklanjanje tehničkog duga

OPTIMIZACIJA
- od poslednje optimizacije količina podataka se više nego udvostručila. optimizovati sa stare mobilne uređaje sa sporim internetom (merenje: `alati/merenje.mjs`, [alati](docs/ALATI.md))
- cilj je na svakom zumu prikazati približno sličan, najmanji mogući, broj ikona na ekranu

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
