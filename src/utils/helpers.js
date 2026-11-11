// @ts-check
import {jezik, t} from './jezik.js'

export const naziviStanja = {
  rusevine: t('rusevine'),
  uklonjen: t('uklonjen'),
  ostecen: t('ostecen'),
  zatvoren: t('zatvoren'),
}

const bezLinkova = html => (html || '').replace(/<[^>]*>/g, '')

export const bezbedanLink = link => {
  if (typeof link !== 'string') return ''
  try {
    const url = new URL(link)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch { return '' }
}

/** @param {Pick<import('../data/tipovi').Spomenik, 'naziv' | 'nazivEn'>} spomenik */
export const nazivSpomenika = ({naziv, nazivEn}) => (jezik === 'en' && bezLinkova(nazivEn)) || naziv || ''

export const malaSlika = putanja => putanja.replace('slike/spomenici/', 'slike/male/')

/** @param {import('../data/tipovi').Spomenik} spomenik */
export const autoriSpomenika = ({autor}) => autor ? autor.split(' & ') : []

export const nestao = stanje => stanje === 'uklonjen'

export const ruine = stanje => stanje === 'rusevine'

export function mestoUrl({koordinate: {lat, lng}, googleCid}) {
  if (googleCid) return `https://maps.google.com/?cid=${googleCid}`
  return /android/i.test(navigator.userAgent)
    ? `geo:${lat},${lng}`
    : `https://www.google.com/maps/place/${lat},${lng}`
}

export function navigacijaUrl({lat, lng}) {
  const odrediste = `${lat},${lng}`
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
    ? `https://maps.apple.com/?daddr=${odrediste}`
    : `https://www.google.com/maps/dir/?api=1&destination=${odrediste}`
}

const cirilica = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'dj', е: 'e', ж: 'z', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj',
  м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'c', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c',
  џ: 'dz', ш: 's', ѓ: 'g', ќ: 'k', ѕ: 'dz',
}

export const normalizuj = tekst => tekst
  .toLowerCase()
  .replace(/[а-шѓќѕђјљњћџ]/g, z => cirilica[z] || z)
  .replace(/đ/g, 'dj')
  .normalize('NFD')
  .replace(/\p{M}/gu, '')

const entiteti = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;'}

export const escapeHtml = tekst => String(tekst).replace(/[&<>"']/g, z => entiteti[z])
