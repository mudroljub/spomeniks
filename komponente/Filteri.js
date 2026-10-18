// @ts-check
import {mapa} from '../klase/mapa.js'
import {nestao, ruine, autoriSpomenika, normalizuj} from '../utils/helpers.js'
import {dajOznaku, promene} from '../utils/oznake.js'
import {t, nazivDrzave} from '../utils/jezik.js'
import {nivoiVaznosti, pripadaVrsti} from '../utils/vaznost.js'

const boja = '#822323'

// uklonjeni se ne prikazuju dok ih putnik ne izabere, jer niko ne putuje do spomenika kog nema
const podrazumevano = {stanje: ['postoji', 'rusevine']}

const pocetniIzbor = grupe => Object.fromEntries(grupe.map(g => [g.kljuc, new Set(podrazumevano[g.kljuc])]))

// unutar grupe vazi bilo koja izabrana opcija (ili), a izmedju grupa sve (i)
const praviGrupe = (drzave, autori) => [
  {kljuc: 'tip', naziv: t('grupaVrste'), opcije: Object.fromEntries(nivoiVaznosti.map(o => [o, t(o)])),
    uslov: pripadaVrsti},
  {kljuc: 'autor', naziv: t('grupaAutor'), opcije: Object.fromEntries(autori.map(a => [a, a])), padajuci: true,
    uslov: (s, o) => autoriSpomenika(s).includes(o)},
  {kljuc: 'stanje', naziv: t('grupaStanje'), opcije: {postoji: t('postoji'), rusevine: t('ruine'), nestao: t('uklonjen')},
    uslov: (s, o) => o === 'nestao' ? nestao(s.stanje) : o === 'rusevine' ? ruine(s.stanje) : !nestao(s.stanje) && !ruine(s.stanje)},
  {kljuc: 'drzava', naziv: t('grupaDrzava'), opcije: Object.fromEntries(drzave.map(d => [d, nazivDrzave(d)])),
    uslov: (s, o) => s.drzava === o},
  {kljuc: 'poseta', naziv: t('grupaPoseta'), opcije: {neposecen: t('neposecen'), lista: t('lista'), posetio: t('posetio')},
    uslov: (s, o) => o === 'neposecen' ? dajOznaku(s.id) !== 'posetio' : dajOznaku(s.id) === o},
]

// autori sa bar tri dela, abecedno; ostale nalazi pretraga
const praviAutore = stavke => {
  const brojDela = {}
  stavke.forEach(({spomenik}) => autoriSpomenika(spomenik).forEach(a => brojDela[a] = (brojDela[a] || 0) + 1))
  return Object.keys(brojDela).filter(a => brojDela[a] >= 3).sort((a, b) => a.localeCompare(b, 'sh'))
}

