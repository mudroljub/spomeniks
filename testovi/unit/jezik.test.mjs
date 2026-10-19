import '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {jezik, t, nazivDrzave} from '../../utils/jezik.js'

test('domaći jezik pregledača daje srpskohrvatski', () => {
  assert.equal(jezik, 'sh')
})

test('broj spomenika prati padež jednine i množine', () => {
  assert.equal(t('prikazi', 1), 'Prikaži 1 spomenik')
  assert.equal(t('prikazi', 21), 'Prikaži 21 spomenik')
  assert.equal(t('prikazi', 11), 'Prikaži 11 spomenika')
  assert.equal(t('prikazi', 5), 'Prikaži 5 spomenika')
})

test('broj stanica koristi paucal za 2–4, osim 12–14', () => {
  assert.equal(t('stanice', 2), '2 stanice')
  assert.equal(t('stanice', 24), '24 stanice')
  assert.equal(t('stanice', 12), '12 stanica')
  assert.equal(t('stanice', 5), '5 stanica')
})

test('tekst sa više vrednosti i nazivi država', () => {
  assert.equal(t('nadjeno', 3, 10), '3 od 10 spomenika')
  assert.equal(t('zatvori'), 'Zatvori')
  assert.equal(nazivDrzave('Bosnia and Herzegovina'), 'Bosna i Hercegovina')
  assert.equal(nazivDrzave('Nepoznata'), 'Nepoznata')
})
