import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LayoutGrid, Map, Building2, Megaphone, MessageSquareWarning, FileText, Download, Search } from 'lucide-react'
import { AppShell, PageHead, Status, Figure, Tabs, Columns, SplitBar, MeterRows, DistrictMap, DistrictDetail, Drawer, useToast } from '../../components/ui.jsx'
import {
  REGISTERED, districts, sectors, channels, nationalities, monthly, ytd, stateYtd, operatorYtd, paidThisMonth, overdue1, overdue3,
  collectedThisMonth, complianceRate, employers, complaints, announcements, languages, demoWorker, rm, num, pct, STATE_SHARE,
} from '../../data/demo.js'

const nav = [
  { to: '/state', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/state/districts', label: 'Districts', icon: Map },
  { to: '/state/employers', label: 'Employers and workers', icon: Building2 },
  { to: '/state/notices', label: 'Official notices', icon: Megaphone },
  { to: '/state/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/state/reports', label: 'Reports', icon: FileText },
]
const org = { name: 'Kerajaan Negeri Sabah', detail: 'Kementerian Kewangan Negeri Sabah' }
const user = { name: 'Nurul Ain Jaafar', role: 'Jabatan Kewangan Negeri', initials: 'NA' }
const Shell = ({ children }) => <AppShell nav={nav} org={org} user={user}>{children}</AppShell>

function Overview() {
  const [sel, setSel] = useState('lahaddatu')
  const toast = useToast()
  const d = districts.find((x) => x.id === sel)
  return (
    <Shell>
      <PageHead title="Collection, June 2027" sub={`${num(paidThisMonth)} of ${num(REGISTERED)} registered workers have paid for June. Payment was due on 5 June.`}>
        <button className="btn" onClick={() => toast('June 2027 report downloaded')}><Download size={16} /> Monthly report</button>
      </PageHead>
      <div className="grid g-4">
        <div className="panel navy span-2">
          <Figure label="Collected in June 2027" value={rm(collectedThisMonth)} note={`State share ${rm(collectedThisMonth * STATE_SHARE)} · operator ${rm(collectedThisMonth * (1 - STATE_SHARE))}`} />
        </div>
        <div className="panel"><Figure label="Paying this month" value={pct(complianceRate)} size="md" note="Proposal target for Year 1: 60%" /></div>
        <div className="panel"><Figure label="State share since January" value={rm(stateYtd)} size="md" note={`of ${rm(ytd)} collected`} /></div>
      </div>
      <div className="grid g-main">
        <section className="panel">
          <div className="panel-head"><div><h2>Collected each month</h2><p className="sub">Gross, before the 70:30 split</p></div></div>
          <Columns data={monthly} format={(v) => 'RM' + (v / 1e6).toFixed(2) + 'm'} />
        </section>
        <section className="panel">
          <div className="panel-head"><div><h2>Where the money goes</h2><p className="sub">Since January 2027</p></div></div>
          <SplitBar parts={[
            { label: 'Kerajaan Negeri Sabah', share: 0.7, text: rm(stateYtd), color: 'var(--navy)' },
            { label: 'Operator fee', share: 0.3, text: rm(operatorYtd), color: 'var(--sky)' },
          ]} />
          <h3 style={{ fontSize: 17, margin: '24px 0 4px' }}>Workers this month</h3>
          <MeterRows items={[
            { label: 'Paid', share: paidThisMonth / REGISTERED, text: num(paidThisMonth), color: 'var(--green)' },
            { label: '1 month owing', share: overdue1 / REGISTERED, text: num(overdue1), color: '#d9a43c' },
            { label: '3 months or more owing', share: overdue3 / REGISTERED, text: num(overdue3), color: 'var(--red)' },
          ]} />
        </section>
      </div>
      <section className="panel">
        <div className="panel-head"><div><h2>Paid by district</h2><p className="sub">Share of registered workers who paid for June. Choose a district.</p></div></div>
        <div className="grid g-main">
          <DistrictMap districts={districts} selected={sel} onSelect={setSel} />
          <div className="panel tint"><h3 style={{ fontSize: 20, marginBottom: 14 }}>{d ? d.name : 'No district chosen'}</h3><DistrictDetail d={d} /></div>
        </div>
      </section>
      <div className="grid g-3">
        <section className="panel"><h2>By sector</h2><p className="sub">Registered workers</p>
          <MeterRows items={sectors.slice(0, 6).map((s) => ({ label: s.name, share: s.workers / REGISTERED, text: num(s.workers) }))} />
        </section>
        <section className="panel"><h2>How workers paid</h2><p className="sub">June 2027</p>
          <MeterRows items={channels.map((c) => ({ label: c.name, share: c.share, text: pct(c.share), color: 'var(--sky)' }))} />
        </section>
        <section className="panel"><h2>Nationality</h2><p className="sub">Registered workers</p>
          <MeterRows items={nationalities.map((c) => ({ label: c.name, share: c.share, text: pct(c.share) }))} />
        </section>
      </div>
    </Shell>
  )
}

function Districts() {
  return (
    <Shell>
      <PageHead title="Districts" sub="June 2027. Sample split of the 130,391 registered workers for this prototype." />
      <section className="panel">
        <div className="table-wrap">
          <table className="data stack">
            <thead><tr><th>District</th><th className="r">Registered</th><th className="r">Paid</th><th>Paid share</th><th className="r">Owing</th><th className="r">Collected</th><th className="r">State share</th></tr></thead>
            <tbody>
              {[...districts].sort((a, b) => b.workers - a.workers).map((d) => (
                <tr key={d.id}>
                  <td data-label="District" className="strong">{d.name}</td>
                  <td data-label="Registered" className="r num">{num(d.workers)}</td>
                  <td data-label="Paid" className="r num">{num(d.paid)}</td>
                  <td data-label="Paid share" style={{ minWidth: 140 }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div className="bar" style={{ flex: 1 }}><span style={{ width: pct(d.rate) }} /></div><span className="num">{pct(d.rate)}</span></div></td>
                  <td data-label="Owing" className="r num">{num(d.overdue)}</td>
                  <td data-label="Collected" className="r num">{rm(d.collected)}</td>
                  <td data-label="State share" className="r num">{rm(d.collected * STATE_SHARE)}</td>
                </tr>
              ))}
              <tr><td className="strong" data-label="District">Sabah</td><td className="r num strong" data-label="Registered">{num(REGISTERED)}</td><td className="r num strong" data-label="Paid">{num(paidThisMonth)}</td><td data-label="Paid share" className="num strong">{pct(complianceRate)}</td><td className="r num strong" data-label="Owing">{num(REGISTERED - paidThisMonth)}</td><td className="r num strong" data-label="Collected">{rm(collectedThisMonth)}</td><td className="r num strong" data-label="State share">{rm(collectedThisMonth * STATE_SHARE)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  )
}

function Employers() {
  const [tab, setTab] = useState('Employers')
  const [q, setQ] = useState('')
  const [found, setFound] = useState(null)
  return (
    <Shell>
      <PageHead title="Employers and workers" sub="Read only. The State sees status and totals; records are corrected at their source agency." />
      <div>
        <Tabs items={['Employers', 'Look up a worker']} value={tab} onChange={setTab} label="View" />
        <section className="panel">
          {tab === 'Employers' ? (
            <div className="table-wrap">
              <table className="data stack">
                <thead><tr><th>Employer</th><th>District</th><th>Sector</th><th className="r">Workers</th><th className="r">Paid</th><th>June 2027</th></tr></thead>
                <tbody>{employers.map((e) => (
                  <tr key={e.id}><td data-label="Employer"><span className="strong">{e.name}</span><div className="dim num">SSM {e.ssm}</div></td><td data-label="District">{e.district}</td><td data-label="Sector">{e.sector}</td><td data-label="Workers" className="r num">{num(e.workers)}</td><td data-label="Paid" className="r num">{num(e.paid)}</td><td data-label="June 2027"><Status>{e.status}</Status></td></tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setFound(q.trim() ? demoWorker : null) }} style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field"><label htmlFor="q">SCANS ID, passport or PLKS number</label><input id="q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="SCN26W0047218" /></div>
              <button className="btn primary" style={{ alignSelf: 'flex-start' }}><Search size={16} /> Look up</button>
              {found && <div className="panel tint"><h3 style={{ fontSize: 18, marginBottom: 12 }}>{found.name}</h3><dl className="kv">
                <dt>SCANS ID</dt><dd className="num">{found.scansId}</dd><dt>Employer</dt><dd>{found.employer}</dd><dt>District</dt><dd>{found.district}</dd><dt>Paid up to</dt><dd>{found.paidThrough}</dd><dt>Permit valid until</dt><dd>{found.permitExpiry}</dd>
              </dl><p className="sub" style={{ color: 'var(--muted)', marginTop: 12 }}>This lookup has been written to the audit log.</p></div>}
            </form>
          )}
        </section>
      </div>
    </Shell>
  )
}

function Notices() {
  const toast = useToast()
  const [compose, setCompose] = useState(false)
  return (
    <Shell>
      <PageHead title="Official notices" sub="Notices go to workers in their own language by app, SMS and WhatsApp. Microtek prepares translations; the State approves before sending.">
        <button className="btn primary" onClick={() => setCompose(true)}><Megaphone size={16} /> Write a notice</button>
      </PageHead>
      <section className="panel">
        <div className="table-wrap"><table className="data stack">
          <thead><tr><th>Notice</th><th>Sent to</th><th>Sent</th><th className="r">Reached</th><th>Status</th></tr></thead>
          <tbody>{announcements.map((a) => (
            <tr key={a.id}><td data-label="Notice" className="strong">{a.title}<div className="dim">{a.langs} languages</div></td><td data-label="Sent to">{a.audience}</td><td data-label="Sent">{a.sent}</td><td data-label="Reached" className="r num">{a.reached ? pct(a.reached) : '—'}</td><td data-label="Status"><Status>{a.status}</Status></td></tr>
          ))}</tbody>
        </table></div>
      </section>
      {compose && (
        <Drawer title="Write a notice" sub="It will be translated into all six languages before you approve it." onClose={() => setCompose(false)}
          footer={<><button className="btn" onClick={() => setCompose(false)}>Cancel</button><button className="btn primary" onClick={() => { setCompose(false); toast('Notice sent for translation') }}>Send for translation</button></>}>
          <div className="field"><label htmlFor="t">Title</label><input id="t" className="input" placeholder="Short and plain, under 60 characters" /></div>
          <div className="field"><label htmlFor="b">Message</label><textarea id="b" className="input" placeholder="What workers need to know and what they should do" /></div>
          <div className="field"><label htmlFor="aud">Send to</label><select id="aud" className="input"><option>All workers</option>{districts.map((d) => <option key={d.id}>Workers in {d.name}</option>)}<option>Plantation workers</option><option>Workers with 3 or more months owing</option></select></div>
          <div className="field"><label>Languages</label><p className="hint">{languages.map((l) => l.label).join(', ')}</p></div>
        </Drawer>
      )}
    </Shell>
  )
}

function Complaints() {
  return (
    <Shell>
      <PageHead title="Complaints" sub="Workers write in their own language. SCANS support answers payment questions; everything else goes to the agency that owns it." />
      <div className="grid g-4">
        <div className="panel"><Figure label="Opened in June" value="214" size="md" /></div>
        <div className="panel"><Figure label="With JTK Sabah" value="61" size="md" /></div>
        <div className="panel"><Figure label="Answered within 2 days" value="93%" size="md" /></div>
        <div className="panel"><Figure label="Most common" value="Wages" size="md" note="Then payment problems" /></div>
      </div>
      <section className="panel"><div className="table-wrap"><table className="data stack">
        <thead><tr><th>Reference</th><th>Topic</th><th>District</th><th>Language</th><th>Handled by</th><th>Opened</th><th>Status</th></tr></thead>
        <tbody>{complaints.map((c) => (
          <tr key={c.id}><td data-label="Reference" className="num strong">{c.id}</td><td data-label="Topic">{c.topic}</td><td data-label="District">{c.district}</td><td data-label="Language">{c.lang}</td><td data-label="Handled by">{c.agency}</td><td data-label="Opened">{c.opened}</td><td data-label="Status"><Status>{c.status}</Status></td></tr>
        ))}</tbody>
      </table></div></section>
    </Shell>
  )
}

function Reports() {
  const toast = useToast()
  const list = [
    ['Monthly collection and reconciliation', 'Gross, State share, operator fee, gateway settlements, breaks', 'June 2027'],
    ['FWECF account statement', 'Every settlement into the State account', 'June 2027'],
    ['Paid and owing by district and sector', 'For planning and enforcement priorities', 'June 2027'],
    ['Audit log extract', 'Every record view, export and change', '1 to 17 June 2027'],
    ['Complaints by agency', 'Volumes, response times, outcomes', 'June 2027'],
  ]
  return (
    <Shell>
      <PageHead title="Reports" sub="Prepared for Jabatan Kewangan Negeri and the State’s auditors." />
      <section className="panel"><div className="rows">{list.map(([t, d, p]) => (
        <div key={t} className="row"><FileText color="var(--navy)" /><div className="grow"><div className="t">{t}</div><div className="d">{d} · {p}</div></div><button className="btn sm" onClick={() => toast(t + ' downloaded')}><Download size={14} /> Download</button></div>
      ))}</div></section>
    </Shell>
  )
}

export default function StateApp() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="districts" element={<Districts />} />
      <Route path="employers" element={<Employers />} />
      <Route path="notices" element={<Notices />} />
      <Route path="complaints" element={<Complaints />} />
      <Route path="reports" element={<Reports />} />
    </Routes>
  )
}
