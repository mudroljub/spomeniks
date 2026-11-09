# Android aplikacija

Aplikacija se za Google Play pakuje kao TWA (Trusted Web Activity): prikazuje sajt `mudroljub.github.io/spomeniks` preko celog ekrana, pa svaka izmena sajta odmah stiže i u aplikaciju, bez nove objave. Capacitor (fajlovi u paketu) dolazi u obzir tek ako zatreba nešto što veb ne može, npr. obaveštenja u pozadini.

1. **Objava sajta**: po koracima „Pred objavljivanje“ iz README-a.
2. **Paket**: na [PWABuilder](https://www.pwabuilder.com) uneti adresu sajta i izabrati Android. Dobija se `.aab` za Play i ključ za potpisivanje, koji treba sačuvati: bez njega nema novih verzija. Ista stvar lokalno može da se uradi alatom Bubblewrap (Node i JDK). Paket je napravljen 9. 11. 2026. (ID `io.github.mudroljub.spomeniks`); zip sa ključem i lozinkom (`Spomeniks - Google Play package.zip`) čuva se na ličnom Google Drive-u, nikad u repozitorijumu ni na poslovnom OneDrive-u.
3. **Veza sajta i aplikacije**: PWABuilder daje `assetlinks.json`. Fajl mora biti u korenu domena, `mudroljub.github.io/.well-known/assetlinks.json`, dakle u repozitorijumu `mudroljub.github.io`, a ne u ovom. Bez njega aplikacija prikazuje adresnu traku pregledača. Repozitorijum ima `.nojekyll`, pa GitHub Pages objavljuje i fasciklu `.well-known`. Play aplikaciju ponovo potpisuje svojim ključem (Play App Signing), pa posle prvog otpremanja u `assetlinks.json` treba dodati i SHA-256 otisak iz Play Console (Setup → App signing), uz postojeći otisak ključa iz PWABuilder-a.
4. **Google Play Console** (25 USD jednokratno):
   - nalog;
   - stranica sa politikom privatnosti (aplikacija ne šalje lokaciju nikome, a oznake čuva samo na telefonu);
   - upitnik „Data safety“;
   - snimci ekrana i opis;
   - zatvoreno testiranje sa 12 testera tokom 14 dana, koje se traži od novih ličnih naloga.
5. **Provera na telefonu**: instalirati iz zatvorenog testiranja i proveriti rad bez signala, lokaciju, deljenje linka spomenika i povratak dugmetom „nazad“.
