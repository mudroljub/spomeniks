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

test('približna lokacija ima upitnik preko ikonice i istu oznaku u legendi', async () => {
  await otvori('#kikinda-sumica-spomenik-nob')
  const detalji = "document.querySelector('detalji-spomenika').shadowRoot"
  await sacekaj(`${detalji}.querySelector('.mesto')?.textContent.includes('(bez tačne lokacije)')`, 'napomena o približnoj lokaciji')
  assert.ok(await izvrsi("document.querySelector('.priblizna-lokacija.izabran img').getBoundingClientRect().height") > 20)
  const slika = await izvrsi("document.querySelector('.priblizna-lokacija.izabran .oznaka-priblizno').getAttribute('src')")
  assert.equal(await izvrsi("document.querySelector('.priblizna-lokacija.izabran .oznaka-priblizno').getBoundingClientRect().width"), 8)
  assert.ok(await izvrsi(`(() => {
    const el = document.querySelector('.priblizna-lokacija.izabran')
    const ikonica = el.querySelector('img').getBoundingClientRect()
    const oznaka = el.querySelector('.oznaka-priblizno').getBoundingClientRect()
    return oznaka.top < ikonica.bottom && oznaka.bottom <= ikonica.bottom && oznaka.left >= ikonica.left && oznaka.right <= ikonica.right
  })()`))
  await izvrsi(`${detalji}.querySelector('#zatvori').click()`)
  await izvrsi("document.querySelector('.priblizna-lokacija').click()")
  await sacekaj(`${detalji}.querySelector('.mesto')?.textContent.includes('(bez tačne lokacije)') && !${detalji}.querySelector('#panel').hidden`, 'otvaranje tačke')
  await izvrsi(`${detalji}.querySelector('#zatvori').click()`)
  const legenda = "document.querySelector('dugme-legenda').shadowRoot"
  await izvrsi(`${legenda}.querySelector('#dugme').click()`)
  assert.ok(await izvrsi(`[...${legenda}.querySelectorAll('img')].some(img => img.getAttribute('src') === ${JSON.stringify(slika)})`))
})

test('približne lokacije u Beloj Crkvi ne prekrivaju precizni spomenik', async () => {
  await otvori('#bela-crkva-start-uprising')
  await sacekaj("document.querySelector('detalji-spomenika').marker?.spomen.id === 'bela-crkva-start-uprising'", 'Bela Crkva')
  for (const zum of [11, 10, 12]) {
    const rezultat = await izvrsi(`import('./klase/mapa.js').then(({mapa}) => {
      mapa.setZoom(${zum}, {animate: false})
      const marker = document.querySelector('detalji-spomenika').marker
      const tacni = marker.element.getElement().getBoundingClientRect()
      const priblizni = [...document.querySelectorAll('.priblizna-lokacija')]
      return {
        broj: priblizni.length,
        preklapanja: priblizni.filter(el => {
          const r = el.getBoundingClientRect(), oznaka = el.querySelector('.oznaka-priblizno').getBoundingClientRect()
          return r.left < tacni.right && r.right > tacni.left && r.top < tacni.bottom && Math.max(r.bottom, oznaka.bottom) > tacni.top
        }).length,
        pozicija: marker.dajPoziciju(), koordinate: marker.spomen.koordinate,
      }
    })`)
    assert.ok(rezultat.broj >= 3)
    assert.equal(rezultat.preklapanja, 0, `preklapanje na zumu ${zum}`)
    assert.deepEqual(rezultat.pozicija, rezultat.koordinate)
  }
})

