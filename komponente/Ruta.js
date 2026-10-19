// @ts-check
import {mapa} from '../klase/mapa.js'
import {navigacijaIkonica, znakVrste} from '../utils/ikonice.js'
import {stilZaglavlja} from '../utils/ui.js'
import {naziviStanja, nazivSpomenika, malaSlika, navigacijaUrl} from '../utils/helpers.js'
import {t, jezik, nazivDrzave} from '../utils/jezik.js'
import {dajRutu, dajNaziv, dajWiki, dajTuruId, postaviRutu, izaberiTuru, ukloniIzRute, pomeri, promeneRute} from '../utils/ruta.js'
import {sastaviTure} from '../utils/ture.js'
import {nivoiVaznosti, podrazumevaniPrag, razresiPrag} from '../utils/vaznost.js'

const boja = '#822323'
const najviseZaGoogle = 10 // ogranicenje jednog Google linka, ne broja stanica u turi
const najmanjeStanica = 3 // manje od toga nije tura
// drzave i pokrajine koje su u NOB imale svoj glavni stab, od zapada ka istoku
const grupeSpiska = ['Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'Serbia', 'Vojvodina', 'Kosovo', 'Macedonia']
const siroko = matchMedia('(min-width: 600px)') // ruta i spomenik mogu da stoje jedno pored drugog
const kljucPraga = 'spomenici-prag-tura'
const ucitajPrag = () => {
  try {
    return razresiPrag(localStorage.getItem(kljucPraga))
  } catch { return podrazumevaniPrag }
}

const style = document.createElement('style')
style.textContent = `
  ${stilZaglavlja}
  :host {
    font: 16px system-ui, sans-serif;
  }

  [hidden] {
    display: none !important;
  }

  #dugme {
    background: ${boja};
    border: none;
    border-radius: 22px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    color: #fff;
    cursor: pointer;
    font: inherit;
    margin-right: 8px;
    min-height: 44px;
    padding: 0 16px;
  }

  #panel {
    background: #fffdf8;
    border-radius: 12px 12px 0 0;
    bottom: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
    left: 0;
    max-height: 65%;
    overflow-y: auto;
    position: fixed;
    right: 0;
    z-index: 1000;
  }

  /* desno, iznad dugmadi dole, a prozor spomenika je levo */
  @media (min-width: 600px) {
    #panel {
      border-radius: 12px;
      bottom: calc(var(--visina-slajdera) + var(--dno) + 60px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
      left: auto;
      max-height: calc(100% - var(--visina-slajdera) - var(--dno) - 130px);
      right: 10px;
      width: 360px;
    }
  }

  button {
    cursor: pointer;
    font: inherit;
  }

  /* kartice i zatvaranje su uvek vidljivi, i kad se spisak pomeri; tamno zaglavlje razlikuje rutu od prozora spomenika */
  header {
    background: ${boja};
    display: flex;
    padding-left: 4px;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .kartice {
    display: flex;
    flex: 1;
  }

  .kartice button {
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: rgba(255, 255, 255, 0.75);
    min-height: 48px;
    padding: 0 12px;
  }

  .kartice [aria-selected="true"] {
    border-bottom-color: #fff;
    color: #fff;
  }

  #zatvori {
    align-self: center;
    background: none;
    border: none;
    color: #fff;
    font-size: 28px;
    height: 44px;
    width: 44px;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    align-items: center;
    border-bottom: 1px solid #eee;
    display: flex;
    padding-left: 16px;
  }

  li button {
    background: none;
    border: none;
    color: #555;
    flex: none;
    height: 44px;
    width: 44px;
  }

  li button:disabled {
    opacity: 0.25;
  }

  .navigacija {
    align-items: center;
    color: ${boja};
    display: inline-flex;
    flex: none;
    height: 44px;
    justify-content: center;
    width: 44px;
  }

  .navigacija svg {
    height: 22px;
    width: 22px;
  }

  .navigacija:focus-visible {
    outline: 2px solid ${boja};
    outline-offset: -3px;
  }

  .broj {
    color: ${boja};
    flex: none;
    font-weight: bold;
    min-width: 28px;
  }

  li .naziv {
    color: inherit;
    flex: 1;
    height: auto;
    min-width: 0;
    padding: 10px 0;
    text-align: left;
    width: auto;
  }

  .opis {
    color: #666;
    display: block;
    font-size: 14px;
  }

  li .tura {
    align-items: center;
    display: flex;
    gap: 12px;
    padding: 12px 16px 12px 0;
  }

  .tura img {
    border-radius: 8px;
    flex: none;
    height: 64px;
    object-fit: cover;
    width: 64px;
  }

  .tura .tekst {
    min-width: 0;
  }

  .tura .ime {
    color: #222;
    font-weight: 600;
  }

  /* spisak mesta u turi staje u dva reda */
  .tura .opis {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    overflow: hidden;
  }

  /* svi alati rute su u jednom redu iznad naslova */
  .alati {
    display: flex;
    margin: 0;
    padding: 0 4px;
  }

  .alati button {
    background: none;
    border: none;
    color: ${boja};
    min-height: 44px;
    padding: 0 12px;
    text-decoration: underline;
  }

  #isprazni {
    margin-left: auto;
  }

  /* povratak na izbor ture je strelica, a ne podvucena akcija */
  .alati #nazad {
    text-decoration: none;
  }

  #naslov-rute {
    margin: 0;
    padding: 0 16px 12px;
  }

  #stanice {
    border-top: 1px solid #eee;
  }

  .uvod {
    margin: 0;
    padding: 16px;
  }

  /* glavna akcija je uvek pri dnu panela */
  footer {
    background: #fffdf8;
    border-top: 1px solid #ddd;
    bottom: 0;
    padding: 12px 16px calc(12px + var(--dno));
    position: sticky;
  }

  .glavna {
    background: ${boja};
    border-radius: 20px;
    box-sizing: border-box;
    color: #fff;
    display: block;
    padding: 10px 14px;
    text-align: center;
    text-decoration: none;
  }

  .napomena {
    color: #666;
    font-size: 14px;
    margin: 8px 0 0;
  }

  #ture {
    padding-bottom: var(--dno);
  }

  #spisak-tura h3 {
    color: #666;
    font-size: 13px;
    font-weight: normal;
    letter-spacing: 0.04em;
    margin: 14px 16px 6px;
    text-transform: uppercase;
  }


  #vaznost {
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
  }

  #vaznost span {
    font-size: 14px;
    flex-shrink: 0;
  }

  /* spisak sa znakovima sa mape, jer obican padajuci spisak ne prikazuje slike */
  .izbor-praga {
    flex: 1;
    min-width: 0;
    position: relative;
  }

  #prag-vaznosti {
    align-items: center;
    background: #fffdf8;
    border: 1px solid #822323;
    border-radius: 6px;
    color: #333;
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: 8px;
    min-height: 44px;
    padding: 4px 8px;
    width: 100%;
  }

  #prag-vaznosti .strelica {
    margin-left: auto;
  }

  #prag-vaznosti[aria-expanded="true"] .strelica {
    transform: rotate(180deg);
  }

  #opcije-praga {
    background: #fffdf8;
    border: 1px solid #c9bfb0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    left: 0;
    list-style: none;
    margin: 4px 0 0;
    max-height: 60vh;
    overflow-y: auto;
    padding: 4px;
    position: absolute;
    right: 0;
    z-index: 2;
  }

  #opcije-praga [role="option"] {
    align-items: center;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    gap: 8px;
    min-height: 44px;
    padding: 0 8px;
  }

  #opcije-praga [aria-selected="true"] {
    background: #ece2d4;
  }

  #opcije-praga [role="option"]:focus-visible {
    outline: 2px solid ${boja};
    outline-offset: -2px;
  }

  .znak {
    display: flex;
    justify-content: center;
    width: 24px;
  }
`

const tacka = ({lat, lng}) => `${lat},${lng}`

// bez polazista Google Maps krece od trenutnog polozaja
const googleUrl = spomenici => {
  const stanice = spomenici.slice(0, najviseZaGoogle).map(s => tacka(s.koordinate))
  const parametri = new URLSearchParams({api: '1', destination: stanice.pop()})
  if (stanice.length) parametri.set('waypoints', stanice.join('|'))
  return `https://www.google.com/maps/dir/?${parametri}`
}

// priblizno najkraci obilazak: uvek najbliza sledeca stanica, pa 2-opt okretanje deonica koje se ukrstaju
// polaziste ostaje prvo, a vraca indekse ostalih tacaka redom obilaska
const najkraciRedosled = (polaziste, tacke) => {
  const tacka = i => i < 0 ? polaziste : tacke[i]
  const d = (i, j) => j === undefined ? 0 : tacka(i).distanceTo(tacka(j)) // put je otvoren, posle kraja nema deonice
  const ostale = tacke.map((_, i) => i)
  const put = [-1]
  const cos = Math.cos(polaziste.lat * Math.PI / 180)
  const pozicije = [polaziste, ...tacke].map(p => [(p.lng - polaziste.lng) * cos, p.lat - polaziste.lat])
  while (ostale.length) {
    const [x, y] = pozicije[put[put.length - 1] + 1]
    let najbliza = 0, najmanje = Infinity
    for (let i = 0; i < ostale.length; i++) {
      const [px, py] = pozicije[ostale[i] + 1]
      const rastojanje = (px - x) ** 2 + (py - y) ** 2
      if (rastojanje < najmanje) { najmanje = rastojanje; najbliza = i }
    }
    put.push(...ostale.splice(najbliza, 1))
  }

  let popravljeno = tacke.length <= 100 // velike ture ostaju cele, bez skupe 2-opt obrade
  while (popravljeno) {
    popravljeno = false
    for (let i = 1; i < put.length - 1; i++)
      for (let k = i + 1; k < put.length; k++) {
        const ustede = d(put[i - 1], put[i]) + d(put[k], put[k + 1]) - d(put[i - 1], put[k]) - d(put[i], put[k + 1])
        if (ustede > 1) {
          put.splice(i, k - i + 1, ...put.slice(i, k + 1).reverse())
          popravljeno = true
        }
      }
  }
  return put.slice(1)
}

// naziv ture ima verziju za svaki jezik; ruta sacuvana pre prevoda ima samo engleski tekst
const prevedi = naziv => naziv?.[jezik] ?? naziv

// svaka sledeca vrsta se dodaje prethodnim, sto pokazuje redosled spiska
const nazivPraga = vrsta => t(vrsta === 'istaknut' ? 'istaknutiSpomenici' : vrsta)

const otvoriStanicu = marker => mapa.fire('izbor', {marker, izRute: true})

// broj stanice stoji desno od podnozja obeliska, gde ga dodiruje linija rute
const praviBroj = (marker, broj) => L
  .marker(marker.dajPoziciju(), {
    icon: L.divIcon({className: 'broj-stanice', html: broj, iconSize: [22, 22], iconAnchor: [-2, 20]}),
    zIndexOffset: 2000,
  })
  .on('click', () => otvoriStanicu(marker))

export default class Ruta extends HTMLElement {
  constructor() {
    super()
    this.stavke = new Map()
    this.pragVaznosti = ucitajPrag()
    this.linija = L.polyline([], {color: boja, weight: 3, dashArray: '6 8', interactive: false})
    this.brojevi = L.layerGroup().addTo(mapa)

    this.dugme = document.createElement('button')
    this.dugme.id = 'dugme'
    this.dugme.hidden = true // do ucitavanja spomenika
    this.dugme.addEventListener('click', () => this.otvori())

    this.panel = document.createElement('section')
    this.panel.id = 'panel'
    this.panel.hidden = true
    this.panel.innerHTML = `
      <header>
        <div class="kartice" role="tablist">
          <button role="tab" data-kartica="planer"></button>
          <button role="tab" data-kartica="ture">${t('predlozeneRute')}</button>
        </div>
        <button id="zatvori" title="${t('zatvori')}">×</button>
      </header>
      <div id="vaznost">
        <span id="naslov-praga">${t('pragVaznosti')}</span>
        <div class="izbor-praga">
          <button id="prag-vaznosti" aria-haspopup="listbox" aria-expanded="false" aria-controls="opcije-praga" aria-labelledby="naslov-praga prag-vaznosti"></button>
          <ul id="opcije-praga" role="listbox" aria-labelledby="naslov-praga" hidden>${nivoiVaznosti.map(vrsta =>
            `<li role="option" data-prag="${vrsta}" tabindex="-1"><span class="znak">${znakVrste(vrsta, 0.6)}</span>${nazivPraga(vrsta)}</li>`
          ).join('')}</ul>
        </div>
      </div>
      <div id="planer" role="tabpanel">
        <p class="uvod" id="prazna">${t('praznaRuta')}</p>
        <p class="alati">
          <button id="nazad">‹ ${t('predlozeneRute')}</button>
          <button id="redosled">${t('redosled')}</button>
          <button id="isprazni">${t('ukloniRutu')}</button>
        </p>
        <h2 id="naslov-rute"><span id="ime-rute"></span> <a id="wiki-rute" class="vise" target="_blank" rel="noopener" hidden>${t('vise')} ›</a></h2>
        <ol id="stanice"></ol>
        <footer>
          <a id="google" target="_blank" class="glavna">${t('googleMape')}</a>
          <p class="napomena" id="ogranicenje"></p>
        </footer>
      </div>
      <div id="ture" role="tabpanel">
        <div id="spisak-tura"></div>
      </div>
    `
    this.lista = this.panel.querySelector('#stanice')
    this.prikaziPrag()
    this.povesiIzborPraga()
    this.panel.querySelector('#zatvori').addEventListener('click', () => this.panel.hidden = true)
    this.panel.querySelectorAll('[data-kartica]').forEach(kartica =>
      kartica.addEventListener('click', () => this.prikaziKarticu(kartica.dataset.kartica))
    )
    this.panel.querySelector('#nazad').addEventListener('click', () => this.prikaziKarticu('ture'))
    this.panel.querySelector('#redosled').addEventListener('click', () => this.poredjaj())
    this.panel.querySelector('#isprazni').addEventListener('click', () => {
      postaviRutu([])
      this.prikaziKarticu('ture')
    })

    this.attachShadow({mode: 'open'})
    this.shadowRoot.append(style, this.dugme, this.panel)

    promeneRute.addEventListener('promena', () => this.prikazi())
    mapa.on('izbor', ({marker}) => marker && !siroko.matches && (this.panel.hidden = true))
    mapa.on('otvoriRutu', () => this.otvori())
    // gotova tura izabrana pre lociranja se okrece cim se sazna odakle korisnik krece
    mapa.on('pozicija', ({latlng}) => {
      const prvaPozicija = !this.pozicija
      this.pozicija = latlng
      if (prvaPozicija && dajNaziv()) postaviRutu(this.usmeri(dajRutu()))
    })
  }

  // izabrana vrsta stoji na dugmetu, sa svojim znakom
  prikaziPrag() {
    const opcija = this.panel.querySelector(`[data-prag="${this.pragVaznosti}"]`)
    this.panel.querySelectorAll('[data-prag]').forEach(o => o.setAttribute('aria-selected', String(o === opcija)))
    this.panel.querySelector('#prag-vaznosti').innerHTML = `${opcija.innerHTML}<span class="strelica" aria-hidden="true">▾</span>`
  }

  otvoriPrag(otvoren) {
    this.panel.querySelector('#opcije-praga').hidden = !otvoren
    this.panel.querySelector('#prag-vaznosti').setAttribute('aria-expanded', String(otvoren))
    if (otvoren) this.panel.querySelector('[data-prag][aria-selected="true"]').focus()
  }

  postaviPrag(vrsta) {
    this.pragVaznosti = vrsta
    try { localStorage.setItem(kljucPraga, vrsta) } catch { /* izbor vazi dok je stranica otvorena */ }
    this.prikaziPrag()
    this.osveziTure()
  }

  // mis, dodir i tastatura kao kod obicnog padajuceg spiska; dodir van spiska ga zatvara
  povesiIzborPraga() {
    const dugme = this.panel.querySelector('#prag-vaznosti')
    const spisak = this.panel.querySelector('#opcije-praga')
    dugme.addEventListener('click', () => this.otvoriPrag(spisak.hidden))
    spisak.addEventListener('click', e => {
      const opcija = /** @type {HTMLElement} */ (e.target).closest('[data-prag]')
      if (!opcija) return
      this.otvoriPrag(false)
      dugme.focus()
      this.postaviPrag(opcija.dataset.prag)
    })
    spisak.addEventListener('keydown', e => {
      const cilj = /** @type {HTMLElement} */ (e.target)
      const opcije = [...spisak.querySelectorAll('[data-prag]')]
      const korak = {ArrowDown: 1, ArrowUp: -1}[e.key]
      if (korak) opcije[(opcije.indexOf(cilj) + korak + opcije.length) % opcije.length].focus()
      if (e.key === 'Enter' || e.key === ' ') cilj.click()
      if (e.key === 'Escape') {
        this.otvoriPrag(false)
        dugme.focus()
      }
      if (korak || ['Enter', ' ', 'Escape'].includes(e.key)) e.preventDefault()
    })
    this.panel.addEventListener('click', e => {
      if (!spisak.hidden && !/** @type {HTMLElement} */ (e.target).closest('.izbor-praga')) this.otvoriPrag(false)
    })
  }

  postavi(stavke, ture) {
    this.stavke = new Map(stavke.map(stavka => [stavka.spomenik.id, stavka]))
    this.definicije = ture
    this.osveziTure()
  }

  // nudi se samo tura sa bar tri stanice, a izabrana ostaje i kad prag smanji broj stanica
  osveziTure() {
    const ture = sastaviTure(this.definicije, [...this.stavke.values()].map(s => s.spomenik), this.pragVaznosti)
    this.prikaziSpisakTura(ture.filter(tura => tura.spomenici.length >= najmanjeStanica))
    const aktivna = ture.find(tura => tura.id === dajTuruId())
    if (aktivna) izaberiTuru({...aktivna, spomenici: this.redosledTure(aktivna.spomenici)})
    this.prikazi()
  }

  // cela Jugoslavija je prva, bez naslova, a ostale su po drzavi ili pokrajini: prvo oblasti, pa gradovi;
  // tura preko granice ide pod prvu navedenu drzavu, a gradska tura se prepoznaje po spisku naselja
  prikaziSpisakTura(ponudjene) {
    const iskorisceneSlike = new Set()
    const definicije = new Map(this.definicije.map(d => [d.id, d.oblast]))
    const grupe = new Map(this.definicije.map(d => [d.id, d.grupa ?? d.oblast.drzave[0]]))
    const cela = tura => {
      const oblast = definicije.get(tura.id)
      return oblast.drzave.length > 1 && !(oblast.mesta || oblast.granice || oblast.putanja || oblast.poligon)
    }
    const spisak = clanovi => {
      const ol = document.createElement('ol')
      ol.append(...clanovi.map(tura => this.praviTuru(tura, iskorisceneSlike)))
      return ol
    }
    const naslov = tekst => Object.assign(document.createElement('h3'), {textContent: tekst})
    const jugoslavija = ponudjene.filter(cela)
    const poDrzavama = grupeSpiska.flatMap(drzava => {
      const uDrzavi = ponudjene.filter(tura => !cela(tura) && grupe.get(tura.id) === drzava)
      const gradovi = uDrzavi.filter(tura => definicije.get(tura.id).mesta)
      return uDrzavi.length ? [naslov(nazivDrzave(drzava)), spisak([...uDrzavi.filter(tura => !gradovi.includes(tura)), ...gradovi])] : []
    })
    this.panel.querySelector('#spisak-tura').replaceChildren(...jugoslavija.length ? [spisak(jugoslavija)] : [], ...poDrzavama)
  }

  // id-jevi iz starijih podataka koji vise ne postoje se preskacu
  stanice() {
    return dajRutu().map(id => this.stavke.get(id)).filter(Boolean)
  }

  // prazna ruta nema sta da pokaze, pa se otvaraju ture
  otvori() {
    if (!siroko.matches) mapa.fire('izbor', {marker: null})
    this.prikaziKarticu(this.stanice().length ? 'planer' : 'ture')
    this.panel.hidden = false
  }

  prikaziKarticu(kartica) {
    this.kartica = kartica
    this.osveziKartice()
    this.panel.scrollTop = 0
  }

  osveziKartice() {
    // izabrana tura sa stalnim pragom ne zavisi od izbora praga
    const stalniPrag = this.definicije?.find(d => d.id === dajTuruId())?.prag
    this.panel.querySelector('#vaznost').hidden = this.kartica === 'planer' && (!dajTuruId() || Boolean(stalniPrag))
    const broj = this.stanice().length
    this.panel.querySelectorAll('[data-kartica]').forEach(kartica => {
      const izabrana = kartica.dataset.kartica === this.kartica
      kartica.setAttribute('aria-selected', String(izabrana))
      this.panel.querySelector(`#${kartica.dataset.kartica}`).hidden = !izabrana
    })
    this.panel.querySelector('[data-kartica="planer"]').textContent = broj ? `${t('trenutnaRuta')} · ${broj}` : t('trenutnaRuta')
  }

  prikazi() {
    const stanice = this.stanice()
    this.dugme.hidden = false
    this.dugme.textContent = stanice.length ? `${t('trenutnaRuta')} · ${stanice.length}` : t('izaberiTuru')
    this.osveziKartice()

    this.linija.setLatLngs(stanice.map(({marker}) => marker.dajPoziciju()))
    if (stanice.length > 1) this.linija.addTo(mapa)
    else this.linija.remove()
    this.brojevi.clearLayers()
    stanice.forEach(({marker}, i) => this.brojevi.addLayer(praviBroj(marker, i + 1)))

    this.lista.replaceChildren(...stanice.map((stavka, i) => this.praviRed(stavka, i, stanice.length)))
    const google = /** @type {HTMLAnchorElement} */ (this.panel.querySelector('#google'))
    google.href = googleUrl(stanice.map(({spomenik}) => spomenik))
    const ogranicenje = this.panel.querySelector('#ogranicenje')
    ogranicenje.hidden = stanice.length <= najviseZaGoogle
    ogranicenje.textContent = t('ogranicenje', najviseZaGoogle)
    this.panel.querySelector('#prazna').hidden = stanice.length > 0
    this.panel.querySelector('#prazna').innerHTML = t(dajTuruId() ? 'praznaAutomatskaTura' : 'praznaRuta')
    this.panel.querySelector('#ime-rute').textContent = prevedi(dajNaziv())
    this.panel.querySelector('#naslov-rute').hidden = !dajNaziv()
    const wiki = /** @type {HTMLAnchorElement} */ (this.panel.querySelector('#wiki-rute'))
    wiki.hidden = !dajWiki()
    if (dajWiki()) wiki.href = dajWiki()
    else wiki.removeAttribute('href')
    this.panel.querySelector('#nazad').hidden = !dajNaziv()
    this.panel.querySelector('.alati').hidden = !stanice.length
    this.panel.querySelector('footer').hidden = !stanice.length
    // gotova tura je vec poredjana, pa umesto redosleda nudi povratak na ture
    this.panel.querySelector('#redosled').hidden = stanice.length < 3 || Boolean(dajNaziv())
  }

  praviRed({spomenik, marker}, i, ukupno) {
    const red = document.createElement('li')
    red.innerHTML = `
      <span class="broj"></span>
      <button class="naziv"><span class="ime"></span><span class="opis"></span></button>
      <a class="navigacija" target="_blank" rel="noopener">${navigacijaIkonica}</a>
      <button class="gore" title="${t('gore')}" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="dole" title="${t('dole')}" ${i === ukupno - 1 ? 'disabled' : ''}>↓</button>
      <button class="ukloni" title="${t('ukloni')}">×</button>
    `
    const naziv = nazivSpomenika(spomenik)
    const navigacija = /** @type {HTMLAnchorElement} */ (red.querySelector('.navigacija'))
    navigacija.href = navigacijaUrl(spomenik.koordinate)
    navigacija.title = `${t('navigacija')}: ${naziv || spomenik.mesto}`
    navigacija.setAttribute('aria-label', navigacija.title)
    red.querySelector('.broj').textContent = i + 1
    red.querySelector('.ime').textContent = naziv || spomenik.mesto
    red.querySelector('.opis').textContent = [naziv && spomenik.mesto, naziviStanja[spomenik.stanje]].filter(Boolean).join(' · ')
    red.querySelector('.naziv').addEventListener('click', () => otvoriStanicu(marker))
    red.querySelector('.gore').addEventListener('click', () => pomeri(spomenik.id, -1))
    red.querySelector('.dole').addEventListener('click', () => pomeri(spomenik.id, 1))
    red.querySelector('.ukloni').addEventListener('click', () => ukloniIzRute(spomenik.id))
    return red
  }

  /** @param {import('../data/tipovi').Tura} tura */
  praviTuru({id, naziv, spomenici, wiki}, iskorisceneSlike) {
    const red = document.createElement('li')
    red.innerHTML = '<button class="naziv tura"><span class="tekst"><span class="ime"></span><span class="opis"></span></span></button>'
    const clanovi = spomenici.map(id => this.stavke.get(id)?.spomenik).filter(Boolean)
    const mesta = [...new Set(clanovi.map(s => s.mesto))]
    // fotografija koju ranije ture nisu uzele, da se ture razlikuju na prvi pogled
    const slika = (clanovi.find(s => s.slika && !iskorisceneSlike.has(s.slika)) ?? clanovi.find(s => s.slika))?.slika
    iskorisceneSlike.add(slika)
    if (slika) red.querySelector('.tura').prepend(Object.assign(new Image(), {src: malaSlika(slika), alt: '', loading: 'lazy'}))
    red.querySelector('.ime').textContent = prevedi(naziv)
    const opisMesta = mesta.slice(0, 4).join(', ') + (mesta.length > 4 ? '…' : '')
    red.querySelector('.opis').textContent = t('stanice', clanovi.length) + (opisMesta ? `: ${opisMesta}` : '')
    red.querySelector('button').addEventListener('click', () => {
      izaberiTuru({id, naziv, spomenici: this.redosledTure(spomenici), wiki})
      this.prikaziKarticu('planer')
      this.pokaziTuru()
    })
    return red
  }

  redosledTure(spomenici) {
    if (spomenici.length < 2) return spomenici
    const tacke = spomenici.map(id => this.stavke.get(id).marker.dajPoziciju())
    return this.usmeri([spomenici[0], ...najkraciRedosled(tacke[0], tacke.slice(1)).map(i => spomenici[i + 1])])
  }

  // jedini izuzetak od pravila da mapa sama ne menja zum: izabrana tura je obicno van vidnog polja
  // na telefonu panel prekriva vecinu mape, pa se zatvara da bi se tura videla cela
  pokaziTuru() {
    if (!siroko.matches) this.panel.hidden = true
    const desno = siroko.matches ? mapa.getSize().x - this.panel.getBoundingClientRect().left : 0
    const dole = mapa.getSize().y - this.dugme.getBoundingClientRect().top
    mapa.fitBounds(this.linija.getBounds(), {
      paddingTopLeft: [30, 80],
      paddingBottomRight: [desno + 30, dole + 20],
      maxZoom: 16,
    })
  }

  // tura se obilazi od kraja koji je blizi korisniku; bez lokacije ostaje kako je
  usmeri(spomenici) {
    const pozicije = spomenici.map(id => this.stavke.get(id)?.marker.dajPoziciju()).filter(Boolean)
    if (!this.pozicija || pozicije.length < 2) return spomenici
    const [prva, poslednja] = [pozicije[0], pozicije[pozicije.length - 1]]
    return this.pozicija.distanceTo(poslednja) < this.pozicija.distanceTo(prva) ? [...spomenici].reverse() : spomenici
  }

  // polazi od korisnika ako je lociran, inace prva stanica ostaje prva
  poredjaj() {
    const stanice = this.stanice()
    const tacke = stanice.map(({marker}) => marker.dajPoziciju())
    const redosled = this.pozicija
      ? najkraciRedosled(this.pozicija, tacke)
      : [0, ...najkraciRedosled(tacke[0], tacke.slice(1)).map(i => i + 1)]
    postaviRutu(redosled.map(i => stanice[i].spomenik.id))
  }
}

customElements.define('planer-rute', Ruta)
