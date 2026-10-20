// @ts-check
export const ucitajIzSkladista = kljuc => {
  try { return localStorage.getItem(kljuc) } catch { return null }
}

export const sacuvajUSkladiste = (kljuc, vrednost) => {
  try {
    localStorage.setItem(kljuc, vrednost)
    return true
  } catch { return false }
}
