import json, math, os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # zapis.py je pored alata
from zapis import REDOSLED, ISTAKNUTI, OSTALI, IZVORI_STANJA, PROVERE_SPOMENIKA, POLJA_PROVERE, u_istaknutima, ucitaj_arhivu, ucitaj_mapu
sys.stdout.reconfigure(encoding='utf-8')
istaknuti, ostali = (ucitaj_mapu(f) for f in (ISTAKNUTI, OSTALI))
d = istaknuti + ostali
ture = json.load(open('data/ture.json', encoding='utf8'))
autori = json.load(open('data/autori.json', encoding='utf8'))
posvete = json.load(open('data/posvete.json', encoding='utf8'))
greske = collections.defaultdict(list)
VRSTE = {'spomen-park', 'spomenik', 'statua', 'bista', 'spomen-kuca', 'spomen-obelezje', 'spomen-ploca', 'groblje', 'spomen-groblje', 'muzej'}
STANJA = {'rusevine', 'srusen', 'uklonjen', 'ostecen', 'zatvoren'}
DRZAVE = {'Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Serbia', 'Montenegro', 'Macedonia', 'Kosovo', 'Italy'}
POZNATA = set(REDOSLED)
# Ranije proverene celine i pojedinacna obelezja na istoj lokaciji.
POZNATI_BLISKI_PAROVI = {frozenset(par) for par in [
    ('nis', 'nis-spomen-park-bubanj'),
    ('senturska-gora-grob-franca-dobovska', 'senturska-gora-druzinski-grob-avzvakarjevih'),
    ('senturska-gora-grob-franca-dobovska', 'senturska-gora-grob-franca-anzica'),
    ('senturska-gora-druzinski-grob-avzvakarjevih', 'senturska-gora-grob-franca-anzica'),
    ('veliko-mlacevo-grob-bratov-miklic', 'veliko-mlacevo-grob-jozeta-polajnarja'),
    ('sisak', 'sisak-spomen-park-brezovica'),
    ('dotrscina', 'zagreb-spomen-park-dotrscina'),
    ('bela-crkva-start-uprising', 'bela-crkva-spomenicki-kompleks'),
    # Kameni buket i Gržetićeve majke i kćeri: različita dela, potvrđena fotografijama i autorskom arhivom.
    ('topola', 'topola-skulpturalna-kompozicija-isklesana-u-belom'),
    ('aleksinac', 'aleksinac-spomen-park-nob'),
    ('sibenik', 'sibenik-spomen-park-subicevac'),
    ('banja-luka-spomenik-palim-borcima', 'banja-luka-bista-kasim-hadzic'),
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
    ('jajce', 'jajce-lokomotiva-partizanka'),
    # Dolinarova statua i zasebno memorijalizovane rusevine bolnice, proverene fotografije.
    ('prijepolje', 'prijepolje-rusevine-partizanske-bolnice'),
    ('cadjavica-donja-spomenik-preko-200-boraca-poginuli', 'cadjavica-donja-partizansko-groblje'),
    # biste na groblju, kod spomenika ili skole imaju tacku tog objekta
    ('verici', 'verici-bista-branka-popovica'),
    ('donji-drezanj-bista-obrena-ivkovica', 'donji-drezanj-partizansko-groblje'),
    ('donji-vijacani', 'donji-vijacani-bista-novaka-pivasevica'),
    ('donji-vijacani', 'donji-vijacani-bista-vida-njezica'),
    ('donji-vijacani', 'donji-vijacani-bista-zivojina-preradovica'),
    ('donji-vijacani-bista-novaka-pivasevica', 'donji-vijacani-bista-vida-njezica'),
    ('donji-vijacani-bista-novaka-pivasevica', 'donji-vijacani-bista-zivojina-preradovica'),
    ('donji-vijacani-bista-vida-njezica', 'donji-vijacani-bista-zivojina-preradovica'),
    ('strojice-bista-rade-marijanca', 'strojice-groblje-sa-16-partizanskih-boraca-i-165-z'),
    ('strojice-bista-dusana-rakite', 'strojice-groblje-sa-16-partizanskih-boraca-i-165-z'),
    ('strojice-bista-dusana-rakite', 'strojice-bista-rade-marijanca'),
    ('orasje-bista-cedomira-mikica', 'orasje-spomenik-palim-borcima'),
    ('pazin-bista-joakima-rakovca', 'pazin-bista-save-vukelica'),
    ('modrica-spomen-kosturnica-partizanskih-boraca', 'modrica-spomenik-oslobodiocima-modrice-1943-godine'),
    ('lunovo-selo-spomen-cesma', 'lunovo-selo-spomenik-nb'),
    ('prvic-sepurine-spomenik-minerima', 'prvic-sepurine-spomenik-palim-borcima-i-zrtvama-fa'),
    ('prvic-sepurine-spomenik-minerima', 'prvic-sepurine-bista-frane-kursara'),
    ('prvic-sepurine-spomenik-palim-borcima-i-zrtvama-fa', 'prvic-sepurine-bista-frane-kursara'),
    ('jasenovac-museum', 'jasenovac-mrtvi-logoras'),
    ('maoca-spomenik-na-mjestu-smrti-arifa-dervisevica', 'maoca-spomenik-zarobljavanju-768-pripadnika-divizi'),
    ('srpski-krstur-spomenik-palim-borcima', 'srpski-krstur-spomenik-palim-crvenoarmejcima'),
    ('drinjaca-spomen-kosturnica', 'drinjaca-spomen-dom-drugog-majevickog-udarnog-bata'),
    ('plane-spomen-dom', 'plane-spomenik-palim-borcima-nor-a'),
    # Zasebne skulpture potvrđene fotografijama i OSM-om u žetvi Hronologije 18.10.2026.
    ('bajina-basta', 'bajina-basta-spomenik-palim-borcima'),
    ('uzice-national-museum', 'uzice-spomenik-poginulima-u-fabrici-oruzja'),
    ('museum-of-july-4th', 'beograd-poziv-na-ustanak'),
    # Bista i zaseban obelisk, oba vidljiva na Commons fotografiji Spomen park Bistrica.jpg.
    ('bistrica-bista-lepe-radic', 'bistrica-spomenik-palim-borcima-i-zrtvama-fasistic'),
    # Bista (tačka Sketchfab modela ZZSK) i skulptura devojčice sa lanetom (približna tačka iz Partisan Memorials Wiki), gradski park.
    ('leskovac-spomenik-pionirima', 'leskovac-bista-stojana-ljubica'),
    # Zasebne biste narodnih heroja na Trgu cara Uroša u Somboru, svaka sa imenovanom OSM tačkom.
    ('sombor-bista-kamenka-gagrcina', 'sombor-bista-vere-vrebalov'),
    ('sombor-bista-vere-vrebalov', 'sombor-bista-ivana-parcetica'),
    ('sombor-bista-ernea-kisa', 'sombor-bista-vujadina-sekulica-baneta'),
    ('bela-crkva-start-uprising', 'bela-crkva-bista-mise-pantica'),
    ('bela-crkva-start-uprising', 'bela-crkva-bista-cede-milosavljevica'),
    ('bela-crkva-spomenicki-kompleks', 'bela-crkva-bista-mise-pantica'),
    ('bela-crkva-spomenicki-kompleks', 'bela-crkva-bista-cede-milosavljevica'),
    ('bela-crkva-bista-zikice-jovanovica', 'bela-crkva-bista-mise-pantica'),
    ('bela-crkva-bista-zikice-jovanovica', 'bela-crkva-bista-cede-milosavljevica'),
    ('bela-crkva-bista-mise-pantica', 'bela-crkva-bista-cede-milosavljevica'),
    ('bela-crkva-start-uprising', 'bela-crkva-muzej-7-juli-1941'),
    ('bela-crkva-spomenicki-kompleks', 'bela-crkva-muzej-7-juli-1941'),
    ('bela-crkva-bista-zikice-jovanovica', 'bela-crkva-muzej-7-juli-1941'),
    ('bela-crkva-bista-mise-pantica', 'bela-crkva-muzej-7-juli-1941'),
    ('bela-crkva-bista-cede-milosavljevica', 'bela-crkva-muzej-7-juli-1941'),
]}
cir = re.compile('[Ѐ-ӿ]')


