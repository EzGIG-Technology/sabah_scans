// Reports (/employer/reports). From Figma "Reports Centre" (636:147641) and the prototype's tabbed Reports Center
// (Compliance, Worker activity, Settlement, App usage). Every figure comes from the same roster and batches as the
// Overview, Workers and Statements pages, so the numbers agree. Employers see contribution status only.
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Download, FileText, FileSpreadsheet, ShieldCheck, Users, CheckCircle2, Clock, AlertTriangle, Wallet, Smartphone, Gift, Repeat, Layers, ChevronRight, CalendarRange, Info } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Callout, Tabs, Seg, Table, Field, Empty, MeterRows, BarChart, LineChart, useToast } from '../../components/ui.jsx'
import { perksRedemptionsByMonth, rm, num, pct, RATE } from '../../data/demo.js'
import { EmpShell, WStatus, Who } from './shell.jsx'
import { COMPANY, DEMO_TODAY, CUR, useRoster, summarise, useEmp, setEmp, allBatches, complianceTrend, appUsersByMonth, juneSplit, SEED_EXPORTS } from './data.js'

const TABS = ['Contribution', 'Workers', 'Payments', 'App use']
const C = { paid: '#17B26A', due: '#1D66B8', late: '#FF8A1F', risk: '#F0436A' }

/* Adds an export to this visit's "Recent downloads" list. Every export is also written to the audit log. */
function useExport() {
  const toast = useToast()
  const st = useEmp()
  return (name, format = 'PDF') => {
    const n = st.exports.length + 1
    const e = { id: `EXP-2706-${String(40 + n).padStart(3, '0')}`, name, date: DEMO_TODAY, format, size: format === 'CSV' ? `${60 + n * 7} KB` : `${300 + n * 23} KB`, fresh: true }
    setEmp((s) => ({ exports: [e, ...s.exports] }))
    toast(`${name} downloaded as ${format}`)
  }
}

function ExportBtn({ name, label = 'Export', sm = true }) {
  const ex = useExport()
  return <button className={'btn outline' + (sm ? ' sm' : '')} onClick={() => ex(name, 'CSV')}><Download /> {label}</button>
}

/* ---------- Contribution (compliance) ---------- */
function Contribution({ roster, s }) {
  const go = useNavigate()
  const trend = complianceTrend(s)
  const owing = roster.filter((w) => w.bucket !== 'paid').sort((a, b) => b.owing - a.owing)
  const byJob = Object.entries(owing.reduce((m, w) => ({ ...m, [w.role]: (m[w.role] || 0) + 1 }), {}))
    .map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  return (
    <>
      <div className="grid g-5 emp-kpi5">
        <Kpi icon={Users} label="Workers on SCANS" value={num(s.total)} note="From eNORES" />
        <Kpi icon={CheckCircle2} tone="ok" label="Paid for June" value={num(s.paid)} note={pct(s.rate, 1)} />
        <Kpi icon={Clock} label="Due this month" value={num(s.due)} note="No earlier months owing" />
        <Kpi icon={AlertTriangle} tone="warn" label="1–2 months overdue" value={num(s.late)} note="Earlier months owing as well as June" />
        <Kpi icon={AlertTriangle} tone="bad" label="3+ months overdue" value={num(s.risk)} note={`${rm(s.owing)} owing in total`} />
      </div>
      <div className="grid g-main">
        <Card title="Contribution status, last 6 months" sub={`All ${num(s.total)} workers at the end of each month, June to date`}>
          <BarChart height={280} series={['Paid', 'Due this month', '1–2 months overdue', '3+ months overdue']} colors={[C.paid, C.due, C.late, C.risk]}
            data={trend.map((t) => ({ label: t.label, values: [t.paid, t.due, t.late, t.risk] }))} format={(v) => num(Math.round(v))} />
        </Card>
        <Card title="Who owes, by job" sub={`The ${num(owing.length)} workers not paid for June`}>
          {byJob.length === 0 ? <Empty icon={CheckCircle2} title="Everyone has paid for June" /> : (
            <MeterRows items={byJob.slice(0, 6).map((j) => ({ label: j.label, text: `${j.value} ${j.value === 1 ? 'worker' : 'workers'}`, share: j.value / owing.length }))} />
          )}
          <Callout icon={Info} style={{ marginTop: 16 }}>Late payment never affects a worker’s permit. Use this to plan reminders or, with their consent, to pay for them.</Callout>
        </Card>
      </div>
      <Card title="Workers not paid for June" sub="Paid in 2027 counts January to June" action={<ExportBtn name="Workers not paid for June 2027" />}>
        <Table rows={owing} pageSize={8} onRowClick={(w) => go('/employer/workers/' + w.id)}
          empty={<Empty icon={CheckCircle2} title="Everyone has paid for June">No worker owes anything today.</Empty>}
          columns={[
            { key: 'name', label: 'Worker', render: (w) => <Who w={w} /> },
            { key: 'nationality', label: 'Nationality' },
            { key: 'role', label: 'Job' },
            { key: 'months', label: 'Paid in 2027', align: 'r', render: (w) => <span className="num">{Math.max(0, w.paidIdx + 1)} / {CUR + 1}</span> },
            { key: 'owing', label: 'Owing', align: 'r', render: (w) => <b className="num" style={{ color: w.bucket === 'risk' ? 'var(--bad)' : w.bucket === 'late' ? 'var(--warn)' : undefined }}>{rm(w.owing, 2)}</b> },
            { key: 'status', label: 'Status', render: (w) => <WStatus w={w} /> },
          ]}
          footer={owing.length ? <tfoot><tr><td colSpan={4}>{num(owing.length)} workers</td><td className="r num">{rm(s.owing, 2)}</td><td /></tr></tfoot> : null} />
      </Card>
    </>
  )
}

