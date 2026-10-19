// Chrome bez prozora, upravljan preko CDP-a; zajednicko za snimi.mjs, merenje.mjs i testovi/e2e
import {spawn} from 'node:child_process'
import {existsSync, mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

export const sleep = ms => new Promise(r => setTimeout(r, ms))

// putanja iz CHROME, inace uobicajena mesta na Windows-u, macOS-u i Linux-u
const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find(existsSync)

// komanda bez odgovora u ovom roku znaci da je pregledac zaglavljen
const rokKomande = 60000

// slusaj(fn) dobija svaku CDP poruku sa dogadjajem (npr. Runtime.exceptionThrown)
export const otvoriPregledac = async () => {
  if (!CHROME) throw new Error('Chrome nije nadjen; putanju zadaj u promenljivoj CHROME')
  const port = 9300 + Math.floor(Math.random() * 500)
  const profil = mkdtempSync(join(tmpdir(), 'cdp-'))
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, '--disable-gpu', '--hide-scrollbars', '--lang=sr',
    `--user-data-dir=${profil}`, 'about:blank',
  ], {stdio: 'ignore'})
  const zavrsen = new Promise(r => chrome.once('exit', r))
  const zatvori = async () => {
    chrome.kill()
    await zavrsen
    rmSync(profil, {recursive: true, force: true, maxRetries: 5, retryDelay: 200})
  }

  let tabs
  for (let i = 0; i < 50 && !tabs; i++) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json() } catch { await sleep(200) }
  }
  if (!tabs) {
    await zatvori()
    throw new Error('Chrome se nije pokrenuo')
  }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
  await new Promise(r => ws.onopen = r)

  let id = 0
  const pending = new Map()
  const slusaoci = []
  ws.onmessage = e => {
    const m = JSON.parse(e.data)
    const cekanje = pending.get(m.id)
    if (cekanje) {
      pending.delete(m.id)
      clearTimeout(cekanje.rok)
      if (m.error) cekanje.odbij(new Error(`${cekanje.method}: ${m.error.message}`))
      else cekanje.resi(m)
    }
    if (m.method) slusaoci.forEach(fn => fn(m))
  }
  ws.onclose = () => {
    for (const {method, odbij, rok} of pending.values()) {
      clearTimeout(rok)
      odbij(new Error(`${method}: veza sa pregledacem je prekinuta`))
    }
    pending.clear()
  }
  // vraca celu CDP poruku; greska CDP-a, prekid veze i istek roka odbijaju obecanje
  const send = (method, params = {}, sessionId) => new Promise((resi, odbij) => {
    if (ws.readyState !== WebSocket.OPEN) return odbij(new Error(`${method}: veza sa pregledacem nije otvorena`))
    const broj = ++id
    const rok = setTimeout(() => {
      pending.delete(broj)
      odbij(new Error(`${method}: bez odgovora ${rokKomande / 1000} s`))
    }, rokKomande)
    pending.set(broj, {method, resi, odbij, rok})
    ws.send(JSON.stringify({id: broj, method, params, ...(sessionId ? {sessionId} : {})}))
  })
  // izuzetak u izrazu odbija obecanje, umesto da vrati undefined
  const izvrsi = async izraz => {
    const {result} = await send('Runtime.evaluate', {expression: izraz, awaitPromise: true, returnByValue: true})
    if (result.exceptionDetails) {
      const {exception, text} = result.exceptionDetails
      throw new Error(exception?.description ?? text)
    }
    return result.result.value
  }

  return {send, izvrsi, slusaj: fn => slusaoci.push(fn), zatvori}
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
