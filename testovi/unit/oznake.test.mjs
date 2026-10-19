import '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {dajOznaku, postaviOznaku, promene} from '../../utils/oznake.js'

test('spomenik ima najviše jednu oznaku, sačuvanu na uređaju', () => {
  let promena = 0
  promene.addEventListener('promena', () => promena++)
  postaviOznaku('kozara', 'lista')
  postaviOznaku('kozara', 'posetio')
  assert.equal(dajOznaku('kozara'), 'posetio')
  assert.deepEqual(JSON.parse(localStorage.getItem('spomenici-poseta')), {kozara: 'posetio'})
  postaviOznaku('kozara', null)
  assert.equal(dajOznaku('kozara'), undefined)
  assert.deepEqual(JSON.parse(localStorage.getItem('spomenici-poseta')), {})
  assert.equal(promena, 3)
})

test('oznake se učitavaju sa uređaja, a oštećen zapis ih ne ruši', async () => {
  localStorage.setItem('spomenici-poseta', JSON.stringify({tjentiste: 'lista'}))
  assert.equal((await import('../../utils/oznake.js?sacuvane')).dajOznaku('tjentiste'), 'lista')
  localStorage.setItem('spomenici-poseta', '{neispravan')
  assert.equal((await import('../../utils/oznake.js?ostecene')).dajOznaku('tjentiste'), undefined)
})
