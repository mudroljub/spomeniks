// @ts-check
// TODO: proslediti visina-slajdera kao props
import {t} from '../utils/jezik.js'

const style = document.createElement('style')

const inicijalnoSlika = Math.max(1, Math.round(window.innerWidth / 70))

style.textContent = `
  :host {
    align-items: center;
    bottom: var(--dno);
    display: flex;
    position: fixed;
    width: 100%;
  }

  /* svg umesto znaka iz fonta, jer veliki font strci ispod ekrana i pravi belu traku */
  .strelica {
    -moz-user-select: none;
    align-items: center;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    filter: drop-shadow(2px 2px 0 #000);
    height: var(--visina-slajdera);
    padding: 0 8px;
    position: absolute;
    top: 0;
    user-select: none;
    z-index: 1;
  }

  .strelica svg {
    height: calc(var(--visina-slajdera) * 0.7);
    width: calc(var(--visina-slajdera) * 0.32);
  }

  #strelica-desna {
    right: 0;
  }

  div {
    display: flex;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    touch-action: pan-x;
    user-select: none;
    width: 100%;
  }

  div::-webkit-scrollbar {
    display: none;
  }

  div.vucenje, div.vucenje * {
    cursor: grabbing;
  }

  nav-slika {
    flex: none;
    height: var(--visina-slajdera);
    min-width: 96px;
    position: relative;
    cursor: pointer;
  }

  div img {
    display: block;
    height: calc(var(--visina-slajdera) - 24px);
    min-width: 96px;
    object-fit: cover;
    width: auto;
    cursor: pointer;
  }

  nav-slika button {
    background: none;
    border: none;
    cursor: pointer;
    display: block;
    padding: 0;
  }

  nav-slika button:focus-visible {
    outline: 2px solid #fff;
    outline-offset: -2px;
  }

  nav-slika small {
    background: #29241e;
    bottom: 0;
    box-sizing: border-box;
    color: #fff;
    font: 12px/24px system-ui, sans-serif;
    left: 0;
    overflow: hidden;
    padding: 0 6px;
    position: absolute;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

`

const praviStrelicu = (tacke, naziv) => {
  const strelica = document.createElement('button')
  strelica.className = 'strelica'
  strelica.setAttribute('aria-label', naziv)
  strelica.innerHTML = `<svg viewBox="0 0 24 48" preserveAspectRatio="none" aria-hidden="true"><polygon points="${tacke}" fill="currentColor"/></svg>`
  return strelica
}

export default class Slajder extends HTMLElement {
  // slike su funkcije koje prave sliku, da se prave tek kad dodju na red
  constructor(slike) {
    super()
    this.slike = slike
    this.style.display = slike.length ? 'flex' : 'none'

    this.strelicaLeva = praviStrelicu('0,24 17,0 24,0 9,24 24,48 17,48', t('ranijeSlike'))
    this.strelicaDesna = praviStrelicu('24,24 7,0 0,0 15,24 0,48 7,48', t('sledeceSlike'))
    this.strelicaDesna.id = 'strelica-desna'
    this.traka = document.createElement('div')

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(this.strelicaLeva)
    this.shadowRoot.appendChild(this.strelicaDesna)
    this.shadowRoot.appendChild(this.traka)
    this.shadowRoot.appendChild(style)

    this.dodajDogadjaje()
  }

  connectedCallback() {
    this.dodajSlikeAkoTreba()
  }

  postavi(slike, zum = 0) {
    this.zum = zum
    if (slike.length === this.slike.length && slike.every((slika, i) => slika === this.slike[i])) {
      this.slike.slice(0, this.traka.children.length).forEach(dajSliku => dajSliku().prikaziNatpis(zum))
      return
    }
    this.slike = slike
    this.vucenje = null
    this.prevuceno = false
    this.traka.classList.remove('vucenje')
    this.traka.replaceChildren()
    this.traka.scrollLeft = 0
    this.style.display = slike.length ? 'flex' : 'none'
    this.dodajSlikeAkoTreba()
  }

  dodajDogadjaje() {
    this.mrdajLevo = this.mrdajLevo.bind(this)
    this.mrdajDesno = this.mrdajDesno.bind(this)

    this.strelicaLeva.addEventListener('click', this.mrdajDesno)
    this.strelicaDesna.addEventListener('click', this.mrdajLevo)

    this.traka.addEventListener('pointerdown', e => {
      this.prevuceno = false
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      this.vucenje = {id: e.pointerId, x: e.clientX, pocetak: this.traka.scrollLeft}
    })
    this.traka.addEventListener('pointermove', e => {
      if (!this.vucenje || e.pointerId !== this.vucenje.id) return
      const pomeraj = this.vucenje.x - e.clientX
      if (!this.prevuceno && Math.abs(pomeraj) < 5) return
      this.prevuceno = true
      this.traka.setPointerCapture(e.pointerId)
      this.traka.classList.add('vucenje')
      this.traka.scrollLeft = this.vucenje.pocetak + pomeraj
      e.preventDefault()
    })
    const zavrsiVucenje = () => {
      this.vucenje = null
      this.traka.classList.remove('vucenje')
    }
    this.traka.addEventListener('pointerup', zavrsiVucenje)
    this.traka.addEventListener('pointercancel', zavrsiVucenje)
    this.traka.addEventListener('lostpointercapture', zavrsiVucenje)
    this.traka.addEventListener('pointerleave', () => {
      if (!this.prevuceno) zavrsiVucenje()
    })
    this.traka.addEventListener('click', e => {
      if (!this.prevuceno) return
      e.preventDefault()
      e.stopPropagation()
    }, true)
    const ucitajAkoTreba = () => {
      if (this.traka.scrollWidth - this.traka.scrollLeft <= this.traka.clientWidth * 2) {
        this.dodajSlikeAkoTreba()
      }
    }
    this.traka.addEventListener('scroll', ucitajAkoTreba)
    this.traka.addEventListener('load', ucitajAkoTreba, true)
    this.traka.addEventListener('error', ucitajAkoTreba, true)
  }

  dodajSlikeAkoTreba() {
    const brojUnetihSlika = this.traka.children.length
    this.slike.slice(brojUnetihSlika, brojUnetihSlika + inicijalnoSlika)
      .forEach(dajSliku => {
        const slika = dajSliku()
        slika.prikaziNatpis(this.zum)
        this.traka.appendChild(slika)
      })
  }

  mrdaj(jelDesno) {
    this.dodajSlikeAkoTreba()

    const pomeraj = Math.round(this.traka.clientWidth / 2)
    this.traka.scrollBy({left: jelDesno ? -pomeraj : pomeraj, behavior: 'smooth'})
  }

  mrdajDesno() {
    this.mrdaj(true)
  }

  mrdajLevo() {
    this.mrdaj(false)
  }
}

customElements.define('nav-slajder', Slajder)
