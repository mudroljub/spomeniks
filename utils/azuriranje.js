import {t} from './jezik.js'

const posalji = (worker, poruka) => new Promise((resi, odbij) => {
  const kanal = new MessageChannel()
  const kraj = setTimeout(() => { kanal.port1.close(); odbij(new Error('Worker ne odgovara')) }, 5000)
  kanal.port1.onmessage = e => { clearTimeout(kraj); kanal.port1.close(); resi(e.data) }
  worker.postMessage(poruka, [kanal.port2])
})

export const pratiIzdanje = registracija => {
  let panel
  const ponudi = () => {
    if (!registracija.waiting || !navigator.serviceWorker.controller || panel) return
    panel = document.createElement('aside')
    panel.className = 'novo-izdanje'
    panel.setAttribute('role', 'status')
    const tekst = document.createElement('span')
    tekst.textContent = t('novoIzdanje')
    const dugme = document.createElement('button')
    dugme.textContent = t('osveziIzdanje')
    dugme.onclick = async () => {
      dugme.disabled = true
      try {
        const {izdanje} = await posalji(navigator.serviceWorker.controller, {vrsta: 'VERZIJA'})
        const odgovor = await posalji(registracija.waiting, {vrsta: 'AKTIVIRAJ', prethodni: izdanje})
        if (!odgovor.uspeh) throw new Error('Aktivacija nije uspela')
      } catch {
        tekst.textContent = t('azuriranjeGreska')
        dugme.disabled = false
      }
    }
    panel.append(tekst, dugme)
    document.body.append(panel)
  }
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.vrsta === 'OSVEZI_IZDANJE') location.reload()
  })
  navigator.serviceWorker.controller?.postMessage({vrsta: 'SPREMAN'})
  registracija.addEventListener('updatefound', () => {
    registracija.installing?.addEventListener('statechange', ponudi)
  })
  ponudi()
}
