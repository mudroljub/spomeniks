# python -I alati/prebaci.py <ulaz.json>: prebacuje stavke iz data/bez_lokacije.json na mapu
# ulaz: [{"id": ..., "lat": ..., "lng": ..., "priblizno": true|false}]; stavka zadržava svoj ID, pa veze iz knjiga
# i izveštaja (cilj, radniId) ostaju tačne bez prepravke; lokalna slika prelazi u slike/spomenici/<id>.webp
import json, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # zapis.py je pored alata
from zapis import REDOSLED, poredaj, sacuvaj_bazu, sacuvaj_bez_lokacije, ucitaj_bazu, ucitaj_bez_lokacije, zakljucani_podaci

ulaz = {u['id']: u for u in json.load(open(sys.argv[1], encoding='utf-8'))}
with zakljucani_podaci():
    bez = ucitaj_bez_lokacije()
    mapa = ucitaj_bazu()
    nepoznati = set(ulaz) - {s['id'] for s in bez}
    if nepoznati:
        sys.exit(f'nema u spisku bez lokacije: {sorted(nepoznati)}')
    ostaju = []
    for s in bez:
        u = ulaz.get(s['id'])
        if not u:
            ostaju.append(s)
            continue
        # adresa i kandidati ne idu na mapu; izdvojene provere ostaju u data/provere-spomenika.json pod istim ID-jem
        z = {k: v for k, v in s.items() if k in REDOSLED}
        z['koordinate'] = {'lat': round(u['lat'], 7), 'lng': round(u['lng'], 7)}
        if u.get('priblizno'):
            z['priblizno'] = True
        if str(s.get('slika', '')).startswith('slike/bez-lokacije/'):
            nova = f"slike/spomenici/{s['id']}.webp"
            shutil.move(s['slika'], nova)
            z['slika'] = nova
        mapa.append(poredaj(z))
        print('prebaceno', s['id'])
    sacuvaj_bazu(mapa)
    sacuvaj_bez_lokacije(ostaju)
