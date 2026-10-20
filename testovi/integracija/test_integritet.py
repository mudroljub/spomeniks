"""Izlazni status alati/integritet.py na izolovanim podacima."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


ALAT = Path(__file__).resolve().parents[2] / 'alati' / 'integritet.py'
sys.path.insert(0, str(ALAT.parent))
from zapis import u_istaknutima  # noqa: E402


def spomenik(sid, lat=44, lng=20):
    return {'id': sid, 'koordinate': {'lat': lat, 'lng': lng}, 'mesto': 'Test',
            'naziv': 'Spomenik', 'vrsta': 'spomen-obelezje', 'drzava': 'Serbia'}


class IntegritetTest(unittest.TestCase):
    def proveri(self, zapisi, visak_slike=False, posvete=None, bez_lokacije=None, knjiga=None, razvrstaj=True, arhiva=None):
        with tempfile.TemporaryDirectory(prefix='spomenici-integritet-') as folder:
            koren = Path(folder)
            for f in ('data/knjige', 'data/provere', 'data/van-mape', 'data/izvori'):
                (koren / f).mkdir(parents=True)
            slike = koren / 'slike/spomenici'
            slike.mkdir(parents=True)
            # zapis ide u fajl po pravilu iz zapis.py; bez razvrstavanja svi idu u istaknute, da se proveri greska
            istaknuti = [s for s in zapisi if u_istaknutima(s) or not razvrstaj]
            ostali = [s for s in zapisi if s not in istaknuti]
            for ime, podaci in [('spomenici-istaknuti', istaknuti), ('spomenici-ostali', ostali), ('ture', []), ('autori', {}), ('posvete', posvete or {}),
                                ('van-mape/bez_lokacije', bez_lokacije or []), ('van-mape/arhiva', arhiva or []), ('provere/provere-spomenika', {}), ('izvori/izvori-stanja', {})]:
                (koren / f'data/{ime}.json').write_text(json.dumps(podaci), encoding='utf8')
            if knjiga is not None:
                (koren / 'data/knjige/test.json').write_text(json.dumps(knjiga), encoding='utf8')
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

    def test_wiki_van_vikipedije(self):
        r = self.proveri([{**spomenik('test'), 'wiki': 'https://example.com/spomenik'}])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        for link in [42, '', 'javascript:alert(1)']:
            with self.subTest(link=link):
                r = self.proveri([{**spomenik('test'), 'wiki': link}])
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn('los link', r.stdout)
                self.assertNotIn('Traceback', r.stderr)

    def test_tekstualna_posveta(self):
        r = self.proveri([{**spomenik('test'), 'posveta': 'Omladincima strijeljanim 23. jula 1944.'}])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_povezana_posveta(self):
        r = self.proveri([{**spomenik('test'), 'posveta': ['Q9161']}], posvete={'Q9161': {'naziv': {'sh': 'Josip Broz Tito'}}})
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_opis_ima_oba_jezika(self):
        r = self.proveri([{**spomenik('test'), 'opis': {'sh': 'Opis', 'en': 'Description'}}])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        for opis in ['Opis', {'sh': 'Opis'}, {'en': 'Description'}]:
            with self.subTest(opis=opis):
                r = self.proveri([{**spomenik('test'), 'opis': opis}])
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn('opis nije {sh, en}', r.stdout)

    def test_link_u_opisu(self):
        posvete = {'Q9161': {'naziv': {'sh': 'Josip Broz Tito'}}}
        dobar = {'sh': 'Spomenik [Titu](Q9161).', 'en': 'Monument to [Tito](Q9161).'}
        r = self.proveri([{**spomenik('test'), 'posveta': ['Q9161'], 'opis': dobar}], posvete=posvete)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        for zapis in [{'opis': dobar}, {'posveta': ['Q9161'], 'opis': {'sh': dobar['sh'], 'en': 'Monument to Tito.'}}]:
            with self.subTest(zapis=zapis):
                r = self.proveri([{**spomenik('test'), **zapis}], posvete=posvete)
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn('opis: link van posvete', r.stdout)

    def test_opis_bez_tekstualne_posvete(self):
        r = self.proveri([{**spomenik('test'), 'posveta': 'Palim borcima.', 'opis': {'sh': 'Posvećeno palim borcima.', 'en': 'Dedicated to the fallen.'}}])
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('opis i tekstualna posveta', r.stdout)

    def test_naziv_je_domaci_tekst(self):
        for naziv in [{'sh': 'Spomenik'}, '', None]:
            with self.subTest(naziv=naziv):
                r = self.proveri([{**spomenik('test'), 'naziv': naziv}])
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn('bez naziva', r.stdout)
                self.assertNotIn('Traceback', r.stderr)

    def test_engleski_naziv(self):
        r = self.proveri([{**spomenik('test'), 'nazivEn': 'Monument'}])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        for nazivEn in ['Spomenik', '', {'en': 'Monument'}]:
            with self.subTest(nazivEn=nazivEn):
                r = self.proveri([{**spomenik('test'), 'nazivEn': nazivEn}])
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn('los engleski naziv', r.stdout)

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

    def test_arhiva(self):
        arhiviran = {**spomenik('arhiviran', 45), 'stanje': 'uklonjen'}
        r = self.proveri([spomenik('test')], arhiva=[arhiviran], knjiga=[{'oznaka': 'A', 'uparivanje': {'cilj': 'arhiviran'}}])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        for arhiva, poruka in [([{**arhiviran, 'id': 'test'}], 'arhiva: isti id'),
                               ([{k: v for k, v in arhiviran.items() if k != 'stanje'}], 'arhiva: bez poznatog stanja'),
                               ([{**arhiviran, 'izvor': 'https://example.org'}], 'arhiva: izdvojeni podaci')]:
            with self.subTest(poruka=poruka):
                r = self.proveri([spomenik('test')], arhiva=arhiva)
                self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
                self.assertIn(poruka, r.stdout)

    def test_zapis_u_pogresnom_fajlu(self):
        r = self.proveri([spomenik('test')], razvrstaj=False)
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn('u istaknutim, a pripada ostalima', r.stdout)

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
