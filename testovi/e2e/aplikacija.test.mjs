// node --test testovi/e2e — glavni tokovi aplikacije u Chrome-u bez prozora, na ekranu telefona
// pokrece sopstveni server, pa ne trazi nista upaljeno; traje oko pola minuta
import {test, before, after} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {otvoriPregledac, pokreniServer, sleep} from '../../alati/pregledac.mjs'
import {nivoiVaznosti} from '../../utils/vaznost.js'

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

after(async () => {
  server?.zatvori()
  await pregledac?.zatvori()
})

const izvrsi = izraz => pregledac.izvrsi(izraz)

// izraz se ponavlja dok ne vrati istinitu vrednost; izuzetak dok se ceka (npr. element jos ne postoji) je deo cekanja
const sacekaj = async (izraz, opis, rok = 15000) => {
  let greska
  for (const kraj = Date.now() + rok; Date.now() < kraj; await sleep(200)) {
    try {
      const v = await izvrsi(izraz)
      if (v) return v
    } catch (e) {
      greska = e
    }
  }
  assert.fail(`nije se desilo: ${opis}${greska ? ` (poslednja greška: ${greska.message})` : ''}`)
}

// prelaz na isti URL sa drugim #id ne ucitava stranicu ponovo, pa se ide preko prazne
const otvori = async (hash = '') => {
  await pregledac.send('Page.navigate', {url: 'about:blank'})
  await pregledac.send('Page.navigate', {url: server.adresa + hash})
  await sacekaj("document.querySelectorAll('.leaflet-marker-pane img').length", 'obelisci na mapi')
  await sacekaj("document.documentElement.dataset.podaci === 'svi'", 'svi podaci')
  // prozor spomenika i ture se preuzimaju posle prvog crtanja i pod opterecenjem mogu stici posle podataka
  await sacekaj("!!(document.querySelector('planer-rute') && document.querySelector('detalji-spomenika'))", 'odlozeni paneli')
}

const BROJ = `document.body.innerText.match(/(\\d+) od \\d+/)?.[1]`

const sacekajTraku = () => sacekaj(`import('./klase/mapa.js').then(({mapa}) => {
  const s=document.querySelector('nav-slajder')
  const slike=new Set(document.querySelector('polje-pretraga').filtrirano
    .filter(x=>x.dajSliku && mapa.getBounds().contains(x.marker.dajPoziciju())).map(x=>x.dajSliku))
  return s.zum===mapa.getZoom() && s.slike.length===slike.size && s.slike.every(f=>slike.has(f))
})`, 'traka prati zavrseno pomeranje mape')

test('alat za pregledač prijavljuje grešku izraza i komande', async () => {
  await assert.rejects(izvrsi("throw new Error('proba')"), /proba/)
  await assert.rejects(pregledac.send('Nepostojeci.metod'), /Nepostojeci\.metod/)
})

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
      const naziv = t(vrsta).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()
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

