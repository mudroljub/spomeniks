// @ts-check
export const jeClanak = adresa => {
  if (!adresa) return false
  try {
    const url = new URL(adresa)
    if (!['https:', 'http:'].includes(url.protocol)) return false
    const host = url.hostname.replace(/^www\./, '')
    const putanja = decodeURIComponent(url.pathname)
    if (/\.(pdf|jpe?g|png|webp|svg|gif)$/i.test(putanja)) return false
    if (/(^|\.)(google\.[a-z.]+|openstreetmap\.org|facebook\.com)$/.test(host)) return false
    if (/^(openstreetmap\.org|google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl|commons\.wikimedia\.org|wikidata\.org|facebook\.com|x\.com|twitter\.com|eid\.gov\.si|registar\.kulturnadobra\.hr|znaci\.org|spomenicinob\.info|uploads\.knightlab\.com)$/.test(host)) return false
    if (host.endsWith('.wikipedia.org')) {
      const naslov = putanja.replace(/^\/wiki\//, '')
      return putanja.startsWith('/wiki/') && Boolean(naslov) && !naslov.includes(':')
        && !/^(Spisak|Popis|List_of|Списак|Dodatak)[_ :]/i.test(naslov)
    }
    return putanja !== '/' && !putanja.startsWith('/api/')
  } catch { return false }
}

/** @param {Pick<import('../data/tipovi').Spomenik, 'wiki' | 'wikiEn' | 'clanak'>} spomenik */
export const clanakSpomenika = (spomenik, jezik = 'sh') => {
  const kandidati = jezik === 'en'
    ? [spomenik.wikiEn, spomenik.wiki, spomenik.clanak]
    : [spomenik.wiki, spomenik.clanak, spomenik.wikiEn]
  return kandidati.find(jeClanak)
}
