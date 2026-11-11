// @ts-check
/** @param {ServiceWorker} worker @param {object} poruka */
const posalji = (worker, poruka) => new Promise((resi, odbij) => {
  const kanal = new MessageChannel()
  const kraj = setTimeout(() => { kanal.port1.close(); odbij(new Error('Worker ne odgovara')) }, 5000)
  kanal.port1.onmessage = e => { clearTimeout(kraj); kanal.port1.close(); resi(e.data) }
  worker.postMessage(poruka, [kanal.port2])
})

const sakrivena = () => document.visibilityState === 'hidden'

/** @param {ServiceWorkerRegistration} registracija */
export const pratiIzdanje = registracija => {
  let uToku = false
  let cekaOsvezavanje = false
  const predji = async () => {
    if (!sakrivena() || uToku || !registracija.waiting || !navigator.serviceWorker.controller) return
    uToku = true
    try {
      const {izdanje} = await posalji(navigator.serviceWorker.controller, {vrsta: 'VERZIJA'})
      await posalji(registracija.waiting, {vrsta: 'AKTIVIRAJ', prethodni: izdanje})
    } catch {} finally {
      uToku = false
    }
  }
  // Kartica koju korisnik gleda prelazi na novo izdanje tek kad ode u pozadinu, da ne izgubi pretragu i otvoren prozor.
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.vrsta !== 'OSVEZI_IZDANJE') return
    if (sakrivena()) location.reload()
    else cekaOsvezavanje = true
  })
  // Preuzimanje novog izdanja može da se završi tek pošto je kartica već sklonjena u pozadinu.
  registracija.addEventListener('updatefound', () => {
    const novi = registracija.installing
    novi?.addEventListener('statechange', () => { if (novi.state === 'installed') predji() })
  })
  navigator.serviceWorker.controller?.postMessage({vrsta: 'SPREMAN'})
  document.addEventListener('visibilitychange', () => {
    if (cekaOsvezavanje && sakrivena()) location.reload()
    else predji()
  })
}