test('legenda, filteri, izbor ture i slojevi mape prate isti prioritet vrsta', async () => {
  await otvori()
  await izvrsi("document.querySelector('polje-pretraga .dugme-filteri').click()")
  const prikaz = await izvrsi(`(async () => {
    const {nivoiVaznosti} = await import('./utils/vaznost.js')
    const {t} = await import('./utils/jezik.js')
    const {default: Marker} = await import('./klase/Marker.js')
    const legenda = document.querySelector('dugme-legenda').shadowRoot
    const filteri = document.querySelector('panel-filteri').shadowRoot
    const ruta = document.querySelector('planer-rute').shadowRoot
    const marker = (vrsta, ostalo = {}) => new Marker({id: vrsta, naziv: vrsta, mesto: 'Grad', drzava: 'Serbia', koordinate: {lat: 44, lng: 20}, vrsta, ...ostalo}).element.options.zIndexOffset
    return {
      redosled: nivoiVaznosti,
      legenda: [...legenda.querySelectorAll('.sadrzaj > div:first-child .stavka')].map(s => s.lastElementChild.textContent),
      naziviLegende: nivoiVaznosti.map(v => t(v)),
      filteri: [...filteri.querySelectorAll('[data-grupa="tip"][data-opcija]')].map(s => s.dataset.opcija),
      izborTure: [...ruta.querySelectorAll('[data-prag]')].map(s => s.dataset.prag),
      brojevi: [...ruta.querySelectorAll('[data-prag] .nivo')].map(s => s.textContent),
      slojevi: nivoiVaznosti.map(v => marker(v === 'istaknut' ? 'spomenik' : v, {istaknut: v === 'istaknut'})),
      priblizan: marker('spomen-groblje', {priblizno: true}),
    }
  })()`)
  assert.deepEqual(prikaz.redosled, nivoiVaznosti)
  assert.deepEqual(prikaz.legenda, prikaz.naziviLegende)
  assert.deepEqual(prikaz.filteri, prikaz.redosled)
  assert.deepEqual(prikaz.izborTure, prikaz.redosled)
  assert.deepEqual(prikaz.brojevi, ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'])
  assert.ok(prikaz.slojevi.every((sloj, i) => i === 0 || prikaz.slojevi[i - 1] > sloj))
  assert.ok(prikaz.priblizan < prikaz.slojevi.at(-1))
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
      const greske = ['wiki','wikiEn'].filter(f=>s[f]&&!jeClanak(s[f]))
      if (!s.wiki&&!s.wikiEn&&clanakSpomenika(s)) greske.push('rezervni izvor')
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

test('neispravan #id ne prekida učitavanje, a nov #id u otvorenoj aplikaciji otvara spomenik', async () => {
  await otvori('#%')
  await izvrsi("location.hash = '#mostar-partisan-cemetery'")
  await sacekaj("document.querySelector('detalji-spomenika').marker?.spomen.id === 'mostar-partisan-cemetery'", 'otvoren spomenik iz novog linka')
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

test('posveta povezana u opisu je link u tekstu, bez posebnog reda, a opis se otvara dodirom', async () => {
  await otvori('#kragujevac-sumarice-park')
  const prozor = "document.querySelector('detalji-spomenika').shadowRoot"
  const opis = `${prozor}.querySelector('.opis')`
  const link = await sacekaj(`${opis}?.querySelector('a')?.href`, 'link posvete u opisu')
  assert.match(link, /wikipedia\.org/)
  assert.doesNotMatch(await izvrsi(`${opis}.textContent`), /[[\]]|Q\d/)
  assert.equal(await izvrsi(`[...${prozor}.querySelectorAll('.podaci')].some(p => p.textContent.startsWith('Posvećeno:'))`), false)
  const visine = await izvrsi(`(() => {const o = ${opis}; const pre = o.clientHeight; o.click(); return [pre, o.clientHeight, o.getAttribute('aria-expanded')]})()`)
  assert.ok(visine[1] > visine[0], `opis se ne siri: ${visine}`)
  assert.equal(visine[2], 'true')
})

test('na engleskom naslov i opis stižu iz zasebnih fajlova i dopune već otvoren prozor', async () => {
  await otvori('?jezik=en#kragujevac-sumarice-park')
  const prozor = "document.querySelector('detalji-spomenika').shadowRoot"
  assert.equal(await sacekaj(`${prozor}.querySelector('h2 .ime')?.textContent === 'Interrupted Flight Monument' && 'da'`, 'engleski naziv'), 'da')
  assert.match(await sacekaj(`${prozor}.querySelector('.opis')?.textContent`, 'engleski opis'), /^Dedicated to/)
  await otvori('?jezik=sh#kragujevac-sumarice-park')
  assert.match(await sacekaj(`${prozor}.querySelector('.opis')?.textContent`, 'domaći opis'), /^Posvećeno/)
  assert.notEqual(await izvrsi(`${prozor}.querySelector('h2 .ime').textContent`), 'Interrupted Flight Monument')
})

test('pretraga suzi spomenike', async () => {
  await otvori()
  await izvrsi(`(() => { const p = document.querySelector('polje-pretraga input'); p.value = 'Tjentište'; p.dispatchEvent(new Event('input', {bubbles: true})) })()`)
  assert.ok(Number(await sacekaj(BROJ, 'broj pronađenih')) > 0)
})

test('traka se osvezi jednom posle touchpad pokreta i ceka zavrsetak prevlacenja', async () => {
  await otvori()
  await sacekajTraku()
  await izvrsi(`(()=>{
    const s=document.querySelector('nav-slajder')
    window.proveraTrake={broj:0,original:s.postavi}
    s.postavi=function(...args){proveraTrake.broj++;return proveraTrake.original.apply(this,args)}
  })()`)
  let dodirUToku = false
  const dodir = async (type, x = 195, y = 350) => {
    await pregledac.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]})
    if (type === 'touchStart') dodirUToku = true
    if (type === 'touchEnd') dodirUToku = false
  }
  try {
    assert.equal(await izvrsi(`(async()=>{
      const {mapa}=await import('./klase/mapa.js')
      for(let i=0;i<8;i++){
        mapa.getContainer().dispatchEvent(new WheelEvent('wheel',{deltaX:8,cancelable:true}))
        await new Promise(r=>setTimeout(r,25))
      }
      return proveraTrake.broj
    })()`), 0)
    await sacekaj('proveraTrake.broj===1', 'jedno osvezavanje posle touchpada')
    await izvrsi(`import('./klase/mapa.js').then(({mapa})=>{
      proveraTrake.broj=0
      mapa.getContainer().dispatchEvent(new WheelEvent('wheel',{deltaX:8,cancelable:true}))
    })`)
    await dodir('touchStart')
    for (let i=1; i<=4; i++) {
      await dodir('touchMove',195-i*12)
      await sleep(25)
    }
    await sleep(200)
    assert.equal(await izvrsi('proveraTrake.broj'), 0, 'nema osvezavanja dok se mapa drzi')
    await dodir('touchEnd')
    await sacekaj('proveraTrake.broj===1', 'jedno osvezavanje posle otpustanja')
    await sacekajTraku()
  } finally {
    if (dodirUToku) await dodir('touchEnd')
    await izvrsi(`document.querySelector('nav-slajder').postavi=proveraTrake.original;delete window.proveraTrake`)
  }
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
  await izvrsi("import('./klase/mapa.js').then(({mapa}) => void mapa.setView([44.81,20.46],11,{animate:false}))")
  await sacekajTraku()
  const beograd = await proveri()
  assert.ok(beograd.broj > 0 && beograd.sveUOkviru && beograd.potpune && beograd.poredjane)
  await izvrsi("window.prvaSlika=document.querySelector('nav-slajder').traka.firstChild; import('./klase/mapa.js').then(({mapa}) => void mapa.fire('moveend'))")
  assert.ok(await izvrsi("window.prvaSlika===document.querySelector('nav-slajder').traka.firstChild"))
  await izvrsi("document.querySelector('polje-pretraga').filteri.izaberi('tip','statua')")
  const statue = await proveri()
  assert.ok(statue.broj > 0 && statue.sveUOkviru && statue.potpune)
  assert.deepEqual(statue.vrste, ['statua'])
  await izvrsi("document.querySelector('polje-pretraga').ponisti(); import('./klase/mapa.js').then(({mapa}) => void mapa.setView([43.34,17.8],12,{animate:false}))")
  await sacekajTraku()
  const mostar = await proveri()
  assert.ok(mostar.broj > 0 && mostar.sveUOkviru && mostar.potpune && mostar.poredjane)
  assert.ok(mostar.ids.includes('mostar-partisan-cemetery'))
  assert.ok(!mostar.ids.some(id => beograd.ids.includes(id)))
  await izvrsi("import('./klase/mapa.js').then(({mapa}) => void mapa.setView([40,14],15,{animate:false}))")
  await sacekajTraku()
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
  await izvrsi("import('./klase/mapa.js').then(({mapa}) => void mapa.setView([44.8304596,20.4574169],15,{animate:false}))")
  await sacekajTraku()
  assert.deepEqual(await natpis(), {tekst:'Menora u plamenu',title:'Menora u plamenu',alt:'Spomenik Beograd (Dorćol)'})
  await izvrsi("import('./klase/mapa.js').then(({mapa}) => void mapa.setZoom(11,{animate:false}))")
  await sacekajTraku()
  assert.equal((await natpis()).tekst, 'Beograd (Dorćol)')
  await izvrsi("import('./klase/mapa.js').then(({mapa}) => void mapa.setZoom(12,{animate:false}))")
  await sacekajTraku()
  assert.equal((await natpis()).tekst, 'Menora u plamenu')
  assert.equal(await izvrsi("document.querySelector('planer-rute').stavke.get('dorcol').spomenik.mesto"), 'Beograd (Dorćol)')
})

test('desktop traka prikazuje nazive spomenika i kada obuhvata više naselja', async () => {
  await pregledac.send('Emulation.setDeviceMetricsOverride', {width:1440,height:900,deviceScaleFactor:1,mobile:false})
  try {
    await otvori()
    const natpis = async zoom => {
      await izvrsi(`import('./klase/mapa.js').then(({mapa})=>void mapa.setView([44.7802301,20.4169938],${zoom},{animate:false}))`)
      await sacekajTraku()
      return izvrsi(`(()=>{
      const s=document.querySelector('nav-slajder')
      while(s.traka.children.length<s.slike.length) s.dodajSlikeAkoTreba()
      const natpisi=[...s.traka.children].map(x=>({tekst:x.naziv.textContent,mesto:x.mesto}))
      return {banovo:natpisi.find(x=>x.mesto==='Beograd (Banovo Brdo)')?.tekst,
        zarkovo:natpisi.find(x=>x.mesto==='Beograd (Žarkovo)')?.tekst}
    })()`)
    }
    assert.deepEqual(await natpis(14), {banovo:'Spomenik palim borcima Čukarice',zarkovo:'Spomenik palim borcima NOB'})
    assert.equal((await natpis(11)).banovo, 'Beograd (Banovo Brdo)')
  } finally {
    await pregledac.send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:2,mobile:true})
  }
})

