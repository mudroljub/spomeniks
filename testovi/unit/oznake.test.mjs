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

test('označavanje radi u memoriji kada pregledač zabrani skladište', async t => {
  t.mock.method(localStorage, 'getItem', () => { throw new Error('zabranjeno čitanje') })
  t.mock.method(localStorage, 'setItem', () => { throw new Error('zabranjen upis') })
  const nove = await import('../../utils/oznake.js?bez-skladista')
  let promena = 0
  nove.promene.addEventListener('promena', () => promena++)
  assert.equal(nove.dajOznaku('a'), undefined)
  nove.postaviOznaku('a', 'lista')
  assert.equal(nove.dajOznaku('a'), 'lista')
  nove.postaviOznaku('a', 'posetio')
  assert.equal(nove.dajOznaku('a'), 'posetio')
  nove.postaviOznaku('a', null)
  assert.equal(nove.dajOznaku('a'), undefined)
  assert.equal(promena, 3)
})
