// Tip podataka u data/*.json. Pravila pisanja vrednosti (jezik naziva, pravopis, slike): .claude/skills/spomenici-zetva/references/standard.md.
// U JS fajlu: /** @type {import('../data/tipovi').Spomenik} */

export type Drzava = 'Slovenia' | 'Croatia' | 'Bosnia and Herzegovina' | 'Serbia' | 'Montenegro' | 'Macedonia' | 'Kosovo' | 'Italy'

export type Vrsta = 'istaknut' | 'spomenik' | 'lokalni' | 'kompleks' | 'groblje' | 'muzej' | 'statua' | 'bista' | 'ploca'

/** prazno: nema podatka da spomenik nije očuvan (može biti i nepoznato) */
export type Stanje = 'rusevine' | 'uklonjen' | 'ostecen' | 'zatvoren' | 'srusen'

export interface Koordinate {
  lat: number
  lng: number
}

/** data/spomeniks.json */
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
  drzava: Drzava
  /** ID Google mesta, samo cifre */
  googleCid?: string
  /** URL izvora podataka: OSM, Commons, registar, spomenicinob.info */
  izvor?: string
  /** domaći članak na Vikipediji */
  wiki?: string
  /** engleski članak na Vikipediji */
  wikiEn?: string
  /** "slike/spomenici/<id>.webp" */
  slika?: string
  /** širina / visina slike; postoji uvek uz `slika` */
  slikaOdnos?: number
  /** „Autor, licenca“ */
  slikaPotpis?: string
  /** engleski naziv, samo kad se razlikuje od domaćeg */
  nazivEn?: string
  /** godina podizanja: "1961", raspon "1958-1960", ili približno "pre 1960", "posle 1960", "oko 1960", "1960-ih" */
  godina?: string
  /** autori spojeni sa „ & “ */
  autor?: string
  /** tekst natpisa sa spomenika, doslovno; novi red samo gde ima smisla (potpis, datum, ime i godine, stih), prazan red između ploča */
  natpis?: string
  /** Wikidata stavke iz data/posvete.json, npr. ["Q82914"], ili kratak opis posvete bez odgovarajućeg članka. */
  posveta?: string[] | string
  stanje?: Stanje
  /** Izvor prenetog stanja; godina označava izdanje izvora, ne terenski pregled. */
  stanjeIzvor?: {naziv: string, godina: number, url: string}
}

/** moguća, nepotvrđena lokacija spomenika bez lokacije */
export interface Kandidat extends Koordinate {
  izvor: string
  opis: string
}

/** data/bez_lokacije.json: poznat spomenik koji još ne možemo da smestimo na mapu.
 * Ista polja kao Spomenik, bez id-a i koordinata, uz podatke koji pomažu da se spomenik pronađe.
 * `slika` je kopija u "slike/bez-lokacije/<ime>.webp" (400 px, uz `slikaPotpis` i `slikaOdnos`); pri prebacivanju u bazu prelazi u slike/spomenici/<id>.webp.
 * Izuzetak: u 54 starije stavke `slika` je ime fajla na Vikipediji, koji treba preuzeti. */
export interface SpomenikBezLokacije extends Omit<Spomenik, 'id' | 'koordinate'> {
  /** adresa ili opis položaja, na jeziku izvora */
  adresa?: string
  /** moguće, nepotvrđene lokacije */
  kandidati?: Kandidat[]
}
