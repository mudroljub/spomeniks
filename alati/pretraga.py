"""Pronalaženje i poređenje naših zapisa (baza i spisak bez lokacije), za uparivanje sa knjigama, registrima i drugim izvorima.

Kao modul:
    sys.path.insert(0, 'alati'); from pretraga import Zapisi, norm, osnove
    z = Zapisi()
    z.blizu(45.81, 15.98, 3000)            # [(udaljenost u m, zapis)], najbliži prvi; samo zapisi sa tačkom
    z.mesto('Čačak', 'Serbia')            # zapisi istog mesta (bez dela grada u zagradi), iz oba spiska
    z.slicni('Bista Ive Lole Ribara', z.blizu(44.8, 20.4, 5000))  # isti, ali samo sa zajedničkom osnovom reči
Iz komandne linije:
    python -I alati/pretraga.py blizu <lat> <lng> [metara]
    python -I alati/pretraga.py mesto <naziv mesta> [država]
    python -I alati/pretraga.py naziv <tekst>
Svaki zapis nosi 'skup': 'mapa' ili 'bez_lokacije'."""
import collections, json, math, re, sys, unicodedata

LATINICA = dict(zip('абвгдђежзијклљмнњопрстћуфхцчџшѓќѕ',
                    ['a', 'b', 'v', 'g', 'd', 'dj', 'e', 'z', 'z', 'i', 'j', 'k', 'l', 'lj', 'm', 'n', 'nj', 'o', 'p', 'r', 's', 't',
                     'c', 'u', 'f', 'h', 'c', 'c', 'dz', 's', 'gj', 'kj', 'dz']))
# reči koje se ponavljaju u skoro svakom nazivu i ništa ne razlikuju
OPSTE = set('spomenik spomen spomen-obelezje spomen-obiljezje obelezje obiljezje ploca spomen-ploca spominska spominsko plosca '
            'palim palima borcima boraca borcem padlim zrtvama zrtava fasistickog fasizma terora okupatorjevega nasilja '
            'nob nor nob-a nor-a bista kameni beleg cesma spomen-cesma grobnica kosturnica memorial monument '
            'narodnom heroju narodnog heroja spomenik-kosturnica'.split())


def norm(tekst):
    """Mala slova, latinica bez dijakritika (đ → dj), za poređenje ćirilice, latinice i OCR teksta."""
    t = ''.join(LATINICA.get(c, c) for c in (tekst or '').lower()).replace('đ', 'dj')
    return ''.join(c for c in unicodedata.normalize('NFKD', t) if not unicodedata.combining(c))


def osnova_mesta(mesto):
    """„Beograd (Zemun)“, „Vodice, Hangar“ → „beograd“, „vodice“."""
    return re.split(r'[(,]', norm(mesto))[0].strip()


def osnove(tekst, duzina=5):
    """Osnove reči (prvih pet slova) bez opštih reči, da „Ribara“ i „Ribaru“ budu ista reč."""
    return {w[:duzina] for w in re.findall(r'[a-z0-9-]{4,}', norm(tekst)) if w not in OPSTE}


def udaljenost(a, b, c, d):
    return 6371000 * math.hypot(math.radians(c - a), math.radians(d - b) * math.cos(math.radians(a)))


class Zapisi:
    def __init__(self, baza='data/spomeniks.json', bez_lokacije='data/bez_lokacije.json'):
        self.svi = [{**s, 'skup': 'mapa'} for s in json.load(open(baza, encoding='utf-8'))] + \
                   [{**s, 'skup': 'bez_lokacije'} for s in json.load(open(bez_lokacije, encoding='utf-8'))]
        self.po_id = {s['id']: s for s in self.svi}
        self.mreza = collections.defaultdict(list)  # ćelije od 0,01° (oko 1 km), za brzu pretragu po blizini
        for s in self.svi:
            if 'koordinate' in s:
                self.mreza[self._celija(s['koordinate']['lat'], s['koordinate']['lng'])].append(s)
        self.po_mestu = collections.defaultdict(list)
        for s in self.svi:
            self.po_mestu[osnova_mesta(s.get('mesto'))].append(s)

    @staticmethod
    def _celija(lat, lng):
        return round(lat * 100), round(lng * 100)

    def blizu(self, lat, lng, metara=1000):
        k = math.ceil(metara / 1000) + 1
        la, ln = self._celija(lat, lng)
        kandidati = (s for i in range(-k, k + 1) for j in range(-k, k + 1) for s in self.mreza.get((la + i, ln + j), []))
        nadjeni = [(udaljenost(lat, lng, s['koordinate']['lat'], s['koordinate']['lng']), s) for s in kandidati]
        return sorted([(round(m), s) for m, s in nadjeni if m <= metara], key=lambda p: p[0])

    def mesto(self, mesto, drzava=None):
        return [s for s in self.po_mestu.get(osnova_mesta(mesto), []) if drzava is None or s.get('drzava') == drzava]

    @staticmethod
    def slicni(naziv, zapisi):
        """Zapisi (ili parovi (udaljenost, zapis)) čiji naziv deli bar jednu osnovu reči sa datim nazivom."""
        trazene = osnove(naziv)
        return [z for z in zapisi if trazene & osnove((z[1] if isinstance(z, tuple) else z).get('naziv'))]

    def naziv(self, tekst):
        trazene = osnove(tekst)
        return sorted((s for s in self.svi if trazene and trazene <= osnove(s.get('naziv'))), key=lambda s: s['id'])


def opis(s, m=None):
    tacka = f"{s['koordinate']['lat']:.5f},{s['koordinate']['lng']:.5f}" if 'koordinate' in s else 'bez tačke'
    return ' | '.join(str(x) for x in [f'{m} m' if m is not None else None, s['skup'], s['id'], s.get('mesto'), s.get('naziv'),
                                         s.get('vrsta'), s.get('godina'), tacka] if x)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    z, komanda, arg = Zapisi(), sys.argv[1], sys.argv[2:]
    if komanda == 'blizu':
        for m, s in z.blizu(float(arg[0]), float(arg[1]), float(arg[2]) if len(arg) > 2 else 1000):
            print(opis(s, m))
    elif komanda == 'mesto':
        for s in z.mesto(arg[0], arg[1] if len(arg) > 1 else None):
            print(opis(s))
    elif komanda == 'naziv':
        for s in z.naziv(' '.join(arg)):
            print(opis(s))
    else:
        sys.exit(__doc__)