def prevod_u_redu(p):
    """{sh, en?}: neprazni tekstovi bez razmaka na krajevima; en samo kad se razlikuje od sh."""
    return (isinstance(p, dict) and 'sh' in p and set(p) <= {'sh', 'en'} and p.get('en') != p['sh']
            and all(isinstance(v, str) and v.strip() and v == v.strip() for v in p.values()))


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
    if not isinstance(s.get('naziv'), str) or not s['naziv']: greske['bez naziva'].append((i, s.get('naziv')))
    if s.get('vrsta') not in VRSTE: greske['nepoznata vrsta'].append((i, s.get('vrsta')))
    if 'istaknut' in s and type(s['istaknut']) is not bool: greske['neispravno istaknut'].append(i)
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
    if 'izvor' in s: greske['izvor u bazi (pripada data/izvori/izvori.json)'].append(i)
    for polje in ('wiki', 'wikiEn'):
        if polje in s and (not isinstance(s[polje], str) or not re.match(r'https?://', s[polje])): greske['los link'].append((i, polje, s[polje]))
    if s.get('googleCid') and not re.fullmatch(r'\d+', str(s['googleCid'])): greske['los googleCid'].append((i, s['googleCid']))
    if s.get('godina') and not re.fullmatch(r'\d{4}(\s*[-–/]\s*\d{2,4})?|(pre|posle|oko) \d{4}|\d{3}0-ih', str(s['godina'])): greske['cudna godina'].append((i, s['godina']))
    if 'priblizno' in s and s['priblizno'] is not True: greske['priblizno nije true'].append((i, s['priblizno']))
    if 'nazivEn' in s and (not isinstance(s['nazivEn'], str) or not s['nazivEn'] or s['nazivEn'] == s.get('naziv')):
        greske['los engleski naziv'].append((i, s['nazivEn']))
    if 'opis' in s and not (prevod_u_redu(s['opis']) and 'en' in s['opis']): greske['opis nije {sh, en}'].append((i, s['opis']))
    elif 'opis' in s and isinstance(s.get('posveta'), str): greske['opis i tekstualna posveta (spoji posvetu u opis)'].append(i)
    elif 'opis' in s:
        veze = [set(re.findall(r'\]\((Q\d+)\)', s['opis'][j])) for j in ('sh', 'en')]
        if veze[0] != veze[1] or not veze[0] <= set(s.get('posveta') or []): greske['opis: link van posvete ili razlicit po jeziku'].append((i, veze))
    n = s['naziv'] if isinstance(s.get('naziv'), str) else ''
    if n and s.get('drzava') != 'Macedonia' and cir.search(n): greske['cirilica van Makedonije'].append((i, n))
    if n and s.get('drzava') == 'Macedonia' and not cir.search(n): greske['latinica u Makedoniji'].append((i, n))
    if 'posveta' in s:
        posveta = s['posveta']
        if isinstance(posveta, str):
            if not posveta.strip(): greske['prazna posveta'].append(i)
        elif isinstance(posveta, list):
            if not posveta or not all(isinstance(q, str) and q in posvete for q in posveta):
                greske['posveta van posvete.json'].append((i, posveta))
        else:
            greske['neispravan oblik posvete'].append((i, posveta))
