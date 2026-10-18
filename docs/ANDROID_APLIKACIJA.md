# Android aplikacija

Ažurirano 2026-10-16. Spomeniks je veb aplikacija sa manifestom i service worker-om, pa se za Google Play pakuje kao TWA (Trusted Web Activity). Aplikacija prikazuje sajt `mudroljub.github.io/spomeniks` preko celog ekrana, bez adresne trake. Kod ostaje jedan, a svaka izmena sajta odmah stiže i u aplikaciju, bez nove objave.

## Koraci

1. **Manifest** (`manifest.json`): dodati `theme_color`, `background_color`, `id` i ikonu sa `"purpose": "maskable"`, 512 × 512, sa logom unutar sigurne zone, za okruglu ikonu Androida.
2. **Paket**: na [PWABuilder](https://www.pwabuilder.com) uneti adresu sajta i izabrati Android. Dobija se `.aab` za Play i ključ za potpisivanje, koji treba sačuvati: bez njega nema novih verzija. Ista stvar lokalno može da se uradi alatom Bubblewrap (Node i JDK).
3. **Veza sajta i aplikacije**: PWABuilder daje `assetlinks.json`. Fajl mora biti u korenu domena, `mudroljub.github.io/.well-known/assetlinks.json`, dakle u repozitorijumu `mudroljub.github.io`, a ne u ovom. Bez njega aplikacija prikazuje adresnu traku pregledača.
4. **Google Play Console** (25 USD jednokratno):
   - nalog;
   - stranica sa politikom privatnosti (aplikacija ne šalje lokaciju nikome, a oznake čuva samo na telefonu);
   - upitnik „Data safety“;
   - snimci ekrana i opis;
   - zatvoreno testiranje sa 12 testera tokom 14 dana, koje se traži od novih ličnih naloga.
5. **Provera na telefonu**: instalirati iz zatvorenog testiranja i proveriti rad bez signala, lokaciju, deljenje linka spomenika i povratak dugmetom „nazad“.

## Pločice mape

Sada: Esri NatGeo do zuma 12, a OSM od zuma 13. OSM dozvoljava interaktivno korišćenje javnog servera pločica uz poštovanje [pravila korišćenja](https://operations.osmfoundation.org/policies/tiles/), uključujući atribuciju, keširanje prema zaglavljima (ili najmanje 7 dana) i zabranu offline korišćenja. Esri podloga ima svoje uslove korišćenja.

| Rešenje | Izgled | Posao | Ograničenje |
|---|---|---|---|
| **Stadia Maps, Stamen Terrain** | reljef, blizak sadašnjem atlasu | mali: druga adresa pločica (već stoji zakomentarisana u `klase/mapa.js`) | besplatno samo nekomercijalno, uz mesečnu kvotu; ovlašćenje po domenu, pa ključ ne ide u kod |
| **MapTiler** (Outdoor, Topo) | planinarska karta | mali: adresa i ključ | besplatno nekomercijalno, uz kvotu |
| **Esri sa besplatnim nalogom** | ostaje isti | mali: ključ uz adresu | NatGeo podloga više se ne razvija; kvota i uslovi za nju nisu potvrđeni |
| **Sopstvene pločice** (Protomaps, jedan PMTiles fajl za region) | po želji, vektorska karta | velik: izrada isečka, stil, prelazak na MapLibre ili dodatak za Leaflet | nema kvote ni ključa; fajl od nekoliko stotina MB mora na hosting van GitHub-a (npr. Cloudflare R2) |

Bliski zum (13–18) je potreban, proveren na telefonu 2026-10-16, pa ograničenje mape na zum 12 ne dolazi u obzir. Odluka (2026-10-16): **Stadia umesto OSM-a samo za bliski zum (13–18)**, a Esri atlas ostaje do zuma 12. Besplatni plan Stadie ima 200.000 pločica mesečno, samo za nekomercijalnu upotrebu; sledeći je 20 USD mesečno za milion ([cenovnik](https://stadiamaps.com/pricing/)). Ovlašćenje po domenu radi i u TWA, jer aplikacija učitava isti domen.

**Stanje implementacije (2026-10-18):** `klase/mapa.js` i dalje koristi OSM od zuma 13, iako je odluka bila da pređe na Stadia. Pored toga, `sw.js` kešira OSM pločice bez isteka i vraća ih i bez mreže. Pre objave treba uskladiti izvor sa odlukom i proveriti ponašanje keša prema OSM pravilima; konkretno, offline vraćanje OSM pločica nije dozvoljeno.

## TWA ili Capacitor

| | TWA | Capacitor |
|---|---|---|
| Šta je u aplikaciji | samo veza ka sajtu; stranica se učitava sa sajta | kopija fajlova aplikacije, u paketu |
| Izmena aplikacije | stiže čim se objavi sajt | traži novu verziju na Play-u |
| Rad bez signala | preko service worker-a, kao sajt | fajlovi su u paketu; pločice i slike i dalje traže keš |
| Pristup telefonu | ono što ima i veb: lokacija, deljenje, kamera | i ono što veb nema: obaveštenja u pozadini, fajlovi, prirodni dodaci |
| Alati | PWABuilder u pregledaču, ili Bubblewrap (Node i JDK) | Node, JDK i Android Studio |
| Posao oko objave | jednom, pa samo godišnje podizanje Android verzije koju Play traži | svaka objava aplikacije, plus isto godišnje podizanje |
| Kada | sada: aplikacija radi kao sajt i to je dovoljno | kasnije, ako zatreba nešto što veb ne može |

Preporuka je TWA, jer ne traži izmene koda ni nove objave za svaku promenu.