test('tematske ture imaju wiki članak, stanice i vezu posle ponovnog otvaranja', async () => {
  for (const [naziv, broj, clanak] of [
    ['Beograd u NOB', 8, 'Beograd_u_Narodnooslobodila'],
    ['Slavonija u NOB', 7, 'Slavonija_u_Narodnooslobodila'],
  ]) {
    await otvori()
    const ruta = "document.querySelector('planer-rute').shadowRoot"
    await izvrsi(`${ruta}.querySelector('#dugme').click()`)
    await izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').click()`)
    const red = `[...${ruta}.querySelectorAll('#spisak-tura li')].find(li => li.querySelector('.ime').textContent === ${JSON.stringify(naziv)})`
    assert.equal(await izvrsi(`${red}.querySelector('a')`), null)
    await izvrsi(`${red}.querySelector('button').click()`)
    assert.equal(await izvrsi(`${ruta}.querySelectorAll('#stanice li').length`), broj)
    assert.match(await izvrsi(`${ruta}.querySelector('#wiki-rute').href`), new RegExp(clanak))
    assert.equal(await izvrsi(`${ruta}.querySelector('#wiki-rute').hidden`), false)
    await otvori()
    assert.equal(await izvrsi(`${ruta}.querySelector('#ime-rute').textContent`), naziv)
    assert.match(await izvrsi(`${ruta}.querySelector('#wiki-rute').href`), new RegExp(clanak))
  }
  await izvrsi("import('./utils/ruta.js').then(m => m.postaviRutu([]))")
})

test('gradska tura Niša se približava uz sve stanice na vidljivom delu mape', async () => {
  await otvori()
  const ruta = "document.querySelector('planer-rute').shadowRoot"
  await izvrsi(`${ruta}.querySelector('#dugme').click();${ruta}.querySelector('[data-kartica="ture"]').click()`)
  await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].find(li => li.querySelector('.ime').textContent === 'Niš u NOB').querySelector('button').click()`)
  await sacekaj("import('./klase/mapa.js').then(({mapa}) => mapa.getZoom() > 11)", 'bliži prikaz gradske ture')
  await sleep(400)
  const provera = await izvrsi(`Promise.all([import('./klase/mapa.js'), fetch('data/spomeniks.json').then(r => r.json()), import('./utils/ruta.js')]).then(([{mapa}, spomenici, {dajRutu}]) => {
    const dno = ${ruta}.querySelector('#dugme').getBoundingClientRect().top - 20
    return spomenici.filter(s => dajRutu().includes(s.id)).map(s => {
      const p = mapa.latLngToContainerPoint(s.koordinate)
      return p.x >= 29 && p.x <= innerWidth - 29 && p.y >= 79 && p.y <= dno + 1
    })
  })`)
  assert.equal(provera.length, 6)
  assert.ok(provera.every(Boolean))
})

test('svaka stanica ima direktnu navigaciju nezavisnu od cele ture', async () => {
  await otvori()
  const ruta = "document.querySelector('planer-rute').shadowRoot"
  await izvrsi(`${ruta}.querySelector('#dugme').click();${ruta}.querySelector('[data-kartica="ture"]').click()`)
  await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].find(li => li.querySelector('.ime').textContent === 'Niš u NOB').querySelector('button').click()`)
  const podaci = await izvrsi(`Promise.all([fetch('data/spomeniks.json').then(r => r.json()), import('./utils/ruta.js')]).then(([spomenici, {dajRutu}]) => {
    const ids = dajRutu()
    return ids.map(id => spomenici.find(s => s.id === id))
  })`)
  const linkovi = await izvrsi(`[...${ruta}.querySelectorAll('#stanice .navigacija')].map(a => ({href:a.href, label:a.getAttribute('aria-label'),target:a.target}))`)
  assert.ok(linkovi.length > 3)
  assert.equal(linkovi.length, podaci.length)
  linkovi.forEach((link, i) => {
    const url = new URL(link.href)
    assert.equal(url.searchParams.get('destination'), `${podaci[i].koordinate.lat},${podaci[i].koordinate.lng}`)
    assert.equal(url.searchParams.get('waypoints'), null)
    assert.match(link.label, /^Navigacija:/)
    assert.equal(link.target, '_blank')
  })
  const prva = linkovi[0].href
  await izvrsi(`${ruta}.querySelector('#stanice li:last-child .gore').click()`)
  assert.equal(await izvrsi(`${ruta}.querySelector('#stanice li:first-child .navigacija').href`), prva)
  const poslednji = new URL(await izvrsi(`${ruta}.querySelector('#stanice li:last-child .navigacija').href`))
  assert.equal(poslednji.searchParams.get('destination'), `${podaci.at(-2).koordinate.lat},${podaci.at(-2).koordinate.lng}`)
})

test('bez grešaka u aplikaciji', () => {
  assert.deepEqual(greske, [])
})
