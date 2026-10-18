// @ts-check
// spomenici izabrani za put, redom obilaska, i ime gotove ture od koje je nastala; cuva se samo na ovom uredjaju
const kljuc = 'spomenici-ruta'
const prazna = {naziv: '', spomenici: []}

const ucitaj = () => {
  try {
    const ruta = JSON.parse(localStorage.getItem(kljuc))
    return Array.isArray(ruta?.spomenici) ? ruta : prazna
  } catch (e) {
    return prazna
  }
}

let ruta = ucitaj()

const sacuvaj = () => {
  try {
    localStorage.setItem(kljuc, JSON.stringify(ruta))
  } catch (e) {
    // privatni rezim i slicno: ruta vazi do zatvaranja stranice
  }
}

export const promeneRute = new EventTarget()

const zameni = nova => {
  ruta = nova.spomenici.length || nova.turaId ? nova : prazna
  sacuvaj()
  promeneRute.dispatchEvent(new Event('promena'))
}

export const dajRutu = () => ruta.spomenici

export const dajNaziv = () => ruta.naziv

export const dajWiki = () => ruta.wiki
export const dajTuruId = () => ruta.turaId

// izmena stanica zadrzava ime, jer je to i dalje ista ruta
export const postaviRutu = spomenici => zameni(spomenici.length ? {...ruta, spomenici} : prazna)

export const izaberiTuru = ({id, naziv, spomenici, wiki = ''}) => zameni({turaId: id, naziv, spomenici, wiki})

export const uRuti = id => ruta.spomenici.includes(id)

const izmeniStanice = spomenici => zameni({...ruta, turaId: undefined, spomenici})

export const dodajURutu = id => izmeniStanice([...ruta.spomenici, id])

export const ukloniIzRute = id => izmeniStanice(ruta.spomenici.filter(x => x !== id))

// pomera stanicu za jedno mesto napred (-1) ili nazad (1)
export const pomeri = (id, smer) => {
  const i = ruta.spomenici.indexOf(id)
  const j = i + smer
  if (i < 0 || j < 0 || j >= ruta.spomenici.length) return
  const nova = [...ruta.spomenici]
  ;[nova[i], nova[j]] = [nova[j], nova[i]]
  izmeniStanice(nova)
}
