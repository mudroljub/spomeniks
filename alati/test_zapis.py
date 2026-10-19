"""Izolovane provere upisa i saradnje procesa, bez menjanja projektnih podataka."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import zapis


class ZapisTest(unittest.TestCase):
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


if __name__ == '__main__':
    unittest.main()
