// node --test testovi/e2e — glavni tokovi aplikacije u Chrome-u bez prozora, na ekranu telefona
// pokrece sopstveni server, pa ne trazi nista upaljeno; traje oko pola minuta
import {test, before, after} from 'node:test'
import assert from 'node:assert/strict'
import {otvoriPregledac, pokreniServer, sleep} from '../../alati/pregledac.mjs'

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
  await sacekaj("document.documentElement.dataset.podaci === 'svi'", 'svi podaci')
}

const BROJ = `document.body.innerText.match(/(\\d+) od \\d+/)?.[1]`

test('mapa prikazuje obeliske', async () => {
  await otvori()
  assert.ok(await izvrsi("document.querySelectorAll('.leaflet-marker-pane img').length") > 0)
  const poruka = "document.querySelector('planer-rute').shadowRoot.querySelector('#prazna')"
  assert.equal(await izvrsi(`${poruka}.querySelector('b')?.textContent`), 'U rutu')
  assert.ok(!(await izvrsi(`${poruka}.textContent`)).includes('<b>'))
})

test('istaknuto groblje zadržava ikonicu i ulazi u oba filtera i najviši prag ture', async () => {
  await otvori('#mostar-partisan-cemetery')
  const rezultat = await izvrsi(`(async () => {
    const s = document.querySelector('planer-rute').stavke.get('mostar-partisan-cemetery').spomenik
    const {izgledMarkera} = await import('./utils/ikonice.js')
    const {pripadaVrsti, najmanjiZum} = await import('./utils/vaznost.js')
    const {izaberiStanice} = await import('./utils/ture.js')
    return {vrsta: s.vrsta, istaknut: s.istaknut, ikonica: izgledMarkera(s).slika,
      zum: najmanjiZum(s), 'spomen-groblje': pripadaVrsti(s, 'spomen-groblje'), istaknuti: pripadaVrsti(s, 'istaknut'),
      uTuri: izaberiStanice([s], {drzave: [s.drzava]}, 'istaknut').length,
      marker: document.querySelector('detalji-spomenika').marker.izgled.slika}
  })()`)
  assert.deepEqual(rezultat, {vrsta: 'spomen-groblje', istaknut: true, ikonica: 'slike/markeri/spomen-groblje-postoji.svg',
    zum: 0, 'spomen-groblje': true, istaknuti: true, uTuri: 1, marker: 'slike/markeri/spomen-groblje-postoji.svg'})
})

test('oznake vrsta prate UI nazive i sve njihove ikonice postoje', async () => {
  await otvori()
  const greskeVrsta = await izvrsi(`(async () => {
    const {vrstePoVaznosti} = await import('./utils/vaznost.js')
    const {t} = await import('./utils/jezik.js')
    const {izgledMarkera} = await import('./utils/ikonice.js')
    const greske = []
    for (const vrsta of vrstePoVaznosti) {
      const naziv = t(vrsta + 'Jednina').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()
      if (naziv !== vrsta) greske.push(vrsta + ': ' + naziv)
      for (const stanje of [undefined, 'rusevine', 'uklonjen']) {
        const {slika} = izgledMarkera({vrsta, stanje})
        if (!(await fetch(slika)).ok) greske.push(slika)
      }
    }
    return greske
  })()`)
  assert.deepEqual(greskeVrsta, [])
})

test('Više vodi na članak o spomeniku, a bez članka se ne prikazuje', async () => {
  const prozor = "document.querySelector('detalji-spomenika').shadowRoot"
  for (const [id, link] of [
    ['beograd-spomen-park-topovske-supe', 'https://www.danubeogradu.rs/2021/01/kultura-secanja-info-tabla-o-logoru-topovske-supe/'],
    ['kolasin-spomenik-veljku-vlahovicu', 'https://skulptura-hronologijaizlaganja.rs/spomenik-veljku-vlahovicu-kolasin/'],
    ['boris-kidric-square', null],
  ]) {
    await otvori('#' + id)
    await sacekaj("document.querySelector('detalji-spomenika').marker?.spomen.id === " + JSON.stringify(id), 'otvoren spomenik')
    assert.equal(await izvrsi(`${prozor}.querySelector('a.vise')?.href ?? null`), link)
  }
  const neispravni = await izvrsi(`import('./utils/clanci.js').then(({jeClanak,clanakSpomenika}) =>
    [...document.querySelector('planer-rute').stavke.values()].flatMap(({spomenik:s}) => {
      const greske = ['wiki','wikiEn','clanak'].filter(f=>s[f]&&!jeClanak(s[f]))
      if (!s.wiki&&!s.wikiEn&&!s.clanak&&clanakSpomenika(s)) greske.push('rezervni izvor')
      return greske.map(f=>s.id+': '+f)
    }))`)
  assert.deepEqual(neispravni, [])
})

