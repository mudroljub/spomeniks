// node snimi.mjs <izlaz.png> [js koji se izvrsi pre snimka] [cekanje ms]
import {writeFileSync} from 'node:fs'
import {otvoriPregledac, sleep} from './pregledac.mjs'

const [izlaz, skript = '', cekanje = '3000'] = process.argv.slice(2)
const {send, slusaj, zatvori} = await otvoriPregledac()

await send('Emulation.setDeviceMetricsOverride', {width: Number(process.env.W || 390), height: Number(process.env.H || 844), deviceScaleFactor: process.env.W ? 1 : 2, mobile: !process.env.W})
await send('Emulation.setTouchEmulationEnabled', {enabled: true})
await send('Emulation.setUserAgentOverride', {userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'})
await send('Browser.grantPermissions', {permissions: ['geolocation'], origin: 'http://localhost:8765'})
await send('Emulation.setGeolocationOverride', {latitude: 44.80, longitude: 20.46, accuracy: 30})
await send('Page.enable')
await send('Runtime.enable')
slusaj(m => {
  if (m.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(m.params.exceptionDetails).slice(0, 400))
  if (m.method === 'Runtime.consoleAPICalled') console.log('CONSOLE', m.params.args.map(a => a.value).join(' '))
})
await send('Page.navigate', {url: 'http://localhost:8765/' + (process.env.HASH || '')})
await sleep(4000)
if (skript) {
  const r = await send('Runtime.evaluate', {expression: skript, awaitPromise: true, returnByValue: true})
  console.log('EVAL', JSON.stringify(r.result?.result?.value ?? r.result))
}
await sleep(Number(cekanje))
const {result} = await send('Page.captureScreenshot', {format: 'png'})
writeFileSync(izlaz, Buffer.from(result.data, 'base64'))
await zatvori()
process.exit(0)
