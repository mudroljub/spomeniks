# Zajednički rad u projektu Spomenici

## Podela posla

- Pre izmene proveri `git status`, važeće tipove u `data/tipovi.d.ts` i pravila u `.claude/skills/spomenici-zetva/references/standard.md`.
- Ako radi više agenata, podelite izvore, ID-jeve ili fajlove. Istraživanje i pripremu izmena radite nezavisno; za zajedničke JSON fajlove prednost ima jedan dogovoreni agent koji upisuje rezultate.
- Promenu strukture podataka radi jedan agent; ostali sačekaju završetak pre upisa i zatim ponovo pročitaju tipove i alat za zapis. Ne vraćaj uklonjena polja iz starih skripti.
- Ne prepisuj, ne formatiraj i ne vraćaj tuđe izmene. Zajedničke dokumente ponovo pročitaj neposredno pre male, ciljane izmene. Ne resetuj i ne čisti radni direktorijum radi uklanjanja tuđeg rada.

## Upis zajedničkih podataka

Koristi `alati/zapis.py`. Zaključaj **ceo ciklus čitanje–izmena–upis**, ne samo završni upis:

```python
from zapis import zakljucani_podaci, ucitaj_bazu, sacuvaj_bazu

# Istraživanje, preuzimanje i obradu slika završi pre zaključavanja.
with zakljucani_podaci():
    spomenici = ucitaj_bazu()
    zapis = next(s for s in spomenici if s['id'] == ciljni_id)
    # Uporedi sa vrednošću na kojoj je zasnovana pripremljena izmena.
    if zapis.get('autor') != ocekivani_autor:
        raise RuntimeError('Zapis je promenjen; ponovo proveri predloženu izmenu.')
    zapis['autor'] = novi_autor
    sacuvaj_bazu(spomenici)
```

- Za spisak bez lokacije koristi `ucitaj_bez_lokacije()` i `sacuvaj_bez_lokacije()` u istom bloku. Pri prebacivanju između spiskova drži jednu bravu preko oba čitanja i oba upisa.
- Pripremljene izmene veži za ID i očekivane stare vrednosti polja koja menjaš. Ako je vrednost promenjena ili zapis nestao, preskoči konflikt i ponovo ga istraži; ne prepisuj ga automatski.
- Ne čuvaj ceo spisak učitan tokom ranijeg istraživanja. Ponovo ga učitaj unutar brave i primeni samo nameravane izmene.
- Ostale zajedničke JSON fajlove takođe čitaj i menjaj unutar `zakljucani_podaci()`, a piši pomoću `upisi_json()`. Ne piši direktno preko `open(..., 'w')` ili `json.dump`.
- Pojedinačni pozivi funkcija za čuvanje automatski zaključavaju upis, ali sami ne štite od stare kopije pročitane pre zaključavanja. Brava ne sprečava direktne upise drugim alatima i ne važi između različitih checkouta ili računara.
- Ne drži bravu tokom mrežnih zahteva, obrade slika, čekanja odgovora korisnika ili testova. Posle isteka čekanja ne briši fajl brave; pokušaj ponovo sa svežim podacima. OS oslobađa bravu pri završetku ili padu procesa.
- Zamena pojedinačnog JSON fajla je atomarna; više povezanih fajlova nije jedna transakcija. Posle prekida proveri integritet pre nastavka.

## Provera

Posle upisa proveri sopstvene ID-jeve i izmenjena polja i pokreni `python -I -B alati/integritet.py` i `git diff --check`. Za izmene koda ili alata za zapis pokreni `node testovi/pokreni.mjs` (unit i integracija); za promene interfejsa i `node testovi/pokreni.mjs e2e`.
