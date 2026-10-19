// @ts-check
import {jezik, promeniJezik} from '../utils/jezik.js'

class Jezik extends HTMLElement {
  connectedCallback() {
    const drugi = jezik === 'sh' ? 'en' : 'sh'
    this.innerHTML = `
      <style>
        #jezik {
          background: #822323;
          border: 0;
          color: white;
          font: bold 12px system-ui, sans-serif;
          height: 44px;
          width: 44px;
          left: 10px;
          padding: 0;
          top: calc(150px + var(--vrh));
        }
      </style>
      <button class="ikonica" id="jezik" title="${drugi === 'sh' ? 'Srpskohrvatski' : 'English'}">${drugi.toUpperCase()}</button>
    `
    this.querySelector('button').addEventListener('click', () => promeniJezik(drugi))
  }
}

customElements.define('dugme-jezik', Jezik)
