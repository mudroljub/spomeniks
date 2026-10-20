import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname, join, relative} from 'node:path'
import {fileURLToPath} from 'node:url'

const koren = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const procitaj = putanja => readFileSync(join(koren, putanja), 'utf8')

const staticki = /^import\s+(?:[^'"]*?\s+from\s+)?['"](\.[^'"]+)['"]/gm
const odlozeni = /\bimport\(['"](\.[^'"]+\.js)['"]\)/g // bez tipova iz JSDoc-a

// moduli do kojih main.js stize uvozima, putanje od korena; sa odlozenima i oni koji se uvoze tek posle prvog crtanja
const moduli = (odlozeno = false, pocetni = 'main.js', nadjeni = new Set()) => {
  if (nadjeni.has(pocetni)) return nadjeni
  nadjeni.add(pocetni)
  const kod = procitaj(pocetni)
  const uvozi = [...kod.matchAll(staticki), ...odlozeno ? kod.matchAll(odlozeni) : []]
  for (const [, uvoz] of uvozi) moduli(odlozeno, relative(koren, join(koren, dirname(pocetni), uvoz)).replaceAll('\\', '/'), nadjeni)
  return nadjeni
}

// modul van spiska pregledac nalazi tek kad procita onaj koji ga uvozi, pa kasni pokretanje aplikacije;
// odlozeni se ne preuzimaju unapred, da na losoj vezi ne usporavaju prvo crtanje
test('moduli za prvo crtanje se preuzimaju unapred, odlozeni ne, a svi se cuvaju za rad bez signala', () => {
  const html = procitaj('index.html')
  const sw = procitaj('sw.js')
  const potrebni = moduli()
  const svi = moduli(true)
  for (const modul of svi) {
    assert.equal(html.includes(`<link rel="modulepreload" href="${modul}">`), potrebni.has(modul), `preuzimanje unapred: ${modul}`)
    assert.ok(sw.includes(`'${modul}'`), `sw.js ne cuva ${modul}`)
  }
  assert.ok(!potrebni.has('komponente/Detalji.js') && svi.has('komponente/Detalji.js'))
})
