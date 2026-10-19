// Tip podataka u data/*.json. Pravila pisanja vrednosti (jezik naziva, pravopis, slike): .claude/skills/spomenici-zetva/references/standard.md.
// U JS fajlu: /** @type {import('../data/tipovi').Spomenik} */

export type Drzava = 'Slovenia' | 'Croatia' | 'Bosnia and Herzegovina' | 'Serbia' | 'Montenegro' | 'Macedonia' | 'Kosovo' | 'Italy'

export type Vrsta = 'spomenik' | 'spomen-obelezje' | 'spomen-park' | 'spomen-groblje' | 'muzej' | 'statua' | 'bista' | 'spomen-ploca'

/** prazno: nema podatka da spomenik nije očuvan (može biti i nepoznato) */
export type Stanje = 'rusevine' | 'uklonjen' | 'ostecen' | 'zatvoren' | 'srusen'

export interface Koordinate {
  lat: number
  lng: number
}

/** data/spomenici-istaknuti.json i data/spomenici-ostali.json (alati/zapis.py) */
export interface Spomenik {
  /** jedinstven ključ: mala ASCII slova, cifre i crtice, npr. "banja-luka-maslesa" */
  id: string
  /** 7 decimala */
  koordinate: Koordinate
  /** tačka je približna (npr. centar sela), a ne potvrđeno mesto spomenika */
  priblizno?: boolean
  /** mesto, „Grad (deo grada)“, npr. "Beograd (Banjica)" */
  mesto: string
  /** domaći naziv, na jeziku i pismu države; bez poznatog imena samo vrsta („Spomenik“, „Spomen-ploča“) */
  naziv: string
  vrsta: Vrsta
  /** prednost na mapi i u turama, nezavisno od vrste i ikonice */
  istaknut?: boolean
  drzava: Drzava
  /** ID Google mesta, samo cifre */
  googleCid?: string
  /** domaći članak na Vikipediji o konkretnom spomeniku; ne o posveti, mestu ili autoru */
  wiki?: string
  /** engleski članak na Vikipediji o konkretnom spomeniku */
  wikiEn?: string
  /** proveren članak o konkretnom spomeniku van Vikipedije; izvor podataka sam po sebi nije članak */
  clanak?: string
  /** "slike/spomenici/<id>.webp" */
  slika?: string
  /** širina / visina slike; postoji uvek uz `slika` */
  slikaOdnos?: number
  /** „Autor, licenca“ */
  slikaPotpis?: string
  /** engleski naziv, samo kad se razlikuje od domaćeg */
  nazivEn?: string
  /** godina podizanja za prikaz, npr. "1961", "1958-1960" ili "pre 1960" */
  godina?: string
  /** autori spojeni sa „ & “ */
  autor?: string
  /** tekst natpisa sa spomenika, doslovno; novi red samo gde ima smisla (potpis, datum, ime i godine, stih), prazan red između ploča */
  natpis?: string
  /** Wikidata stavke iz data/posvete.json, npr. ["Q82914"], ili kratak opis posvete bez odgovarajućeg članka. */
  posveta?: string[] | string
  stanje?: Stanje
}

/** Geografski obuhvat: drzave, gradski pravougaonik, koridor putovanja ili oblast. */
export interface OblastTure {
  drzave: Drzava[]
  /** gradska naselja; deo u zagradi u polju mesto ne menja pripadnost gradu */
  mesta?: string[]
  /** jug, zapad, sever, istok */
  granice?: [number, number, number, number]
  /** putanja koridora, tacke [lat, lng] */
  putanja?: [number, number][]
  /** najveca udaljenost od putanje u kilometrima */
  sirinaKm?: number
  /** granica istorijske oblasti, temena [lat, lng]; deo van izabranih drzava se ne racuna */
  poligon?: [number, number][]
}

/** data/ture.json: definicije bez rucnog spiska stanica. */
export interface DefinicijaTure {
  id: string
  naziv: {sh: string, en: string}
  oblast: OblastTure
  wiki?: string
  /** stalni prag za ture koje bi inace imale stotine stanica (cela drzava, obala) */
  prag?: 'istaknut'
}

/** Automatski izabrane stanice; prikaz ih rasporedjuje za obilazak. */
export interface Tura {
  id: string
  naziv: {sh: string, en: string}
  spomenici: string[]
  /** članak o temi ture, nezavisno od članaka pojedinačnih spomenika */
  wiki?: string
}

/** moguća, nepotvrđena lokacija spomenika bez lokacije */
export interface Kandidat extends Koordinate {
  izvor: string
  opis: string
}

/** data/bez_lokacije.json: poznat spomenik koji još ne možemo da smestimo na mapu.
 * Ista polja kao Spomenik, bez koordinata, uz podatke koji pomažu da se spomenik pronađe. `id` je trajan i ostaje isti
 * kad stavka pređe na mapu, pa ga koriste veze iz knjiga (`cilj`) i izveštaja (`radniId`).
 * `slika` je kopija u "slike/bez-lokacije/<ime>.webp" (400 px, uz `slikaPotpis` i `slikaOdnos`); pri prebacivanju u bazu prelazi u slike/spomenici/<id>.webp.
 * Izuzetak: u 54 starije stavke `slika` je ime fajla na Vikipediji, koji treba preuzeti. */
export interface SpomenikBezLokacije extends Omit<Spomenik, 'koordinate'> {
  /** adresa ili opis položaja, na jeziku izvora */
  adresa?: string
  /** moguće, nepotvrđene lokacije */
  kandidati?: Kandidat[]
}

/** data/provere-spomenika.json: ID spomenika → provere, nezavisno od prelaska na mapu. */
export interface ProvereSpomenika {
  /** ishod pokušaja lociranja koji nije dao tačku: kada, iz kog izvora i šta je utvrđeno */
  proveraLokacije?: {datum: string, izvor: string, ishod: string, napomena?: string}
  /** ishod provere opstanka zapisa koji je povučen sa mape; prethodniId je njegov raniji id u bazi */
  proveraOpstanka?: {datum: string, prethodniId: string, ishod: string, razlog: string, izvestaj: string}
}
