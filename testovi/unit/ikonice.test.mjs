import '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {izgledMarkera, ikonicaSaOznakama, znak, znakVrste, senka, pribliznaOznaka} from '../../utils/ikonice.js'

test('vrsta i stanje biraju sliku markera, a spomenik ostaje obelisk', () => {
  assert.equal(izgledMarkera({vrsta: 'bista'}).slika, 'slike/markeri/bista-postoji.svg')
  assert.equal(izgledMarkera({vrsta: 'bista', stanje: 'srusen'}).slika, 'slike/markeri/bista-rusevina.svg')
  assert.equal(izgledMarkera({vrsta: 'bista', stanje: 'uklonjen'}).slika, 'slike/markeri/bista-uklonjen.svg')
  assert.equal(izgledMarkera({vrsta: 'bista', stanje: 'ostecen'}).slika, 'slike/markeri/bista-postoji.svg')
  assert.deepEqual(izgledMarkera({vrsta: 'spomenik'}), {slika: 'slike/obelisk.png', sirina: 14, visina: 50})
  assert.equal(izgledMarkera({vrsta: 'spomenik', stanje: 'rusevine'}).slika, 'slike/obelisk-rusevina.png')
  assert.equal(izgledMarkera({vrsta: 'groblje'}).slika, 'slike/markeri/groblje-postoji.svg')
  assert.equal(izgledMarkera({vrsta: 'groblje', stanje: 'srusen'}).slika, 'slike/markeri/groblje-rusevina.svg')
  assert.equal(izgledMarkera({vrsta: 'groblje', stanje: 'uklonjen'}).slika, 'slike/markeri/groblje-uklonjen.svg')
})

test('ikonica uključuje senku, a upitnik i značka se dodaju samo kad treba', () => {
  const izgled = {slika: 'x.svg', sirina: 20, visina: 30}
  const obicna = ikonicaSaOznakama(izgled, 1, {})
  assert.match(obicna, new RegExp(`width="${20 + senka.levo + senka.desno}" height="${30 + senka.dole}"`))
  assert.doesNotMatch(obicna, /oznaka-priblizno|znacka-oznake/)
  assert.ok(ikonicaSaOznakama(izgled, 1, {priblizno: true}).includes(pribliznaOznaka))
  assert.match(ikonicaSaOznakama(izgled, 1, {oznaka: 'posetio'}), /class="znacka-oznake" src="slike\/markeri\/posecen\.svg"/)
})

test('znak u legendi ima traženu visinu, a istaknut koristi sliku spomenika', () => {
  assert.match(znak({slika: 'x.svg', sirina: 10, visina: 50}, 25), /height="30"/)
  assert.match(znakVrste('istaknut'), /slike\/obelisk\.png/)
  assert.match(znakVrste('muzej'), /slike\/markeri\/muzej-postoji\.svg/)
})
