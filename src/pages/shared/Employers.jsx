// Employer list and employer profile, shared by /admin and /state.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Building2, Users, CheckCircle2, AlertTriangle, Download, Wallet, ShieldCheck, Send, Mail } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Pill, Callout, Empty, Tabs, SearchInput, Select, Table, Mono, Avatar, Modal, useToast } from '../../components/ui.jsx'
import { employers, employerTotals, districts, sectors, REGISTERED, rm, num, pct } from '../../data/demo.js'
import { employerDetail } from './data.js'
import { logEvent } from './store.js'
import './shared.css'

const STATUSES = ['All paid', 'Partly paid', 'Behind']

export function EmployerList({ base }) {
  const go = useNavigate()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [district, setDistrict] = useState('All')
  const [sector, setSector] = useState('All')
  const [status, setStatus] = useState('All')
  const rows = useMemo(() => employers.filter((e) => {
    const t = q.trim().toLowerCase()
    if (t && !(e.name.toLowerCase().includes(t) || e.ssm.includes(t))) return false
    if (district !== 'All' && e.district !== district) return false
    if (sector !== 'All' && e.sector !== sector) return false
    if (status !== 'All' && e.status !== status) return false
    return true
  }), [q, district, sector, status])
  const shareAll = employers.reduce((s, e) => s + e.paid, 0) / employers.reduce((s, e) => s + e.workers, 0)
  return (
    <>
      <PageHead title="Employers" sub={`${num(employerTotals.count)} employers registered in eNORES employ the ${num(REGISTERED)} workers on SCANS. This prototype shows ${employers.length} sample employers.`}>
        <button className="btn outline" onClick={() => { logEvent('Exported employer list', `${rows.length} employers`); toast('Employer list exported. The export is in the audit log.') }}><Download /> Export</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={Building2} label="Employers" value={num(employerTotals.count)} note="Synced from SSM and eNORES" />
        <Kpi icon={Users} label="Workers" value={num(employerTotals.workers)} note={'Average ' + Math.round(employerTotals.workers / employerTotals.count) + ' per employer'} />
        <Kpi icon={CheckCircle2} tone="ok" label="Sample paid for June" value={pct(shareAll)} note="Workers paid at sample employers" />
        <Kpi icon={AlertTriangle} tone="bad" label="Behind" value={num(employers.filter((e) => e.status === 'Behind').length)} note="Sample employers under 60% paid" />
      </div>
      <Card title="Employer records" sub={`${rows.length} of ${employers.length} sample employers. Employers see contribution status only.`}>
        <div className="stack" style={{ gap: 14 }}>
          <div className="gv-filters f4">
            <SearchInput value={q} onChange={setQ} placeholder="Search company name or SSM number" />
            <Select label="District" value={district} onChange={setDistrict} options={[{ value: 'All', label: 'All districts' }, ...districts.map((d) => d.name)]} />
            <Select label="Sector" value={sector} onChange={setSector} options={[{ value: 'All', label: 'All sectors' }, ...sectors.map((s) => s.name)]} />
            <Select label="Status" value={status} onChange={setStatus} options={[{ value: 'All', label: 'All statuses' }, ...STATUSES]} />
          </div>
          <Table rows={rows} onRowClick={(e) => go(`${base}/employers/${e.id}`)} columns={[
            { key: 'name', label: 'Company', render: (e) => <div className="who"><Mono name={e.name} /><div style={{ minWidth: 0 }}><b>{e.name}</b><small>SSM {e.ssm}</small></div></div> },
            { key: 'district', label: 'District' },
            { key: 'sector', label: 'Sector' },
            { key: 'workers', label: 'Workers', align: 'r', render: (e) => num(e.workers) },
            { key: 'paid', label: 'Paid for June', render: (e) => <div className="row" style={{ gap: 8, minWidth: 120 }}><div className="bar grow" style={{ minWidth: 50 }}><span style={{ width: pct(e.paid / e.workers) }} /></div><span className="num small">{pct(e.paid / e.workers)}</span></div> },
            { key: 'owing', label: 'Owing', align: 'r', render: (e) => <span className="num">{rm((e.workers - e.paid) * 100)}</span> },
            { key: 'status', label: 'Status', render: (e) => <Status>{e.status}</Status> },
          ]} />
        </div>
      </Card>
    </>
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
            <div className="meta"><span>SSM {e.ssm}</span><span>eNORES {e.enores}</span><span>{e.district}</span><span>{e.sector}</span></div>
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
