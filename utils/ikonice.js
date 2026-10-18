// @ts-check
import {nestao, ruine} from './helpers.js'

// senka je ucrtana u slike markera, jer css senka na stotinama markera koci telefon pri pomeranju mape;
// zato je slika veca od znaka za mesto senke levo, desno i dole, u pikselima pri punoj velicini (velicine su bez senke)
export const senka = {levo: 2, desno: 8, dole: 10}

export const pribliznaOznaka = 'slike/markeri/priblizno.svg'

// I mapa i legenda koriste istu ikonicu sa upitnikom ispod podnozja.
export const pribliznaIkonica = ({slika, sirina, visina}, razmera) => {
  const px = vrednost => Math.round(vrednost * razmera)
  return `<img src="${slika}" width="${px(sirina + senka.levo + senka.desno)}" height="${px(visina + senka.dole)}" alt="" style="display: block"><img class="oznaka-priblizno" src="${pribliznaOznaka}" width="8" height="12" alt="" style="position: absolute; left: ${px(senka.levo + sirina / 2) - 4}px; top: ${px(visina) + 2}px">`
}

const velicine = {kompleks: [34, 50], groblje: [29, 32], lokalni: [20, 28], muzej: [34, 38], ploca: [22, 16], bista: [22, 35], statua: [24, 48]}

/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'stanje'>} spomenik */
export const izgledMarkera = ({vrsta, stanje}) => {
  const varijanta = nestao(stanje) ? 'uklonjen' : ruine(stanje) ? 'rusevina' : 'postoji'
  const velicina = velicine[vrsta]
  return velicina
    ? {slika: `slike/markeri/${vrsta}-${varijanta}.svg`, sirina: velicina[0], visina: velicina[1]}
    : {slika: `slike/obelisk${varijanta === 'postoji' ? '' : '-' + varijanta}.png`, sirina: 14, visina: 50}
}
