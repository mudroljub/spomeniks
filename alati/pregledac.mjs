// Chrome bez prozora, upravljan preko CDP-a; zajednicko za snimi.mjs, merenje.mjs i test.mjs
import {spawn} from 'node:child_process'
import {mkdtempSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

export const sleep = ms => new Promise(r => setTimeout(r, ms))

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

// slusaj(fn) dobija svaku CDP poruku sa dogadjajem (npr. Runtime.exceptionThrown)
export const otvoriPregledac = async () => {
  const port = 9300 + Math.floor(Math.random() * 500)
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, '--disable-gpu', '--hide-scrollbars', '--lang=sr',
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, 'about:blank',
  ], {stdio: 'ignore'})

  let tabs
  for (let i = 0; i < 50 && !tabs; i++) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json() } catch { await sleep(200) }
  }
  if (!tabs) throw new Error('Chrome se nije pokrenuo')
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
  await new Promise(r => ws.onopen = r)

  let id = 0
  const pending = {}
  const slusaoci = []
  ws.onmessage = e => {
    const m = JSON.parse(e.data)
    if (pending[m.id]) { pending[m.id](m); delete pending[m.id] }
    if (m.method) slusaoci.forEach(fn => fn(m))
  }
  const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})) })
  const izvrsi = async izraz =>
    (await send('Runtime.evaluate', {expression: izraz, awaitPromise: true, returnByValue: true})).result?.result?.value

  return {send, izvrsi, slusaj: fn => slusaoci.push(fn), zatvori: () => chrome.kill()}
}

// lokalni server u korenu repozitorijuma, za alate koji ga pokrecu sami
export const pokreniServer = async () => {
  const koren = join(dirname(fileURLToPath(import.meta.url)), '..')
  const port = 8800 + Math.floor(Math.random() * 500)
  const server = spawn('python', ['-m', 'http.server', String(port)], {cwd: koren, stdio: 'ignore'})
  const adresa = `http://localhost:${port}/`
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(adresa)).ok) return {adresa, zatvori: () => server.kill()} } catch { await sleep(200) }
  }
  server.kill()
  throw new Error('server se nije pokrenuo')
}
