// Najmanje okruženje pregledača za module iz utils/, koji pri učitavanju čitaju localStorage i navigator.
// Uvozi se pre modula koji se testira; svaki test fajl node --test pokreće u zasebnom procesu.
class Skladiste {
  #vrednosti = new Map()
  getItem(kljuc) { return this.#vrednosti.has(kljuc) ? this.#vrednosti.get(kljuc) : null }
  setItem(kljuc, vrednost) { this.#vrednosti.set(kljuc, String(vrednost)) }
  removeItem(kljuc) { this.#vrednosti.delete(kljuc) }
  clear() { this.#vrednosti.clear() }
}

export const postaviNavigator = ({jezici = ['sr-RS'], userAgent = 'Mozilla/5.0 (Windows NT 10.0)'} = {}) =>
  Object.defineProperty(globalThis, 'navigator', {value: {languages: jezici, userAgent}, configurable: true, writable: true})

postaviNavigator()
globalThis.localStorage = new Skladiste()
globalThis.Element ??= class {}
globalThis.location ??= {reload() {}}
