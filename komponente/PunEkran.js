// @ts-check
import {t} from '../utils/jezik.js'
class PunEkran extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', this.obrniPunEkran)
  }

  connectedCallback() {
    this.hidden = !document.fullscreenEnabled // npr. iPhone
    this.innerHTML = `
      <style>
        #ikonica {
          top: calc(10px + var(--vrh));
          left: 10px;
          border-radius: 8px;
          padding: 6px;
        }
      </style>
      <button class="dugme-ikonica" title="${t('punEkran')}" aria-label="${t('punEkran')}"><img src="slike/ui/punekran.svg" class="ikonica" id="ikonica" width="32" alt=""></button>
    `
  }

  obrniPunEkran() {
    if (!document.fullscreenElement) document.body.requestFullscreen()
    else document.exitFullscreen()
  }
}

customElements.define('dugme-pun-ekran', PunEkran)
