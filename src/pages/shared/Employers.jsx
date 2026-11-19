// Employer list and employer profile, shared by /admin and /state.
// The list follows the MicroPay guide (Nov 2026): totals bar, four KPI cards, compliance score and
// portal status columns. Only the Microtek console can send a new registration invitation.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Building2, Users, CheckCircle2, Download, Wallet, ShieldCheck, Send, Mail, Plus, SlidersHorizontal, CalendarClock, MonitorOff, ShieldAlert, SearchCheck, Loader2,
} from 'lucide-react'
import { PageHead, Card, Kpi, Status, Pill, Callout, Empty, Tabs, SearchInput, Select, Table, Mono, Avatar, Modal, Drawer, Field, useToast } from '../../components/ui.jsx'
import { employers, employerTotals, districts, sectors, rm, num, pct } from '../../data/demo.js'
import { companyCompliance } from '../admin/data.js'
import { employerDetail, employerScansId, employerPortal } from './data.js'
import { logEvent, useStore, addInvitedEmployer } from './store.js'
import './shared.css'

const STATUSES = ['All paid', 'Partly paid', 'Behind']

// Registration and portal figures for all 4,821 employers (demo-only).
// Active + pending renewal + inactive portal = 4,821. Non-compliance overlaps the three and
// matches the "Under half paid" figure on the Microtek command centre.
const EMP_KPI = { active: 4192, renewal: 341, inactive: 288, nonCompliant: companyCompliance.find((c) => c.label === 'Under half paid').value }

// Compliance score = share of the employer's workers paid for June. Used for reminders only.
const scoreTone = (p) => (p >= 80 ? 'ok' : p >= 50 ? 'warn' : 'bad')
function Score({ e }) {
  if (e.paid == null) return <span className="small muted">Not registered yet</span>
  const p = Math.round((e.paid / e.workers) * 100)
  const t = scoreTone(p)
  return (
    <div className={'gv-score ' + t} aria-label={`${p}% of workers paid`}>
      <b className="num">{p}%</b>
      <div className="bar"><span style={{ width: p + '%' }} /></div>
    </div>
  )
}

