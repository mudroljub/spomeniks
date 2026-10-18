# izbacuje EXIF i XMP iz slika spomenika bez ponovnog sazimanja (slika ostaje bit po bit ista); cesto su veci od same slike
# ICC profil ostaje, jer neke slike nisu u sRGB-u, a EXIF ostaje i kad okrece sliku (Orientation razlicit od 1)
# pokretanje iz korena repozitorijuma: python -I alati/bez_metapodataka.py [--upisi]  (bez --upisi samo prebroji)
import os, struct, sys

FOLDERI = ['slike/spomenici', 'slike/bez-lokacije']
VISAK = {b'EXIF', b'XMP '}
ZASTAVICE = {b'EXIF': 0x08, b'XMP ': 0x04}  # bitovi u VP8X zaglavlju


def delovi(b):
    i = 12
    while i < len(b):
        tip, vel = b[i:i + 4], struct.unpack('<I', b[i + 4:i + 8])[0]
        yield tip, b[i:i + 8 + vel + (vel & 1)]
        i += 8 + vel + (vel & 1)


def okrenuta(exif):
    # TIFF zaglavlje (u WebP-u ponekad sa prefiksom "Exif\0\0"), pa prvi IFD i oznaka 0x0112
    if exif.startswith(b'Exif\0\0'):
        exif = exif[6:]
    red = '<' if exif[:2] == b'II' else '>'
    ifd = struct.unpack(red + 'I', exif[4:8])[0]
    for k in range(struct.unpack(red + 'H', exif[ifd:ifd + 2])[0]):
        oznaka, _, _, vrednost = struct.unpack(red + 'HHIH', exif[ifd + 2 + 12 * k:ifd + 12 + 12 * k])
        if oznaka == 0x0112:
            return 2 <= vrednost <= 8  # 1 je uspravno, a 0 nije ispravna vrednost i pregledaci je ne primenjuju
    return False


upisi = '--upisi' in sys.argv
izmenjeno, usteda, okrenutih = 0, 0, 0
for putanja in [f'{f}/{ime}' for f in FOLDERI for ime in sorted(os.listdir(f))]:
    b = open(putanja, 'rb').read()
    ostaje, izbaceno = [], set()
    for tip, deo in delovi(b):
        if tip == b'EXIF' and okrenuta(deo[8:]):
            okrenutih += 1
        elif tip in VISAK:
            izbaceno.add(tip)
            continue
        ostaje.append((tip, deo))
    if not izbaceno:
        continue
    telo = b''
    for tip, deo in ostaje:
        if tip == b'VP8X':
            zastavice = deo[8] & ~sum(ZASTAVICE[t] for t in izbaceno)
            deo = deo[:8] + bytes([zastavice]) + deo[9:]
        telo += deo
    novo = b'RIFF' + struct.pack('<I', 4 + len(telo)) + b'WEBP' + telo
    izmenjeno += 1
    usteda += len(b) - len(novo)
    if upisi:
        open(putanja, 'wb').write(novo)
print('slika', izmenjeno, 'usteda', round(usteda / 1024), 'KB', 'okrenutih (EXIF ostaje)', okrenutih, '' if upisi else '(samo provera)')
