// @ts-check
import {dajOznaku, promene} from '../utils/oznake.js'
import Raspored from '../utils/raspored.js'
import {vaznostSpomenika} from '../utils/vaznost.js'

const konfigMape = {
  zoom: 7,
  minZoom: 6,
  center: [44.341667, 17.269444],
  scrollWheelZoom: false,
  maxBounds: [
    [39, 10],
    [49, 26]
  ],
  maxBoundsViscosity: 1.0
}

export const mapa = L.map('mapa', konfigMape)

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

mapa.createPane('korisnik').style.zIndex = 650

const sloj = L.layerGroup().addTo(mapa)
let markeri = []
let suzeno = false
let izabran = null

const ukloni = marker => marker.slojevi.forEach(s => sloj.removeLayer(s))

const uvekVidljiv = marker => marker === izabran || Boolean(dajOznaku(marker.spomen.id))

const vidljiv = marker => suzeno || mapa.getZoom() >= marker.najmanjiZum || uvekVidljiv(marker)

const najviseSuzenih = 400

const najvazniji = marker => uvekVidljiv(marker) ? -1 : vaznostSpomenika(marker.spomen)

const osvezi = () => {
  const granice = mapa.getBounds().pad(0.15)
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
  naEkranu.forEach(marker => marker.spomen.priblizno || raspored.dodaj(marker.okvirNaEkranu(zum, suzeno)))
  naEkranu.forEach(marker => {
    const pomak = marker.spomen.priblizno ? raspored.pomeri(marker.okvirNaEkranu(zum, suzeno)) : [0, 0]
    marker.osvezi(zum, izabran, pomak, suzeno)
    sloj.addLayer(marker.element)
  })
}

mapa.on('moveend', osvezi)
promene.addEventListener('promena', osvezi)

mapa.on('izbor', ({marker}) => {
  izabran = marker
  osvezi()
})

export const postaviMarkere = (noviMarkeri, jeSuzeno) => {
  const ostaju = new Set(noviMarkeri)
  markeri.forEach(marker => ostaju.has(marker) || ukloni(marker))
  markeri = noviMarkeri
  suzeno = jeSuzeno
  osvezi()
}

if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  const prikaz = L.DomUtil.create('div', '', mapa.zoomControl.getContainer())
  prikaz.style.cssText = 'position: absolute; left: calc(100% + 4px); top: 50%; transform: translateY(-50%); background: #fff; padding: 1px 5px; border-radius: 4px; font: bold 12px sans-serif'
  const pisi = () => { prikaz.textContent = String(mapa.getZoom()) }
  mapa.on('zoomend', pisi)
  pisi()
}

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 12,
}).addTo(mapa)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  minZoom: 13,
  maxZoom: 18,
  className: 'izbliza',
  referrerPolicy: 'strict-origin-when-cross-origin',
}).addTo(mapa)