for q, p in posvete.items():
    if not isinstance(p, dict) or not prevod_u_redu(p.get('naziv')): greske['posveta: naziv nije {sh, en}'].append(q)
# isto mesto dvaput; priblizne tacke (centar sela) namerno dele isto mesto
def m(a, b):
    return 6371000 * math.acos(min(1, math.sin(math.radians(a['lat'])) * math.sin(math.radians(b['lat'])) + math.cos(math.radians(a['lat'])) * math.cos(math.radians(b['lat'])) * math.cos(math.radians(b['lng'] - a['lng']))))
# mreza celija velicine praga: bliski par je u istoj ili susednoj celiji, pa se ne porede svi sa svima
celije = collections.defaultdict(list)
for i, s in enumerate(d):
    if not s.get('priblizno'):
        celije[(math.floor(s['koordinate']['lat'] / 0.0005), math.floor(s['koordinate']['lng'] / 0.0007))].append(i)
parovi = set()
for (red, kolona), clanovi in celije.items():
    for susedi in (celije.get((red + dr, kolona + dk), ()) for dr in (-1, 0, 1) for dk in (-1, 0, 1)):
        parovi.update((x, y) for x in clanovi for y in susedi if x < y)
for x, y in sorted(parovi):
    a, b = d[x]['koordinate'], d[y]['koordinate']
    if abs(a['lat'] - b['lat']) < 0.0005 and abs(a['lng'] - b['lng']) < 0.0007 and m(a, b) < 30:
        greske['manje od 30 m'].append((d[x]['id'], d[y]['id'], round(m(a, b))))
