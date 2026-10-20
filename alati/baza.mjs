// svi spomenici na mapi kao celi zapisi, za alate u Node-u (u Pythonu isto radi ucitaj_bazu iz zapis.py)
import {existsSync, readFileSync} from 'node:fs'

export const FAJLOVI_BAZE = ['data/spomenici-istaknuti.json', 'data/spomenici-ostali.json']

// slika na standardnoj putanji se u fajlu ne upisuje, nego je oznacava slikaOdnos; detalji i engleski nazivi su u
// zasebnim fajlovima (alati/zapis.py)
export const ucitajBazu = (koren = new URL('../', import.meta.url)) => {
  const procitaj = (fajl, prazno) => existsSync(new URL(fajl, koren)) ? JSON.parse(readFileSync(new URL(fajl, koren), 'utf8')) : prazno
  const detalji = procitaj('data/detalji.json', {}), prevodi = procitaj('data/prevodi-en.json', {})
  return FAJLOVI_BAZE.flatMap(fajl => procitaj(fajl, [])).map(s => ({
    ...s,
    ...s.slika === true || (!s.slika && s.slikaOdnos) ? {slika: `slike/spomenici/${s.id}.webp`} : {},
    ...detalji[s.id],
    ...prevodi[s.id] ? {nazivEn: prevodi[s.id]} : {},
  }))
}
