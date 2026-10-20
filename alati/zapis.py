"""Čitanje i upis podataka, zajedničko za sve alate.

Spomenici na mapi su u dva fajla koje aplikacija učitava redom: data/spomenici-istaknuti.json (tačno locirani spomenici
vidljivi na početnom zumu 7, pa se crtaju odmah) i data/spomenici-ostali.json. Alati rade sa celim spiskom (ucitaj_bazu),
a sacuvaj_bazu sam raspoređuje zapise; izvori oba spiska čuvaju se u data/izvori.json,
a izvori stanja u data/izvori-stanja.json, povezani ID-jem spomenika.
Provere lokacije i opstanka čuvaju se u data/provere-spomenika.json, takođe po ID-ju.
Tip polja je u data/tipovi.d.ts; novo polje se dodaje i u REDOSLED, inače ga integritet.py prijavi."""
import errno, hashlib, json, os, subprocess, tempfile, threading, time
from contextlib import contextmanager
from pathlib import Path

_repo = os.path.normcase(os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))
BRAVA_PODATAKA = os.path.join(tempfile.gettempdir(), 'spomenici-' + hashlib.sha256(_repo.encode()).hexdigest()[:20] + '.lock')
_brava_niti = threading.RLock()
_lokalno = threading.local()


@contextmanager
def zakljucani_podaci(cekaj=30):
    """Zaključaj ceo ciklus čitanje–izmena–upis; mreža i obrada slika idu pre ovog bloka.

    Brava važi za ovaj checkout i procese koji koriste ovaj alat. OS je oslobađa i pri padu procesa.
    Ugnježden poziv iste niti koristi postojeću bravu.
    """
    if not _brava_niti.acquire(timeout=cekaj):
        raise TimeoutError('Podatke menja druga nit; pokušaj ponovo sa svežim podacima.')
    try:
        if getattr(_lokalno, 'zakljucano', False):
            yield
            return
        with open(BRAVA_PODATAKA, 'a+b') as brava:
            if os.fstat(brava.fileno()).st_size == 0:
                brava.write(b'0')
                brava.flush()
            if os.name == 'nt':
                import msvcrt
                def zakljucaj():
                    brava.seek(0)
                    msvcrt.locking(brava.fileno(), msvcrt.LK_NBLCK, 1)
                def otkljucaj():
                    brava.seek(0)
                    msvcrt.locking(brava.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl
                def zakljucaj():
                    fcntl.flock(brava.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                def otkljucaj():
                    fcntl.flock(brava.fileno(), fcntl.LOCK_UN)
            kraj = time.monotonic() + cekaj
            while True:
                try:
                    zakljucaj()
                    break
                except OSError as e:
                    if e.errno not in (errno.EACCES, errno.EAGAIN, errno.EDEADLK):
                        raise
                    if time.monotonic() >= kraj:
                        raise TimeoutError('Podatke menja drugi proces; pokušaj ponovo sa svežim podacima.') from e
                    time.sleep(0.05)
            _lokalno.zakljucano = True
            try:
                yield
            finally:
                _lokalno.zakljucano = False
                otkljucaj()
    finally:
        _brava_niti.release()

REDOSLED = ['id', 'koordinate', 'priblizno', 'googleCid', 'mesto', 'izvor', 'wiki', 'wikiEn', 'clanak', 'slika', 'slikaOdnos', 'slikaPotpis',
            'naziv', 'opis', 'godina', 'autor', 'natpis', 'posveta', 'stanje',
            'vrsta', 'istaknut', 'drzava']
ISTAKNUTI, OSTALI, BEZ_LOKACIJE, IZVORI = 'data/spomenici-istaknuti.json', 'data/spomenici-ostali.json', 'data/bez_lokacije.json', 'data/izvori.json'
IZVORI_STANJA = 'data/izvori-stanja.json'
PROVERE_SPOMENIKA = 'data/provere-spomenika.json'
POLJA_PROVERE = ('proveraLokacije', 'proveraOpstanka')
ZUM_ISTAKNUTIH = 7  # pocetni zum mape (klase/mapa.js): prvi fajl ima samo ono sto se tada vidi


def _ucitaj_zumove(putanja):
    """Učitaj isti izračun kao aplikacija, nezavisno od sintakse JS konfiguracije."""
    kod = 'const {zumVrste} = await import(process.argv[1]); process.stdout.write(JSON.stringify(zumVrste));'
    rezultat = subprocess.run(['node', '--input-type=module', '--eval', kod, Path(putanja).resolve().as_uri()],
                              check=True, capture_output=True, encoding='utf-8', timeout=10)
    return json.loads(rezultat.stdout)


ZUM_VRSTE = _ucitaj_zumove(Path(__file__).resolve().parent.parent / 'utils' / 'vaznost.js')


def poredaj(zapis):
    """Polja po REDOSLED-u; nepoznata polja ostaju na kraju, da ih integritet.py prijavi umesto da nestanu."""
    return {**{k: zapis[k] for k in REDOSLED if k in zapis}, **{k: v for k, v in zapis.items() if k not in REDOSLED}}


def u_istaknutima(s):
    return not s.get('priblizno') and (s.get('istaknut') is True or ZUM_VRSTE.get(s.get('vrsta'), 99) <= ZUM_ISTAKNUTIH)


@zakljucani_podaci()
def upisi_json(putanja, podaci):
    """Zameni kompletan JSON atomarno, uz UTF-8, CRLF i uvlačenje 2.

    Spiskove spomenika na mapi aplikacija preuzima pri otvaranju, pa je u njima svaki spomenik jedan red bez razmaka:
    fajl je za četvrtinu manji, a izmena u gitu i dalje pogađa samo red jednog spomenika."""
    if isinstance(podaci, list) and os.path.abspath(putanja) in {os.path.abspath(ISTAKNUTI), os.path.abspath(OSTALI)}:
        redovi = [json.dumps(sazmi_sliku(s), ensure_ascii=False, separators=(',', ':')) for s in podaci]
        tekst = '[\r\n' + ',\r\n'.join(redovi) + ('\r\n' if redovi else '') + ']\r\n'
    else:
        tekst = json.dumps(podaci, ensure_ascii=False, indent=2).replace('\n', '\r\n') + '\r\n'
    fd, privremeni = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(putanja)), prefix='.zapis-', suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='') as f:
            f.write(tekst)
        os.replace(privremeni, putanja)
    finally:
        if os.path.exists(privremeni):
            os.unlink(privremeni)


