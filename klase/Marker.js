// @ts-check
import {mapa} from './mapa.js'
import {dajOznaku} from '../utils/oznake.js'
import {izgledMarkera, senka} from '../utils/ikonice.js'
import {nazivSpomenika, escapeHtml} from '../utils/helpers.js'

const razmeraZuma = {6: 0.5, 7: 0.55, 8: 0.65, 9: 0.8} // ostali zumovi pun obelisk
// najmanji zum na kome se vrsta vidi: svaki korak zuma dodaje nove vrste, od najvaznijih
const zumVrste = {istaknut: 0, kompleks: 8, muzej: 8, groblje: 9, spomenik: 9, statua: 10, bista: 10, lokalni: 11, ploca: 12}
// bista je umetnicko delo kao spomenik, samo je malo manja
const razmeraVrste = {istaknut: 1.25, kompleks: 1.25, groblje: 1.25, bista: 0.8, lokalni: 0.6, ploca: 0.6}

// ruine i uklonjeni imaju sliku iste velicine, da se razlikuju po obliku, a ne samo po boji:
// prelomljen obelisk i isprekidan obris onoga cega vise nema
const ikonice = {}
const dajIkonicu = ({slika, sirina, visina}, razmera, klasa, [dx, dy] = [0, 0]) => {
  const px = vrednost => Math.round(vrednost * razmera)
  return ikonice[[slika, razmera, klasa, dx, dy].join()] ??= L.icon({
    iconUrl: slika,
    iconSize: [px(sirina + senka.levo + senka.desno), px(visina + senka.dole)],
    iconAnchor: [px(senka.levo + sirina / 2 - dx), px(visina - dy)],
    tooltipAnchor: [0, -px(visina)],
    className: klasa,
  })
}

// na dodirnom ekranu nema prelaska misem, a dodir odmah otvara spomenik
const imaMis = matchMedia('(hover: hover)').matches

// vise pribliznih spomenika u istom selu deli istu tacku (centar sela), pa se razmicu u krug oko nje,
// da se svaki vidi i otvara; pomak je u pikselima pri punoj velicini, pa krug ostaje isti na svakom zumu
const razmakKruga = 14
/** @param {import('../data/tipovi').Spomenik[]} spomenici */
export const pomaciPribliznih = spomenici => {
  const grupe = new Map()
  spomenici.filter(s => s.priblizno).forEach(s => {
    const kljuc = `${s.koordinate.lat},${s.koordinate.lng}`
    grupe.set(kljuc, [...grupe.get(kljuc) || [], s])
  })
  const pomaci = new Map()
  grupe.forEach(grupa => grupa.length > 1 && grupa.forEach((s, i) => {
    const ugao = 2 * Math.PI * i / grupa.length - Math.PI / 2
    const poluprecnik = razmakKruga * Math.max(1, grupa.length / 4)
    pomaci.set(s, [Math.round(poluprecnik * Math.cos(ugao)), Math.round(poluprecnik * Math.sin(ugao))])
  }))
  return pomaci
}

const opis = spomen => {
  const naziv = nazivSpomenika(spomen)
  const mesto = `<b>${escapeHtml(spomen.mesto)}</b>`
  return naziv ? `${mesto}<br>${escapeHtml(naziv)}` : mesto
}

export default class Marker {

  /**
   * @param {import('../data/tipovi').Spomenik} spomen
   * @param {[number, number]} [pomak] razmak od zajednicke priblizne tacke, iz pomaciPribliznih
   */
  constructor(spomen, pomak) {
    this.spomen = spomen
    this.pomak = pomak
    this.najmanjiZum = zumVrste[spomen.vrsta || 'spomenik']
    this.razmera = razmeraVrste[spomen.vrsta] || 1
    this.izgled = izgledMarkera(spomen)
    this.element = L
      .marker([spomen.koordinate.lat, spomen.koordinate.lng], {icon: dajIkonicu(this.izgled, 1, '', pomak), zIndexOffset: (12 - this.najmanjiZum) * 1000})
      .on('click', () => this.otvoriProzor())
    // priblizna tacka (npr. centar sela) ima isprekidan krug: spomenik je negde u blizini;
    // grupa razmaknutih ima jedan krug oko svih, koji crta prvi (gornji) u grupi
    const poluprecnik = 18 + Math.hypot(...pomak || [0, 0])
    this.krug = spomen.priblizno && (!pomak || (pomak[0] === 0 && pomak[1] < 0))
      ? L.circleMarker([spomen.koordinate.lat, spomen.koordinate.lng], {radius: poluprecnik, color: '#822323', weight: 1.5, dashArray: '4 4', fill: false, interactive: false})
      : null
    this.slojevi = [this.krug, this.element].filter(Boolean)
    if (imaMis) this.element.bindTooltip(() => opis(spomen), {direction: 'top', className: 'naziv-spomenika'})
  }

  // velicina zavisi od zuma, a izgled od oznaka
  osvezi(zum, izabran) {
    const razmera = (razmeraZuma[zum] || 1) * this.razmera
    const oznaka = dajOznaku(this.spomen.id)
    const klasa = [
      izabran === this && 'izabran',
      oznaka === 'posetio' && 'posecen',
      oznaka === 'lista' && 'na-listi',
    ].filter(Boolean).join(' ')
    const ikonica = dajIkonicu(this.izgled, razmera, klasa, this.pomak)
    // nova ikonica pravi novu sliku u DOM-u, pa samo kad se promeni
    if (ikonica !== this.element.options.icon) this.element.setIcon(ikonica)
  }

  dajPoziciju() {
    return this.element.getLatLng()
  }

  otvoriProzor() {
    mapa.fire('izbor', {marker: this})
  }
}