test('link #id otvara prozor spomenika', async () => {
  await otvori('#banja-luka-maslesa')
  const prozor = "document.querySelector('detalji-spomenika').shadowRoot"
  const naslov = await sacekaj(`${prozor}.querySelector('h2')?.textContent.trim()`, 'naslov prozora')
  assert.match(naslov, /Masle/)
  assert.match(await izvrsi(`${prozor}.querySelector('.mesto').textContent`), /Banja Luka/)
})

test('stanje se prikazuje bez izvora i godine izdanja', async () => {
  await otvori('#okucani')
  const prozor = "document.querySelector('detalji-spomenika').shadowRoot"
  const stanje = await sacekaj(`${prozor}.querySelector('.stanje')?.textContent`, 'stanje spomenika')
  assert.ok(stanje.trim())
  assert.doesNotMatch(stanje, /Hrženjak|2002/)
  assert.equal(await izvrsi(`${prozor}.querySelector('.stanje a')`), null)
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

test('traka prati mapu, važnost i filtere, a prazan predeo je sakriva', async () => {
  await otvori()
  const proveri = async () => izvrsi(`(async () => {
    const {mapa} = await import('./klase/mapa.js')
    const {vaznostSpomenika} = await import('./utils/vaznost.js')
    const s = document.querySelector('nav-slajder')
    const stavke = document.querySelector('polje-pretraga').filtrirano
    const prikazane = s.slike.map(f => stavke.find(x => x.dajSliku === f))
    return {broj: prikazane.length, skrivene: s.style.display === 'none',
      sveUOkviru: prikazane.every(x => x && mapa.getBounds().contains(x.marker.dajPoziciju())),
      potpune: prikazane.length === stavke.filter(x => x.dajSliku && mapa.getBounds().contains(x.marker.dajPoziciju())).length,
      poredjane: prikazane.every((x,i) => !i || vaznostSpomenika(prikazane[i-1].spomenik) <= vaznostSpomenika(x.spomenik)),
      vrste: [...new Set(prikazane.map(x => x.spomenik.vrsta))],
      ids: prikazane.map(x => x.spomenik.id)}
  })()`)
  await izvrsi("import('./klase/mapa.js').then(({mapa})=>mapa.setView([44.81,20.46],11,{animate:false}))")
  const beograd = await proveri()
  assert.ok(beograd.broj > 0 && beograd.sveUOkviru && beograd.potpune && beograd.poredjane)
  await izvrsi("window.prvaSlika=document.querySelector('nav-slajder').traka.firstChild; import('./klase/mapa.js').then(({mapa})=>mapa.fire('moveend'))")
  assert.ok(await izvrsi("window.prvaSlika===document.querySelector('nav-slajder').traka.firstChild"))
  await izvrsi("document.querySelector('polje-pretraga').filteri.izaberi('tip','statua')")
  const statue = await proveri()
  assert.ok(statue.broj > 0 && statue.sveUOkviru && statue.potpune)
  assert.deepEqual(statue.vrste, ['statua'])
  await izvrsi("document.querySelector('polje-pretraga').ponisti(); import('./klase/mapa.js').then(({mapa})=>mapa.setView([43.34,17.8],12,{animate:false}))")
  const mostar = await proveri()
  assert.ok(mostar.broj > 0 && mostar.sveUOkviru && mostar.potpune && mostar.poredjane)
  assert.ok(mostar.ids.includes('mostar-partisan-cemetery'))
  assert.ok(!mostar.ids.some(id => beograd.ids.includes(id)))
  await izvrsi("import('./klase/mapa.js').then(({mapa})=>mapa.setView([40,14],15,{animate:false}))")
  const prazno = await proveri()
  assert.equal(prazno.broj, 0)
  assert.ok(prazno.skrivene)
})

test('traka prikazuje mesto do zuma 11, a naziv spomenika od zuma 12', async () => {
  await otvori()
  const natpis = async () => izvrsi(`(() => {
    const s = document.querySelector('nav-slajder')
    while (s.traka.children.length < s.slike.length) s.dodajSlikeAkoTreba()
    const slika = [...s.traka.children].find(x=>x.mesto==='Beograd (Dorćol)')
    return slika && {tekst:slika.naziv.textContent,title:slika.naziv.title,alt:slika.slika.alt}
  })()`)
  await izvrsi("import('./klase/mapa.js').then(({mapa})=>mapa.setView([44.8304596,20.4574169],15,{animate:false}))")
  assert.deepEqual(await natpis(), {tekst:'Menora u plamenu',title:'Menora u plamenu',alt:'Spomenik Beograd (Dorćol)'})
  await izvrsi("import('./klase/mapa.js').then(({mapa})=>mapa.setZoom(11,{animate:false}))")
  assert.equal((await natpis()).tekst, 'Beograd (Dorćol)')
  await izvrsi("import('./klase/mapa.js').then(({mapa})=>mapa.setZoom(12,{animate:false}))")
  assert.equal((await natpis()).tekst, 'Menora u plamenu')
  assert.equal(await izvrsi("document.querySelector('planer-rute').stavke.get('dorcol').spomenik.mesto"), 'Beograd (Dorćol)')
})

test('desktop traka prikazuje nazive spomenika i kada obuhvata više naselja', async () => {
  await pregledac.send('Emulation.setDeviceMetricsOverride', {width:1440,height:900,deviceScaleFactor:1,mobile:false})
  try {
    await otvori()
    const natpis = async zoom => izvrsi(`import('./klase/mapa.js').then(({mapa})=>{
      mapa.setView([44.7802301,20.4169938],${zoom},{animate:false})
      const s=document.querySelector('nav-slajder')
      while(s.traka.children.length<s.slike.length) s.dodajSlikeAkoTreba()
      const natpisi=[...s.traka.children].map(x=>({tekst:x.naziv.textContent,mesto:x.mesto}))
      return {banovo:natpisi.find(x=>x.mesto==='Beograd (Banovo Brdo)')?.tekst,
        zarkovo:natpisi.find(x=>x.mesto==='Beograd (Žarkovo)')?.tekst}
    })`)
    assert.deepEqual(await natpis(14), {banovo:'Spomenik palim borcima Čukarice',zarkovo:'Spomenik palim borcima NOB'})
    assert.equal((await natpis(11)).banovo, 'Beograd (Banovo Brdo)')
  } finally {
    await pregledac.send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:2,mobile:true})
  }
})

