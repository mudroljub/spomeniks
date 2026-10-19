// @ts-check
import {mapa} from '../klase/mapa.js'
import {navigacijaIkonica} from '../utils/ikonice.js'
import {stilZaglavlja} from '../utils/ui.js'
import {mestoUrl, navigacijaUrl, escapeHtml, naziviStanja, nestao, autoriSpomenika} from '../utils/helpers.js'
import {dajOznaku, postaviOznaku, promene} from '../utils/oznake.js'
import {uRuti, dodajURutu, ukloniIzRute, promeneRute} from '../utils/ruta.js'
import {jezik, t, nazivDrzave} from '../utils/jezik.js'
import {prijavaUrl} from '../utils/prijava.js'
import {clanakSpomenika} from '../utils/clanci.js'

const boja = '#822323'

const style = document.createElement('style')
style.textContent = `
  ${stilZaglavlja}
  :host {
    font: 16px system-ui, sans-serif;
  }

  #panel {
    background: #fffdf8;
    border-radius: 12px 12px 0 0;
    bottom: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    left: 0;
    max-height: 65%;
    overflow-y: auto;
    padding-bottom: var(--dno);
    position: fixed;
    right: 0;
    z-index: 1000;
  }

  @media (min-width: 600px) {
    #panel {
      border-radius: 12px;
      bottom: calc(var(--visina-slajdera) + var(--dno) + 10px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
      left: 10px;
      max-height: calc(100% - var(--visina-slajdera) - var(--dno) - 80px);
      right: auto;
      width: 360px;
    }
  }

  /* povratak postoji samo na telefonu, gde prozor spomenika prekriva rutu */
  #nazad {
    background: none;
    border: none;
    color: ${boja};
    cursor: pointer;
    font: inherit;
    min-height: 44px;
    padding: 0 16px;
  }

  #nazad + header {
    padding-top: 0;
  }

  @media (min-width: 600px) {
    #nazad {
      display: none;
    }

    #nazad + header {
      padding-top: 12px;
    }
  }

  /* dugme za zatvaranje stoji u uglu, da svojom visinom ne odmakne tekst od naslova */
  header {
    padding: 12px 44px 0 16px;
    position: relative;
  }

  h2 {
    margin: 4px 0 0;
  }

  #zatvori {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    flex: none;
    font-size: 28px;
    height: 44px;
    line-height: 1;
    position: absolute;
    right: 0;
    top: 4px;
    width: 44px;
  }

  .sadrzaj {
    container-type: inline-size;
    padding: 0 16px 16px;
  }

  .sadrzaj > p {
    margin: 6px 0;
  }

  .sadrzaj > p:last-child {
    margin-bottom: 0;
  }

  .stanje {
    background: #eee;
    border-radius: 4px;
    color: #555;
    display: inline-block;
    font-size: 13px;
    font-weight: normal;
    margin-left: 6px;
    padding: 2px 6px;
    vertical-align: middle;
  }

  .stanje.nestao {
    background: ${boja};
    color: #fff;
  }

  .mesto svg {
    color: #888;
    height: 16px;
    margin-right: 5px;
    vertical-align: -2px;
    width: 16px;
  }

  .sadrzaj > .podaci {
    color: #666;
    font-size: 14px;
    margin-top: 2px;
  }

  a {
    color: ${boja};
  }

  #dopuna {
    background: none;
    border: none;
    color: ${boja};
    cursor: pointer;
    font: inherit;
    min-height: 44px;
    padding: 0;
    text-decoration: underline;
  }

  /* okvir unapred ima oblik slike (slikaOdnos), da prozor ne skoci kad se slika ucita;
     uspravna slika nije visa od 4:3, da ne odgura dugmad ispod nje */
  .slika {
    aspect-ratio: 4 / 3;
    max-height: 75cqw;
    background: #ece9e1;
    border-radius: 8px 8px 0 0;
    margin: 12px 0 0;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  img {
    display: block;
    height: 100%;
    object-fit: contain;
    width: 100%;
  }

  /* licenca slika sa Wikimedije trazi ime autora; stoji preko slike, da ne odvoji sliku od oznaka */
  figcaption {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px 0 0 0;
    bottom: 0;
    box-sizing: border-box;
    color: #fff;
    font-size: 11px;
    max-width: 100%;
    overflow: hidden;
    padding: 2px 6px;
    position: absolute;
    right: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sadrzaj > .slika + .poseta {
    margin-top: 0;
  }

  .sadrzaj > .slika + .poseta .oznaka {
    border-radius: 0 0 9px 9px;
  }

  .sadrzaj > .akcije {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 14px 0 0;
  }

  .akcije a,
  .akcije button {
    background: none;
    border: 1px solid ${boja};
    border-radius: 20px;
    box-sizing: border-box;
    color: ${boja};
    cursor: pointer;
    font: inherit;
    min-height: 40px;
    padding: 8px 11px;
    text-decoration: none;
  }

  .akcije .ikona {
    align-items: center;
    display: inline-flex;
    gap: 5px;
  }

  .akcije .ikona svg {
    flex: none;
    height: 18px;
    width: 18px;
  }

  .akcije .glavna {
    background: ${boja};
    color: #fff;
  }

  button:focus-visible,
  a:focus-visible {
    outline: 2px solid ${boja};
    outline-offset: 3px;
  }

  .oznaka svg {
    flex: none;
    height: 18px;
    width: 18px;
  }

  .oznaka {
    background: #ece9e1;
    border-radius: 9px;
    box-sizing: border-box;
    display: flex;
    gap: 4px;
    padding: 4px;
    width: 100%;
  }

  .oznaka button {
    align-items: center;
    background: none;
    border: none;
    border-radius: 6px;
    color: #555;
    cursor: pointer;
    display: flex;
    flex: 1;
    font: 14px system-ui, sans-serif;
    gap: 6px;
    justify-content: center;
    min-height: 44px;
    min-width: 0;
    padding: 8px 6px;
  }

  .oznaka button:hover {
    background: #fffdf8;
  }

  .oznaka [data-oznaka="lista"][aria-pressed="true"] {
    background: #f2df9e;
    color: #594510;
  }

  .oznaka [data-oznaka="lista"][aria-pressed="true"] svg {
    fill: #f2b705;
  }

  .oznaka [data-oznaka="posetio"][aria-pressed="true"] {
    background: #355d48;
    color: #fff;
  }

  /* natpis je sklopljen, da dugacak tekst ne odgura dugmad */
  .natpis {
    color: #444;
    font-size: 14px;
    margin-top: 10px;
  }

  .natpis summary {
    color: ${boja};
    cursor: pointer;
    line-height: 44px;
    min-height: 44px;
  }

  /* novi red u natpisu je potpis, datum ili stih */
  .natpis p {
    margin: 0;
    white-space: pre-line;
  }

  .akcije #ruta[aria-pressed="true"] {
    background: #f3e1dc;
  }

  /* znak ima stalnu sirinu, da dugme ne promeni velicinu kad se pritisne */
  .akcije #ruta::before {
    content: '+';
    display: inline-block;
    width: 1em;
  }

  .akcije #ruta[aria-pressed="true"]::before {
    content: '✓';
  }
`

