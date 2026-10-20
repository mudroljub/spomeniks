// @ts-check
// Redosled vrsta odredjuje vaznost; vrste mogu postati vidljive na istom zumu mape.
export const zumVrste = {'spomen-park': 8, muzej: 8, spomenik: 9, 'spomen-groblje': 10, statua: 9, bista: 10, 'spomen-obelezje': 11, 'spomen-grob': 12, 'spomen-ploca': 12}
export const vrstePoVaznosti = /** @type {import('../data/tipovi').Vrsta[]} */ (Object.keys(zumVrste))
/** @type {(import('../data/tipovi').Vrsta | 'istaknut')[]} */
export const nivoiVaznosti = ['istaknut', ...vrstePoVaznosti]
export const vaznostVrste = Object.fromEntries(nivoiVaznosti.map((vrsta, i) => [vrsta, i]))
/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'istaknut'>} spomenik */
export const vaznostSpomenika = spomenik => vaznostVrste[spomenik.istaknut ? 'istaknut' : spomenik.vrsta]
/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'istaknut'>} spomenik */
export const najmanjiZum = spomenik => spomenik.istaknut ? 0 : zumVrste[spomenik.vrsta]
/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'istaknut'>} spomenik */
export const pripadaVrsti = (spomenik, izbor) => izbor === 'istaknut' ? spomenik.istaknut === true : spomenik.vrsta === izbor
export const podrazumevaniPrag = 'statua'

// Stari izbor je bio broj zuma: sacuvaj ukljucenost cele tada izabrane grupe.
export const razresiPrag = vrednost => {
  const stariNazivi = {lokalni: 'spomen-obelezje', kompleks: 'spomen-park', groblje: 'spomen-groblje', ploca: 'spomen-ploca'}
  const stariZumovi = {0: 'istaknut', 8: 'muzej', 9: 'statua', 10: 'bista', 11: 'spomen-obelezje', 12: 'spomen-ploca'}
  if (Object.hasOwn(stariNazivi, vrednost)) return stariNazivi[vrednost]
  if (nivoiVaznosti.includes(vrednost)) return vrednost
  if (vrednost == null || vrednost === '') return podrazumevaniPrag
  return stariZumovi[Number(vrednost)] ?? podrazumevaniPrag
}
