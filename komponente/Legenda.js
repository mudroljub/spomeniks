// @ts-check
import {mapa} from '../klase/mapa.js'
import {t} from '../utils/jezik.js'
import {izgledMarkera, senka, pribliznaIkonica} from '../utils/ikonice.js'
import {nivoiVaznosti} from '../utils/vaznost.js'

const boja = '#822323'

const style = document.createElement('style')
style.textContent = `
  :host {
    font: 16px system-ui, sans-serif;
  }

  [hidden] {
    display: none !important;
  }

  #dugme {
    background: white;
    border: none;
    border-radius: 22px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    cursor: pointer;
    font: inherit;
    min-height: 44px;
    padding: 0 16px;
  }

  /* na telefonu panel dolazi odozdo, kao U blizini i Trenutna ruta */
  #panel {
    background: white;
    border-radius: 12px 12px 0 0;
    bottom: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
    left: 0;
    max-height: 65%;
    overflow-y: auto;
    padding-bottom: var(--dno);
    position: fixed;
    right: 0;
    z-index: 1000;
  }

  /* na sirem ekranu stoji levo, na mestu svog dugmeta, koje se tada skriva */
  @media (min-width: 600px) {
    #panel {
      border-radius: 12px;
      bottom: calc(var(--visina-slajdera) + var(--dno) + 2px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
      left: 10px;
      max-height: calc(100% - var(--visina-slajdera) - var(--dno) - 130px);
      right: auto;
      width: min(640px, calc(100% - 20px));
    }
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
    cursor: pointer;
    font-size: 24px;
    height: 44px;
    width: 44px;
  }

  .sadrzaj {
    padding: 0 16px 16px;
  }

  h3 {
    color: #666;
    font-size: 13px;
    font-weight: normal;
    letter-spacing: 0.04em;
    margin: 14px 0 8px;
    text-transform: uppercase;
  }

  /* sire nego vise: vrste u vise kolona, a manje grupe jedna pored druge */
  .stavke,
  .male-grupe {
    display: grid;
    gap: 8px 12px;
    grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
  }

  .napomena {
    letter-spacing: normal;
    text-transform: none;
  }

  .male-grupe .stavke {
    grid-template-columns: 1fr;
  }

  .stavka {
    align-items: end;
    color: #444;
    display: flex;
    font-size: 15px;
    gap: 10px;
  }

  .ikona {
    display: flex;
    flex: none;
    justify-content: center;
    width: 20px;
  }

  /* na telefonu tri uze kolone, da panel bude nizak */
  @media (max-width: 599px) {
    .stavke,
    .male-grupe {
      gap: 6px 8px;
      grid-template-columns: repeat(3, 1fr);
    }

    .stavka {
      font-size: 13px;
      gap: 6px;
    }

    h3 {
      margin-top: 10px;
    }
  }

  button:focus-visible {
    outline: 2px solid ${boja};
    outline-offset: 2px;
  }
`

// senka iz slike ne zauzima mesto, da znakovi ostanu poravnati
const stavka = ({slika, sirina, visina}, visinaIkone, naziv, stil = '', priblizno = false) => {
  const px = vrednost => Math.round(vrednost * visinaIkone / visina)
  const margine = `margin: 0 -${px(senka.desno)}px -${px(senka.dole)}px -${px(senka.levo)}px`
  return `
  <div class="stavka">
    <span class="ikona">${priblizno
      ? `<span style="position: relative; ${margine}">${pribliznaIkonica({slika, sirina, visina}, visinaIkone / visina)}</span>`
      : `<img src="${slika}" width="${px(sirina + senka.levo + senka.desno)}" height="${px(visina + senka.dole)}" alt="" style="${margine}${stil ? `; ${stil}` : ''}">`}</span>
    <span>${naziv}</span>
  </div>`
}

// istaknuti i obican spomenik razlikuju se samo velicinom znaka, a bista je malo manja od spomenika, kao na mapi;
// muzej i ploca su siroki, pa bi na visini ostalih znakova izgledali preveliki
const visineIkona = {istaknut: 44, statua: 33, bista: 28, 'spomen-obelezje': 24, 'spomen-groblje': 29, muzej: 26, 'spomen-ploca': 17}

const vrsta = type => stavka(izgledMarkera({vrsta: type === 'istaknut' ? 'spomenik' : type}), visineIkona[type] || 34, t(type === 'istaknut' ? type : type + 'Jednina'))

const vrste = nivoiVaznosti.map(vrsta).join('')

const grupa = ([naslov, stavke]) => `<div><h3>${naslov}</h3><div class="stavke">${stavke}</div></div>`

const obelisk = stanje => izgledMarkera({vrsta: 'spomenik', stanje})

const maleGrupe = [
  [t('grupaPosetaJednina'), stavka(obelisk(), 34, t('lista'), 'filter: drop-shadow(0 0 3px #f2b705) drop-shadow(0 0 2px #f2b705)')
    + stavka(obelisk(), 34, t('posetio'), 'opacity: 0.5')],
  [t('grupaStanje'), stavka(obelisk('rusevine'), 34, t('ruineJednina')) + stavka(obelisk('uklonjen'), 34, t('nestao'))
    + stavka(obelisk(), 34, t('priblizno'), '', true)],
]

// legenda je u donjem levom uglu mape i otvara se samo na zahtev, da ne zaklanja spomenike
export default class Legenda extends HTMLElement {
  constructor() {
    super()
    this.dugme = document.createElement('button')
    this.dugme.id = 'dugme'
    this.dugme.textContent = t('legenda')
    this.dugme.addEventListener('click', () => this.prikazi(this.panel.hidden))

    this.panel = document.createElement('section')
    this.panel.id = 'panel'
    this.panel.hidden = true
    this.panel.innerHTML = `
      <header><span>${t('legenda')}</span><button title="${t('zatvori')}">×</button></header>
      <div class="sadrzaj">
        ${grupa([`${t('grupaVrste')} <span class="napomena">(${t('viseZumom')})</span>`, vrste])}
        <div class="male-grupe">${maleGrupe.map(grupa).join('')}</div>
      </div>
    `
    this.panel.querySelector('header button').addEventListener('click', () => this.prikazi(false))

    this.attachShadow({mode: 'open'})
    this.shadowRoot.append(style, this.dugme, this.panel)

    mapa.on('click', () => this.prikazi(false))
    mapa.on('izbor', ({marker}) => marker && this.prikazi(false))
  }

  prikazi(otvoren) {
    this.panel.hidden = !otvoren
    this.dugme.hidden = otvoren
  }
}

customElements.define('dugme-legenda', Legenda)
