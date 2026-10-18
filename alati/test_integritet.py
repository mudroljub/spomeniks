"""python -I alati/test_integritet.py — izlazni status provere na izolovanim podacima."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


ALAT = Path(__file__).with_name('integritet.py')


def spomenik(sid, lat=44, lng=20):
    return {'id': sid, 'koordinate': {'lat': lat, 'lng': lng}, 'mesto': 'Test',
            'naziv': 'Spomenik', 'vrsta': 'lokalni', 'drzava': 'Serbia'}


class IntegritetTest(unittest.TestCase):
    def proveri(self, zapisi, visak_slike=False):
        with tempfile.TemporaryDirectory(prefix='spomenici-integritet-') as folder:
            koren = Path(folder)
            (koren / 'data').mkdir()
            slike = koren / 'slike/spomenici'
            slike.mkdir(parents=True)
            for ime, podaci in [('spomeniks', zapisi), ('ture', []), ('autori', {}), ('posvete', {})]:
                (koren / f'data/{ime}.json').write_text(json.dumps(podaci), encoding='utf8')
            if visak_slike:
                (slike / 'visak.webp').write_bytes(b'')
            return subprocess.run([sys.executable, '-I', str(ALAT)], cwd=koren,
                                  capture_output=True, text=True, encoding='utf8')

    def test_ispravni_podaci(self):
        r = self.proveri([spomenik('test')])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_stvarna_greska(self):
        r = self.proveri([{**spomenik('test'), 'vrsta': 'greska'}])
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('nepoznata vrsta', r.stdout)

    def test_poznati_par_u_obrnutom_redosledu(self):
        r = self.proveri([spomenik('nis-spomen-park-bubanj'), spomenik('nis')])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn('manje od 30 m: 1', r.stdout)

    def test_novi_par_uz_poznati(self):
        r = self.proveri([spomenik('nis'), spomenik('nis-spomen-park-bubanj'), spomenik('novi')])
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('novi parovi manje od 30 m: 2', r.stdout)

    def test_nekoriscena_slika(self):
        r = self.proveri([spomenik('test')], visak_slike=True)
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('slika koju niko ne koristi', r.stdout)


if __name__ == '__main__':
    unittest.main()