test('pretraga nalazi i uklonjen spomenik, koji je bez pretrage sakriven, a filteri nude isti broj', async () => {
  await otvori()
  await izvrsi(`(() => { const p = document.querySelector('polje-pretraga input'); p.value = 'prvom partizanskom tenku'; p.dispatchEvent(new Event('input', {bubbles: true})) })()`)
  assert.equal(Number(await sacekaj(BROJ, 'broj pronađenih')), 1)
  await izvrsi("document.querySelector('polje-pretraga .dugme-filteri').click()")
  assert.equal(await izvrsi("document.querySelector('panel-filteri').shadowRoot.querySelector('#prikazi').textContent"), 'Prikaži 1 spomenik')
  await izvrsi("document.querySelector('panel-filteri').zatvori()")
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
    assert.ok(rezultat.broj >= 1)
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
  assert.match(await izvrsi(`${ruta}.querySelector('#prag-vaznosti').textContent`), /Statua/)
  const opcije = await izvrsi(`[...${ruta}.querySelectorAll('[data-prag]')].map(o=>({value:o.dataset.prag,label:o.textContent,znak:Boolean(o.querySelector('img'))}))`)
  assert.ok(opcije.every(o=>o.znak), 'svaka opcija ima znak sa mape')
  assert.deepEqual(opcije.map(o=>o.value), nivoiVaznosti)
  assert.ok(opcije.every(o=>!o.label.includes('/')))
  await izvrsi(`${ruta}.querySelector('#dugme').click()`)
  await izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').click()`)
  await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].find(li=>li.querySelector('.ime').textContent==='Beograd u NOB').querySelector('button').click()`)
  const vrste = await izvrsi("import('./utils/ruta.js').then(m=>m.dajRutu().map(id=>document.querySelector('planer-rute').stavke.get(id).spomenik.vrsta))")
  assert.ok(vrste.includes('statua'))
  assert.ok(!vrste.some(v=>['bista','spomen-obelezje','groblje','spomen-ploca'].includes(v)))
  await izvrsi("import('./utils/ruta.js').then(m=>m.postaviRutu([]))")
})

test('prag važnosti menja celu automatsku turu i pamti izbor bez ograničenja broja stanica', async () => {
  await otvori()
  const ruta = "document.querySelector('planer-rute').shadowRoot"
  const prag = "document.querySelector('planer-rute').pragVaznosti"
  const postaviPrag = vrsta => izvrsi(`{const r=${ruta};r.querySelector('#prag-vaznosti').click();r.querySelector('[data-prag="${vrsta}"]').click()}`)
  const izaberi = naziv => izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').click(),[...${ruta}.querySelectorAll('#spisak-tura li')].find(li=>li.querySelector('.ime').textContent===${JSON.stringify(naziv)}).querySelector('button').click()`)
  await izvrsi(`${ruta}.querySelector('#dugme').click()`)
  await izvrsi(`${ruta}.querySelector('[data-kartica="ture"]').click()`)
  const imena = await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura .ime')].map(e=>e.textContent)`)
  assert.ok(imena.includes('Beograd u NOB'), 'tura sa dovoljnim brojem stanica se nudi')
  // tura sa stalnim pragom umesto broja stanica navodi prag
  assert.ok(await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura .opis')].filter(o=>o.textContent!=='Istaknuti spomenik').every(o=>parseInt(o.textContent)>=3)`))
  assert.ok(await izvrsi(`[...${ruta}.querySelectorAll('#spisak-tura li')].some(li=>li.querySelector('.ime').textContent==='Jugoslavija u NOB'&&li.querySelector('.opis').textContent==='Istaknuti spomenik')`))
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

test('naziv, natpis i imena autora prikazuju HTML kao tekst, a ne kao elemente', async () => {
  await otvori('#mostar-partisan-cemetery')
  const rezultat = await izvrsi(`(() => {
    const d=document.querySelector('detalji-spomenika'),marker=d.marker
    const tekst='<img src="x" onerror="window.nezeljeno=true"> & ćirilica Ђ'
    const original=marker.spomen
    try {
      marker.spomen={...original,naziv:tekst,natpis:tekst,autor:tekst}
      d.prikazi(marker)
      const naslov=d.shadowRoot.querySelector('h2')
      const natpis=d.shadowRoot.querySelector('.natpis p')
      const autor=d.shadowRoot.querySelector('.podaci')
      return {tekst,natpis:natpis.textContent,autor:autor.textContent,naslov:naslov.textContent,
        umetnutihElemenata:naslov.querySelectorAll('img').length+natpis.children.length+autor.children.length}
    } finally {marker.spomen=original;d.prikazi(marker)}
  })()`)
  assert.equal(rezultat.natpis, rezultat.tekst)
  assert.ok(rezultat.autor.endsWith(rezultat.tekst))
  assert.ok(rezultat.naslov.includes(rezultat.tekst))
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
    await izvrsi(`${najblizi}.querySelector('li button').click()`)
    assert.equal(await izvrsi(`${najblizi}.querySelector('#panel').hidden`), true)
    await sacekaj("document.querySelector('detalji-spomenika').marker?.spomen.id === 'mostar-partisan-cemetery'", 'otvoren najbliži spomenik')
  } finally {
    await pregledac.send('Emulation.clearGeolocationOverride')
  }
})

