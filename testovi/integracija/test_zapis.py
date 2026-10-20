"""Izolovane provere upisa i saradnje procesa, bez menjanja projektnih podataka."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import re
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'alati'))
import zapis


class ZapisTest(unittest.TestCase):
    def test_promena_vaznosti_menja_zum_i_podelu_fajlova(self):
        put = Path(zapis.__file__).resolve().parent.parent / 'utils' / 'vaznost.js'
        kod = put.read_text(encoding='utf-8')
        kod = re.sub(r"('spomen-park':\s*)2\b", r'\g<1>9', kod)
        kod = re.sub(r'(groblje:\s*)9\b', r'\g<1>2', kod)
        modul = self.folder / 'prioriteti.mjs'
        modul.write_text(kod, encoding='utf-8')
        zumovi = zapis._ucitaj_zumove(modul)
        self.assertEqual(zumovi['groblje'], 8)
        self.assertEqual(zumovi['spomen-park'], 12)
        # granica prvog fajla je posebno podesavanje; ovde se proverava samo da je prate zumovi vrsta
        with patch.object(zapis, 'ZUM_VRSTE', zumovi), patch.object(zapis, 'ZUM_ISTAKNUTIH', 9):
            self.assertTrue(zapis.u_istaknutima({'vrsta': 'groblje'}))
            self.assertFalse(zapis.u_istaknutima({'vrsta': 'spomen-park'}))
            self.assertTrue(zapis.u_istaknutima({'vrsta': 'spomen-park', 'istaknut': True}))

    def test_formatiranje_js_konfiguracije_ne_menja_zumove(self):
        put = Path(zapis.__file__).resolve().parent.parent / 'utils' / 'vaznost.js'
        kod = put.read_text(encoding='utf-8').replace("'", '"')
        kod = kod.replace('export const vaznostVrste = {', 'export const vaznostVrste =\n{')
        modul = self.folder / 'dvostruki-navodnici.mjs'
        modul.write_text(kod, encoding='utf-8')
        self.assertEqual(zapis._ucitaj_zumove(modul), zapis.ZUM_VRSTE)

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.folder = Path(self.tmp.name)
        self.lock = str(self.folder / 'test.lock')
        self.patcher = patch.object(zapis, 'BRAVA_PODATAKA', self.lock)
        self.patcher.start()
        self.addCleanup(self.patcher.stop)

    def proces(self, kod):
        uvod = ('import sys, time, os, json\n'
                f'sys.path.insert(0, {str(Path(zapis.__file__).parent)!r})\n'
                'import zapis\n'
                f'zapis.BRAVA_PODATAKA = {self.lock!r}\n')
        p = subprocess.Popen([sys.executable, '-I', '-B', '-c', uvod + kod],
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        self.addCleanup(lambda: self.zaustavi(p))
        return p

    @staticmethod
    def zaustavi(p):
        if p.poll() is None:
            p.kill()
        p.communicate()

    def zavrsi(self, p, kod=0):
        stdout, stderr = p.communicate(timeout=15)
        self.assertEqual(p.returncode, kod, stderr or stdout)

    def izolovana_baza(self):
        return patch.multiple(zapis, **{k: str(self.folder / (k + '.json')) for k in
                              ('ISTAKNUTI', 'OSTALI', 'BEZ_LOKACIJE', 'IZVORI', 'IZVORI_STANJA', 'PROVERE_SPOMENIKA')})

    def test_dva_procesa_ne_gube_izmene(self):
        put = self.folder / 'broj.json'
        zapis.upisi_json(put, {'broj': 0})
        kod = (f'put = {str(put)!r}\n'
               'for _ in range(20):\n'
               '    with zapis.zakljucani_podaci():\n'
               '        with open(put) as f: podatak = json.load(f)\n'
               '        time.sleep(0.005)\n'
               '        podatak["broj"] += 1\n'
               '        zapis.upisi_json(put, podatak)\n')
        a, b = self.proces(kod), self.proces(kod)
        self.zavrsi(a)
        self.zavrsi(b)
        self.assertEqual(json.loads(put.read_bytes()), {'broj': 40})

    def test_istek_cekanja_i_oslobadjanje_posle_pada(self):
        # Roditelj drži bravu, pa dete mora odustati umesto da upiše preko njega.
        with zapis.zakljucani_podaci():
            p = self.proces('try:\n'
                            '    with zapis.zakljucani_podaci(cekaj=0.1): pass\n'
                            'except TimeoutError: sys.exit(7)\n')
            self.zavrsi(p, 7)
        p = self.proces('with zapis.zakljucani_podaci(): os._exit(0)\n')
        self.zavrsi(p)
        with zapis.zakljucani_podaci(cekaj=0.2):
            pass

    def test_atomaran_upis_format_i_greska(self):
        put = self.folder / 'podaci.json'
        with zapis.zakljucani_podaci():
            zapis.upisi_json(put, {'autor': 'Đurović'})
        original = put.read_bytes()
        self.assertEqual(original, '{\r\n  "autor": "Đurović"\r\n}\r\n'.encode())
        with patch.object(zapis.os, 'replace', side_effect=OSError('simuliran prekid')):
            with self.assertRaises(OSError):
                zapis.upisi_json(put, {'autor': 'drugi'})
        self.assertEqual(put.read_bytes(), original)
        self.assertEqual(list(self.folder.glob('.zapis-*.tmp')), [])

    def test_cuvanje_oba_spiska_i_izdvojenih_podataka(self):
        putanje = {k: str(self.folder / (k + '.json')) for k in
                   ('ISTAKNUTI', 'OSTALI', 'BEZ_LOKACIJE', 'IZVORI', 'IZVORI_STANJA', 'PROVERE_SPOMENIKA')}
        with patch.multiple(zapis, **putanje), zapis.zakljucani_podaci():
            provera = {'datum': '2026-10-19', 'izvor': 'https://example.org', 'ishod': 'test'}
            zapis.sacuvaj_bez_lokacije([{'id': 'a', 'vrsta': 'spomenik', 'proveraLokacije': provera}])
            bez = zapis.ucitaj_bez_lokacije()
            self.assertNotIn('proveraLokacije', bez[0])
            zapis.sacuvaj_bazu(bez)
            zapis.sacuvaj_bez_lokacije([])
            self.assertEqual(zapis.ucitaj_bazu(), [{'id': 'a', 'vrsta': 'spomenik'}])
            self.assertEqual(json.loads(Path(zapis.PROVERE_SPOMENIKA).read_bytes()),
                             {'a': {'proveraLokacije': provera}})

    def test_standardna_putanja_slike_se_ne_upisuje(self):
        spomenici = [{'id': 'a', 'vrsta': 'spomenik', 'istaknut': True, 'slika': 'slike/spomenici/a.webp', 'slikaOdnos': 1.5},
                     {'id': 'b', 'vrsta': 'bista', 'slika': 'slike/drugo/b.webp', 'slikaOdnos': 1}]
        with self.izolovana_baza(), zapis.zakljucani_podaci():
            zapis.sacuvaj_bazu(spomenici)
            sirovo = json.loads(Path(zapis.ISTAKNUTI).read_bytes()) + json.loads(Path(zapis.OSTALI).read_bytes())
            self.assertEqual({s['id']: s.get('slika') for s in sirovo}, {'a': None, 'b': 'slike/drugo/b.webp'})
            self.assertEqual({s['id']: s['slika'] for s in zapis.ucitaj_bazu()}, {'a': 'slike/spomenici/a.webp', 'b': 'slike/drugo/b.webp'})

    def test_razvrstavanje_cuva_priblizne_medju_ostalima(self):
        spomenici = [{'id': 'spomenik', 'vrsta': 'spomenik'},
                     {'id': 'bista', 'vrsta': 'bista'},
                     {'id': 'istaknuta-bista', 'vrsta': 'bista', 'istaknut': True},
                     {'id': 'priblizan', 'vrsta': 'spomenik', 'istaknut': True, 'priblizno': True}]
        with self.izolovana_baza(), zapis.zakljucani_podaci():
            zapis.sacuvaj_bazu(spomenici)
            self.assertEqual([s['id'] for s in json.loads(Path(zapis.ISTAKNUTI).read_bytes())],
                             ['istaknuta-bista'])
            self.assertEqual([s['id'] for s in json.loads(Path(zapis.OSTALI).read_bytes())],
                             ['spomenik', 'bista', 'priblizan'])
            self.assertEqual({s['id'] for s in zapis.ucitaj_bazu()}, {s['id'] for s in spomenici})

    def test_dopuna_i_brisanje_ne_gube_izvore_drugog_spiska(self):
        stanje = {'naziv': 'Izvestaj', 'godina': 2002, 'url': 'https://example.org/stanje'}
        provera = {'datum': '2026-10-19', 'izvor': 'https://example.org', 'ishod': 'provereno'}
        with self.izolovana_baza(), zapis.zakljucani_podaci():
            zapis.sacuvaj_bazu([{'id': 'mapa', 'vrsta': 'bista', 'izvor': 'https://example.org/mapa'}])
            zapis.sacuvaj_bez_lokacije([{'id': 'radni', 'vrsta': 'bista', 'izvor': 'https://example.org/radni',
                                         'stanjeIzvor': stanje, 'proveraLokacije': provera}])
            mapa = zapis.ucitaj_bazu()
            mapa[0]['autor'] = 'Puno ime'
            zapis.sacuvaj_bazu(mapa)
            self.assertEqual(json.loads(Path(zapis.IZVORI).read_bytes()),
                             {'mapa': 'https://example.org/mapa', 'radni': 'https://example.org/radni'})
            radni = zapis.ucitaj_bez_lokacije()
            radni[0]['proveraOpstanka'] = {'ishod': 'nova provera'}
            zapis.sacuvaj_bez_lokacije(radni)
            self.assertEqual(json.loads(Path(zapis.PROVERE_SPOMENIKA).read_bytes())['radni'],
                             {'proveraLokacije': provera, 'proveraOpstanka': {'ishod': 'nova provera'}})
            zapis.sacuvaj_bazu([])
            self.assertEqual(json.loads(Path(zapis.IZVORI).read_bytes()), {'radni': 'https://example.org/radni'})
            self.assertEqual(json.loads(Path(zapis.IZVORI_STANJA).read_bytes()), {'radni': stanje})
            zapis.sacuvaj_bez_lokacije([])
            for put in (zapis.IZVORI, zapis.IZVORI_STANJA, zapis.PROVERE_SPOMENIKA):
                self.assertEqual(json.loads(Path(put).read_bytes()), {})

    def test_prelazak_na_mapu_cuva_id_izvor_i_stanje(self):
        stanje = {'naziv': 'Hrzenjak', 'godina': 2002, 'url': 'https://example.org/knjiga'}
        with self.izolovana_baza(), zapis.zakljucani_podaci():
            zapis.sacuvaj_bez_lokacije([{'id': 'isti-id', 'vrsta': 'spomenik', 'stanje': 'uklonjen',
                                         'izvor': 'https://example.org/izvor', 'stanjeIzvor': stanje}])
            radni = zapis.ucitaj_bez_lokacije()
            radni[0]['koordinate'] = {'lat': 45.1, 'lng': 16.1}
            zapis.sacuvaj_bazu(radni)
            zapis.sacuvaj_bez_lokacije([])
            self.assertEqual(zapis.ucitaj_bez_lokacije(), [])
            self.assertEqual(zapis.ucitaj_bazu(), [{'id': 'isti-id', 'koordinate': {'lat': 45.1, 'lng': 16.1},
                                                   'vrsta': 'spomenik', 'stanje': 'uklonjen'}])
            self.assertEqual(json.loads(Path(zapis.IZVORI).read_bytes()), {'isti-id': 'https://example.org/izvor'})
            self.assertEqual(json.loads(Path(zapis.IZVORI_STANJA).read_bytes()), {'isti-id': stanje})


if __name__ == '__main__':
    unittest.main()
