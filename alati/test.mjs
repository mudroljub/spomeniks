// node --test alati/test.mjs — glavni tokovi aplikacije u Chrome-u bez prozora, na ekranu telefona
// pokrece sopstveni server, pa ne trazi nista upaljeno; traje oko pola minuta
import {test, before, after} from 'node:test'
import assert from 'node:assert/strict'
import {otvoriPregledac, pokreniServer, sleep} from './pregledac.mjs'

let pregledac, server
const greske = []

before(async () => {
  server = await pokreniServer()
  pregledac = await otvoriPregledac()
  const {send, slusaj} = pregledac
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 2, mobile: true})
  await send('Emulation.setTouchEmulationEnabled', {enabled: true})
  await send('Page.enable')
  await send('Runtime.enable')
  slusaj(m => { if (m.method === 'Runtime.exceptionThrown') greske.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text) })
})

after(() => {
  pregledac?.zatvori()
  server?.zatvori()
})

const izvrsi = izraz => pregledac.izvrsi(izraz)

// izraz se ponavlja dok ne vrati istinitu vrednost
const sacekaj = async (izraz, opis, rok = 15000) => {
  for (const kraj = Date.now() + rok; Date.now() < kraj; await sleep(200)) {
    const v = await izvrsi(izraz)
    if (v) return v
  }
  assert.fail(`nije se desilo: ${opis}`)
}

// prelaz na isti URL sa drugim #id ne ucitava stranicu ponovo, pa se ide preko prazne
const otvori = async (hash = '') => {
  await pregledac.send('Page.navigate', {url: 'about:blank'})
  await pregledac.send('Page.navigate', {url: server.adresa + hash})
  await sacekaj("document.querySelectorAll('.leaflet-marker-pane img').length", 'obelisci na mapi')
}

// prozori su web komponente, pa se elementi traze i u njihovom shadow DOM-u
const SVI = `[...document.querySelectorAll('*')].flatMap(e => e.shadowRoot ? [e, ...e.shadowRoot.querySelectorAll('*')] : [e])`
const BROJ = `document.body.innerText.match(/(\\d+) od \\d+/)?.[1]`

test('mapa prikazuje obeliske', async () => {
  await otvori()
  assert.ok(await izvrsi("document.querySelectorAll('.leaflet-marker-pane img').length") > 0)
})

test('link #id otvara prozor spomenika', async () => {
  await otvori('#banja-luka-maslesa')
  const prozor = "document.querySelector('detalji-spomenika').shadowRoot"
  const naslov = await sacekaj(`${prozor}.querySelector('h2')?.textContent.trim()`, 'naslov prozora')
  assert.match(naslov, /Masle/)
  assert.match(await izvrsi(`${prozor}.querySelector('.mesto').textContent`), /Banja Luka/)
})

test('stanje iz stare knjige prikazuje godinu i zaseban izvor', async () => {
  await otvori('#okucani')
  const prozor = "document.querySelector('detalji-spomenika').shadowRoot"
  const stanje = await sacekaj(`${prozor}.querySelector('.stanje')?.textContent`, 'datirano stanje')
  assert.match(stanje, /Hrženjak, 2002/)
  assert.match(await izvrsi(`${prozor}.querySelector('.stanje a').href`), /736\.php\?broj=52$/)
  await otvori('#banja-luka-maslesa')
  await sacekaj(`${prozor}.querySelector('h2')`, 'drugi spomenik')
  assert.equal(await izvrsi(`${prozor}.querySelector('.stanje a')?.textContent || ''`), '')
})

test('posveta prikazuje tekst bez HTML-a i zadržava postojeće wiki linkove', async () => {
  await otvori('#podgorica-tito')
  const detalji = "document.querySelector('detalji-spomenika')"
  const prozor = `${detalji}.shadowRoot`
  const red = `[...${prozor}.querySelectorAll('.podaci')].find(p => p.textContent.startsWith('Posvećeno:'))`
  const link = await sacekaj(`${red}?.querySelector('a')?.href`, 'wiki posveta')
  assert.match(link, /wikipedia\.org/)
  const opis = 'Za 52 omladinca strijeljana 23. jula 1944. <b>bez oznaka</b> & drugove.'
  await izvrsi(`(() => {
    const d = ${detalji}
    d.marker.spomen.posveta = ${JSON.stringify(opis)}
    d.prikazi(d.marker)
  })()`)
  assert.equal(await izvrsi(`${red}.textContent`), `Posvećeno: ${opis}`)
  assert.equal(await izvrsi(`${red}.querySelector('a, b')`), null)
  await otvori('#podgorica-tito')
  assert.equal(await sacekaj(`${red}?.querySelector('a')?.href`, 'wiki posveta posle opisa'), link)
})

