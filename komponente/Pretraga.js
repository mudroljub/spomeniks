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

  /* filteri su ikonica na desnom kraju polja za pretragu */
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

  polje-pretraga .dugme-filteri svg {
    height: 22px;
    width: 22px;
  }

  polje-pretraga .dugme-filteri.aktivno {
    background: ${boja};
    color: #fff;
  }

  polje-pretraga .broj-filtera {
    background: #fff;
    border: 1px solid ${boja};
    border-radius: 8px;
    box-sizing: border-box;
    color: ${boja};
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

// kucanje pretrazuje tek kad zastane, a ne posle svakog slova
const odlaganjePretrage = 250

const praviTekst = spomenik => normalizuj([
  ...polja.map(polje => spomenik[polje] || ''),
  nazivDrzave(spomenik.drzava),
]
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
    this.oznaciPolje()

    this.dugme = document.createElement('button')
    this.dugme.className = 'dugme-filteri'
    this.dugme.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg><span class="broj-filtera"></span>'

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
    this.polje.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return
      this.potvrdi()
    })
    this.pocetnih = stavke.filter(({spomenik}) => this.filteri.odgovara(spomenik)).length
    this.pretrazi()
  }

  connectedCallback() {
    this.append(style, this.polje, this.dugme, this.rezultat)
  }

  oznaciPolje() {
    this.polje.placeholder = `🔍 ${t('pretraga', this.stavke.length)}`
    this.polje.setAttribute('aria-label', t('pretraga', this.stavke.length))
  }

  // spomenici koji stignu posle prvog crtanja ulaze u pretragu i filtere, uz zadrzanu frazu i izbor
  dodaj(nove) {
    this.stavke = [...this.stavke, ...nove]
    nove.forEach(stavka => this.tekstovi.set(stavka, praviTekst(stavka.spomenik)))
    this.filteri.dodaj(this.stavke)
    this.pocetnih = this.stavke.filter(({spomenik}) => this.filteri.odgovara(spomenik)).length
    this.oznaciPolje()
    this.pretrazi()
  }

  pretrazi() {
    clearTimeout(this.odlozena)
    this.odlozena = undefined
    const fraza = normalizuj(this.polje.value)
    const pronadjeno = this.stavke.filter(stavka => this.tekstovi.get(stavka).includes(fraza))
    this.filteri.postaviOsnovu(pronadjeno, Boolean(fraza))
    this.filtrirano = pronadjeno.filter(({spomenik}) => this.filteri.uRezultatu(spomenik))
    const suzeno = this.filtrirano.length < this.pocetnih
    this.osveziPrikaz(suzeno)
    this.callback(this.filtrirano, suzeno)
  }

  // kucanje i izbor filtera ne pomeraju mapu, a potvrda (Enter, Trazi na tastaturi telefona, Prikazi u filterima) pokazuje rezultate,
  // van dugmadi na mapi: desno od zuma, ispod pretrage i iznad donjeg reda
  potvrdi() {
    // Svaki nacin potvrde koristi poslednji unos, cak i pre isteka odlaganja.
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
    this.filteri.ponisti() // javlja promenu, pa se i pretraga ponovi
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