const style = document.createElement('style')
style.textContent = `
  :host {
    font: 16px system-ui, sans-serif;
  }

  #panel {
    background: #fffdf8;
    border-radius: 12px 12px 0 0;
    bottom: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    left: 0;
    max-height: 85%;
    padding-bottom: var(--dno);
    position: fixed;
    right: 0;
    z-index: 1001;
  }

  #panel[hidden] {
    display: none;
  }

  @media (min-width: 600px) {
    #panel {
      border-radius: 12px;
      bottom: auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
      left: auto;
      max-height: calc(100% - var(--visina-slajdera) - var(--dno) - 80px);
      right: 10px;
      top: calc(60px + var(--vrh));
      width: 400px;
    }
  }

  header, footer {
    align-items: center;
    display: flex;
    flex: none;
    justify-content: space-between;
    padding: 4px 4px 4px 16px;
  }

  header {
    border-bottom: 1px solid #e5ddd0;
    font-weight: bold;
  }

  footer {
    border-top: 1px solid #e5ddd0;
    gap: 8px;
    padding: 10px 16px;
  }

  #zatvori {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    font-size: 28px;
    height: 44px;
    width: 44px;
  }

  .grupe {
    overflow-y: auto;
    padding: 0 16px 8px;
  }

  h3 {
    color: #666;
    font-size: 13px;
    font-weight: normal;
    letter-spacing: 0.04em;
    margin: 14px 0 8px;
    text-transform: uppercase;
  }

  .cipovi {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  button.cip {
    background: white;
    border: 1px solid #c9bfb0;
    border-radius: 18px;
    color: #333;
    cursor: pointer;
    font: inherit;
    font-size: 15px;
    min-height: 36px;
    padding: 6px 12px;
  }

  button.cip[aria-pressed="true"] {
    background: ${boja};
    border-color: ${boja};
    color: #fff;
  }

  button.cip:disabled {
    opacity: 0.4;
  }

  button.polje, input {
    background: white;
    border: 1px solid #c9bfb0;
    border-radius: 18px;
    box-sizing: border-box;
    color: #333;
    font: inherit;
    font-size: 16px; /* manji font na iPhone-u zumira stranicu pri kucanju */
    min-height: 40px;
    padding: 6px 12px;
    width: 100%;
  }

  button.polje {
    align-items: center;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    text-align: left;
  }

  button.polje[aria-expanded="true"] .strelica {
    transform: rotate(180deg);
  }

  .spisak {
    border: 1px solid #c9bfb0;
    border-radius: 12px;
    margin-top: 6px;
    padding: 6px;
  }

  [role="listbox"] {
    list-style: none;
    margin: 6px 0 0;
    max-height: 240px;
    overflow-y: auto;
    padding: 0;
  }

  [role="option"] {
    align-items: center;
    border-radius: 8px;
    box-sizing: border-box;
    color: #333;
    cursor: pointer;
    display: flex;
    font-size: 15px;
    min-height: 44px;
    padding: 6px 10px;
  }

  [role="option"].aktivna {
    background: #ece2d4;
    box-shadow: inset 0 0 0 2px #9c8f7d;
  }

  @media (hover: hover) {
    button.polje:hover {
      border-color: #9c8f7d;
    }

    [role="option"]:hover {
      background: #ece2d4;
    }
  }

  .prazno {
    color: #666;
    font-size: 15px;
    margin: 0;
    padding: 12px 10px;
  }

  .broj {
    margin-left: 4px;
    opacity: 0.7;
  }

  #ponisti {
    background: none;
    border: none;
    color: ${boja};
    cursor: pointer;
    font: inherit;
    padding: 10px 0;
    text-decoration: underline;
  }

  #prikazi {
    background: ${boja};
    border: none;
    border-radius: 20px;
    color: #fff;
    cursor: pointer;
    flex: 1;
    font: inherit;
    max-width: 260px;
    min-height: 44px;
  }
`

export default class Filteri extends HTMLElement {
  constructor(stavke) {
    super()
    const drzave = [...new Set(stavke.map(({spomenik}) => spomenik.drzava))].sort((a, b) => nazivDrzave(a).localeCompare(nazivDrzave(b)))
    this.grupe = praviGrupe(drzave, praviAutore(stavke))
    this.izbor = pocetniIzbor(this.grupe)
    this.osnova = stavke

    this.panel = document.createElement('section')
    this.panel.id = 'panel'
    this.panel.hidden = true
    this.panel.innerHTML = `
      <header>${t('filteri')}<button id="zatvori" title="${t('zatvori')}">×</button></header>
      <div class="grupe"></div>
      <footer><button id="ponisti">${t('obrisiSve')}</button><button id="prikazi"></button></footer>
    `
    this.sadrzaj = this.panel.querySelector('.grupe')
    this.panel.querySelector('#zatvori').addEventListener('click', () => this.zatvori())
    this.panel.querySelector('#ponisti').addEventListener('click', () => this.ponisti())
    // izbor opcija ne pomera mapu, a potvrda izbora pokazuje rezultate
    this.panel.querySelector('#prikazi').addEventListener('click', () => {
      this.zatvori()
      this.dispatchEvent(new Event('potvrda'))
    })
    this.sadrzaj.addEventListener('click', e => {
      const cilj = /** @type {HTMLElement} */ (e.target)
      const cip = cilj.closest('button.cip')
      if (cip) this.obrni(cip.dataset.grupa, cip.dataset.opcija)
      const polje = cilj.closest('button.polje')
      if (polje) this.otvorenSpisak ? this.zatvoriSpisak() : this.otvoriSpisak(polje.dataset.grupa)
      const opcija = cilj.closest('[role="option"]')
      if (opcija) this.izaberiSaSpiska(opcija)
    })
    // dodir ili klik bilo gde van padajuceg spiska ga zatvara
    this.panel.addEventListener('click', e => {
      if (this.otvorenSpisak && !/** @type {HTMLElement} */ (e.target).closest('.padajuci')) this.zatvoriSpisak()
    })
    this.sadrzaj.addEventListener('focusout', e => {
      const novi = /** @type {HTMLElement | null} */ (e.relatedTarget)
      if (this.otvorenSpisak && novi && !novi.closest('.padajuci')) this.zatvoriSpisak()
    })
    this.sadrzaj.addEventListener('input', e => this.filtrirajSpisak(/** @type {HTMLInputElement} */ (e.target).value))
    this.sadrzaj.addEventListener('keydown', e => this.tasterSpiska(e))

    this.attachShadow({mode: 'open'})
    this.shadowRoot.append(style, this.panel)

    promene.addEventListener('promena', () => {
      if (this.izbor.poseta.size) this.javi()
      else if (!this.panel.hidden) this.prikaziGrupe()
    })
  }

