// @ts-check
import {ucitajIzSkladista, sacuvajUSkladiste} from './skladiste.js'

// spomenici izabrani za put, redom obilaska, i ime gotove ture od koje je nastala; cuva se samo na ovom uredjaju
const kljuc = 'spomenici-ruta'
const prazna = {naziv: '', spomenici: []}

const ispravanId = id => typeof id === 'string' && id.trim().length > 0

const proveriRutu = nova => {
  if (!Array.isArray(nova?.spomenici)) return prazna
  const spomenici = [...new Set(nova.spomenici.filter(ispravanId))]
  const turaId = ispravanId(nova.turaId) ? nova.turaId : undefined
  if (!spomenici.length && !turaId) return prazna
  const naziv = typeof nova.naziv === 'string' ? nova.naziv
    : typeof nova.naziv?.sh === 'string' && typeof nova.naziv?.en === 'string'
      ? Object.freeze({sh: nova.naziv.sh, en: nova.naziv.en}) : ''
  return {naziv, spomenici, ...(turaId ? {turaId} : {}),
    ...(typeof nova.wiki === 'string' ? {wiki: nova.wiki} : {})}
}

const ucitaj = () => {
  try {
    return proveriRutu(JSON.parse(ucitajIzSkladista(kljuc)))
  } catch {
    return prazna
  }
}

let ruta = ucitaj()

const sacuvaj = () => sacuvajUSkladiste(kljuc, JSON.stringify(ruta))

export const promeneRute = new EventTarget()

const zameni = nova => {
  ruta = proveriRutu(nova)
  sacuvaj()
  promeneRute.dispatchEvent(new Event('promena'))
}

export const dajRutu = () => [...ruta.spomenici]

export const dajNaziv = () => ruta.naziv

export const dajWiki = () => ruta.wiki
export const dajTuruId = () => ruta.turaId

// izmena stanica zadrzava ime, jer je to i dalje ista ruta
export const postaviRutu = spomenici => zameni(spomenici.length ? {...ruta, spomenici} : prazna)

export const izaberiTuru = ({id, naziv, spomenici, wiki = ''}) => zameni({turaId: id, naziv, spomenici, wiki})

export const uRuti = id => ruta.spomenici.includes(id)

const izmeniStanice = spomenici => zameni({...ruta, turaId: undefined, spomenici})

export const dodajURutu = id => {
  if (!ispravanId(id) || uRuti(id)) return
  izmeniStanice([...ruta.spomenici, id])
}

export const ukloniIzRute = id => {
  if (!uRuti(id)) return
  izmeniStanice(ruta.spomenici.filter(x => x !== id))
}

// pomera stanicu za jedno mesto napred (-1) ili nazad (1)
export const pomeri = (id, smer) => {
  const i = ruta.spomenici.indexOf(id)
  const j = i + smer
  if (i < 0 || j < 0 || j >= ruta.spomenici.length) return
  const nova = [...ruta.spomenici]
  ;[nova[i], nova[j]] = [nova[j], nova[i]]
  izmeniStanice(nova)
}
