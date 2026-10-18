// @ts-check
const kljuc = 'spomenici-jezik'

const sacuvan = () => {
  try {
    return localStorage.getItem(kljuc)
  } catch (e) {
    return null
  }
}

export const jezik = sacuvan() === 'en' ? 'en' : 'sh'

export const promeniJezik = novi => {
  try {
    localStorage.setItem(kljuc, novi)
  } catch (e) {
    return
  }
  location.reload()
}

const jednina = n => n % 10 === 1 && n % 100 !== 11
const malo = n => [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)

const tekstovi = {
  pragVaznosti: {sh: 'Prag važnosti', en: 'Importance threshold'},
  praznaAutomatskaTura: {sh: 'Za ovaj prag važnosti nema spomenika u turi.', en: 'No monuments in this tour at this importance level.'},
  prijavaNaslov: {sh: 'Dodaj spomenik', en: 'Add a monument'},
  prijavaDopuna: {sh: 'Dopuna podataka', en: 'Monument update'},
  dopuniPodatke: {sh: 'Dopuni podatke', en: 'Update details'},
  prijavaNaziv: {sh: 'Naziv spomenika (obavezno)', en: 'Monument name (required)'},
  prijavaLokacija: {sh: 'Lokacija — link iz mape (obavezno)', en: 'Location — map link (required)'},
  prijavaUputstvo: {
    sh: 'Pošalji lokaciju i naziv spomenika.',
    en: 'Send the location and name of the monument.',
  },
  prijavaOtvoriMejl: {sh: 'Otvori mejl', en: 'Open email'},
  prijavaKopiraj: {sh: 'Kopiraj mejl adresu', en: 'Copy email address'},
  prijavaKopirano: {sh: 'Adresa je kopirana.', en: 'Address copied.'},
  prijavaKopirajRucno: {sh: 'Kopiraj adresu ručno', en: 'Copy the address manually'},
  prijavaOpciono: {sh: 'Opciono: fotografija, kategorija, opis i ostali podaci.', en: 'Optional: photo, category, description and other details.'},
  prijavaBonus: {sh: 'Bonus: dodaj spomenik na Google mapu', en: 'Bonus: add the monument to Google Maps'},
  prijavaGoogle: {
    sh: 'Ako želiš, dodaj spomenik koji nedostaje na Google mapu, pa pošalji njegov link. Ako već postoji, samo podeli njegovu lokaciju.',
    en: 'If you like, add a missing monument to Google Maps, then send its link. If it is already there, just share its location.',
  },
  navigacija: {sh: 'Navigacija', en: 'Navigate'},
  mesto: {sh: 'Mapa', en: 'Map'},
  dodajURutu: {sh: 'U rutu', en: 'To route'},
  vecURuti: {sh: 'U ruti', en: 'In route'},
  trenutnaRuta: {sh: 'Trenutna ruta', en: 'Current route'},
  izaberiTuru: {sh: 'Izaberi turu', en: 'Choose a tour'},
  lista: {sh: 'Želim da posetim', en: 'Want to visit'},
  posetio: {sh: 'Posećeno', en: 'Visited'},
  mojaPoseta: {sh: 'Moja poseta', en: 'My visit'},
  filteri: {sh: 'Filteri', en: 'Filters'},
  pretraga: {sh: n => `Pretraži ${n} spomenika NOB`, en: n => `Search ${n} WWII monuments`},
  obrisi: {sh: 'Obriši', en: 'Clear'},
  obrisiSve: {sh: 'Obriši sve', en: 'Clear all'},
  zatvori: {sh: 'Zatvori', en: 'Close'},
  uBlizini: {sh: 'U blizini', en: 'Nearby'},
  vazdusnom: {sh: 'vazdušnom linijom', en: 'straight-line distance'},
  vise: {sh: 'Više', en: 'Read more'},
  foto: {sh: 'Foto', en: 'Photo'},
  nadjeno: {
    sh: (n, ukupno) => `${n} od ${ukupno} spomenika`,
    en: (n, ukupno) => `${n} of ${ukupno} monuments`,
  },
  prikazi: {
    sh: n => `Prikaži ${n} ${jednina(n) ? 'spomenik' : 'spomenika'}`,
    en: n => `Show ${n} monument${n === 1 ? '' : 's'}`,
  },

  rusevine: {sh: 'U ruševinama', en: 'In ruins'},
  srusen: {sh: 'Srušen', en: 'Destroyed'},
  uklonjen: {sh: 'Uklonjen', en: 'Removed'},
  ostecen: {sh: 'Oštećen', en: 'Damaged'},
  zatvoren: {sh: 'Zatvoren', en: 'Closed'},

  grupaStanje: {sh: 'Stanje', en: 'Condition'},
  postoji: {sh: 'Očuvan', en: 'Standing'},
  ruine: {sh: 'Ruševine', en: 'Ruins'},
  priblizno: {sh: 'Bez tačne lokacije', en: 'No exact location'},
  grupaPoseta: {sh: 'Moje posete', en: 'My visits'},
  neposecen: {sh: 'Još neposećeno', en: 'Not visited yet'},
  grupaDrzava: {sh: 'Država', en: 'Country'},
  grupaAutor: {sh: 'Autor', en: 'Artist'},
  autori: {sh: 'Autori', en: 'Artists'},
  posveta: {sh: 'Posvećeno', en: 'Dedicated to'},
  natpis: {sh: 'Natpis', en: 'Inscription'},
  sviAutori: {sh: 'Svi autori', en: 'All artists'},
  traziAutora: {sh: 'Traži autora', en: 'Find an artist'},
  nemaAutora: {sh: 'Nema takvog autora', en: 'No such artist'},
  istaknut: {sh: 'Istaknuti spomenik', en: 'Featured monument'},
  'spomen-park': {sh: 'Spomen-parkovi', en: 'Memorial parks'},
  spomenik: {sh: 'Spomenici', en: 'Monuments'},
  statua: {sh: 'Statue', en: 'Statues'},
  bista: {sh: 'Biste', en: 'Busts'},
  'spomen-obelezje': {sh: 'Spomen-obeležja', en: 'Memorial markers'},
  'spomen-ploca': {sh: 'Spomen-ploče', en: 'Memorial plaques'},
  'spomen-groblje': {sh: 'Spomen-groblja', en: 'Memorial cemeteries'},
  muzej: {sh: 'Muzeji', en: 'Museums'},
  legenda: {sh: 'Legenda', en: 'Legend'},
  grupaVrste: {sh: 'Vrste', en: 'Types'},
  viseZumom: {sh: 'veći zum prikazuje više vrsta spomenika', en: 'zoom in to see more types of monuments'},
  // legenda opisuje jedan znak na mapi, pa je u jednini
  'spomen-parkJednina': {sh: 'Spomen-park', en: 'Memorial park'},
  spomenikJednina: {sh: 'Spomenik', en: 'Monument'},
  statuaJednina: {sh: 'Statua', en: 'Statue'},
  bistaJednina: {sh: 'Bista', en: 'Bust'},
  'spomen-obelezjeJednina': {sh: 'Spomen-obeležje', en: 'Memorial marker'},
  'spomen-plocaJednina': {sh: 'Spomen-ploča', en: 'Memorial plaque'},
  'spomen-grobljeJednina': {sh: 'Spomen-groblje', en: 'Memorial cemetery'},
  muzejJednina: {sh: 'Muzej', en: 'Museum'},
  ruineJednina: {sh: 'Ruševina', en: 'Ruin'},
  grupaPosetaJednina: {sh: 'Moja poseta', en: 'My visit'},
  nestao: {sh: 'Uklonjen — nema šta da se vidi', en: 'Removed — nothing left to see'},

  predlozeneRute: {sh: 'Predložene rute', en: 'Suggested routes'},
  praznaRuta: {
    sh: 'Još nema stanica. Dodaj spomenike dugmetom <b>+ Ruta</b> u njihovim detaljima ili izaberi neku od predloženih ruta.',
    en: 'No stops yet. Add monuments with <b>+ Route</b> in their details, or pick one of the suggested routes.',
  },
  redosled: {sh: 'Optimizuj redosled', en: 'Optimize order'},
  ukloniRutu: {sh: 'Ukloni rutu', en: 'Remove route'},
  googleMape: {sh: 'Otvori u Google mapama', en: 'Open in Google Maps'},
  ogranicenje: {
    sh: n => `Google mape primaju samo prvih ${n} stanica.`,
    en: n => `Google Maps takes only the first ${n} stops.`,
  },
  stanice: {
    sh: n => `${n} ${malo(n) ? 'stanice' : 'stanica'}`,
    en: n => `${n} stop${n === 1 ? '' : 's'}`,
  },
  gore: {sh: 'Pomeri gore', en: 'Move up'},
  dole: {sh: 'Pomeri dole', en: 'Move down'},
  ukloni: {sh: 'Ukloni', en: 'Remove'},

  lokacijaNepodrzana: {sh: 'Lokacija nije podržana', en: 'Location is not supported'},
  lokacijaNedostupna: {sh: 'Lokacija nije dostupna', en: 'Location is not available'},
  vanMape: {sh: 'Tvoja lokacija je van mape', en: 'Your location is outside the map'},
}

export const t = (kljuc, ...vrednosti) => {
  const tekst = tekstovi[kljuc][jezik]
  return typeof tekst === 'function' ? tekst(...vrednosti) : tekst
}

const drzave = {
  'Bosnia and Herzegovina': 'Bosna i Hercegovina',
  Croatia: 'Hrvatska',
  Italy: 'Italija',
  Kosovo: 'Kosovo',
  Macedonia: 'Makedonija',
  Montenegro: 'Crna Gora',
  Serbia: 'Srbija',
  Slovenia: 'Slovenija',
}

export const nazivDrzave = drzava => jezik === 'sh' ? drzave[drzava] || drzava : drzava
