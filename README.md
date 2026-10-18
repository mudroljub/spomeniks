# Spomeniks

Yugoslav WWII monuments travel app.

Visit: [mudroljub.github.io/spomeniks](https://mudroljub.github.io/spomeniks/)

[![](screen.png)](https://mudroljub.github.io/spomeniks/)

## Development

```
live-server
```

## TODO

- pri udaljenom zumu ima puno objekata bez tačne lokacije. nalaženje tačne lokacije za njih treba biti prioritet. Redosled po vrsti (u zagradi postojeći / nestali, od 1.060):
  1. istaknuti (0) i kompleksi (2 / 0): Dom „Đuro Đaković“ u Lušci Palanci i „Omladinska pruga“ u Nemili; nijedan izvor nema tačku
  2. spomenici (25 / 1) i statue (7 / 0)
  3. muzeji i spomen-domovi (28 / 0)
  4. biste (99 / 59)
  5. groblja i kosturnice (247 / 5)
  6. lokalni (507 / 80)

  Unutar grupe prvo postojeći, pa oni sa autorom ili fotografijom; srušeni i uklonjeni na kraju. Partisan Memorials Wiki (`izvori/xiwl/`) je ceo uparen; ostala su 73 slaba para i 100 tačaka koje i wiki procenjuje (odluke.json, priblizno-xiwl-zbirno).
  - biste: wiki ih vodi samo kao red na stranici sela, sa opisom mesta (škola, dom, groblje); 27 rešeno preko OSM-a i našeg zapisa groblja (odluke.json, priblizno-biste-xiwl-sela). Za ostale sa opisom traži pojedinačno na Google mapama

- traka sa slikama treba da se ažurira pri promeni mape i prikazuje samo spomenike sa vidljivog dela mape, po važnosti
- po kom kriteriju se dodaju spomenici u ture? npr. u Beograd u NOB?