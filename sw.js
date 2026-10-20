// rad bez signala: aplikacija i podaci se cuvaju odmah, a delovi mape i slike kad se jednom pogledaju
// Generise node alati/otisak.mjs; integritet proverava otisak resursa.
const VERZIJA = '469d1ecf7647d7e5ea1b'
const APLIKACIJA = `spomenici-aplikacija-${VERZIJA}`
const MAPA = 'spomenici-mapa'
const SLIKE = 'spomenici-slike'
const KLIJENTI = 'spomenici-klijenti'
const rokSlike = 24 * 60 * 60 * 1000

const najviseUnosa = {[MAPA]: 4000, [SLIKE]: 1500}

// Komplet aplikacije se cuva pri instalaciji; fotografije i plocice mape tokom obilaska.
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
  'utils/skladiste.js',
  'utils/ui.js',
  'utils/azuriranje.js',
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
  ...['spomen-park', 'spomen-obelezje', 'spomen-groblje', 'groblje', 'muzej', 'spomen-ploca', 'bista', 'statua'].flatMap(tip =>
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

const kljucKlijenta = id => new URL(`.klijenti/${id}`, self.registration.scope).href
const nasiKlijenti = async () => (await self.clients.matchAll({type: 'window', includeUncontrolled: true}))
  .filter(klijent => klijent.url.startsWith(self.registration.scope))

const ocistiIzdanja = async (sva = false) => {
  const zivi = new Set((await nasiKlijenti()).map(k => kljucKlijenta(k.id)))
  const veze = await caches.open(KLIJENTI)
  const potrebni = new Set([APLIKACIJA])
  const zastarela = new Set()
  for (const zahtev of await veze.keys()) {
    const odgovor = await veze.match(zahtev)
    if (!odgovor) continue
    const izdanje = await odgovor.text()
    if (zivi.has(zahtev.url)) potrebni.add(izdanje)
    else { zastarela.add(izdanje); await veze.delete(zahtev) }
  }
  if (sva) (await caches.keys()).filter(ime => ime.startsWith('spomenici-aplikacija-')).forEach(ime => zastarela.add(ime))
  await Promise.all([...zastarela].filter(ime => ime.startsWith('spomenici-aplikacija-')
    && !potrebni.has(ime)).map(ime => caches.delete(ime)))
}

self.addEventListener('activate', e => e.waitUntil((async () => {
  await Promise.all([skrati(MAPA), skrati(SLIKE)])
  await ocistiIzdanja(true)
  const veze = await caches.open(KLIJENTI)
  for (const klijent of await nasiKlijenti())
    if (await veze.match(kljucKlijenta(klijent.id))) klijent.postMessage({vrsta: 'OSVEZI_IZDANJE'})
})()))

self.addEventListener('message', e => {
  if (e.data?.vrsta === 'VERZIJA') e.ports?.[0]?.postMessage({izdanje: APLIKACIJA})
  if (e.data?.vrsta === 'SPREMAN') e.waitUntil(ocistiIzdanja())
  if (e.data?.vrsta !== 'AKTIVIRAJ') return
  e.waitUntil((async () => {
    const prethodni = e.data.prethodni
    if (!prethodni?.startsWith('spomenici-aplikacija-') || !(await caches.has(prethodni))) throw new Error('Nepoznato prethodno izdanje')
    const veze = await caches.open(KLIJENTI)
    for (const klijent of await nasiKlijenti()) {
      const kljuc = kljucKlijenta(klijent.id)
      if (!(await veze.match(kljuc))) await veze.put(kljuc, new Response(prethodni))
    }
    // Svaka stara stranica ostaje vezana za stare resurse dok se njeno ponovno ucitavanje ne zavrsi.
    await self.skipWaiting()
    e.ports?.[0]?.postMessage({uspeh: true})
  })().catch(() => e.ports?.[0]?.postMessage({uspeh: false})))
})

const jeMapa = url => /tile\.openstreetmap\.org|server\.arcgisonline\.com/.test(url.hostname)
const jeSlika = url => url.origin === location.origin && /\/slike\/(spomenici|male)\//.test(url.pathname)

// brise najstarije unose kad ih ima previse
const skrati = async ime => {
  const kes = await caches.open(ime)
  const kljucevi = await kes.keys()
  const visak = kljucevi.length - najviseUnosa[ime]
  await Promise.all(kljucevi.slice(0, Math.max(visak, 0)).map(k => kes.delete(k)))
}

const redoviUpisa = new Map()
const kljuceviKesa = new Map()

// neuspeo upis (npr. pun disk) ne sme da pokvari odgovor koji je vec stigao
const sacuvaj = (e, ime, kljuc, odgovor) => {
  let kopija = odgovor.clone()
  if (ime === SLIKE) {
    const headers = new Headers(kopija.headers)
    headers.set('X-Spomenici-Provereno', String(Date.now()))
    headers.set('X-Spomenici-Izdanje', VERZIJA)
    kopija = new Response(kopija.body, {status: kopija.status, statusText: kopija.statusText, headers})
  }
  const upis = (redoviUpisa.get(ime) || Promise.resolve()).catch(() => {}).then(async () => {
    const kes = await caches.open(ime)
    if (!kljuceviKesa.has(ime)) kljuceviKesa.set(ime, new Map((await kes.keys()).map(k => [k.url, k])))
    const kljucevi = kljuceviKesa.get(ime)
    await kes.put(kljuc, kopija)
    const url = typeof kljuc === 'string' ? kljuc : kljuc.url
    kljucevi.set(url, kljuc)
    while (kljucevi.size > najviseUnosa[ime]) {
      const [najstariji, zahtev] = kljucevi.entries().next().value
      await kes.delete(zahtev)
      kljucevi.delete(najstariji)
    }
  })
  redoviUpisa.set(ime, upis)
  e.waitUntil(upis.catch(() => {}))
}

// Mapa se uzima iz kesa; fotografija se u pozadini proverava jer se menja pod istim URL-om.
const prvoKes = async (e, ime) => {
  const zahtev = e.request
  const kes = await caches.open(ime)
  const sacuvano = await kes.match(zahtev.url)
  const sveza = sacuvano && sacuvano.headers.get('X-Spomenici-Izdanje') === VERZIJA
    && Date.now() - Number(sacuvano.headers.get('X-Spomenici-Provereno')) < rokSlike
  if (sacuvano && (ime === MAPA || sveza)) return sacuvano
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
  const veza = e.request.mode !== 'navigate' && e.clientId
    && await (await caches.open(KLIJENTI)).match(kljucKlijenta(e.clientId))
  const izdanje = veza ? await veza.text() : APLIKACIJA
  const kes = await caches.open(izdanje)
  return await kes.match(e.request, {ignoreSearch: true}) || fetch(e.request)
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (jeMapa(url)) e.respondWith(prvoKes(e, MAPA))
  else if (jeSlika(url)) e.respondWith(prvoKes(e, SLIKE))
  else if (url.origin === location.origin) e.respondWith(izIzdanja(e))
})
