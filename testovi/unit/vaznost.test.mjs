import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {zumVrste, zumPoVaznosti, vaznostVrste, nivoiVaznosti} from '../../utils/vaznost.js'

test('izvorna važnost počinje od jedan i daje jedinstvene uzastopne prioritete', () => {
  assert.equal(vaznostVrste.istaknut, 1)
  assert.deepEqual(nivoiVaznosti.map(v => vaznostVrste[v]), Array.from({length: nivoiVaznosti.length}, (_, i) => i + 1))
})

test('sama promena važnosti određuje redosled, slojeve i zum, uključujući jedanaesti nivo', async () => {
  const redosled = ['istaknut', ...Object.keys(zumVrste).reverse(), 'probna-vrsta']
  const konfiguracija = Object.fromEntries(redosled.map((v, i) => [v, i + 1]).reverse())
  const kod = readFileSync(new URL('../../utils/vaznost.js', import.meta.url), 'utf8')
    .replace(/export const vaznostVrste = \{[^}]*\}/u, `export const vaznostVrste = ${JSON.stringify(konfiguracija)}`)
  const m = await import(`data:text/javascript;base64,${Buffer.from(kod).toString('base64')}`)
  assert.deepEqual(m.nivoiVaznosti, redosled)
  for (const [i, vrsta] of redosled.entries()) {
    const s = {vrsta: vrsta === 'istaknut' ? 'spomenik' : vrsta, istaknut: vrsta === 'istaknut'}
    assert.equal(m.vaznostSpomenika(s), i + 1)
    assert.equal(m.slojSpomenika(s), (redosled.length - 1 - i) * 1000)
    const zum = zumPoVaznosti[Math.min(i + 1, Math.max(...Object.keys(zumPoVaznosti).map(Number)))]
    assert.equal(m.najmanjiZum(s), zum)
    if (!s.istaknut) assert.equal(m.zumVrste[vrsta], zum)
    assert.ok(m.slojSpomenika({...s, priblizno: true}) < m.slojSpomenika(s))
  }
  assert.equal(m.zumVrste['spomen-ploca'], 8)
  assert.equal(m.zumVrste['spomen-park'], 12)
})
