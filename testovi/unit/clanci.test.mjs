import {test} from 'node:test'
import assert from 'node:assert/strict'
import {jeClanak, clanakSpomenika} from '../../utils/clanci.js'

test('izvor podataka nikada nije rezervni članak', () => {
  for (const izvor of ['https://www.openstreetmap.org/way/683348683', 'https://example.com/clanak-o-spomeniku'])
    assert.equal(clanakSpomenika({izvor}), undefined)
})

test('mapa, fotografija, registar, knjiga i wiki spisak ne mogu postati Više', () => {
  for (const link of [
    'https://www.openstreetmap.org/way/683348683', 'https://maps.google.com/maps?q=1,2',
    'https://maps.app.goo.gl/abc', 'https://commons.wikimedia.org/wiki/File:Monument.jpg',
    'https://sr.wikipedia.org/wiki/Датотека:Monument.jpg',
    'https://sr.wikipedia.org/wiki/Списак_споменика_НОБ_у_Србији',
    'https://hr.wikipedia.org/wiki/Dodatak:Popis_spomenika',
    'https://registar.kulturnadobra.hr/api/kulturno-dobro/detail/Z-1',
    'https://znaci.org/00003/667.pdf#page=40', 'https://example.com/slika.webp',
    'https://www.facebook.com/spomenicinobucrnojgori/', 'javascript:alert(1)',
  ]) {
    assert.equal(jeClanak(link), false, link)
    assert.equal(clanakSpomenika({wiki: link, clanak: link}), undefined)
  }
})

test('članak zadržava jezički prioritet bez zavisnosti od izvora', () => {
  const s = {wiki: 'https://sh.wikipedia.org/wiki/Galebova_krila',
    wikiEn: 'https://en.wikipedia.org/wiki/Wings_of_a_Seagull',
    clanak: 'https://example.com/galebova-krila', izvor: 'https://www.openstreetmap.org/node/1'}
  assert.equal(clanakSpomenika(s), s.wiki)
  assert.equal(clanakSpomenika(s, 'en'), s.wikiEn)
  assert.equal(clanakSpomenika({clanak: s.clanak}), s.clanak)
})
