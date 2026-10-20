# python -I alati/dodaj_google.py <vrsta> <link> <naziv> [<link> <naziv> ...]
# dodaje nove spomenike sa Google mapa: Google id, tacna lokacija i najblize naselje kao naslov
# slug, latinica i mesto mogu da se uvezu iz drugih alata; u bazu upisuje samo pokretanje
import json, math, os, re, sys, time, unicodedata, urllib.error, urllib.request
A = os.path.dirname(os.path.abspath(__file__))  # naselja_osm.json je pored alata
DRZAVE = {'SI': 'Slovenia', 'HR': 'Croatia', 'BA': 'Bosnia and Herzegovina', 'RS': 'Serbia', 'ME': 'Montenegro', 'MK': 'Macedonia', 'XK': 'Kosovo'}
SLOVA = dict(zip('абвгдђежзијклљмнњопрстћуфхцчџш', ['a','b','v','g','d','đ','e','ž','z','i','j','k','l','lj','m','n','nj','o','p','r','s','t','ć','u','f','h','c','č','dž','š']))
def latinica(t):
    return ''.join((SLOVA.get(c.lower(), c).capitalize() if c.isupper() else SLOVA.get(c, c)) for c in t)
def slug(t):
    t = unicodedata.normalize('NFKD', latinica(t).replace('đ', 'dj').replace('Đ', 'Dj'))
    return re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in t if not unicodedata.combining(c)).lower()).strip('-')[:50].rstrip('-')
def m(a, b, c, e):
    return 6371000 * math.acos(min(1, math.sin(math.radians(a)) * math.sin(math.radians(c)) + math.cos(math.radians(a)) * math.cos(math.radians(c)) * math.cos(math.radians(e - b))))
naselja, drzava = [], None
for x in reversed(json.load(open(f'{A}/naselja_osm.json', encoding='utf8'))['elements']):
    if x['type'] == 'granica':
        drzava = x['tags']['drzava']
    else:
        naselja.append({**x, 'drzava': drzava})
def mesto(lat, lng):
    blize = sorted(naselja, key=lambda n: m(lat, lng, n['lat'], n['lon']))
    grad = next((n for n in blize if n['tags']['place'] == 'city' and m(lat, lng, n['lat'], n['lon']) < 12000), None) \
        or next(n for n in blize if n['tags']['place'] in ('city', 'town', 'village'))
    return grad['tags'].get('name:sr-Latn') or latinica(grad['tags']['name']), DRZAVE[grad['drzava']]
class Bez(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None
def razresi(url):
    try:
        urllib.request.build_opener(Bez).open(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}))
    except urllib.error.HTTPError as e:
        return e.headers['Location']

if __name__ == '__main__':
    sys.path.insert(0, A)
    from zapis import sacuvaj_bazu, ucitaj_bazu
    sys.stdout.reconfigure(encoding='utf-8')
    vrsta = sys.argv[1]
    parovi = list(zip(sys.argv[2::2], sys.argv[3::2]))
    d = ucitaj_bazu()
    postojeci = {s['id'] for s in d}
    cidovi = {s.get('googleCid') for s in d}
    for link, naziv in parovi:
        u = razresi(link)
        time.sleep(8)  # pauza za Google mape iz pravila zetve
        lat, lng = map(float, re.search(r'!3d(-?[\d.]+)!4d(-?[\d.]+)', u).groups())
        cid = str(int(re.search(r'!1s0x[0-9a-f]+:0x([0-9a-f]+)', u).group(1), 16))
        # isti link dvaput u jednoj turi ne sme da napravi dva spomenika
        assert cid not in cidovi, (naziv, cid)
        cidovi.add(cid)
        naslov, zemlja = mesto(lat, lng)
        osnova = sid = slug(f'{naslov}-{naziv}')
        k = 2
        while sid in postojeci:
            sid, k = f'{osnova}-{k}', k + 1
        postojeci.add(sid)
        d.append({'id': sid, 'koordinate': {'lat': lat, 'lng': lng}, 'googleCid': cid, 'mesto': naslov, 'naziv': naziv, 'vrsta': vrsta, 'drzava': zemlja})
        print(sid, '|', naslov, '|', naziv)
    sacuvaj_bazu(d)
    print('ukupno', len(d))
