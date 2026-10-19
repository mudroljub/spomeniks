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

const render = (stavke, suzeno) => {
  filtriraneStavke = stavke
  postaviMarkere(stavke.map(({marker}) => marker), suzeno)
  if (!mapaSePomera) {
    otkaziSlajder()
    osveziSlajder()
  }
  najblizi.postavi(stavke)
}

/* INIT */

// rad bez signala
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.error)

const ucitaj = putanja => fetch(putanja)
  .then(res => res.ok ? res.json() : Promise.reject(new Error(`${putanja}: HTTP ${res.status}`)))

// bez autora, posveta ili tura spomenici se ipak prikazuju, samo bez tih dodataka
const ucitajDodatak = (putanja, prazno) => ucitaj(putanja).catch(greska => {
  console.error(greska)
  return prazno
})

// prvo stizu spomenici vidljivi na pocetnim zumovima, da se mapa nacrta odmah, a ostali posle (alati/zapis.py);
// priblizni su svi u drugom delu, pa im se pomaci racunaju zajedno
const ostalo = ucitaj('data/spomenici-ostali.json')
// Zahtev pocinje odmah, a njegova greska se obradjuje i ako prvi deo jos nije stigao.
ostalo.catch(() => {})
let sveStavke = []
let definicijeTura = []
let spremni = false
ucitajDodatak('data/autori.json', {}).then(autori => {
  detalji.postaviAutore(autori)
})
ucitajDodatak('data/posvete.json', {}).then(posvete => {
  detalji.postaviPosvete(posvete)
})
ucitajDodatak('data/ture.json', []).then(ture => {
  definicijeTura = ture
  if (spremni) ruta.postavi(sveStavke, ture)
})
addEventListener('hashchange', () => otvoriIzLinka(sveStavke))
ucitaj('data/spomenici-istaknuti.json')
  .then(spomenici => {
    const prve = spomenici.map(spomenik => praviStavku(spomenik))
    sveStavke = prve
    spremni = true
    ruta.postavi(prve, definicijeTura)
    const pretraga = document.body.appendChild(new Pretraga(prve, render))
    const otvoren = otvoriIzLinka(prve)
    return ostalo.then(spomenici => {
      const pomaci = pomaciPribliznih(spomenici)
      const nove = spomenici.map(spomenik => praviStavku(spomenik, pomaci.get(spomenik)))
      sveStavke = [...prve, ...nove]
      ruta.postavi(sveStavke, definicijeTura)
      pretraga.dodaj(nove)
      if (!otvoren) otvoriIzLinka(nove)
      document.documentElement.dataset.podaci = 'svi'
    })
  })
  .catch(greska => {
    console.error(greska)
    alert(t('podaciNedostupni'))
  })
