// @ts-check
import {mapa} from '../klase/mapa.js'
import {t} from '../utils/jezik.js'

const boja = '#1a73e8'

class Lokator extends HTMLElement {
  constructor() {
    super()
    this.oznaka = L.circleMarker([0, 0], {radius: 8, color: '#fff', weight: 2, fillColor: boja, fillOpacity: 1, pane: 'korisnik'})
    this.preciznost = L.circle([0, 0], {radius: 0, color: boja, weight: 1, fillOpacity: 0.1, interactive: false, pane: 'korisnik'})
    this.addEventListener('click', this.locirajMe)
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        #lokator {
          display: block;
          padding: 6px;
          position: static;
        }
      </style>
      <button class="dugme-ikonica" title="${t('locirajMe')}" aria-label="${t('locirajMe')}"><img src="slike/ui/lokator.svg" width="32" class="ikonica" id="lokator" alt=""></button>
    `
  }

  locirajMe() {
    if (!navigator.geolocation) return alert(t('lokacijaNepodrzana'))

    this.trebaCentrirati = true
    if (this.pozicija) return this.centriraj()
    if (this.pracenje !== undefined) return

    this.pracenje = navigator.geolocation.watchPosition(
      polozaj => this.osvezi(polozaj),
      () => this.prekini(),
      {enableHighAccuracy: true}
    )
  }

  osvezi({coords}) {
    this.pozicija = L.latLng(coords.latitude, coords.longitude)
    this.oznaka.setLatLng(this.pozicija).addTo(mapa)
    this.preciznost.setLatLng(this.pozicija).setRadius(coords.accuracy).addTo(mapa)
    mapa.fire('pozicija', {latlng: this.pozicija})
    if (this.trebaCentrirati) this.centriraj()
  }

  prekini() {
    if (this.pozicija) return
    navigator.geolocation.clearWatch(this.pracenje)
    this.pracenje = undefined
    alert(t('lokacijaNedostupna'))
  }

  centriraj() {
    this.trebaCentrirati = false
    if (!L.latLngBounds(mapa.options.maxBounds).contains(this.pozicija))
      return alert(t('vanMape'))
    mapa.panTo(this.pozicija)
  }
}

customElements.define('dugme-lokator', Lokator)
