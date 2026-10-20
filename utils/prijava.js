// @ts-check
import {t} from './jezik.js'

// Adresa se sastavlja na zahtev; nema je u HTML-u ni u stalnim mailto linkovima.
export const mejl = () => String.fromCharCode(
  109, 117, 100, 114, 111, 108, 106, 117, 98, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109,
)

/** @param {import('../data/tipovi').Spomenik} [spomenik] */
export const prijavaUrl = spomenik => {
  const naziv = spomenik?.naziv?.sh || spomenik?.mesto || ''
  const lokacija = spomenik
    ? `https://www.google.com/maps?q=${spomenik.koordinate.lat},${spomenik.koordinate.lng}`
    : ''
  const poruka = `${t('prijavaNaziv')}: ${naziv}\r\n${t('prijavaLokacija')}: ${lokacija}\r\n\r\n${t('prijavaOpciono')}\r\n`
  const naslov = spomenik ? `${t('prijavaDopuna')}: ${naziv}` : t('prijavaNaslov')
  return `mailto:${mejl()}?subject=${encodeURIComponent(naslov)}&body=${encodeURIComponent(poruka)}`
}