test('pretraga nalazi i uklonjen spomenik, koji je bez pretrage sakriven', async () => {
  await otvori()
  await izvrsi(`(() => { const p = document.querySelector('polje-pretraga input'); p.value = 'prvom partizanskom tenku'; p.dispatchEvent(new Event('input', {bubbles: true})) })()`)
  assert.equal(Number(await sacekaj(BROJ, 'broj pronađenih')), 1)
})

test('filter po vrsti suzi spomenike', async () => {
  await otvori()
  await izvrsi("document.querySelector('polje-pretraga .dugme-filteri').click()")
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
  for (const [naziv, clanak] of [
    ['Beograd u NOB', 'Beograd_u_Narodnooslobodila'],
    ['Slavonija u NOB', 'Slavonija_u_Narodnooslobodila'],
  ]) {
    await otvori()
    const ruta = "document.querySelector('planer-rute').shadowRoot"
    await izvrsi(`${ruta}.querySelector('#dugme').click()`)
    await izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').click()`)
    const red = `[...${ruta}.querySelectorAll('#spisak-tura li')].find(li => li.querySelector('.ime').textContent === ${JSON.stringify(naziv)})`
    const broj = await izvrsi(`${red}.querySelector('.opis').textContent.match(/[0-9]+/)[0]`)
    assert.equal(await izvrsi(`${red}.querySelector('a')`), null)
    await izvrsi(`${red}.querySelector('button').click()`)
    assert.equal(await izvrsi(`${ruta}.querySelectorAll('#stanice li').length`), Number(broj))
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
  const provera = await izvrsi(`Promise.all([import('./klase/mapa.js'), Promise.all(['data/spomenici-istaknuti.json', 'data/spomenici-ostali.json'].map(f => fetch(f).then(r => r.json()))).then(d => d.flat()), import('./utils/ruta.js')]).then(([{mapa}, spomenici, {dajRutu}]) => {
    const dno = ${ruta}.querySelector('#dugme').getBoundingClientRect().top - 20
    return spomenici.filter(s => dajRutu().includes(s.id)).map(s => {
      const p = mapa.latLngToContainerPoint(s.koordinate)
      return p.x >= 29 && p.x <= innerWidth - 29 && p.y >= 79 && p.y <= dno + 1
    })
  })`)
  assert.ok(provera.length > 1)
  assert.ok(provera.every(Boolean))
})

test('svaka stanica ima direktnu navigaciju nezavisnu od cele ture', async () => {
  await otvori()
  const ruta = "document.querySelector('planer-rute').shadowRoot"
  await izvrsi(`${ruta}.querySelector('#dugme').click();${ruta}.querySelector('[data-kartica="ture"]').click()`)
  await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].find(li => li.querySelector('.ime').textContent === 'Niš u NOB').querySelector('button').click()`)
  const podaci = await izvrsi(`Promise.all([Promise.all(['data/spomenici-istaknuti.json', 'data/spomenici-ostali.json'].map(f => fetch(f).then(r => r.json()))).then(d => d.flat()), import('./utils/ruta.js')]).then(([spomenici, {dajRutu}]) => {
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

test('podrazumevani prag je statua i svaka vrsta je zasebna opcija', async () => {
  await izvrsi("localStorage.removeItem('spomenici-prag-tura')")
  await otvori()
  const ruta = "document.querySelector('planer-rute').shadowRoot"
  assert.equal(await izvrsi("document.querySelector('planer-rute').pragVaznosti"), 'statua')
  assert.match(await izvrsi(`${ruta}.querySelector('#prag-vaznosti').textContent`), /Statue/)
  const opcije = await izvrsi(`[...${ruta}.querySelectorAll('[data-prag]')].map(o=>({value:o.dataset.prag,label:o.textContent,znak:Boolean(o.querySelector('img'))}))`)
  assert.ok(opcije.every(o=>o.znak), 'svaka opcija ima znak sa mape')
  assert.deepEqual(opcije.map(o=>o.value), ['istaknut','spomen-park','muzej','spomenik','statua','spomen-groblje','bista','spomen-obelezje','spomen-ploca'])
  assert.ok(opcije.every(o=>!o.label.includes('/')))
  await izvrsi(`${ruta}.querySelector('#dugme').click()`)
  await izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').click()`)
  await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].find(li=>li.querySelector('.ime').textContent==='Beograd u NOB').querySelector('button').click()`)
  const vrste = await izvrsi("import('./utils/ruta.js').then(m=>m.dajRutu().map(id=>document.querySelector('planer-rute').stavke.get(id).spomenik.vrsta))")
  assert.ok(vrste.includes('statua'))
  assert.ok(!vrste.some(v=>['bista','spomen-obelezje','spomen-ploca'].includes(v)))
  await izvrsi("import('./utils/ruta.js').then(m=>m.postaviRutu([]))")
})

test('prag važnosti menja celu automatsku turu i pamti izbor bez ograničenja broja stanica', async () => {
  await otvori()
  const ruta = "document.querySelector('planer-rute').shadowRoot"
  const prag = "document.querySelector('planer-rute').pragVaznosti"
  const postaviPrag = vrsta => izvrsi(`{const r=${ruta};r.querySelector('#prag-vaznosti').click();r.querySelector('[data-prag="${vrsta}"]').click()}`)
  const izaberi = naziv => izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].find(li=>li.querySelector('.ime').textContent===${JSON.stringify(naziv)}).querySelector('button').click()`)
  await izvrsi(`${ruta}.querySelector('#dugme').click()`)
  await izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').click()`)
  const imena = await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura .ime')].map(e=>e.textContent)`)
  assert.ok(imena.includes('Beograd u NOB') && !imena.includes('Banjaluka u NOB'), 'tura sa manje od tri stanice se ne nudi')
  // tura sa stalnim pragom umesto broja stanica navodi prag
  assert.ok(await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura .opis')].filter(o=>o.textContent!=='Istaknuti spomenici').every(o=>parseInt(o.textContent)>=3)`))
  assert.ok(await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].some(li=>li.querySelector('.ime').textContent==='Jugoslavija u NOB'&&li.querySelector('.opis').textContent==='Istaknuti spomenici')`))
  await postaviPrag('spomen-ploca')
  await izaberi('Beograd u NOB')
  const svi = await izvrsi("import('./utils/ruta.js').then(m=>m.dajRutu())")
  assert.ok(svi.length > 10, 'sve stanice, uključujući one posle desete')
  assert.equal(await izvrsi(`${ruta}.querySelectorAll('#stanice li').length`), svi.length)
  await postaviPrag('istaknut')
  const istaknuti = await izvrsi("import('./utils/ruta.js').then(m=>m.dajRutu())")
  assert.ok(istaknuti.length > 0 && istaknuti.length < svi.length)
  assert.ok(istaknuti.every(id => svi.includes(id)))
  assert.ok(await izvrsi(`import('./utils/ruta.js').then(m=>m.dajRutu().every(id=>document.querySelector('planer-rute').stavke.get(id).spomenik.istaknut===true))`))
  await otvori()
  assert.equal(await izvrsi(prag), 'istaknut')
  assert.deepEqual(new Set(await izvrsi("import('./utils/ruta.js').then(m=>m.dajRutu())")), new Set(istaknuti))
  await postaviPrag('spomen-ploca')
  await izaberi('Banjaluka u NOB')
  await postaviPrag('istaknut')
  assert.equal(await izvrsi(`${ruta}.querySelectorAll('#stanice li').length`), 0)
  assert.equal(await izvrsi(`${ruta}.querySelector('#vaznost').hidden`), false)
  await postaviPrag('spomen-ploca')
  assert.ok(await izvrsi(`${ruta}.querySelectorAll('#stanice li').length`) > 0)
  await izvrsi("import('./utils/ruta.js').then(m=>m.ukloniIzRute(m.dajRutu()[0]))")
  const rucna = await izvrsi("import('./utils/ruta.js').then(m=>m.dajRutu())")
  await postaviPrag('istaknut')
  assert.deepEqual(await izvrsi("import('./utils/ruta.js').then(m=>m.dajRutu())"), rucna, 'ručno izmenjena ruta se čuva')
  await postaviPrag('spomenik')
  await izvrsi("import('./utils/ruta.js').then(m=>m.postaviRutu([]))")
})

test('uklanjanje rute otvara predložene rute', async () => {
  await otvori()
  const ruta = "document.querySelector('planer-rute').shadowRoot"
  await izvrsi("import('./utils/ruta.js').then(m=>m.postaviRutu([...document.querySelector('planer-rute').stavke.keys()].slice(0, 2)))")
  await izvrsi(`${ruta}.querySelector('#dugme').click()`)
  await izvrsi(`${ruta}.querySelector('[data-kartica="planer"]').click()`)
  await izvrsi(`${ruta}.querySelector('#isprazni').click()`)
  assert.equal(await izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').getAttribute('aria-selected')`), 'true')
  assert.equal(await izvrsi(`${ruta}.querySelector('#ture').hidden`), false)
})

test('stranac dobija engleski, a izabran jezik ostaje', async () => {
  const userAgent = await izvrsi('navigator.userAgent')
  const jezikPregledaca = acceptLanguage => pregledac.send('Emulation.setUserAgentOverride', {userAgent, acceptLanguage})
  try {
    await jezikPregledaca('de-DE,de')
    await otvori()
    assert.equal(await izvrsi('document.documentElement.lang'), 'en')
    await izvrsi("localStorage.setItem('spomenici-jezik', 'sh')")
    await otvori()
    assert.equal(await izvrsi('document.documentElement.lang'), 'sh')
    await izvrsi("localStorage.removeItem('spomenici-jezik')")
    await jezikPregledaca('en-US,hr')
    await otvori()
    assert.equal(await izvrsi('document.documentElement.lang'), 'sh')
  } finally {
    await jezikPregledaca('sr')
    await izvrsi("localStorage.removeItem('spomenici-jezik')")
  }
})

test('izbor autora pretragom i tastaturom sužava rezultate, a poništavanje vraća početni izbor', async () => {
  await otvori()
  const filteri = "document.querySelector('panel-filteri')"
  const root = `${filteri}.shadowRoot`
  const polje = `${root}.querySelector('button.polje[data-grupa="autor"]')`
  await izvrsi("document.querySelector('polje-pretraga .dugme-filteri').click()")
  const pocetniBroj = Number(await izvrsi(`${root}.querySelector('#prikazi').textContent.match(/\\d+/)[0]`))
  await izvrsi(`${polje}.click()`)
  const input = `${root}.querySelector('.spisak input')`
  await izvrsi(`(() => { const p=${input};p.focus();p.value='ВОЈИН БАКИЋ';p.dispatchEvent(new Event('input',{bubbles:true})) })()`)
  assert.deepEqual(await izvrsi(`[...${root}.querySelectorAll('[role="option"]:not([hidden])')].map(o=>o.dataset.opcija)`), ['Vojin Bakić'])
  await izvrsi(`${input}.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`)
  assert.match(await izvrsi(`${polje}.textContent`), /Vojin Bakić/)
  assert.equal(await izvrsi(`${polje}.getAttribute('aria-expanded')`), 'false')
  assert.equal(await izvrsi(`${root}.activeElement === ${polje}`), true)
  const suzen = Number(await izvrsi(`${root}.querySelector('#prikazi').textContent.match(/\\d+/)[0]`))
  assert.ok(suzen > 0 && suzen < pocetniBroj)
  await izvrsi(`${root}.querySelector('#prikazi').click()`)
  assert.equal(Number(await sacekaj(BROJ, 'broj posle izbora autora')), suzen)
  await izvrsi("document.querySelector('polje-pretraga .dugme-filteri').click()")
  await izvrsi(`${polje}.click()`)
  await izvrsi(`${input}.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`)
  assert.equal(await izvrsi(`${polje}.getAttribute('aria-expanded')`), 'false')
  assert.equal(await izvrsi(`${root}.activeElement === ${polje}`), true)
  await izvrsi(`${root}.querySelector('#ponisti').click()`)
  assert.equal(Number(await izvrsi(`${root}.querySelector('#prikazi').textContent.match(/\\d+/)[0]`)), pocetniBroj)
  assert.equal(await izvrsi(`${filteri}.brojAktivnih()`), 0)
})

test('lista želja i posećeni spomenici pamte se posle ponovnog otvaranja i mogu se ukloniti', async () => {
  const id = 'mostar-partisan-cemetery'
  const detalji = "document.querySelector('detalji-spomenika').shadowRoot"
  const oznaka = vrednost => `${detalji}.querySelector('[data-oznaka="${vrednost}"]')`
  const sacuvana = `JSON.parse(localStorage.getItem('spomenici-poseta'))[${JSON.stringify(id)}]`
  await otvori('#' + id)
  try {
    await izvrsi(`import('./utils/oznake.js').then(m=>m.postaviOznaku(${JSON.stringify(id)},null))`)
    await izvrsi(`${oznaka('lista')}.click()`)
    assert.equal(await izvrsi(oznaka('lista') + '.getAttribute("aria-pressed")'), 'true')
    assert.equal(await izvrsi(sacuvana), 'lista')
    await otvori('#' + id)
    assert.equal(await izvrsi(oznaka('lista') + '.getAttribute("aria-pressed")'), 'true')
    await izvrsi(`${oznaka('posetio')}.click()`)
    assert.equal(await izvrsi(oznaka('lista') + '.getAttribute("aria-pressed")'), 'false')
    assert.equal(await izvrsi(sacuvana), 'posetio')
    await otvori('#' + id)
    assert.equal(await izvrsi(oznaka('posetio') + '.getAttribute("aria-pressed")'), 'true')
    await izvrsi(`${oznaka('posetio')}.click()`)
    await otvori('#' + id)
    assert.equal(await izvrsi(oznaka('posetio') + '.getAttribute("aria-pressed")'), 'false')
    assert.equal(await izvrsi(`Object.hasOwn(JSON.parse(localStorage.getItem('spomenici-poseta')),${JSON.stringify(id)})`), false)
  } finally {
    await izvrsi(`import('./utils/oznake.js').then(m=>m.postaviOznaku(${JSON.stringify(id)},null))`)
  }
})

test('natpis i imena autora prikazuju HTML kao tekst, a ne kao elemente', async () => {
  await otvori('#mostar-partisan-cemetery')
  const rezultat = await izvrsi(`(() => {
    const d=document.querySelector('detalji-spomenika'),marker=d.marker
    const tekst='<img src="x" onerror="window.nezeljeno=true"> & ćirilica Ђ'
    const original=marker.spomen
    try {
      marker.spomen={...original,natpis:tekst,autor:tekst}
      d.prikazi(marker)
      const natpis=d.shadowRoot.querySelector('.natpis p')
      const autor=d.shadowRoot.querySelector('.podaci')
      return {tekst,natpis:natpis.textContent,autor:autor.textContent,
        umetnutihElemenata:natpis.children.length+autor.children.length}
    } finally {marker.spomen=original;d.prikazi(marker)}
  })()`)
  assert.equal(rezultat.natpis, rezultat.tekst)
  assert.ok(rezultat.autor.endsWith(rezultat.tekst))
  assert.equal(rezultat.umetnutihElemenata, 0)
})

test('U blizini posle lociranja nudi najbliže spomenike redom i otvara izabrani', async () => {
  const {lat, lng} = {lat: 43.3412236, lng: 17.7962794}
  await pregledac.send('Browser.grantPermissions', {permissions: ['geolocation'], origin: new URL(server.adresa).origin})
  await pregledac.send('Emulation.setGeolocationOverride', {latitude: lat, longitude: lng, accuracy: 20})
  try {
    await otvori()
    const najblizi = "document.querySelector('lista-najblizih').shadowRoot"
    assert.equal(await izvrsi(`${najblizi}.querySelector('#dugme').hidden`), true)
    await izvrsi("document.querySelector('dugme-lokator').click()")
    await sacekaj(`!${najblizi}.querySelector('#dugme').hidden`, 'dugme U blizini')
    assert.ok(await sacekaj(`import('./klase/mapa.js').then(({mapa}) => mapa.latLngToContainerPoint([${lat}, ${lng}]).distanceTo(mapa.getSize().divideBy(2)) < 2)`, 'mapa centrirana na korisnika'))
    await izvrsi(`${najblizi}.querySelector('#dugme').click()`)
    assert.equal(await izvrsi(`${najblizi}.querySelector('#panel').hidden`), false)
    const redovi = await izvrsi(`[...${najblizi}.querySelectorAll('li')].map(li => ({km: li.querySelector('.km').textContent, naziv: li.querySelector('.naziv').textContent}))`)
    assert.equal(redovi.length, 10)
    assert.deepEqual(redovi[0], {km: '~0 m', naziv: 'Partizansko groblje u Mostaru'})
    const metara = redovi.map(({km}) => {
      const [, broj, jedinica] = km.match(/^~(\d+) (m|km)$/)
      return Number(broj) * (jedinica === 'km' ? 1000 : 1)
    })
    assert.ok(metara.every((m, i) => !i || metara[i - 1] <= m), `redosled: ${metara}`)
    await izvrsi(`${najblizi}.querySelector('li').click()`)
    assert.equal(await izvrsi(`${najblizi}.querySelector('#panel').hidden`), true)
    await sacekaj("document.querySelector('detalji-spomenika').marker?.spomen.id === 'mostar-partisan-cemetery'", 'otvoren najbliži spomenik')
  } finally {
    await pregledac.send('Emulation.clearGeolocationOverride')
  }
})

test('bez grešaka u aplikaciji', () => {
  assert.deepEqual(greske, [])
})
