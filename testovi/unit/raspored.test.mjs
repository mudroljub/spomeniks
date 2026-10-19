import {test} from 'node:test'
import assert from 'node:assert/strict'
import Raspored from '../../utils/raspored.js'

const okvir = (levo, gore, sirina = 40, visina = 20) => ({levo, gore, desno: levo + sirina, dole: gore + visina})

test('prva oznaka ostaje na mestu, a druga na istom mestu se pomera najbliže moguće', () => {
  const r = new Raspored()
  assert.deepEqual(r.pomeri(okvir(100, 100)), [0, 0])
  const [dx, dy] = r.pomeri(okvir(100, 100))
  assert.ok(dx || dy, 'preklopljena oznaka mora da se pomeri')
  assert.ok(Math.hypot(dx, dy) <= 96, 'pomeraj je najviše 96 px')
  assert.ok(r.slobodno(okvir(300, 300)))
})

test('oznake koje se samo dodiruju ivicom se ne preklapaju', () => {
  const r = new Raspored()
  r.dodaj(okvir(0, 0))
  assert.ok(r.slobodno(okvir(40, 0)))
  assert.ok(r.slobodno(okvir(0, 20)))
  assert.ok(!r.slobodno(okvir(39, 0)))
})

test('kada nema mesta u krugu od 96 px, oznaka ostaje na svom mestu', () => {
  const r = new Raspored()
  r.dodaj({levo: -500, gore: -500, desno: 500, dole: 500})
  assert.deepEqual(r.pomeri(okvir(0, 0)), [0, 0])
})
