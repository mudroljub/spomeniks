import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname, join, relative} from 'node:path'
import {fileURLToPath} from 'node:url'

const koren = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const procitaj = putanja => readFileSync(join(koren, putanja), 'utf8')

// svi moduli do kojih main.js stize uvozima, putanje od korena
const moduli = (pocetni = 'main.js', nadjeni = new Set()) => {
  if (nadjeni.has(pocetni)) return nadjeni
  nadjeni.add(pocetni)
  for (const [, uvoz] of procitaj(pocetni).matchAll(/^import\s+(?:[^'"]*?\s+from\s+)?['"](\.[^'"]+)['"]/gm))
    moduli(relative(koren, join(koren, dirname(pocetni), uvoz)).replaceAll('\\', '/'), nadjeni)
  return nadjeni
}

// modul van spiska pregledac nalazi tek kad procita onaj koji ga uvozi, pa kasni pokretanje aplikacije
test('svaki modul aplikacije se preuzima unapred i cuva za rad bez signala', () => {
  const html = procitaj('index.html')
  const sw = procitaj('sw.js')
  for (const modul of moduli()) {
    assert.ok(html.includes(`<link rel="modulepreload" href="${modul}">`), `index.html ne preuzima unapred ${modul}`)
    assert.ok(sw.includes(`'${modul}'`), `sw.js ne cuva ${modul}`)
  }
})
