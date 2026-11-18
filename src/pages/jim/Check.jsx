// Status check (/jim/check). A JIM officer looks up one worker by SCANS ID, passport or PLKS number,
// or scans the SCANS card QR, and sees contribution status for information. The result never shows
// a permit action: contribution status must not be used to refuse, delay or cancel a permit.
// Every check, including one that finds nothing, is written to the audit log.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ScanLine, RotateCcw, UserX, ShieldCheck, ExternalLink, QrCode, Camera, Info, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { PageHead, Card, Callout, Avatar, Modal, Status } from '../../components/ui.jsx'
import { workers, demoWorker } from '../../data/demo.js'
import { logEvent, useStore } from '../shared/store.js'
import { permitText } from '../shared/data.js'
import { BASE, ACTOR, contrib } from './data.js'

const ACTION = 'Looked up contribution status'
const norm = (s) => s.toLowerCase().replace(/[\s-]/g, '')
const findBy = (value) => {
  const t = norm(value)
  if (!t) return undefined
  return workers.find((x) => norm(x.id) === t || norm(x.passport) === t || norm(x.plks) === t) || null
}
const by = (value) => {
  const t = norm(value)
  return t.startsWith('scn') ? 'SCANS ID' : t.startsWith('plks') ? 'PLKS number' : 'passport'
}

const owing3 = workers.find((w) => w.arrears > 100)
const owing1 = workers.find((w) => w.arrears === 100)
const SAMPLES = [
  { label: `SCANS ID · ${demoWorker.name}`, value: demoWorker.scansId },
  { label: `Passport · ${owing3.name}`, value: owing3.passport },
  { label: `PLKS · ${owing1.name}`, value: owing1.plks },
  { label: 'Not on SCANS', value: 'C 0000001' },
]
const BANNER = {
  'Up to date': { icon: CheckCircle2, text: (w) => `Paid up to ${w.paidThrough}` },
  '1 month owing': { icon: Clock, text: (w) => `Paid up to ${w.paidThrough}. Reminders go out in the worker’s language.` },
  '3+ months owing': { icon: AlertTriangle, text: (w) => `Paid up to ${w.paidThrough}. Reminders go out in the worker’s language.` },
}

