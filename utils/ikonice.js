// @ts-check
import {nestao, ruine} from './helpers.js'

export const navigacijaIkonica = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2.6 21.4 12 12 21.4 2.6 12Z" stroke-linejoin="round"/><path d="M9.6 14.6v-2.8c0-.8.6-1.4 1.4-1.4h4.4M13.2 8.2l2.2 2.2-2.2 2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// senka je ucrtana u slike markera, jer css senka na stotinama markera koci telefon pri pomeranju mape;
// zato je slika veca od znaka za mesto senke levo, desno i dole, u pikselima pri punoj velicini (velicine su bez senke)
export const senka = {levo: 2, desno: 8, dole: 10}

export const pribliznaOznaka = 'slike/markeri/priblizno.svg'
// zvezda popunjava manje od kruga, pa je veca, da se vidi kao kvacica
const znackeOznaka = {lista: {slika: 'slike/markeri/lista.svg', velicina: 1.6}, posetio: {slika: 'slike/markeri/posecen.svg', velicina: 1}}

// mapa, legenda i filteri koriste istu ikonicu: upitnik preko sredine za priblizne, a na dnu znacka oznake,
// zuta zvezda za zeljene i zelena kvacica za posecene, jer je poseta uspeh koji treba da se vidi
const velicinaZnacke = razmera => Math.max(10, Math.round(14 * razmera))

// slika markera sa senkom, u pikselima
export const velicinaSlike = ({sirina, visina}, razmera) =>
  [Math.round((sirina + senka.levo + senka.desno) * razmera), Math.round((visina + senka.dole) * razmera)]

const slikaZnaka = (izgled, razmera, stil) => {
  const [sirina, visina] = velicinaSlike(izgled, razmera)
  return `<img src="${izgled.slika}" width="${sirina}" height="${visina}" alt="" style="${stil}">`
}

export const ikonicaSaOznakama = ({slika, sirina, visina}, razmera, {priblizno = false, oznaka = null}) => {
  const px = vrednost => Math.round(vrednost * razmera)
  const osnova = velicinaZnacke(razmera)
  const znacka = oznaka && Math.round(osnova * znackeOznaka[oznaka].velicina)
  return slikaZnaka({slika, sirina, visina}, razmera, 'display: block')
    + (priblizno ? `<img class="oznaka-priblizno" src="${pribliznaOznaka}" width="8" height="12" alt="" style="position: absolute; left: ${Math.max(0, px(senka.levo + sirina / 2) - 4)}px; top: ${Math.max(0, px(visina / 2) - 3)}px">` : '')
    + (oznaka ? `<img class="znacka-oznake" src="${znackeOznaka[oznaka].slika}" width="${znacka}" height="${znacka}" alt="" style="position: absolute; left: ${px(senka.levo + sirina / 2) - Math.round(znacka / 2)}px; top: ${Math.max(0, px(visina) - Math.round(osnova * 0.75 + znacka / 2))}px">` : '')
}

// znak sa mape u legendi i filterima; senka iz slike ne zauzima mesto, da znakovi ostanu poravnati
export const znak = ({slika, sirina, visina}, visinaZnaka, {priblizno = false, oznaka = null} = {}) => {
  const razmera = visinaZnaka / visina
  const px = vrednost => Math.round(vrednost * razmera)
  const margine = `margin: 0 -${px(senka.desno)}px -${px(senka.dole)}px -${px(senka.levo)}px`
  return priblizno || oznaka
    ? `<span style="position: relative; ${margine}">${ikonicaSaOznakama({slika, sirina, visina}, razmera, {priblizno, oznaka})}</span>`
    : slikaZnaka({slika, sirina, visina}, razmera, margine)
}

// istaknuti i obican spomenik razlikuju se samo velicinom znaka, a bista je malo manja od spomenika, kao na mapi;
// muzej i ploca su siroki, pa bi na visini ostalih znakova izgledali preveliki
const visineVrsta = {istaknut: 44, statua: 33, bista: 28, 'spomen-kuca': 25, 'spomen-obelezje': 24, 'spomen-groblje': 29, muzej: 26, groblje: 23, 'spomen-ploca': 17}
export const visinaObeliska = 34

/** @param {import('../data/tipovi').Vrsta | 'istaknut'} vrsta */
export const znakVrste = (vrsta, razmera = 1) =>
  znak(izgledMarkera({vrsta: vrsta === 'istaknut' ? 'spomenik' : vrsta}), Math.round((visineVrsta[vrsta] || visinaObeliska) * razmera))

const velicine = {'spomen-park': [34, 50], 'spomen-groblje': [29, 32], 'spomen-kuca': [34, 38], 'spomen-obelezje': [20, 28], muzej: [34, 38], groblje: [20, 28], 'spomen-ploca': [22, 16], bista: [22, 35], statua: [24, 48]}

/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'stanje'>} spomenik */
export const izgledMarkera = ({vrsta, stanje}) => {
  const varijanta = nestao(stanje) ? 'uklonjen' : ruine(stanje) ? 'rusevina' : 'postoji'
  const velicina = velicine[vrsta]
  return velicina
    ? {slika: `slike/markeri/${vrsta}-${varijanta}.svg`, sirina: velicina[0], visina: velicina[1]}
    : {slika: `slike/obelisk${varijanta === 'postoji' ? '' : '-' + varijanta}.png`, sirina: 14, visina: 50}
}
