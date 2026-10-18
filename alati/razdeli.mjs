// node alati/razdeli.mjs [--provera]  (iz korena repozitorijuma)
// iz data/spomeniks.json pravi dva fajla koje učitava aplikacija: mapa-prvo.json sa spomenicima vidljivim na početnim
// zumovima (do 9, tačna lokacija), da se prvi obelisci nacrtaju odmah, i mapa-ostalo.json sa svim ostalima, koji stiže posle;
// polje izvor aplikacija ne koristi, pa ga nema; sa --provera samo javlja da li su fajlovi zastareli (izlazni status 1)
import {readFileSync, writeFileSync, existsSync} from 'node:fs'
import {najmanjiZum} from '../utils/vaznost.js'

const zumPrvog = 9
const spomenici = JSON.parse(readFileSync('data/spomeniks.json', 'utf8'))
const zaAplikaciju = ({izvor, ...spomenik}) => spomenik
const prvo = spomenici.filter(s => !s.priblizno && najmanjiZum(s) <= zumPrvog)
const ostalo = spomenici.filter(s => !prvo.includes(s))
const fajlovi = {'data/mapa-prvo.json': prvo, 'data/mapa-ostalo.json': ostalo}

let zastarelo = false
for (const [putanja, spisak] of Object.entries(fajlovi)) {
  const sadrzaj = JSON.stringify(spisak.map(zaAplikaciju))
  if (process.argv.includes('--provera')) {
    if (!existsSync(putanja) || readFileSync(putanja, 'utf8') !== sadrzaj) {
      console.log(`zastarelo: ${putanja} (pokreni node alati/razdeli.mjs)`)
      zastarelo = true
    }
  } else {
    writeFileSync(putanja, sadrzaj)
    console.log(putanja, spisak.length)
  }
}
process.exit(zastarelo ? 1 : 0)
