// @ts-check
import Slika from './komponente/Slika.js'
import Pretraga from './komponente/Pretraga.js'
import Slajder from './komponente/Slajder.js'
import Najblizi from './komponente/Najblizi.js'
import Detalji from './komponente/Detalji.js'
import Ruta from './komponente/Ruta.js'
import Marker, {pomaciPribliznih} from './klase/Marker.js'
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
const ruta = new Ruta()
document.querySelector('dugme-legenda').after(ruta, najblizi)
const detalji = document.body.appendChild(new Detalji())
const slajder = new Slajder([])
document.querySelector('#slajder-okvir').appendChild(slajder)
let filtriraneStavke = []

/* FUNKCIJE */

/**
 * @param {import('./data/tipovi').Spomenik} spomenik
 * @param {[number, number]} [pomak]
 */
const praviStavku = (spomenik, pomak) => {
  const marker = new Marker(spomenik, pomak)
  let slika
  // traka pravi sliku tek kad dodje na red, jer ih je hiljade
  const dajSliku = spomenik.slika && (() => slika ??= new Slika(spomenik, marker))
  return {spomenik, marker, dajSliku}
}

// neispravno kodiran #id (npr. #%) se ne odnosi ni na jedan spomenik
const idIzLinka = () => {
  try {
    return decodeURIComponent(location.hash.slice(1))
  } catch {
    return ''
  }
}

// link za deljenje (#id) otvara mapu na tom spomeniku; vraca da li je spomenik nadjen
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
    .sort((a, b) => vaznostSpomenika(a.spomenik) - vaznostSpomenika(b.spomenik) || a.spomenik.id.localeCompare(b.spomenik.id))
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
// Touchpad salje moveend za svaki wheel korak; traka se menja tek kad se pokret zavrsi.
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

/* INIT */

// rad bez signala
// u razvoju se gasi ranije instaliran worker i njegov komplet aplikacije, jer bi sluzio stare fajlove
if (devMode) {
  navigator.serviceWorker?.getRegistrations().then(registracije => registracije.forEach(r => r.unregister()))
  globalThis.caches?.keys().then(imena => imena.filter(ime => ime.startsWith('spomenici-aplikacija-')).forEach(ime => caches.delete(ime)))
} else if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').then(pratiIzdanje).catch(console.error)

const ucitaj = putanja => fetch(putanja)
  .then(res => res.ok ? res.json() : Promise.reject(new Error(`${putanja}: HTTP ${res.status}`)))

// bez autora, posveta ili tura spomenici se ipak prikazuju, samo bez tih dodataka
const ucitajDodatak = (putanja, prazno) => ucitaj(putanja).catch(greska => {
  console.error(greska)
  return prazno
})

// prvo stizu spomenici vidljivi na pocetnim zumovima, da se mapa nacrta odmah, a ostali posle (alati/zapis.py);
// priblizni su svi u drugom delu, pa im se pomaci racunaju zajedno
// Veliki drugi deo se na pocetnom zumu ne vidi, pa se preuzima u pozadini cim se nacrtaju istaknuti
// i ucitaju plocice pocetnog prikaza, da one dobiju celu brzinu veze; ne ceka nikakvu radnju korisnika.
// Plocica koja ne stigne (bez signala) takodje zavrsava ucitavanje sloja.
const posleCrtanja = () => new Promise(resi => requestAnimationFrame(() => {
  const slojevi = []
  mapa.eachLayer(sloj => { if (sloj instanceof L.GridLayer && sloj.isLoading()) slojevi.push(sloj) })
  Promise.all(slojevi.map(sloj => new Promise(gotov => sloj.once('load', gotov)))).then(resi)
}))
let sveStavke = []
let definicijeTura = []
let spremni = false
let potpuniPodaci = false
ucitajDodatak('data/autori.json', {}).then(autori => {
  detalji.postaviAutore(autori)
})
ucitajDodatak('data/posvete.json', {}).then(posvete => {
  detalji.postaviPosvete(posvete)
})
ucitajDodatak('data/ture.json', []).then(ture => {
  definicijeTura = ture
  if (spremni) ruta.postavi(sveStavke, ture, potpuniPodaci)
})
addEventListener('hashchange', () => otvoriIzLinka(sveStavke))
ucitaj('data/spomenici-istaknuti.json')
  .then(spomenici => {
    const prve = spomenici.map(spomenik => praviStavku(spomenik))
    sveStavke = prve
    spremni = true
    ruta.postavi(prve, definicijeTura, false)
    const pretraga = document.body.appendChild(new Pretraga(prve, render))
    const otvoren = otvoriIzLinka(prve)
    return posleCrtanja().then(() => ucitaj('data/spomenici-ostali.json')).then(spomenici => {
      const pomaci = pomaciPribliznih(spomenici)
      const nove = spomenici.map(spomenik => praviStavku(spomenik, pomaci.get(spomenik)))
      sveStavke = [...prve, ...nove]
      potpuniPodaci = true
      ruta.postavi(sveStavke, definicijeTura)
      pretraga.dodaj(nove)
      if (!otvoren) otvoriIzLinka(nove)
      document.documentElement.dataset.podaci = 'svi'
    })
  })
  .catch(greska => {
    console.error(greska)
    alert(t(spremni ? 'podaciDelimicni' : 'podaciNedostupni'))
  })