/* ---------- Workers (activity by nationality, who paid) ---------- */
function WorkersTab({ roster, s, st }) {
  const split = juneSplit(roster, s, st)
  const nat = Object.values(roster.reduce((m, w) => {
    const k = w.nationality
    m[k] = m[k] || { label: k, paid: 0, due: 0, late: 0, risk: 0, n: 0 }
    m[k][w.bucket] += 1; m[k].n += 1
    return m
  }, {})).sort((a, b) => b.n - a.n)
  return (
    <>
      <div className="grid g-4">
        <Kpi icon={Users} label="Workers on SCANS" value={num(s.total)} note="From eNORES" />
        <Kpi icon={Wallet} label="Paid June themselves" value={num(split.self)} note={`${pct(split.self / s.paid)} of those paid`} />
        <Kpi icon={Layers} tone="purple" label="Paid June by the company" value={num(split.company)} note={`${pct(split.company / s.paid)} of those paid, with consent`} />
        <Kpi icon={CheckCircle2} tone="ok" label="Consent to company payment" value={num(roster.filter((w) => w.consent).length)} note={`of the ${num(roster.length)} workers in this list`} />
      </div>
      <div className="grid g-main">
        <Card title="Status by nationality" sub={`The ${num(roster.length)} workers in your list: every worker not paid for June and a sample of those who have`}>
          <div className="emp-natrows">
            {nat.map((n) => (
              <div key={n.label}>
                <div className="row between small" style={{ marginBottom: 6 }}><b>{n.label}</b><span className="muted num">{n.n} {n.n === 1 ? 'worker' : 'workers'}</span></div>
                <div className="emp-stack" role="img" aria-label={`${n.label}: ${n.paid} paid, ${n.due} due this month, ${n.late} 1–2 months overdue, ${n.risk} 3+ months overdue`}>
                  {['paid', 'due', 'late', 'risk'].map((k) => n[k] > 0 && <span key={k} style={{ width: (n[k] / n.n) * 100 + '%', background: C[k] }} />)}
                </div>
              </div>
            ))}
          </div>
          <div className="legend" style={{ marginTop: 14 }}>
            <span><i style={{ background: C.paid }} />Paid</span><span><i style={{ background: C.due }} />Due this month</span>
            <span><i style={{ background: C.late }} />1–2 months overdue</span><span><i style={{ background: C.risk }} />3+ months overdue</span>
          </div>
        </Card>
        <Card title="Who paid for June" sub={`${num(s.paid)} workers paid`}>
          <MeterRows big items={[
            { label: 'The worker, in the app or at 7-Eleven', text: `${num(split.self)} workers`, share: split.self / s.paid, color: 'var(--gradBtn)' },
            { label: 'Your company, with the worker’s consent', text: `${num(split.company)} workers`, share: split.company / s.paid, color: 'linear-gradient(90deg,#7B4DE3,#A27BFF)' },
          ]} />
          <Callout icon={ShieldCheck} style={{ marginTop: 16 }}>The worker is responsible for their own contribution. You see whether it is paid, never wages, complaints or immigration details.</Callout>
        </Card>
      </div>
    </>
  )
}

