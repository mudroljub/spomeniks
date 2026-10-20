// @ts-check
import {mapa} from './mapa.js'
import {dajOznaku} from '../utils/oznake.js'
import {izgledMarkera, senka, ikonicaSaOznakama} from '../utils/ikonice.js'
import {nazivSpomenika, escapeHtml} from '../utils/helpers.js'
import {najmanjiZum, slojSpomenika} from '../utils/vaznost.js'

const razmeraZuma = {6: 0.5, 7: 0.55, 8: 0.65, 9: 0.8} // ostali zumovi pun obelisk
// bista je umetnicko delo kao spomenik, samo je malo manja
const razmeraVrste = {'spomen-park': 1.25, 'spomen-groblje': 1.25, bista: 0.8, 'spomen-obelezje': 0.6, 'spomen-ploca': 0.6}

// ruine i uklonjeni imaju sliku iste velicine, da se razlikuju po obliku, a ne samo po boji:
// prelomljen obelisk i isprekidan obris onoga cega vise nema
const ikonice = {}
const dajIkonicu = ({slika, sirina, visina}, razmera, klasa, [dx, dy] = [0, 0], {priblizno = false, oznaka = null} = {}) => {
  const px = vrednost => Math.round(vrednost * razmera)
  const opcije = {
    iconUrl: slika,
    iconSize: [px(sirina + senka.levo + senka.desno), px(visina + senka.dole)],
    iconAnchor: [px(senka.levo + sirina / 2 - dx), px(visina - dy)],
    tooltipAnchor: [px(dx), px(dy - visina)],
    className: `${klasa}${priblizno ? ' priblizna-lokacija' : ''}`,
  }
  return ikonice[[slika, razmera, klasa, dx, dy, priblizno, oznaka].join()] ??= priblizno || oznaka
    ? L.divIcon({...opcije, html: ikonicaSaOznakama({slika, sirina, visina}, razmera, {priblizno, oznaka})})
    : L.icon(opcije)
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
    this.najmanjiZum = najmanjiZum(spomen)
    this.razmera = spomen.istaknut ? 1.25 : razmeraVrste[spomen.vrsta] || 1
    this.izgled = izgledMarkera(spomen)
    this.element = L
      .marker([spomen.koordinate.lat, spomen.koordinate.lng], {
        icon: dajIkonicu(this.izgled, 1, '', pomak, {priblizno: spomen.priblizno}),
        zIndexOffset: slojSpomenika(spomen),
      })
      .on('click', () => this.otvoriProzor())
    this.slojevi = [this.element]
    if (imaMis) this.element.bindTooltip(() => opis(spomen), {direction: 'top', className: 'naziv-spomenika'})
  }

  // velicina zavisi od zuma, a izgled od oznaka
  osvezi(zum, izabran, pomakSudara = [0, 0]) {
    const razmera = (razmeraZuma[zum] || 1) * this.razmera
    const oznaka = dajOznaku(this.spomen.id)
    const klasa = [
      izabran === this && 'izabran',
    ].filter(Boolean).join(' ')
    const pomak = /** @type {[number, number]} */ ([(this.pomak?.[0] || 0) + pomakSudara[0] / razmera, (this.pomak?.[1] || 0) + pomakSudara[1] / razmera])
    const ikonica = dajIkonicu(this.izgled, razmera, klasa, pomak, {priblizno: this.spomen.priblizno, oznaka})
    // nova ikonica pravi novu sliku u DOM-u, pa samo kad se promeni
    if (ikonica !== this.element.options.icon) this.element.setIcon(ikonica)
  }

  okvirNaEkranu(zum) {
    const razmera = (razmeraZuma[zum] || 1) * this.razmera
    const {x, y} = mapa.latLngToContainerPoint(this.dajPoziciju())
    const dx = (this.pomak?.[0] || 0) * razmera
    const dy = (this.pomak?.[1] || 0) * razmera
    const sirina = this.izgled.sirina * razmera
    return {
      levo: x + dx - sirina / 2 - senka.levo * razmera - 4,
      desno: x + dx + sirina / 2 + senka.desno * razmera + 4,
      gore: y + dy - this.izgled.visina * razmera - 4,
      dole: y + dy + Math.max(senka.dole * razmera, this.spomen.priblizno ? 14 : 0) + 4,
    }
  }

  dajPoziciju() {
    return this.element.getLatLng()
  }

  otvoriProzor() {
    mapa.fire('izbor', {marker: this})
  }
}
