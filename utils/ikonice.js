// @ts-check
import {nestao, ruine} from './helpers.js'

export const navigacijaIkonica = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2.6 21.4 12 12 21.4 2.6 12Z" stroke-linejoin="round"/><path d="M9.6 14.6v-2.8c0-.8.6-1.4 1.4-1.4h4.4M13.2 8.2l2.2 2.2-2.2 2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// senka je ucrtana u slike markera, jer css senka na stotinama markera koci telefon pri pomeranju mape;
// zato je slika veca od znaka za mesto senke levo, desno i dole, u pikselima pri punoj velicini (velicine su bez senke)
export const senka = {levo: 2, desno: 8, dole: 10}

export const pribliznaOznaka = 'slike/markeri/priblizno.svg'

// I mapa i legenda koriste istu ikonicu sa upitnikom preko sredine.
export const pribliznaIkonica = ({slika, sirina, visina}, razmera) => {
  const px = vrednost => Math.round(vrednost * razmera)
  return `<img src="${slika}" width="${px(sirina + senka.levo + senka.desno)}" height="${px(visina + senka.dole)}" alt="" style="display: block"><img class="oznaka-priblizno" src="${pribliznaOznaka}" width="8" height="12" alt="" style="position: absolute; left: ${Math.max(0, px(senka.levo + sirina / 2) - 4)}px; top: ${Math.max(0, px(visina / 2) - 3)}px">`
}

const velicine = {'spomen-park': [34, 50], 'spomen-groblje': [29, 32], 'spomen-obelezje': [20, 28], muzej: [34, 38], 'spomen-ploca': [22, 16], bista: [22, 35], statua: [24, 48]}

/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'stanje'>} spomenik */
export const izgledMarkera = ({vrsta, stanje}) => {
  const varijanta = nestao(stanje) ? 'uklonjen' : ruine(stanje) ? 'rusevina' : 'postoji'
  const velicina = velicine[vrsta]
  return velicina
    ? {slika: `slike/markeri/${vrsta}-${varijanta}.svg`, sirina: velicina[0], visina: velicina[1]}
    : {slika: `slike/obelisk${varijanta === 'postoji' ? '' : '-' + varijanta}.png`, sirina: 14, visina: 50}
}
