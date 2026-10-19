import '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mejl, prijavaUrl} from '../../utils/prijava.js'

const delovi = url => {
  const [adresa, upit] = url.split('?')
  const p = new URLSearchParams(upit)
  return {adresa, naslov: p.get('subject'), poruka: p.get('body')}
}

test('adresa se sastavlja tek na zahtev', () => {
  assert.match(mejl(), /^[a-z]+@gmail\.com$/)
})

test('nova prijava ima prazna polja za naziv i lokaciju', () => {
  const {adresa, naslov, poruka} = delovi(prijavaUrl())
  assert.equal(adresa, `mailto:${mejl()}`)
  assert.equal(naslov, 'Dodaj spomenik')
  assert.match(poruka, /^Naziv spomenika \(obavezno\): \r\nLokacija — link iz mape \(obavezno\): \r\n/)
})

test('dopuna postojećeg spomenika unapred popunjava naziv i tačku', () => {
  const {naslov, poruka} = delovi(prijavaUrl({naziv: 'Kameni cvijet', mesto: 'Jasenovac', koordinate: {lat: 45.27, lng: 16.93}}))
  assert.equal(naslov, 'Dopuna podataka: Kameni cvijet')
  assert.ok(poruka.includes('Kameni cvijet'))
  assert.ok(poruka.includes('https://www.google.com/maps?q=45.27,16.93'))
  assert.equal(delovi(prijavaUrl({mesto: 'Kozara', koordinate: {lat: 1, lng: 2}})).naslov, 'Dopuna podataka: Kozara')
})

test('naziv sa ćirilicom i URL znacima ostaje ceo u naslovu i poruci', () => {
  const naziv = 'Споменик „Братство & јединство“ #1?'
  const {naslov, poruka} = delovi(prijavaUrl({naziv, koordinate: {lat: 41.99, lng: 21.43}}))
  assert.equal(naslov, 'Dopuna podataka: ' + naziv)
  assert.ok(poruka.startsWith('Naziv spomenika (obavezno): ' + naziv + '\r\n'))
  assert.ok(poruka.includes('https://www.google.com/maps?q=41.99,21.43'))
})
