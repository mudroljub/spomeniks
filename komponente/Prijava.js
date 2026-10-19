// @ts-check
import {mapa} from '../klase/mapa.js'
import {t} from '../utils/jezik.js'
import {mejl, prijavaUrl} from '../utils/prijava.js'

export default class Prijava extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = `
      <style>
        :host { font: 16px system-ui, sans-serif; }
        [hidden] { display: none !important; }
        button, a { -webkit-tap-highlight-color: transparent; }
        button { cursor: pointer; font: inherit; }
        #dugme {
          align-items: center; background: white; border: none; border-radius: 50%; box-shadow: 0 1px 4px #0006;
          display: flex; height: 44px; justify-content: center; padding: 0; width: 44px;
        }
        #dugme svg { height: 26px; width: 26px; }
        #panel {
          background: #fffdf8; border-radius: 12px 12px 0 0;
          bottom: 0; box-shadow: 0 -2px 8px #0005; box-sizing: border-box;
          color: #333; left: 0; max-height: 75dvh; overflow-y: auto;
          padding: 0 16px calc(16px + var(--dno)); position: fixed; right: 0; z-index: 1001;
        }
        header { align-items: center; display: flex; justify-content: space-between; gap: 12px; }
        h2 { color: #222; font-size: 20px; margin: 16px 0; }
        #zatvori { background: none; border: none; font-size: 28px; height: 44px; width: 44px; flex: none; }
        p { line-height: 1.5; margin: 0 0 12px; }
        a { color: #822323; overflow-wrap: anywhere; }
        #mejl {
          background: #822323; border-radius: 22px; color: white; display: block;
          border: none; line-height: 24px; padding: 10px 16px; text-align: center; width: 100%;
        }
        .adresa { font-size: 14px; margin: 8px 0 16px; text-align: center; }
        #kopiraj { background: none; border: none; color: #822323; min-height: 44px; text-decoration: underline; }
        #status { display: block; overflow-wrap: anywhere; }
        details { border-top: 1px solid #ddd; margin-top: 12px; padding-top: 8px; }
        summary { cursor: pointer; min-height: 44px; align-content: center; }
        :focus-visible { outline: 2px solid #822323; outline-offset: 3px; }
        @media (min-width: 600px) {
          #panel {
            border-radius: 12px; bottom: calc(var(--visina-slajdera) + var(--dno) + 10px);
            left: 10px; right: auto; width: 360px;
          }
        }
      </style>
      <button id="dugme" aria-expanded="false" aria-controls="panel" aria-label="${t('prijavaNaslov')}" title="${t('prijavaNaslov')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 21s-6.5-5.8-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21Z" stroke-linejoin="round"/><path d="M12 7v5.6M9.2 9.8h5.6"/></svg></button>
      <section id="panel" aria-labelledby="naslov" hidden>
        <header><h2 id="naslov">${t('prijavaNaslov')}</h2><button id="zatvori" aria-label="${t('zatvori')}">×</button></header>
        <p>${t('prijavaUputstvo')}</p>
        <button id="mejl">${t('prijavaOtvoriMejl')}</button>
        <p class="adresa"><button id="kopiraj">${t('prijavaKopiraj')}</button><span id="status" role="status"></span></p>
        <details><summary>${t('prijavaBonus')}</summary><p>${t('prijavaGoogle')}</p></details>
      </section>
    `
    this.dugme = this.shadowRoot.querySelector('#dugme')
    this.panel = this.shadowRoot.querySelector('#panel')
    this.dugme.addEventListener('click', () => this.prikazi(this.panel.hidden))
    this.shadowRoot.querySelector('#mejl').addEventListener('click', () => {
      location.href = prijavaUrl()
    })
    this.shadowRoot.querySelector('#kopiraj').addEventListener('click', async () => {
      const status = this.shadowRoot.querySelector('#status')
      try {
        await navigator.clipboard.writeText(mejl())
        status.textContent = t('prijavaKopirano')
      } catch {
        status.textContent = `${t('prijavaKopirajRucno')}: ${mejl()}`
      }
    })
    this.shadowRoot.querySelector('#zatvori').addEventListener('click', () => this.prikazi(false, true))
    this.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !this.panel.hidden) this.prikazi(false, true)
    })
    mapa.on('click izbor otvoriRutu', () => this.prikazi(false))
  }

  prikazi(otvoren, vratiFokus = false) {
    this.panel.hidden = !otvoren
    this.dugme.setAttribute('aria-expanded', String(otvoren))
    if (otvoren) this.shadowRoot.querySelector('#zatvori').focus()
    else if (vratiFokus) this.dugme.focus()
  }
}

customElements.define('prijava-spomenika', Prijava)
