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

test('ponovno učitavanje vraća redosled i podatke izabrane ture', async () => {
  const tura = {id: 'test-tura', naziv: 'Putovanje', spomenici: ['b', 'a'], wiki: 'https://example.org/tura'}
  izaberiTuru(tura)
  const nova = await import('../../utils/ruta.js?ponovno-ucitavanje')
  assert.deepEqual(nova.dajRutu(), ['b', 'a'])
  assert.equal(nova.dajTuruId(), tura.id)
  assert.equal(nova.dajNaziv(), tura.naziv)
  assert.equal(nova.dajWiki(), tura.wiki)
})

test('uklanjanje poslednje stanice briše i podatke izabrane ture', () => {
  izaberiTuru({id: 'test-tura', naziv: 'Putovanje', spomenici: ['a'], wiki: 'https://example.org/tura'})
  ukloniIzRute('a')
  assert.deepEqual(dajRutu(), [])
  assert.equal(dajNaziv(), '')
  assert.equal(dajTuruId(), undefined)
  assert.equal(dajWiki(), undefined)
  assert.deepEqual(sacuvana(), {naziv: '', spomenici: []})
})

test('ruta radi u memoriji kada pregledač zabrani čitanje i upis skladišta', async t => {
  t.mock.method(localStorage, 'getItem', () => { throw new Error('skladište nije dostupno') })
  t.mock.method(localStorage, 'setItem', () => { throw new Error('skladište je puno') })
  const nova = await import('../../utils/ruta.js?bez-skladista')
  assert.deepEqual(nova.dajRutu(), [])
  let promena = 0
  nova.promeneRute.addEventListener('promena', () => promena++)
  nova.dodajURutu('a')
  nova.dodajURutu('b')
  nova.pomeri('b', -1)
  assert.deepEqual(nova.dajRutu(), ['b', 'a'])
  nova.ukloniIzRute('a')
  assert.deepEqual(nova.dajRutu(), ['b'])
  assert.equal(promena, 4)
})

test('učitavanje mešovitih stanica uklanja neispravne i duplikate, uz isti redosled', async () => {
  localStorage.setItem('spomenici-ruta', JSON.stringify({
    spomenici: ['b', null, 'a', 'b', {}, 7, '', '  '], naziv: 42, wiki: {}, turaId: [],
  }))
  const nova = await import('../../utils/ruta.js?mesovite-stanice')
  assert.deepEqual(nova.dajRutu(), ['b', 'a'])
  assert.equal(nova.dajNaziv(), '')
  assert.equal(nova.dajWiki(), undefined)
  assert.equal(nova.dajTuruId(), undefined)
  nova.dodajURutu('c')
  assert.deepEqual(JSON.parse(localStorage.getItem('spomenici-ruta')), {naziv: '', spomenici: ['b', 'a', 'c']})
})

test('prosleđeni i vraćeni nizovi ne menjaju rutu mimo čuvanja i događaja', () => {
  const stanice = ['a', 'b']
  postaviRutu(stanice)
  stanice.push('c')
  dajRutu().splice(0, 1)
  assert.deepEqual(dajRutu(), ['a', 'b'])
  assert.deepEqual(sacuvana().spomenici, ['a', 'b'])

  const naziv = {sh: 'Putovanje', en: 'Journey'}
  izaberiTuru({id: 'tura', naziv, spomenici: stanice})
  naziv.sh = 'Promenjen naziv'
  assert.deepEqual(dajNaziv(), {sh: 'Putovanje', en: 'Journey'})
  assert.throws(() => { dajNaziv().sh = 'Nečuvana izmena' }, TypeError)
  assert.deepEqual(dajNaziv(), sacuvana().naziv)
})

test('dodavanje postojeće ili uklanjanje nepoznate stanice ne menja automatsku turu', () => {
  izaberiTuru({id: 'tura', naziv: 'Putovanje', spomenici: ['a', 'b']})
  const pre = localStorage.getItem('spomenici-ruta')
  dodajURutu('a')
  dodajURutu(null)
  ukloniIzRute('nepostojeca')
  assert.deepEqual(dajRutu(), ['a', 'b'])
  assert.equal(dajTuruId(), 'tura')
  assert.equal(localStorage.getItem('spomenici-ruta'), pre)
})

test('prazna automatska tura zadržava izbor za kasniju promenu praga', async () => {
  izaberiTuru({id: 'tura', naziv: {sh: 'Putovanje', en: 'Journey'}, spomenici: []})
  const nova = await import('../../utils/ruta.js?prazna-automatska')
  assert.deepEqual(nova.dajRutu(), [])
  assert.equal(nova.dajTuruId(), 'tura')
  assert.deepEqual(nova.dajNaziv(), {sh: 'Putovanje', en: 'Journey'})
})