test('pretraga suzi spomenike', async () => {
  await otvori()
  await izvrsi(`(() => { const p = document.querySelector('polje-pretraga input'); p.value = 'Tjentište'; p.dispatchEvent(new Event('input', {bubbles: true})) })()`)
  assert.ok(Number(await sacekaj(BROJ, 'broj pronađenih')) > 0)
})

test('pretraga nalazi i uklonjen spomenik, koji je bez pretrage sakriven', async () => {
  await otvori()
  await izvrsi(`(() => { const p = document.querySelector('polje-pretraga input'); p.value = 'prvom partizanskom tenku'; p.dispatchEvent(new Event('input', {bubbles: true})) })()`)
  assert.equal(Number(await sacekaj(BROJ, 'broj pronađenih')), 1)
})

test('filter po vrsti suzi spomenike', async () => {
  await otvori()
  await izvrsi(`${SVI}.find(e => e.tagName === 'BUTTON' && /Filteri|Filters/.test(e.textContent)).click()`)
  const filteri = "[...document.querySelectorAll('*')].find(e => e.shadowRoot?.querySelector('.grupe')).shadowRoot"
  await sacekaj(`${filteri}.querySelector('button.cip')`, 'čipovi filtera')
  await izvrsi(`${filteri}.querySelector('button.cip').click()`)
  assert.equal(await izvrsi(`${filteri}.querySelector('button.cip').getAttribute('aria-pressed')`), 'true')
  await izvrsi(`${filteri}.querySelector('#prikazi').click()`)
  assert.ok(Number(await sacekaj(BROJ, 'broj posle filtera')) > 0)
})

test('spomenik dodat u rutu daje Google link', async () => {
  await otvori('#banja-luka-maslesa')
  await sacekaj("document.querySelector('detalji-spomenika').shadowRoot.querySelector('#ruta')", 'dugme za rutu')
  await izvrsi("document.querySelector('detalji-spomenika').shadowRoot.querySelector('#ruta').click()")
  const link = await sacekaj("[...document.querySelectorAll('*')].find(e => e.shadowRoot?.querySelector('#google'))?.shadowRoot.querySelector('#google').href", 'Google link')
  assert.match(link, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=\d/)
})

test('prijava otvara pripremljen mejl, a dopuna uključuje postojeći spomenik', async () => {
  await otvori()
  const prijava = "document.querySelector('prijava-spomenika').shadowRoot"
  await izvrsi(`${prijava}.querySelector('#dugme').click()`)
  assert.equal(await izvrsi(`${prijava}.querySelector('#panel').hidden`), false)
  assert.equal(await izvrsi(`${prijava}.querySelector('[href^="mailto:"]')`), null)
  assert.doesNotMatch(await izvrsi(`${prijava}.innerHTML`), /[^\s]+@[^\s]+\.[a-z]{2,}/)
  const link = new URL(await izvrsi(`import('./utils/prijava.js').then(m => m.prijavaUrl())`))
  assert.equal(link.protocol, 'mailto:')
  assert.match(link.pathname, /^[^@]+@gmail\.com$/)
  assert.match(link.searchParams.get('body'), /Naziv spomenika \(obavezno\)/)
  assert.match(link.searchParams.get('body'), /Lokacija.*\(obavezno\)/)
  assert.match(link.searchParams.get('body'), /Opciono: fotografija, kategorija, opis/)
  assert.equal(await izvrsi(`${prijava}.querySelector('details').open`), false)
  await izvrsi(`${prijava}.querySelector('#kopiraj').click()`)
  const status = await sacekaj(`${prijava}.querySelector('#status').textContent`, 'kopiranje adrese ili ručna zamena')
  assert.ok(status === 'Adresa je kopirana.' || status === `Kopiraj adresu ručno: ${link.pathname}`)
  await izvrsi(`${prijava}.querySelector('#zatvori').click()`)
  assert.equal(await izvrsi(`${prijava}.querySelector('#panel').hidden`), true)
  assert.equal(await izvrsi(`${prijava}.activeElement.id`), 'dugme')
  await otvori('#banja-luka-maslesa')
  const detalji = "document.querySelector('detalji-spomenika').shadowRoot"
  await sacekaj(`${detalji}.querySelector('#dopuna')`, 'dugme za dopunu')
  assert.equal(await izvrsi(`${detalji}.querySelector('[href^="mailto:"]')`), null)
  assert.doesNotMatch(await izvrsi(`${detalji}.innerHTML`), /[^\s]+@gmail\.com/)
  const dopuna = new URL(await izvrsi(`import('./utils/prijava.js').then(m => m.prijavaUrl(document.querySelector('detalji-spomenika').marker.spomen))`))
  assert.equal(dopuna.pathname, link.pathname)
  assert.match(dopuna.searchParams.get('subject'), /Dopuna podataka:.*Masle/)
  assert.match(dopuna.searchParams.get('body'), /https:\/\/www.google.com\/maps\?q=\d/)
})

test('bez grešaka u aplikaciji', () => {
  assert.deepEqual(greske, [])
})
