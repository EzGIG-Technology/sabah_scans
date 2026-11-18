// Workers (/jim/workers, /jim/workers/:id). Read-only list and record for JIM officers:
// identity, PLKS and permit expiry from JIM, employer, and contribution status only.
// No payments, phone numbers, wages or complaints. Every record opened and every export is logged.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Download, Users, ShieldCheck, Eye, CheckCircle2, Clock, AlertTriangle, GitCompareArrows, ScanLine } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Pill, Callout, Empty, SearchInput, Select, Table, Avatar, useToast } from '../../components/ui.jsx'
import { REGISTERED, workers, findWorker, districts, overdue1, overdue3, paidThisMonth, num, pct } from '../../data/demo.js'
import { permitText } from '../shared/data.js'
import { logEvent, useStore, currentActor } from '../shared/store.js'
import { BASE, contrib, CONTRIB_LEVELS, useJim } from './data.js'

const NATS = ['Indonesia', 'Philippines', 'India', 'Bangladesh', 'Others']
const shortEmp = (s) => s.replace(/ (Sdn Bhd|Bhd)$/, '')

export function JimWorkerList() {
  const toast = useToast()
  const go = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState('')
  const [nat, setNat] = useState('All')
  const [district, setDistrict] = useState(params.get('district') || 'All')
  const [level, setLevel] = useState('All')
  const rows = useMemo(() => workers.filter((w) => {
    const t = q.trim().toLowerCase().replace(/[\s-]/g, '')
    if (t && !(w.name.toLowerCase().replace(/ /g, '').includes(t) || w.id.toLowerCase().includes(t) || w.passport.toLowerCase().replace(/ /g, '').includes(t) || w.plks.toLowerCase().replace(/-/g, '').includes(t))) return false
    if (nat !== 'All' && w.nationality !== nat) return false
    if (district !== 'All' && w.district !== district) return false
    if (level !== 'All' && contrib(w).label !== level) return false
    return true
  }), [q, nat, district, level])
  const any = q || nat !== 'All' || district !== 'All' || level !== 'All'
  const clear = () => { setQ(''); setNat('All'); setDistrict('All'); setLevel('All') }
  const exportList = () => {
    const desc = [nat, district, level].filter((x) => x !== 'All').join(', ') || (q ? 'Search results' : 'All records')
    logEvent('Exported worker list', `${num(rows.length)} records · ${desc} · contribution status only`)
    toast(`Worker list exported (${num(rows.length)} records). The export is in the audit log.`)
  }
  return (
    <>
      <PageHead title="Workers" sub={`${num(REGISTERED)} workers registered on SCANS. This prototype shows a sample of ${num(workers.length)} records.`}>
        <button className="btn outline" onClick={exportList}><Download /> Export</button>
      </PageHead>
      <Callout icon={ShieldCheck}>Read-only. You see identity, permit dates from JIM and contribution status. Contribution status is for information only and must not be used to refuse, delay or cancel a permit. Each record you open is written to the audit log.</Callout>
      <div className="grid g-4 keep2">
        <Kpi icon={Users} label="Registered on SCANS" value={num(REGISTERED)} />
        <Kpi icon={CheckCircle2} tone="ok" label="Paid for June" value={num(paidThisMonth)} note={pct(paidThisMonth / REGISTERED) + ' of registered'} />
        <Kpi icon={Clock} tone="warn" label="1 month owing" value={num(overdue1)} note="Reminders only" />
        <Kpi icon={AlertTriangle} tone="bad" label="3+ months owing" value={num(overdue3)} note="Reminders only" />
      </div>
      <Card title="Worker records" sub={any ? `${num(rows.length)} of ${num(workers.length)} sample records match` : 'Choose a row to open the record.'}
        action={any ? <button className="link" onClick={clear}>Clear filters</button> : null}>
        <div className="stack" style={{ gap: 14 }}>
          <div className="jim-filters four">
            <SearchInput value={q} onChange={setQ} placeholder="Search name, SCANS ID, passport or PLKS" />
            <Select label="Nationality" value={nat} onChange={setNat} options={[{ value: 'All', label: 'All nationalities' }, ...NATS]} />
            <Select label="District" value={district} onChange={setDistrict} options={[{ value: 'All', label: 'All districts' }, ...districts.map((d) => d.name)]} />
            <Select label="Contribution" value={level} onChange={setLevel} options={[{ value: 'All', label: 'Any contribution status' }, ...CONTRIB_LEVELS]} />
          </div>
          <Table rows={rows} pageSize={10} onRowClick={(w) => go(`${BASE}/workers/${w.id}`)} columns={[
            { key: 'name', label: 'Worker', render: (w) => <div className="who"><Avatar name={w.name} /><div style={{ minWidth: 0 }}><b>{w.name}</b><small>{w.id}</small></div></div> },
            { key: 'nationality', label: 'Nationality', render: (w) => <span>{w.nationality}<small className="muted" style={{ display: 'block', fontSize: 12 }}>Passport {w.passport}</small></span> },
            { key: 'plks', label: 'PLKS', render: (w) => <span className="mono-id small">{w.plks}</span> },
            { key: 'permit', label: 'Permit ends', render: (w) => <span className="num">{w.permitExpiry}<small className="muted" style={{ display: 'block', fontSize: 12 }}>{permitText(w)}</small></span> },
            { key: 'employer', label: 'Employer', render: (w) => <span>{shortEmp(w.employer)}<small className="muted" style={{ display: 'block', fontSize: 12 }}>{w.district}</small></span> },
            { key: 'contrib', label: 'Contribution', render: (w) => { const c = contrib(w); return <Status tone={c.tone}>{c.label}</Status> } },
          ]} />
        </div>
      </Card>
    </>
  )
}

