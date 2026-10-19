// sw.js u izolovanom okruzenju: kes i mreza su lazni, pa se proverava samo odluka odakle stize odgovor
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'

const kod = readFileSync(new URL('../../sw.js', import.meta.url), 'utf8')
const sajt = 'https://spomenici.test'

const pokreni = ({mreza, neuspesanUpis = false, kesevi = new Map(), verzija}) => {
  const kljuc = zahtev => new URL(typeof zahtev === 'string' ? zahtev : zahtev.url).href
  const otvori = ime => {
    if (!kesevi.has(ime)) kesevi.set(ime, new Map())
    const sadrzaj = kesevi.get(ime)
    return {
      put: async (zahtev, odgovor) => {
        if (neuspesanUpis) throw new Error('QuotaExceededError')
        sadrzaj.set(kljuc(zahtev), odgovor.clone())
      },
      addAll: async putanje => {
        const odgovori = await Promise.all(putanje.map(p => mreza(new URL(p, sajt).href)))
        if (odgovori.some(o => !o.ok)) throw new Error('install failed')
        putanje.forEach((p, i) => sadrzaj.set(new URL(p, sajt).href, odgovori[i].clone()))
      },
      match: async zahtev => sadrzaj.get(kljuc(zahtev))?.clone(),
      keys: async () => [...sadrzaj.keys()],
      delete: async k => sadrzaj.delete(k),
    }
  }
  const zahtevi = []
  const slusaoci = {}
  let preskocenoCekanje = false, preuzetiKlijenti = false
  const okruzenje = {
    self: {addEventListener: (vrsta, fn) => slusaoci[vrsta] = fn,
      skipWaiting: () => { preskocenoCekanje = true }, clients: {claim: () => { preuzetiKlijenti = true }}},
    location: new URL(sajt),
    caches: {
      open: async ime => otvori(ime),
      keys: async () => [...kesevi.keys()],
      delete: async ime => kesevi.delete(ime),
      match: async zahtev => {
        for (const ime of kesevi.keys()) {
          const odgovor = await otvori(ime).match(zahtev)
          if (odgovor) return odgovor
        }
      },
    },
    fetch: async zahtev => {
      zahtevi.push(kljuc(zahtev))
      return mreza(kljuc(zahtev))
    },
    // rok mreze ne istice, jer lazna mreza odgovara odmah
    URL, Request, Response, Promise, setTimeout: () => {},
  }
  vm.runInNewContext((verzija ? kod.replace(/const VERZIJA = '[^']+'/u, `const VERZIJA = '${verzija}'`) : kod)
    + '\nglobalThis.imeIzdanja = APLIKACIJA', okruzenje)

  const otvoriAdresu = async (putanja, {clientId = 'stranica', resultingClientId = ''} = {}) => {
    const cekanja = []
    let odgovor
    slusaoci.fetch({
      request: new Request(sajt + putanja), clientId, resultingClientId,
      respondWith: p => odgovor = p,
      waitUntil: p => cekanja.push(p),
    })
    const rezultat = await odgovor
    await Promise.all(cekanja)
    return rezultat
  }
  const dogadjaj = async vrsta => {
    const cekanja = []
    slusaoci[vrsta]({waitUntil: p => cekanja.push(p)})
    await Promise.all(cekanja)
  }
  return {otvoriAdresu, kesevi, zahtevi, imeIzdanja: okruzenje.imeIzdanja, dogadjaj,
    preuzimanje: () => ({preskocenoCekanje, preuzetiKlijenti}),
    sacuvaj: (ime, putanja, tekst) => otvori(ime).put(sajt + putanja, new Response(tekst))}
}

test('fotografija sa sajta se čuva u kešu slika', async () => {
  const sw = pokreni({mreza: () => new Response('slika')})
  await sw.otvoriAdresu('/slike/spomenici/a.webp')
  assert.ok(sw.kesevi.get('spomenici-slike').has(`${sajt}/slike/spomenici/a.webp`))
})

test('greška servera vraća sačuvanu kopiju umesto greške', async () => {
  const sw = pokreni({mreza: () => new Response('', {status: 503})})
  await sw.sacuvaj(sw.imeIzdanja, '/main.js', 'stari')
  const odgovor = await sw.otvoriAdresu('/main.js')
  assert.equal(odgovor.status, 200)
  assert.equal(await odgovor.text(), 'stari')
})

test('greška servera bez sačuvane kopije stiže do stranice', async () => {
  const sw = pokreni({mreza: () => new Response('', {status: 503})})
  assert.equal((await sw.otvoriAdresu('/main.js')).status, 503)
})

test('neuspeo upis u keš ne kvari preuzetu sliku ni fajl aplikacije', async () => {
  const sw = pokreni({mreza: () => new Response('sa mreze'), neuspesanUpis: true})
  assert.equal(await (await sw.otvoriAdresu('/slike/spomenici/a.webp')).text(), 'sa mreze')
  assert.equal(await (await sw.otvoriAdresu('/main.js')).text(), 'sa mreze')
})

test('stranica otvorena iz keša dobija ostale fajlove iz istog keša, bez osvežavanja sa mreže', async () => {
  let radi = false
  const sw = pokreni({mreza: () => radi ? new Response('novi') : Promise.reject(new TypeError('nema signala'))})
  await sw.sacuvaj(sw.imeIzdanja, '/index.html', 'stari')
  await sw.sacuvaj(sw.imeIzdanja, '/main.js', 'stari')
  await sw.otvoriAdresu('/index.html', {clientId: '', resultingClientId: 'iz-kesa'})
  radi = true
  const pre = sw.zahtevi.length
  assert.equal(await (await sw.otvoriAdresu('/main.js', {clientId: 'iz-kesa'})).text(), 'stari')
  assert.equal(sw.zahtevi.length, pre)
  assert.equal(await sw.kesevi.get(sw.imeIzdanja).get(`${sajt}/main.js`).clone().text(), 'stari')
})

test('druga kartica i instalacija novog izdanja ne menjaju resurse stare kartice', async () => {
  const stari = pokreni({verzija: 'stari', mreza: () => new Response('nova mreza')})
  await stari.sacuvaj(stari.imeIzdanja, '/index.html', 'stari HTML')
  await stari.sacuvaj(stari.imeIzdanja, '/main.js', 'stari JS')
  assert.equal(await (await stari.otvoriAdresu('/index.html', {resultingClientId: 'A'})).text(), 'stari HTML')
  assert.equal(await (await stari.otvoriAdresu('/main.js', {clientId: 'B'})).text(), 'stari JS')
  const novi = pokreni({verzija: 'novi', kesevi: stari.kesevi, mreza: () => new Response('novo izdanje')})
  await novi.dogadjaj('install')
  assert.deepEqual(novi.preuzimanje(), {preskocenoCekanje: false, preuzetiKlijenti: false})
  assert.equal(await (await stari.otvoriAdresu('/main.js', {clientId: 'A'})).text(), 'stari JS')
  assert.equal(await (await novi.otvoriAdresu('/main.js')).text(), 'novo izdanje')
  await novi.dogadjaj('activate')
  assert.ok(!novi.kesevi.has(stari.imeIzdanja))
  assert.ok(novi.kesevi.has(novi.imeIzdanja))
})

test('nepotpuna instalacija ne zamenjuje prethodno izdanje', async () => {
  const kesevi = new Map()
  const stari = pokreni({verzija: 'stari', kesevi, mreza: () => new Response('stari')})
  await stari.dogadjaj('install')
  const novi = pokreni({verzija: 'novi', kesevi, mreza: () => new Response('', {status: 503})})
  await assert.rejects(novi.dogadjaj('install'))
  assert.equal(await (await stari.otvoriAdresu('/main.js')).text(), 'stari')
})

test('fotografija se osvezava pod istim URL-om, a ostaje dostupna bez mreze', async () => {
  let tekst = 'stara', offline = false
  const sw = pokreni({mreza: () => offline ? Promise.reject(new Error('offline')) : new Response(tekst)})
  const putanja = '/slike/spomenici/a.webp'
  assert.equal(await (await sw.otvoriAdresu(putanja)).text(), 'stara')
  tekst = 'nova'
  assert.equal(await (await sw.otvoriAdresu(putanja)).text(), 'stara')
  assert.equal(await (await sw.otvoriAdresu(putanja)).text(), 'nova')
  offline = true
  assert.equal(await (await sw.otvoriAdresu(putanja)).text(), 'nova')
})

test('neuspelo osvezavanje male fotografije ne prepisuje sacuvanu sliku', async () => {
  let status = 200
  const sw = pokreni({mreza: () => new Response('slika', {status})})
  const putanja = '/slike/male/a.webp'
  await sw.otvoriAdresu(putanja)
  status = 503
  assert.equal(await (await sw.otvoriAdresu(putanja)).text(), 'slika')
  assert.equal(sw.kesevi.get('spomenici-slike').get(sajt + putanja).status, 200)
})