test('široka pretraga crta ograničen broj najvažnijih obeliska, a ostale pri približavanju', async () => {
  await otvori()
  await izvrsi(`(() => { const p = document.querySelector('polje-pretraga'); p.polje.value = 'k'; p.pretrazi() })()`)
  assert.equal(await izvrsi(`document.querySelector('polje-pretraga .rezultat').hidden`), true, 'jedno slovo ne pretražuje')
  await izvrsi(`(() => { const p = document.querySelector('polje-pretraga input'); p.value = 'en'; p.dispatchEvent(new Event('input', {bubbles: true})) })()`)
  const pronadjeno = Number(await sacekaj(BROJ, 'broj pronađenih'))
  const nacrtani = () => izvrsi(`[...document.querySelectorAll('.leaflet-marker-icon')].map(el => (el.matches('img') ? el : el.querySelector('img')).getAttribute('src'))`)
  const izdaleka = await nacrtani()
  assert.ok(pronadjeno > 1000, `pronađeno ${pronadjeno}`)
  assert.ok(izdaleka.length <= 400, `nacrtano ${izdaleka.length}`)
  assert.ok(!izdaleka.some(src => src.includes('spomen-ploca')), 'ploče ne potiskuju važnije spomenike')
  await izvrsi("import('./klase/mapa.js').then(({mapa}) => void mapa.setView([44.81, 20.46], 14, {animate: false}))")
  assert.ok((await nacrtani()).some(src => src.includes('spomen-ploca')), 'izbliza se vide i ploče')
})

