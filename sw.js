// rad bez signala: aplikacija i podaci se cuvaju odmah, a delovi mape i slike kad se jednom pogledaju
// Promeni pri objavi izmena koda ili JSON podataka (docs/ALATI.md).
const VERZIJA = '2026-10-19-1'
const APLIKACIJA = `spomenici-aplikacija-${VERZIJA}`
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
  'data/spomenici-istaknuti.json',
  'data/spomenici-ostali.json',
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
  'utils/clanci.js',
  'utils/ikonice.js',
  'utils/jezik.js',
  'utils/ui.js',
  'utils/prijava.js',
  'utils/oznake.js',
  'utils/ruta.js',
  'utils/ture.js',
  'utils/vaznost.js',
  'utils/raspored.js',
  'slike/obelisk.png',
  'slike/markeri/priblizno.svg',
  'slike/markeri/posecen.svg',
  'slike/markeri/lista.svg',
  'slike/obelisk-rusevina.png',
  'slike/obelisk-uklonjen.png',
  ...['spomen-park', 'spomen-obelezje', 'spomen-groblje', 'muzej', 'spomen-ploca', 'bista', 'statua'].flatMap(tip =>
    ['postoji', 'rusevina', 'uklonjen'].map(stanje => `slike/markeri/${tip}-${stanje}.svg`)),
  'slike/ui/lokator.svg',
  'slike/ui/punekran.svg',
  'slike/ikone/logo-192.png',
  'lib/leaflet/leaflet.css',
  'lib/leaflet/leaflet.js',
]

self.addEventListener('install', e => {
  // Nova verzija ceka zatvaranje starih kartica; njihov worker i kes ostaju netaknuti.
  e.waitUntil(caches.open(APLIKACIJA).then(kes => kes.addAll(fajlovi)))
})

self.addEventListener('activate', e => e.waitUntil(caches.keys().then(imena => Promise.all(
  imena.filter(ime => ime.startsWith('spomenici-aplikacija') && ime !== APLIKACIJA).map(ime => caches.delete(ime))
))))

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

// neuspeo upis (npr. pun disk) ne sme da pokvari odgovor koji je vec stigao
const sacuvaj = (e, ime, kljuc, odgovor) => {
  const kopija = odgovor.clone()
  e.waitUntil(caches.open(ime)
    .then(kes => kes.put(kljuc, kopija))
    .then(() => { if (ime !== APLIKACIJA && ++dodato % 100 === 0) return skrati(ime) })
    .catch(() => {}))
}

// Mapa se uzima iz kesa; fotografija se u pozadini proverava jer se menja pod istim URL-om.
const prvoKes = async (e, ime) => {
  const zahtev = e.request
  const kes = await caches.open(ime)
  const sacuvano = await kes.match(zahtev.url)
  if (sacuvano && ime === MAPA) return sacuvano
  // cors umesto no-cors, da bi odgovor mogao da se sacuva bez preteranog zauzimanja prostora
  const mreza = fetch(zahtev.url, {
    mode: 'cors',
    cache: ime === SLIKE ? 'no-cache' : 'default',
    credentials: 'omit',
    referrer: zahtev.referrer,
    referrerPolicy: zahtev.referrerPolicy,
  }).catch(() => fetch(zahtev)).then(odgovor => {
    if (odgovor.ok) sacuvaj(e, ime, zahtev.url, odgovor)
    return odgovor
  })
  e.waitUntil(mreza.catch(() => {}))
  return sacuvano || mreza
}

// Instalirani resursi se nikada ne prepisuju pojedinacnim zahtevima drugih kartica.
const izIzdanja = async e => {
  const kes = await caches.open(APLIKACIJA)
  return await kes.match(e.request, {ignoreSearch: true}) || fetch(e.request)
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (jeMapa(url)) e.respondWith(prvoKes(e, MAPA))
  else if (jeSlika(url)) e.respondWith(prvoKes(e, SLIKE))
  else if (url.origin === location.origin) e.respondWith(izIzdanja(e))
})
