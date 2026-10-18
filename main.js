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
import {$} from './utils/helpers.js'
import {jezik} from './utils/jezik.js'
import {mapa, postaviMarkere} from './klase/mapa.js'
import {vaznostSpomenika} from './utils/vaznost.js'

document.documentElement.lang = jezik

const najblizi = new Najblizi()
const ruta = new Ruta()
$('dugme-legenda').after(ruta, najblizi)
const detalji = document.body.appendChild(new Detalji())
const slajder = new Slajder([])
$('#slajder-okvir').appendChild(slajder)
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

// link za deljenje (#id) otvara mapu na tom spomeniku; vraca da li je spomenik nadjen
const otvoriIzLinka = stavke => {
  const id = decodeURIComponent(location.hash.slice(1))
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

mapa.on('moveend', osveziSlajder)

const render = (stavke, suzeno) => {
  filtriraneStavke = stavke
  postaviMarkere(stavke.map(({marker}) => marker), suzeno)
  osveziSlajder()
  najblizi.postavi(stavke)
}

/* INIT */

// rad bez signala
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js')

const ucitaj = putanja => fetch(putanja).then(res => res.json())

// prvo stizu spomenici vidljivi na pocetnim zumovima, da se mapa nacrta odmah, a ostali posle (alati/razdeli.mjs);
// priblizni su svi u drugom delu, pa im se pomaci racunaju zajedno
const ostalo = ucitaj('data/mapa-ostalo.json')
Promise.all([ucitaj('data/mapa-prvo.json'), ucitaj('data/autori.json'), ucitaj('data/posvete.json'), ucitaj('data/ture.json')])
  .then(([spomenici, autori, posvete, ture]) => {
    detalji.postaviAutore(autori)
    detalji.postaviPosvete(posvete)
    const prve = spomenici.map(spomenik => praviStavku(spomenik))
    ruta.postavi(prve, ture)
    const pretraga = document.body.appendChild(new Pretraga(prve, render))
    const otvoren = otvoriIzLinka(prve)
    ostalo.then(spomenici => {
      const pomaci = pomaciPribliznih(spomenici)
      const nove = spomenici.map(spomenik => praviStavku(spomenik, pomaci.get(spomenik)))
      ruta.postavi([...prve, ...nove], ture)
      pretraga.dodaj(nove)
      if (!otvoren) otvoriIzLinka(nove)
      document.documentElement.dataset.podaci = 'svi'
    })
  })
