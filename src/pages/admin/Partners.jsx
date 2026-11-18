import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LayoutGrid, Tag, Store, Inbox, Users, ScrollText, Activity, Plus, Check, X as XIcon } from 'lucide-react'
import { AppShell, PageHead, Status, Figure, Tabs, Drawer, Columns, MeterRows, useToast, initials } from '../../components/ui.jsx'
import { offers, merchantOutlets, approvals, auditLog, integrations, employerWorkers, demoWorker, REGISTERED, paidThisMonth, collectedThisMonth, rm, num, pct } from '../../data/demo.js'

/* ======================= Merchant ======================= */
const mNav = [
  { to: '/merchant', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/merchant/offers', label: 'Offers', icon: Tag },
  { to: '/merchant/outlets', label: 'Outlets', icon: Store },
]
const MShell = ({ children }) => <AppShell nav={mNav} org={{ name: '7-Eleven Sabah', detail: 'Merchant partner since March 2027' }} user={{ name: 'Daniel Chong', role: 'Area manager', initials: 'DC' }}>{children}</AppShell>
const mine = offers.filter((o) => o.merchant === '7-Eleven Sabah')

function MOverview() {
  return (
    <MShell>
      <PageHead title="Overview" sub="June 2027. Workers can use an offer only if their contribution is up to date." />
      <div className="grid g-4">
        <div className="panel navy"><Figure label="Uses this month" value="4,120" note="Up 18% on May" /></div>
        <div className="panel"><Figure label="Live offers" value="1" size="md" note="1 waiting for approval" /></div>
        <div className="panel"><Figure label="Outlets taking part" value="5 of 6" size="md" /></div>
        <div className="panel"><Figure label="Busiest outlet" value="Fajar Centre" size="md" note="Lahad Datu · 921 uses" /></div>
      </div>
      <div className="grid g-main">
        <section className="panel"><h2>Uses each week</h2><p className="sub" style={{ marginBottom: 12 }}>RM3 off a RM30 prepaid reload</p>
          <Columns data={[{ m: 'W1', v: 690 }, { m: 'W2', v: 1210 }, { m: 'W3', v: 1004 }, { m: 'W4', v: 1216 }]} format={num} />
          <p className="sub" style={{ marginTop: 12 }}>Most uses fall in the first week after payday and the 5th, when workers pay their contribution.</p>
        </section>
        <section className="panel"><h2>By outlet</h2>
          <MeterRows items={merchantOutlets.filter((o) => o.redemptions).map((o) => ({ label: o.name, share: o.redemptions / 921, text: num(o.redemptions) }))} />
        </section>
      </div>
    </MShell>
  )
}

function MOffers() {
  const [open, setOpen] = useState(false)
  const toast = useToast()
  return (
    <MShell>
      <PageHead title="Offers" sub="Every new or changed offer is checked by Microtek before workers see it."><button className="btn primary" onClick={() => setOpen(true)}><Plus size={16} /> New offer</button></PageHead>
      <section className="panel"><div className="table-wrap"><table className="data stack">
        <thead><tr><th>Offer</th><th>Ends</th><th className="r">Uses</th><th>Status</th></tr></thead>
        <tbody>{mine.map((o) => <tr key={o.id}><td data-label="Offer"><span className="strong">{o.title}</span><div className="dim">{o.terms}</div></td><td data-label="Ends">{o.ends}</td><td data-label="Uses" className="r num">{num(o.redemptions)}</td><td data-label="Status"><Status>{o.status}</Status></td></tr>)}</tbody>
      </table></div></section>
      {open && <Drawer title="New offer" sub="Keep it simple: one saving, plain conditions." onClose={() => setOpen(false)}
        footer={<><button className="btn" onClick={() => setOpen(false)}>Cancel</button><button className="btn primary" onClick={() => { setOpen(false); toast('Offer sent for approval') }}>Send for approval</button></>}>
        <div className="field"><label htmlFor="ot">What workers get</label><input id="ot" className="input" placeholder="RM2 off any phone top-up of RM20 or more" /></div>
        <div className="field"><label htmlFor="oc">Conditions</label><textarea id="oc" className="input" placeholder="Where, when and how often it can be used" /></div>
        <div className="grid g-2"><div className="field"><label htmlFor="os">Starts</label><input id="os" type="date" className="input" /></div><div className="field"><label htmlFor="oe">Ends</label><input id="oe" type="date" className="input" /></div></div>
        <div className="field"><label htmlFor="oo">Outlets</label><select id="oo" className="input"><option>All 6 outlets</option>{merchantOutlets.map((o) => <option key={o.id}>{o.name}</option>)}</select></div>
      </Drawer>}
    </MShell>
  )
}

function MOutlets() {
  return (
    <MShell>
      <PageHead title="Outlets" sub="Cashiers at these outlets can scan a worker’s offer code." />
      <section className="panel"><div className="table-wrap"><table className="data stack">
        <thead><tr><th>Outlet</th><th>District</th><th className="r">Uses in June</th><th>Status</th></tr></thead>
        <tbody>{merchantOutlets.map((o) => <tr key={o.id}><td data-label="Outlet" className="strong">{o.name}<div className="dim num">{o.id}</div></td><td data-label="District">{o.district}</td><td data-label="Uses in June" className="r num">{num(o.redemptions)}</td><td data-label="Status"><Status>{o.status}</Status></td></tr>)}</tbody>
      </table></div></section>
    </MShell>
  )
}

export function MerchantApp() {
  return <Routes><Route index element={<MOverview />} /><Route path="offers" element={<MOffers />} /><Route path="outlets" element={<MOutlets />} /></Routes>
}

/* ======================= Microtek operator ======================= */
const aNav = [
  { to: '/admin', label: 'Operations', icon: Activity, end: true },
  { to: '/admin/approvals', label: 'Waiting for review', icon: Inbox },
  { to: '/admin/workers', label: 'Worker records', icon: Users },
  { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
]
const AShell = ({ children }) => <AppShell nav={aNav} org={{ name: 'Microtek Solutions', detail: 'Operator for Kerajaan Negeri Sabah' }} user={{ name: 'Faizal Rahman', role: 'Operations lead', initials: 'FR' }}>{children}</AppShell>

function Ops() {
  return (
    <AShell>
      <PageHead title="Operations" sub="17 June 2027, 09:45. Everything the State sees comes from these systems." />
      <div className="grid g-4">
        <div className="panel navy"><Figure label="Uptime this month" value="99.97%" note="Target 99.5%, payments 99.9%" /></div>
        <div className="panel"><Figure label="Waiting for review" value={num(approvals.length)} size="md" note="Oldest: 6 days" /></div>
        <div className="panel"><Figure label="Paid for June" value={num(paidThisMonth)} size="md" note={`of ${num(REGISTERED)} · ${rm(collectedThisMonth)}`} /></div>
        <div className="panel"><Figure label="Reconciliation" value="0 breaks" size="md" note="Last run 16 Jun, 23:30" /></div>
      </div>
      <section className="panel">
        <div className="panel-head"><div><h2>Connected systems</h2><p className="sub">Data comes in under signed data-sharing agreements. Nothing is written back that changes a worker’s status.</p></div></div>
        <div className="table-wrap"><table className="data stack">
          <thead><tr><th>System</th><th>Owner</th><th>Status</th><th>Detail</th></tr></thead>
          <tbody>{integrations.map((i) => <tr key={i.name}><td data-label="System" className="strong">{i.name}</td><td data-label="Owner">{i.owner}</td><td data-label="Status"><Status>{i.state}</Status></td><td data-label="Detail">{i.note}</td></tr>)}</tbody>
        </table></div>
      </section>
    </AShell>
  )
}

function Approvals() {
  const toast = useToast()
  const [items, setItems] = useState(approvals)
  const [tab, setTab] = useState('All')
  const types = ['All', ...new Set(approvals.map((a) => a.type))]
  const act = (a, ok) => { setItems(items.filter((x) => x.id !== a.id)); toast(`${a.type} ${ok ? 'approved' : 'sent back'}: ${a.name}`) }
  const list = items.filter((a) => tab === 'All' || a.type === tab)
  return (
    <AShell>
      <PageHead title="Waiting for review" sub="State-originated notices are approved by the State, not here. Everything you decide is written to the audit log." />
      <div>
        <Tabs items={types} value={tab} onChange={setTab} label="Type" />
        <section className="panel">
          <div className="rows">
            {list.map((a) => (
              <div key={a.id} className="row" style={{ flexWrap: 'wrap' }}>
                <div className="grow" style={{ minWidth: 220 }}><div className="d">{a.type} · {a.id} · waiting {a.age}</div><div className="t">{a.name}</div><div className="d">{a.detail}</div></div>
                {a.type === 'Announcement'
                  ? <Status>Waiting for State approval</Status>
                  : <div style={{ display: 'flex', gap: 6 }}><button className="btn sm" onClick={() => act(a, false)}><XIcon size={14} /> Send back</button><button className="btn sm primary" onClick={() => act(a, true)}><Check size={14} /> Approve</button></div>}
              </div>
            ))}
          </div>
          {list.length === 0 && <div className="empty"><h3>Nothing waiting</h3><p>New sign-ups, offers and record mismatches will appear here.</p></div>}
        </section>
      </div>
    </AShell>
  )
}

function Records() {
  const [open, setOpen] = useState(null)
  return (
    <AShell>
      <PageHead title="Worker records" sub="Opening a record is logged. Corrections need a reason and are checked against SWIMS." />
      <section className="panel"><div className="table-wrap"><table className="data stack">
        <thead><tr><th>Worker</th><th>Employer</th><th>Nationality</th><th>June 2027</th><th>App</th></tr></thead>
        <tbody>{employerWorkers.map((w) => (
          <tr key={w.id} className="clickable" tabIndex={0} onClick={() => setOpen(w)} onKeyDown={(e) => e.key === 'Enter' && setOpen(w)}>
            <td data-label="Worker"><span className="strong">{w.name}</span><div className="dim num">{w.id}</div></td><td data-label="Employer">Borneo Palm Plantations</td><td data-label="Nationality">{w.nationality}</td><td data-label="June 2027"><Status>{w.status}</Status></td><td data-label="App">{w.appActive ? 'Active' : 'Not signed up'}</td>
          </tr>
        ))}</tbody>
      </table></div></section>
      {open && <Drawer title={open.name} sub={open.id} onClose={() => setOpen(null)} footer={<><button className="btn">Correct a detail</button><button className="btn primary" onClick={() => setOpen(null)}>Close</button></>}>
        <Tabs items={['Identity']} value="Identity" onChange={() => {}} label="Record" />
        <dl className="kv">
          <dt>Nationality</dt><dd>{open.nationality}</dd><dt>Job</dt><dd>{open.role}</dd><dt>Permit valid until</dt><dd>{open.permitExpiry}</dd>
          <dt>Owing</dt><dd className="num">{rm(open.arrears)}</dd><dt>KDN identity check</dt><dd>Passed, 6 Jan 2027</dd><dt>SWIMS match</dt><dd>{open.name === 'Rina Wulandari' ? 'Name differs, under review' : 'Matched'}</dd>
          {open.id === demoWorker.scansId && <><dt>PLKS</dt><dd className="num">{demoWorker.plks}</dd></>}
        </dl>
        <p className="callout">Viewed by Faizal Rahman at 09:46. This view is in the audit log.</p>
      </Drawer>}
    </AShell>
  )
}

function Audit() {
  return (
    <AShell>
      <PageHead title="Audit log" sub="Every view, export and change, kept for the State’s auditors." />
      <section className="panel"><div className="table-wrap"><table className="data stack">
        <thead><tr><th>When</th><th>Who</th><th>What</th><th>Record</th></tr></thead>
        <tbody>{auditLog.map((l, i) => <tr key={i}><td data-label="When" className="num">{l.at}</td><td data-label="Who">{l.who}</td><td data-label="What">{l.action}</td><td data-label="Record" className="num">{l.target}</td></tr>)}</tbody>
      </table></div></section>
    </AShell>
  )
}

export function AdminApp() {
  return <Routes><Route index element={<Ops />} /><Route path="approvals" element={<Approvals />} /><Route path="workers" element={<Records />} /><Route path="audit" element={<Audit />} /></Routes>
}
