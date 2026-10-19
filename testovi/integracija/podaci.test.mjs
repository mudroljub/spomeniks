// Stvarni podaci iz data/ zajedno sa kodom aplikacije: ono što bi pri učitavanju ostalo prazno ili neispravno.
import '../okruzenje.mjs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {existsSync, readFileSync} from 'node:fs'
import {jeClanak, clanakSpomenika} from '../../utils/clanci.js'
import {sastaviTure} from '../../utils/ture.js'
import {zumVrste, podrazumevaniPrag} from '../../utils/vaznost.js'
import {izgledMarkera} from '../../utils/ikonice.js'
import {naziviStanja} from '../../utils/helpers.js'
import {nazivDrzave} from '../../utils/jezik.js'
import {ucitajBazu} from '../../alati/baza.mjs'

const koren = new URL('../../', import.meta.url)
const procitaj = fajl => JSON.parse(readFileSync(new URL(fajl, koren), 'utf8'))
const baza = ucitajBazu()
const bezLokacije = procitaj('data/bez_lokacije.json')

test('svi izabrani linkovi prolaze proveru, a Topovske šupe imaju članak iz novina', () => {
  for (const s of baza) {
    for (const polje of ['wiki', 'wikiEn', 'clanak'])
      if (s[polje]) assert.ok(jeClanak(s[polje]), `${s.id}: ${s[polje]}`)
    if (!s.wiki && !s.wikiEn && !s.clanak) assert.equal(clanakSpomenika(s), undefined)
  }
  const topovske = baza.find(s => s.id === 'beograd-spomen-park-topovske-supe')
  assert.equal(clanakSpomenika(topovske), 'https://www.danubeogradu.rs/2021/01/kultura-secanja-info-tabla-o-logoru-topovske-supe/')
  assert.match(procitaj('data/izvori.json')[topovske.id], /openstreetmap/)
  const biografija = baza.find(s => s.id === 'boris-kidric-square')
  assert.equal(clanakSpomenika(biografija), undefined)
})

test('svaka tura ima stanice pri podrazumevanom pragu, a njen članak je pravi članak', () => {
  const definicije = procitaj('data/ture.json')
  const ture = sastaviTure(definicije, baza, podrazumevaniPrag)
  assert.equal(ture.length, definicije.length)
  for (const tura of ture) {
    assert.ok(tura.spomenici.length > 0, `${tura.id}: tura bez stanica`)
    if (tura.wiki) assert.ok(jeClanak(tura.wiki), `${tura.id}: ${tura.wiki}`)
  }
})

test('svaka vrsta i stanje iz podataka imaju sliku markera, zum i naziv', () => {
  const kombinacije = new Set(baza.map(s => `${s.vrsta}|${s.stanje ?? ''}`))
  for (const kombinacija of kombinacije) {
    const [vrsta, stanje] = kombinacija.split('|')
    assert.ok(vrsta in zumVrste, `vrsta bez zuma: ${vrsta}`)
    if (stanje) assert.ok(naziviStanja[stanje], `stanje bez naziva: ${stanje}`)
    const {slika} = izgledMarkera({vrsta, stanje: stanje || undefined})
    assert.ok(existsSync(new URL(slika, koren)), `nema slike markera: ${slika}`)
  }
})

test('svaka država iz oba spiska ima domaći naziv', () => {
  for (const drzava of new Set([...baza, ...bezLokacije].map(s => s.drzava)))
    assert.ok(drzava === 'Kosovo' || nazivDrzave(drzava) !== drzava, `država bez prevoda: ${drzava}`)
})