// pomera mapu tako da izabrani spomenik ostane vidljiv pored panela
const pokaziNaMapi = (marker, panel) => {
  const velicina = mapa.getSize()
  const okvir = panel.getBoundingClientRect()
  const cilj = okvir.left > 0
    ? L.point((velicina.x + okvir.right) / 2, velicina.y / 2)
    : L.point(velicina.x / 2, (velicina.y - okvir.height) / 2 + 25)
  const tacka = mapa.latLngToContainerPoint(marker.dajPoziciju())
  mapa.panBy(unutarGranica(tacka.subtract(cilj)))
}

// pomeraj ne izlazi van granica mape; inace mapa ode preko granice pa se vrati (Slovenija je uz zapadnu)
const unutarGranica = pomeraj => {
  const granice = mapa.options.maxBounds
  const zum = mapa.getZoom()
  const min = mapa.project(granice.getNorthWest(), zum)
  const max = mapa.project(granice.getSouthEast(), zum)
  const pogled = mapa.getPixelBounds()
  // kad je oblast uza od ekrana, Leaflet je centrira, pa i pomeraj ide na sredinu
  const ogranici = (vrednost, najmanje, najvise) => najmanje > najvise
    ? Math.round((najmanje + najvise) / 2)
    : Math.min(Math.max(vrednost, najmanje), najvise)
  return L.point(
    ogranici(pomeraj.x, min.x - pogled.min.x, max.x - pogled.max.x),
    ogranici(pomeraj.y, min.y - pogled.min.y, max.y - pogled.max.y),
  )
}

