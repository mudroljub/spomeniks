# Spomeniks

Yugoslav WWII monuments travel app.

Visit: [mudroljub.github.io/spomeniks](https://mudroljub.github.io/spomeniks/)

[![](screen.png)](https://mudroljub.github.io/spomeniks/)

## Development

```
live-server
```

## TODO

Po prioritetu:

1. traka sa slikama treba da se ažurira pri promeni mape i prikazuje samo spomenike sa vidljivog dela mape, po važnosti
2. u rutama ostaviti mogućnost korisniku da uključi i lokalne spomenike u rutu
3. umesto labela Pretraga, neka bude Pretraži xxxx spomenika NOB

## Traženje lokacije

Po važnosti vrste na mapi (`utils/vaznost.js`):

1. kompleksi (7)
2. muzeji i spomen-domovi (28)
3. groblja i kosturnice (303)
4. spomenici (24): detaljna online pretraga za svaku stavku
5. statue (5): detaljna online pretraga za svaku stavku
6. biste (159): tražiti pojedinačno na Google mapama
7. lokalni (912)
8. ploče (1)
