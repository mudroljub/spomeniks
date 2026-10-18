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
            'naziv': 'Spomenik', 'vrsta': 'spomen-obelezje', 'drzava': 'Serbia'}


class IntegritetTest(unittest.TestCase):
    def proveri(self, zapisi, visak_slike=False, posvete=None, bez_lokacije=None, knjiga=None, razdeli=True):
        with tempfile.TemporaryDirectory(prefix='spomenici-integritet-') as folder:
            koren = Path(folder)
            for f in ('data/knjige', 'data/provere'):
                (koren / f).mkdir(parents=True)
            slike = koren / 'slike/spomenici'
            slike.mkdir(parents=True)
            for ime, podaci in [('spomeniks', zapisi), ('ture', []), ('autori', {}), ('posvete', posvete or {}),
                                ('bez_lokacije', bez_lokacije or [])]:
                (koren / f'data/{ime}.json').write_text(json.dumps(podaci), encoding='utf8')
            if knjiga is not None:
                (koren / 'data/knjige/test.json').write_text(json.dumps(knjiga), encoding='utf8')
            if visak_slike:
                (slike / 'visak.webp').write_bytes(b'')
            if razdeli:
                subprocess.run(['node', str(ALAT.with_name('razdeli.mjs'))], cwd=koren, check=True, capture_output=True)
            return subprocess.run([sys.executable, '-I', str(ALAT)], cwd=koren,
                                  capture_output=True, text=True, encoding='utf8')

    def test_ispravni_podaci(self):
        r = self.proveri([spomenik('test')])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_stvarna_greska(self):
        r = self.proveri([{**spomenik('test'), 'vrsta': 'greska'}])
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('nepoznata vrsta', r.stdout)

    def test_clanak(self):
        r = self.proveri([{**spomenik('test'), 'clanak': 'https://example.com/spomenik'}])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        for link in [42, '', 'javascript:alert(1)']:
            with self.subTest(link=link):
                r = self.proveri([{**spomenik('test'), 'clanak': link}])
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn('los link', r.stdout)
                self.assertNotIn('Traceback', r.stderr)

    def test_tekstualna_posveta(self):
        r = self.proveri([{**spomenik('test'), 'posveta': 'Omladincima strijeljanim 23. jula 1944.'}])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_povezana_posveta(self):
        r = self.proveri([{**spomenik('test'), 'posveta': ['Q9161']}], posvete={'Q9161': {'naziv': 'Josip Broz Tito'}})
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_neispravne_posvete(self):
        for vrednost in ['', '  ', [], ['Q999999'], [None], {}, None, 42]:
            with self.subTest(posveta=vrednost):
                r = self.proveri([{**spomenik('test'), 'posveta': vrednost}])
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertNotIn('Traceback', r.stderr)

    def test_poznati_par_u_obrnutom_redosledu(self):
        r = self.proveri([spomenik('nis-spomen-park-bubanj'), spomenik('nis')])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn('manje od 30 m: 1', r.stdout)

    def test_novi_par_uz_poznati(self):
        r = self.proveri([spomenik('nis'), spomenik('nis-spomen-park-bubanj'), spomenik('novi')])
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('novi parovi manje od 30 m: 2', r.stdout)

    def test_veza_knjige(self):
        stavka = {'id': 'test-bez', 'naziv': 'Spomenik', 'mesto': 'Test', 'vrsta': 'spomen-obelezje', 'drzava': 'Serbia'}
        dobre = [{'oznaka': 'A', 'uparivanje': {'cilj': 'test'}},
                 {'oznaka': 'B', 'upareno': {'cilj': 'test-bez'}},
                 {'oznaka': 'C', 'uparivanje': {'cilj': None, 'ciljNepouzdan': True}}]
        r = self.proveri([spomenik('test')], bez_lokacije=[stavka], knjiga=dobre)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        for polje, los in [('uparivanje', {'cilj': 'nema'}), ('upareno', {'cilj': 0}), ('uparivanje', {'cilj': None})]:
            with self.subTest(veza=los):
                r = self.proveri([spomenik('test')], bez_lokacije=[stavka], knjiga=[{'oznaka': 'D', polje: los}])
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn('knjiga: veza bez cilja', r.stdout)

    def test_id_bez_lokacije(self):
        stavka = {'naziv': 'Spomenik', 'mesto': 'Test', 'vrsta': 'spomen-obelezje', 'drzava': 'Serbia'}
        for bez, poruka in [([stavka], 'bez lokacije: bez id'), ([{**stavka, 'id': 'test'}], 'bez lokacije: isti id'),
                            ([{**stavka, 'id': 'x'}, {**stavka, 'id': 'x'}], 'bez lokacije: isti id')]:
            with self.subTest(poruka=poruka, bez=bez):
                r = self.proveri([spomenik('test')], bez_lokacije=bez)
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn(poruka, r.stdout)

    def test_zastareli_fajlovi_aplikacije(self):
        r = self.proveri([spomenik('test')], razdeli=False)
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('fajlovi aplikacije zastareli', r.stdout)

    def test_izvori_odvojeno(self):
        r = self.proveri([{**spomenik('test'), 'izvor': 'https://example.com'}])
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('izvor u bazi', r.stdout)
        stavka = {'id': 'bez', 'naziv': 'Spomenik', 'mesto': 'Test', 'vrsta': 'spomen-obelezje', 'drzava': 'Serbia', 'izvor': 'https://example.com'}
        r = self.proveri([spomenik('test')], bez_lokacije=[stavka])
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('izvor u spisku bez lokacije', r.stdout)

    def test_nekoriscena_slika(self):
        r = self.proveri([spomenik('test')], visak_slike=True)
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('slika koju niko ne koristi', r.stdout)


if __name__ == '__main__':
    unittest.main()