export default function Check() {
  const go = useNavigate()
  const [q, setQ] = useState('')
  const [tried, setTried] = useState(false)
  const [found, setFound] = useState(undefined) // undefined = nothing yet, null = not found
  const [how, setHow] = useState('')
  const [scan, setScan] = useState(false)
  const audit = useStore((s) => s.audit)
  const recent = useMemo(() => audit.filter((a) => a.who === ACTOR && a.action === ACTION).slice(0, 6), [audit])

  const check = (value = q, method) => {
    setTried(true)
    if (!norm(value)) return
    const w = findBy(value)
    setFound(w)
    setHow(method || by(value))
    logEvent(ACTION, w ? w.id : `No match for “${value.trim()}”`)
  }
  const reset = () => { setQ(''); setTried(false); setFound(undefined) }
  const sample = (v) => { setQ(v); check(v) }

  return (
    <>
      <PageHead title="Status check" sub="Look up one worker’s contribution status by SCANS ID, passport number or PLKS number, or scan the QR on the SCANS card." />
      <Callout icon={ShieldCheck}>
        Every check is written to the audit log with your name, office and the time, including checks that find nothing. The SCANS card is not an immigration document.
      </Callout>
      <Card>
        <div className="st-check">
          <form className="st-check-form" onSubmit={(e) => { e.preventDefault(); check() }} noValidate>
            <label className="field">
              <span>SCANS ID, passport number or PLKS number</span>
              <span className="searchbox">
                <Search aria-hidden="true" />
                <input className={'input' + (tried && !q.trim() ? ' err' : '')} value={q} onChange={(e) => setQ(e.target.value)} placeholder="For example SCN26W0047218" autoComplete="off" />
              </span>
              {tried && !q.trim() ? <small className="error">Enter a SCANS ID, passport number or PLKS number.</small> : <small className="hint">Spaces and dashes are ignored.</small>}
            </label>
            <div className="jim-samples" aria-label="Sample numbers">
              <span className="small muted">Try a sample</span>
              <div className="chips">
                {SAMPLES.map((s) => <button key={s.value} type="button" className="chip" onClick={() => sample(s.value)}>{s.label}</button>)}
              </div>
            </div>
            <button className="btn primary block" type="submit"><Search /> Check</button>
            <div className="st-or"><span>or</span></div>
            <button className="btn outline block" type="button" onClick={() => setScan(true)}><QrCode /> Scan QR on the SCANS card</button>
          </form>
          <div className={'st-check-result' + (found === null ? ' miss' : found ? ' hit' : '')} aria-live="polite">
            {found === undefined && (
              <div className="st-check-empty">
                <span className="ic"><ScanLine aria-hidden="true" /></span>
                <b>Enter a number or scan a card</b>
                <span>The worker’s contribution status shows here.</span>
              </div>
            )}
            {found === null && (
              <div className="st-check-empty">
                <span className="ic bad"><UserX aria-hidden="true" /></span>
                <b>No SCANS record found</b>
                <span>Check the number and try again. A worker not yet registered on SCANS has no contribution record. This says nothing about their permit.</span>
                <button className="btn sm outline" onClick={reset} style={{ marginTop: 6 }}><RotateCcw /> Try again</button>
              </div>
            )}
            {found && <Result w={found} how={how} onReset={reset} onOpen={() => go(`${BASE}/workers/${found.id}`)} />}
          </div>
        </div>
      </Card>

      <Card title="Your recent checks" sub="From the audit log, newest first">
        {recent.length === 0 ? <p className="small muted">Checks you make appear here.</p> : (
          <ul className="st-recent">
            {recent.map((a) => {
              const w = workers.find((x) => x.id === a.target)
              const c = w && contrib(w)
              return (
                <li key={a.id}>
                  {w ? <button className="st-link" onClick={() => { setQ(w.id); check(w.id) }}>{w.name} · {w.id}</button> : <span className="muted">{a.target}</span>}
                  <span className="row" style={{ gap: 10 }}>{c && <Status tone={c.tone}>{c.label}</Status>}<span className="small muted num">{a.at.slice(-5)}</span></span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
      {scan && <ScanModal onClose={() => setScan(false)} onScanned={() => { setScan(false); setQ(demoWorker.scansId); check(demoWorker.scansId, 'SCANS card QR') }} />}
    </>
  )
}

function Result({ w, how, onReset, onOpen }) {
  const c = contrib(w)
  const b = BANNER[c.label]
  const Icon = b.icon
  return (
    <div className="st-result">
      <div className={'st-banner ' + c.tone}><Icon aria-hidden="true" /><b>{c.label}</b><span>{b.text(w)}</span></div>
      <div className="st-result-body">
        <Avatar name={w.name} size="xl" grad />
        <dl className="kv">
          <div><dt>Full name</dt><dd>{w.name}</dd></div>
          <div><dt>Nationality</dt><dd>{w.nationality}</dd></div>
          <div><dt>PLKS number</dt><dd className="mono-id">{w.plks}</dd></div>
          <div><dt>Permit expiry</dt><dd>{w.permitExpiry} <small className="muted" style={{ display: 'block' }}>{permitText(w)}, from JIM</small></dd></div>
          <div><dt>Employer</dt><dd>{w.employer}</dd></div>
          <div><dt>Passport number</dt><dd>{w.passport}</dd></div>
          <div><dt>SCANS ID</dt><dd className="mono-id">{w.id}</dd></div>
          <div><dt>Found by</dt><dd>{how}</dd></div>
        </dl>
      </div>
      <p className="jim-rule"><Info aria-hidden="true" /> Contribution status is for information only. It must not be used to refuse, delay or cancel a permit.</p>
      <div className="row wrap st-result-acts">
        <Status tone={c.tone}>{c.label}</Status>
        <span className="grow" />
        <button className="btn sm ghost" onClick={onReset}><RotateCcw /> New check</button>
        <button className="btn sm primary" onClick={onOpen}><ExternalLink /> View record</button>
      </div>
    </div>
  )
}

function ScanModal({ onClose, onScanned }) {
  const [done, setDone] = useState(false)
  useEffect(() => { const id = setTimeout(() => setDone(true), 1800); return () => clearTimeout(id) }, [])
  return (
    <Modal title="Scan the SCANS card" onClose={onClose} actions={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={onScanned} disabled={!done}><Camera /> {done ? 'Show result' : 'Scanning…'}</button></>}>
      <div className="stack" style={{ gap: 14 }}>
        <p className="ink2">Point the camera at the QR code on the worker’s SCANS card. This prototype uses a sample card.</p>
        <div className={'jim-scan' + (done ? ' done' : '')} aria-live="polite">
          <div className="jim-scan-frame" aria-hidden="true">
            <div className="st-qr">{Array.from({ length: 49 }, (_, i) => <i key={i} className={(i * 7 + (i % 5) * 3) % 3 === 0 || [0, 1, 7, 8, 5, 6, 12, 13, 35, 36, 42, 43].includes(i) ? 'on' : ''} />)}</div>
            {!done && <span className="jim-scan-line" />}
          </div>
          <b>{done ? `Card read: ${demoWorker.scansId}` : 'Looking for a QR code'}</b>
        </div>
        <Callout icon={Info}>The QR shows contribution status only. It is not an immigration document.</Callout>
      </div>
    </Modal>
  )
}