/* ---------- Payments (settlement) ---------- */
function Payments({ st, s }) {
  const go = useNavigate()
  const batches = allBatches(st)
  const paid = batches.reduce((a, b) => a + b.amount, 0)
  const covered = batches.reduce((a, b) => a + b.workers * b.months, 0)
  const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const byMonth = MS.map((m) => ({ label: m, value: batches.filter((b) => b.date.split(' ')[1] === m).reduce((a, b) => a + b.amount, 0) }))
  const m = st.mandate
  return (
    <>
      <div className="grid g-4">
        <Kpi hero icon={Wallet} label="Paid by the company in 2027" value={rm(paid)} note={`${batches.length} batch payments`} />
        <Kpi icon={Layers} label="Worker-months covered" value={num(covered)} note={`At ${rm(RATE)} each`} />
        <Kpi icon={Repeat} tone={m ? 'ok' : undefined} label="On monthly auto-pay" value={m ? num(m.workers.length) : 'Off'} note={m ? `${rm(m.workers.length * RATE)} a month` : 'Not set up'} />
        <Kpi icon={AlertTriangle} tone="bad" label="Still owing today" value={rm(s.owing)} note={`${num(s.unpaid)} workers, all methods`} />
      </div>
      <Card title="Paid by the company each month" sub="Batch payments, 2027" action={<Link to="/employer/statements" className="link">Statements <ChevronRight size={15} /></Link>}>
        <BarChart data={byMonth} highlight={5} height={240} format={(v) => (v >= 1000 ? 'RM' + Math.round(v / 1000) + 'k' : 'RM' + Math.round(v))} />
      </Card>
      <Card title={`${batches.length} batch payments`} sub="Settled into the FWECF account held by Jabatan Kewangan Negeri Sabah" action={<ExportBtn name="Batch payments 2027" />}>
        <Table rows={batches} pageSize={6} onRowClick={() => go('/employer/statements')} columns={[
          { key: 'id', label: 'Batch', render: (b) => <span><b className="num">{b.id}</b>{b.session && <span className="pill info" style={{ marginLeft: 8 }}>New</span>}</span> },
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type', render: () => <span className="pill grey">Batch payment</span> },
          { key: 'workers', label: 'Workers', align: 'r', render: (b) => num(b.workers) },
          { key: 'method', label: 'Paid with' },
          { key: 'amount', label: 'Amount', align: 'r', render: (b) => <b className="num">{rm(b.amount, 2)}</b> },
          { key: 'status', label: 'Status', render: (b) => <Status>{b.status}</Status> },
        ]} footer={<tfoot><tr><td colSpan={5}>Total</td><td className="r num">{rm(paid, 2)}</td><td /></tr></tfoot>} />
      </Card>
    </>
  )
}

/* ---------- App use ---------- */
function AppUse({ s }) {
  const notUsing = s.total - COMPANY.appUsers
  const perks = perksRedemptionsByMonth.reduce((a, b) => a + b.value, 0)
  const rows = appUsersByMonth.map((a, i) => ({ id: a.label, month: a.label + ' 2027', users: a.value, share: a.value / s.total, perks: perksRedemptionsByMonth[i].value })).reverse()
  return (
    <>
      <div className="grid g-4">
        <Kpi icon={Smartphone} tone="purple" label="Using the SCANS app" value={num(COMPANY.appUsers)} note={`${pct(COMPANY.appUsers / s.total)} of your workers`} delta={`+${COMPANY.appUsers - 347} on May`} />
        <Kpi icon={Users} tone="warn" label="Not using the app yet" value={num(notUsing)} note="They can still pay at 7-Eleven" />
        <Kpi icon={Gift} label="Perks used in 2027" value={num(perks)} note="Confirmed by partner shops" />
        <Kpi icon={Gift} label="Perks used in June" value={num(perksRedemptionsByMonth[5].value)} note="Month to date" />
      </div>
      <Card title="App use each month" sub="Workers who opened the app, and perks confirmed by shops">
        <LineChart height={240} format={(v) => num(Math.round(v))} series={[
          { name: 'Workers using the app', color: '#1D66B8', points: appUsersByMonth },
          { name: 'Perks used', color: '#14B8A6', points: perksRedemptionsByMonth },
        ]} />
      </Card>
      <Card title="By month" action={<ExportBtn name="App use 2027" />}>
        <Table rows={rows} pageSize={6} columns={[
          { key: 'month', label: 'Month', render: (r) => <b>{r.month}</b> },
          { key: 'users', label: 'Workers using the app', align: 'r', render: (r) => <span className="num">{num(r.users)}</span> },
          { key: 'share', label: 'Share of workers', align: 'r', render: (r) => <b className="num" style={{ color: 'var(--ok)' }}>{pct(r.share, 1)}</b> },
          { key: 'perks', label: 'Perks used', align: 'r', render: (r) => <span className="num">{num(r.perks)}</span> },
        ]} />
      </Card>
    </>
  )
}

