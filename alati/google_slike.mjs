// node alati/google_slike.mjs <izlaz.json>  (iz korena repozitorijuma)
// za spomenike bez slike sa googleCid otvara mesto na Google mapama, jedno po jedno uz pauzu, i pamti adresu glavne
// fotografije koju je postavio korisnik (Street View i slike bez fotografije mesta se preskacu); napredak se cuva posle
// svakog mesta, pa se posle prekida nastavlja; staje kad Google trazi proveru (captcha)
import {spawn} from 'node:child_process'
import {existsSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {ucitajBazu} from './baza.mjs'

const izlaz = process.argv[2]
const pauza = 8000
const rezultat = existsSync(izlaz) ? JSON.parse(readFileSync(izlaz, 'utf8')) : {}
const posao = ucitajBazu()
  .filter(s => !s.slika && s.googleCid && !(s.id in rezultat))
console.log('za obradu', posao.length)

const port = 9300 + Math.floor(Math.random() * 500)
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', `--remote-debugging-port=${port}`, '--disable-gpu', '--lang=sr',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, 'about:blank',
], {stdio: 'ignore'})
const sleep = ms => new Promise(r => setTimeout(r, ms))
let tabs
for (let i = 0; i < 50; i++) {
  try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break } catch { await sleep(200) }
}
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.onopen = r)
let id = 0
const pending = {}
ws.onmessage = e => { const m = JSON.parse(e.data); if (pending[m.id]) { pending[m.id](m); delete pending[m.id] } }
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})) })
const izvrsi = async izraz => (await send('Runtime.evaluate', {expression: izraz, awaitPromise: true, returnByValue: true})).result?.result?.value
await send('Emulation.setDeviceMetricsOverride', {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false})
await send('Page.enable')
await send('Runtime.enable')

// glavna fotografija je prva velika slika korisnika u panelu mesta; male su avatari i ikonice
const nadjiSliku = `(() => {
  const slike = [...document.querySelectorAll('img')]
    .filter(i => /googleusercontent\\.com\\/(grass-cs|gps-cs-s|p)\\//.test(i.src) && i.getBoundingClientRect().width >= 200)
  return {slika: slike[0]?.src.replace(/=[^=/]*$/, '') || null, naziv: document.querySelector('h1')?.textContent || null}
})()`
const pristanak = `(() => {
  const dugme = [...document.querySelectorAll('button, input[type=submit]')]
    .find(b => /Accept all|Prihvati sve|Прихвати све|Reject all|Odbij sve|Одбиј све/i.test(b.textContent || b.value))
  dugme?.click()
  return Boolean(dugme)
})()`

for (const [i, s] of posao.entries()) {
  await send('Page.navigate', {url: `https://www.google.com/maps?cid=${s.googleCid}&hl=sr`})
  await sleep(pauza)
  if (await izvrsi(pristanak)) await sleep(pauza)
  if (/\/sorry\//.test(await izvrsi('location.href'))) {
    console.log('Google trazi proveru, stajem')
    break
  }
  rezultat[s.id] = await izvrsi(nadjiSliku)
  writeFileSync(izlaz, JSON.stringify(rezultat, null, 1))
  if (i % 20 === 19) console.log(i + 1, 'sa slikom', Object.values(rezultat).filter(r => r?.slika).length)
}
console.log('gotovo', Object.keys(rezultat).length, 'sa slikom', Object.values(rezultat).filter(r => r?.slika).length)
chrome.kill()
process.exit(0)