export function EmployerList({ base, canRegister = false }) {
  const go = useNavigate()
  const toast = useToast()
  const invited = useStore((s) => s.invitedEmployers)
  const [q, setQ] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [district, setDistrict] = useState('All')
  const [sector, setSector] = useState('All')
  const [status, setStatus] = useState('All')
  const [band, setBand] = useState('All')
  const [portal, setPortal] = useState('All')
  const [register, setRegister] = useState(false)
  const all = useMemo(() => [...invited, ...employers].map((e) => ({ ...e, scansId: employerScansId(e), portal: employerPortal(e) })), [invited])
  const rows = useMemo(() => all.filter((e) => {
    const t = q.trim().toLowerCase()
    if (t && !(e.name.toLowerCase().includes(t) || e.ssm.includes(t) || e.scansId.toLowerCase().includes(t))) return false
    if (district !== 'All' && e.district !== district) return false
    if (sector !== 'All' && e.sector !== sector) return false
    if (status !== 'All' && e.status !== status) return false
    if (band !== 'All' && !(e.paid != null && e.paid / e.workers < Number(band) / 100)) return false
    if (portal !== 'All' && e.portal !== portal) return false
    return true
  }).map((e, i) => ({ ...e, no: i + 1 })), [all, q, district, sector, status, band, portal])
  const activeFilters = [district, sector, status, band, portal].filter((v) => v !== 'All').length
  const clear = () => { setQ(''); setDistrict('All'); setSector('All'); setStatus('All'); setBand('All'); setPortal('All') }
  const open = (e) => {
    if (e.status === 'Invited') toast(`Invitation sent to ${e.pic}. The profile opens once the company completes registration.`)
    else go(`${base}/employers/${e.id}`)
  }
  return (
    <>
      <PageHead title="Employers" sub="Companies registered in SSM and eNORES that employ foreign workers in Sabah. Employers see contribution status only.">
        {canRegister && <button className="btn primary" onClick={() => setRegister(true)}><Plus /> New registration</button>}
      </PageHead>
      <Card>
        <div className="gv-emp-bar">
          <b className="total num">{num(employerTotals.count)} employers</b>
          {invited.length > 0 && <Pill tone="info">{invited.length} invited</Pill>}
          <SearchInput value={q} onChange={setQ} placeholder="Search name, SCANS ID or SSM number" />
          <div className="acts">
            <button className={'btn outline' + (showFilters ? ' on' : '')} aria-expanded={showFilters} aria-controls="emp-filters" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal /> Filter{activeFilters > 0 && <span className="gv-count">{activeFilters}</span>}
            </button>
            <button className="btn outline" onClick={() => { logEvent('Exported employer list', `${rows.length} employers`); toast('Employer list exported. The export is in the audit log.') }}><Download /> Export</button>
          </div>
        </div>
        {showFilters && (
          <div className="gv-emp-filters" id="emp-filters">
            <Select label="District" value={district} onChange={setDistrict} options={[{ value: 'All', label: 'All districts' }, ...districts.map((d) => d.name)]} />
            <Select label="Sector" value={sector} onChange={setSector} options={[{ value: 'All', label: 'All sectors' }, ...sectors.map((x) => x.name)]} />
            <Select label="Paid for June" value={status} onChange={setStatus} options={[{ value: 'All', label: 'Any payment' }, ...STATUSES]} />
            <Select label="Compliance score" value={band} onChange={setBand} options={[{ value: 'All', label: 'Any compliance' }, { value: '80', label: 'Under 80%' }, { value: '50', label: 'Under 50%' }]} />
            <Select label="Portal status" value={portal} onChange={setPortal} options={[{ value: 'All', label: 'Any portal status' }, 'Active', 'Inactive', 'Invited']} />
            <button className="btn ghost" disabled={!activeFilters && !q} onClick={clear}>Clear filters</button>
          </div>
        )}
      </Card>
      <div className="grid g-4 keep2">
        <Kpi icon={Building2} tone="ok" label="Active on the portal" value={num(EMP_KPI.active)} delta="+3.2%" note="Signed in within 90 days, up since May" />
        <Kpi icon={CalendarClock} tone="warn" label="Pending renewal" value={num(EMP_KPI.renewal)} note="Registration due within 60 days" />
        <Kpi icon={MonitorOff} tone="purple" label="Inactive portal" value={num(EMP_KPI.inactive)} note="No sign-in for 90 days" />
        <Kpi icon={ShieldAlert} tone="bad" label="Non-compliance" value={num(EMP_KPI.nonCompliant)} note="Under 50% of workers paid" />
      </div>
      <Card title="Employer records" sub={`${rows.length} of ${all.length} sample employers. Compliance score is the share of workers paid for June. It is used for reminders only and never affects permits.`}
        action={(q || activeFilters) ? <button className="link" onClick={clear}>Clear filters</button> : null}>
        <Table rows={rows} onRowClick={open} columns={[
          { key: 'no', label: 'No.', render: (e) => <span className="muted num">{e.no}</span> },
          { key: 'name', label: 'Company', render: (e) => <div className="who"><Mono name={e.name} /><div style={{ minWidth: 0 }}><b>{e.name}</b><small>{e.district}</small></div></div> },
          { key: 'scansId', label: 'SCANS employer ID', render: (e) => <span className="mono-id">{e.scansId}</span> },
          { key: 'ssm', label: 'SSM reg. no.', render: (e) => <span className="num">{e.ssm}</span> },
          { key: 'sector', label: 'Sector', render: (e) => <span className="pill grey">{e.sector}</span> },
          { key: 'workers', label: 'Total workers', align: 'r', render: (e) => <span className="num">{num(e.workers)}</span> },
          { key: 'score', label: 'Compliance score', render: (e) => <Score e={e} /> },
          { key: 'portal', label: 'Portal status', render: (e) => <Status tone={e.portal === 'Invited' ? 'info' : undefined}>{e.portal}</Status> },
        ]} />
      </Card>
      {register && <NewRegistration onClose={() => setRegister(false)} />}
    </>
  )
}

