// Worker check (/state/check). From the Figma "Enforcement Tools" frames: look up one worker by
// passport number or SCANS ID, or scan the SCANS card with a phone, and see contribution status.
// Rewritten for SCANS rules: the result is contribution status only. It never shows a renewal hold,
// "renewal blocked" or any permit action, because arrears never affect a permit (handoff s.4).
// The Figma "Renewal Hold Registry" table is deliberately not built.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ScanLine, RotateCcw, Download, UserX, ShieldCheck, ExternalLink, CheckCircle2, AlertTriangle, Clock, Info, Smartphone } from 'lucide-react'
import { PageHead, Card, Callout, Avatar, Modal, Status, useToast } from '../../components/ui.jsx'
import { workers, demoWorker, rm } from '../../data/demo.js'
import { permitText } from '../shared/data.js'
import { logEvent, useStore, currentActor } from '../shared/store.js'

const BASE = '/state'
const norm = (s) => s.toLowerCase().replace(/[\s-]/g, '')

const RESULT = {
  Paid: { tone: 'ok', icon: CheckCircle2, title: 'Paid up', text: 'Contribution paid for December 2027' },
  'Due this month': { tone: 'info', icon: Clock, title: 'Due this month', text: 'Paid up to November 2027. December was due on 5 December.' },
  '1–2 months overdue': { tone: 'warn', icon: AlertTriangle, title: '1–2 months overdue', text: 'Reminders go out in the worker’s language' },
  '3+ months overdue': { tone: 'bad', icon: AlertTriangle, title: '3+ months overdue', text: 'Reminders go out in the worker’s language' },
}

