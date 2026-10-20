// svi spomenici na mapi iz oba fajla, za alate u Node-u (u Pythonu isto radi ucitaj_bazu iz zapis.py)
import {readFileSync} from 'node:fs'

export const FAJLOVI_BAZE = ['data/spomenici-istaknuti.json', 'data/spomenici-ostali.json']

// slika na standardnoj putanji se u fajlu ne upisuje, nego je oznacava slikaOdnos (alati/zapis.py)
export const ucitajBazu = (koren = new URL('../', import.meta.url)) =>
  FAJLOVI_BAZE.flatMap(fajl => JSON.parse(readFileSync(new URL(fajl, koren), 'utf8')))
    .map(s => s.slika === true || (!s.slika && s.slikaOdnos) ? {...s, slika: `slike/spomenici/${s.id}.webp`} : s)