/* ---------- New registration (Microtek only) ---------- */
// Sample SSM and eNORES look-up. 202001017721 is the sign-up waiting in Approvals.
const SSM_KNOWN = { '202001017721': { name: 'Lahad Datu Oil Palm Mill Sdn Bhd', sector: 'Plantation', district: 'Lahad Datu', workers: 286 } }
const SSM_SAMPLES = [
  { name: 'Kunak Palm Oil Estates Sdn Bhd', sector: 'Plantation', district: 'Lahad Datu', workers: 518 },
  { name: 'Papar Poultry Farm Sdn Bhd', sector: 'Agriculture', district: 'Beaufort', workers: 64 },
  { name: 'Tuaran Building Works Sdn Bhd', sector: 'Construction', district: 'Kota Kinabalu', workers: 142 },
  { name: 'Sandakan Bay Resort Sdn Bhd', sector: 'Services', district: 'Sandakan', workers: 87 },
  { name: 'Tawau Quarry Industries Sdn Bhd', sector: 'Mining and quarrying', district: 'Tawau', workers: 39 },
]
const DIST_CODE = { 'Lahad Datu': 'LD', Sandakan: 'SDK', Tawau: 'TWU', Kudat: 'KDT', Keningau: 'KGU', 'Kota Kinabalu': 'KK', Semporna: 'SPN', Beaufort: 'BFT' }
function lookUp(ssm) {
  const hit = SSM_KNOWN[ssm] || SSM_SAMPLES[[...ssm].reduce((s, d) => s + Number(d), 0) % SSM_SAMPLES.length]
  return { ...hit, enores: `JTKS-${DIST_CODE[hit.district]}-${ssm.slice(-6)}` }
}

function NewRegistration({ onClose }) {
  const toast = useToast()
  const invited = useStore((s) => s.invitedEmployers)
  const [ssm, setSsm] = useState('')
  const [check, setCheck] = useState(null) // null | 'checking' | { error } | company
  const [pic, setPic] = useState({ name: '', email: '', phone: '' })
  const [touched, setTouched] = useState({})
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const ssmOk = /^\d{12}$/.test(ssm)
  const found = check && check !== 'checking' && !check.error ? check : null
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pic.email.trim())
  const phoneOk = pic.phone.replace(/\D/g, '').length >= 9
  const nameOk = pic.name.trim().length >= 3
  const ready = found && nameOk && emailOk && phoneOk

  const runCheck = () => {
    const dup = employers.find((e) => e.ssm === ssm) || invited.find((e) => e.ssm === ssm)
    if (dup) { setCheck({ error: dup.status === 'Invited' ? `An invitation was already sent to ${dup.name}.` : `Already registered on SCANS as ${dup.name}.` }); return }
    setCheck('checking')
    timer.current = setTimeout(() => {
      logEvent('Looked up SSM and eNORES record', 'SSM ' + ssm)
      setCheck(lookUp(ssm))
    }, 700)
  }
  const send = () => {
    const id = addInvitedEmployer({ name: found.name, ssm, sector: found.sector, district: found.district, workers: found.workers, paid: null, enores: found.enores, pic: pic.name.trim(), email: pic.email.trim(), phone: pic.phone.trim() })
    logEvent('Sent employer registration invitation', `${found.name} · SSM ${ssm} · ${id}`)
    toast(`Invitation sent to ${pic.name.trim()}. ${found.name} is at the top of the list as Invited.`)
    onClose()
  }
  const set = (k) => (e) => setPic({ ...pic, [k]: e.target.value })
  const blur = (k) => () => setTouched({ ...touched, [k]: true })

  return (
    <Drawer title="New registration" sub="Invite an employer to register on SCANS" onClose={onClose}
      footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!ready} onClick={send}><Send /> Send invitation</button></>}>
      <div className="stack" style={{ gap: 18 }}>
        <div>
          <div className="gv-sub">Company</div>
          <div className="gv-ssm">
            <Field label="SSM registration number" hint="12 digits, for example 202001017721" error={check && check.error ? check.error : (touched.ssm && ssm && !ssmOk ? 'Enter the 12-digit SSM number.' : null)}>
              <input className="input" inputMode="numeric" autoFocus value={ssm} maxLength={12} placeholder="202001017721"
                onChange={(e) => { setSsm(e.target.value.replace(/\D/g, '')); setCheck(null) }} onBlur={blur('ssm')}
                onKeyDown={(e) => { if (e.key === 'Enter' && ssmOk && check !== 'checking') runCheck() }} />
            </Field>
            <button className="btn outline" disabled={!ssmOk || check === 'checking'} onClick={runCheck}>
              {check === 'checking' ? <><Loader2 className="gv-spin" /> Checking</> : <><SearchCheck /> Check SSM and eNORES</>}
            </button>
          </div>
        </div>
        {found && (
          <>
            <Callout tone="ok" icon={CheckCircle2}>Found in SSM and eNORES. These details come from those records and cannot be changed here.</Callout>
            <div className="form-grid">
              <Field label="Company name" full><input className="input" readOnly value={found.name} /></Field>
              <Field label="Sector"><input className="input" readOnly value={found.sector} /></Field>
              <Field label="District"><input className="input" readOnly value={found.district} /></Field>
              <Field label="Workers in eNORES"><input className="input" readOnly value={num(found.workers)} /></Field>
              <Field label="eNORES employer code"><input className="input" readOnly value={found.enores} /></Field>
            </div>
            <div>
              <div className="gv-sub">Person in charge</div>
              <div className="form-grid">
                <Field label="Full name" full error={touched.name && !nameOk ? 'Enter the full name.' : null}><input className="input" value={pic.name} onChange={set('name')} onBlur={blur('name')} autoComplete="off" /></Field>
                <Field label="Email" error={touched.email && !emailOk ? 'Enter a valid email address.' : null}><input className="input" type="email" value={pic.email} onChange={set('email')} onBlur={blur('email')} placeholder="name@company.com.my" autoComplete="off" /></Field>
                <Field label="Phone" error={touched.phone && !phoneOk ? 'Enter a phone number with at least 9 digits.' : null}><input className="input" type="tel" value={pic.phone} onChange={set('phone')} onBlur={blur('phone')} placeholder="+60 89-123 456" autoComplete="off" /></Field>
              </div>
            </div>
          </>
        )}
        <Callout>The person in charge gets an email to set up the company account with 2-step sign-in. Employers see contribution status only, never wages, complaints or immigration details. Registering on SCANS is not an immigration check.</Callout>
      </div>
    </Drawer>
  )
}

