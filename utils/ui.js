// @ts-check
// Paneli ostaju nemodalni: mapa je dostupna, a Escape zatvara samo aktivni panel.
export const upravljajPanelom = (panel, zatvori, naziv, dugme) => {
  panel.tabIndex = -1
  panel.setAttribute('role', 'region')
  const aktivni = () => {
    let element = document.activeElement
    while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement
    return element
  }
  let otvoren = !panel.hidden, prethodni
  new MutationObserver(() => {
    if (otvoren === !panel.hidden) return
    otvoren = !panel.hidden
    const fokus = aktivni()
    if (otvoren) {
      prethodni = fokus
      panel.setAttribute('aria-label', typeof naziv === 'function' ? naziv() : naziv)
      panel.focus({preventScroll: true})
    } else if (fokus === document.body || panel.contains(fokus)) {
      const cilj = prethodni && prethodni !== document.body && prethodni !== document.documentElement
        && prethodni.isConnected && prethodni.getClientRects().length ? prethodni : dugme?.()
      cilj?.focus({preventScroll: true})
    }
    dugme?.()?.setAttribute('aria-expanded', String(otvoren))
  }).observe(panel, {attributes: true, attributeFilter: ['hidden']})
  panel.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented) return
    e.preventDefault()
    e.stopPropagation()
    zatvori()
  })
}

// Zajednicko zaglavlje za detalje spomenika i izabranu turu.
export const stilZaglavlja = `
  h2 {
    font-size: 20px;
  }

  .vise {
    color: var(--boja);
    font-size: 15px;
    font-weight: normal;
    white-space: nowrap;
  }

  .vise:focus-visible {
    outline: 2px solid var(--boja);
    outline-offset: 3px;
  }
`

// Na telefonu panel izlazi odozdo preko cele sirine; visinu, pozadinu i mesto na sirem ekranu odredjuje komponenta.
export const stilPanela = `
  #panel {
    border-radius: 12px 12px 0 0;
    bottom: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
    left: 0;
    position: fixed;
    right: 0;
  }
`
