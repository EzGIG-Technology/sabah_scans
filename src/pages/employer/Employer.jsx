import { useMemo, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, CreditCard, Repeat, FileText, Settings, Download, Check, AlertTriangle } from 'lucide-react'
import { AppShell, PageHead, Status, Figure, Tabs, Drawer, Columns, useToast, initials } from '../../components/ui.jsx'
import { employerWorkers, employers, demoWorker, RATE, rm, num, pct } from '../../data/demo.js'

const company = employers.find((e) => e.id === 'emp-bpp')
const nav = [
  { to: '/employer', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/employer/workers', label: 'Workers', icon: Users },
  { to: '/employer/pay', label: 'Pay for workers', icon: CreditCard },
  { to: '/employer/auto-debit', label: 'Monthly auto-pay', icon: Repeat },
  { to: '/employer/reports', label: 'Statements', icon: FileText },
  { to: '/employer/settings', label: 'Company', icon: Settings },
]
const org = { name: company.name, detail: `${company.district} · SSM ${company.ssm}` }
const user = { name: 'Jennifer Liew', role: 'HR manager', initials: 'JL' }

function Shell({ children }) { return <AppShell nav={nav} org={org} user={user}>{children}</AppShell> }

function WorkerDrawer({ wk, onClose }) {
  const nav = useNavigate()
  return (
    <Drawer title={wk.name} sub={wk.id} onClose={onClose}
      footer={<>{wk.status !== 'Paid' && <button className="btn primary" onClick={() => nav('/employer/pay?w=' + wk.id)}>Pay for this worker</button>}<button className="btn" onClick={onClose}>Close</button></>}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <span className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials(wk.name)}</span>
        <div><Status>{wk.status}</Status><p className="sub" style={{ color: 'var(--muted)', marginTop: 6 }}>{wk.role} · {wk.nationality}</p></div>
      </div>
      <dl className="kv">
        <dt>SCANS ID</dt><dd className="num">{wk.id}</dd>
        <dt>Permit valid until</dt><dd>{wk.permitExpiry}</dd>
        <dt>Amount owing</dt><dd className="num">{rm(wk.arrears)}</dd>
        <dt>Uses the app</dt><dd>{wk.appActive ? 'Yes' : 'Not yet'}</dd>
        <dt>Consent to employer payment</dt><dd>{wk.appActive ? 'Given on 6 Jan 2027' : 'Not given'}</dd>
        {wk.id === demoWorker.scansId && <><dt>Workplace</dt><dd>{demoWorker.site}</dd></>}
      </dl>
      <p className="callout">You see this worker’s contribution status only. Wages, complaints and immigration details are not shared with employers.</p>
    </Drawer>
  )
}