test('prvi GPS signal okreće gotovu turu ka korisniku, a ručno uređenu rutu ne dira', async () => {
  const stanice = ['banja-luka-maslesa', 'mostar-partisan-cemetery', 'podgorica-tito']
  const posleLociranja = async (izmena = '') => {
    await otvori()
    return izvrsi(`Promise.all([import('./utils/ruta.js'), import('./klase/mapa.js')]).then(([r, {mapa}]) => {
      r.izaberiTuru({id: 'proba', naziv: 'Proba', spomenici: ${JSON.stringify([...stanice, 'okucani'])}})
      r.ukloniIzRute('okucani')
      ${izmena}
      mapa.fire('pozicija', {latlng: L.latLng(42.44, 19.26)})
      return r.dajRutu()
    })`)
  }
  try {
    assert.deepEqual(await posleLociranja(), stanice, 'ručno uređena ruta')
    assert.deepEqual(await posleLociranja(`r.izaberiTuru({id: 'proba', naziv: 'Proba', spomenici: ${JSON.stringify(stanice)}})`),
      [...stanice].reverse(), 'gotova tura')
  } finally {
    await izvrsi("import('./utils/ruta.js').then(m => m.postaviRutu([]))")
  }
})

test('lokator, pun ekran, strelice i fotografije trake su dugmad sa nazivom, dostupna tastaturom', async () => {
  await otvori()
  const slajder = "document.querySelector('nav-slajder')"
  const dugmad = await izvrsi(`[
    document.querySelector('dugme-lokator button'),
    document.querySelector('dugme-pun-ekran button'),
    ...${slajder}.shadowRoot.querySelectorAll('.strelica'),
    ${slajder}.traka.querySelector('nav-slika button'),
  ].map(d => d && {dugme: d.tagName === 'BUTTON', naziv: Boolean(d.getAttribute('aria-label') || d.textContent.trim() || d.querySelector('img')?.alt)})`)
  assert.equal(dugmad.length, 5)
  assert.deepEqual(dugmad, Array(5).fill({dugme: true, naziv: true}))
})

test('brzo kucanje pretražuje jednom posle zastoja, a Enter odmah', async () => {
  await otvori()
  const kucaj = `(tekst => { const p = document.querySelector('polje-pretraga input'); p.value = tekst; p.dispatchEvent(new Event('input', {bubbles: true})) })`
  const brojac = await izvrsi(`(() => {
    const p = document.querySelector('polje-pretraga'), pretrazi = p.pretrazi
    window.pretraga = 0
    p.pretrazi = () => { window.pretraga++; pretrazi.call(p) }
    for (const tekst of ['T', 'Tj', 'Tje', 'Tjentište']) ${kucaj}(tekst)
    return window.pretraga
  })()`)
  assert.equal(brojac, 0, 'bez pretrage dok se kuca')
  assert.ok(Number(await sacekaj(BROJ, 'broj posle zastoja')) > 0)
  assert.equal(await izvrsi('window.pretraga'), 1)
  await izvrsi(`${kucaj}('Kozara'); document.querySelector('polje-pretraga input').dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}))`)
  assert.equal(await izvrsi('window.pretraga'), 2, 'Enter pretražuje odmah')
  // na engleskom se trazi i po engleskom nazivu, koji nije u zapisu spomenika
  assert.ok(await izvrsi("(p => p.filtrirano.every(stavka => p.tekst(stavka).includes('kozar')))(document.querySelector('polje-pretraga'))"))
  await sleep(400)
  assert.equal(await izvrsi('window.pretraga'), 2, 'odložena pretraga se ne ponavlja posle Enter-a')
})

test('Prikazi odmah obradi poslednji unos i pomeri mapu na nove rezultate', async () => {
  await otvori()
  const rezultat = await izvrsi(`(async()=>{
    const p=document.querySelector('polje-pretraga'),{mapa}=await import('./klase/mapa.js')
    p.polje.value='Tjentište';p.pretrazi();p.filteri.otvori()
    p.polje.value='Kozara';p.polje.dispatchEvent(new Event('input',{bubbles:true}))
    const original=mapa.fitBounds
    let pozvano=0,poklapanje=false
    mapa.fitBounds=function(granice,...opcije){
      pozvano++
      const kozara=document.querySelector('planer-rute').stavke.get('kozara').marker.dajPoziciju()
      poklapanje=granice.contains(kozara)
      return original.call(this,granice,...opcije)
    }
    try {
      p.filteri.panel.querySelector('#prikazi').click()
      const odmah={pozvano,poklapanje,ids:p.filtrirano.map(s=>s.spomenik.id),odlozena:p.odlozena!==undefined}
      await new Promise(r=>setTimeout(r,400))
      return {odmah,pozvanoKasnije:pozvano,idsKasnije:p.filtrirano.map(s=>s.spomenik.id)}
    }finally{mapa.fitBounds=original}
  })()`)
  assert.equal(rezultat.odmah.pozvano,1)
  assert.equal(rezultat.odmah.poklapanje,true,'mapa obuhvata Kozaru')
  assert.ok(rezultat.odmah.ids.includes('kozara'))
  assert.ok(!rezultat.odmah.ids.includes('tjentiste'))
  assert.equal(rezultat.odmah.odlozena,false)
  assert.equal(rezultat.pozvanoKasnije,1)
  assert.deepEqual(rezultat.idsKasnije,rezultat.odmah.ids)
})