/* ---------- Download a report (Figma report cards + recent exports) ---------- */
const REPORTS = [
  { key: 'status', icon: CheckCircle2, title: 'Contribution status report', note: 'Status and amount owing for every worker' },
  { key: 'payments', icon: Wallet, title: 'Payment history report', note: 'Every contribution paid, by the worker or by the company, with receipt numbers' },
  { key: 'app', icon: Smartphone, title: 'App use report', note: 'Workers using the SCANS app and perks used' },
]
function ReportCard({ r }) {
  const ex = useExport()
  const [period, setPeriod] = useState('Monthly')
  const [from, setFrom] = useState('2027-06-01')
  const [to, setTo] = useState('2027-06-17')
  const [format, setFormat] = useState('PDF')
  const err = !from || !to ? 'Choose both dates.' : from > to ? 'The start date must be before the end date.' : null
  const fmt = (d) => { const [y, m, dd] = d.split('-'); return `${Number(dd)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1]} ${y}` }
  return (
    <Card>
      <div className="emp-rep">
        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <span className="emp-ic"><r.icon size={18} /></span>
          <div><b>{r.title}</b><p className="small muted">{r.note}</p></div>
        </div>
        <div className="field"><span>Summary</span><Seg label={`${r.title} summary`} value={period} onChange={setPeriod} items={[{ value: 'Daily', label: 'Daily' }, { value: 'Monthly', label: 'Monthly' }]} /></div>
        <div className="emp-dates">
          <Field label="From"><input type="date" className={'input' + (err ? ' err' : '')} min="2027-01-01" max="2027-06-17" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><input type="date" className={'input' + (err ? ' err' : '')} min="2027-01-01" max="2027-06-17" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        </div>
        {err && <small className="error" role="alert">{err}</small>}
        <div className="row between wrap" style={{ gap: 8 }}>
          <Seg label={`${r.title} format`} value={format} onChange={setFormat} items={['PDF', 'CSV']} />
          <button className="btn primary sm" disabled={!!err} onClick={() => ex(`${r.title.replace(' report', '')}, ${period.toLowerCase()}, ${fmt(from)} to ${fmt(to)}`, format)}><Download /> Download</button>
        </div>
      </div>
    </Card>
  )
}

function Downloads() {
  const st = useEmp()
  const toast = useToast()
  const list = [...st.exports, ...SEED_EXPORTS]
  return (
    <>
      <div className="grid g-3">{REPORTS.map((r) => <ReportCard key={r.key} r={r} />)}</div>
      <Card title="Recent downloads" sub="Every download is recorded in the SCANS audit log">
        {list.length === 0 ? <Empty icon={FileText} title="No downloads yet" /> : (
          <div className="emp-rows">
            {list.map((e) => (
              <div key={e.id}>
                <span className="emp-ic">{e.format === 'CSV' ? <FileSpreadsheet size={18} /> : <FileText size={18} />}</span>
                <div className="grow" style={{ minWidth: 0 }}><b>{e.name}</b><small className="num">{e.date} · {e.format} · {e.size}</small></div>
                {e.fresh && <span className="pill info">New</span>}
                <button className="btn ghost sm icon" aria-label={`Download ${e.name} again`} onClick={() => toast(`${e.name} downloaded again`)}><Download /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

export default function Reports() {
  const roster = useRoster()
  const s = summarise(roster)
  const st = useEmp()
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'Contribution'
  return (
    <EmpShell title="Reports">
      <PageHead title="Reports" crumbs={[{ label: 'Monitor' }, { label: 'Reports' }]}
        sub={`Contribution, payment and app figures for ${COMPANY.name}, January to ${DEMO_TODAY}. They match the Overview and Statements pages.`}>
        <span className="chip"><CalendarRange size={15} /> 1 Jan to {DEMO_TODAY}</span>
      </PageHead>
      <Tabs label="Report" value={tab} onChange={(t) => setParams(t === 'Contribution' ? {} : { tab: t })} items={TABS} />
      {tab === 'Contribution' && <Contribution roster={roster} s={s} />}
      {tab === 'Workers' && <WorkersTab roster={roster} s={s} st={st} />}
      {tab === 'Payments' && <Payments st={st} s={s} />}
      {tab === 'App use' && <AppUse s={s} />}
      <h2 className="emp-h2">Download a report</h2>
      <Downloads />
    </EmpShell>
  )
}
