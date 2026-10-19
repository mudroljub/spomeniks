import '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {
  dajRutu, dajNaziv, dajTuruId, dajWiki, postaviRutu, izaberiTuru, uRuti, dodajURutu, ukloniIzRute, pomeri, promeneRute,
} from '../../utils/ruta.js'

const sacuvana = () => JSON.parse(localStorage.getItem('spomenici-ruta'))

test('dodavanje, uklanjanje i pomeranje stanica čuva redosled na uređaju', () => {
  postaviRutu([])
  dodajURutu('a'); dodajURutu('b'); dodajURutu('c')
  assert.deepEqual(dajRutu(), ['a', 'b', 'c'])
  assert.ok(uRuti('b'))
  pomeri('c', -1)
  assert.deepEqual(dajRutu(), ['a', 'c', 'b'])
  pomeri('a', -1)
  pomeri('b', 1)
  pomeri('x', 1)
  assert.deepEqual(dajRutu(), ['a', 'c', 'b'], 'pomeranje van granica i nepoznata stanica ne menjaju rutu')
  ukloniIzRute('c')
  assert.deepEqual(dajRutu(), ['a', 'b'])
  assert.deepEqual(sacuvana().spomenici, ['a', 'b'])
})

test('izabrana tura zadržava naziv i vezu dok se stanice ne promene', () => {
  izaberiTuru({id: 'nis', naziv: 'Niš u NOB', spomenici: ['x', 'y'], wiki: 'https://sh.wikipedia.org/wiki/Ni%C5%A1'})
  assert.equal(dajTuruId(), 'nis')
  assert.equal(dajNaziv(), 'Niš u NOB')
  assert.equal(dajWiki(), 'https://sh.wikipedia.org/wiki/Ni%C5%A1')
  dodajURutu('z')
  assert.equal(dajTuruId(), undefined, 'izmenjena tura više nije automatska')
  assert.equal(dajNaziv(), 'Niš u NOB', 'ime ostaje, jer je to i dalje ista ruta')
})

test('prazna ruta briše ime, a svaka promena javlja događaj', () => {
  let promena = 0
  promeneRute.addEventListener('promena', () => promena++)
  postaviRutu(['a'])
  postaviRutu([])
  assert.equal(promena, 2)
  assert.deepEqual(dajRutu(), [])
  assert.equal(dajNaziv(), '')
})

test('oštećen zapis na uređaju daje praznu rutu', async () => {
  localStorage.setItem('spomenici-ruta', '{neispravan')
  const sveza = await import('../../utils/ruta.js?ostecen')
  assert.deepEqual(sveza.dajRutu(), [])
  localStorage.setItem('spomenici-ruta', JSON.stringify({spomenici: 'nije-niz'}))
  const druga = await import('../../utils/ruta.js?bez-niza')
  assert.deepEqual(druga.dajRutu(), [])
})
