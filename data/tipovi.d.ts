// Tip podataka u data/*.json. Pravila pisanja vrednosti (jezik naziva, pravopis, slike): .claude/skills/spomenici-zetva/references/standard.md.
// U JS fajlu: /** @type {import('../data/tipovi').Spomenik} */

export type Drzava = 'Slovenia' | 'Croatia' | 'Bosnia and Herzegovina' | 'Serbia' | 'Montenegro' | 'Macedonia' | 'Kosovo' | 'Italy'

export type Vrsta = 'spomenik' | 'spomen-obelezje' | 'spomen-park' | 'spomen-groblje' | 'muzej' | 'statua' | 'bista' | 'reljef' | 'spomen-kuca' | 'groblje' | 'spomen-ploca'

/** prazno: nema podatka da spomenik nije očuvan (može biti i nepoznato) */
export type Stanje = 'rusevine' | 'uklonjen' | 'ostecen' | 'zatvoren' | 'srusen'

/** tekst po jeziku interfejsa (opis, naziv posvete ili ture); en samo kad se razlikuje od sh */
export interface Prevod {
  sh: string
  en?: string
}

export interface Koordinate {
  lat: number
  lng: number
}

/** Ceo zapis spomenika na mapi, kakav vide alati i aplikacija. Fajlovi mape (data/spomenici-istaknuti.json i
 * data/spomenici-ostali.json) imaju samo polja za crtanje mape; polja za prozor, pretragu i filtere (googleCid, wiki, wikiEn,
 * slikaPotpis, opis, godina, autor, natpis, posveta) su u data/detalji.json, a `nazivEn` u data/prevodi-en.json.
 * alati/zapis.py ih spaja pri učitavanju i razdvaja pri čuvanju; aplikacija ih dopunjuje kad stignu, posle prvog crtanja. */
export interface Spomenik {
  /** jedinstven ključ: mala ASCII slova, cifre i crtice, npr. "banja-luka-maslesa" */
  id: string
  /** 7 decimala */
  koordinate: Koordinate
  /** tačka je približna (npr. centar sela), a ne potvrđeno mesto spomenika */
  priblizno?: boolean
  /** mesto, „Grad (deo grada)“, npr. "Beograd (Banjica)" */
  mesto: string
  /** konkretan opis položaja ili adresa (npr. „Ispred osnovne škole“), na jeziku izvora; prikazuje se u prozoru spomenika */
  adresa?: string
  /** domaći naziv, na jeziku i pismu države; bez poznatog imena samo vrsta („Spomenik“, „Spomen-ploča“) */
  naziv: string
  /** engleski naziv, samo kad se razlikuje od domaćeg; aplikacija ga preuzima samo na engleskom */
  nazivEn?: string
  /** jedna ili dve rečenice o tome šta se tu desilo ili čemu je posvećen; sh latinicom (i za Sloveniju i Makedoniju) i en,
   * oba obavezna. „[tekst](Q-id)“ je link stavke iz `posveta`; tako povezana posveta nema poseban red. */
  opis?: Prevod
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
  /** "slike/spomenici/<id>.webp"; u fajlovima mape se ta standardna putanja ne upisuje (oznacava je `slikaOdnos`), a alati i aplikacija je vracaju pri ucitavanju */
  slika?: string
  /** širina / visina slike; postoji uvek uz `slika` */
  slikaOdnos?: number
  /** „Autor, licenca“ */
  slikaPotpis?: string
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
  /** grupa na spisku tura kad nije prva drzava oblasti: pokrajina sa svojim glavnim stabom u NOB */
  grupa?: 'Vojvodina'
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

/** data/van-mape/bez_lokacije.json: poznat spomenik koji još ne možemo da smestimo na mapu.
 * Ista polja kao Spomenik, bez koordinata, uz podatke koji pomažu da se spomenik pronađe. `id` je trajan i ostaje isti
 * kad stavka pređe na mapu, pa ga koriste veze iz knjiga (`cilj`) i izveštaja (`radniId`).
 * `slika` je kopija u "slike/bez-lokacije/<ime>.webp" (400 px, uz `slikaPotpis` i `slikaOdnos`); pri prebacivanju u bazu prelazi u slike/spomenici/<id>.webp.
 * Izuzetak: u 54 starije stavke `slika` je ime fajla na Vikipediji, koji treba preuzeti. */
export interface SpomenikBezLokacije extends Omit<Spomenik, 'koordinate'> {
  /** moguće, nepotvrđene lokacije */
  kandidati?: Kandidat[]
}

/** data/van-mape/arhiva.json: zapis koji aplikacija ne prikazuje: uklonjen, a nije istaknut, spomen-park, muzej ni spomenik, ili srušen i neistaknut bez tačne tačke.
 * Isti `id` i polja kao Spomenik ili SpomenikBezLokacije, uz obavezno `stanje`; `slika` je u "slike/arhiva/<id>.webp". */
export type SpomenikArhive = (Spomenik | SpomenikBezLokacije) & {stanje: Stanje}

/** data/provere/provere-spomenika.json: ID spomenika → provere, nezavisno od prelaska na mapu. */
export interface ProvereSpomenika {
  /** ishod pokušaja lociranja koji nije dao tačku: kada, iz kog izvora i šta je utvrđeno */
  proveraLokacije?: {datum: string, izvor: string, ishod: string, napomena?: string}
  /** ishod provere opstanka zapisa koji je povučen sa mape; prethodniId je njegov raniji id u bazi */
  proveraOpstanka?: {datum: string, prethodniId: string, ishod: string, razlog: string, izvestaj: string}
}
