// node alati/merenje.mjs [url]  (podrazumevano http://localhost:8765/, server: python -m http.server 8765)
// telefon od 390 px sa procesorom usporenim CPU puta (podrazumevano 6); MREZA=1 dodaje sporu vezu (400 kb/s, 400 ms), a MREZA=kbps,ms zadatu
// lokalni server ne sazima fajlove kao GitHub Pages, pa za mrezu meriti preko servera sa gzip-om
// za svaku radnju: zbir i najduzi od dugih zadataka (> 50 ms) u sledece 2 s, u ms
import {otvoriPregledac, sleep} from './pregledac.mjs'

const adresa = process.argv[2] || 'http://localhost:8765/'
const {send, izvrsi, slusaj, zatvori} = await otvoriPregledac()
const adrese = {}
const bajtovi = {}
slusaj(m => {
  if (m.method === 'Network.responseReceived') adrese[m.params.requestId] = m.params.response.url
  if (m.method === 'Network.loadingFinished') bajtovi[m.params.requestId] = m.params.encodedDataLength
  if (m.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(m.params.exceptionDetails).slice(0, 400))
})

await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 2, mobile: true})
await send('Emulation.setTouchEmulationEnabled', {enabled: true})
await send('Emulation.setCPUThrottlingRate', {rate: Number(process.env.CPU || 6)})
await send('Network.enable')
if (process.env.MREZA) {
  const [kbps, kasnjenje] = process.env.MREZA === '1' ? [400, 400] : process.env.MREZA.split(',').map(Number)
  await send('Network.emulateNetworkConditions', {offline: false, latency: kasnjenje, downloadThroughput: kbps * 125, uploadThroughput: kbps * 125})
}
await send('Page.enable')
await send('Runtime.enable')
await send('Page.addScriptToEvaluateOnNewDocument', {source: `
  window.__dugi = []
  new PerformanceObserver(l => l.getEntries().forEach(e => __dugi.push(e.duration))).observe({type: 'longtask', buffered: true})`})

const brojObeliska = "document.querySelectorAll('.leaflet-marker-pane img').length"
const dugi = async () => {
  const d = await izvrsi('__dugi.splice(0)')
  return `zbir ${Math.round(d.reduce((a, b) => a + b, 0))}, najduzi ${Math.round(Math.max(0, ...d))}`
}
// radnja je JS izraz koji se izvrsi u stranici ili funkcija koja salje CDP komande
const meri = async (ime, radnja, cekanje = 2000) => {
  await izvrsi('__dugi.splice(0)')
  await (typeof radnja === 'function' ? radnja() : izvrsi(radnja))
  await sleep(cekanje)
  console.log(`${ime}: ${await dugi()}, obeliska ${await izvrsi(brojObeliska)}`)
}

const pocetak = Date.now()
await send('Page.navigate', {url: adresa})
let prvi = null
for (let i = 0; i < 600 && !prvi; i++) {
  if (await izvrsi(brojObeliska) > 0) prvi = Date.now() - pocetak
  else await sleep(100)
}
console.log(`prvi obelisci: ${prvi ?? 'nisu se pojavili'} ms`)
await sleep(4000)
console.log(`otvaranje: ${await dugi()}, obeliska ${await izvrsi(brojObeliska)}`)

const zum = "document.querySelector('.leaflet-control-zoom-in').click()"
for (const nivo of [9, 10, 11]) await meri(`zum na ${nivo}`, zum)
const prevuci = (dx, dy) => async () => {
  const mis = (type, x, y) => send('Input.dispatchMouseEvent', {type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1})
  await mis('mousePressed', 195, 420)
  for (let i = 1; i <= 10; i++) await mis('mouseMoved', 195 + dx * i / 10, 420 + dy * i / 10)
  await mis('mouseReleased', 195 + dx, 420 + dy)
}
await meri('pomeranje levo', prevuci(-300, 0))
await meri('pomeranje gore', prevuci(0, -400))
await meri('zum na 12', zum)
await meri('otvaranje spomenika', "document.querySelector('.leaflet-marker-pane img').dispatchEvent(new MouseEvent('click', {bubbles: true}))")
const kucaj = tekst => `(() => { const polje = document.querySelector('polje-pretraga input'); polje.value = '${tekst}'; polje.dispatchEvent(new Event('input', {bubbles: true})) })()`
await meri('pretraga, dva slova', kucaj('ko'), 3000)
await meri('pretraga, treće slovo', kucaj('kos'), 3000)
await meri('pretraga obrisana', kucaj(''), 3000)

const grupe = {}
for (const [zahtev, url] of Object.entries(adrese)) {
  const grupa = /arcgis|openstreetmap/.test(url) ? 'plocice' : /\/slike\/(spomenici|male)\//.test(url) ? 'slike'
    : /\.json/.test(url) ? 'podaci' : /\.m?js(\?|$)/.test(url) ? 'js' : 'ostalo'
  grupe[grupa] ??= {zahteva: 0, kb: 0}
  grupe[grupa].zahteva++
  grupe[grupa].kb += (bajtovi[zahtev] || 0) / 1024
}
console.log('preneto:', Object.entries(grupe).map(([g, {zahteva, kb}]) => `${g} ${zahteva}/${Math.round(kb)} KB`).join(', '))
await zatvori()
process.exit(0)
