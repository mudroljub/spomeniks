// @ts-check
export const vaznostVrste = {
  istaknut: 1,
  'spomen-park': 2,
  muzej: 3,
  spomenik: 4,
  'spomen-groblje': 5,
  statua: 6,
  bista: 7,
  reljef: 8,
  'spomen-kuca': 9,
  'spomen-obelezje': 10,
  'spomen-cesma': 11,
  groblje: 12,
  'spomen-ploca': 13,
}

export const zumPoVaznosti = {1: 0, 2: 8, 3: 8, 4: 9, 5: 9, 6: 9, 7: 10, 8: 11, 9: 11, 10: 11, 11: 11, 12: 12, 13: 12}
const poslednjiNivoZuma = Math.max(...Object.keys(zumPoVaznosti).map(Number))
/** @param {number} vaznost */
const zumVaznosti = vaznost => zumPoVaznosti[Math.min(vaznost, poslednjiNivoZuma)]
export const nivoiVaznosti = /** @type {(import('../data/tipovi').Vrsta | 'istaknut')[]} */ (Object.keys(vaznostVrste).sort((a, b) => vaznostVrste[a] - vaznostVrste[b]))
export const vrstePoVaznosti = /** @type {import('../data/tipovi').Vrsta[]} */ (nivoiVaznosti.filter(vrsta => vrsta !== 'istaknut'))
export const zumVrste = Object.fromEntries(vrstePoVaznosti.map(vrsta => [vrsta, zumVaznosti(vaznostVrste[vrsta])]))
const najnizaVaznost = Math.max(...Object.values(vaznostVrste))
/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'istaknut'>} spomenik */
export const vaznostSpomenika = spomenik => vaznostVrste[spomenik.istaknut ? 'istaknut' : spomenik.vrsta]
/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'istaknut' | 'priblizno'>} spomenik */
export const slojSpomenika = spomenik => spomenik.priblizno ? -10000 : (najnizaVaznost - vaznostSpomenika(spomenik)) * 1000
/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'istaknut'>} spomenik */
export const najmanjiZum = spomenik => zumVaznosti(vaznostSpomenika(spomenik))
/** @param {Pick<import('../data/tipovi').Spomenik, 'vrsta' | 'istaknut'>} spomenik */
export const pripadaVrsti = (spomenik, izbor) => izbor === 'istaknut' ? spomenik.istaknut === true : spomenik.vrsta === izbor
export const podrazumevaniPrag = 'statua'

export const razresiPrag = vrednost => {
  const stariNazivi = {lokalni: 'spomen-obelezje', kompleks: 'spomen-park', 'spomen-grob': 'groblje', ploca: 'spomen-ploca'}
  const stariZumovi = {0: 'istaknut', 8: 'muzej', 9: 'statua', 10: 'bista', 11: 'spomen-obelezje', 12: 'spomen-ploca'}
  if (Object.hasOwn(stariNazivi, vrednost)) return stariNazivi[vrednost]
  if (nivoiVaznosti.includes(vrednost)) return vrednost
  if (vrednost == null || vrednost === '') return podrazumevaniPrag
  return stariZumovi[Number(vrednost)] ?? podrazumevaniPrag
}
