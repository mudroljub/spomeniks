// rad bez signala: aplikacija i podaci se cuvaju odmah, a delovi mape i slike kad se jednom pogledaju
const APLIKACIJA = 'spomenici-aplikacija'
const MAPA = 'spomenici-mapa'
const SLIKE = 'spomenici-slike'

const najviseUnosa = {[MAPA]: 4000, [SLIKE]: 1500}

// cuvaju se pri instalaciji; ostali fajlovi aplikacije se sacuvaju kad se prvi put ucitaju
const fajlovi = [
  './',
  'index.html',
  'main.js',
  'style.css',
  'manifest.json',
  'favicon.ico',
  'data/spomeniks.json',
  'data/autori.json',
  'data/posvete.json',
  'data/ture.json',
  'klase/Marker.js',
  'klase/mapa.js',
  'komponente/Detalji.js',
  'komponente/Filteri.js',
  'komponente/Jezik.js',
  'komponente/Legenda.js',
  'komponente/Prijava.js',
  'komponente/Lokator.js',
  'komponente/Najblizi.js',
  'komponente/Pretraga.js',
  'komponente/PunEkran.js',
  'komponente/Ruta.js',
  'komponente/Slajder.js',
  'komponente/Slika.js',
  'utils/helpers.js',
  'utils/ikonice.js',
  'utils/jezik.js',
  'utils/prijava.js',
  'utils/oznake.js',
  'utils/ruta.js',
  'utils/raspored.js',
  'slike/obelisk.png',
  'slike/markeri/priblizno.svg',
  'slike/obelisk-rusevina.png',
  'slike/obelisk-uklonjen.png',
  ...['kompleks', 'lokalni', 'groblje', 'muzej', 'ploca', 'bista', 'statua'].flatMap(tip =>
    ['postoji', 'rusevina', 'uklonjen'].map(stanje => `slike/markeri/${tip}-${stanje}.svg`)),
  'slike/ui/lokator.svg',
  'slike/ui/punekran.svg',
  'slike/ikone/logo-192.png',
  'lib/leaflet/leaflet.css',
  'lib/leaflet/leaflet.js',
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APLIKACIJA).then(kes => kes.addAll(fajlovi)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

const jeMapa = url => /tile\.openstreetmap\.org|server\.arcgisonline\.com/.test(url.hostname)
const jeSlika = url => url.origin === location.origin && /\/slike\/(spomenici|male)\//.test(url.pathname)

// brise najstarije unose kad ih ima previse
const skrati = async ime => {
  const kes = await caches.open(ime)
  const kljucevi = await kes.keys()
  const visak = kljucevi.length - najviseUnosa[ime]
  await Promise.all(kljucevi.slice(0, Math.max(visak, 0)).map(k => kes.delete(k)))
}

let dodato = 0

// mapa i slike se ne menjaju, pa prvo iz kesa
const prvoKes = async (zahtev, ime) => {
  const sacuvano = await caches.match(zahtev.url)
  if (sacuvano) return sacuvano
  // cors umesto no-cors, da bi odgovor mogao da se sacuva bez preteranog zauzimanja prostora
  const odgovor = await fetch(zahtev.url, {
    mode: 'cors',
    credentials: 'omit',
    referrer: zahtev.referrer,
    referrerPolicy: zahtev.referrerPolicy,
  }).catch(() => fetch(zahtev))
  if (odgovor.ok && odgovor.type === 'cors') {
    const kes = await caches.open(ime)
    await kes.put(zahtev.url, odgovor.clone())
    if (++dodato % 100 === 0) skrati(ime)
  }
  return odgovor
}

const rokMreze = 3000

// stranice otvorene iz kesa uzimaju iz kesa i sve ostalo, da se ne pomesaju fajlovi stare i nove verzije
const otvoreneIzKesa = new Set()

const izKesa = zahtev => caches.match(zahtev, {ignoreSearch: true})
  .then(sacuvano => sacuvano || Promise.reject(new Error('nema u kesu')))

// aplikacija prvo sa mreze, da izmene stignu odmah; bez signala, ili kad mreza ne odgovori u roku, iz kesa,
// a odgovor mreze ipak osvezi kes za sledece otvaranje
const prvoMreza = e => {
  const mreza = fetch(e.request).then(async odgovor => {
    if (odgovor.ok) await (await caches.open(APLIKACIJA)).put(e.request, odgovor.clone())
    return odgovor
  })
  e.waitUntil(mreza.catch(() => {}))
  if (otvoreneIzKesa.has(e.clientId)) return izKesa(e.request).catch(() => mreza)

  let stiglo = false
  mreza.then(() => stiglo = true, () => {})
  const umestoMreze = () => izKesa(e.request).then(sacuvano => {
    if (e.resultingClientId) otvoreneIzKesa.add(e.resultingClientId)
    return sacuvano
  })
  const posleRoka = new Promise(r => setTimeout(r, rokMreze))
    .then(() => stiglo ? Promise.reject(new Error('mreza je stigla')) : umestoMreze())
  return Promise.any([mreza.catch(umestoMreze), posleRoka])
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (jeMapa(url)) e.respondWith(prvoKes(e.request, MAPA))
  else if (jeSlika(url)) e.respondWith(prvoKes(e.request, SLIKE))
  else if (url.origin === location.origin) e.respondWith(prvoMreza(e))
})
