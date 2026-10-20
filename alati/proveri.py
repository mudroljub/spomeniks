# python -I proveri.py <kratak google link>: ime, koordinate, id i najblizi spomenici u bazi
import json, math, os, re, sys, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding='utf-8')
class Bez(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
try:
    urllib.request.build_opener(Bez).open(urllib.request.Request(sys.argv[1], headers={'User-Agent': 'Mozilla/5.0'}))
    raise SystemExit('nema preusmerenja')
except urllib.error.HTTPError as e:
    u = e.headers['Location']
print(urllib.parse.unquote_plus(u.split('/place/')[1].split('/')[0]))
la, ln = map(float, re.search(r'!3d(-?[\d.]+)!4d(-?[\d.]+)', u).groups())
cid = str(int(re.search(r'!1s0x[0-9a-f]+:0x([0-9a-f]+)', u).group(1), 16))
print(la, ln, cid)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # zapis.py je pored alata
from zapis import ucitaj_bazu
d = ucitaj_bazu()
def m(a, b):
    return 6371000 * math.acos(min(1, math.sin(math.radians(la)) * math.sin(math.radians(a)) + math.cos(math.radians(la)) * math.cos(math.radians(a)) * math.cos(math.radians(b - ln))))
print('isti id:', [s['id'] for s in d if s.get('googleCid') == cid])
for s in sorted(d, key=lambda s: m(s['koordinate']['lat'], s['koordinate']['lng']))[:3]:
    print(round(m(s['koordinate']['lat'], s['koordinate']['lng'])), 'm |', s['id'], '|', s['mesto'], '|', (s.get('naziv') or {}).get('sh'), '|', s.get('vrsta'), '|', s.get('googleCid'))
