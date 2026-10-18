# upisuje slikaOdnos (sirina / visina) za svaku lokalnu sliku, da prozor spomenika unapred zna oblik slike;
# i za spisak bez lokacije, cije se slike pri prebacivanju na mapu samo premestaju
# pokretanje iz korena repozitorijuma: python <putanja>/slike_odnos.py
import glob, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # zapis.py je pored alata
from zapis import ISTAKNUTI, OSTALI, poredaj, upisi_json

# spisak bez lokacije nema stalan redosled polja, pa se ne preuredjuje; slika koja nije lokalna
# (stariji zapisi sa imenom fajla na Vikipediji) ostaje kakva jeste
SKUPOVI = [(ISTAKNUTI, 'slike/spomenici', True), (OSTALI, 'slike/spomenici', True), ('data/bez_lokacije.json', 'slike/bez-lokacije', False)]

for put, folder, preuredi in SKUPOVI:
    d = json.load(open(put, encoding='utf8'))
    izlaz = subprocess.run(['magick', 'identify', '-format', '%i %w %h\n', f'{folder}/*.webp'], capture_output=True, text=True, check=True).stdout \
        if glob.glob(f'{folder}/*.webp') else ''
    odnosi = {}
    for red in izlaz.splitlines():
        putanja, w, h = red.rsplit(' ', 2)
        odnosi[putanja.replace('\\', '/')] = round(int(w) / int(h), 3)
    promena = 0
    for i, s in enumerate(d):
        if not preuredi and not str(s.get('slika', '')).startswith('slike/'):
            continue
        odnos = odnosi.get(s.get('slika'))
        if s.get('slikaOdnos') != odnos:
            promena += 1
            s['slikaOdnos'] = odnos
        if odnos is None: s.pop('slikaOdnos', None)
        if preuredi: d[i] = poredaj(s)
    upisi_json(put, d)
    print(put, 'promenjeno', promena)
