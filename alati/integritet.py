import json, math, os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # zapis.py je pored alata
from zapis import REDOSLED
sys.stdout.reconfigure(encoding='utf-8')
d = json.load(open('data/spomeniks.json', encoding='utf8'))
ture = json.load(open('data/ture.json', encoding='utf8'))
autori = json.load(open('data/autori.json', encoding='utf8'))
posvete = json.load(open('data/posvete.json', encoding='utf8'))
greske = collections.defaultdict(list)
VRSTE = {'istaknut', 'kompleks', 'spomenik', 'statua', 'bista', 'lokalni', 'ploca', 'groblje', 'muzej'}
STANJA = {'rusevine', 'srusen', 'uklonjen', 'ostecen', 'zatvoren'}
DRZAVE = {'Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Serbia', 'Montenegro', 'Macedonia', 'Kosovo', 'Italy'}
POZNATA = set(REDOSLED)
# Ranije proverene celine i pojedinacna obelezja na istoj lokaciji.
POZNATI_BLISKI_PAROVI = {frozenset(par) for par in [
    ('nis', 'nis-spomen-park-bubanj'),
    ('sisak', 'sisak-spomen-park-brezovica'),
    ('dotrscina', 'zagreb-spomen-park-dotrscina'),
    ('bela-crkva-start-uprising', 'bela-crkva-spomenicki-kompleks'),
    ('aleksinac', 'aleksinac-spomen-park-nob'),
    ('sibenik', 'sibenik-spomen-park-subicevac'),
    ('zabalj', 'zabalj-spomen-kompleks-crna-cuprija'),
    ('october-21st-museum', 'kragujevac-spomenik-covek-bez-iluzija'),
    ('rudo', 'museum-to-1st-prolet-brigade'),
    ('koprivnica', 'koprivnica-spomen-podrucje-danica'),
    ('koprivnica', 'koprivnica-izvidnica'),
    ('koprivnica-spomen-podrucje-danica', 'koprivnica-izvidnica'),
    ('pula-istrian-uprising', 'pula-biste-narodnih-heroja'),
    ('foca', 'musem-of-old-herzegovina'),
    ('donja-trnova', 'donja-trnova-spomen-groblje'),
    ('gajevci', 'gajevci-2'),
    ('alaginci-spomen-ploca-zrtvama-fasizma-na-senjaku', 'pozega-senjak-spomen-grobnica-logorasa'),
    ('budva-mitrovic', 'sveti-stefan-bista-nika-andusa'),
    ('mojkovac-bista-ljubomira-bakoca', 'mojkovac-spomenik-palim-borcima-u-nor-u'),
]}
cir = re.compile('[Ѐ-ӿ]')
ids = collections.Counter(s.get('id') for s in d)
for i, n in ids.items():
    if n > 1: greske['isti id'].append(i)