  // spomenici koji odgovaraju pretrazi; brojevi uz opcije se racunaju od njih
  postaviOsnovu(stavke) {
    this.osnova = stavke
    if (!this.panel.hidden) this.prikaziGrupe()
  }

  odgovara(spomenik, osim) {
    return this.grupe.every(g => g.kljuc === osim || !this.izbor[g.kljuc].size ||
      [...this.izbor[g.kljuc]].some(o => g.uslov(spomenik, o)))
  }

  // grupa koju korisnik nije menjao
  naPocetku(kljuc) {
    const pocetno = podrazumevano[kljuc] || []
    const izabrano = this.izbor[kljuc]
    return izabrano.size === pocetno.length && pocetno.every(o => izabrano.has(o))
  }

  // broje se izmene u odnosu na pocetni izbor
  brojAktivnih() {
    return this.grupe.reduce((zbir, {kljuc}) => {
      const pocetno = podrazumevano[kljuc] || []
      const izabrano = this.izbor[kljuc]
      return zbir + [...izabrano].filter(o => !pocetno.includes(o)).length + pocetno.filter(o => !izabrano.has(o)).length
    }, 0)
  }

  obrni(grupa, opcija) {
    const izabrano = this.izbor[grupa]
    if (izabrano.has(opcija)) izabrano.delete(opcija)
    else izabrano.add(opcija)
    this.javi()
  }

  otvoriSpisak(grupa) {
    this.otvorenSpisak = grupa
    this.prikaziGrupe()
    this.sadrzaj.querySelector('.spisak').scrollIntoView({block: 'nearest'})
    this.sadrzaj.querySelector('[role="option"][aria-selected="true"]').scrollIntoView({block: 'nearest'})
    // na telefonu tastatura ne iskace sama, jer bi prekrila spisak
    if (matchMedia('(pointer: fine)').matches) this.sadrzaj.querySelector('.spisak input').focus()
  }

  zatvoriSpisak() {
    this.otvorenSpisak = null
    this.prikaziGrupe()
  }

  // fokus se vraca na polje, da tastatura nastavi odatle
  vratiFokus(grupa) {
    this.sadrzaj.querySelector(`button.polje[data-grupa="${grupa}"]`).focus({preventScroll: true})
  }

  izaberiSaSpiska(opcija) {
    const grupa = this.otvorenSpisak
    this.otvorenSpisak = null
    this.izaberi(grupa, opcija.dataset.opcija)
    this.vratiFokus(grupa)
  }

  // kucanje samo sakriva stavke koje ne odgovaraju, da polje ne izgubi fokus
  filtrirajSpisak(tekst) {
    const trazeno = normalizuj(tekst.trim())
    const opcije = [...this.sadrzaj.querySelectorAll('[role="option"]')]
    opcije.forEach(o => o.hidden = !normalizuj(o.dataset.naziv).includes(trazeno))
    this.sadrzaj.querySelector('.prazno').hidden = opcije.some(o => !o.hidden)
    this.oznaciAktivnu(trazeno ? opcije.find(o => !o.hidden) : null)
  }

  oznaciAktivnu(opcija) {
    this.sadrzaj.querySelector('[role="option"].aktivna')?.classList.remove('aktivna')
    opcija?.classList.add('aktivna')
    opcija?.scrollIntoView({block: 'nearest'})
    this.sadrzaj.querySelector('.spisak input').setAttribute('aria-activedescendant', opcija?.id || '')
  }

