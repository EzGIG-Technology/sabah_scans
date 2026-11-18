import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Download, ShieldCheck, CreditCard, CalendarClock, Receipt, UserX } from 'lucide-react'
import { PageHead, Card, Status, Callout, Tabs, SearchInput, Select, Table, Empty, Avatar, useToast } from '../../components/ui.jsx'
import { rm, num } from '../../data/demo.js'
import { EmpShell, WStatus, Who, permitText } from './shell.jsx'
import { COMPANY, useRoster, summarise, useEmp, historyFor, monthLabel, CUR } from './data.js'

const TABS = ['All', 'Not paid', 'Permit ends soon']

export function WorkersList() {
  const roster = useRoster()
  const s = summarise(roster)
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'All'
  const [q, setQ] = useState('')
  const [consent, setConsent] = useState('all')
  const go = useNavigate()
  const toast = useToast()
  const soon = (w) => w.permitDays <= 60
  const counts = { All: roster.length, 'Not paid': roster.filter((w) => w.bucket !== 'paid').length, 'Permit ends soon': roster.filter(soon).length }
  const rows = roster
    .filter((w) => tab === 'All' || (tab === 'Not paid' ? w.bucket !== 'paid' : soon(w)))
    .filter((w) => consent === 'all' || (consent === 'yes' ? w.consent : !w.consent))
    .filter((w) => !q || (w.name + ' ' + w.id + ' ' + w.role).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (tab === 'Permit ends soon' ? a.permitDays - b.permitDays : tab === 'Not paid' ? b.owing - a.owing : 0))
  return (
    <EmpShell title="Workers">
      <PageHead title="Workers" sub={`${num(s.total)} workers registered to ${COMPANY.name} in eNORES. This list shows every worker who has not paid for June and a sample of those who have. Records can only be corrected through JTK Sabah.`}>
        <button className="btn outline" onClick={() => toast('Worker list downloaded as CSV')}><Download /> Download list</button>
        <Link to="/employer/pay" className="btn primary"><CreditCard /> Pay for workers</Link>
      </PageHead>
      <Card>
        <Tabs label="Filter workers" value={tab} onChange={(t) => setParams(t === 'All' ? {} : { tab: t })} items={TABS.map((t) => ({ value: t, label: t, count: counts[t] }))} />
        <div className="toolbar" style={{ margin: '16px 0 12px' }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search name, SCANS ID or job" />
          <Select label="Consent" value={consent} onChange={setConsent} options={[{ value: 'all', label: 'Any consent' }, { value: 'yes', label: 'Consent given' }, { value: 'no', label: 'No consent' }]} />
        </div>
        {tab === 'Permit ends soon' && <Callout icon={CalendarClock} style={{ marginBottom: 12 }}>Permit dates come from JIM and are shown for renewal planning only. They do not affect contributions, and late payment never affects a permit.</Callout>}
        <Table rows={rows} onRowClick={(w) => go('/employer/workers/' + w.id)} pageSize={10}
          empty={<Empty title={q ? 'No worker matches your search' : 'Nobody here'}>{q ? 'Check the spelling or search by SCANS ID.' : 'Every worker in this view is up to date.'}</Empty>}
          columns={[
            { key: 'name', label: 'Worker', render: (w) => <Who w={w} /> },
            { key: 'role', label: 'Job' },
            { key: 'status', label: 'June 2027', render: (w) => <WStatus w={w} /> },
            { key: 'paidThrough', label: 'Paid up to' },
            { key: 'owing', label: 'Owing', align: 'r', render: (w) => <span className="num" style={{ fontWeight: 600, color: w.owing ? (w.bucket === 'risk' ? 'var(--bad)' : 'var(--ink)') : 'var(--ink3)' }}>{rm(w.owing)}</span> },
            { key: 'consent', label: 'Consent to employer payment', render: (w) => <Status tone={w.consent ? 'ok' : 'grey'}>{w.consent ? 'Given' : 'Not given'}</Status> },
            { key: 'permit', label: 'Permit valid until', render: (w) => <span className={w.permitDays <= 60 ? '' : 'muted'} style={{ color: w.permitDays < 0 ? 'var(--ink3)' : w.permitDays <= 60 ? 'var(--warn)' : undefined }}>{permitText(w)}</span> },
          ]} />
      </Card>
    </EmpShell>
  )
}

export function WorkerProfile() {
  const { id } = useParams()
  const roster = useRoster()
  const st = useEmp()
  const go = useNavigate()
  const [tab, setTab] = useState('Contribution')
  const w = roster.find((x) => x.id === id)
  if (!w) {
    return (
      <EmpShell title="Worker">
        <PageHead title="Worker not found" back="/employer/workers" />
        <Card><Empty icon={UserX} title="We could not find this worker">The SCANS ID may be wrong, or the worker is no longer registered to your company in eNORES. <div style={{ marginTop: 14 }}><Link to="/employer/workers" className="btn">Back to workers</Link></div></Empty></Card>
      </EmpShell>
    )
  }
  const history = historyFor(w, st.batches)
  const permitShare = Math.max(0, Math.min(1, w.permitDays / 730))
  return (
    <EmpShell title="Worker">
      <PageHead title="Contribution status" back="/employer/workers" crumbs={[{ label: 'Workers', to: '/employer/workers' }, { label: w.name }]}>
        {w.consent && w.owing > 0 && <button className="btn primary" onClick={() => go('/employer/pay?w=' + w.id)}><CreditCard /> Pay for this worker</button>}
        {w.consent && w.owing === 0 && <button className="btn outline" onClick={() => go('/employer/pay?w=' + w.id)}><CreditCard /> Pay months ahead</button>}
      </PageHead>
      <div className="grid g-profile">
        <Card>
          <div className="emp-prof">
            <Avatar name={w.name} size="lg" grad />
            <h2>{w.name}</h2>
            <span className="muted num">{w.id}</span>
            <span className="small muted">{w.role} · {COMPANY.site}</span>
            <div className="emp-owing">
              <div><b className="num" style={{ color: w.bucket === 'risk' ? 'var(--bad)' : undefined }}>{rm(w.owing)}</b><small>{w.owing ? `Owing, ${w.owingMonths} ${w.owingMonths === 1 ? 'month' : 'months'} including June` : 'Nothing owing'}</small></div>
              <WStatus w={w} />
            </div>
            <div style={{ width: '100%', textAlign: 'left', marginTop: 14 }}>
              <div className="row between small"><b>Permit valid until</b><span className="muted">{w.permitDays < 0 ? 'Ended' : `${num(w.permitDays)} days left`}</span></div>
              <div className="bar" style={{ marginTop: 8 }}><span style={{ width: permitShare * 100 + '%', background: w.permitDays <= 60 ? 'linear-gradient(90deg,#FF8A1F,#FFB020)' : undefined }} /></div>
              <p className="small muted" style={{ marginTop: 6 }}>{w.permitExpiry}, from JIM. For planning only. It has nothing to do with contributions.</p>
            </div>
          </div>
        </Card>
        <Card>
          <Tabs label="Worker details" value={tab} onChange={setTab} items={['Contribution', { value: 'History', label: 'Payment history', count: history.length }]} />
          <div style={{ marginTop: 18 }}>
            {tab === 'Contribution' ? (
              <div className="stack">
                <dl className="kv">
                  <div><dt>SCANS ID</dt><dd className="num">{w.id}</dd></div>
                  <div><dt>Job</dt><dd>{w.role}</dd></div>
                  <div><dt>June 2027</dt><dd><WStatus w={w} /></dd></div>
                  <div><dt>Paid up to</dt><dd>{w.paidThrough}</dd></div>
                  <div><dt>Amount owing</dt><dd className="num">{rm(w.owing)}</dd></div>
                  <div><dt>Next month due</dt><dd>{monthLabel(Math.max(w.paidIdx + 1, CUR), true)}</dd></div>
                  <div><dt>Uses the SCANS app</dt><dd>{w.appActive ? 'Yes' : 'Not recently'}</dd></div>
                  <div><dt>Consent to employer payment</dt><dd><Status tone={w.consent ? 'ok' : 'grey'}>{w.consent ? 'Given in the app' : 'Not given'}</Status></dd></div>
                </dl>
                {!w.consent && (
                  <Callout tone="warn">{w.name} has not agreed to let the company pay for them, so you cannot pay for this worker. They can still pay themselves in the app, at 7-Eleven or online. Only the worker can give consent, in the app under Me.</Callout>
                )}
                <Callout icon={ShieldCheck}>You see this worker’s contribution status only. Wages, complaints and immigration details are not shared with employers.</Callout>
              </div>
            ) : history.length === 0 ? (
              <Empty icon={Receipt} title="No payments yet">Nothing has been paid for this worker since SCANS started in January 2027.</Empty>
            ) : (
              <Table rows={history} pageSize={8} columns={[
                { key: 'id', label: 'Receipt', render: (p) => <b className="num">{p.id}</b> },
                { key: 'month', label: 'For' },
                { key: 'date', label: 'Paid on' },
                { key: 'by', label: 'Paid by', render: (p) => (p.by === COMPANY.name ? 'Your company' : 'The worker') },
                { key: 'method', label: 'Method' },
                { key: 'amount', label: 'Amount', align: 'r', render: (p) => <b className="num">{rm(p.amount)}</b> },
              ]} />
            )}
          </div>
        </Card>
      </div>
    </EmpShell>
  )
}
