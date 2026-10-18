"""Redosled polja zapisa i upis oba spiska, zajednicki za sve alate koji pisu u data/spomeniks.json i data/bez_lokacije.json.
Tip polja je u data/tipovi.d.ts; novo polje se dodaje i ovde, inace ga alati pri upisu izbace."""
import json, os

REDOSLED = ['id', 'koordinate', 'priblizno', 'googleCid', 'mesto', 'izvor', 'wiki', 'wikiEn', 'clanak', 'slika', 'slikaOdnos', 'slikaPotpis',
            'naziv', 'nazivEn', 'godina', 'godinaOd', 'godinaDo', 'godinaOdrednica', 'autor', 'ulogeAutora', 'natpis', 'posveta', 'stanje', 'stanjeIzvor', 'vrsta', 'istaknut', 'drzava']
BAZA, BEZ_LOKACIJE, IZVORI = 'data/spomeniks.json', 'data/bez_lokacije.json', 'data/izvori.json'


def poredaj(zapis):
    """Polja po REDOSLED-u; nepoznata polja ostaju na kraju, da ih integritet.py prijavi umesto da nestanu."""
    return {**{k: zapis[k] for k in REDOSLED if k in zapis}, **{k: v for k, v in zapis.items() if k not in REDOSLED}}


def upisi_json(putanja, podaci):
    """UTF-8, CRLF i uvlacenje 2, da razlike u gitu ostanu ciste."""
    open(putanja, 'w', encoding='utf-8', newline='').write(json.dumps(podaci, ensure_ascii=False, indent=2).replace('\n', '\r\n') + '\r\n')


def sacuvaj_spisak(putanja, zapisi):
    """Upisuje bazu ili spisak bez lokacije bez polja izvor: izvor (aplikacija ga ne koristi) ide u data/izvori.json,
    ključan po ID-ju, koji je jedinstven u oba spiska; izvori obrisanih zapisa se uklanjaju."""
    izvori = json.load(open(IZVORI, encoding='utf-8')) if os.path.exists(IZVORI) else {}
    for s in zapisi:
        if 'izvor' in s:
            izvori[s['id']] = s.pop('izvor')
    drugi = BEZ_LOKACIJE if putanja == BAZA else BAZA
    ids = {s['id'] for s in zapisi} | ({s['id'] for s in json.load(open(drugi, encoding='utf-8'))} if os.path.exists(drugi) else set())
    upisi_json(IZVORI, dict(sorted((i, u) for i, u in izvori.items() if i in ids)))
    upisi_json(putanja, [poredaj(s) for s in zapisi] if putanja == BAZA else zapisi)


def sacuvaj_bazu(spomenici):
    sacuvaj_spisak(BAZA, spomenici)