  // tastatura kao kod obicnog padajuceg spiska: strelice, Enter i Escape
  tasterSpiska(e) {
    if (e.target.matches('button.polje') && e.key === 'ArrowDown' && !this.otvorenSpisak) {
      e.preventDefault()
      return this.otvoriSpisak(e.target.dataset.grupa)
    }
    if (!e.target.matches('.spisak input')) return
    const vidljive = [...this.sadrzaj.querySelectorAll('[role="option"]:not([hidden])')]
    const aktivna = this.sadrzaj.querySelector('[role="option"].aktivna')
    const polazna = aktivna || this.sadrzaj.querySelector('[role="option"][aria-selected="true"]:not([hidden])')
    const korak = {ArrowDown: 1, ArrowUp: -1}[e.key]
    if (korak) {
      e.preventDefault()
      const i = vidljive.indexOf(polazna)
      this.oznaciAktivnu(vidljive[i < 0 ? (korak > 0 ? 0 : vidljive.length - 1) : (i + korak + vidljive.length) % vidljive.length])
    }
    if (e.key === 'Enter' && aktivna) {
      e.preventDefault()
      this.izaberiSaSpiska(aktivna)
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      const grupa = this.otvorenSpisak
      this.zatvoriSpisak()
      this.vratiFokus(grupa)
    }
  }

  // padajuci spisak bira samo jednu opciju, a prazna vrednost je bez filtera
  izaberi(grupa, opcija) {
    const izabrano = this.izbor[grupa]
    izabrano.clear()
    if (opcija) izabrano.add(opcija)
    this.javi()
  }

  ponisti() {
    this.otvorenSpisak = null
    this.izbor = pocetniIzbor(this.grupe)
    this.javi()
  }

  javi() {
    this.dispatchEvent(new Event('promena'))
    if (!this.panel.hidden) this.prikaziGrupe()
  }

  otvori() {
    mapa.fire('izbor', {marker: null})
    this.prikaziGrupe()
    this.panel.hidden = false
  }

  zatvori() {
    this.otvorenSpisak = null
    this.panel.hidden = true
  }

  prikaziGrupe() {
    const opcije = g => Object.entries(g.opcije).map(([opcija, naziv]) => ({
      opcija, naziv,
      broj: this.osnova.filter(({spomenik}) => this.odgovara(spomenik, g.kljuc) && g.uslov(spomenik, opcija)).length,
      izabran: this.izbor[g.kljuc].has(opcija),
    }))

    const cipovi = g => `<div class="cipovi">${opcije(g).map(({opcija, naziv, broj, izabran}) =>
      `<button class="cip" data-grupa="${g.kljuc}" data-opcija="${opcija}" aria-pressed="${izabran}"
        ${!broj && !izabran ? 'disabled' : ''}>${naziv}<span class="broj">${broj}</span></button>`).join('')}</div>`

    const stavka = (g, i, opcija, naziv, izabran, broj = '') =>
      `<li role="option" id="opcija-${g.kljuc}-${i}" data-opcija="${opcija}" data-naziv="${naziv}" aria-selected="${izabran}">${naziv}<span class="broj">${broj}</span></li>`

    const padajuci = g => {
      const otvoren = this.otvorenSpisak === g.kljuc
      const izabran = [...this.izbor[g.kljuc]][0]
      return `<div class="padajuci">
        <button class="polje" data-grupa="${g.kljuc}" aria-haspopup="listbox" aria-expanded="${otvoren}">
          ${izabran || t('sviAutori')}<span class="strelica" aria-hidden="true">▾</span>
        </button>
        ${otvoren ? `<div class="spisak">
          <input type="search" role="combobox" autocomplete="off" aria-autocomplete="list" aria-expanded="true"
            aria-controls="spisak-${g.kljuc}" aria-label="${t('traziAutora')}" placeholder="${t('traziAutora')}">
          <ul role="listbox" id="spisak-${g.kljuc}" aria-label="${g.naziv}">
            ${stavka(g, 0, '', t('sviAutori'), !izabran)}
            ${opcije(g).filter(o => o.broj || o.izabran).map((o, i) => stavka(g, i + 1, o.opcija, o.naziv, o.izabran, o.broj)).join('')}
          </ul>
          <p class="prazno" hidden>${t('nemaAutora')}</p>
        </div>` : ''}
      </div>`
    }

    this.sadrzaj.innerHTML = this.grupe.map(g => `
      <h3>${g.naziv}</h3>
      ${g.padajuci ? padajuci(g) : cipovi(g)}
    `).join('')

    const ukupno = this.osnova.filter(({spomenik}) => this.odgovara(spomenik)).length
    this.panel.querySelector('#prikazi').textContent = t('prikazi', ukupno)
  }
}

customElements.define('panel-filteri', Filteri)
