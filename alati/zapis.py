"""Redosled polja zapisa u data/spomeniks.json, zajednicki za sve alate koji pisu u fajl.
Tip polja je u data/tipovi.d.ts; novo polje se dodaje i ovde, inace ga alati pri upisu izbace."""

REDOSLED = ['id', 'koordinate', 'priblizno', 'googleCid', 'mesto', 'izvor', 'wiki', 'wikiEn', 'clanak', 'slika', 'slikaOdnos', 'slikaPotpis',
            'naziv', 'nazivEn', 'godina', 'autor', 'natpis', 'posveta', 'stanje', 'stanjeIzvor', 'vrsta', 'istaknut', 'drzava']


def poredaj(zapis):
    """Polja po REDOSLED-u; nepoznata polja ostaju na kraju, da ih integritet.py prijavi umesto da nestanu."""
    return {**{k: zapis[k] for k in REDOSLED if k in zapis}, **{k: v for k, v in zapis.items() if k not in REDOSLED}}
