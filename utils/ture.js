// @ts-check
import {vaznostVrste} from './vaznost.js'

const kmPoStepenu = 111.195

// Oblast putovanja prati koridor, a gradska tura ima granice grada.
const rastojanjeOdDeonice = ([lat, lng], a, b) => {
  const x = kmPoStepenu * Math.cos((a[0] + b[0]) / 2 * Math.PI / 180)
  const dx = (b[1] - a[1]) * x, dy = (b[0] - a[0]) * kmPoStepenu
  const px = (lng - a[1]) * x, py = (lat - a[0]) * kmPoStepenu
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(px - t * dx, py - t * dy)
}

/** @param {import('../data/tipovi').OblastTure} oblast */
const proveriOblast = oblast => {
  const drzave = new Set(oblast.drzave)
  const mesta = oblast.mesta && new Set(oblast.mesta.map(m => m.toLowerCase()))
  const {putanja, sirinaKm = 0} = oblast
  const lat = putanja?.map(p => p[0]), lng = putanja?.map(p => p[1])
  const granice = oblast.granice ?? (putanja && [
    Math.min(...lat) - sirinaKm / kmPoStepenu, Math.min(...lng) - sirinaKm / 75,
    Math.max(...lat) + sirinaKm / kmPoStepenu, Math.max(...lng) + sirinaKm / 75,
  ])
  return s => {
    if (!drzave.has(s.drzava)) return false
    if (mesta && !mesta.has(s.mesto.split(/\s*\(/)[0].trim().toLowerCase())) return false
    const {lat, lng} = s.koordinate
    if (granice && (lat < granice[0] || lng < granice[1] || lat > granice[2] || lng > granice[3])) return false
    return !putanja || putanja.slice(1).some((b, i) => rastojanjeOdDeonice([lat, lng], putanja[i], b) <= sirinaKm)
  }
}

/**
 * @param {import('../data/tipovi').Spomenik[]} spomenici
 * @param {import('../data/tipovi').OblastTure} oblast
 * @param {string} prag najniza ukljucena vrsta spomenika
 */
export const izaberiStanice = (spomenici, oblast, prag) => {
  const uOblasti = proveriOblast(oblast)
  return spomenici
    .filter(s => vaznostVrste[s.vrsta] <= vaznostVrste[prag] && uOblasti(s))
    .sort((a, b) => vaznostVrste[a.vrsta] - vaznostVrste[b.vrsta] || a.id.localeCompare(b.id))
}

/**
 * @param {import('../data/tipovi').DefinicijaTure[]} definicije
 * @param {import('../data/tipovi').Spomenik[]} spomenici
 * @param {string} vaznost
 * @returns {import('../data/tipovi').Tura[]}
 */
export const sastaviTure = (definicije, spomenici, vaznost) => definicije.map(({id, naziv, wiki, oblast}) => ({
  id, naziv, wiki, spomenici: izaberiStanice(spomenici, oblast, vaznost).map(s => s.id),
}))
