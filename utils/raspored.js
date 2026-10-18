// @ts-check
// Prostorna mreza ogranicava proveru na oznake u neposrednoj blizini.
export default class Raspored {
  constructor() {
    this.polja = new Map()
  }

  kljucevi({levo, gore, desno, dole}) {
    const rezultat = []
    for (let x = Math.floor(levo / 64); x <= Math.floor(desno / 64); x++) {
      for (let y = Math.floor(gore / 64); y <= Math.floor(dole / 64); y++) rezultat.push(`${x},${y}`)
    }
    return rezultat
  }

  dodaj(okvir) {
    this.kljucevi(okvir).forEach(kljuc => {
      if (!this.polja.has(kljuc)) this.polja.set(kljuc, [])
      this.polja.get(kljuc).push(okvir)
    })
  }

  slobodno(okvir) {
    return this.kljucevi(okvir).every(kljuc => (this.polja.get(kljuc) || []).every(drugi =>
      okvir.desno <= drugi.levo || okvir.levo >= drugi.desno || okvir.dole <= drugi.gore || okvir.gore >= drugi.dole
    ))
  }

  pomeri(okvir) {
    // Trazi najblize slobodno mesto, ali ne udaljava oznaku vise od 96 px.
    for (let r = 0; r <= 96; r += 16) {
      const koraka = r ? Math.ceil(2 * Math.PI * r / 16) : 1
      for (let i = 0; i < koraka; i++) {
        const ugao = 2 * Math.PI * i / koraka
        const dx = Math.round(r * Math.cos(ugao))
        const dy = Math.round(r * Math.sin(ugao))
        const novi = {levo: okvir.levo + dx, desno: okvir.desno + dx, gore: okvir.gore + dy, dole: okvir.dole + dy}
        if (!this.slobodno(novi)) continue
        this.dodaj(novi)
        return [dx, dy]
      }
    }
    this.dodaj(okvir)
    return [0, 0]
  }
}
