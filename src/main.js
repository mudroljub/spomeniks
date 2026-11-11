// @ts-check
import Slika from './komponente/Slika.js'
import Pretraga from './komponente/Pretraga.js'
import Slajder from './komponente/Slajder.js'
import Najblizi from './komponente/Najblizi.js'
import Marker, {pomaciPribliznih, pomaciBliskih} from './klase/Marker.js'
import './komponente/PunEkran.js'
import './komponente/Jezik.js'
import './komponente/Legenda.js'
import './komponente/Prijava.js'
import './komponente/Lokator.js'
import {jezik, t} from './utils/jezik.js'
import {mapa, postaviMarkere} from './klase/mapa.js'
import {vaznostSpomenika} from './utils/vaznost.js'
import {pratiIzdanje} from './utils/azuriranje.js'
import {devMode} from './utils/podesavanja.js'

document.documentElement.lang = jezik

const najblizi = new Najblizi()
document.querySelector('dugme-legenda').after(najblizi)

let javiPrvoCrtanje
const prvoCrtanje = new Promise(resi => javiPrvoCrtanje = resi)
const uvezi = (putanja, pokusaj = 0) => import(pokusaj ? `${putanja}?pokusaj=${pokusaj}` : putanja)
  .catch(greska => {
    console.error(greska)
    return new Promise(resi => setTimeout(resi, Math.min(30000, 2000 * 2 ** pokusaj))).then(() => uvezi(putanja, pokusaj + 1))
  })
let izborPre = null
const pamtiIzbor = e => izborPre = e
mapa.on('izbor', pamtiIzbor)
const detalji = prvoCrtanje.then(() => uvezi('./komponente/Detalji.js')).then(({default: Detalji}) => {
  const prozor = document.body.appendChild(new Detalji())
  mapa.off('izbor', pamtiIzbor)
  if (izborPre?.marker) prozor.prikazi(izborPre.marker, izborPre.izRute)
  return prozor
})
const ruta = prvoCrtanje.then(() => uvezi('./komponente/Ruta.js')).then(({default: Ruta}) => {
  const planer = new Ruta()
  najblizi.before(planer)
  return planer
})
const osveziRutu = () => ruta.then(planer => planer.postavi(sveStavke, definicijeTura, potpuniPodaci))
const slajder = new Slajder([])
document.querySelector('#slajder-okvir').appendChild(slajder)
let filtriraneStavke = []

/**
 * @param {import('./data/tipovi').Spomenik} spomenik
 * @param {[number, number]} [pomak]
 */
const praviStavku = (spomenik, pomak) => {
  const marker = new Marker(spomenik, pomak)
  let slika
  const dajSliku = spomenik.slika && (() => slika ??= new Slika(spomenik, marker))
  return {spomenik, marker, dajSliku}
}

const idIzLinka = () => {
  try {
    return decodeURIComponent(location.hash.slice(1))
  } catch {
    return ''
  }
}

const otvoriIzLinka = stavke => {
  const id = idIzLinka()
  const stavka = id && stavke.find(({spomenik}) => spomenik.id === id)
  if (!stavka) return false
  mapa.setView(stavka.marker.dajPoziciju(), 11, {animate: false})
  stavka.marker.otvoriProzor()
  return true
}

const osveziSlajder = () => {
  const granice = mapa.getBounds()
  const stavke = filtriraneStavke
    .filter(({marker, dajSliku}) => dajSliku && granice.contains(marker.dajPoziciju()))
    .sort((a, b) => vaznostSpomenika(a.spomenik) - vaznostSpomenika(b.spomenik) || (a.spomenik.id < b.spomenik.id ? -1 : a.spomenik.id > b.spomenik.id ? 1 : 0))
  slajder.postavi(stavke.map(({dajSliku}) => dajSliku), mapa.getZoom())
}

let mapaSePomera = false
let cekanjeSlajdera
const otkaziSlajder = () => {
  clearTimeout(cekanjeSlajdera)
  cekanjeSlajdera = undefined
}

mapa.on('movestart', () => {
  mapaSePomera = true
  otkaziSlajder()
})
mapa.on('moveend', () => {
  mapaSePomera = false
  otkaziSlajder()
  cekanjeSlajdera = setTimeout(() => {
    cekanjeSlajdera = undefined
    osveziSlajder()
  }, 150)
})

const render = (stavke, suzeno, imaUslova) => {
  filtriraneStavke = stavke
  postaviMarkere(stavke.map(({marker}) => marker), suzeno)
  if (!mapaSePomera) {
    otkaziSlajder()
    osveziSlajder()
  }
  najblizi.postavi(stavke, imaUslova)
}

