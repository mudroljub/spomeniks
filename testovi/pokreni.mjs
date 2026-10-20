// node testovi/pokreni.mjs [unit|integracija|e2e|sve] (iz korena repozitorijuma)
// bez argumenta: unit i integracija, za par sekundi; e2e pokreće Chrome bez prozora i traje oko pola minuta
import {spawnSync} from 'node:child_process'
import {readdirSync} from 'node:fs'

const grupe = {unit: 'testovi/unit', integracija: 'testovi/integracija', e2e: 'testovi/e2e'}
const izbor = process.argv[2] ?? 'brzo'
const izabrane = {brzo: ['unit', 'integracija'], sve: Object.keys(grupe)}[izbor] ?? [izbor]
const nepoznate = izabrane.filter(g => !grupe[g])
if (nepoznate.length) {
  console.error(`nepoznata grupa: ${nepoznate.join(', ')}; moguće: ${Object.keys(grupe).join(', ')}, sve`)
  process.exit(2)
}

const pokreni = (komanda, argumenti) => spawnSync(komanda, argumenti, {stdio: 'inherit', shell: false}).status === 0

let uspeh = true
for (const grupa of izabrane) {
  const folder = grupe[grupa]
  const fajlovi = readdirSync(folder)
  console.log(`\n== ${grupa}`)
  // svaki e2e fajl pokrece svoj Chrome; istovremeno se otimaju o procesor i testovi sa rokom isticu
  const redom = grupa === 'e2e' ? ['--test-concurrency=1'] : []
  if (fajlovi.some(f => f.endsWith('.test.mjs'))) uspeh = pokreni(process.execPath, ['--test', ...redom, `${folder}/*.test.mjs`]) && uspeh
  if (fajlovi.some(f => /^test_.*\.py$/.test(f)))
    uspeh = pokreni('python', ['-I', '-B', '-m', 'unittest', 'discover', '-s', folder, '-p', 'test_*.py']) && uspeh
}
process.exit(uspeh ? 0 : 1)
