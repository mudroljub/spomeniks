"""Čitanje i upis podataka, zajedničko za sve alate.

Spomenici na mapi su u dva fajla koje aplikacija učitava redom: data/spomenici-istaknuti.json (tačno locirani spomenici
vidljivi do zuma 9, pa se crtaju odmah) i data/spomenici-ostali.json. Alati rade sa celim spiskom (ucitaj_bazu),
a sacuvaj_bazu sam raspoređuje zapise; izvor zapisa iz oba spiska i iz spiska bez lokacije čuva se u data/izvori.json.
Tip polja je u data/tipovi.d.ts; novo polje se dodaje i u REDOSLED, inače ga integritet.py prijavi."""
import json, os, re

REDOSLED = ['id', 'koordinate', 'priblizno', 'googleCid', 'mesto', 'izvor', 'wiki', 'wikiEn', 'clanak', 'slika', 'slikaOdnos', 'slikaPotpis',
            'naziv', 'nazivEn', 'godina', 'godinaOd', 'godinaDo', 'godinaOdrednica', 'autor', 'ulogeAutora', 'natpis', 'posveta', 'stanje', 'stanjeIzvor',
            'vrsta', 'istaknut', 'drzava']
ISTAKNUTI, OSTALI, BEZ_LOKACIJE, IZVORI = 'data/spomenici-istaknuti.json', 'data/spomenici-ostali.json', 'data/bez_lokacije.json', 'data/izvori.json'
ZUM_ISTAKNUTIH = 9
# zum na kome se vrsta pojavljuje je samo u utils/vaznost.js, koji koristi i aplikacija
_vaznost = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'utils', 'vaznost.js'), encoding='utf-8').read()
ZUM_VRSTE = {k.strip("'"): int(v) for k, v in re.findall(r"('[\w-]+'|\w+):\s*(\d+)", re.search(r'zumVrste = \{([^}]*)\}', _vaznost).group(1))}


def poredaj(zapis):
    """Polja po REDOSLED-u; nepoznata polja ostaju na kraju, da ih integritet.py prijavi umesto da nestanu."""
    return {**{k: zapis[k] for k in REDOSLED if k in zapis}, **{k: v for k, v in zapis.items() if k not in REDOSLED}}


def u_istaknutima(s):
    return not s.get('priblizno') and (s.get('istaknut') is True or ZUM_VRSTE.get(s.get('vrsta'), 99) <= ZUM_ISTAKNUTIH)


def upisi_json(putanja, podaci):
    """UTF-8, CRLF i uvlačenje 2, da razlike u gitu ostanu čiste."""
    open(putanja, 'w', encoding='utf-8', newline='').write(json.dumps(podaci, ensure_ascii=False, indent=2).replace('\n', '\r\n') + '\r\n')


def _ucitaj(putanja):
    return json.load(open(putanja, encoding='utf-8')) if os.path.exists(putanja) else []


def ucitaj_bazu():
    return _ucitaj(ISTAKNUTI) + _ucitaj(OSTALI)


def _izdvoj_izvore(zapisi, ostali_ids):
    izvori = json.load(open(IZVORI, encoding='utf-8')) if os.path.exists(IZVORI) else {}
    for s in zapisi:
        if 'izvor' in s:
            izvori[s['id']] = s.pop('izvor')
    ids = {s['id'] for s in zapisi} | ostali_ids
    upisi_json(IZVORI, dict(sorted((i, u) for i, u in izvori.items() if i in ids)))


def sacuvaj_bazu(spomenici):
    """Upisuje spomenike na mapi u dva fajla po važnosti, bez polja izvor (ono ide u data/izvori.json)."""
    _izdvoj_izvore(spomenici, {s['id'] for s in _ucitaj(BEZ_LOKACIJE)})
    spomenici = [poredaj(s) for s in spomenici]
    upisi_json(ISTAKNUTI, [s for s in spomenici if u_istaknutima(s)])
    upisi_json(OSTALI, [s for s in spomenici if not u_istaknutima(s)])


def sacuvaj_bez_lokacije(zapisi):
    _izdvoj_izvore(zapisi, {s['id'] for s in ucitaj_bazu()})
    upisi_json(BEZ_LOKACIJE, zapisi)
