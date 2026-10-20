// @ts-check
import {malaSlika, nazivSpomenika} from '../utils/helpers.js'
import {t} from '../utils/jezik.js'

export default class Slika extends HTMLElement {

  /** @param {import('../data/tipovi').Spomenik} spomen */
  constructor(spomen, marker) {
    super()
    this.mesto = spomen.mesto
    this.spomen = spomen
    this.url = malaSlika(spomen.slika)
    this.slika = document.createElement('img')
    // velicina pre ucitavanja, da traka zna koliko slika staje i ne trazi visak
    this.slika.width = Math.round(116 * spomen.slikaOdnos)
    this.slika.height = 116
    this.slika.alt = this.slika.title = t('slikaSpomenika', spomen.mesto)
    this.slika.ondragstart = () => false // sprecava vucenje slike
    this.slika.onerror = () => this.style.display = 'none'
    this.naziv = document.createElement('small')
    this.naziv.textContent = this.naziv.title = spomen.mesto

    this.addEventListener('click', () => marker.otvoriProzor())
  }

  connectedCallback() {
    this.slika.src = this.url // da ne ucitava pre nego sto se doda u dom
    const dugme = document.createElement('button')
    dugme.append(this.slika, this.naziv)
    this.replaceChildren(dugme)
  }

  prikaziNatpis(zum) {
    // naziv se cita pri prikazu, jer engleski prevod moze stici posle pravljenja trake
    this.naziv.textContent = this.naziv.title = zum >= 12 ? nazivSpomenika(this.spomen) || this.mesto : this.mesto
  }
}

customElements.define('nav-slika', Slika)
