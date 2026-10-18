// @ts-check
import Filteri from './Filteri.js'
import {mapa} from '../klase/mapa.js'
import {normalizuj} from '../utils/helpers.js'
import {t, nazivDrzave} from '../utils/jezik.js'

const boja = '#822323'

// font od 16px sprecava da iPhone uvecava stranicu pri kucanju
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

  polje-pretraga input,
  polje-pretraga .dugme-filteri {
    background: white;
    border: none;
    border-radius: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    font: 16px system-ui, sans-serif;
    height: 40px;
    padding: 0 14px;
  }

  polje-pretraga input {
    flex: 1 1 280px;
    min-width: 0;
  }

  polje-pretraga .dugme-filteri {
    color: #333;
    cursor: pointer;
    flex: none;
  }

  polje-pretraga .dugme-filteri.aktivno {
    background: ${boja};
    color: #fff;
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
    color: ${boja};
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

const polja = ['mesto', 'naziv', 'nazivEn', 'autor', 'godina', 'drzava']

const praviTekst = spomenik => normalizuj([...polja.map(polje => spomenik[polje] || ''), nazivDrzave(spomenik.drzava)]
  .join(' ')
  .replace(/<[^>]*>/g, ''))

export default class Pretraga extends HTMLElement {
  constructor(stavke, callback) {
    super()
    this.stavke = stavke
    this.tekstovi = new Map(stavke.map(stavka => [stavka, praviTekst(stavka.spomenik)])) // jezik se menja uz ponovno ucitavanje
    this.callback = callback
    this.filtrirano = stavke

    this.polje = document.createElement('input')
    this.polje.id = 'pretraga'
    this.polje.type = 'search'
    this.polje.enterKeyHint = 'search'
    this.polje.placeholder = `🔍 ${t('pretraga', stavke.length)}`
    this.polje.setAttribute('aria-label', t('pretraga', stavke.length))

    this.dugme = document.createElement('button')
    this.dugme.className = 'dugme-filteri'

    this.rezultat = document.createElement('div')
    this.rezultat.className = 'rezultat'
    this.rezultat.innerHTML = `<span><span class="broj"></span><button>${t('obrisi')}</button></span>`
    this.rezultat.querySelector('button').addEventListener('click', () => this.ponisti())

    this.filteri = document.body.appendChild(new Filteri(stavke))
    this.filteri.addEventListener('promena', () => this.pretrazi())
    this.filteri.addEventListener('potvrda', () => this.potvrdi())

    this.dugme.addEventListener('click', () => this.filteri.otvori())
    this.polje.addEventListener('input', () => this.pretrazi())
    this.polje.addEventListener('keydown', e => e.key === 'Enter' && this.potvrdi())
    this.pocetnih = stavke.filter(({spomenik}) => this.filteri.odgovara(spomenik)).length
    this.pretrazi()
  }

  connectedCallback() {
    this.append(style, this.polje, this.dugme, this.rezultat)
  }

  pretrazi() {
    const fraza = normalizuj(this.polje.value)
    const pronadjeno = this.stavke.filter(stavka => this.tekstovi.get(stavka).includes(fraza))
    this.filteri.postaviOsnovu(pronadjeno)
    // trazeni spomenik se nalazi i kad je uklonjen: podrazumevani filter stanja samo rasterecuje praznu mapu,
    // a stanje koje je korisnik sam izabrao vazi i u pretrazi
    const osim = fraza && this.filteri.naPocetku('stanje') ? 'stanje' : undefined
    this.filtrirano = pronadjeno.filter(({spomenik}) => this.filteri.odgovara(spomenik, osim))
    const suzeno = this.filtrirano.length < this.pocetnih
    this.osveziPrikaz(suzeno)
    this.callback(this.filtrirano, suzeno)
  }

  // kucanje i izbor filtera ne pomeraju mapu, a potvrda (Enter, Trazi na tastaturi telefona, Prikazi u filterima) pokazuje rezultate,
  // van dugmadi na mapi: desno od zuma, ispod pretrage i iznad donjeg reda
  potvrdi() {
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
    this.filteri.ponisti() // javlja promenu, pa se i pretraga ponovi
  }

  osveziPrikaz(suzeno) {
    const aktivnih = this.filteri.brojAktivnih()
    this.dugme.textContent = aktivnih ? `${t('filteri')} · ${aktivnih}` : t('filteri')
    this.dugme.classList.toggle('aktivno', aktivnih > 0)
    this.rezultat.hidden = !suzeno
    this.rezultat.querySelector('.broj').textContent = t('nadjeno', this.filtrirano.length, this.stavke.length)
  }
}

customElements.define('polje-pretraga', Pretraga)
