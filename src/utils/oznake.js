// @ts-check
import {ucitajIzSkladista, sacuvajUSkladiste} from './skladiste.js'

const kljuc = 'spomenici-poseta'
const vrsteOznaka = ['lista', 'posetio']

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
