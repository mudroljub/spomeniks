// @ts-check
import {ucitajIzSkladista, sacuvajUSkladiste} from './skladiste.js'

// svaki spomenik ima najvise jednu oznaku, 'lista' ili 'posetio'; cuva se samo na ovom uredjaju
const kljuc = 'spomenici-poseta'
const vrsteOznaka = ['lista', 'posetio']

// zapis koji nije objekat i nepoznate oznake se odbacuju, da ne pokvare prikaz
const ucitaj = () => {
  try {
    const sacuvane = JSON.parse(ucitajIzSkladista(kljuc))
    if (!sacuvane || typeof sacuvane !== 'object' || Array.isArray(sacuvane)) return new Map()
    return new Map(Object.entries(sacuvane).filter(([, oznaka]) => vrsteOznaka.includes(oznaka)))
  } catch {
    return new Map()
  }
}

const oznake = ucitaj()

const sacuvaj = () => sacuvajUSkladiste(kljuc, JSON.stringify(Object.fromEntries(oznake)))

export const promene = new EventTarget()

export const dajOznaku = id => oznake.get(id)

export const postaviOznaku = (id, oznaka) => {
  if (oznaka) oznake.set(id, oznaka)
  else oznake.delete(id)
  sacuvaj()
  promene.dispatchEvent(new Event('promena'))
}
