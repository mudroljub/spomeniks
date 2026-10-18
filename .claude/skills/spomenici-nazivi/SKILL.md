---
name: spomenici-nazivi
description: Određuje, prevodi i ujednačava domaće nazive spomenika i nazive tura u projektu Spomenici (polje `naziv` u data/spomeniks.json i data/bez_lokacije.json) — izvor naziva, jezik i pismo po državi, „Spomenik NOB“, biste u genitivu („Bista Ive Lole Ribara“), padeži skraćenica (NOB bez nastavka, SKOJ-a, ali „članovima KPJ“), partijski komiteti i jedinice, prevod engleskih opisa sa spomenicinob.info. Koristi ga uvek kad dodaješ spomenik, menjaš ili prevodiš naziv, pregledaš nazive na greške ili mešavinu engleskog, ili korisnik traži nazive tura (naselje/oblast u NOB, engleski in WW2), ili pita kako nešto treba da se zove, čak i kad pominje samo jedan spomenik.
---

# Nazivi spomenika i tura

Naziv je naslov prozora spomenika i ono što putnik traži u pretrazi, pa mora biti tačan i ujednačen. Korisnik ne želi pretpostavke u podacima: bolje je kratak opšti naziv nego lep naziv koji niko nije potvrdio.

Jezik po državi: Srbija, Hrvatska, BiH, Crna Gora i Kosovo pišu sh latinicom (ćirilicu preslovi), Slovenija slovenački, a Makedonija makedonskom ćirilicom. `alati/integritet.py` proverava pismo. Za Makedoniju i `mesto` mora biti izvorni makedonski naziv na ćirilici, uključujući deo grada (korisnik, 2026-10-18); ne srpski oblik „Skoplje“ niti latinični prepis. Primeri: „Скопје“, „Крива Паланка“, „Ѓавато“. ID i URL se ne menjaju.

## Odakle naziv, redom

1. **Autoritet**: naziv potvrđenog Google mesta, članka na Vikipediji ili natpisa na spomeniku. Upiši ga i kad zamenjuje raniji prevod. Konkretniji naziv ima prednost nad opštim („Spomen-kompleks Ljutotuk“, a ne „Spomenik NOB“). Kad se dva autoriteta ne slažu, pitaj korisnika i daj mu link.
2. **Doslovan prevod** jasnog engleskog opisa iz izvora. Za spomenicinob.info prvo pogledaj gotove prevode u `references/formule.json` (43 opisa koji se ponavljaju); ostale prevedi po `references/prevod.md`.
3. **Samo vrsta**, kad nema ni autoriteta ni jasnog opisa: „Spomenik“, „Spomen-ploča“, „Bista“; makedonski „Споменик“; slovenački „Spomenik“, „Spominska plošča“, „Pokopališče“.

Dvosmislen engleski se ne tumači: „Martyrs Monument“ nije ni „palim borcima“ ni „žrtvama“, pa takav spomenik dobija samo vrstu. „Žrtvama fašizma“ i „žrtvama fašističkog terora“ se ne ujednačavaju, jer prate natpis.

## Oblici

- **Opšti naziv**: „Spomenik NOB“; makedonski „Споменик на НОБ“.
- **Skraćenice**: NOB se nikad ne menja („palim borcima NOB“, „poginulima u NOB“; odluka korisnika 2026-10-18); ostale muškog roda menjaju se sa crticom (NOR-u, SKOJ-a, AVNOJ-u); ženski rod se ne menja (KPJ, KPH, NOV, NOVJ: „članovima KPJ“, „borcima NOV“).
- **Bista**: „Bista“ i ime u genitivu, bez „NH“: „Bista Ive Lole Ribara“, „Bista dr Mladena Stojanovića“, „Bista Larise Šugić“. Žensko prezime na suglasnik se ne menja. Za genitiv koristi `scripts/genitiv.py`:

  ```python
  import sys; sys.path.insert(0, '.claude/skills/spomenici-nazivi/scripts')
  from genitiv import naziv_biste
  naziv_biste('Josip Broz Tito')  # 'Bista Josipa Broza Tita'
  ```

  Pravila u skripti pokrivaju obične slučajeve, a `IZUZECI` one koje je čovek pregledao (Tito → Tita, Danilo → Danila, Pozderac → Pozderca). Pregledaj svaki rezultat i nove izuzetke dopiši u `IZUZECI`. Prezime se menja kao istoimena reč (Šiljak → Šiljka, Patak → Patka); kad takve reči nema, „a“ ostaje (Skopljak → Skopljaka).
- **Partijska tela** (izvor: znaci.org): Pokrajinski komitet KPJ za BiH; oblasni komitet za veliku oblast (Bosanska krajina, Hercegovina); okružni za grad i okolinu („Okružni komitet KPJ za južnu Hercegovinu“). Jedinice: „II krajiški NOP odred“ (KNOPO), „Romanijski NOP odred“.
- **Ostalo**:
  - složenice pišeš sa crticom („Spomen-ploča“);
  - raspon godina je „1941-1945“;
  - piši „Drugi svetski rat“, odnosno „Drugi svjetski rat“;
  - navodnici su „…“;
  - naziv počinje velikim slovom i nema tačku na kraju;
  - ime mesta ne ide na kraj naziva kad ostatak sam kaže o čemu je reč (osoba, jedinica, ustanova, tema), jer se mesto prikazuje posebno: „Spomenik Podunavskom partizanskom odredu“, ne „… u Inđiji“; „Bista Stojana Ljubića“, ne „… u Leskovcu“. Mesto ostaje kad bi bez njega naziv bio opšti, jer je to uobičajen naziv („Partizansko groblje u Mostaru“, „Spomen-kosturnica u Varaždinu“), kad je deo vlastitog imena („Spomen-područje Jasenovac“) i kad je deo onoga čemu je spomenik posvećen („Spomenik žrtvama prinudnog rada u Borskom rudniku“, bitke, pokolji).

## Nazivi tura

U `data/ture.json` koristi oblik „Naselje ili oblast u NOB“ za `naziv.sh`, npr. „Beograd u NOB“ i „Istočna Srbija u NOB“; za makedonski naziv zadrži izvorni oblik „Прилеп во НОБ“. Engleski `naziv.en` ima oblik „Place or region in WW2“, npr. „Belgrade in WW2“ i „Eastern Serbia in WW2“, bez dugog prevoda skraćenice NOB. Izostavi prefikse država sa dvotačkom i ponavljanja poput „Srbija: istočna Srbija“. Pravilo važi za sve ture, nezavisno od toga imaju li viki članak; promena prikaznog naziva ne menja ID, obuhvat ni stanice ture.

## Kad se menja mnogo naziva

- Prvo prebroj obrasce i korisniku predloži pravilo, sa brojem stavki na koje deluje. Primeni tačno ono što je odobreno. Slične slučajeve koje usput nađeš predloži posebno, jer korisnik odobrava obim, ne samo ideju.
- Kad treba prevesti stotine slobodnih opisa, podeli ih na delove i daj pomoćnicima `references/prevod.md`. Posle spajanja ujednači izraze koje su delovi preveli različito (npr. „regional“, „place of death“ → „mjesto smrti“) i pregledaj uzorak.
- Na kraju proveri da nijedan naziv nema engleske reči i pokreni proveru iz skila `spomenici-provera`.
