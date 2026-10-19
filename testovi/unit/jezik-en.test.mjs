import {postaviNavigator} from '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'

postaviNavigator({jezici: ['de-DE', 'en-US']})
const {jezik, t, nazivDrzave} = await import('../../utils/jezik.js')

test('stranac bez sačuvanog izbora dobija engleski', () => {
  assert.equal(jezik, 'en')
  assert.equal(t('prikazi', 1), 'Show 1 monument')
  assert.equal(t('stanice', 3), '3 stops')
  assert.equal(nazivDrzave('Serbia'), 'Serbia')
})