for t in ture:
    oblast = t.get('oblast', {})
    drzave_ture = oblast.get('drzave')
    if not t.get('id') or not isinstance(drzave_ture, list) or not drzave_ture or not all(x in DRZAVE for x in drzave_ture):
        greske['tura bez oblasti'].append(t.get('naziv'))
    if 'spomenici' in t: greske['tura sa rucnim stanicama'].append(t.get('naziv'))
    if t.get('prag', 'istaknut') != 'istaknut': greske['tura: los prag'].append(t.get('naziv'))
    if t.get('grupa', 'Vojvodina') != 'Vojvodina': greske['tura: losa grupa'].append(t.get('naziv'))
    mesta_ture = oblast.get('mesta')
    if mesta_ture is not None and (not isinstance(mesta_ture, list) or not mesta_ture or not all(isinstance(x, str) and x.strip() for x in mesta_ture)):
        greske['tura: los spisak mesta'].append(t.get('naziv'))
    granice = oblast.get('granice')
    if granice is not None and (not isinstance(granice, list) or len(granice) != 4 or not all(isinstance(x, (int, float)) for x in granice)
                               or not (39 <= granice[0] < granice[2] <= 47.5 and 13 <= granice[1] < granice[3] <= 23.5)):
        greske['tura: lose granice'].append(t.get('naziv'))
    putanja = oblast.get('putanja')
    if putanja is not None and (not isinstance(putanja, list) or len(putanja) < 2 or not all(isinstance(p, list) and len(p) == 2
        and all(isinstance(x, (int, float)) for x in p) and 39 <= p[0] <= 47.5 and 13 <= p[1] <= 23.5 for p in putanja)
        or not isinstance(oblast.get('sirinaKm'), (int, float)) or oblast['sirinaKm'] <= 0):
        greske['tura: los koridor'].append(t.get('naziv'))
    poligon = oblast.get('poligon')
    if poligon is not None and (not isinstance(poligon, list) or len(poligon) < 3 or not all(isinstance(p, list) and len(p) == 2
        and all(isinstance(x, (int, float)) for x in p) and 39 <= p[0] <= 47.5 and 13 <= p[1] <= 23.5 for p in poligon)):
        greske['tura: los poligon'].append(t.get('naziv'))
for id, broj in collections.Counter(t.get('id') for t in ture).items():
    if broj > 1: greske['isti id ture'].append(id)
slike = {f'slike/spomenici/{f}' for f in os.listdir('slike/spomenici')}
koriscene = {s.get('slika') for s in d}
greske['slika koju niko ne koristi'] = sorted(slike - koriscene)

# spisak bez lokacije: obavezna polja i lokalne slike; starije stavke imaju samo ime fajla na Vikipediji
bez = json.load(open('data/van-mape/bez_lokacije.json', encoding='utf8'))
# ID stavke bez lokacije je trajan i ostaje isti kad stavka pređe na mapu, pa mora biti jedinstven u oba spiska
bez_ids = collections.Counter(s.get('id') for s in bez)
for i, n in bez_ids.items():
    if not i: greske['bez lokacije: bez id'].append(n)
    elif n > 1 or i in ids: greske['bez lokacije: isti id'].append(i)
arhiva = ucitaj_arhivu()
arhiva_ids = collections.Counter(s.get('id') for s in arhiva)
for i, n in arhiva_ids.items():
    if not i: greske['arhiva: bez id'].append(n)
    elif n > 1 or i in ids or i in bez_ids: greske['arhiva: isti id'].append(i)