export default class Detalji extends HTMLElement {
  constructor() {
    super()
    this.panel = document.createElement('section')
    this.panel.id = 'panel'
    this.panel.hidden = true

    this.autori = {}
    this.posvete = {}

    this.attachShadow({mode: 'open'})
    this.shadowRoot.append(style, this.panel)

    mapa.on('izbor', ({marker, izRute}) => marker ? this.prikazi(marker, izRute) : this.sakrij())
    mapa.on('click', () => this.marker && mapa.fire('izbor', {marker: null}))
    promene.addEventListener('promena', () => this.marker && this.osveziOznake())
    promeneRute.addEventListener('promena', () => this.marker && this.osveziRutu())
  }

  prikazi(marker, izRute) {
    this.marker = marker
    const spomen = marker.spomen
    const podaci = [this.praviAutore(spomen), this.praviPosvetu(spomen)].filter(Boolean)

    const vise = clanakSpomenika(spomen, jezik)

    // naslov je naziv spomenika, a mesto stoji ispod; nazivEn namerno sadrzi HTML linkove, pa se ne escape-uje
    const naziv = jezik === 'en' && spomen.nazivEn ? spomen.nazivEn : spomen.naziv ? escapeHtml(spomen.naziv) : spomen.nazivEn || ''
    this.panel.innerHTML = `
      ${izRute ? `<button id="nazad">‹ ${t('trenutnaRuta')}</button>` : ''}
      <header>
        <h2>
          ${naziv || escapeHtml(spomen.mesto)}
          ${spomen.stanje ? `<span class="stanje ${nestao(spomen.stanje) ? 'nestao' : ''}">${naziviStanja[spomen.stanje]}</span>` : ''}
          ${vise ? `<a href="${escapeHtml(vise)}" target="_blank" class="vise">${t('vise')} ›</a>` : ''}
        </h2>
        <button id="zatvori" title="${t('zatvori')}">×</button>
      </header>
      <div class="sadrzaj">
        <p class="mesto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11.5 12 4.5l8.5 7M6 9.5V19.5h12V9.5M10 19.5v-5h4v5"/></svg>${[naziv ? escapeHtml(spomen.mesto) : '', escapeHtml(nazivDrzave(spomen.drzava || ''))].filter(Boolean).join(', ')}${spomen.priblizno ? ` (${t('priblizno').toLocaleLowerCase()})` : ''}${spomen.godina ? ` · ${escapeHtml(spomen.godina)}` : ''}</p>
        ${podaci.map(red => `<p class="podaci">${red}</p>`).join('')}
        <p class="akcije">
          <a href="${escapeHtml(navigacijaUrl(spomen.koordinate))}" target="_blank" class="glavna ikona">${navigacijaIkonica}${t('navigacija')}</a>
          <a href="${escapeHtml(mestoUrl(spomen))}" target="_blank" class="ikona"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-6.5-5.8-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21Z" stroke-linejoin="round"/><circle cx="12" cy="9.8" r="2.3"/></svg>${t('mesto')}</a>
          <button id="ruta"></button>
        </p>
        ${spomen.slika ? `
          <figure class="slika" ${spomen.slikaOdnos ? `style="aspect-ratio: ${spomen.slikaOdnos}"` : ''}>
            <img src="${escapeHtml(spomen.slika)}" alt="" onerror="this.parentNode.remove()">
            ${spomen.slikaPotpis ? `<figcaption>${t('foto')}: ${escapeHtml(spomen.slikaPotpis)}</figcaption>` : ''}
          </figure>
        ` : ''}
        <p class="poseta">
          <span class="oznaka" role="group" aria-label="${t('mojaPoseta')}">
            <button data-oznaka="lista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3.1 14.41 9.28 21.04 9.66 15.9 13.87 17.58 20.29 12 16.7 6.42 20.29 8.1 13.87 2.96 9.66 9.59 9.28Z" stroke-linejoin="round"/></svg>${t('lista')}</button>
            <button data-oznaka="posetio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/></svg>${t('posetio')}</button>
          </span>
        </p>
        ${spomen.natpis ? `<details class="natpis"><summary>${t('natpis')}</summary><p>${escapeHtml(spomen.natpis)}</p></details>` : ''}
        <p><button id="dopuna">${t('dopuniPodatke')}</button></p>
      </div>
    `
    this.panel.querySelector('#zatvori').addEventListener('click', () => mapa.fire('izbor', {marker: null}))
    this.panel.querySelector('#dopuna').addEventListener('click', () => {
      location.href = prijavaUrl(spomen)
    })
    this.panel.querySelector('#nazad')?.addEventListener('click', () => mapa.fire('otvoriRutu'))
    // ponovni dodir na izabranu oznaku je skida
    this.panel.querySelectorAll('[data-oznaka]').forEach(dugme => dugme.addEventListener('click', () =>
      postaviOznaku(spomen.id, dajOznaku(spomen.id) === dugme.dataset.oznaka ? null : dugme.dataset.oznaka)
    ))
    this.panel.querySelector('#ruta').addEventListener('click', () =>
      uRuti(spomen.id) ? ukloniIzRute(spomen.id) : dodajURutu(spomen.id)
    )
    this.osveziOznake()
    this.osveziRutu()

    this.panel.hidden = false
    this.panel.scrollTop = 0
    history.replaceState(null, '', `#${encodeURIComponent(spomen.id)}`)
    pokaziNaMapi(marker, this.panel)
  }