if (devMode) {
  navigator.serviceWorker?.getRegistrations().then(registracije => registracije.forEach(r => r.unregister()))
  globalThis.caches?.keys().then(imena => imena.filter(ime => ime.startsWith('spomenici-aplikacija-')).forEach(ime => caches.delete(ime)))
} else if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').then(pratiIzdanje).catch(console.error)

const ucitaj = putanja => fetch(putanja)
  .then(res => res.ok ? res.json() : Promise.reject(new Error(`${putanja}: HTTP ${res.status}`)))

/** @param {any[]} spomenici @returns {import('./data/tipovi').Spomenik[]} */
const saSlikama = spomenici => spomenici.map(s => s.slika === true || (!s.slika && s.slikaOdnos) ? Object.assign(s, {slika: `slike/spomenici/${s.id}.webp`}) : s)
const ucitajSpomenike = putanja => ucitaj(putanja).then(saSlikama)

const ucitajDodatak = (putanja, prazno) => ucitaj(putanja).catch(greska => {
  console.error(greska)
  return prazno
})

const posleCrtanja = () => new Promise(resi => requestAnimationFrame(() => {
  const slojevi = []
  mapa.eachLayer(sloj => { if (sloj instanceof L.GridLayer && sloj.isLoading()) slojevi.push(sloj) })
  Promise.all(slojevi.map(sloj => new Promise(gotov => sloj.once('load', gotov)))).then(resi)
}))
let sveStavke = []
let definicijeTura = []
let spremni = false
let potpuniPodaci = false
/** @type {Pretraga | undefined} */
let pretraga

/** @type {{detalji?: Record<string, Partial<import('./data/tipovi').Spomenik>>, prevodi?: Record<string, string>}} */
const dopune = {}
/** @param {import('./data/tipovi').Spomenik[]} spomenici */
const dopuni = spomenici => spomenici.forEach(spomenik => {
  Object.assign(spomenik, dopune.detalji?.[spomenik.id])
  const nazivEn = dopune.prevodi?.[spomenik.id]
  if (nazivEn) spomenik.nazivEn = nazivEn
})
/** @param {typeof dopune} nove */
const dodajDopune = nove => {
  Object.assign(dopune, nove)
  dopuni(sveStavke.map(({spomenik}) => spomenik))
  pretraga?.osveziDopune()
  osveziSlajder()
  detalji.then(prozor => prozor.osvezi())
}
let javiCrtanje
const nacrtano = new Promise(resi => javiCrtanje = resi)
nacrtano.then(() => {
  ucitajDodatak('data/autori.json', {}).then(autori => {
    detalji.then(prozor => prozor.postaviAutore(autori))
  })
  ucitajDodatak('data/posvete.json', {}).then(posvete => {
    detalji.then(prozor => prozor.postaviPosvete(posvete))
  })
  ucitajDodatak('data/ture.json', []).then(ture => {
    definicijeTura = ture
    if (spremni) osveziRutu()
  })
  ucitajDodatak('data/detalji.json', {}).then(detalji => dodajDopune({detalji}))
  ucitajDodatak('data/prevodi-en.json', {}).then(prevodi => dodajDopune({prevodi}))
})
addEventListener('hashchange', () => otvoriIzLinka(sveStavke))
ucitajSpomenike('data/spomenici-istaknuti.json')
  .then(spomenici => {
    const prve = spomenici.map(spomenik => praviStavku(spomenik))
    sveStavke = prve
    spremni = true
    osveziRutu()
    pretraga = document.body.appendChild(new Pretraga(prve, render))
    const otvoren = otvoriIzLinka(prve)
    requestAnimationFrame(javiPrvoCrtanje)
    posleCrtanja().then(javiCrtanje)
    return nacrtano.then(() => ucitajSpomenike('data/spomenici-ostali.json')).then(spomenici => {
      dopuni(spomenici)
      const pomaci = pomaciPribliznih(spomenici)
      const bliski = pomaciBliskih([...prve.map(stavka => stavka.spomenik), ...spomenici])
      prve.forEach(({spomenik, marker}) => { if (bliski.has(spomenik)) marker.pomak = bliski.get(spomenik) })
      const nove = spomenici.map(spomenik => praviStavku(spomenik, pomaci.get(spomenik) ?? bliski.get(spomenik)))
      sveStavke = [...prve, ...nove]
      potpuniPodaci = true
      osveziRutu()
      pretraga.dodaj(nove)
      if (!otvoren) otvoriIzLinka(nove)
      document.documentElement.dataset.podaci = 'svi'
    }).finally(() => pretraga.omoguci())
  })
  .catch(greska => {
    console.error(greska)
    alert(t(spremni ? 'podaciDelimicni' : 'podaciNedostupni'))
  })
