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
- nastaviti pregled zapisa vrste `spomen-groblje`: zadržati tu vrstu za celu uređenu memorijalnu celinu, a konkretno delo razvrstati kao `bista`, `statua` ili `spomenik`, jednostavan grob kao `spomen-grob`; odluku zasnivati na opisu i fotografijama, ne samo na veličini ili nazivu (prvi pregled 50 slovenačkih zapisa: 29 promenjeno, 9 zadržano, [12 za dodatnu proveru](data/provere/groblja-razvrstavanje-2026-10-20.json); preostalih 875 zapisa samo sa mape podeljeno je na [deset prolaza](data/provere/groblja-plan-deset-prolaza-2026-10-20.json), pet po 88 i pet po 87; [prolaz 1](data/provere/groblja-prolaz-01-2026-10-20.json): 35 promenjeno, 50 zadržano, 3 za dodatnu proveru; [prolaz 2](data/provere/groblja-prolaz-02-2026-10-20.json): 59 promenjeno, 23 zadržano, 6 za dodatnu proveru; slede prolazi 3–10 sa 699 zapisa; spisak bez lokacije nije u obuhvatu)
- pri dopuni fotografija prednost dati umetničkim delima i sadržajnim memorijalnim celinama; jednostavni spomen-grobovi i ploče ostaju niži prioritet

UI:
- iz perspektive turiste koji obilazi ww2 spomenike bivše Jugoslavije (domaći i stranci): preispitati UI, prikazivanje po važnost podataka, prioritet vrsti spomenika, ponuđene ture i tome slično ([nalazi](docs/UI_TURISTA.md)).

REFAKTOR
- uklanjanje tehničkog duga

OPTIMIZACIJA
- od poslednje optimizacije količina podataka se više nego udvostručila. optimizovati sa stare mobilne uređaje sa sporim internetom (merenje: `alati/merenje.mjs`, [alati](docs/ALATI.md))

MOBILNA APLIKACIJA
- napraviti android aplikaciju nakon završetka obrade podataka ([plan](docs/ANDROID_APLIKACIJA.md))
- pre objave uskladiti izbor i keširanje pločica: planirana zamena OSM-a za bliske zumove nije sprovedena, a servisni radnik vraća keširane OSM pločice bez roka ([nalaz](docs/ANDROID_APLIKACIJA.md))
