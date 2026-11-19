// State Government dashboard (/state/*) for Kerajaan Negeri Sabah.
// Read-only views of the shared record, the FWECF account, notices the State approves,
// and complaints routed to agencies. Every lookup and export is written to the audit log.
import { useMemo, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Map as MapIcon, Users, Building2, Landmark, Megaphone, MessageSquareWarning, FileBarChart, Wallet, Percent,
  PiggyBank, UserCheck, Download, Check, X, Eye, Plus, Send, Scale, CalendarCheck, Clock, CheckCircle2, Inbox, Languages, ShieldCheck, Route as RouteIcon, ScanLine, Store,
} from 'lucide-react'
import {
  AppShell, PageHead, Card, Kpi, Status, Pill, Callout, Empty, Tabs, Field, Table, Drawer, Modal, BarChart, HBarChart, Donut,
  MeterRows, SplitBar, Sparkline, SabahMap, DistrictDetail, Select, useToast,
} from '../../components/ui.jsx'
import {
  REGISTERED, STATE_SHARE, districts, sectors, monthly, monthlySplit, ytd, stateYtd, operatorYtd, paidThisMonth, collectedThisMonth,
  complianceRate, paymentMetrics, nationalityCounts, rm, num, pct,
} from '../../data/demo.js'
import { channelData, settlements, settledJune, arrearsAndAdvance, complaintsAll, AGENCIES, breaksOn } from '../shared/data.js'
import { useAdmin } from '../admin/store.js'
import { useStore, logEvent, setActor, updateNotice, addNotice } from '../shared/store.js'
import { WorkerList, WorkerProfile } from '../shared/Workers.jsx'
import { EmployerList, EmployerProfile } from '../shared/Employers.jsx'
import { ReportsCentre } from '../shared/Reports.jsx'
import { NoticeComposer, NoticeView, ChannelIcons, AudiencePill } from '../shared/Notices.jsx'
import '../shared/shared.css'
import Overview from './Overview.jsx'
import WorkerCheck from './WorkerCheck.jsx'
import Merchants from './Merchants.jsx'
import './state.css'

const BASE = '/state'
const ACTOR = 'Nurul Ain (State, JKN)'
const FROM = { State: 'the State', JIM: 'JIM Sabah', Microtek: 'Microtek' }
const fromName = (n) => FROM[n.origin] || 'Microtek'
const axisRm = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'm' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : String(v))
const rmM = (v) => 'RM ' + (v / 1e6).toFixed(2) + 'm'

const TITLES = [
  [/^\/state\/?$/, 'Overview'], [/^\/state\/districts/, 'Districts'], [/^\/state\/workers\/.+/, 'Worker profile'], [/^\/state\/workers/, 'Workers'],
  [/^\/state\/employers\/.+/, 'Employer profile'], [/^\/state\/employers/, 'Employers'], [/^\/state\/finance/, 'FWECF account'],
  [/^\/state\/notices/, 'Official notices'], [/^\/state\/complaints/, 'Complaints'], [/^\/state\/reports/, 'Reports'], [/^\/state\/check/, 'Worker check'], [/^\/state\/merchants/, 'Merchant partners'],
]

