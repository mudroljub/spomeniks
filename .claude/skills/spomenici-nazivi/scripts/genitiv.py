"""Genitiv ličnih imena za nazive bista („Bista Ive Lole Ribara“). Pravila pokrivaju obične slučajeve;
izuzeci su u IZUZECI, a nesigurni se proveravaju ručno."""
import re

ZENSKA = set('''Ajša Amalija Anka Berta Borislava Cveta Danica Danila Dragica Dukica Dušanka Franica Jelenka Kata Katarina
 Larisa Lepa Lucija Majda Marija Milja Mira Miroslava Nada Rada Radojka Ravijojla Razija Remzija Rosa Tamara Tihoslava
 Vahida Vera Vukica Zdenka Rajka Zdravka Zlatka'''.split())
NA_A = set('''Marko Mirko Branko Žarko Slavko Danko Ranko Zvonko Duško Boško Ljupko Vojko Svetko Zdravko Dujko Borko
 Dragojlo Vojislav Milo Oto Tono'''.split())  # -o -> -a
NA_TA = set('Mile Pane Tone Miće'.split())  # Mile -> Mileta
NEPROMENLJIVO = set('Ante Rade Jure Pijade Miće'.split())
PRIDEV = {'Stari': 'Starog', 'Crni': 'Crnog', 'Črni': 'Črnog', 'Veliki': 'Velikog', 'Šumadijski': 'Šumadijskog', 'Šumski': 'Šumskog', 'Plavi': 'Plavog'}
NEPOSTOJANO = {  # nepostojano a/e: osnova u genitivu
    'Zagorac': 'Zagorca', 'Veletovac': 'Veletovca', 'Španac': 'Španca', 'Marijanac': 'Marijanca', 'Crnogorac': 'Crnogorca',
    'Premasunac': 'Premasunca', 'Pećanac': 'Pećanca', 'Čajavec': 'Čajavca', 'Bobinec': 'Bobinca', 'Bubanj': 'Bubnja',
    'Mitar': 'Mitra', 'Petar': 'Petra', 'Popac': 'Popca', 'Holjevac': 'Holjevca', 'Cesarec': 'Cesarca','Irac': 'Irca', 'Gavran': 'Gavrana',
}

def muski(r, prvo):
    if r in NEPROMENLJIVO: return r
    if r in PRIDEV: return PRIDEV[r]
    if r in NEPOSTOJANO: return NEPOSTOJANO[r]
    if r in NA_TA: return r + 'ta'
    if r.endswith('je') and prvo: return r[:-1] + 'a'      # Spasoje -> Spasoja
    if r == 'Pavle': return 'Pavla'
    if r.endswith('a'): return r[:-1] + 'e'                 # Nikola -> Nikole, Šipka -> Šipke
    if r.endswith('o'):
        return r[:-1] + ('a' if r in NA_A or r.endswith('ko') else 'e')  # Marko -> Marka, Ivo -> Ive
    if r.endswith('i'): return r + 'ja'                     # Rudi -> Rudija
    if r.endswith('e'): return r
    return r + 'a'                                          # Kikić -> Kikića, Ribar -> Ribara

def zenski(r, prvo):
    if r.endswith('a'): return r[:-1] + 'e'
    return r                                                # Šugić, Butorac -> nepromenljivo

def genitiv(ime):
    """'Ivo Lola Ribar' -> 'Ive Lole Ribara'. Crtice i navodnici se čuvaju."""
    reci = re.findall(r"[\w\-]+|[^\w\s]+|\s+", ime)
    prva = next((w for w in reci if re.match(r'\w', w)), '')
    zensko = prva in ZENSKA
    izlaz, prvo = [], True
    for w in reci:
        if re.fullmatch(r'\w[\w]*', w) and w[0].isupper() and w not in ('Dr', 'NH'):
            izlaz.append((zenski if zensko else muski)(w, prvo)); prvo = False
        else:
            izlaz.append(w)
    return ''.join(izlaz)

# ručno pregledani izuzeci: ceo naziv osobe -> genitiv
IZUZECI = {
    'Branko Bane Šurbat': 'Branka Baneta Šurbata',
    'Svetozar Vukmanović Tempo': 'Svetozara Vukmanovića Tempa',
    'Oto Levi-Plavi': 'Ota Levija Plavog',
    'Danilo Soldatić': 'Danila Soldatića', 'Danilo Đokić': 'Danila Đokića', 'Danilo Šarenac': 'Danila Šarenca',
    'Dr. Rosa Hadživuković': 'dr Rose Hadživuković',
    'Dušan Mučibabić - Dule': 'Dušana Mučibabića - Duleta',
    'Hazim Vikalo': 'Hazima Vikala',
    'Ivica Mitričić Bregejac': 'Ivice Mitričića Bregejca',
    'Josip Broz Tito': 'Josipa Broza Tita',
    'Karlo Batko': 'Karla Batka', 'Karlo Rojc': 'Karla Rojca',
    'Leo Bruk': 'Lea Bruka',
    'Manojlo Benderać Majo': 'Manojla Benderaća Maje', 'Manojlo Popić': 'Manojla Popića',
    'Marijan Primorac': 'Marijana Primorca',
    'Maxim Gorky': 'Maksima Gorkog',
    "Mihailo 'Miko' Pavlović": 'Mihaila „Mike“ Pavlovića', 'Mihailo Đurić': 'Mihaila Đurića',
    'Mihajlo Bjelaković': 'Mihajla Bjelakovića', 'Mihajlo Čvoro': 'Mihajla Čvore',
    'Milan Ostojić-Šubara': 'Milana Ostojića-Šubare',
    'Milan Šarac': 'Milana Šarca',
    'Nurija Pozderac': 'Nurije Pozderca',
    'Predrag Marković Alimpije': 'Predraga Markovića Alimpija',
    'Simo Bjelajac': 'Sime Bjelajca',
    'Vladimir Ilyich Lenin': 'Vladimira Iljiča Lenjina',
    'Đorđe Perić Učo': 'Đorđa Perića Uče', 'Đorđe Đoko Putica': 'Đorđa Đoka Putice',
    'Đorđije Đorđe Premović': 'Đorđija Đorđa Premovića',
}

def naziv_biste(ime):
    """'Ivo Lola Ribar' -> 'Bista Ive Lole Ribara'; nadimci pod navodnicima „…“, titula „dr“."""
    g = IZUZECI.get(ime) or genitiv(ime)
    g = re.sub(r'^Dr\.? ', 'dr ', g)
    g = re.sub(r"['\"]([^'\"]+)['\"]", r'„\1“', g)
    return 'Bista ' + g