// rad bez signala postoji samo u objavljenoj aplikaciji, pa ga test ukljucuje zamenom podesavanja;
// drugo otvaranje je pod workerom, a sledeci testovi u razvoju ga ponovo gase
const uObjavljenoj = async () => {
  const {send, slusaj} = pregledac
  let aktivno = true
  const telo = Buffer.from('export const devMode = false').toString('base64')
  slusaj(m => {
    if (aktivno && m.method === 'Fetch.requestPaused') send('Fetch.fulfillRequest', {requestId: m.params.requestId, responseCode: 200,
      responseHeaders: [{name: 'Content-Type', value: 'text/javascript'}, {name: 'Cache-Control', value: 'no-store'}], body: telo}).catch(() => {})
  })
  await send('Fetch.enable', {patterns: [{urlPattern: '*utils/podesavanja.js'}]})
  try {
    await otvori()
    await izvrsi('navigator.serviceWorker.ready.then(() => true)')
    await otvori()
    await sacekaj('navigator.serviceWorker.controller', 'service worker upravlja stranicom')
  } finally {
    aktivno = false
    await send('Fetch.disable')
  }
}

test('fotografija sa sajta se čuva za rad bez signala', async () => {
  await uObjavljenoj()
  const url = await izvrsi(`(async () => {
    const s = [...document.querySelector('planer-rute').stavke.values()].find(x => x.dajSliku).spomenik
    const url = new URL(s.slika, location.href).href
    await (await caches.open('spomenici-slike')).delete(url)
    return (await fetch(url)).ok && url
  })()`)
  assert.ok(url, 'fotografija je preuzeta')
  // upis u keš ide posle odgovora stranici
  await sacekaj(`caches.open('spomenici-slike').then(kes => kes.match(${JSON.stringify(url)})).then(Boolean)`, 'fotografija u kešu', 5000)
})

test('spomenici se prikazuju i kada autori nisu učitani', async () => {
  const {send, slusaj} = pregledac
  let aktivno = true
  slusaj(m => {
    if (aktivno && m.method === 'Fetch.requestPaused')
      send('Fetch.fulfillRequest', {requestId: m.params.requestId, responseCode: 500, body: ''})
  })
  await send('Network.enable')
  await send('Network.setBypassServiceWorker', {bypass: true})
  await send('Fetch.enable', {patterns: [{urlPattern: '*data/autori.json'}]})
  try {
    await otvori()
    await izvrsi(`document.querySelector('polje-pretraga input').value = 'Tjentište'; document.querySelector('polje-pretraga input').dispatchEvent(new Event('input', {bubbles: true}))`)
    assert.ok(Number(await sacekaj(BROJ, 'broj pronađenih')) > 0)
  } finally {
    aktivno = false
    await send('Fetch.disable')
    await send('Network.setBypassServiceWorker', {bypass: false})
  }
})

test('zadrzani autori, posvete i ture ne blokiraju mapu i naknadno dopune otvorene detalje', async () => {
  const {send, slusaj} = pregledac
  const zaustavljeni = []
  let aktivno = true
  slusaj(m => {
    if (aktivno && m.method === 'Fetch.requestPaused') zaustavljeni.push(m.params)
  })
  await send('Network.setBypassServiceWorker', {bypass: true})
  await send('Fetch.enable', {patterns: ['autori', 'posvete', 'ture'].map(ime => ({urlPattern: `*data/${ime}.json`}))})
  try {
    await otvori('#mostar-partisan-cemetery')
    assert.ok(zaustavljeni.length >= 3)
    assert.equal(await izvrsi(`Object.keys(document.querySelector('detalji-spomenika').autori).length`), 0)
    await izvrsi(`(()=>{const d=document.querySelector('detalji-spomenika');d.prikazi(d.marker,true)})()`)
    for (const {requestId, request} of zaustavljeni) {
      const ime = new URL(request.url).pathname.split('/').at(-1)
      const body = readFileSync(new URL('../../data/' + ime, import.meta.url)).toString('base64')
      await send('Fetch.fulfillRequest', {requestId, responseCode: 200,
        responseHeaders: [{name: 'Content-Type', value: 'application/json'}], body})
    }
    await sacekaj(`(()=>{const d=document.querySelector('detalji-spomenika');return Object.keys(d.autori).length>0 && Object.keys(d.posvete).length>0 && document.querySelector('planer-rute').definicije.length>0 && !!d.shadowRoot.querySelector('.podaci a')})()`, 'naknadno ucitani dodaci')
    assert.equal(await izvrsi(`!!document.querySelector('detalji-spomenika').shadowRoot.querySelector('#nazad')`), true)
  } finally {
    aktivno = false
    await send('Fetch.disable')
    await send('Network.setBypassServiceWorker', {bypass: false})
  }
})

