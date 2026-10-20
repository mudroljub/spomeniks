// @ts-check
import {dajOznaku, promene} from '../utils/oznake.js'
import Raspored from '../utils/raspored.js'
import {vaznostSpomenika} from '../utils/vaznost.js'

const konfigMape = {
  zoom: 7, // pri otvaranju se vide samo istaknuti spomenici; isti zum je ZUM_ISTAKNUTIH u alati/zapis.py
  minZoom: 6,
  center: [44.341667, 17.269444],
  scrollWheelZoom: false,
  maxBounds: [
    [39, 10], // jug zapad
    [49, 26]  // sever istok
  ],
  maxBoundsViscosity: 1.0 // sprecava odskakanje
}

export const mapa = L.map('mapa', konfigMape) // singlton

// touchpad: dva prsta pomeraju mapu, a stipanje (wheel sa ctrlKey) zumira oko kursora
const pragZuma = 40
let zbirZuma = 0

mapa.getContainer().addEventListener('wheel', e => {
  e.preventDefault()
  const korak = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1
  if (!e.ctrlKey) return mapa.panBy([e.deltaX * korak, e.deltaY * korak], {animate: false})

  zbirZuma += e.deltaY * korak
  if (Math.abs(zbirZuma) < pragZuma) return
  const tacka = mapa.mouseEventToContainerPoint(e)
  mapa.setZoomAround(tacka, mapa.getZoom() + (zbirZuma < 0 ? 1 : -1))
  zbirZuma = 0
}, {passive: false})

// pozicija korisnika iznad markera, da je ne prekriju
mapa.createPane('korisnik').style.zIndex = 650

const sloj = L.layerGroup().addTo(mapa)
let markeri = []
let suzeno = false
let izabran = null

const ukloni = marker => marker.slojevi.forEach(s => sloj.removeLayer(s))

const uvekVidljiv = marker => marker === izabran || Boolean(dajOznaku(marker.spomen.id))

const vidljiv = marker => suzeno || mapa.getZoom() >= marker.najmanjiZum || uvekVidljiv(marker)

// pretraga jednog slova pogadja hiljade spomenika, pa na ekranu ostaju najvazniji, a ostali se pojave priblizavanjem
const najviseSuzenih = 400

const najvazniji = marker => uvekVidljiv(marker) ? -1 : vaznostSpomenika(marker.spomen)

// crtaju se samo obelisci na ekranu, sa pola ekrana rezerve za pomeranje, jer hiljade slika gusi slab telefon
// izdaleka su obelisci manji, da se manje preklapaju; ikonica pokazuje i oznake
const osvezi = () => {
  const granice = mapa.getBounds().pad(0.5)
  const zum = mapa.getZoom()
  const naEkranu = []
  markeri.forEach(marker => {
    if (!vidljiv(marker) || !granice.contains(marker.dajPoziciju())) return ukloni(marker)
    naEkranu.push(marker)
  })
  if (suzeno && naEkranu.length > najviseSuzenih) {
    naEkranu.sort((a, b) => najvazniji(a) - najvazniji(b))
    naEkranu.splice(najviseSuzenih).forEach(ukloni)
  }
  const raspored = new Raspored()
  naEkranu.forEach(marker => marker.spomen.priblizno || raspored.dodaj(marker.okvirNaEkranu(zum)))
  naEkranu.forEach(marker => {
    const pomak = marker.spomen.priblizno ? raspored.pomeri(marker.okvirNaEkranu(zum)) : [0, 0]
    marker.osvezi(zum, izabran, pomak)
    sloj.addLayer(marker.element)
  })
}

// moveend stize i posle zuma
mapa.on('moveend', osvezi)
promene.addEventListener('promena', osvezi)

mapa.on('izbor', ({marker}) => {
  izabran = marker
  osvezi()
})

// uklanjaju se samo oni kojih vise nema, da se zajednicki ne crtaju iznova
export const postaviMarkere = (noviMarkeri, jeSuzeno) => {
  const ostaju = new Set(noviMarkeri)
  markeri.forEach(marker => ostaju.has(marker) || ukloni(marker))
  markeri = noviMarkeri
  suzeno = jeSuzeno
  osvezi()
}

// pri radu na lokalnom serveru desno od dugmadi za zum pise trenutni zum; ne menja visinu dugmadi, ispod kojih je dugme jezika
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  const prikaz = L.DomUtil.create('div', '', mapa.zoomControl.getContainer())
  prikaz.style.cssText = 'position: absolute; left: calc(100% + 4px); top: 50%; transform: translateY(-50%); background: #fff; padding: 1px 5px; border-radius: 4px; font: bold 12px sans-serif'
  const pisi = () => { prikaz.textContent = String(mapa.getZoom()) }
  mapa.on('zoomend', pisi)
  pisi()
}

// spomenici default
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// })

// obična geografija
// L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// })

// prazna priroda
// L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.{ext}', {
// 	minZoom: 0,
// 	maxZoom: 18,
// 	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// 	ext: 'png'
// })
// granice i natpisi
// L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
// 	minZoom: 0,
// 	maxZoom: 18,
// 	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// 	ext: 'png'
// })

// stari atlas
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 12,
})

.addTo(mapa)

// izbliza detaljna mapa sa svim putevima, jer atlas ide samo do zuma 12
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  minZoom: 13,
  maxZoom: 18,
  className: 'izbliza',
  referrerPolicy: 'strict-origin-when-cross-origin', // OSM odbija plocice bez referer-a, a stranica ga inace ne salje
}).addTo(mapa)