export default function StateApp() {
  setActor(ACTOR)
  const loc = useLocation()
  const notices = useStore((s) => s.notices)
  const waiting = notices.filter((n) => n.status === 'Waiting for State approval').length
  const title = (TITLES.find(([re]) => re.test(loc.pathname)) || [, 'State dashboard'])[1]
  const nav = [
    { group: 'Monitor', items: [
      { to: BASE, label: 'Overview', icon: LayoutDashboard, end: true },
      { to: BASE + '/districts', label: 'Districts', icon: MapIcon },
      { to: BASE + '/finance', label: 'FWECF account', icon: Landmark },
    ] },
    { group: 'Records', items: [
      { to: BASE + '/workers', label: 'Workers', icon: Users },
      { to: BASE + '/employers', label: 'Employers', icon: Building2 },
      { to: BASE + '/check', label: 'Worker check', icon: ScanLine },
      { to: BASE + '/merchants', label: 'Merchant partners', icon: Store },
    ] },
    { group: 'Communicate', items: [
      { to: BASE + '/notices', label: 'Official notices', icon: Megaphone, count: waiting || null },
      { to: BASE + '/complaints', label: 'Complaints', icon: MessageSquareWarning },
    ] },
    { group: 'Reporting', items: [
      { to: BASE + '/reports', label: 'Reports', icon: FileBarChart },
    ] },
  ]
  const notifications = [
    ...(waiting ? [{ title: `${waiting} notice${waiting > 1 ? 's' : ''} from Microtek or JIM waiting for your approval`, time: 'Official notices' }] : []),
    { title: 'Settlement of RM 302,700 credited to the FWECF account', time: '16 Dec 2027, 23:04' },
    { title: 'New complaint routed to JTK Sabah', time: 'Keningau · 26 Nov 2027' },
  ]
  return (
    <AppShell nav={nav} portal={{ name: 'Kerajaan Negeri Sabah', sub: 'Kementerian Kewangan Negeri Sabah', crest: '/img/logos/mof-sabah.png' }}
      user={{ name: 'Nurul Ain', role: 'Jabatan Kewangan Negeri' }} title={title} kicker="State dashboard" notifications={notifications}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="districts" element={<Districts />} />
        <Route path="workers" element={<WorkerList base={BASE} readOnly />} />
        <Route path="workers/:id" element={<WorkerProfile base={BASE} readOnly />} />
        <Route path="employers" element={<EmployerList base={BASE} />} />
        <Route path="employers/:id" element={<EmployerProfile base={BASE} readOnly />} />
        <Route path="check" element={<WorkerCheck />} />
        <Route path="merchants" element={<Merchants />} />
        <Route path="finance" element={<Finance />} />
        <Route path="notices" element={<Notices />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="reports" element={<ReportsCentre scope="state" />} />
        <Route path="*" element={<Card><Empty title="This page does not exist">Use the menu to find what you need.</Empty></Card>} />
      </Routes>
    </AppShell>
  )
}

/* =====================================================================
   Districts
   ===================================================================== */
function Districts() {
  const go = useNavigate()
  const rows = [...districts].sort((a, b) => b.workers - a.workers)
  const owing = REGISTERED - paidThisMonth
  const fcell = (label, v, cls = 'r') => <td data-label={label} className={cls}><b className="num">{v}</b></td>
  return (
    <>
      <PageHead title="Districts" sub="December 2027. Sample split of the 130,391 registered workers for this prototype. Choose a district to look up its workers." />
      <Card title="Paid and not yet paid" sub="Workers by district, December 2027">
        <BarChart data={rows.map((d) => ({ label: d.name.replace('Kota Kinabalu', 'KK'), values: [d.paid, d.overdue] }))} series={['Paid', 'Not yet paid']} colors={['#1D66B8', '#FF8A1F']} height={240} format={axisRm} />
      </Card>
      <Card flush>
        <div style={{ padding: '6px 14px 14px' }}>
          <Table rows={rows} pageSize={20} onRowClick={(d) => go(`${BASE}/workers?district=${encodeURIComponent(d.name)}`)} columns={[
            { key: 'name', label: 'District', render: (d) => <b>{d.name}</b> },
            { key: 'workers', label: 'Registered', align: 'r', render: (d) => num(d.workers) },
            { key: 'paid', label: 'Paid', align: 'r', render: (d) => num(d.paid) },
            { key: 'rate', label: 'Paid share', render: (d) => <div className="row" style={{ gap: 8, minWidth: 130 }}><div className="bar grow" style={{ minWidth: 50 }}><span style={{ width: pct(d.rate) }} /></div><span className="num small">{pct(d.rate)}</span></div> },
            { key: 'overdue', label: 'Not yet paid', align: 'r', render: (d) => num(d.overdue) },
            { key: 'collected', label: 'Collected', align: 'r', render: (d) => rm(d.collected) },
          ]} footer={
            <tfoot><tr>
              <td data-label="District"><b>Sabah</b></td>
              {fcell('Registered', num(REGISTERED))}
              {fcell('Paid', num(paidThisMonth))}
              {fcell('Paid share', pct(complianceRate), '')}
              {fcell('Not yet paid', num(owing))}
              {fcell('Collected', rm(collectedThisMonth))}
            </tr></tfoot>
          } />
        </div>
      </Card>
      <Callout>District totals add up to the {num(REGISTERED)} registered workers and to {rm(collectedThisMonth)} collected for December, the same figures as the overview and the FWECF account.</Callout>
    </>
  )
}

/* =====================================================================
   FWECF account
   ===================================================================== */
const MONTHS = ['December 2027', 'November 2027', 'October 2027', 'September 2027', 'August 2027', 'July 2027']

function Finance() {
  const toast = useToast()
  const [month, setMonth] = useState('December 2027')
  const [day, setDay] = useState(null)
  const reconciled = settlements.filter((s) => s.status !== 'Pending').length
  // Same break log as the operator's Settlement page, so resolving a break there shows here too.
  const breakLog = useAdmin((s) => s.breaks)
  const openBreaks = breakLog.filter((b) => b.status === 'Open').length
  const resolvedBreaks = breakLog.length - openBreaks
  const dayBreaks = (s) => breaksOn(breakLog, s.date)
  const totals = settlements.reduce((t, s) => ({ gross: t.gross + s.gross, receipts: t.receipts + s.receipts, state: t.state + s.state, operator: t.operator + s.operator, credited: t.credited + s.credited }), { gross: 0, receipts: 0, state: 0, operator: 0, credited: 0 })
  const d = settlements.find((s) => s.id === day)
  const db = d ? dayBreaks(d) : null
  const download = (what, fmt) => { logEvent('Downloaded report', `${what} · ${month} · ${fmt}`); toast(`${what}, ${month} (${fmt}) downloaded. The download is in the audit log.`) }
  const fcell = (label, v) => <td data-label={label} className="r"><b className="num">{v}</b></td>
  return (
    <>
      <PageHead title="FWECF account" sub="Held by Jabatan Kewangan Negeri Sabah. Payments go from the licensed acquirer straight into this account; SCANS never holds funds.">
        <Select label="Statement month" value={month} onChange={setMonth} options={MONTHS} />
        <button className="btn primary" onClick={() => download('FWECF account statement', 'PDF')}><Download /> Statement</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi hero icon={Landmark} label="Settled in December" value={rm(settledJune)} note={`${num(totals.receipts)} receipts, 1 to 17 December`} />
        <Kpi icon={PiggyBank} tone="ok" label="State share (70%)" value={rm(totals.state)} note="Stays in the FWECF account" />
        <Kpi icon={Wallet} tone="purple" label="Operator share (30%)" value={rm(totals.operator)} note="Paid to Microtek monthly" />
        <Kpi icon={Scale} tone={openBreaks ? 'warn' : 'ok'} label="Days reconciled" value={`${reconciled} of ${settlements.length}`} note={`${resolvedBreaks} breaks found and resolved${openBreaks ? `, ${openBreaks} open` : ''}. Today settles at 23:00.`} />
      </div>
      <Callout icon={CalendarCheck}>
        December settlements of {rm(settledJune)} = December contributions of {rm(collectedThisMonth)} (the figure on the overview) + {rm(arrearsAndAdvance)} of arrears cleared and months paid in advance. The 70:30 split and the operator’s invoice are worked out on settlements, after reconciliation.
      </Callout>
      <div className="grid g-main">
        <Card title="Daily settlement" sub="Credited to the FWECF account each night, December 2027">
          <BarChart data={settlements.map((s, i) => ({ label: String(i + 1), values: [s.state, s.operator] }))} series={['State share (70%)', 'Operator (30%)']} colors={['#1D66B8', '#4D9AD3']} height={240} format={axisRm} />
        </Card>
        <Card title="Statements and extracts" sub={month}>
          <div className="gv-attn">
            {[['FWECF account statement', 'PDF'], ['Monthly collection and reconciliation', 'CSV'], ['Settlement file from the acquirer', 'CSV'], ['Operator fee invoice, 30%', 'PDF']].map(([w, f]) => (
              <button key={w} onClick={() => download(w, f)}>
                <span className="ic"><Download aria-hidden="true" /></span>
                <div><b>{w}</b><small>{f} · {month}</small></div>
              </button>
            ))}
          </div>
          <div className="gv-sub" style={{ marginTop: 18 }}>Settled since July</div>
          <SplitBar parts={[
            { label: 'State', share: STATE_SHARE, text: rmM(stateYtd), color: '#1D66B8' },
            { label: 'Operator', share: 1 - STATE_SHARE, text: rmM(operatorYtd), color: '#4D9AD3' },
          ]} />
        </Card>
      </div>
      <Card title="Daily settlements and reconciliation" sub="Each day’s acquirer credit matched against SCANS receipts. Choose a day for detail.">
        <Table rows={[...settlements].reverse()} pageSize={17} onRowClick={(s) => setDay(s.id)} columns={[
          { key: 'date', label: 'Date', render: (s) => <b>{s.date}</b> },
          { key: 'receipts', label: 'Receipts', align: 'r', render: (s) => num(s.receipts) },
          { key: 'gross', label: 'Gross', align: 'r', render: (s) => rm(s.gross) },
          { key: 'state', label: 'State 70%', align: 'r', render: (s) => rm(s.state) },
          { key: 'operator', label: 'Operator 30%', align: 'r', render: (s) => rm(s.operator) },
          { key: 'credited', label: 'Credited', align: 'r', render: (s) => (s.credited ? rm(s.credited) : 'Tonight') },
          { key: 'status', label: 'Reconciliation', render: (s) => <Status tone={s.status === 'Pending' ? 'warn' : 'ok'}>{s.status === 'Resolved' ? 'Reconciled' : s.status}</Status> },
          { key: 'breaks', label: 'Breaks', align: 'r', render: (s) => { const b = dayBreaks(s); return b.all ? <span className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>{b.open > 0 && <Pill tone="bad">{b.open} open</Pill>}{b.resolved > 0 && <Pill tone="warn">{b.resolved} resolved</Pill>}</span> : '0' } },
        ]} footer={
          <tfoot><tr>
            <td data-label="Date"><b>December to date</b></td>
            {fcell('Receipts', num(totals.receipts))}
            {fcell('Gross', rm(totals.gross))}
            {fcell('State 70%', rm(totals.state))}
            {fcell('Operator 30%', rm(totals.operator))}
            {fcell('Credited', rm(totals.credited))}
            <td data-label="Reconciliation" /><td data-label="Breaks" className="r"><b>{breakLog.length}</b></td>
          </tr></tfoot>
        } />
      </Card>
      {d && (
        <Drawer title={`Settlement, ${d.date}`} sub={d.id} onClose={() => setDay(null)} footer={<><button className="btn outline" onClick={() => download(`Settlement file ${d.date}`, 'CSV')}><Download /> Settlement file</button><button className="btn primary" onClick={() => setDay(null)}>Close</button></>}>
          <div className="row"><Status tone={d.status === 'Pending' ? 'warn' : 'ok'}>{d.status === 'Resolved' ? 'Reconciled' : d.status}</Status>{db.open > 0 && <Pill tone="bad">{db.open} open</Pill>}{db.resolved > 0 && <Pill tone="warn">{db.resolved} resolved</Pill>}</div>
          <dl className="kv">
            <div><dt>SCANS receipts</dt><dd className="num">{num(d.receipts)}</dd></div>
            <div><dt>Gross collected</dt><dd className="num">{rm(d.gross)}</dd></div>
            <div><dt>Credited by acquirer</dt><dd className="num">{d.credited ? rm(d.credited) : 'At 23:00 tonight'}</dd></div>
            <div><dt>Difference</dt><dd className="num">{d.credited ? rm(d.credited - d.gross) : '—'}</dd></div>
            <div><dt>State share (70%)</dt><dd className="num">{rm(d.state)}</dd></div>
            <div><dt>Operator share (30%)</dt><dd className="num">{rm(d.operator)}</dd></div>
          </dl>
          <div className="gv-sub">Matching</div>
          <MeterRows items={[
            { label: 'Matched to a receipt', share: d.credited ? 1 : 0, text: d.credited ? num(d.receipts) : 'Not yet', color: 'var(--okFill)' },
            { label: 'Breaks', share: db.all / Math.max(1, d.receipts), text: db.all ? [db.open && `${db.open} open`, db.resolved && `${db.resolved} resolved`].filter(Boolean).join(', ') : 'None', color: 'var(--warnFill)' },
          ]} />
          {db.open > 0 && <Callout tone="warn">{db.open} {db.open === 1 ? 'break is' : 'breaks are'} still open on this day. Microtek tracks each one until it is resolved.</Callout>}
          {db.open === 0 && db.resolved > 0 && <Callout tone="warn">Breaks on this day were matched after the acquirer resent payment callbacks. No money was missing.</Callout>}
        </Drawer>
      )}
    </>
  )
}

/* =====================================================================
   Official notices
   ===================================================================== */
function Notices() {
  const toast = useToast()
  const notices = useStore((s) => s.notices)
  const [tab, setTab] = useState('waiting')
  const [compose, setCompose] = useState(false)
  const [view, setView] = useState(null)
  const [ret, setRet] = useState(null)
  const [comment, setComment] = useState('')
  const waiting = notices.filter((n) => n.status === 'Waiting for State approval')
  const sent = notices.filter((n) => n.status === 'Sent' || n.status === 'Scheduled')
  const returned = notices.filter((n) => n.status === 'Returned')
  const list = { waiting, sent, returned }[tab]
  const v = notices.find((n) => n.id === view)
  const sentOnly = notices.filter((n) => n.status === 'Sent')
  const reach = sentOnly.reduce((s, n) => s + n.reached * n.recipients, 0) / Math.max(1, sentOnly.reduce((s, n) => s + n.recipients, 0))

  const approve = (n) => {
    const later = n.date && n.date !== '—' && n.date !== '17 Dec 2027' && /202[78]/.test(n.date) && new Date(n.date) > new Date('2027-12-17')
    updateNotice(n.id, { status: later ? 'Scheduled' : 'Sent', date: later ? n.date : '17 Dec 2027', reached: later ? 0 : 0.04 })
    logEvent('Approved and sent notice', `${n.id} · ${n.title}`)
    toast(later ? `Approved. It goes out on ${n.date} in six languages.` : 'Approved and sent in six languages.')
    setView(null)
  }
  const doReturn = () => {
    updateNotice(ret.id, { status: 'Returned', comment: comment.trim() })
    logEvent('Returned notice with comment', `${ret.id} · ${ret.title}`)
    toast(`Returned to ${fromName(ret)} with your comment`)
    setRet(null); setComment(''); setView(null)
  }
  const submit = (n) => {
    const id = addNotice(n)
    logEvent(n.status === 'Sent' ? 'Sent notice' : 'Scheduled notice', `${id} · ${n.title}`)
    toast(n.status === 'Sent' ? `Notice sent to ${num(n.recipients)} ${n.audience.startsWith('Employers') ? 'employers' : 'workers'} in six languages` : `Notice scheduled for ${n.date}`)
    setCompose(false); setTab('sent')
  }

  return (
    <>
      <PageHead title="Official notices" sub="Notices go to workers in the language they chose. Notices written by Microtek or JIM Sabah wait here until the State approves them.">
        <button className="btn primary" onClick={() => setCompose(true)}><Plus /> Write a notice</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={Inbox} tone="warn" label="Waiting for you" value={num(waiting.length)} note="From Microtek and JIM Sabah" />
        <Kpi icon={Send} tone="ok" label="Sent" value={num(sentOnly.length)} note="Since November 2027" />
        <Kpi icon={Users} label="Reached" value={pct(reach)} note="Of people each notice was sent to" />
        <Kpi icon={Languages} tone="purple" label="Languages" value="6" note="BM, English, Indonesian, Filipino, Bengali, Nepali" />
      </div>
      <Card>
        <Tabs items={[{ value: 'waiting', label: 'Waiting for approval', count: waiting.length }, { value: 'sent', label: 'Sent and scheduled', count: sent.length }, { value: 'returned', label: 'Returned', count: returned.length }]} value={tab} onChange={setTab} label="Notices" />
        <div style={{ paddingTop: 4 }}>
          {list.length === 0 && <Empty title={tab === 'waiting' ? 'Nothing waiting for approval' : 'Nothing here'} icon={CheckCircle2}>{tab === 'waiting' ? 'Notices Microtek or JIM Sabah write will appear here for you to approve.' : 'Notices appear here after they are sent or returned.'}</Empty>}
          {list.map((n) => (
            <div className="gv-ap" key={n.id}>
              <span className="ic"><Megaphone aria-hidden="true" /></span>
              <div className="txt">
                <small>{n.id} · from {fromName(n)} · {n.date}</small>
                <b>{n.title}</b>
                <div className="row wrap" style={{ gap: 8, marginTop: 4 }}><AudiencePill a={n.audience} /><ChannelIcons list={n.channels} /><span className="small muted num">{num(n.recipients)} recipients</span></div>
                {n.comment && <small style={{ color: 'var(--bad)', marginTop: 4 }}>Your comment: {n.comment}</small>}
              </div>
              <div className="acts">
                <button className="btn sm ghost" onClick={() => setView(n.id)}><Eye /> View</button>
                {tab === 'waiting' ? (
                  <>
                    <button className="btn sm outline" onClick={() => setRet(n)}><X /> Return with comment</button>
                    <button className="btn sm success" onClick={() => approve(n)}><Check /> Approve and send</button>
                  </>
                ) : <Status tone={n.status === 'Returned' ? 'bad' : undefined}>{n.status}</Status>}
              </div>
            </div>
          ))}
        </div>
      </Card>
      {compose && <NoticeComposer mode="state" onClose={() => setCompose(false)} onSubmit={submit} />}
      {v && <NoticeView n={v} onClose={() => setView(null)} footer={v.status === 'Waiting for State approval'
        ? <><button className="btn outline" onClick={() => setRet(v)}><X /> Return with comment</button><button className="btn success" onClick={() => approve(v)}><Check /> Approve and send</button></>
        : null} />}
      {ret && (
        <Modal title={`Return to ${fromName(ret)}`} onClose={() => setRet(null)} actions={<><button className="btn outline" onClick={() => setRet(null)}>Cancel</button><button className="btn primary" disabled={comment.trim().length < 5} onClick={doReturn}>Return with comment</button></>}>
          <div className="stack" style={{ gap: 12 }}>
            <p className="ink2">“{ret.title}” goes back to {fromName(ret)} with your comment. It is not sent to anyone.</p>
            <Field label="Comment" hint={`${fromName(ret)} sees this.`}><textarea className="input" autoFocus value={comment} onChange={(e) => setComment(e.target.value)} placeholder="For example: please add the help desk phone number" /></Field>
          </div>
        </Modal>
      )}
    </>
  )
}

/* =====================================================================
   Complaints
   ===================================================================== */
function Complaints() {
  const toast = useToast()
  const [rows, setRows] = useState(complaintsAll)
  const [open, setOpen] = useState(null)
  const [agency, setAgency] = useState('All')
  const [status, setStatus] = useState('All')
  const [route, setRoute] = useState('JTK Sabah')
  const c = rows.find((x) => x.id === open)
  const list = rows.filter((x) => (agency === 'All' || x.agency === agency) && (status === 'All' || x.status === status))
  const byAgency = useMemo(() => {
    const m = {}
    rows.forEach((x) => { m[x.agency] = (m[x.agency] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }))
  }, [rows])
  const resolvedDays = rows.filter((x) => x.days).map((x) => x.days).sort((a, b) => a - b)
  const median = resolvedDays.length ? resolvedDays[Math.floor(resolvedDays.length / 2)] : 0
  const doRoute = () => {
    setRows(rows.map((x) => (x.id === c.id ? { ...x, agency: route, status: 'With agency' } : x)))
    logEvent('Routed complaint to agency', `${c.id} · ${route}`)
    toast(`${c.id} routed to ${route}. The worker is told in ${c.lang}.`)
    setOpen(null)
  }
  const openRow = (x) => { setOpen(x.id); setRoute(x.agency === 'SCANS support' ? 'JTK Sabah' : x.agency); logEvent('Viewed complaint', x.id) }
  return (
    <>
      <PageHead title="Complaints" sub="Complaints from workers in any of the six languages, routed to the agency that can act. Workers can ask for their name to be kept from their employer." />
      <div className="grid g-4 keep2">
        <Kpi icon={Inbox} tone="warn" label="New" value={num(rows.filter((x) => x.status === 'New').length)} note="Not yet routed" />
        <Kpi icon={RouteIcon} label="With an agency" value={num(rows.filter((x) => x.status === 'With agency').length)} />
        <Kpi icon={CheckCircle2} tone="ok" label="Resolved" value={num(rows.filter((x) => x.status === 'Resolved').length)} note="Since November 2027" />
        <Kpi icon={Clock} tone="purple" label="Median time to resolve" value={`${median} days`} />
      </div>
      <div className="grid g-main" style={{ alignItems: 'start' }}>
        <Card title="Complaints" sub={`${list.length} of ${rows.length}`}>
          <div className="toolbar" style={{ marginBottom: 14 }}>
            <Select label="Agency" value={agency} onChange={setAgency} options={[{ value: 'All', label: 'All agencies' }, ...AGENCIES]} />
            <Select label="Status" value={status} onChange={setStatus} options={[{ value: 'All', label: 'All statuses' }, 'New', 'With agency', 'Resolved']} />
          </div>
          <Table rows={list} onRowClick={openRow} columns={[
            { key: 'id', label: 'Reference', render: (x) => <span><b className="mono-id">{x.id}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{x.opened}</small></span> },
            { key: 'topic', label: 'Topic' },
            { key: 'district', label: 'District' },
            { key: 'lang', label: 'Language' },
            { key: 'agency', label: 'Agency' },
            { key: 'status', label: 'Status', render: (x) => <Status>{x.status}</Status> },
          ]} />
        </Card>
        <Card title="By agency" sub="All complaints since November 2027">
          <HBarChart data={byAgency} />
          <p className="small muted" style={{ marginTop: 16 }}>Complaints are never shared with employers. SCANS support handles app and payment problems; work and housing go to JTK Sabah.</p>
        </Card>
      </div>
      {c && (
        <Drawer title={c.topic} sub={`${c.id} · opened ${c.opened}`} onClose={() => setOpen(null)}
          footer={c.status === 'Resolved' ? <button className="btn primary" onClick={() => setOpen(null)}>Close</button> : <><button className="btn outline" onClick={() => setOpen(null)}>Cancel</button><button className="btn primary" onClick={doRoute}><RouteIcon /> Route to agency</button></>}>
          <div className="row wrap"><Status>{c.status}</Status>{c.anonymous && <Pill tone="purple">Name kept from employer</Pill>}</div>
          <dl className="kv">
            <div><dt>District</dt><dd>{c.district}</dd></div>
            <div><dt>Written in</dt><dd>{c.lang}</dd></div>
            <div><dt>Now with</dt><dd>{c.agency}</dd></div>
            <div><dt>Worker</dt><dd>{c.anonymous ? 'Hidden from employer' : 'Shared with agency only'}</dd></div>
          </dl>
          <div>
            <div className="gv-sub">What the worker wrote</div>
            {c.original && <div className="gv-lang" style={{ marginBottom: 8 }}><b className="small muted">{c.lang}</b><p>{c.original}</p></div>}
            <div className="gv-lang"><b className="small muted">English translation</b><p>{c.english}</p></div>
          </div>
          <ol className="gv-timeline">
            {c.status === 'Resolved' && <li><span className="dot ok" /><b>Resolved by {c.agency}</b><span>Worker told in {c.lang}</span></li>}
            {c.status !== 'New' && <li><span className="dot info" /><b>Routed to {c.agency}</b><span>{c.opened}</span></li>}
            <li><span className="dot" /><b>Complaint received in the app</b><span>{c.opened}</span></li>
          </ol>
          {c.status !== 'Resolved' && (
            <Field label="Route to" hint="The agency gets the complaint and the translation. The worker is told who has it.">
              <select className="select" value={route} onChange={(e) => setRoute(e.target.value)}>{AGENCIES.map((a) => <option key={a}>{a}</option>)}</select>
            </Field>
          )}
          <Callout icon={ShieldCheck}>Opening this complaint is written to the audit log.</Callout>
        </Drawer>
      )}
    </>
  )
}
