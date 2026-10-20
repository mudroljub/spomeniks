import {postaviNavigator} from '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizuj, escapeHtml, nazivSpomenika, malaSlika, autoriSpomenika, nestao, ruine, mestoUrl, navigacijaUrl, bezbedanLink,
} from '../../utils/helpers.js'

test('linkovi prihvataju samo apsolutne HTTP i HTTPS adrese', () => {
  assert.equal(bezbedanLink('https://example.com/autor'), 'https://example.com/autor')
  for (const link of ['javascript:alert(1)', 'data:text/html,tekst', '/relativno', '', undefined])
    assert.equal(bezbedanLink(link), '')
})

test('pretraga ne razlikuje pismo, velika slova ni dijakritiku', () => {
  for (const oblik of ['Kadinjača', 'KADINJACA', 'Кадињача', 'kadinjaca']) assert.equal(normalizuj(oblik), 'kadinjaca')
  assert.equal(normalizuj('Đurđevac'), normalizuj('Ђурђевац'))
  assert.equal(normalizuj('Đurđevac'), 'djurdjevac')
  assert.equal(normalizuj('Ѓавато'), 'gavato')
})

test('HTML znaci se bezbedno prikazuju kao tekst', () => {
  assert.equal(escapeHtml('<a href="x">Ime & \'ime\'</a>'), '&lt;a href=&quot;x&quot;&gt;Ime &amp; &#39;ime&#39;&lt;/a&gt;')
  assert.equal(escapeHtml(1941), '1941')
})

test('na domaćem jeziku je uvek domaći naziv, i kad postoji engleski prevod', () => {
  assert.equal(nazivSpomenika({naziv: 'Kameni cvijet', nazivEn: 'Stone Flower'}), 'Kameni cvijet')
  assert.equal(nazivSpomenika({naziv: ''}), '')
})

test('mala slika je u zasebnoj fascikli, a autori su razdvojeni znakom &', () => {
  assert.equal(malaSlika('slike/spomenici/kozara.webp'), 'slike/male/kozara.webp')
  assert.deepEqual(autoriSpomenika({autor: 'Vojin Bakić & Josip Sajsl'}), ['Vojin Bakić', 'Josip Sajsl'])
  assert.deepEqual(autoriSpomenika({}), [])
})

test('uklonjen spomenik je nestao, a srušen se vodi kao ruševine', () => {
  assert.ok(nestao('uklonjen'))
  assert.ok(!nestao('srusen'))
  assert.ok(ruine('srusen') && ruine('rusevine'))
  assert.ok(!ruine('ostecen') && !ruine(undefined))
})

test('mesto otvara Google mesto kad postoji, inače tačku prema uređaju', () => {
  const koordinate = {lat: 44.1, lng: 20.2}
  assert.equal(mestoUrl({koordinate, googleCid: '123'}), 'https://maps.google.com/?cid=123')
  assert.equal(mestoUrl({koordinate}), 'https://www.google.com/maps/place/44.1,20.2')
  postaviNavigator({userAgent: 'Mozilla/5.0 (Linux; Android 14)'})
  assert.equal(mestoUrl({koordinate}), 'geo:44.1,20.2')
  postaviNavigator()
})

test('navigacija vodi u Apple mape na iPhone-u, a drugde u Google mape', () => {
  const tacka = {lat: 44.1, lng: 20.2}
  assert.equal(navigacijaUrl(tacka), 'https://www.google.com/maps/dir/?api=1&destination=44.1,20.2')
  postaviNavigator({userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)'})
  assert.equal(navigacijaUrl(tacka), 'https://maps.apple.com/?daddr=44.1,20.2')
  postaviNavigator()
})
