// Worker master list and worker profile, shared by the Microtek console (/admin) and
// the State dashboard (/state). The State view is read-only.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Download, Users, CheckCircle2, Clock, AlertTriangle, Send, PencilLine, ShieldCheck, FileText, MapPin, Eye } from 'lucide-react'
import {
  PageHead, Card, Kpi, Status, Pill, Callout, Empty, Tabs, SearchInput, Select, Field, Table, Drawer, Modal, SabahMap, Avatar, useToast,
} from '../../components/ui.jsx'
import {
  REGISTERED, workers, findWorker, paymentsFor, districts, sectors, paidThisMonth, dueThisMonth, overdue1, overdue3, STATUSES, rm, num, pct,
} from '../../data/demo.js'
import { districtByName, siteFor, permitText } from './data.js'
import { logEvent, useStore, addApproval, currentActor } from './store.js'
import './shared.css'

const NATS = ['Indonesia', 'Philippines', 'India', 'Bangladesh', 'Others']
const shortEmp = (s) => s.replace(/ (Sdn Bhd|Bhd)$/, '')

export function WorkerList({ base, readOnly }) {
  const toast = useToast()
  const go = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState('')
  const [nat, setNat] = useState('All')
  const [district, setDistrict] = useState(params.get('district') || 'All')
  const [sector, setSector] = useState('All')
  const [status, setStatus] = useState(params.get('status') || 'All')
  // Permit window in days (0 = any). '?permit=30' or '?permit=90' preselects it.
  const [soon, setSoon] = useState(() => (['30', '90'].includes(params.get('permit')) ? Number(params.get('permit')) : 0))
  const [app, setApp] = useState('All')

  const rows = useMemo(() => workers.filter((w) => {
    const t = q.trim().toLowerCase()
    if (t && !(w.name.toLowerCase().includes(t) || w.id.toLowerCase().includes(t) || w.passport.toLowerCase().replace(/ /g, '').includes(t.replace(/ /g, '')) || w.employer.toLowerCase().includes(t))) return false
    if (nat !== 'All' && w.nationality !== nat) return false
    if (district !== 'All' && w.district !== district) return false
    if (sector !== 'All' && w.sector !== sector) return false
    if (status !== 'All' && w.status !== status) return false
    if (soon && !(w.permitDays >= 0 && w.permitDays <= soon)) return false
    if (app !== 'All' && (app === 'Signed up') !== w.appActive) return false
    return true
  }), [q, nat, district, sector, status, soon, app])

  const anyFilter = q || nat !== 'All' || district !== 'All' || sector !== 'All' || status !== 'All' || soon || app !== 'All'
  const clear = () => { setQ(''); setNat('All'); setDistrict('All'); setSector('All'); setStatus('All'); setSoon(0); setApp('All') }
  const exportList = () => {
    const desc = anyFilter ? [nat, district, sector, status, app, soon ? `permit ends within ${soon} days` : 'All'].filter((x) => x !== 'All').join(', ') || 'Search results' : 'All records'
    logEvent('Exported worker list', `${num(rows.length)} records · ${desc}`)
    toast(`Worker list exported (${num(rows.length)} records). The export is in the audit log.`)
  }

  const cols = [
    { key: 'name', label: 'Worker', render: (w) => <div className="who"><Avatar name={w.name} /><div style={{ minWidth: 0 }}><b>{w.name}</b><small>{w.id}</small></div></div> },
    { key: 'nationality', label: 'Nationality', render: (w) => <span>{w.nationality}<small className="muted" style={{ display: 'block', fontSize: 12 }}>Passport {w.passport}</small></span> },
    { key: 'employer', label: 'Employer', render: (w) => <span>{shortEmp(w.employer)}<small className="muted" style={{ display: 'block', fontSize: 12 }}>{w.sector}</small></span> },
    { key: 'district', label: 'District' },
    { key: 'status', label: 'December 2027', render: (w) => <Status>{w.status}</Status> },
    { key: 'app', label: 'SCANS app', render: (w) => (w.appActive ? <Pill tone="info">Signed up</Pill> : <Pill tone="grey">Not yet</Pill>) },
    { key: 'arrears', label: 'Owing', align: 'r', render: (w) => <span className="num" style={{ fontWeight: w.arrears ? 600 : 400 }}>{rm(w.arrears)}</span> },
    { key: 'permit', label: 'Permit ends', render: (w) => <span className="num">{w.permitExpiry}<small className="muted" style={{ display: 'block', fontSize: 12 }}>{permitText(w)}</small></span> },
  ]

  return (
    <>
      <PageHead title="Worker master list" sub={`${num(REGISTERED)} registered workers. This prototype shows a sample of ${num(workers.length)} records.`}>
        <button className="btn outline" onClick={exportList}><Download /> Export</button>
      </PageHead>
      {readOnly && <Callout icon={ShieldCheck}>Each record you open is written to the audit log with your name and the time. Contribution status only: SCANS does not decide anyone’s immigration status.</Callout>}
      <div className="grid g-4 keep2">
        <Kpi icon={Users} label="Registered" value={num(REGISTERED)} note="Workers on SCANS" />
        <Kpi icon={CheckCircle2} tone="ok" label="Paid for December" value={num(paidThisMonth)} note={pct(paidThisMonth / REGISTERED) + ' of registered'} />
        <Kpi icon={Clock} tone="warn" label="Not yet paid for December" value={num(REGISTERED - paidThisMonth)} note={`${num(dueThisMonth)} due this month · ${num(overdue1)} 1–2 months overdue`} />
        <Kpi icon={AlertTriangle} tone="bad" label="3+ months overdue" value={num(overdue3)} note="Never leads to permit action" />
      </div>
      <Card title="Worker records" sub={anyFilter ? `${num(rows.length)} of ${num(workers.length)} sample records match` : `Sample of ${num(workers.length)} records. Choose a row to open the profile.`}
        action={anyFilter ? <button className="link" onClick={clear}>Clear filters</button> : null}>
        <div className="stack" style={{ gap: 14 }}>
          <div className="gv-filters f6">
            <SearchInput value={q} onChange={setQ} placeholder="Search name, SCANS ID, passport or employer" />
            <Select label="Nationality" value={nat} onChange={setNat} options={[{ value: 'All', label: 'All nationalities' }, ...NATS]} />
            <Select label="District" value={district} onChange={setDistrict} options={[{ value: 'All', label: 'All districts' }, ...districts.map((d) => d.name)]} />
            <Select label="Sector" value={sector} onChange={setSector} options={[{ value: 'All', label: 'All sectors' }, ...sectors.map((s) => s.name)]} />
            <Select label="Status" value={status} onChange={setStatus} options={[{ value: 'All', label: 'All statuses' }, ...STATUSES]} />
            <Select label="SCANS app" value={app} onChange={setApp} options={[{ value: 'All', label: 'App: everyone' }, 'Signed up', 'Not signed up']} />
            <Select label="Permit ends" value={String(soon)} onChange={(v) => setSoon(Number(v))} options={[{ value: '0', label: 'Any permit date' }, { value: '30', label: 'Permit ends within 30 days' }, { value: '90', label: 'Permit ends within 90 days' }]} />
          </div>
          <Table columns={cols} rows={rows} onRowClick={(w) => go(`${base}/workers/${w.id}`)} pageSize={10} />
        </div>
      </Card>
    </>
  )
}

