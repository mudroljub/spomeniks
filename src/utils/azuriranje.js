const posalji = (worker, poruka) => new Promise((resi, odbij) => {
  const kanal = new MessageChannel()
  const kraj = setTimeout(() => { kanal.port1.close(); odbij(new Error('Worker ne odgovara')) }, 5000)
  kanal.port1.onmessage = e => { clearTimeout(kraj); kanal.port1.close(); resi(e.data) }
  worker.postMessage(poruka, [kanal.port2])
})

export const pratiIzdanje = registracija => {
  let uToku = false
  const predji = async () => {
    if (document.visibilityState !== 'hidden' || uToku || !registracija.waiting || !navigator.serviceWorker.controller) return
    uToku = true
    try {
      const {izdanje} = await posalji(navigator.serviceWorker.controller, {vrsta: 'VERZIJA'})
      await posalji(registracija.waiting, {vrsta: 'AKTIVIRAJ', prethodni: izdanje})
    } catch {} finally {
      uToku = false
    }
  }
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.vrsta === 'OSVEZI_IZDANJE') location.reload()
  })
  navigator.serviceWorker.controller?.postMessage({vrsta: 'SPREMAN'})
  document.addEventListener('visibilitychange', predji)
}
