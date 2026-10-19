// @ts-check
import {mapa} from '../klase/mapa.js'
import {naziviStanja, nazivSpomenika} from '../utils/helpers.js'
import {t} from '../utils/jezik.js'

const brojNajblizih = 10

// razdaljina je vazdusna, pa je priblizna
const formatirajRazdaljinu = metara => metara < 1000
  ? `~${Math.round(metara / 10) * 10} m`
  : `~${Math.round(metara / 1000)} km`

const style = document.createElement('style')
style.textContent = `
  :host {
    font: 16px system-ui, sans-serif;
  }

  #dugme {
    background: white;
    border: none;
    border-radius: 22px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    font: inherit;
    margin-right: 8px;
    min-height: 44px;
    padding: 0 16px;
  }

  #panel {
    background: white;
    border-radius: 12px 12px 0 0;
    bottom: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
    left: 0;
    max-height: 50vh;
    overflow-y: auto;
    padding-bottom: var(--dno);
    position: fixed;
    right: 0;
    z-index: 1000;
  }

  header {
    align-items: center;
    background: white;
    border-bottom: 1px solid #ddd;
    display: flex;
    font-weight: bold;
    justify-content: space-between;
    padding-left: 16px;
    position: sticky;
    top: 0;
  }

  header button {
    background: none;
    border: none;
    font-size: 24px;
    height: 44px;
    width: 44px;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    border-bottom: 1px solid #eee;
  }

  li button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: 12px;
    padding: 12px 16px;
    text-align: left;
    width: 100%;
  }

  .km {
    flex: none;
    font-weight: bold;
    min-width: 64px;
  }

  header small {
    color: #666;
    font-weight: normal;
  }

  .opis {
    color: #666;
    display: block;
    font-size: 14px;
  }
`

export default class Najblizi extends HTMLElement {
  constructor() {
    super()
    this.stavke = []

    this.dugme = document.createElement('button')
    this.dugme.id = 'dugme'
    this.dugme.textContent = t('uBlizini')
    this.dugme.hidden = true
    this.dugme.addEventListener('click', () => {
      mapa.fire('izbor', {marker: null})
      this.popuni()
      this.panel.hidden = false
    })

    this.panel = document.createElement('section')
    this.panel.id = 'panel'
    this.panel.hidden = true
    this.panel.innerHTML = `<header><span>${t('uBlizini')} <small>${t('vazdusnom')}</small></span><button title="${t('zatvori')}">×</button></header>`
    this.panel.querySelector('button').addEventListener('click', () => this.panel.hidden = true)
    this.lista = document.createElement('ol')
    this.panel.appendChild(this.lista)

    this.attachShadow({mode: 'open'})
    this.shadowRoot.append(style, this.dugme, this.panel)

    mapa.on('pozicija', ({latlng}) => {
      this.pozicija = latlng
      this.prikazi()
    })
  }

  postavi(stavke) {
    this.stavke = stavke
    this.prikazi()
  }

  // spisak se pravi tek kad je otvoren, a ne pri svakom GPS signalu i filtriranju
  prikazi() {
    if (!this.pozicija) return
    this.dugme.hidden = false
    if (!this.panel.hidden) this.popuni()
  }

  // cuva se samo prvih nekoliko, umesto da se poreda cela baza
  popuni() {
    const najblize = []
    for (const stavka of this.stavke) {
      const metara = mapa.distance(this.pozicija, stavka.marker.dajPoziciju())
      if (najblize.length === brojNajblizih && metara >= najblize[brojNajblizih - 1].metara) continue
      const mesto = najblize.findIndex(n => n.metara > metara)
      najblize.splice(mesto < 0 ? najblize.length : mesto, 0, {stavka, metara})
      najblize.length = Math.min(najblize.length, brojNajblizih)
    }
    this.lista.replaceChildren(...najblize.map(({stavka, metara}) => this.praviRed(stavka, metara)))
  }

  praviRed(stavka, metara) {
    const {mesto, stanje} = stavka.spomenik
    const red = document.createElement('li')
    red.innerHTML = '<button><span class="km"></span><span><span class="naziv"></span><span class="opis"></span></span></button>'
    red.querySelector('.km').textContent = formatirajRazdaljinu(metara)
    const naziv = nazivSpomenika(stavka.spomenik)
    red.querySelector('.naziv').textContent = naziv || mesto
    red.querySelector('.opis').textContent = [naziv && mesto, naziviStanja[stanje]].filter(Boolean).join(' · ')
    red.addEventListener('click', () => {
      this.panel.hidden = true
      stavka.marker.otvoriProzor()
    })
    return red
  }
}

customElements.define('lista-najblizih', Najblizi)