test('stara fotografija se osvezi pod istim URL-om i nova ostaje dostupna bez mreze', async () => {
  await uObjavljenoj()
  const putanja = 'slike/spomenici/podgaric.webp'
  const velicina = readFileSync(new URL('../../' + putanja, import.meta.url)).length
  const url = new URL(putanja, server.adresa).href
  const adresa = JSON.stringify(url)
  await izvrsi(`caches.open('spomenici-slike').then(kes=>kes.put(${adresa},new Response('stara-verzija')))`)
  assert.equal(await izvrsi(`fetch(${adresa}).then(r=>r.text())`), 'stara-verzija')
  await sacekaj(`caches.open('spomenici-slike').then(kes=>kes.match(${adresa})).then(r=>r.arrayBuffer()).then(b=>b.byteLength===${velicina})`, 'osvezena fotografija')
  await pregledac.send('Network.enable')
  await pregledac.send('Network.emulateNetworkConditions', {offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0})
  try {
    assert.equal(await izvrsi(`fetch(${adresa}).then(r=>r.arrayBuffer()).then(b=>b.byteLength)`), velicina)
  } finally {
    await pregledac.send('Network.emulateNetworkConditions', {offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1})
  }
})

test('paneli dobijaju fokus, Escape ih zatvara i vraca fokus na dugme', async () => {
  await otvori()
  await izvrsi(`import('./klase/mapa.js').then(({mapa})=>void mapa.fire('pozicija',{latlng:L.latLng(44,20)}))`)
  for (const selektor of ['dugme-legenda','planer-rute','lista-najblizih','panel-filteri']) {
    await izvrsi(`(()=>{
      const c=document.querySelector(${JSON.stringify(selektor)})
      const dugme=c.dugme || document.querySelector('polje-pretraga').dugme
      dugme.focus();dugme.click()
    })()`)
    await sacekaj(`(()=>{const c=document.querySelector(${JSON.stringify(selektor)});return !c.panel.hidden && c.shadowRoot.activeElement===c.panel})()`, 'fokus u panelu')
    await pregledac.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'})
    await pregledac.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'})
    const stanje = await izvrsi(`(()=>{const c=document.querySelector(${JSON.stringify(selektor)}),d=c.dugme || document.querySelector('polje-pretraga').dugme;return {hidden:c.panel.hidden,fokus:c.shadowRoot.activeElement===d || document.activeElement===d,aktivan:document.activeElement?.tagName,unutra:c.shadowRoot.activeElement?.id}})()`)
    assert.equal(stanje.hidden && stanje.fokus,true,selektor+': '+JSON.stringify(stanje))
  }
  await otvori('#mostar-partisan-cemetery')
  await sacekaj(`(()=>{const d=document.querySelector('detalji-spomenika');return d.shadowRoot.activeElement===d.panel && !!d.panel.getAttribute('aria-label')})()`,'fokus detalja')
  await pregledac.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'})
  await pregledac.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'})
  assert.equal(await izvrsi(`document.querySelector('detalji-spomenika').panel.hidden`),true)
})

