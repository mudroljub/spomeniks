// @ts-check
import Filteri from './Filteri.js'
import {mapa} from '../klase/mapa.js'
import {normalizuj, nazivSpomenika} from '../utils/helpers.js'
import {t, nazivDrzave} from '../utils/jezik.js'

const style = document.createElement('style')
style.textContent = `
  polje-pretraga {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    left: 60px;
    position: absolute;
    right: 10px;
    top: calc(10px + var(--vrh));
    z-index: 1;
  }

  polje-pretraga input {
    background: white;
    border: none;
    border-radius: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    flex: 1;
    font: 16px system-ui, sans-serif;
    height: 40px;
    min-width: 0;
    padding: 0 44px 0 14px;
  }

  polje-pretraga .dugme-filteri {
    align-items: center;
    background: none;
    border: none;
    border-radius: 50%;
    color: #333;
    cursor: pointer;
    display: flex;
    height: 36px;
    justify-content: center;
    padding: 0;
    position: absolute;
    right: 2px;
    top: 2px;
    width: 36px;
  }

  polje-pretraga :disabled {
    cursor: progress;
  }

  polje-pretraga .dugme-filteri:disabled {
    color: #aaa;
  }

  polje-pretraga .ucitava {
    animation: okret 0.8s linear infinite;
    border: 2px solid #ccc;
    border-radius: 50%;
    border-top-color: var(--boja);
    height: 16px;
    left: 14px;
    position: absolute;
    top: 10px;
    width: 16px;
  }

  polje-pretraga input:enabled + .ucitava {
    display: none;
  }

  @keyframes okret {
    to { transform: rotate(360deg); }
  }

  polje-pretraga .dugme-filteri svg {
    height: 22px;
    width: 22px;
  }

  polje-pretraga .dugme-filteri.aktivno {
    background: var(--boja);
    color: #fff;
  }

  polje-pretraga .broj-filtera {
    background: #fff;
    border: 1px solid var(--boja);
    border-radius: 8px;
    box-sizing: border-box;
    color: var(--boja);
    font: bold 11px/14px system-ui, sans-serif;
    min-width: 16px;
    padding: 0 3px;
    position: absolute;
    right: -4px;
    top: -4px;
  }

  polje-pretraga .rezultat {
    flex-basis: 100%;
  }

  polje-pretraga .rezultat > span {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    display: inline-flex;
    font: 14px system-ui, sans-serif;
    gap: 10px;
    padding: 6px 12px;
  }

  polje-pretraga .rezultat button {
    background: none;
    border: none;
    color: var(--boja);
    cursor: pointer;
    font: inherit;
    padding: 0;
    text-decoration: underline;
  }

  @media (min-width: 600px) {
    polje-pretraga {
      left: auto;
      width: 400px;
    }
  }
`

const polja = ['mesto', 'autor', 'godina', 'drzava']

const odlaganjePretrage = 250
const najmanjeSlova = 2

const praviTekst = spomenik => normalizuj([
  ...polja.map(polje => spomenik[polje] || ''),
  nazivSpomenika(spomenik),
  nazivDrzave(spomenik.drzava),
]
  .join(' ')
  .replace(/<[^>]*>/g, ''))

