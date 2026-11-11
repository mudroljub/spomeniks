// @ts-check
import {mapa} from '../klase/mapa.js'
import {navigacijaIkonica} from '../utils/ikonice.js'
import {stilZaglavlja, stilPanela, upravljajPanelom} from '../utils/ui.js'
import {mestoUrl, navigacijaUrl, escapeHtml, naziviStanja, nestao, ruine, autoriSpomenika, nazivSpomenika, bezbedanLink} from '../utils/helpers.js'
import {dajOznaku, postaviOznaku, promene} from '../utils/oznake.js'
import {uRuti, dodajURutu, ukloniIzRute, promeneRute} from '../utils/ruta.js'
import {jezik, t, nazivDrzave} from '../utils/jezik.js'
import {prijavaUrl} from '../utils/prijava.js'
import {clanakSpomenika} from '../utils/clanci.js'

const style = document.createElement('style')
style.textContent = `
  ${stilZaglavlja}
  ${stilPanela}
  :host {
    font: 16px system-ui, sans-serif;
  }

  #panel {
    background: #fffdf8;
    box-sizing: border-box;
    max-height: 65%;
    overflow-y: auto;
    padding-bottom: var(--dno);
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

  #nazad {
    background: none;
    border: none;
    color: var(--boja);
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

  .stanje.upozorenje {
    background: #fff;
    border: 1px solid #c62828;
    color: #c62828;
    font-weight: bold;
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

  .podaci a {
    color: inherit;
    text-decoration: none;
  }

  .opis {
    align-items: flex-end;
    cursor: pointer;
    display: flex;
    gap: 4px;
  }

  .opis .tekst {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    line-clamp: 2;
    overflow: hidden;
  }

  .opis svg {
    color: var(--boja);
    flex: none;
    height: 22px;
    transition: transform 0.2s;
    width: 22px;
  }

  .opis[aria-expanded="true"] .tekst {
    -webkit-line-clamp: unset;
    line-clamp: none;
  }

  .opis[aria-expanded="true"] svg {
    transform: rotate(180deg);
  }

  .opis.ceo {
    cursor: auto;
  }

  .opis.ceo svg {
    display: none;
  }

  a {
    color: var(--boja);
  }

  #dopuna {
    background: none;
    border: none;
    color: var(--boja);
    cursor: pointer;
    font: inherit;
    min-height: 44px;
    padding: 0;
    text-decoration: underline;
  }

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
    border: 1px solid var(--boja);
    border-radius: 20px;
    box-sizing: border-box;
    color: var(--boja);
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
    background: var(--boja);
    color: #fff;
  }

  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--boja);
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

  .natpis {
    color: #444;
    font-size: 14px;
    margin-top: 10px;
  }

  .natpis summary {
    color: var(--boja);
    cursor: pointer;
    line-height: 44px;
    min-height: 44px;
  }

  .natpis p {
    margin: 0;
    white-space: pre-line;
  }

  .akcije #ruta[aria-pressed="true"] {
    background: #f3e1dc;
  }

  .akcije #ruta::before {
    content: '+';
    display: inline-block;
    width: 1em;
  }

  .akcije #ruta[aria-pressed="true"]::before {
    content: '✓';
  }
`

const pokaziNaMapi = (marker, panel) => {
  const velicina = mapa.getSize()
  const okvir = panel.getBoundingClientRect()
  const cilj = okvir.left > 0
    ? L.point((velicina.x + okvir.right) / 2, velicina.y / 2)
    : L.point(velicina.x / 2, (velicina.y - okvir.height) / 2 + 25)
  const tacka = mapa.latLngToContainerPoint(marker.dajPoziciju())
  mapa.panBy(unutarGranica(tacka.subtract(cilj)))
}

