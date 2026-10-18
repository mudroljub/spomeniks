# Spomeniks

Yugoslav WWII monuments travel app.

Visit: [mudroljub.github.io/spomeniks](https://mudroljub.github.io/spomeniks/)

[![](screen.png)](https://mudroljub.github.io/spomeniks/)

## Development

```
live-server
```

## TODO

- pri udaljenom zumu ima puno objekata bez tačne lokacije. nalaženje tačne lokacije za njih treba biti prioritet. Redosled po vrsti (u zagradi postojeći / nestali, od 1.089):
  1. istaknuti (0) i kompleksi (2 / 0): Dom „Đuro Đaković“ u Lušci Palanci i „Omladinska pruga“ u Nemili; nijedan izvor nema tačku
  2. spomenici (25 / 1) i statue (7 / 0)
  3. muzeji i spomen-domovi (28 / 0)
  4. biste (123 / 63)
  5. groblja i kosturnice (247 / 5)
  6. lokalni (508 / 80)

  Unutar grupe prvo postojeći, pa oni sa autorom ili fotografijom; srušeni i uklonjeni na kraju. Partisan Memorials Wiki (`izvori/xiwl/`) je ceo uparen; ostala su 73 slaba para i 100 tačaka koje i wiki procenjuje (odluke.json, priblizno-xiwl-zbirno).
  - biste nisu dobile nijedan par sa wikija; utvrditi zašto

- traka sa slikama treba da se ažurira pri promeni mape i prikazuje samo spomenike sa vidljivog dela mape, po važnosti
