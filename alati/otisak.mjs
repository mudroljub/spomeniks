// node alati/otisak.mjs [--proveri]: otisak svih unapred sacuvanih resursa i samog workera.
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath, pathToFileURL} from 'node:url'
import vm from 'node:vm'

export const proveriOtisak = (koren = new URL('../', import.meta.url)) => {
  const putanja = new URL('sw.js', koren)
  const kod = readFileSync(putanja, 'utf8').replace(/\r\n/g, '\n')
  const okruzenje = {self: {addEventListener() {}}}
  vm.runInNewContext(kod + '\nglobalThis.resursi = fajlovi; globalThis.verzija = VERZIJA', okruzenje)
  const hash = createHash('sha256').update(kod.replace(/const VERZIJA = '[^']*'/u, "const VERZIJA = ''"))
  const fajlovi = [...new Set(okruzenje.resursi.map(p => p === './' ? 'index.html' : p))].sort()
  for (const ime of fajlovi) {
    const podaci = readFileSync(new URL(ime, koren))
    hash.update(ime + '\0').update(/\.(html|js|json|css|svg)$/u.test(ime) ? podaci.toString('utf8').replace(/\r\n/g, '\n') : podaci)
  }
  const ocekivana = hash.digest('hex').slice(0, 20)
  return {ispravno: okruzenje.verzija === ocekivana, ocekivana, putanja, kod}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {ispravno, ocekivana, putanja, kod} = proveriOtisak()
  if (process.argv.includes('--proveri')) {
    if (!ispravno) {
      console.error('Otisak resursa nije osvežen. Pokreni: npm run otisak')
      process.exitCode = 1
    }
  } else if (!ispravno) {
    writeFileSync(fileURLToPath(putanja), kod.replace(/const VERZIJA = '[^']*'/u, `const VERZIJA = '${ocekivana}'`).replace(/\n/g, '\r\n'))
    console.log(`Otisak resursa: ${ocekivana}`)
  }
}