  // link autora je u posebnom spisku, jer isti autor ima vise spomenika
  postaviAutore(autori) {
    this.autori = autori
  }

  praviAutore(spomen) {
    const autori = autoriSpomenika(spomen)
    if (!autori.length) return ''
    const imena = autori.map(ime => {
      const imeLink = this.autori[ime]
        ? `<a href="${escapeHtml(this.autori[ime])}" target="_blank">${escapeHtml(ime)}</a>`
        : escapeHtml(ime)
      return imeLink
    }).join(' & ')
    return `${t(autori.length > 1 ? 'autori' : 'grupaAutor')}: ${imena}`
  }

  // licnosti, jedinice i dogadjaji su u posebnom spisku, jer jedna posveta ima vise spomenika
  postaviPosvete(posvete) {
    this.posvete = posvete
  }

  /** @param {Pick<import('../data/tipovi').Spomenik, 'posveta'>} spomen */
  praviPosvetu({posveta = []}) {
    if (typeof posveta === 'string') {
      return posveta.trim() ? `${t('posveta')}: ${escapeHtml(posveta)}` : ''
    }
    const stavke = posveta.map(q => this.posvete[q]).filter(Boolean)
    if (!stavke.length) return ''
    const linkovi = stavke.map(p => {
      const ime = jezik === 'en' && p.name || p.naziv
      const link = jezik === 'en' && p.wikiEn || p.wiki
      return `<a href="${escapeHtml(link)}" target="_blank">${escapeHtml(ime)}</a>`
    }).join(', ')
    return `${t('posveta')}: ${linkovi}`
  }

  sakrij() {
    this.marker = null
    this.panel.hidden = true
    history.replaceState(null, '', location.pathname + location.search)
  }

  osveziOznake() {
    this.panel.querySelectorAll('[data-oznaka]').forEach(dugme =>
      dugme.setAttribute('aria-pressed', String(dajOznaku(this.marker.spomen.id) === dugme.dataset.oznaka))
    )
  }

  osveziRutu() {
    const dugme = this.panel.querySelector('#ruta')
    const dodat = uRuti(this.marker.spomen.id)
    dugme.setAttribute('aria-pressed', dodat)
    dugme.textContent = t(dodat ? 'vecURuti' : 'dodajURutu')
  }

}

customElements.define('detalji-spomenika', Detalji)
