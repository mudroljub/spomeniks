import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createServer} from 'node:http'
import {otvoriPregledac, sleep} from '../../alati/pregledac.mjs'

test('novo izdanje ceka stare klijente i zatim koristi svoj komplet resursa u Chrome-u', {timeout: 30000}, async () => {
  const kod = readFileSync(new URL('../../sw.js', import.meta.url), 'utf8')
  let izdanje = 'staro'
  const server = createServer((zahtev, odgovor) => {
    odgovor.setHeader('Cache-Control', 'no-store')
    if (zahtev.url === '/sw.js') {
      odgovor.setHeader('Content-Type', 'text/javascript')
      odgovor.end(kod.replace(/const VERZIJA = '[^']+'/u, `const VERZIJA = 'proba-${izdanje}'`))
    } else if (zahtev.url.startsWith('/utils/')) {
      odgovor.setHeader('Content-Type', 'text/javascript')
      odgovor.end(readFileSync(new URL('../../' + zahtev.url.slice(1), import.meta.url)))
    } else if (['/', '/index.html', '/zadrzana.html'].includes(zahtev.url)) {
      odgovor.setHeader('Content-Type', 'text/html')
      odgovor.end(`<!doctype html><body>${izdanje}<script type="module">
        ${zahtev.url === '/zadrzana.html' ? "navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.vrsta==='OSVEZI_IZDANJE')e.stopImmediatePropagation()})" : ''}
        import {pratiIzdanje} from './utils/azuriranje.js';
        navigator.serviceWorker.register('sw.js').then(pratiIzdanje)
      </script>`)
    } else odgovor.end(`${izdanje}:${zahtev.url}`)
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  const adresa = `http://127.0.0.1:${server.address().port}/`
  let b
  try {
    b = await otvoriPregledac()
    const verzije = new Map()
    b.slusaj(m => {
      if (m.method === 'ServiceWorker.workerVersionUpdated')
        m.params.versions.filter(v => v.scriptURL === adresa + 'sw.js').forEach(v => verzije.set(v.versionId, v))
    })
    await b.send('Page.enable')
    await b.send('ServiceWorker.enable')
    const cekaj = async proveri => {
      for (const kraj = Date.now() + 10000; Date.now() < kraj; await sleep(50)) {
        try { if (await proveri()) return } catch {}
      }
      assert.fail('isteklo cekanje na service worker')
    }
    await b.send('Page.navigate', {url: adresa})
    await cekaj(() => b.izvrsi(`document.readyState === 'complete'`))
    await b.izvrsi(`navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(()=>true)`)
    await b.send('Page.reload')
    await cekaj(() => b.izvrsi(`!!navigator.serviceWorker.controller`))
    await b.izvrsi(`new Promise(r=>{window.druga=document.createElement('iframe');druga.onload=()=>r(true);druga.src='index.html';document.body.appendChild(druga)})`)
    assert.equal(await b.izvrsi(`druga.contentWindow.fetch('main.js').then(r=>r.text())`), 'staro:/main.js')
    const stareVerzije = new Set(verzije.keys())
    izdanje = 'novo'
    await b.izvrsi(`navigator.serviceWorker.getRegistration().then(r=>r.update()).then(()=>true)`)
    await cekaj(() => b.izvrsi(`navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)`))
    const novaVerzija = [...verzije.values()].find(v => !stareVerzije.has(v.versionId))
    assert.ok(novaVerzija)
    assert.equal(await b.izvrsi(`fetch('main.js').then(r=>r.text())`), 'staro:/main.js')
    assert.equal(await b.izvrsi(`druga.contentWindow.fetch('main.js').then(r=>r.text())`), 'staro:/main.js')
    assert.equal(await b.izvrsi(`caches.open('spomenici-aplikacija-proba-novo').then(k=>k.match(new URL('main.js',location.href))).then(r=>r.text())`), 'novo:/main.js')
    await b.send('Page.navigate', {url: 'about:blank'})
    await cekaj(() => verzije.get(novaVerzija.versionId)?.status === 'activated')
    await b.send('Page.navigate', {url: adresa})
    await cekaj(() => b.izvrsi(`location.origin===${JSON.stringify(new URL(adresa).origin)} && !!navigator.serviceWorker.controller`))
    assert.equal(await b.izvrsi(`fetch('main.js').then(r=>r.text())`), 'novo:/main.js')
    assert.equal(await b.izvrsi(`caches.has('spomenici-aplikacija-proba-staro')`), false)
    // Druga kartica namerno odlozi ponovno ucitavanje da proverimo da joj se izdanje ne promeni usred rada.
    const {result:{targetId}} = await b.send('Target.createTarget',{url:adresa+'zadrzana.html'})
    const {result:{sessionId}} = await b.send('Target.attachToTarget',{targetId,flatten:true})
    const izvrsiDrugu = async expression => {
      const {result} = await b.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId)
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description)
      return result.result.value
    }
    await cekaj(() => izvrsiDrugu(`document.readyState==='complete' && !!navigator.serviceWorker.controller`))
    izdanje = 'trece'
    await b.izvrsi(`navigator.serviceWorker.getRegistration().then(r=>r.update()).then(()=>true)`)
    await cekaj(() => b.izvrsi(`!!document.querySelector('.novo-izdanje button')`))
    await b.izvrsi(`document.querySelector('.novo-izdanje button').click()`)
    await cekaj(() => b.izvrsi(`document.body.textContent.startsWith('trece') && !!navigator.serviceWorker.controller`))
    assert.equal(await b.izvrsi(`fetch('main.js').then(r=>r.text())`),'trece:/main.js')
    assert.equal(await izvrsiDrugu(`fetch('main.js').then(r=>r.text())`),'novo:/main.js')
    assert.equal(await b.izvrsi(`caches.has('spomenici-aplikacija-proba-novo')`),true)
    await b.send('Page.reload',{},sessionId)
    await cekaj(() => izvrsiDrugu(`document.body.textContent.startsWith('trece')`))
    await cekaj(() => b.izvrsi(`caches.has('spomenici-aplikacija-proba-novo').then(v=>!v)`))
  } finally {
    await b?.zatvori()
    server.closeAllConnections()
    await new Promise(r => server.close(r))
  }
})
