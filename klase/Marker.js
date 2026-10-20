// @ts-check
import {mapa} from './mapa.js'
import {dajOznaku} from '../utils/oznake.js'
import {izgledMarkera, senka, velicinaSlike, ikonicaSaOznakama} from '../utils/ikonice.js'
import {nazivSpomenika, escapeHtml} from '../utils/helpers.js'
import {najmanjiZum, slojSpomenika} from '../utils/vaznost.js'

const razmeraZuma = {6: 0.5, 7: 0.55, 8: 0.65, 9: 0.8}
const razmeraVrste = {'spomen-park': 1.25, 'spomen-groblje': 1.25, bista: 0.8, 'spomen-obelezje': 0.6, 'spomen-ploca': 0.6}

const ikonice = {}
const dajIkonicu = ({slika, sirina, visina}, razmera, klasa, [dx, dy] = [0, 0], {priblizno = false, oznaka = null} = {}) => {
  const px = vrednost => Math.round(vrednost * razmera)
  const opcije = {
    iconUrl: slika,
    iconSize: velicinaSlike({sirina, visina}, razmera),
    iconAnchor: [px(senka.levo + sirina / 2 - dx), px(visina - dy)],
    tooltipAnchor: [px(dx), px(dy - visina)],
    className: `${klasa}${priblizno ? ' priblizna-lokacija' : ''}`,
  }
  return ikonice[[slika, razmera, klasa, dx, dy, priblizno, oznaka].join()] ??= priblizno || oznaka
    ? L.divIcon({...opcije, html: ikonicaSaOznakama({slika, sirina, visina}, razmera, {priblizno, oznaka})})
    : L.icon(opcije)
}

const imaMis = matchMedia('(hover: hover)').matches

const razmakKruga = 14
const rasporediUKrug = (grupa, pomaci, razmak = razmakKruga, uKrugu = 4) => grupa.length > 1 && grupa.forEach((s, i) => {
  const ugao = 2 * Math.PI * i / grupa.length - Math.PI / 2
  const poluprecnik = razmak * Math.max(1, grupa.length / uKrugu)
  pomaci.set(s, [Math.round(poluprecnik * Math.cos(ugao)), Math.round(poluprecnik * Math.sin(ugao))])
})

/** @param {import('../data/tipovi').Spomenik[]} spomenici */
export const pomaciPribliznih = spomenici => {
  const grupe = new Map()
  spomenici.filter(s => s.priblizno).forEach(s => {
    const kljuc = `${s.koordinate.lat},${s.koordinate.lng}`
    grupe.set(kljuc, [...grupe.get(kljuc) || [], s])
  })
  const pomaci = new Map()
  grupe.forEach(grupa => rasporediUKrug(grupa, pomaci))
  return pomaci
}

const najbliziMetara = 30
const razmakBliskih = 24 // oko širine ikonice, da se tačni spomenici ne preklapaju
const metaraPoStepenu = 111320
/**
 * Tačni spomenici na istoj ili skoro istoj tački (npr. delovi jednog kompleksa) razmiču se u krug, da se ikonice ne preklope.
 * @param {import('../data/tipovi').Spomenik[]} spomenici
 */
export const pomaciBliskih = spomenici => {
  const tacni = spomenici.filter(s => !s.priblizno)
  const korak = najbliziMetara / metaraPoStepenu
  const celija = (lat, lng) => `${Math.floor(lat / korak)},${Math.floor(lng / korak)}`
  const mreza = new Map()
  tacni.forEach((s, i) => {
    const kljuc = celija(s.koordinate.lat, s.koordinate.lng)
    mreza.set(kljuc, [...mreza.get(kljuc) || [], i])
  })
  const roditelj = tacni.map((_, i) => i)
  const koren = i => roditelj[i] === i ? i : (roditelj[i] = koren(roditelj[i]))
  tacni.forEach((s, i) => {
    const {lat, lng} = s.koordinate
    const [y, x] = celija(lat, lng).split(',').map(Number)
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      (mreza.get(`${y + dy},${x + dx}`) || []).forEach(j => {
        if (j <= i) return
        const drugi = tacni[j].koordinate
        const sever = (drugi.lat - lat) * metaraPoStepenu
        const istok = (drugi.lng - lng) * metaraPoStepenu * Math.cos(lat * Math.PI / 180)
        if (Math.hypot(sever, istok) <= najbliziMetara) roditelj[koren(j)] = koren(i)
      })
    }
  })
  const grupe = new Map()
  tacni.forEach((s, i) => grupe.set(koren(i), [...grupe.get(koren(i)) || [], s]))
  const pomaci = new Map()
  grupe.forEach(grupa => rasporediUKrug(grupa, pomaci, razmakBliskih, 3))
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
   * @param {[number, number]} [pomak]
   */
  constructor(spomen, pomak) {
    this.spomen = spomen
    this.pomak = pomak
    this.najmanjiZum = najmanjiZum(spomen)
    this.razmera = spomen.istaknut && spomen.vrsta === 'spomenik' ? 1.25 : razmeraVrste[spomen.vrsta] || 1
    this.izgled = izgledMarkera(spomen)
    this.pozicija = L.latLng(spomen.koordinate.lat, spomen.koordinate.lng)
  }

  get element() {
    if (!this.oznakaNaMapi) {
      this.oznakaNaMapi = L
        .marker(this.pozicija, {
          icon: dajIkonicu(this.izgled, 1, '', this.pomak, {priblizno: this.spomen.priblizno}),
          zIndexOffset: slojSpomenika(this.spomen),
        })
        .on('click', () => this.otvoriProzor())
      if (imaMis) this.oznakaNaMapi.bindTooltip(() => opis(this.spomen), {direction: 'top', className: 'naziv-spomenika'})
    }
    return this.oznakaNaMapi
  }

  get slojevi() {
    return this.oznakaNaMapi ? [this.oznakaNaMapi] : []
  }

  // u suženoj pretrazi ikonice se ne smanjuju po zumu i vrsti, da se svaki rezultat vidi
  razmeraNa(zum, suzeno = false) {
    const razmera = (razmeraZuma[zum] || 1) * this.razmera
    return suzeno ? Math.max(razmera, 1) : razmera
  }

  osvezi(zum, izabran, pomakSudara = [0, 0], suzeno = false) {
    const razmera = this.razmeraNa(zum, suzeno)
    const oznaka = dajOznaku(this.spomen.id)
    const klasa = izabran === this ? 'izabran' : ''
    const pomak = /** @type {[number, number]} */ ([(this.pomak?.[0] || 0) + pomakSudara[0] / razmera, (this.pomak?.[1] || 0) + pomakSudara[1] / razmera])
    const ikonica = dajIkonicu(this.izgled, razmera, klasa, pomak, {priblizno: this.spomen.priblizno, oznaka})
    if (ikonica !== this.element.options.icon) this.element.setIcon(ikonica)
  }

  okvirNaEkranu(zum, suzeno = false) {
    const razmera = this.razmeraNa(zum, suzeno)
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
    return this.pozicija
  }

  otvoriProzor() {
    mapa.fire('izbor', {marker: this})
  }
}