/* ---------------------------------------------------------------------- */

const CORRECTABLE = [
  { key: 'name', label: 'Name spelling' },
  { key: 'dob', label: 'Date of birth' },
  { key: 'passport', label: 'Passport number' },
  { key: 'phone', label: 'Phone number' },
  { key: 'site', label: 'Work site' },
  { key: 'language', label: 'Preferred language' },
]

export function WorkerProfile({ base, readOnly }) {
  const { id } = useParams()
  const w = findWorker(id)
  const toast = useToast()
  const [tab, setTab] = useState('Overview')
  const [remind, setRemind] = useState(false)
  const [correct, setCorrect] = useState(false)
  const audit = useStore((s) => s.audit)
  const [viewedAt] = useState(() => { const d = new Date(); return [d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join(':') })

  useEffect(() => { if (w) logEvent(readOnly ? 'Looked up worker record' : 'Viewed worker record', w.id) }, [w && w.id, readOnly])

  if (!w) {
    return (
      <>
        <PageHead title="Worker not found" back={`${base}/workers`} crumbs={[{ label: 'Worker master list', to: `${base}/workers` }, { label: id }]} />
        <Card><Empty title="No record with this SCANS ID">Check the ID, or search the worker master list by name or passport number.</Empty></Card>
      </>
    )
  }
  const pays = paymentsFor(w)
  const methodCount = pays.reduce((m, p) => ({ ...m, [p.method]: (m[p.method] || 0) + 1 }), {})
  const usual = Object.entries(methodCount).sort((a, b) => b[1] - a[1])[0]
  const permitShare = Math.max(0, Math.min(1, w.permitDays / 730))
  const d = districtByName[w.district]
  const views = audit.filter((a) => a.target === w.id)

  return (
    <>
      <PageHead title="Worker profile" back={`${base}/workers`} crumbs={[{ label: 'Worker master list', to: `${base}/workers` }, { label: w.name }]}>
        {!readOnly && (
          <>
            <button className="btn outline" onClick={() => setCorrect(true)}><PencilLine /> Open record correction</button>
            <button className="btn primary" disabled={w.status === 'Paid'} title={w.status === 'Paid' ? 'This worker has paid for December' : undefined} onClick={() => setRemind(true)}><Send /> Send reminder</button>
          </>
        )}
      </PageHead>
      <Callout icon={Eye}>
        Opened by {currentActor().replace(/ \(.*\)/, '')} at {viewedAt}. This view is written to the audit log. {readOnly ? 'The State view is read-only.' : 'SCANS has no function to issue, suspend or cancel a permit.'}
      </Callout>
      <div className="grid g-profile">
        <Card>
          <div className="gv-profile">
            <Avatar name={w.name} size="xl" grad />
            <h2>{w.name}</h2>
            <div className="id">{w.id}</div>
            <Pill tone="grey">{w.nationality}</Pill>
            <div className="gv-arrears">
              <div><b className="num">{rm(w.arrears)}</b><small>Owing, December included</small></div>
              <Status>{w.status}</Status>
            </div>
            <div className="gv-permit">
              <div className="row between"><span className="b">Permit expiry</span><span className="muted num">{permitText(w)}</span></div>
              <div className="bar"><span style={{ width: pct(permitShare), background: w.permitDays < 90 ? 'var(--warnFill)' : undefined }} /></div>
              <div className="row between small muted" style={{ marginTop: 6 }}><span>Ends {w.permitExpiry}</span><span>Information only, from JIM</span></div>
            </div>
            <dl className="kv one" style={{ width: '100%', textAlign: 'left', marginTop: 10 }}>
              <div><dt>Employer</dt><dd><Link to={`${base}/employers/${w.employerId}`}>{w.employer}</Link></dd></div>
              <div><dt>Paid up to</dt><dd>{w.paidThrough}</dd></div>
            </dl>
          </div>
        </Card>
        <Card>
          <Tabs items={['Overview', 'Financial', 'Location', 'History', 'Documents']} value={tab} onChange={setTab} label="Worker record" />
          <div style={{ paddingTop: 18 }}>
            {tab === 'Overview' && (
              <dl className="kv">
                <div className="span-all" style={{ gridColumn: '1 / -1' }}><dt>Full name</dt><dd>{w.name}</dd></div>
                <div><dt>Gender</dt><dd>{w.gender}</dd></div>
                <div><dt>Date of birth</dt><dd>{w.dob}</dd></div>
                <div><dt>SCANS ID</dt><dd>{w.id}</dd></div>
                <div><dt>Nationality</dt><dd>{w.nationality}</dd></div>
                <div><dt>Passport number</dt><dd>{w.passport}</dd></div>
                <div><dt>PLKS number</dt><dd>{w.plks}</dd></div>
                <div><dt>Employer</dt><dd><Link to={`${base}/employers/${w.employerId}`}>{w.employer}</Link></dd></div>
                <div><dt>Job</dt><dd>{w.role} · {w.sector}</dd></div>
                <div><dt>Arrival date</dt><dd>{w.arrived}</dd></div>
                <div><dt>Preferred language</dt><dd>{w.language}</dd></div>
                <div><dt>Phone</dt><dd>{w.phone}</dd></div>
                <div><dt>SCANS app</dt><dd>{w.appActive ? 'Signed up' : 'Not signed up yet'}</dd></div>
                <div><dt>Employer may pay for this worker</dt><dd>{w.consent ? 'Yes, consent given' : 'No consent given'}</dd></div>
                <div><dt>Records matched</dt><dd>SWIMS, eNORES, KDN identity check</dd></div>
              </dl>
            )}
            {tab === 'Financial' && (
              <div className="stack">
                <div className="gv-mini">
                  <div><span>Paid up to</span><b>{w.paidThrough}</b></div>
                  <div><span>Owing, December included</span><b className="num">{rm(w.arrears)}</b></div>
                  <div><span>Monthly contribution</span><b className="num">{rm(100)}</b></div>
                  <div><span>Usual method</span><b style={{ fontSize: 14 }}>{usual ? usual[0] : '—'}</b></div>
                  <div><span>Paid since July</span><b className="num">{rm(pays.reduce((s, p) => s + p.amount, 0))}</b></div>
                </div>
                {w.arrears > 0 && <Callout tone="warn" icon={AlertTriangle}>{rm(w.arrears)} not yet paid. Arrears lead to reminders only. They never lead to permit action, passport holding or travel restriction.</Callout>}
                <Table pageSize={6} rows={pays} columns={[
                  { key: 'id', label: 'Receipt', render: (p) => <b className="mono-id">{p.id}</b> },
                  { key: 'month', label: 'Period' },
                  { key: 'amount', label: 'Amount', align: 'r', render: (p) => rm(p.amount) },
                  { key: 'method', label: 'Method' },
                  { key: 'date', label: 'Paid on' },
                  { key: 'by', label: 'Paid by', render: (p) => (p.by === w.name ? 'Worker' : shortEmp(p.by)) },
                ]} empty={<Empty title="No payments yet">Payments made in the app, at 7-Eleven or by the employer will appear here.</Empty>} />
              </div>
            )}
            {tab === 'Location' && (
              <div className="grid g-2" style={{ alignItems: 'start' }}>
                <div className="stack" style={{ gap: 14 }}>
                  <dl className="kv one">
                    <div><dt>District</dt><dd>{w.district}</dd></div>
                    <div><dt>Work site</dt><dd>{siteFor(w)}</dd></div>
                    <div><dt>Sector</dt><dd>{w.sector}</dd></div>
                    <div><dt>Employer</dt><dd>{w.employer}</dd></div>
                  </dl>
                  {d && <div className="gv-kv-card small"><MapPin size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />{w.district}: {num(d.workers)} registered workers, {pct(d.rate)} paid for December.</div>}
                  <p className="small muted">Location is the work site on the employer’s eNORES record, not a tracked position.</p>
                </div>
                {d && <div className="gv-mini-map"><SabahMap districts={districts} selected={d.id} onSelect={() => {}} compact /></div>}
              </div>
            )}
            {tab === 'History' && (
              <ol className="gv-timeline">
                {views.slice(0, 4).map((a) => <li key={a.id}><span className="dot info" /><b>{a.action}</b><span>{a.who} · {a.at}</span></li>)}
                {pays.map((p) => <li key={p.id}><span className="dot ok" /><b>Payment received for {p.month}</b><span>{rm(p.amount)} by {p.method} · {p.date} · {p.id}</span></li>)}
                {w.arrears > 0 && <li><span className="dot warn" /><b>Payment reminder sent</b><span>App and SMS in {w.language} · 10 Dec 2027</span></li>}
                <li><span className="dot" /><b>Signed up to the SCANS app</b><span>{w.appActive ? 'Passport scan and KDN face check passed · 8 Jul 2027' : 'Not signed up yet'}</span></li>
                <li><span className="dot" /><b>Record created from SWIMS and eNORES</b><span>Matched to {shortEmp(w.employer)} · 2 Jul 2027</span></li>
              </ol>
            )}
            {tab === 'Documents' && (
              <div className="stack">
                <div className="grid g-2">
                  <div className="gv-doc passport">
                    <span className="spec" aria-hidden="true">SPECIMEN</span>
                    <div className="top"><span>Passport · {w.nationality}</span><span>P</span></div>
                    <div className="body">
                      <span className="photo">{w.name.split(' ').map((x) => x[0]).join('')}</span>
                      <dl>
                        <div><dt>Name</dt><dd>{w.name.toUpperCase()}</dd></div>
                        <div><dt>Number</dt><dd>{w.passport}</dd></div>
                        <div><dt>Date of birth</dt><dd>{w.dob}</dd></div>
                        <div><dt>Sex</dt><dd>{w.gender === 'Male' ? 'M' : 'F'}</dd></div>
                      </dl>
                    </div>
                    <div className="mrz" aria-hidden="true">{`P<${w.nationality.slice(0, 3).toUpperCase()}${w.name.toUpperCase().replace(/ /g, '<<')}<<<<<<<<`}</div>
                  </div>
                  <div className="gv-doc plks">
                    <span className="spec" aria-hidden="true">SPECIMEN</span>
                    <div className="top"><span>Pas Lawatan Kerja Sementara</span><span>PLKS</span></div>
                    <div className="body">
                      <span className="photo">{w.name.split(' ').map((x) => x[0]).join('')}</span>
                      <dl>
                        <div><dt>PLKS number</dt><dd>{w.plks}</dd></div>
                        <div><dt>Valid until</dt><dd>{w.permitExpiry}</dd></div>
                        <div><dt>Employer</dt><dd>{shortEmp(w.employer)}</dd></div>
                        <div><dt>Sector</dt><dd>{w.sector}</dd></div>
                      </dl>
                    </div>
                    <div className="mrz">Information only, read from JIM</div>
                  </div>
                </div>
                <Callout icon={FileText}>Specimen images for the prototype. Real document images are shown only to authorised officers and every view is logged. SCANS registration is not an immigration check.</Callout>
              </div>
            )}
          </div>
        </Card>
      </div>
      {remind && <ReminderModal w={w} onClose={() => setRemind(false)} onSent={(ch) => { setRemind(false); logEvent('Sent payment reminder', w.id); toast(`Reminder sent to ${w.name} by ${ch.join(', ')} in ${w.language}`) }} />}
      {correct && <CorrectionDrawer w={w} onClose={() => setCorrect(false)} onDone={(f) => { setCorrect(false); toast(`Correction to ${f.toLowerCase()} sent for a second check. It is in the review queue.`) }} />}
    </>
  )
}

function ReminderModal({ w, onClose, onSent }) {
  const [ch, setCh] = useState(['App', 'SMS'])
  const toggle = (c) => setCh(ch.includes(c) ? ch.filter((x) => x !== c) : [...ch, c])
  return (
    <Modal title="Send a payment reminder" onClose={onClose} actions={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!ch.length} onClick={() => onSent(ch)}><Send /> Send reminder</button></>}>
      <div className="stack" style={{ gap: 14 }}>
        <p className="ink2">To {w.name} ({w.id}) in {w.language}.</p>
        <div className="chips">{['App', 'SMS', 'WhatsApp'].map((c) => <button key={c} className="chip" aria-pressed={ch.includes(c)} onClick={() => toggle(c)}>{c}</button>)}</div>
        <div className="gv-lang">
          <b>Message (English shown)</b>
          <p>{w.arrears > 100 ? `You owe RM${w.arrears}, December 2027 included.` : 'Your contribution for December 2027 is RM100.'} Pay in the SCANS app, at any 7-Eleven, or ask your employer. Paying late does not affect your permit.</p>
        </div>
        <p className="small muted">The worker gets this in {w.language}. The reminder is written to the audit log.</p>
      </div>
    </Modal>
  )
}