def _ucitaj(putanja, prazno=None):
    if os.path.exists(putanja):
        with open(putanja, encoding='utf-8') as f:
            return json.load(f)
    return [] if prazno is None else prazno


# Slika na standardnoj putanji se u fajlovima mape ne upisuje: postoji kad postoji slikaOdnos, koji uvek ide uz nju.
# Ucitavanje vraca putanju, a upis je opet izostavlja (stariji oblik `true` se cita isto).
def putanja_slike(s):
    return f"slike/spomenici/{s['id']}.webp"


def rasiri_sliku(s):
    if s.get('slika') is True or ('slika' not in s and s.get('slikaOdnos')): s['slika'] = putanja_slike(s)
    return s


def sazmi_sliku(s):
    if s.get('slika') != putanja_slike(s) or not s.get('slikaOdnos'): return s
    return {k: v for k, v in s.items() if k != 'slika'}


@zakljucani_podaci()
def ucitaj_mapu(putanja):
    """Jedan od dva fajla mape, sa putanjama slika."""
    return [rasiri_sliku(s) for s in _ucitaj(putanja)]


@zakljucani_podaci()
def ucitaj_bazu():
    return ucitaj_mapu(ISTAKNUTI) + ucitaj_mapu(OSTALI)


@zakljucani_podaci()
def ucitaj_bez_lokacije():
    return _ucitaj(BEZ_LOKACIJE)


def _izdvoj_izvore(zapisi, ostali_ids):
    ids = {s['id'] for s in zapisi} | ostali_ids
    for polje, putanja in (('izvor', IZVORI), ('stanjeIzvor', IZVORI_STANJA)):
        izvori = _ucitaj(putanja, {})
        for s in zapisi:
            if polje in s:
                izvori[s['id']] = s.pop(polje)
        upisi_json(putanja, dict(sorted((i, u) for i, u in izvori.items() if i in ids)))


@zakljucani_podaci()
def sacuvaj_bazu(spomenici):
    """Upisuje spomenike u dva fajla po važnosti, a izvore u zasebne fajlove povezane ID-jem."""
    _izdvoj_izvore(spomenici, {s['id'] for s in _ucitaj(BEZ_LOKACIJE)})
    _izdvoj_provere(spomenici, {s['id'] for s in _ucitaj(BEZ_LOKACIJE)})
    spomenici = [poredaj(s) for s in spomenici]
    upisi_json(ISTAKNUTI, [s for s in spomenici if u_istaknutima(s)])
    upisi_json(OSTALI, [s for s in spomenici if not u_istaknutima(s)])


@zakljucani_podaci()
def sacuvaj_bez_lokacije(zapisi):
    _izdvoj_izvore(zapisi, {s['id'] for s in ucitaj_bazu()})
    _izdvoj_provere(zapisi, {s['id'] for s in ucitaj_bazu()})
    upisi_json(BEZ_LOKACIJE, zapisi)


def _izdvoj_provere(zapisi, ostali_ids):
    provere = _ucitaj(PROVERE_SPOMENIKA, {})
    for s in zapisi:
        for polje in POLJA_PROVERE:
            if polje in s:
                provere.setdefault(s['id'], {})[polje] = s.pop(polje)
    ids = {s['id'] for s in zapisi} | ostali_ids
    upisi_json(PROVERE_SPOMENIKA, dict(sorted((i, p) for i, p in provere.items() if i in ids)))
