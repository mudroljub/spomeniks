// @ts-check
// Redosled vrsta odredjuje vaznost; vrste mogu postati vidljive na istom zumu mape.
export const zumVrste = {istaknut: 0, kompleks: 8, muzej: 8, spomenik: 9, groblje: 9, statua: 10, bista: 10, lokalni: 11, ploca: 12}
export const vrstePoVaznosti = Object.keys(zumVrste)
export const vaznostVrste = Object.fromEntries(vrstePoVaznosti.map((vrsta, i) => [vrsta, i]))
export const podrazumevaniPrag = 'statua'

// Stari izbor je bio broj zuma: sacuvaj ukljucenost cele tada izabrane grupe.
export const razresiPrag = vrednost => {
  if (vrstePoVaznosti.includes(vrednost)) return vrednost
  if (vrednost == null || vrednost === '') return podrazumevaniPrag
  return vrstePoVaznosti.filter(vrsta => zumVrste[vrsta] === Number(vrednost)).at(-1) ?? podrazumevaniPrag
}