test('nepotpuno ucitavanje ne skracuje sacuvanu automatsku turu i daje tacnu poruku', async () => {
  await otvori()
  const sacuvana = await izvrsi(`(()=>{
    const r=document.querySelector('planer-rute'),t=r.definicije.find(t=>t.id==='belgrade-in-the-peoples-liberation-struggle')
    const ids=[...r.stavke.values()].filter(x=>x.spomenik.mesto.startsWith('Beograd') && x.marker.najmanjiZum>9).slice(0,2).map(x=>x.spomenik.id)
    const ruta={turaId:t.id,naziv:t.naziv,spomenici:ids}
    localStorage.setItem('spomenici-ruta',JSON.stringify(ruta));return ruta
  })()`)
  assert.equal(sacuvana.spomenici.length,2)
  let aktivno = true
  const zaustavljeni=[],poruke=[]
  pregledac.slusaj(m=>{
    if(!aktivno)return
    if(m.method==='Fetch.requestPaused')zaustavljeni.push(m.params.requestId)
    if(m.method==='Page.javascriptDialogOpening'){
      poruke.push(m.params.message)
      pregledac.send('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{})
    }
  })
  await pregledac.send('Network.setBypassServiceWorker',{bypass:true})
  await pregledac.send('Fetch.enable',{patterns:[{urlPattern:'*data/spomenici-ostali.json'}]})
  try {
    await pregledac.send('Page.navigate',{url:'about:blank'})
    await pregledac.send('Page.navigate',{url:server.adresa})
    await sacekaj(`document.querySelector('polje-pretraga') && document.querySelector('planer-rute').definicije.length>0`,'prvi deo podataka')
    assert.deepEqual(await izvrsi(`JSON.parse(localStorage.getItem('spomenici-ruta'))`),sacuvana)
    assert.equal(await izvrsi(`document.querySelector('polje-pretraga input').disabled`),true,'pretraga čeka ostale spomenike')
    // drugi deo se trazi tek malo posle prvog crtanja
    for(let i=0;i<100 && !zaustavljeni.length;i++)await sleep(50)
    for(const requestId of zaustavljeni)await pregledac.send('Fetch.fulfillRequest',{requestId,responseCode:503,body:''})
    for(let i=0;i<50 && !poruke.length;i++)await sleep(50)
    assert.match(poruke[0],/samo deo spomenika/)
    assert.equal(await izvrsi(`document.querySelector('polje-pretraga input').disabled`),false,'bez ostalih pretražuju se istaknuti')
    assert.deepEqual(await izvrsi(`JSON.parse(localStorage.getItem('spomenici-ruta'))`),sacuvana)
  }finally{
    aktivno=false
    await pregledac.send('Fetch.disable')
    await pregledac.send('Network.setBypassServiceWorker',{bypass:false})
    await izvrsi(`localStorage.removeItem('spomenici-ruta')`)
  }
})

test('dodirne mete imaju najmanje 44 px i engleski prevod kontrola', async () => {
  await otvori()
  await izvrsi(`localStorage.setItem('spomenici-jezik','en')`)
  try{
    await otvori()
    const kontrole=await izvrsi(`({
      lokator:document.querySelector('dugme-lokator button').getAttribute('aria-label'),
      ekran:document.querySelector('dugme-pun-ekran button').getAttribute('aria-label'),
      mete:[document.querySelector('#jezik'),...document.querySelectorAll('.leaflet-control-zoom a')].map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})
    })`)
    assert.equal(kontrole.lokator,'Locate me')
    assert.equal(kontrole.ekran,'Full screen')
    assert.ok(kontrole.mete.every(([w,h])=>w>=44 && h>=44))
  }finally{await izvrsi(`localStorage.setItem('spomenici-jezik','sh')`)}
})

test('neproveren link autora ili posvete se prikazuje samo kao tekst', async () => {
  await otvori('#mostar-partisan-cemetery')
  const rezultat=await izvrsi(`(()=>{
    const d=document.querySelector('detalji-spomenika')
    return [d.praviAutore({autor:'Nepoznat'}),(()=>{d.autori.Nepoznat='javascript:alert(1)';return d.praviAutore({autor:'Nepoznat'})})(),
      (()=>{d.posvete.QPROBA={naziv:{sh:'Posveta'},wiki:'data:text/html,test'};return d.praviPosvetu({posveta:['QPROBA']})})()]
  })()`)
  assert.ok(rezultat.every(html=>!html.includes('<a ')))
})

test('U blizini naznacava da prikazuje samo filtrirane rezultate', async () => {
  await otvori()
  await izvrsi(`(()=>{const p=document.querySelector('polje-pretraga');p.polje.value='Tjentište';p.pretrazi()})()`)
  assert.equal(await izvrsi(`document.querySelector('lista-najblizih').panel.querySelector('.filteri').hidden`),false)
  await izvrsi(`document.querySelector('polje-pretraga').ponisti()`)
  assert.equal(await izvrsi(`document.querySelector('lista-najblizih').panel.querySelector('.filteri').hidden`),true)
})

test('traka dopunjava fotografije nakon prosirenja ekrana bez rucnog pomeranja', async () => {
  await otvori()
  await sacekajTraku()
  const pre = await izvrsi(`document.querySelector('nav-slajder').traka.childElementCount`)
  try {
    await pregledac.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false})
    await sacekaj(`(()=>{const t=document.querySelector('nav-slajder').traka;return t.childElementCount>${pre} && t.scrollWidth>=t.clientWidth})()`,'dopunjena traka na sirokom ekranu')
  } finally {
    await pregledac.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true})
  }
})

test('groblje ima zaseban filter, oznaku u legendi i marker', async () => {
  await otvori()
  await sacekaj("document.documentElement.dataset.podaci==='svi'", 'ucitani svi grobovi')
  await izvrsi("document.querySelector('polje-pretraga .dugme-filteri').click()")
  const root = "document.querySelector('panel-filteri').shadowRoot"
  const cip = `${root}.querySelector('[data-grupa="tip"][data-opcija="groblje"]')`
  assert.match(await izvrsi(`${cip}.textContent`), /Groblje/)
  await izvrsi(`${cip}.click()`)
  const vrste = await izvrsi("document.querySelector('polje-pretraga').filtrirano.map(s=>s.spomenik.vrsta)")
  assert.ok(vrste.length > 0)
  assert.ok(vrste.every(v=>v==='groblje'))
  await izvrsi(`${root}.querySelector('#prikazi').click()`)
  await sacekaj("!!document.querySelector('.leaflet-marker-pane img[src*=\"groblje-postoji.svg\"]')", 'marker groba posle potvrde')
  await izvrsi("document.querySelector('dugme-legenda').shadowRoot.querySelector('button').click()")
  assert.match(await izvrsi("document.querySelector('dugme-legenda').shadowRoot.textContent"), /Groblje/)
})

test('bez grešaka u aplikaciji', () => {
  assert.deepEqual(greske, [])
})