export function JimWorkerProfile() {
  const { id } = useParams()
  const w = findWorker(id)
  const audit = useStore((s) => s.audit)
  const mismatch = useJim((s) => s.matches.find((m) => m.workerId === id))
  const [viewedAt] = useState(() => { const d = new Date(); return [d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join(':') })
  useEffect(() => { if (w) logEvent('Looked up worker record', w.id) }, [w && w.id])

  if (!w) {
    return (
      <>
        <PageHead title="Worker not found" back={`${BASE}/workers`} crumbs={[{ label: 'Workers', to: `${BASE}/workers` }, { label: id }]} />
        <Card><Empty title="No record with this SCANS ID">Check the ID, or use the status check with a passport or PLKS number.</Empty></Card>
      </>
    )
  }
  const c = contrib(w)
  const views = audit.filter((a) => a.target === w.id || a.target.startsWith(w.id + ' ')).slice(0, 6)
  const permitShare = Math.max(0, Math.min(1, w.permitDays / 730))
  return (
    <>
      <PageHead title="Worker record" back={`${BASE}/workers`} crumbs={[{ label: 'Workers', to: `${BASE}/workers` }, { label: w.name }]}>
        <Link className="btn outline" to={`${BASE}/check`}><ScanLine /> New status check</Link>
      </PageHead>
      <Callout icon={Eye}>
        Opened by {currentActor().replace(/ \(.*\)/, '')} at {viewedAt}. This view is written to the audit log. Contribution status is for information only and must not be used to refuse, delay or cancel a permit.
      </Callout>
      <div className="grid g-profile">
        <Card>
          <div className="gv-profile">
            <Avatar name={w.name} size="xl" grad />
            <h2>{w.name}</h2>
            <div className="id">{w.id}</div>
            <Pill tone="grey">{w.nationality}</Pill>
            <div className="gv-arrears">
              <div><b>{w.paidThrough}</b><small>Paid up to</small></div>
              <Status tone={c.tone}>{c.label}</Status>
            </div>
            <div className="gv-permit">
              <div className="row between"><span className="b">Permit expiry</span><span className="muted num">{permitText(w)}</span></div>
              <div className="bar"><span style={{ width: pct(permitShare), background: w.permitDays < 90 ? 'var(--warnFill)' : undefined }} /></div>
              <div className="row between small muted" style={{ marginTop: 6 }}><span>Ends {w.permitExpiry}</span><span>From JIM</span></div>
            </div>
          </div>
        </Card>
        <div className="stack">
          <Card title="Record" sub="Identity from SWIMS and the passport scan, permit from JIM, employer from eNORES">
            <dl className="kv">
              <div style={{ gridColumn: '1 / -1' }}><dt>Full name</dt><dd>{w.name}</dd></div>
              <div><dt>Gender</dt><dd>{w.gender}</dd></div>
              <div><dt>Date of birth</dt><dd>{w.dob}</dd></div>
              <div><dt>Nationality</dt><dd>{w.nationality}</dd></div>
              <div><dt>Passport number</dt><dd>{w.passport}</dd></div>
              <div><dt>PLKS number</dt><dd className="mono-id">{w.plks}</dd></div>
              <div><dt>Permit expiry (JIM)</dt><dd>{w.permitExpiry}</dd></div>
              <div><dt>Employer</dt><dd>{w.employer}</dd></div>
              <div><dt>Job and sector</dt><dd>{w.role} · {w.sector}</dd></div>
              <div><dt>District</dt><dd>{w.district}</dd></div>
              <div><dt>Arrival date</dt><dd>{w.arrived}</dd></div>
              <div><dt>Contribution status</dt><dd><Status tone={c.tone}>{c.label}</Status></dd></div>
              <div><dt>Paid up to</dt><dd>{w.paidThrough}</dd></div>
            </dl>
          </Card>
          <div className="grid g-2" style={{ alignItems: 'start' }}>
            <Card title="Match with JIM" sub="SCANS record against JIM permit data">
              {mismatch ? (
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row wrap" style={{ gap: 8 }}><GitCompareArrows size={16} aria-hidden="true" /><b className="small">{mismatch.field} differs</b><Status tone={mismatch.status === 'Waiting' ? 'warn' : mismatch.status === 'Confirmed' ? 'ok' : 'info'}>{mismatch.status}</Status></div>
                  <p className="small ink2">SCANS: {mismatch.scans} · JIM: {mismatch.jim}</p>
                  <Link className="st-link" to={`${BASE}/records`}>Open record matching</Link>
                </div>
              ) : (
                <div className="row" style={{ gap: 8 }}><CheckCircle2 size={18} color="var(--ok)" aria-hidden="true" /><span className="small">Matched. Name, passport, date of birth and employer agree.</span></div>
              )}
            </Card>
            <Card title="Who opened this record" sub="From the audit log">
              {views.length === 0 ? <p className="small muted">No views yet.</p> : (
                <ol className="gv-timeline">
                  {views.map((a) => <li key={a.id}><span className="dot info" /><b>{a.action}</b><span>{a.who} · {a.at}</span></li>)}
                </ol>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