for s in arhiva:
    oznaka = (s.get('id'), s.get('naziv'), s.get('mesto'))
    if not isinstance(s.get('naziv'), str) or not s['naziv'] or not s.get('mesto'): greske['arhiva: bez naziva ili mesta'].append(oznaka)
    if s.get('vrsta') not in VRSTE: greske['arhiva: nepoznata vrsta'].append((oznaka, s.get('vrsta')))
    if s.get('drzava') not in DRZAVE: greske['arhiva: nepoznata drzava'].append((oznaka, s.get('drzava')))
    if s.get('stanje') not in STANJA: greske['arhiva: bez poznatog stanja'].append((oznaka, s.get('stanje')))
    if {'izvor', 'stanjeIzvor', *POLJA_PROVERE} & set(s): greske['arhiva: izdvojeni podaci u zapisu (sacuvaj_arhivu)'].append(oznaka)
    k = s.get('koordinate')
    if k is not None and not (isinstance(k.get('lat'), (int, float)) and isinstance(k.get('lng'), (int, float))): greske['arhiva: koordinate'].append(oznaka)
    if str(s.get('slika', '')).startswith('slike/') and not os.path.exists(s['slika']): greske['arhiva: nema slike'].append((oznaka, s['slika']))
svi_ids = set(ids) | set(bez_ids) | set(arhiva_ids)
zapisi_po_id = {s['id']: s for s in d + bez + arhiva if 'id' in s}
for i, provere in json.load(open(PROVERE_SPOMENIKA, encoding='utf8')).items():
    if (i not in svi_ids or not isinstance(provere, dict) or not provere
            or set(provere) - set(POLJA_PROVERE)):
        greske['neispravne izdvojene provere'].append(i)
        continue
    for polje, provera in provere.items():
        obavezna = ({'datum', 'izvor', 'ishod'} if polje == 'proveraLokacije'
                    else {'datum', 'prethodniId', 'ishod', 'razlog', 'izvestaj'})
        if (not isinstance(provera, dict) or not obavezna.issubset(provera)
                or not all(isinstance(v, str) and v.strip() for v in provera.values())):
            greske['neispravna izdvojena provera'].append((i, polje))
for i, izvor_stanja in json.load(open(IZVORI_STANJA, encoding='utf8')).items():
    if (i not in svi_ids or not zapisi_po_id[i].get('stanje') or not isinstance(izvor_stanja, dict)
            or set(izvor_stanja) != {'naziv', 'godina', 'url'}
            or not isinstance(izvor_stanja.get('naziv'), str) or not izvor_stanja['naziv'].strip()
            or type(izvor_stanja.get('godina')) is not int or not 1900 <= izvor_stanja['godina'] <= 2100
            or not isinstance(izvor_stanja.get('url'), str) or not re.match(r'https?://', izvor_stanja['url'])):
        greske['neispravan izvor stanja'].append(i)
for j, s in enumerate(bez):
    oznaka = (s.get('id'), s.get('naziv'), s.get('mesto'))
    if not isinstance(s.get('naziv'), str) or not s['naziv'] or not s.get('mesto'): greske['bez lokacije: bez naziva ili mesta'].append(oznaka)
    if 'izvor' in s: greske['izvor u spisku bez lokacije (pripada data/izvori/izvori.json)'].append(oznaka)
    if 'stanjeIzvor' in s: greske['izvor stanja u spisku bez lokacije (pripada data/izvori/izvori-stanja.json)'].append(oznaka)
    if any(polje in s for polje in POLJA_PROVERE): greske['provere u spisku bez lokacije (pripada data/provere/provere-spomenika.json)'].append(oznaka)
    if s.get('vrsta') not in VRSTE: greske['bez lokacije: nepoznata vrsta'].append((oznaka, s.get('vrsta')))
    if 'istaknut' in s and type(s['istaknut']) is not bool: greske['bez lokacije: neispravno istaknut'].append(oznaka)
    if s.get('drzava') not in DRZAVE: greske['bez lokacije: nepoznata drzava'].append((oznaka, s.get('drzava')))
    if 'stanje' in s and s['stanje'] not in STANJA: greske['bez lokacije: nepoznato stanje'].append((oznaka, s['stanje']))
    if str(s.get('slika', '')).startswith('slike/'):
        if not os.path.exists(s['slika']): greske['bez lokacije: nema slike'].append((oznaka, s['slika']))
        if not s.get('slikaPotpis') or not s.get('slikaOdnos'): greske['bez lokacije: slika bez potpisa ili odnosa'].append(oznaka)
    for kand in s.get('kandidati', []):
        if not isinstance(kand.get('lat'), (int, float)) or not isinstance(kand.get('lng'), (int, float)) or not kand.get('izvor'):
            greske['bez lokacije: los kandidat'].append(oznaka)