export function EmployerProfile({ base, readOnly }) {
  const { id } = useParams()
  const toast = useToast()
  const go = useNavigate()
  const raw = employers.find((e) => e.id === id)
  const [tab, setTab] = useState('Workers on SCANS')
  const [msg, setMsg] = useState(false)
  useEffect(() => { if (raw) logEvent(readOnly ? 'Looked up employer record' : 'Viewed employer record', raw.name) }, [id, readOnly])
  if (!raw) {
    return (
      <>
        <PageHead title="Employer not found" back={`${base}/employers`} />
        <Card><Empty title="No employer with this ID">Go back to the employer list and search by company name or SSM number.</Empty></Card>
      </>
    )
  }
  const e = employerDetail(raw)
  return (
    <>
      <PageHead title={e.name} back={`${base}/employers`} crumbs={[{ label: 'Employers', to: `${base}/employers` }, { label: e.name }]}>
        <button className="btn outline" onClick={() => { logEvent('Downloaded employer statement', e.name); toast('June 2027 statement downloaded. The download is in the audit log.') }}><Download /> Statement</button>
        {!readOnly && <button className="btn primary" onClick={() => setMsg(true)}><Mail /> Message employer</button>}
      </PageHead>
      <Card>
        <div className="gv-head-card">
          <Mono name={e.name} size="lg" />
          <div className="grow">
            <h2>{e.name}</h2>
            <div className="meta"><span>{e.scansId}</span><span>SSM {e.ssm}</span><span>eNORES {e.enores}</span><span>{e.district}</span><span>{e.sector}</span></div>
          </div>
          <Status>{e.status}</Status>
        </div>
      </Card>
      <div className="grid g-4 keep2">
        <Kpi icon={Users} label="Workers on SCANS" value={num(e.workers)} note="From eNORES" />
        <Kpi icon={CheckCircle2} tone="ok" label="Paid for June" value={pct(e.paidShare)} note={`${num(e.paid)} of ${num(e.workers)} workers`} />
        <Kpi icon={Wallet} tone="warn" label="Owing for June" value={rm(e.owing)} note={`${num(e.workers - e.paid)} workers not yet paid`} />
        <Kpi icon={ShieldCheck} tone={e.deductionPermit === 'Valid' ? 'ok' : 'bad'} label="Deduction permit" value={e.deductionPermit} note="JTK s.113(4)" />
      </div>
      <div className="grid g-main" style={{ alignItems: 'start' }}>
        <Card>
          <Tabs items={['Workers on SCANS', 'Batch payments', 'Users']} value={tab} onChange={setTab} label="Employer record" />
          <div style={{ paddingTop: 16 }}>
            {tab === 'Workers on SCANS' && (
              <Table rows={e.sample} pageSize={8} onRowClick={(w) => go(`${base}/workers/${w.id}`)}
                empty={<Empty title="No sample records">This prototype has no sample worker records for this employer.</Empty>}
                columns={[
                  { key: 'name', label: 'Worker', render: (w) => <div className="who"><Avatar name={w.name} /><div><b>{w.name}</b><small>{w.id}</small></div></div> },
                  { key: 'role', label: 'Job' },
                  { key: 'status', label: 'June 2027', render: (w) => <Status>{w.status}</Status> },
                  { key: 'consent', label: 'Employer may pay', render: (w) => (w.consent ? 'Yes' : 'No consent') },
                ]} />
            )}
            {tab === 'Batch payments' && (
              <Table rows={e.batches} pageSize={8} columns={[
                { key: 'id', label: 'Batch', render: (b) => <b className="mono-id">{b.id}</b> },
                { key: 'date', label: 'Paid on' },
                { key: 'workers', label: 'Workers', align: 'r', render: (b) => num(b.workers) },
                { key: 'months', label: 'Months', align: 'r' },
                { key: 'amount', label: 'Amount', align: 'r', render: (b) => rm(b.amount) },
                { key: 'method', label: 'Method' },
                { key: 'status', label: 'Status', render: (b) => <Status>{b.status}</Status> },
              ]} />
            )}
            {tab === 'Users' && (
              <Table rows={e.users} rowKey={(u) => u.email} columns={[
                { key: 'name', label: 'Name', render: (u) => <div className="who"><Avatar name={u.name} /><div><b>{u.name}</b><small>{u.email}</small></div></div> },
                { key: 'role', label: 'Role' },
                { key: 'twoFA', label: '2-step sign-in', render: (u) => (u.twoFA ? <Pill tone="ok">On</Pill> : <Pill tone="warn">Not set up</Pill>) },
                { key: 'last', label: 'Last sign-in' },
                { key: 'status', label: 'Status', render: (u) => <Status>{u.status}</Status> },
              ]} />
            )}
          </div>
        </Card>
        <div className="stack">
          <Card title="Company details" sub="From SSM and eNORES. Read only.">
            <dl className="kv one">
              <div><dt>Registered name</dt><dd>{e.name}</dd></div>
              <div><dt>SSM number</dt><dd>{e.ssm} · since {e.registered}</dd></div>
              <div><dt>eNORES employer code</dt><dd>{e.enores}</dd></div>
              <div><dt>Address</dt><dd>{e.address}</dd></div>
              <div><dt>Contact person</dt><dd>{e.contact}</dd></div>
            </dl>
          </Card>
          <Card title="Payments and deductions">
            <dl className="kv one">
              <div><dt>Wage deduction permit (JTK s.113(4))</dt><dd><Status>{e.deductionPermit === 'Not on file' ? 'Not given' : e.deductionPermit}</Status> <span className="small muted">{e.permitRef !== '—' ? e.permitRef + ' · to ' + e.permitValid : ''}</span></dd></div>
              <div><dt>Monthly auto-pay</dt><dd><Status>{e.autoDebit === 'Active' ? 'Active' : 'Inactive'}</Status></dd></div>
            </dl>
            {e.deductionPermit !== 'Valid' && <Callout tone="warn" style={{ marginTop: 14 }}>Payroll deduction is blocked until a valid JTK Sabah permit is on file. The employer can still pay for workers who gave consent.</Callout>}
          </Card>
        </div>
      </div>
      {msg && (
        <Modal title="Message employer" onClose={() => setMsg(false)} actions={<><button className="btn outline" onClick={() => setMsg(false)}>Cancel</button><button className="btn primary" onClick={() => { setMsg(false); logEvent('Sent message to employer', e.name); toast(`Message sent to ${e.contact} at ${e.name}`) }}><Send /> Send</button></>}>
          <div className="stack" style={{ gap: 12 }}>
            <p className="ink2">To {e.contact} and the company admins, by email and in the employer portal.</p>
            <textarea className="input" defaultValue={`${num(e.workers - e.paid)} of your workers have not paid for June 2027. You can pay for workers who gave consent in the employer portal under Pay for workers.`} />
          </div>
        </Modal>
      )}
    </>
  )
}