const unutarGranica = pomeraj => {
  const granice = mapa.options.maxBounds
  const zum = mapa.getZoom()
  const min = mapa.project(granice.getNorthWest(), zum)
  const max = mapa.project(granice.getSouthEast(), zum)
  const pogled = mapa.getPixelBounds()
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
    upravljajPanelom(this.panel, () => mapa.fire('izbor', {marker: null}),
      () => nazivSpomenika(this.marker?.spomen || {}), () => mapa.getContainer())

    mapa.on('izbor', ({marker, izRute}) => marker ? this.prikazi(marker, izRute) : this.sakrij())
    mapa.on('click', () => this.marker && mapa.fire('izbor', {marker: null}))
    promene.addEventListener('promena', () => this.marker && this.osveziOznake())
    promeneRute.addEventListener('promena', () => this.marker && this.osveziRutu())
    const prosiri = e => {
      const opis = e.target.closest?.('.opis')
      if (!opis || opis.classList.contains('ceo') || e.target.closest('a')) return
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      opis.setAttribute('aria-expanded', String(opis.getAttribute('aria-expanded') !== 'true'))
    }
    this.panel.addEventListener('click', prosiri)
    this.panel.addEventListener('keydown', prosiri)
  }

  prikazi(marker, izRute) {
    this.marker = marker
    this.izRute = izRute
    this.iscrtaj()
    this.panel.hidden = false
    this.oznaciCeoOpis()
    this.panel.scrollTop = 0
    history.replaceState(null, '', `#${encodeURIComponent(marker.spomen.id)}`)
    pokaziNaMapi(marker, this.panel)
  }

  osvezi() {
    if (!this.marker || this.panel.hidden) return
    const skrol = this.panel.scrollTop
    this.iscrtaj()
    this.oznaciCeoOpis()
    this.panel.scrollTop = skrol
  }

  iscrtaj() {
    const spomen = this.marker.spomen
    const izRute = this.izRute
    const vise = clanakSpomenika(spomen, jezik)

    const naziv = escapeHtml(nazivSpomenika(spomen))
    this.panel.innerHTML = `
      ${izRute ? `<button id="nazad">‹ ${t('trenutnaRuta')}</button>` : ''}
      <header>
        <h2>
          <span class="ime">${naziv || escapeHtml(spomen.mesto)}</span>
          ${spomen.stanje ? `<span class="stanje ${nestao(spomen.stanje) || ruine(spomen.stanje) ? 'upozorenje' : ''}">${nestao(spomen.stanje) || ruine(spomen.stanje) ? '⚠ ' : ''}${naziviStanja[spomen.stanje]}</span>` : ''}
          ${vise ? `<a href="${escapeHtml(vise)}" target="_blank" class="vise">${t('vise')} ›</a>` : ''}
        </h2>
        <button id="zatvori" title="${t('zatvori')}">×</button>
      </header>
      <div class="sadrzaj">
        <p class="mesto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11.5 12 4.5l8.5 7M6 9.5V19.5h12V9.5M10 19.5v-5h4v5"/></svg>${[naziv ? escapeHtml(spomen.mesto) : '', escapeHtml(nazivDrzave(spomen.drzava || ''))].filter(Boolean).join(', ')}${spomen.priblizno ? ` (${t('priblizno').toLocaleLowerCase()})` : ''}${spomen.godina ? ` · ${escapeHtml(spomen.godina)}` : ''}</p>
        ${this.redoviPodataka(spomen).map(red => `<p class="podaci">${red}</p>`).join('')}
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
    this.panel.querySelectorAll('[data-oznaka]').forEach(dugme => dugme.addEventListener('click', () =>
      postaviOznaku(spomen.id, dajOznaku(spomen.id) === dugme.dataset.oznaka ? null : dugme.dataset.oznaka)
    ))
    this.panel.querySelector('#ruta').addEventListener('click', () =>
      uRuti(spomen.id) ? ukloniIzRute(spomen.id) : dodajURutu(spomen.id)
    )
    this.osveziOznake()
    this.osveziRutu()
  }

  postaviAutore(autori) {
    this.autori = autori
    this.osveziPodatke()
  }

  praviAutore(spomen) {
    const autori = autoriSpomenika(spomen)
    if (!autori.length) return ''
    const imena = autori.map(ime => {
      const link = bezbedanLink(this.autori[ime])
      return link
        ? `<a href="${escapeHtml(link)}" target="_blank">${escapeHtml(ime)}</a>`
        : escapeHtml(ime)
    }).join(' & ')
    return `${t(autori.length > 1 ? 'autori' : 'grupaAutor')}: ${imena}`
  }

  postaviPosvete(posvete) {
    this.posvete = posvete
    this.osveziPodatke()
  }

  /** @param {Pick<import('../data/tipovi').Spomenik, 'opis'>} spomen */
  opisSpomenika({opis}) {
    return (jezik === 'en' ? opis?.en : opis?.sh) || ''
  }

  oznaciCeoOpis() {
    const opis = this.panel.querySelector('.opis')
    const tekst = opis?.querySelector('.tekst')
    if (tekst && tekst.scrollHeight <= tekst.clientHeight + 1) opis.classList.add('ceo')
  }

  redoviPodataka(spomen) {
    return [escapeHtml(spomen.adresa || ''), this.praviAutore(spomen), this.praviPosvetu(spomen), this.praviOpis(spomen)].filter(Boolean)
  }

  osveziPodatke() {
    if (!this.marker) return
    this.panel.querySelectorAll('.podaci').forEach(red => red.remove())
    this.panel.querySelector('.mesto').after(...this.redoviPodataka(this.marker.spomen).map(html => {
      const red = document.createElement('p')
      red.className = 'podaci'
      red.innerHTML = html
      return red
    }))
    this.oznaciCeoOpis()
  }

  linkPosvete(q, tekst) {
    const p = this.posvete[q]
    const link = p && bezbedanLink(jezik === 'en' && p.wikiEn || p.wiki)
    return link ? `<a href="${escapeHtml(link)}" target="_blank">${tekst}</a>` : tekst
  }

  /** @param {Pick<import('../data/tipovi').Spomenik, 'posveta' | 'opis'>} spomen */
  praviPosvetu(spomen) {
    const {posveta = []} = spomen
    if (typeof posveta === 'string') return posveta.trim() ? `${t('posveta')}: ${escapeHtml(posveta.trim())}` : ''
    const uOpisu = this.opisSpomenika(spomen)
    const linkovi = posveta.filter(q => this.posvete[q] && !uOpisu.includes(`](${q})`)).map(q => {
      const p = this.posvete[q]
      return this.linkPosvete(q, escapeHtml(jezik === 'en' && p.naziv.en || p.naziv.sh))
    }).join(', ')
    return linkovi ? `${t('posveta')}: ${linkovi}` : ''
  }

  /** @param {Pick<import('../data/tipovi').Spomenik, 'opis'>} spomen */
  praviOpis(spomen) {
    const opis = this.opisSpomenika(spomen)
    if (!opis) return ''
    const tekst = escapeHtml(opis).replace(/\[([^\]]+)\]\((Q\d+)\)/g, (_, deo, q) => this.linkPosvete(q, deo))
    return `<span class="opis" tabindex="0" aria-expanded="false"><span class="tekst">${tekst}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>`
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
    dugme.setAttribute('aria-pressed', String(dodat))
    dugme.textContent = t(dodat ? 'vecURuti' : 'dodajURutu')
  }

}

customElements.define('detalji-spomenika', Detalji)