# veze knjiga (cilj) i radni pokazivaci izvestaja (radniId) pokazuju na ID u bilo kom spisku;
# cilj koji se nije mogao potvrditi pri prelasku sa rednih brojeva nosi ciljNepouzdan i moze biti prazan
def veza_u_redu(u):
    return u.get('cilj') in svi_ids or (u.get('ciljNepouzdan') is True and u.get('cilj') is None)
for put in sorted(f for f in os.listdir('data/knjige') if f.endswith('.json')):
    for z in json.load(open(f'data/knjige/{put}', encoding='utf8')):
        for polje in ('uparivanje', 'upareno'):
            u = z.get(polje) if isinstance(z, dict) else None
            if isinstance(u, dict) and not veza_u_redu(u):
                greske['knjiga: veza bez cilja'].append((put, z.get('oznaka'), u.get('cilj')))
def pokazivaci(o):
    if isinstance(o, dict):
        if 'radniId' in o or 'radniIndeks' in o or 'prebacenoNaMapu' in o: yield o
        for v in o.values(): yield from pokazivaci(v)
    elif isinstance(o, list):
        for v in o: yield from pokazivaci(v)
for put in sorted(f for f in os.listdir('data/provere') if f.endswith('.json')):
    for o in pokazivaci(json.load(open(f'data/provere/{put}', encoding='utf8'))):
        if 'radniIndeks' in o:
            greske['izvestaj: redni broj umesto radniId'].append((put, o['radniIndeks']))
        if 'radniId' in o and o['radniId'] not in svi_ids:
            greske['izvestaj: radniId bez cilja'].append((put, o['radniId']))
        if 'prebacenoNaMapu' in o and o['prebacenoNaMapu'] not in svi_ids:
            greske['izvestaj: prebaceno na nepostojeci id'].append((put, o['prebacenoNaMapu']))
# aplikacija prvo ucitava istaknute (vidljive na pocetnom zumu 7, tacne lokacije), pa ostale; zapis mora biti u pravom fajlu
for s in istaknuti:
    if not u_istaknutima(s): greske['u istaknutim, a pripada ostalima (sacuvaj_bazu)'].append(s.get('id'))
for s in ostali:
    if u_istaknutima(s): greske['u ostalima, a pripada istaknutim (sacuvaj_bazu)'].append(s.get('id'))
for k, v in greske.items():
    if v: print(f'{k}: {len(v)}', v[:8])
print('spomenika', len(d))
novi_bliski = [par for par in greske['manje od 30 m'] if frozenset(par[:2]) not in POZNATI_BLISKI_PAROVI]
if novi_bliski:
    print(f'novi parovi manje od 30 m: {len(novi_bliski)}', novi_bliski[:8])
otisak_ispravan = True
# u razvoju (devMode) nema novih izdanja, pa se otisak proverava tek pred objavu
def razvoj():
    put = 'utils/podesavanja.js'
    return os.path.exists(put) and re.search(r'devMode = true', open(put, encoding='utf8').read()) is not None
if os.path.exists('sw.js') and not razvoj():
    import subprocess
    otisak_ispravan = subprocess.run(['node', os.path.join(os.path.dirname(__file__), 'otisak.mjs'), '--proveri']).returncode == 0
sys.exit(1 if not otisak_ispravan or novi_bliski or any(v for k, v in greske.items() if k != 'manje od 30 m') else 0)
