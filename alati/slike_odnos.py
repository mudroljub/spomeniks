# upisuje slikaOdnos (sirina / visina) za svaku lokalnu sliku, da prozor spomenika unapred zna oblik slike;
# i za spisak bez lokacije, cije se slike pri prebacivanju na mapu samo premestaju
# pokretanje iz korena repozitorijuma: python <putanja>/slike_odnos.py
import glob, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # zapis.py je pored alata
from zapis import zakljucani_podaci, ucitaj_bazu, sacuvaj_bazu, ucitaj_bez_lokacije, sacuvaj_bez_lokacije


# dimenzije slika se citaju pre zakljucavanja podataka
def odnosi_u(folder):
    if not glob.glob(f'{folder}/*.webp'): return {}
    izlaz = subprocess.run(['magick', 'identify', '-format', '%i %w %h\n', f'{folder}/*.webp'], capture_output=True, text=True, check=True).stdout
    odnosi = {}
    for red in izlaz.splitlines():
        putanja, w, h = red.rsplit(' ', 2)
        odnosi[putanja.replace('\\', '/')] = round(int(w) / int(h), 3)
    return odnosi


# slika koja nije lokalna (stariji zapisi sa imenom fajla na Vikipediji) ostaje kakva jeste
def upisi_odnose(zapisi, odnosi):
    promena = 0
    for s in zapisi:
        if not str(s.get('slika', '')).startswith('slike/'):
            continue
        odnos = odnosi.get(s['slika'])
        if s.get('slikaOdnos') != odnos:
            promena += 1
            s['slikaOdnos'] = odnos
        if odnos is None: s.pop('slikaOdnos', None)
    return promena


odnosi_mape, odnosi_bez = odnosi_u('slike/spomenici'), odnosi_u('slike/bez-lokacije')
with zakljucani_podaci():
    baza = ucitaj_bazu()
    print('mapa promenjeno', upisi_odnose(baza, odnosi_mape))
    sacuvaj_bazu(baza)
    bez = ucitaj_bez_lokacije()
    print('bez lokacije promenjeno', upisi_odnose(bez, odnosi_bez))
    sacuvaj_bez_lokacije(bez)