function Overview() {
  const notPaid = company.workers - company.paid
  const owing = employerWorkers.filter((w) => w.arrears > 0)
  return (
    <Shell>
      <PageHead title="Overview" sub="June 2027 contributions for Borneo Palm Plantations. Payment is due from each worker by 5 June.">
        <Link to="/employer/pay" className="btn primary">Pay for workers</Link>
      </PageHead>
      <div className="grid g-4">
        <div className="panel navy"><Figure label="Workers on SCANS" value={num(company.workers)} note="From eNORES, synced 06:00 today" /></div>
        <div className="panel"><Figure label="Paid for June" value={num(company.paid)} note={pct(company.paid / company.workers) + ' of your workers'} /></div>
        <div className="panel"><Figure label="Not paid yet" value={num(notPaid)} note={rm(notPaid * RATE) + ' if all are paid today'} /></div>
        <div className="panel"><Figure label="Using the app" value="88%" note="363 of 412 workers" /></div>
      </div>
      <div className="grid g-main">
        <section className="panel">
          <div className="panel-head"><div><h2>Workers paid each month</h2><p className="sub">Out of 412 workers</p></div></div>
          <Columns data={[{ m: 'Jan', v: 298 }, { m: 'Feb', v: 322 }, { m: 'Mar', v: 340 }, { m: 'Apr', v: 351 }, { m: 'May', v: 366 }, { m: 'Jun', v: 371 }]} format={(v) => num(v)} />
        </section>
        <section className="panel">
          <div className="panel-head"><div><h2>Permits ending soon</h2><p className="sub">Within 60 days. Shown for planning only.</p></div></div>
          <div className="rows">
            {employerWorkers.filter((w) => /Jun 2027|Jul 2027/.test(w.permitExpiry)).map((w) => (
              <div key={w.id} className="row"><span className="avatar">{initials(w.name)}</span><div className="grow"><div className="t">{w.name}</div><div className="d">Ends {w.permitExpiry}</div></div><Status>{w.status}</Status></div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-head"><div><h2>Owing from earlier months</h2><p className="sub">Workers stay responsible for their own contribution. You can pay for them only with their consent.</p></div><Link to="/employer/workers" className="btn sm">All workers</Link></div>
        <div className="table-wrap">
          <table className="data stack">
            <thead><tr><th>Worker</th><th>Status</th><th className="r">Owing</th><th>Consent</th></tr></thead>
            <tbody>{owing.map((w) => (
              <tr key={w.id}><td data-label="Worker"><span className="strong">{w.name}</span><div className="dim">{w.id}</div></td><td data-label="Status"><Status>{w.status}</Status></td><td data-label="Owing" className="r num">{rm(w.arrears)}</td><td data-label="Consent">{w.appActive ? 'Given' : 'Not given'}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </Shell>
  )
}

function Workers() {
  const [tab, setTab] = useState('All')
  const [open, setOpen] = useState(null)
  const list = employerWorkers.filter((w) => tab === 'All' || (tab === 'Not paid' ? w.status !== 'Paid' : /Jun 2027|Jul 2027|Aug 2027/.test(w.permitExpiry)))
  return (
    <Shell>
      <PageHead title="Workers" sub="Showing 12 of 412 workers. Records come from eNORES and can only be corrected through JTK Sabah.">
        <button className="btn"><Download size={16} /> Download list</button>
      </PageHead>
      <div>
        <Tabs items={['All', 'Not paid', 'Permit ends soon']} value={tab} onChange={setTab} label="Filter workers" />
        <section className="panel">
          <div className="table-wrap">
            <table className="data stack">
              <thead><tr><th>Worker</th><th>Job</th><th>Nationality</th><th>June 2027</th><th>Permit valid until</th><th className="r">Owing</th></tr></thead>
              <tbody>{list.map((w) => (
                <tr key={w.id} className="clickable" onClick={() => setOpen(w)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(w)}>
                  <td data-label="Worker"><span className="strong">{w.name}</span><div className="dim num">{w.id}</div></td>
                  <td data-label="Job">{w.role}</td><td data-label="Nationality">{w.nationality}</td>
                  <td data-label="June 2027"><Status>{w.status}</Status></td><td data-label="Permit valid until">{w.permitExpiry}</td>
                  <td data-label="Owing" className="r num">{rm(w.arrears)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {list.length === 0 && <div className="empty"><h3>Nobody here</h3><p>Every worker in this view is up to date.</p></div>}
        </section>
      </div>
      {open && <WorkerDrawer wk={open} onClose={() => setOpen(null)} />}
    </Shell>
  )
}

function PayFlow() {
  const toast = useToast()
  const preset = new URLSearchParams(window.location.search).get('w')
  const eligible = employerWorkers.filter((w) => w.status !== 'Paid')
  const [step, setStep] = useState(0)
  const [sel, setSel] = useState(() => new Set(preset ? [preset] : eligible.filter((w) => w.appActive).map((w) => w.id)))
  const [months, setMonths] = useState(1)
  const chosen = eligible.filter((w) => sel.has(w.id))
  const total = useMemo(() => chosen.reduce((s, w) => s + w.arrears + months * RATE, 0), [chosen, months])
  const toggle = (id) => { const s = new Set(sel); s.has(id) ? s.delete(id) : s.add(id); setSel(s) }
  const steps = ['Choose workers', 'Choose months', 'Check and pay', 'Done']
  return (
    <Shell>
      <PageHead title="Pay for workers" sub="Pay for several workers at once. Each worker gets their own receipt in the app." />
      <div className="stepper" aria-hidden="true">{steps.map((s, i) => <span key={s} className={i <= step ? 'on' : ''} />)}</div>
      <p style={{ fontWeight: 650 }}>{steps[step]}</p>
      {step === 0 && (
        <section className="panel">
          <p className="callout" style={{ marginBottom: 16 }}>Only workers who gave consent in the app can be paid for. Workers without consent are shown but cannot be chosen.</p>
          <div className="table-wrap">
            <table className="data stack">
              <thead><tr><th><span className="vh">Choose</span></th><th>Worker</th><th>Status</th><th className="r">Owing now</th><th>Consent</th></tr></thead>
              <tbody>{eligible.map((w) => (
                <tr key={w.id}>
                  <td data-label="Choose"><input type="checkbox" className="check" aria-label={'Choose ' + w.name} disabled={!w.appActive} checked={sel.has(w.id)} onChange={() => toggle(w.id)} /></td>
                  <td data-label="Worker"><span className="strong">{w.name}</span><div className="dim num">{w.id}</div></td>
                  <td data-label="Status"><Status>{w.status}</Status></td>
                  <td data-label="Owing now" className="r num">{rm(w.arrears)}</td>
                  <td data-label="Consent">{w.appActive ? 'Given' : 'Not given'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
            <b>{chosen.length} {chosen.length === 1 ? 'worker' : 'workers'} chosen</b>
            <button className="btn primary" disabled={!chosen.length} onClick={() => setStep(1)}>Next: choose months</button>
          </div>
        </section>
      )}
      {step === 1 && (
        <section className="panel" style={{ maxWidth: 640 }}>
          <div className="stack" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 3].map((m) => (
              <button key={m} className={'choice' + (months === m ? ' on' : '')} onClick={() => setMonths(m)}>
                <span className="grow"><b style={{ display: 'block' }}>{m === 1 ? 'June 2027' : 'June to August 2027'}</b><span className="dim" style={{ color: 'var(--muted)', fontSize: 13 }}>{m} × {rm(RATE)} per worker, plus anything owing</span></span>
                <span className="price">{rm(chosen.reduce((s, w) => s + w.arrears + m * RATE, 0))}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><button className="btn" onClick={() => setStep(0)}>Back</button><button className="btn primary" onClick={() => setStep(2)}>Next: check and pay</button></div>
        </section>
      )}
      {step === 2 && (
        <section className="panel" style={{ maxWidth: 720 }}>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Worker</th><th className="r">Owing</th><th className="r">{months === 1 ? 'June' : 'Jun to Aug'}</th><th className="r">Total</th></tr></thead>
              <tbody>
                {chosen.map((w) => <tr key={w.id}><td>{w.name}</td><td className="r num">{rm(w.arrears)}</td><td className="r num">{rm(months * RATE)}</td><td className="r num strong">{rm(w.arrears + months * RATE)}</td></tr>)}
                <tr><td className="strong">{chosen.length} workers</td><td /><td /><td className="r num strong" style={{ fontSize: 20 }}>{rm(total, 2)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="field" style={{ marginTop: 18, maxWidth: 360 }}>
            <label htmlFor="bank">Pay with FPX</label>
            <select id="bank" className="input"><option>Maybank2u</option><option>CIMB Clicks</option><option>Public Bank</option><option>RHB Now</option><option>Bank Islam</option></select>
            <span className="hint">No fee is added. The amount goes straight to the State’s FWECF account.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setStep(1)}>Back</button>
            <button className="btn primary" onClick={() => { setStep(3); toast(`Paid ${rm(total)} for ${chosen.length} workers`) }}>Pay {rm(total, 2)}</button>
          </div>
        </section>
      )}
      {step === 3 && (
        <section className="panel" style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span className="paid-dot" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'grid', placeItems: 'center' }}><Check /></span>
            <div><h2>Paid {rm(total, 2)}</h2><p className="sub">Batch BATCH-2706-0031 · FPX Maybank2u · 4 Jun 2027, 10:12</p></div>
          </div>
          <div className="rows" style={{ marginTop: 16 }}>
            {chosen.map((w, i) => <div key={w.id} className="row"><div className="grow"><div className="t">{w.name}</div><div className="d num">RCP-2706-{(130412 + i * 7).toString()}</div></div><b className="num">{rm(w.arrears + months * RATE)}</b></div>)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}><button className="btn"><Download size={16} /> Download batch receipt</button><Link to="/employer" className="btn primary">Back to overview</Link></div>
        </section>
      )}
    </Shell>
  )
}

function AutoDebit() {
  const toast = useToast()
  const [on, setOn] = useState(false)
  return (
    <Shell>
      <PageHead title="Monthly auto-pay" sub="Pay each month for chosen workers on the 1st. Only for workers who agreed, and only with a JTK Sabah deduction permit if the money comes from wages." />
      <div className="grid g-2">
        <section className="panel">
          <h2>What you need</h2>
          <div className="rows" style={{ marginTop: 8 }}>
            <div className="row"><Check color="var(--green)" /><div className="grow"><div className="t">FPX direct debit mandate</div><div className="d">Maybank2u ****2210, approved 2 Jan 2027</div></div></div>
            <div className="row"><Check color="var(--green)" /><div className="grow"><div className="t">Worker consent</div><div className="d">363 of 412 workers have agreed in the app</div></div></div>
            <div className="row"><AlertTriangle color="var(--amber)" /><div className="grow"><div className="t">JTK Sabah deduction permit, section 113(4)</div><div className="d">Needed only if you take the amount from wages. Not on file.</div></div></div>
          </div>
        </section>
        <section className="panel tint">
          <h2>Auto-pay for 363 workers</h2>
          <p className="sub">{rm(363 * RATE)} on the 1st of each month from Maybank2u ****2210. You pay it as a company cost; it is not taken from wages.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            {!on
              ? <button className="btn primary" onClick={() => { setOn(true); toast('Auto-pay set up from 1 July 2027') }}>Set up auto-pay</button>
              : <><Status>Active</Status><button className="btn" onClick={() => { setOn(false); toast('Auto-pay stopped') }}>Stop auto-pay</button></>}
          </div>
        </section>
      </div>
    </Shell>
  )
}

function Reports() {
  const toast = useToast()
  const files = [
    ['June 2027 statement', 'Payments made by and for your workers', 'PDF · 412 workers'],
    ['May 2027 statement', 'Payments made by and for your workers', 'PDF · 412 workers'],
    ['Owing by worker', 'Every worker with an amount owing today', 'CSV · 41 rows'],
    ['Permit end dates', 'For your renewal planning', 'CSV · 412 rows'],
    ['Batch receipts, 2027', 'Every batch payment this year', 'PDF · 7 batches'],
  ]
  return (
    <Shell>
      <PageHead title="Statements" sub="For your records and your auditors." />
      <section className="panel"><div className="rows">
        {files.map(([t, d, m]) => <div key={t} className="row"><FileText color="var(--navy)" /><div className="grow"><div className="t">{t}</div><div className="d">{d} · {m}</div></div><button className="btn sm" onClick={() => toast(t + ' downloaded')}><Download size={14} /> Download</button></div>)}
      </div></section>
    </Shell>
  )
}

function Company() {
  return (
    <Shell>
      <PageHead title="Company" sub="Registration details come from SSM and eNORES. To change them, update them at the source." />
      <div className="grid g-2">
        <section className="panel"><h2>Registration</h2><dl className="kv" style={{ marginTop: 14 }}>
          <dt>Company</dt><dd>{company.name}</dd><dt>SSM number</dt><dd className="num">{company.ssm}</dd><dt>Sector</dt><dd>{company.sector}</dd>
          <dt>District</dt><dd>{company.district}</dd><dt>Address</dt><dd>Batu 12, Jalan Lahad Datu–Tawau, 91100 Lahad Datu, Sabah</dd><dt>eNORES employer code</dt><dd className="num">SBH-E-018832</dd>
        </dl></section>
        <section className="panel"><div className="panel-head"><h2>People who can sign in</h2><button className="btn sm">Add person</button></div>
          <div className="rows">
            {[['Jennifer Liew', 'HR manager · can pay'], ['Mohd Azlan', 'Estate manager · view only'], ['Teo Siew Mei', 'Finance · can pay and download']].map(([n, r]) => <div key={n} className="row"><span className="avatar">{initials(n)}</span><div className="grow"><div className="t">{n}</div><div className="d">{r}</div></div></div>)}
          </div>
        </section>
      </div>
    </Shell>
  )
}

export default function EmployerApp() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="workers" element={<Workers />} />
      <Route path="pay" element={<PayFlow />} />
      <Route path="auto-debit" element={<AutoDebit />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Company />} />
    </Routes>
  )
}
