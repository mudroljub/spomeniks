# python -I alati/commons_dodaj.py <spisak.json> <fajlovi.json>: dodaje spomenike sa geotagovanih fotografija na Commons-u
# spisak: [{fajl, naziv, vrsta, drzava, [id], [nazivEn], [mesto], [stanje]}] ili [{fajl, postojeci}] za fotografiju postojecem spomeniku
# bez id-a pravi ga od naslova i naziva; naslov dela grada je „Grad (deo)“
# zahtevi: imageinfo zbirno po 50, pa po jedna umanjena slika sa pauzom od 3 s
import json, math, os, re, subprocess, sys, time, unicodedata, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding='utf-8')
SPISAK, FAJLOVI = sys.argv[1:]
A = os.path.dirname(os.path.abspath(__file__))  # naselja_osm.json i zapis.py su pored alata
sys.path.insert(0, A)
from zapis import sacuvaj_bazu, ucitaj_bazu
UA = {'User-Agent': 'spomenici-wiki/1.0 (https://mudroljub.github.io/spomeniks)'}
LAT = dict(zip('абвгдђежзијклљмнњопрстћуфхцчџшѓќѕ', ['a', 'b', 'v', 'g', 'd', 'đ', 'e', 'ž', 'z', 'i', 'j', 'k', 'l', 'lj', 'm', 'n', 'nj', 'o', 'p', 'r', 's', 't', 'ć', 'u', 'f', 'h', 'c', 'č', 'dž', 'š', 'gj', 'kj', 'dz']))
def latinica(t):
    return ''.join((LAT[z.lower()].capitalize() if z.isupper() else LAT[z]) if z.lower() in LAT else z for z in t)

spisak = json.load(open(SPISAK, encoding='utf8'))
fajlovi = json.load(open(FAJLOVI, encoding='utf8'))
naselja = [(e['lat'], e['lon'], e['tags'].get('name:sr-Latn') or latinica(e['tags']['name']), e['tags']['place']) for e in json.load(open(A + '/naselja_osm.json', encoding='utf8'))['elements']
           if e.get('tags', {}).get('name') and e['tags'].get('place') in ('city', 'town', 'village', 'suburb', 'hamlet', 'neighbourhood', 'quarter')]
gradovi = [n for n in naselja if n[3] in ('city', 'town')]
dist = lambda a, b, c, e: math.hypot((a - c) * 111000, (b - e) * 111000 * math.cos(math.radians(a)))

def naslov(a, b):
    n = min(naselja, key=lambda n: dist(a, b, n[0], n[1]))
    if n[3] not in ('suburb', 'neighbourhood', 'quarter'):
        return n[2]
    g = min(gradovi, key=lambda g: dist(a, b, g[0], g[1]))
    return f'{g[2]} ({n[2]})' if dist(a, b, g[0], g[1]) < 15000 else n[2]

def slug(t):
    t = unicodedata.normalize('NFKD', latinica(t).replace('đ', 'dj').replace('Đ', 'Dj')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:50].rstrip('-')

def sacuvaj(d):
    sacuvaj_bazu([{k: v for k, v in s.items() if v is not None} for s in d])

info = {}
naslovi = [s['fajl'] for s in spisak]
for k in range(0, len(naslovi), 50):
    time.sleep(3)
    data = urllib.parse.urlencode({'action': 'query', 'titles': '|'.join(naslovi[k:k + 50]), 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|user', 'iiurlwidth': 640, 'format': 'json', 'formatversion': 2}).encode()
    for p in json.loads(urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/w/api.php', data=data, headers=UA), timeout=90).read())['query']['pages']:
        ii = p['imageinfo'][0]; m = ii['extmetadata']
        autor = re.sub(r'<[^>]+>', '', m.get('Artist', {}).get('value', '')).strip() or ii['user']
        info[p['title']] = (ii['thumburl'], f"{autor[:60]}, {m.get('LicenseShortName', {}).get('value', '')}")

d = ucitaj_bazu()
po_id = {s['id']: s for s in d}
for br, s in enumerate(spisak):
    url, potpis = info[s['fajl']]
    if not s.get('postojeci'):
        a, b = fajlovi[s['fajl']]['k']
        mesto = s.get('mesto') or naslov(a, b)
        if not s.get('id'):
            osnova, i = slug(f"{mesto} {s['naziv']}"), 2
            s['id'] = osnova
            while s['id'] in po_id:
                s['id'], i = f'{osnova}-{i}', i + 1
    cilj = s.get('postojeci') or s['id']
    putanja = f'slike/spomenici/{cilj}.webp'
    time.sleep(3)
    sirovo = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()
    subprocess.run(['magick', '-', '-resize', '400x', '-quality', '75', putanja], input=sirovo, check=True)
    if s.get('postojeci'):
        z = po_id[s['postojeci']]; z['slika'] = putanja; z['slikaPotpis'] = potpis
        print('slika', cilj, flush=True)
        continue
    z = {'id': s['id'], 'koordinate': {'lat': round(a, 7), 'lng': round(b, 7)}, 'mesto': mesto, 'izvor': 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(s['fajl'].replace(' ', '_')),
         'slika': putanja, 'slikaPotpis': potpis, 'naziv': s['naziv'], 'nazivEn': s.get('nazivEn'), 'stanje': s.get('stanje'), 'vrsta': s['vrsta'], 'drzava': s['drzava']}
    assert z['id'] not in po_id, z['id']
    d.append(z); po_id[z['id']] = z
    print('novi', z['id'], mesto, flush=True)
    if br % 25 == 24:
        sacuvaj(d)
sacuvaj(d)