export default function WorkerCheck() {
  const toast = useToast()
  const go = useNavigate()
  const [q, setQ] = useState('')
  const [tried, setTried] = useState(false)
  const [found, setFound] = useState(undefined) // undefined = nothing checked yet, null = not found
  const [scan, setScan] = useState(false)
  const audit = useStore((s) => s.audit)
  const me = currentActor()
  const recent = useMemo(() => audit.filter((a) => a.who === me && a.action === 'Checked worker contribution status').slice(0, 5), [audit, me])

  const check = (value = q) => {
    setTried(true)
    const t = norm(value)
    if (!t) return
    const w = workers.find((x) => norm(x.id) === t || norm(x.passport) === t) || null
    setFound(w)
    logEvent('Checked worker contribution status', w ? w.id : `No match for “${value.trim()}”`)
  }
  const reset = () => { setQ(''); setTried(false); setFound(undefined) }
  const exportResult = () => {
    logEvent('Exported worker check', found.id)
    toast(`Check result for ${found.id} downloaded as PDF. The download is in the audit log.`)
  }

  return (
    <>
      <PageHead title="Worker check" sub="Check one worker’s contribution status by passport number or SCANS ID, or scan the SCANS card with your phone." />
      <Card>
        <div className="st-check">
          <form className="st-check-form" onSubmit={(e) => { e.preventDefault(); check() }} noValidate>
            <label className="field">
              <span>Passport number or SCANS ID</span>
              <span className="searchbox">
                <Search aria-hidden="true" />
                <input className={'input' + (tried && !q.trim() ? ' err' : '')} value={q} onChange={(e) => setQ(e.target.value)} placeholder="For example SCN26W0047218 or C 5539120" autoComplete="off" />
              </span>
              {tried && !q.trim() ? <small className="error">Enter a passport number or SCANS ID.</small> : <small className="hint">Spaces and dashes are ignored.</small>}
            </label>
            <button className="btn primary block" type="submit"><Search /> Check</button>
            <div className="st-or"><span>or</span></div>
            <button className="btn outline block" type="button" onClick={() => setScan(true)}><ScanLine /> Scan with your phone</button>
            <p className="small muted" style={{ textAlign: 'center' }}>Creates a one-time link to scan the worker’s SCANS card on your phone.</p>
          </form>
          <div className={'st-check-result' + (found === null ? ' miss' : found ? ' hit' : '')} aria-live="polite">
            {found === undefined && (
              <div className="st-check-empty">
                <span className="ic"><Search aria-hidden="true" /></span>
                <b>Enter an ID or scan a card</b>
                <span>The worker’s contribution status shows here.</span>
              </div>
            )}
            {found === null && (
              <div className="st-check-empty">
                <span className="ic bad"><UserX aria-hidden="true" /></span>
                <b>No worker found</b>
                <span>Check the number and try again. Workers not yet registered on SCANS will not show.</span>
                <button className="btn sm outline" onClick={reset} style={{ marginTop: 6 }}><RotateCcw /> Try again</button>
              </div>
            )}
            {found && <Result w={found} onReset={reset} onExport={exportResult} onOpen={() => go(`${BASE}/workers/${found.id}`)} />}
          </div>
        </div>
      </Card>
      <Callout icon={ShieldCheck}>
        This check shows contribution status only. It is not an immigration check and it does not affect the worker’s permit. Arrears lead to reminders only, never to permit action, passport holding, travel restriction or detention. Every check is written to the audit log.
      </Callout>
      <div className="grid g-2" style={{ alignItems: 'start' }}>
        <Card title="Your recent checks" sub="This session">
          {recent.length === 0 ? <p className="small muted">Checks you make appear here.</p> : (
            <ul className="st-recent">
              {recent.map((a) => {
                const w = workers.find((x) => x.id === a.target)
                return (
                  <li key={a.id}>
                    {w ? <button className="st-link" onClick={() => { setQ(w.id); check(w.id) }}>{w.name} · {w.id}</button> : <span className="muted">{a.target}</span>}
                    <span className="small muted">{a.at}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        <Card title="Workers who are behind" sub="Follow up through reminders, not enforcement">
          <p className="small ink2" style={{ marginBottom: 12 }}>Microtek sends reminders in each worker’s language. To reach a group, write an official notice to workers with arrears.</p>
          <div className="row wrap" style={{ gap: 8 }}>
            <Link className="btn sm outline" to={`${BASE}/workers?status=${encodeURIComponent('3+ months overdue')}`}>Workers 3+ months overdue</Link>
            <Link className="btn sm outline" to={`${BASE}/notices`}>Write a notice</Link>
          </div>
        </Card>
      </div>
      {scan && <ScanModal onClose={() => setScan(false)} onScanned={() => { setScan(false); setQ(demoWorker.scansId); check(demoWorker.scansId) }} />}
    </>
  )
}

function Result({ w, onReset, onExport, onOpen }) {
  const r = RESULT[w.status] || RESULT.Due
  const Icon = r.icon
  return (
    <div className="st-result">
      <div className={'st-banner ' + r.tone}><Icon aria-hidden="true" /><b>{r.title}</b><span>{r.text}</span></div>
      <div className="st-result-body">
        <Avatar name={w.name} size="xl" grad />
        <dl className="kv">
          <div><dt>Full name</dt><dd>{w.name}</dd></div>
          <div><dt>Paid up to</dt><dd>{w.paidThrough}</dd></div>
          <div><dt>Passport number</dt><dd>{w.passport}</dd></div>
          <div><dt>Owing, December included</dt><dd className="num">{rm(w.arrears)}</dd></div>
          <div><dt>Nationality</dt><dd>{w.nationality}</dd></div>
          <div><dt>Permit expiry</dt><dd>{w.permitExpiry} <small className="muted" style={{ display: 'block' }}>{permitText(w)}, information only from JIM</small></dd></div>
          <div><dt>Employer</dt><dd>{w.employer}</dd></div>
          <div><dt>SCANS ID</dt><dd className="mono-id">{w.id}</dd></div>
        </dl>
      </div>
      <div className="row wrap st-result-acts">
        <Status>{w.status}</Status>
        <span className="grow" />
        <button className="btn sm ghost" onClick={onReset}><RotateCcw /> Reset</button>
        <button className="btn sm outline" onClick={onExport}><Download /> Export</button>
        <button className="btn sm primary" onClick={onOpen}><ExternalLink /> Open record</button>
      </div>
    </div>
  )
}

function ScanModal({ onClose, onScanned }) {
  const [left, setLeft] = useState(600)
  useEffect(() => { const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(id) }, [])
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0')
  return (
    <Modal title="Scan with your phone" onClose={onClose} actions={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={onScanned} disabled={!left}><Smartphone /> Use demo scan</button></>}>
      <div className="stack" style={{ gap: 14 }}>
        <p className="ink2">Open this one-time link on your work phone, then point the camera at the QR code on the worker’s SCANS card.</p>
        <div className="st-otl">
          <div className="st-qr" aria-hidden="true">{Array.from({ length: 49 }, (_, i) => <i key={i} className={(i * 7 + (i % 5) * 3) % 3 === 0 || [0, 1, 7, 8, 5, 6, 12, 13, 35, 36, 42, 43].includes(i) ? 'on' : ''} />)}</div>
          <div>
            <small className="muted">One-time link</small>
            <b className="mono-id" style={{ display: 'block', fontSize: 15 }}>scans.sabah.gov.my/s/7K4-Q2M</b>
            <small className="muted num">{left ? `Expires in ${mm}:${ss}` : 'Expired. Close and start again.'}</small>
          </div>
        </div>
        <Callout icon={Info}>The SCANS card QR shows contribution status only. It is not an immigration document.</Callout>
      </div>
    </Modal>
  )
}
