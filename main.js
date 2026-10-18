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
import './komponente/Lokator.js'
import {$} from './utils/helpers.js'
import {jezik} from './utils/jezik.js'
import {mapa, postaviMarkere} from './klase/mapa.js'

document.documentElement.lang = jezik

const najblizi = new Najblizi()
const ruta = new Ruta()
$('dugme-legenda').after(ruta, najblizi)
const detalji = document.body.appendChild(new Detalji())

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

// link za deljenje (#id) otvara mapu na tom spomeniku
const otvoriIzLinka = stavke => {
  const id = decodeURIComponent(location.hash.slice(1))
  const stavka = id && stavke.find(({spomenik}) => spomenik.id === id)
  if (!stavka) return
  mapa.setView(stavka.marker.dajPoziciju(), 11, {animate: false})
  stavka.marker.otvoriProzor()
}

const render = (stavke, suzeno) => {
  $('#slajder-okvir').innerHTML = ''
  postaviMarkere(stavke.map(({marker}) => marker), suzeno)
  const slike = stavke.map(({dajSliku}) => dajSliku).filter(Boolean)
  $('#slajder-okvir').appendChild(new Slajder(slike))
  najblizi.postavi(stavke)
}

/* INIT */

// rad bez signala
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js')

const ucitaj = putanja => fetch(putanja).then(res => res.json())

Promise.all([ucitaj('data/spomeniks.json'), ucitaj('data/autori.json'), ucitaj('data/posvete.json'), ucitaj('data/ture.json')])
  .then(([spomenici, autori, posvete, ture]) => {
    detalji.postaviAutore(autori)
    detalji.postaviPosvete(posvete)
    const pomaci = pomaciPribliznih(spomenici)
    const stavke = spomenici.map(spomenik => praviStavku(spomenik, pomaci.get(spomenik)))
    ruta.postavi(stavke, ture)
    document.body.appendChild(new Pretraga(stavke, render))
    otvoriIzLinka(stavke)
  })
