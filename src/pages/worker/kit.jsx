import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { languages } from '../../data/demo.js'
import { useWk, Sheet } from './shell.jsx'
import { langNote } from './i18n.js'

/* Small pieces shared by the newer worker screens. */

// Full-screen frosted overlay with a spinner ("Creating your account…").
export function Busy({ label, sub }) {
  return (
    <div className="wk-busy" role="status" aria-live="polite">
      <div className="wk-busy-in">
        <span className="wk-busy-spin" aria-hidden="true" />
        <b>{label}</b>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  )
}

// Ring that shows how many days are left of a span, for example a permit.
export function DaysRing({ days, of = 730, size = 76, label, unit = 'days' }) {
  const r = 32, c = 2 * Math.PI * r
  const f = Math.max(0, Math.min(1, days / of))
  return (
    <span className="wk-ring" style={{ width: size, height: size }} role="img" aria-label={label || days + ' days left'}>
      <svg viewBox="0 0 76 76" aria-hidden="true">
        <circle cx="38" cy="38" r={r} className="bg" />
        <circle cx="38" cy="38" r={r} className="fg" strokeDasharray={c} strokeDashoffset={c * (1 - f)} />
      </svg>
      <span className="v"><b className="num">{days}</b><small>{unit}</small></span>
    </span>
  )
}

// Copy a reference such as the SCANS ID, with a short confirmation.
export function CopyId({ value, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value.replace(/\s/g, '')) } catch { /* clipboard blocked */ }
    setDone(true)
    setTimeout(() => setDone(false), 1600)
  }
  return (
    <button type="button" className="wk-copy" onClick={copy} aria-label={done ? 'Copied' : label + ' ' + value}>
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  )
}

// Language picker in a bottom sheet.
export function LangSheet({ onClose }) {
  const { lang, setLang, t } = useWk()
  return (
    <Sheet title={t.chooseLang} onClose={onClose}>
      <h2 className="wk-sheet-h">{t.chooseLang}</h2>
      <div className="wk-opts compact" role="radiogroup" aria-label={t.chooseLang}>
        {languages.map((l) => (
          <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} className="wk-opt" onClick={() => { setLang(l.code); onClose() }}>
            <span className="grow"><b>{l.label}</b><small>{langNote[l.code]}</small></span>
            <span className="radio" aria-hidden="true" />
          </button>
        ))}
      </div>
    </Sheet>
  )
}

// A grouped settings list (Sabah GO profile style).
export function Group({ title, children, id }) {
  return (
    <section className="wk-group" id={id} aria-label={title}>
      <h2>{title}</h2>
      <div className="wk-list">{children}</div>
    </section>
  )
}