function CorrectionDrawer({ w, onClose, onDone }) {
  const [field, setField] = useState('name')
  const [value, setValue] = useState('')
  const [source, setSource] = useState('SWIMS')
  const [reason, setReason] = useState('')
  const [tried, setTried] = useState(false)
  const f = CORRECTABLE.find((x) => x.key === field)
  const current = field === 'site' ? siteFor(w) : w[field]
  const ok = value.trim() && reason.trim().length >= 10
  const submit = () => {
    setTried(true)
    if (!ok) return
    addApproval({ type: 'Record mismatch', name: w.name, detail: `${f.label}: “${current}” to “${value.trim()}” · source ${source}`, workerId: w.id })
    logEvent('Opened record correction', `${w.id} · ${f.label}`)
    onDone(f.label)
  }
  return (
    <Drawer title="Open record correction" sub={`${w.name} · ${w.id}`} onClose={onClose}
      footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={submit}>Send for second check</button></>}>
      <Callout>A second officer checks every correction against the source system before it is applied. A correction never changes a worker’s permit or immigration status.</Callout>
      <div className="form-grid">
        <Field label="Detail to correct" full>
          <select className="select" value={field} onChange={(e) => { setField(e.target.value); setValue('') }}>
            {CORRECTABLE.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Current value" full><input className="input" readOnly value={current} /></Field>
        <Field label="Correct value" full error={tried && !value.trim() ? 'Enter the correct value.' : null}>
          <input className={'input' + (tried && !value.trim() ? ' err' : '')} value={value} onChange={(e) => setValue(e.target.value)} placeholder={`New ${f.label.toLowerCase()}`} />
        </Field>
        <Field label="Source of the correct value" full>
          <select className="select" value={source} onChange={(e) => setSource(e.target.value)}>
            {['SWIMS', 'eNORES', 'Passport scan', 'Worker request at help desk', 'Employer request'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Reason" full hint="At least 10 characters. The State and auditors can read this." error={tried && reason.trim().length < 10 ? 'Say why the record is wrong, in at least 10 characters.' : null}>
          <textarea className={'input' + (tried && reason.trim().length < 10 ? ' err' : '')} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: name in SWIMS differs from the passport scan" />
        </Field>
      </div>
    </Drawer>
  )
}
