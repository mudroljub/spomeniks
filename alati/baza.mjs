// svi spomenici na mapi iz oba fajla, za alate u Node-u (u Pythonu isto radi ucitaj_bazu iz zapis.py)
import {readFileSync} from 'node:fs'

export const FAJLOVI_BAZE = ['data/spomenici-istaknuti.json', 'data/spomenici-ostali.json']

export const ucitajBazu = (koren = new URL('../', import.meta.url)) =>
  FAJLOVI_BAZE.flatMap(fajl => JSON.parse(readFileSync(new URL(fajl, koren), 'utf8')))
