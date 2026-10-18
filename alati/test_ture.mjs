import {test} from 'node:test'
import assert from 'node:assert/strict'
import {izaberiStanice, sastaviTure} from '../utils/ture.js'
import {nivoiVaznosti, podrazumevaniPrag, razresiPrag, najmanjiZum, pripadaVrsti} from '../utils/vaznost.js'

const oblast = {drzave: ['Serbia'], granice: [44, 20, 45, 21]}
const spomenik = (id, vrsta = 'spomenik', ostalo = {}) => ({
  id, vrsta, mesto: 'Grad', drzava: 'Serbia', koordinate: {lat: 44.5, lng: 20.5}, ...ostalo,
})
const ids = rows => rows.map(x => x.id)

test('istaknutost podiže svaku vrstu uz zadržavanje filtera vrste', () => {
  for (const vrsta of ['spomenik', 'spomen-groblje', 'muzej', 'statua', 'bista', 'spomen-ploca']) {
    const obican = spomenik('obican', vrsta)
    const istaknut = spomenik('istaknut', vrsta, {istaknut: true})
    assert.deepEqual(ids(izaberiStanice([obican, istaknut], oblast, 'istaknut')), ['istaknut'])
    assert.equal(najmanjiZum(istaknut), 0)
    assert.ok(najmanjiZum(obican) > 0)
    assert.ok(pripadaVrsti(istaknut, vrsta))
    assert.ok(pripadaVrsti(istaknut, 'istaknut'))
    assert.ok(!pripadaVrsti(obican, 'istaknut'))
  }
})

test('broj stanica nije ograničen i novi spomenik automatski ulazi u turu', () => {
  const rows = Array.from({length: 27}, (_, i) => spomenik(`s-${i}`))
  const defs = [{id: 'grad', naziv: {sh: 'Grad u NOB', en: 'City'}, oblast}]
  assert.equal(sastaviTure(defs, rows, 'spomenik')[0].spomenici.length, 27)
  assert.ok(sastaviTure(defs, [...rows, spomenik('novi')], 'spomenik')[0].spomenici.includes('novi'))
})

test('svaka vrsta ima zaseban prag, a podrazumevani uključuje statue bez bista', () => {
  const vrste = ['spomen-ploca', 'bista', 'spomen-obelezje', 'statua', 'spomen-groblje', 'spomenik', 'muzej', 'spomen-park', 'istaknut']
  const rows = vrste.map(v => spomenik(v, v === 'istaknut' ? 'spomenik' : v, {istaknut: v === 'istaknut'}))
  for (const [i, prag] of nivoiVaznosti.entries())
    assert.deepEqual(ids(izaberiStanice(rows, oblast, prag)), nivoiVaznosti.slice(0, i + 1))
  assert.equal(podrazumevaniPrag, 'statua')
  assert.ok(ids(izaberiStanice(rows, oblast, podrazumevaniPrag)).includes('statua'))
  assert.ok(!ids(izaberiStanice(rows, oblast, podrazumevaniPrag)).includes('bista'))
})

test('postojeći sačuvani grupisani izbor se čuva, a nov korisnik dobija statue', () => {
  assert.equal(razresiPrag(null), 'statua')
  assert.equal(razresiPrag('nepoznat'), 'statua')
  assert.equal(razresiPrag('statua'), 'statua')
  for (const [pre, posle] of Object.entries({lokalni: 'spomen-obelezje', kompleks: 'spomen-park', groblje: 'spomen-groblje', ploca: 'spomen-ploca'}))
    assert.equal(razresiPrag(pre), posle)
  for (const [pre, posle] of Object.entries({0: 'istaknut', 8: 'muzej', 9: 'spomen-groblje', 10: 'bista', 11: 'spomen-obelezje', 12: 'spomen-ploca'}))
    assert.equal(razresiPrag(pre), posle)
})

test('oblast isključuje susedne gradove i države, a stanje i fotografija ne menjaju važnost', () => {
  const rows = [spomenik('dobar'), spomenik('dalek', 'spomenik', {istaknut: true, koordinate: {lat: 43, lng: 20.5}}),
    spomenik('druga-drzava', 'spomenik', {istaknut: true, drzava: 'Croatia'}), spomenik('priblizan', 'spomenik', {istaknut: true, priblizno: true}),
    spomenik('uklonjen', 'spomenik', {istaknut: true, stanje: 'uklonjen'}), spomenik('zatvoren', 'muzej', {stanje: 'zatvoren'}),
    spomenik('ostecen', 'spomenik', {stanje: 'ostecen'})]
  assert.deepEqual(new Set(ids(izaberiStanice(rows, oblast, 'spomen-ploca'))), new Set(['dobar', 'ostecen', 'priblizan', 'uklonjen', 'zatvoren']))
})

test('koridor prati i sredinu putanje, a ne samo krajnje tačke ili pravougaonik', () => {
  const koridor = {drzave: ['Serbia'], putanja: [[44, 20], [45, 21]], sirinaKm: 5}
  assert.deepEqual(ids(izaberiStanice([spomenik('sredina'), spomenik('van', 'spomenik', {istaknut: true, koordinate: {lat: 44, lng: 21}})], koridor, 'spomen-ploca')), ['sredina'])
})

test('jednak prioritet daje stabilan izbor, nezavisno od redosleda baze', () => {
  const rows = [spomenik('z'), spomenik('a'), spomenik('m')]
  assert.deepEqual(ids(izaberiStanice(rows, oblast, 'spomenik')), ids(izaberiStanice([...rows].reverse(), oblast, 'spomenik')))
})

test('gradska tura prihvata delove grada, ali ne susedno mesto u istom pravougaoniku', () => {
  const rows = [spomenik('centar'), spomenik('deo', 'spomenik', {mesto: 'Grad (Centar)'}), spomenik('sused', 'spomenik', {istaknut: true, mesto: 'Drugi grad'})]
  assert.deepEqual(ids(izaberiStanice(rows, {...oblast, mesta: ['Grad']}, 'spomen-ploca')), ['centar', 'deo'])
})