export default class Pretraga extends HTMLElement {
  constructor(stavke, callback) {
    super()
    this.stavke = stavke
    this.tekstovi = new Map()
    this.callback = callback
    this.filtrirano = stavke

    this.polje = document.createElement('input')
    this.polje.id = 'pretraga'
    this.polje.type = 'search'
    this.polje.enterKeyHint = 'search'

    this.dugme = document.createElement('button')
    this.dugme.className = 'dugme-filteri'
    this.dugme.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg><span class="broj-filtera"></span>'
    this.polje.disabled = this.dugme.disabled = true
    this.setAttribute('aria-busy', 'true')
    this.ucitava = document.createElement('span')
    this.ucitava.className = 'ucitava'

    this.rezultat = document.createElement('div')
    this.rezultat.className = 'rezultat'
    this.rezultat.innerHTML = `<span><span class="broj"></span><button>${t('obrisi')}</button></span>`
    this.rezultat.querySelector('button').addEventListener('click', () => this.ponisti())

    this.filteri = document.body.appendChild(new Filteri(stavke))
    this.filteri.addEventListener('promena', () => this.pretrazi())
    this.filteri.addEventListener('potvrda', () => this.potvrdi())

    this.dugme.addEventListener('click', () => this.filteri.otvori())
    this.polje.addEventListener('input', () => {
      clearTimeout(this.odlozena)
      this.odlozena = setTimeout(() => this.pretrazi(), odlaganjePretrage)
    })
    this.polje.addEventListener('focus', () => this.pripremiTekstove(), {once: true})
    this.polje.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return
      this.potvrdi()
    })
    this.pocetnih = stavke.filter(({spomenik}) => this.filteri.odgovara(spomenik)).length
    this.pretrazi()
  }

  connectedCallback() {
    this.append(style, this.polje, this.ucitava, this.dugme, this.rezultat)
  }

  omoguci() {
    this.polje.disabled = this.dugme.disabled = false
    this.removeAttribute('aria-busy')
    this.polje.placeholder = `🔍 ${t('pretraga', this.stavke.length)}`
    this.polje.setAttribute('aria-label', t('pretraga', this.stavke.length))
  }

  dodaj(nove) {
    this.stavke = [...this.stavke, ...nove]
    this.filteri.dodaj(this.stavke)
    this.pocetnih = this.stavke.filter(({spomenik}) => this.filteri.odgovara(spomenik)).length
    this.pretrazi()
  }

  pripremiTekstove(od = 0) {
    const deo = this.stavke.slice(od, od + 500)
    deo.forEach(stavka => this.tekst(stavka))
    if (deo.length) setTimeout(() => this.pripremiTekstove(od + deo.length))
  }

  osveziDopune() {
    this.tekstovi.clear()
    this.filteri.dodaj(this.stavke)
    if (normalizuj(this.polje.value).length >= najmanjeSlova) this.pretrazi()
  }

  tekst(stavka) {
    let tekst = this.tekstovi.get(stavka)
    if (tekst === undefined) this.tekstovi.set(stavka, tekst = praviTekst(stavka.spomenik))
    return tekst
  }

  pretrazi() {
    clearTimeout(this.odlozena)
    this.odlozena = undefined
    const unos = normalizuj(this.polje.value)
    const fraza = unos.length >= najmanjeSlova ? unos : ''
    const pronadjeno = fraza ? this.stavke.filter(stavka => this.tekst(stavka).includes(fraza)) : this.stavke
    this.filteri.postaviOsnovu(pronadjeno, Boolean(fraza))
    this.filtrirano = pronadjeno.filter(({spomenik}) => this.filteri.uRezultatu(spomenik))
    const suzeno = this.filtrirano.length < this.pocetnih
    this.osveziPrikaz(suzeno)
    this.callback(this.filtrirano, suzeno, Boolean(fraza || this.filteri.brojAktivnih()))
  }

  potvrdi() {
    if (this.odlozena !== undefined) this.pretrazi()
    this.polje.blur()
    if (!this.filtrirano.length) return
    const gore = this.getBoundingClientRect().bottom
    const levo = mapa.zoomControl.getContainer().getBoundingClientRect().right
    const dole = mapa.getSize().y - document.querySelector('#dugmad-dole').getBoundingClientRect().top
    mapa.fitBounds(L.latLngBounds(this.filtrirano.map(({marker}) => marker.dajPoziciju())), {
      paddingTopLeft: [levo + 20, gore + 20],
      paddingBottomRight: [30, dole + 20],
      maxZoom: 11,
    })
  }

  ponisti() {
    this.polje.value = ''
    this.filteri.ponisti()
  }

  osveziPrikaz(suzeno) {
    const aktivnih = this.filteri.brojAktivnih()
    this.dugme.title = aktivnih ? `${t('filteri')} · ${aktivnih}` : t('filteri')
    this.dugme.setAttribute('aria-label', this.dugme.title)
    this.dugme.classList.toggle('aktivno', aktivnih > 0)
    const broj = this.dugme.querySelector('.broj-filtera')
    broj.hidden = !aktivnih
    broj.textContent = String(aktivnih)
    this.rezultat.hidden = !suzeno
    this.rezultat.querySelector('.broj').textContent = t('nadjeno', this.filtrirano.length, this.stavke.length)
  }
}

customElements.define('polje-pretraga', Pretraga)
