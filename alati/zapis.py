"""Čitanje i upis podataka, zajedničko za sve alate.

Spomenici na mapi su u dva fajla koje aplikacija učitava redom: data/spomenici-istaknuti.json (tačno locirani spomenici
vidljivi na početnom zumu 7, pa se crtaju odmah) i data/spomenici-ostali.json. Alati rade sa celim spiskom (ucitaj_bazu),
a sacuvaj_bazu sam raspoređuje zapise. Fajlovi mape imaju samo ono što aplikacija treba za mapu, pretragu i filtere;
ono što se vidi samo u prozoru spomenika je u data/detalji.json, a engleski nazivi u data/prevodi-en.json (ID -> vrednost).
ucitaj_bazu ih spaja u ceo zapis, a sacuvaj_bazu ih ponovo razdvaja, pa alati uvek rade sa celim zapisom.
Izvori (data/izvori/izvori.json) i izvori stanja (data/izvori/izvori-stanja.json) su samo za alate: alat ih privremeno drži u zapisu
(izvor, stanjeIzvor), a funkcije za čuvanje ih izdvajaju.
Provere lokacije i opstanka čuvaju se u data/provere/provere-spomenika.json, takođe po ID-ju.
Arhiva (data/van-mape/arhiva.json, ucitaj_arhivu / sacuvaj_arhivu) čuva cele zapise koje aplikacija ne prikazuje, sa istim
trajnim ID-jem, izvorima i proverama; ID je jedinstven u mapi, spisku bez lokacije i arhivi zajedno.
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

REDOSLED = ['id', 'koordinate', 'priblizno', 'googleCid', 'mesto', 'izvor', 'wiki', 'wikiEn', 'slika', 'slikaOdnos', 'slikaPotpis',
            'naziv', 'nazivEn', 'opis', 'godina', 'autor', 'natpis', 'posveta', 'stanje',
            'vrsta', 'istaknut', 'drzava']
# polja za prozor spomenika, pretragu i filtere, koja ne trebaju za crtanje mape; u fajlovima mape ih nema, nego su u DETALJI
POLJA_DETALJA = ('googleCid', 'wiki', 'wikiEn', 'slikaPotpis', 'opis', 'godina', 'autor', 'natpis', 'posveta')
ISTAKNUTI, OSTALI, BEZ_LOKACIJE, IZVORI = 'data/spomenici-istaknuti.json', 'data/spomenici-ostali.json', 'data/van-mape/bez_lokacije.json', 'data/izvori/izvori.json'
ARHIVA = 'data/van-mape/arhiva.json'
IZVORI_STANJA = 'data/izvori/izvori-stanja.json'
PREVODI_EN, DETALJI = 'data/prevodi-en.json', 'data/detalji.json'
PROVERE_SPOMENIKA = 'data/provere/provere-spomenika.json'
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

    Fajlovi koje aplikacija preuzima (spiskovi mape, detalji, engleski nazivi) pišu se jedan zapis po redu, bez razmaka:
    manji su za četvrtinu, a izmena u gitu i dalje pogađa samo red jednog spomenika."""
    preuzima_aplikacija = {os.path.abspath(p) for p in (ISTAKNUTI, OSTALI, PREVODI_EN, DETALJI)}
    if isinstance(podaci, (list, dict)) and os.path.abspath(putanja) in preuzima_aplikacija:
        kratko = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
        if isinstance(podaci, list):
            redovi, zagrade = [kratko(sazmi_sliku(s)) for s in podaci], '[]'
        else:
            redovi, zagrade = [f'{kratko(k)}:{kratko(v)}' for k, v in podaci.items()], '{}'
        tekst = zagrade[0] + '\r\n' + ',\r\n'.join(redovi) + ('\r\n' if redovi else '') + zagrade[1] + '\r\n'
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
    """Jedan od dva fajla mape, sa putanjama slika, detaljima i engleskim nazivima: ceo zapis."""
    detalji, prevodi = _ucitaj(DETALJI, {}), _ucitaj(PREVODI_EN, {})
    def ceo(s):
        rasiri_sliku(s)
        s.update(detalji.get(s['id'], {}))
        if s['id'] in prevodi: s['nazivEn'] = prevodi[s['id']]
        return poredaj(s)
    return [ceo(s) for s in _ucitaj(putanja)]


@zakljucani_podaci()
def ucitaj_bazu():
    return ucitaj_mapu(ISTAKNUTI) + ucitaj_mapu(OSTALI)


@zakljucani_podaci()
def ucitaj_bez_lokacije():
    return _ucitaj(BEZ_LOKACIJE)


@zakljucani_podaci()
def ucitaj_arhivu():
    return _ucitaj(ARHIVA)


def _ids(*putanje):
    return {s['id'] for putanja in putanje for s in _ucitaj(putanja)}


# Izvori su samo za alate, pa su u zasebnim fajlovima (ID -> izvor). Putanje se citaju pri svakom pozivu,
# da izolovana proba (zamena putanja u testu) ne pise u prave podatke.
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
    """Upisuje cele zapise mape: osnovu u dva fajla po važnosti, detalje i engleske nazive u svoje fajlove, a izvore posebno."""
    ostali_ids = _ids(BEZ_LOKACIJE, ARHIVA)
    _izdvoj_izvore(spomenici, ostali_ids)
    _izdvoj_provere(spomenici, ostali_ids)
    osnove, detalji, prevodi = [], {}, {}
    for s in map(poredaj, spomenici):
        detalj = {k: s[k] for k in POLJA_DETALJA if k in s}
        if detalj: detalji[s['id']] = detalj
        if 'nazivEn' in s: prevodi[s['id']] = s['nazivEn']
        osnove.append({k: v for k, v in s.items() if k not in POLJA_DETALJA and k != 'nazivEn'})
    upisi_json(DETALJI, dict(sorted(detalji.items())))
    upisi_json(PREVODI_EN, dict(sorted(prevodi.items())))
    upisi_json(ISTAKNUTI, [s for s in osnove if u_istaknutima(s)])
    upisi_json(OSTALI, [s for s in osnove if not u_istaknutima(s)])


@zakljucani_podaci()
def sacuvaj_bez_lokacije(zapisi):
    ostali_ids = _ids(ISTAKNUTI, OSTALI, ARHIVA)
    _izdvoj_izvore(zapisi, ostali_ids)
    _izdvoj_provere(zapisi, ostali_ids)
    upisi_json(BEZ_LOKACIJE, zapisi)


@zakljucani_podaci()
def sacuvaj_arhivu(zapisi):
    ostali_ids = _ids(ISTAKNUTI, OSTALI, BEZ_LOKACIJE)
    _izdvoj_izvore(zapisi, ostali_ids)
    _izdvoj_provere(zapisi, ostali_ids)
    upisi_json(ARHIVA, [poredaj(s) for s in zapisi])


def _izdvoj_provere(zapisi, ostali_ids):
    provere = _ucitaj(PROVERE_SPOMENIKA, {})
    for s in zapisi:
        for polje in POLJA_PROVERE:
            if polje in s:
                provere.setdefault(s['id'], {})[polje] = s.pop(polje)
    ids = {s['id'] for s in zapisi} | ostali_ids
    upisi_json(PROVERE_SPOMENIKA, dict(sorted((i, p) for i, p in provere.items() if i in ids)))