for s in d:
    i = s.get('id')
    if not i or not re.fullmatch(r'[a-z0-9-]+', i): greske['los id'].append(i)
    k = s.get('koordinate') or {}
    if not isinstance(k.get('lat'), (int, float)) or not isinstance(k.get('lng'), (int, float)): greske['koordinate'].append(i)
    elif not (39 <= k['lat'] <= 47.5 and 13 <= k['lng'] <= 23.5) and s.get('drzava') != 'Italy': greske['van mape'].append((i, k))
    if not s.get('mesto'): greske['bez mesta'].append(i)
    if not s.get('naziv'): greske['bez naziva'].append(i)
    if s.get('vrsta') not in VRSTE: greske['nepoznata vrsta'].append((i, s.get('vrsta')))
    if 'stanje' in s and s['stanje'] not in STANJA: greske['nepoznato stanje'].append((i, s['stanje']))
    if s.get('drzava') not in DRZAVE: greske['nepoznata drzava'].append((i, s.get('drzava')))
    if set(s) - POZNATA: greske['nepoznato polje'].append((i, set(s) - POZNATA))
    for polje, v in s.items():
        if isinstance(v, str) and (not v.strip() or v != v.strip()): greske['prazno ili razmak'].append((i, polje, v))
    if s.get('slika'):
        if s['slika'].startswith('slike/') and not os.path.exists(s['slika']): greske['nema slike'].append((i, s['slika']))
        mala = s['slika'].replace('slike/spomenici/', 'slike/male/')
        if mala != s['slika'] and not os.path.exists(mala): greske['nema male slike (pokreni male_slike.py)'].append((i, mala))
    if s.get('slikaPotpis') and not s.get('slika'): greske['potpis bez slike'].append(i)
    if bool(s.get('slika')) != bool(s.get('slikaOdnos')): greske['slika bez odnosa (pokreni slike_odnos.py)'].append(i)
    for polje in ('izvor', 'wiki', 'wikiEn'):
        if s.get(polje) and not re.match(r'https?://', s[polje]): greske['los link'].append((i, polje, s[polje]))
    if 'stanjeIzvor' in s:
        izvor_stanja = s['stanjeIzvor']
        if (not s.get('stanje') or not isinstance(izvor_stanja, dict)
                or set(izvor_stanja) != {'naziv', 'godina', 'url'}
                or not isinstance(izvor_stanja.get('naziv'), str) or not izvor_stanja['naziv'].strip()
                or type(izvor_stanja.get('godina')) is not int or not 1900 <= izvor_stanja['godina'] <= 2100
                or not isinstance(izvor_stanja.get('url'), str) or not re.match(r'https?://', izvor_stanja['url'])):
            greske['neispravan izvor stanja'].append(i)
    if s.get('googleCid') and not re.fullmatch(r'\d+', str(s['googleCid'])): greske['los googleCid'].append((i, s['googleCid']))
    if s.get('godina') and not re.fullmatch(r'\d{4}(\s*[-–/]\s*\d{2,4})?|(pre|posle|oko) \d{4}|\d{3}0-ih', str(s['godina'])): greske['cudna godina'].append((i, s['godina']))
    n = s.get('naziv') or ''
    if n and s.get('drzava') != 'Macedonia' and cir.search(n): greske['cirilica van Makedonije'].append((i, n))
    if n and s.get('drzava') == 'Macedonia' and not cir.search(n): greske['latinica u Makedoniji'].append((i, n))
    if 'posveta' in s and (not s['posveta'] or not all(q in posvete for q in s['posveta'])): greske['posveta van posvete.json'].append((i, s['posveta']))
# isto mesto dvaput
def m(a, b):
    return 6371000 * math.acos(min(1, math.sin(math.radians(a['lat'])) * math.sin(math.radians(b['lat'])) + math.cos(math.radians(a['lat'])) * math.cos(math.radians(b['lat'])) * math.cos(math.radians(b['lng'] - a['lng']))))
for x in range(len(d)):
    for y in range(x + 1, len(d)):
        a, b = d[x]['koordinate'], d[y]['koordinate']
        if abs(a['lat'] - b['lat']) < 0.0005 and abs(a['lng'] - b['lng']) < 0.0007 and m(a, b) < 30:
            greske['manje od 30 m'].append((d[x]['id'], d[y]['id'], round(m(a, b))))
svi = set(ids)
for t in ture:
    for i in t['spomenici']:
        if i not in svi: greske['tura bez spomenika'].append((t['naziv'], i))
slike = {f'slike/spomenici/{f}' for f in os.listdir('slike/spomenici')}
koriscene = {s.get('slika') for s in d}
greske['slika koju niko ne koristi'] = sorted(slike - koriscene)
for k, v in greske.items():
    if v: print(f'{k}: {len(v)}', v[:8])
print('spomenika', len(d))
novi_bliski = [par for par in greske['manje od 30 m'] if frozenset(par[:2]) not in POZNATI_BLISKI_PAROVI]
if novi_bliski:
    print(f'novi parovi manje od 30 m: {len(novi_bliski)}', novi_bliski[:8])
sys.exit(1 if novi_bliski or any(v for k, v in greske.items() if k != 'manje od 30 m') else 0)
