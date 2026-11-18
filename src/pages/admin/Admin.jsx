// Microtek operator / superadmin console (/admin/*).
// Microtek runs SCANS for the State. It cannot approve State notices, has no permit
// functions, and every view, export and change it makes is written to the audit log.
import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, Store, ClipboardCheck, Megaphone, FileBarChart, UserCog, ScrollText, Server,
  Wallet, CalendarDays, CalendarRange, CreditCard, UserCheck, Inbox, Activity, ChevronRight, AlertTriangle, Plug,
  Scale, Check, X, Eye, Plus, Download, LayoutGrid, List, FileCheck2, CircleCheck, CircleAlert, PencilLine, ShieldCheck,
  RefreshCw, MailPlus, Lock, Send, MessageSquareWarning, Gauge, Receipt, MapPin,
} from 'lucide-react'
import {
  AppShell, PageHead, Card, Kpi, Status, Pill, Callout, Empty, Seg, Tabs, SearchInput, Select, Field, Switch, Table, Drawer, Modal,
  BarChart, Donut, MeterRows, Sparkline, SabahMap, DistrictDetail, Mono, Avatar, useToast, useLiveFeed,
} from '../../components/ui.jsx'
import {
  REGISTERED, monthly, collectionToday, collectionMonth, paidThisMonth, paymentMetrics, recentTxns, makeTxn, districts,
  merchants, adminUsers, adminRoles, employerTotals, rm, num, pct,
} from '../../data/demo.js'
import {
  hourlyToday, last7, last30, week, month30, paymentSuccess, uptime30, channelData, systems, reconciliationBreaks,
  merchantDetail, applicationDocs,
} from '../shared/data.js'
import { useStore, logEvent, setActor, updateNotice, addNotice, updateApproval, updateOffer, updateApplication } from '../shared/store.js'
import { WorkerList, WorkerProfile } from '../shared/Workers.jsx'
import { EmployerList, EmployerProfile } from '../shared/Employers.jsx'
import { ReportsCentre } from '../shared/Reports.jsx'
import { NoticeComposer, NoticeView, ChannelIcons, AudiencePill } from '../shared/Notices.jsx'
import '../shared/shared.css'

const BASE = '/admin'
const ACTOR = 'Faizal Rahman (Microtek)'
const short = (v) => (v >= 1e6 ? 'RM ' + (v / 1e6).toFixed(2) + 'm' : v >= 1e3 ? 'RM ' + (v / 1e3).toFixed(1) + 'k' : 'RM ' + v)
const shortAxis = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'm' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : String(v))

/* Items waiting on Microtek, from the shared store. */
function useQueue() {
  const approvals = useStore((s) => s.approvals)
  const offerSubs = useStore((s) => s.offerSubs)
  const apps = useStore((s) => s.merchantApps)
  const notices = useStore((s) => s.notices)
  return useMemo(() => {
    const items = [
      ...approvals.map((a) => ({ ...a, source: 'approval' })),
      ...offerSubs.filter((o) => o.status === 'Pending').map((o) => ({ id: o.id, type: 'Merchant offer', name: o.merchant, detail: `${o.title} · go-live ${o.goLive}`, age: 'Sent ' + o.submitted, status: 'Waiting', source: 'offer' })),
      ...apps.filter((a) => a.status === 'In review' || a.status === 'Needs info').map((a) => ({ id: a.id, type: 'Merchant sign-up', name: a.merchant, detail: `${a.category} · ${a.outlets} outlet${a.outlets > 1 ? 's' : ''} · ${a.status === 'Needs info' ? 'waiting for documents' : 'documents received'}`, age: 'Sent ' + a.submitted, status: 'Waiting', source: 'application' })),
      ...notices.filter((n) => n.status === 'Waiting for State approval').map((n) => ({ id: n.id, type: 'Announcement', name: n.title, detail: `${n.audience} · ${num(n.recipients)} recipients`, age: 'Sent to State', status: 'Waiting for State approval', source: 'notice' })),
    ]
    return { items, waiting: items.filter((i) => i.status === 'Waiting'), stateWaiting: items.filter((i) => i.source === 'notice').length }
  }, [approvals, offerSubs, apps, notices])
}

const TITLES = [
  [/^\/admin\/?$/, 'Command centre'], [/^\/admin\/workers\/.+/, 'Worker profile'], [/^\/admin\/workers/, 'Workers'],
  [/^\/admin\/employers\/.+/, 'Employer profile'], [/^\/admin\/employers/, 'Employers'], [/^\/admin\/merchants\/.+/, 'Merchant'],
  [/^\/admin\/merchants/, 'Merchants'], [/^\/admin\/approvals/, 'Approvals'], [/^\/admin\/announcements/, 'Global announcements'],
  [/^\/admin\/reports/, 'Reports centre'], [/^\/admin\/users/, 'Admin management'], [/^\/admin\/audit/, 'Audit log'], [/^\/admin\/system/, 'Connected systems'],
]

export default function AdminApp() {
  setActor(ACTOR)
  const loc = useLocation()
  const q = useQueue()
  const offerSubs = useStore((s) => s.offerSubs)
  const apps = useStore((s) => s.merchantApps)
  const merchantCount = offerSubs.filter((o) => o.status === 'Pending').length + apps.filter((a) => a.status === 'In review' || a.status === 'Needs info').length
  const title = (TITLES.find(([re]) => re.test(loc.pathname)) || [, 'Operations'])[1]
  const nav = [
    { group: 'Monitor', items: [
      { to: BASE, label: 'Command centre', icon: LayoutDashboard, end: true },
      { to: BASE + '/approvals', label: 'Approvals', icon: ClipboardCheck, count: q.waiting.length || null },
    ] },
    { group: 'Records', items: [
      { to: BASE + '/workers', label: 'Workers', icon: Users },
      { to: BASE + '/employers', label: 'Employers', icon: Building2 },
      { to: BASE + '/merchants', label: 'Merchants', icon: Store, count: merchantCount || null },
    ] },
    { group: 'Communicate', items: [
      { to: BASE + '/announcements', label: 'Global announcements', icon: Megaphone },
    ] },
    { group: 'Back office', items: [
      { to: BASE + '/reports', label: 'Reports centre', icon: FileBarChart },
      { to: BASE + '/users', label: 'Admin management', icon: UserCog },
      { to: BASE + '/audit', label: 'Audit log', icon: ScrollText },
      { to: BASE + '/system', label: 'Connected systems', icon: Server },
    ] },
  ]
  const notifications = [
    { title: `${q.waiting.length} items waiting for review`, time: 'Approvals queue' },
    { title: 'WhatsApp delivery slower than usual', time: 'Connected systems · 14 min ago' },
    { title: `${q.stateWaiting} announcement${q.stateWaiting === 1 ? '' : 's'} waiting for State approval`, time: 'Global announcements' },
  ]
  return (
    <AppShell nav={nav} portal={{ name: 'Microtek operations', sub: 'SCANS operator console', mark: 'MT' }} user={{ name: 'Faizal Rahman', role: 'Superadmin' }}
      title={title} kicker="Platform operator" notifications={notifications} searchPlaceholder="Search SCANS ID, name or passport">
      <Routes>
        <Route index element={<CommandCentre />} />
        <Route path="workers" element={<WorkerList base={BASE} />} />
        <Route path="workers/:id" element={<WorkerProfile base={BASE} />} />
        <Route path="employers" element={<EmployerList base={BASE} />} />
        <Route path="employers/:id" element={<EmployerProfile base={BASE} />} />
        <Route path="merchants" element={<Merchants />} />
        <Route path="merchants/:id" element={<MerchantDetail />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="reports" element={<ReportsCentre scope="admin" />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="system" element={<Systems />} />
        <Route path="*" element={<Card><Empty title="This page does not exist">Use the menu to find what you need.</Empty></Card>} />
      </Routes>
    </AppShell>
  )
}

/* =====================================================================
   Command centre
   ===================================================================== */
const PERIODS = [
  { value: 'today', label: 'Today' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: 'month', label: 'Month' },
]
const SEED = recentTxns.filter((t, i, a) => a.findIndex((x) => x.scansId === t.scansId) === i).slice(0, 7)
const liveTxn = (n) => ({ ...makeTxn(n), born: Date.now() })
const ago = (t) => { const s = Math.max(1, Math.round((Date.now() - t.born) / 1000)); return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago` }

function CommandCentre() {
  const go = useNavigate()
  const [period, setPeriod] = useState('today')
  const [mapFilter, setMapFilter] = useState('all')
  const [sel, setSel] = useState('lahaddatu')
  const feed = useLiveFeed(SEED, liveTxn, 4000, 7)
  const q = useQueue()
  const openBreaks = reconciliationBreaks.filter((b) => b.status === 'Open').length
  const per = {
    today: { label: 'Today, by hour to 15:00', data: hourlyToday, total: collectionToday, sub: 'today' },
    '7d': { label: 'Last 7 days', data: last7, total: week, sub: '7 days' },
    '30d': { label: 'Last 30 days, 18 May to 17 June', data: last30, total: month30, sub: '30 days' },
    month: { label: 'Each month in 2027', data: monthly.map((m) => ({ label: m.m, value: m.v })), total: collectionMonth, sub: 'June' },
  }[period]
  const byType = q.waiting.reduce((m, i) => ({ ...m, [i.type]: (m[i.type] || 0) + 1 }), {})

  return (
    <>
      <PageHead title="Command centre" sub="Thursday 17 June 2027. June contributions were due on 5 June.">
        <Seg items={PERIODS} value={period} onChange={setPeriod} label="Period" />
      </PageHead>
      <div className="grid g-4 keep2 gv-kpis">
        <Kpi hero icon={Wallet} label="Collected this month" value={rm(collectionMonth)} note={`${num(paidThisMonth)} workers paid for June`}>
          <div className="gv-hero-split" style={{ marginTop: 14 }}><span>State 70% <b>{rm(collectionMonth * 0.7)}</b></span><span>Operator 30% <b>{rm(collectionMonth * 0.3)}</b></span></div>
          <div className="gv-hero-spark"><Sparkline values={monthly.map((m) => m.v)} /></div>
          <div className="gv-hero-split"><span>January to June 2027</span></div>
        </Kpi>
        <Kpi icon={CalendarDays} label="Today" value={rm(collectionToday)} note={`${num(collectionToday / 100)} payments to 15:00`} />
        <Kpi icon={CalendarRange} label="Last 7 days" value={rm(week)} note="11 to 17 June" />
        <Kpi icon={CreditCard} tone="ok" label="Payment success" value={pct(paymentSuccess, 1)} note="Approved of all attempts today" />
        <Kpi icon={UserCheck} tone="purple" label="Workers paying" value={pct(paidThisMonth / REGISTERED, 1)} note={`${num(paidThisMonth)} of ${num(REGISTERED)}`} />
        <Link to={BASE + '/approvals'} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Kpi icon={Inbox} tone="warn" label="Items waiting" value={num(q.waiting.length)} note={<>Approvals queue <ChevronRight size={13} /></>} />
        </Link>
        <Kpi icon={Gauge} tone="ok" label="Uptime, 30 days" value={pct(uptime30, 2)} note="Target 99.5%" />
      </div>

      <div className="card strip gv-strip" style={{ padding: '12px 16px' }}>
        {systems.map((s) => (
          <span key={s.name} className={'pill dot ' + (s.state === 'Degraded' ? 'warn' : s.state === 'Read only' ? 'info' : 'ok')}>
            {s.name} · {s.latency >= 1000 ? (s.latency / 1000).toFixed(1) + ' s' : s.latency + ' ms'}
          </span>
        ))}
        <Link to={BASE + '/system'} className="gv-strip-note" style={{ textDecoration: 'none' }}>Links checked every minute</Link>
      </div>

      <div className="grid g-main">
        <Card title="Collection" sub={per.label} action={<span className="pill info num">{rm(per.total)}</span>}>
          <BarChart data={per.data} height={250} format={shortAxis} highlight={period === 'month' ? per.data.length - 1 : undefined} colors={['#1460E0']} />
        </Card>
        <Card title="How workers paid" sub={`Payment channel, ${per.sub}`}>
          <Donut data={channelData} center={short(per.total)} centerSub={per.sub} size={170} />
        </Card>
      </div>

      <div className="grid g-main">
        <Card title={<span className="row" style={{ gap: 8 }}><span className="gv-legend-dot" style={{ background: 'var(--okFill)', boxShadow: '0 0 0 4px var(--okBg)' }} />Live transactions</span>}
          sub={`${num(collectionToday / 100)} payments today · updates every few seconds`} action={<Link className="link" to={BASE + '/workers'}>Worker records <ChevronRight size={14} /></Link>}>
          <div className="feed fresh" aria-live="polite">
            {feed.map((t) => (
              <div key={t.id} className="it gv-feed-it" role="link" tabIndex={0} onClick={() => go(`${BASE}/workers/${t.scansId}`)} onKeyDown={(e) => e.key === 'Enter' && go(`${BASE}/workers/${t.scansId}`)}>
                <span className={'ic ' + (t.cleared ? 'ok' : '')}><Receipt aria-hidden="true" /></span>
                <div style={{ minWidth: 0 }}>
                  <b>{t.scansId} · {t.worker}</b>
                  <div className="gv-tags"><span className="pill grey">{t.nationality}</span>{t.cleared && <span className="pill ok">Arrears cleared</span>}<span className="small muted">{t.district} · {t.period}</span></div>
                </div>
                <div className="amt"><b className="num">{rm(t.amount)}</b><span style={{ display: 'block' }}>{t.method.replace(' eWallet', '')} · {t.born ? ago(t) : t.at}</span></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Needs attention" sub="Things waiting on Microtek">
          <div className="gv-attn">
            {Object.entries(byType).map(([type, n]) => (
              <Link key={type} to={BASE + '/approvals?type=' + encodeURIComponent(type)}>
                <span className="ic warn"><ClipboardCheck aria-hidden="true" /></span>
                <div><b>{n} {type.toLowerCase()}{n > 1 ? 's' : ''}</b><small>Waiting for review</small></div>
                <ChevronRight className="chev" size={16} />
              </Link>
            ))}
            {q.stateWaiting > 0 && (
              <Link to={BASE + '/announcements'}>
                <span className="ic"><Megaphone aria-hidden="true" /></span>
                <div><b>{q.stateWaiting} announcement{q.stateWaiting > 1 ? 's' : ''} with the State</b><small>Waiting for State approval, nothing to do here</small></div>
                <ChevronRight className="chev" size={16} />
              </Link>
            )}
            <Link to={BASE + '/system'}>
              <span className="ic bad"><Scale aria-hidden="true" /></span>
              <div><b>{openBreaks} reconciliation breaks open</b><small>RM {openBreaks * 100} to match against acquirer credits</small></div>
              <ChevronRight className="chev" size={16} />
            </Link>
            <Link to={BASE + '/system'}>
              <span className="ic warn"><Plug aria-hidden="true" /></span>
              <div><b>WhatsApp delivery slower than usual</b><small>SMS and WhatsApp · degraded for 14 min</small></div>
              <ChevronRight className="chev" size={16} />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid g-side">
        <Card title="Worker payment metrics" sub={`June 2027, all ${num(REGISTERED)} registered workers`}>
          <MeterRows big items={paymentMetrics.map((m) => ({ label: m.label, share: m.value / REGISTERED, text: num(m.value) + ' workers', color: m.color }))} />
          <p className="small muted" style={{ marginTop: 16 }}>Overdue workers get reminders in their language. Arrears never lead to permit action, passport holding or travel restriction.</p>
        </Card>
        <Card title="Workforce map" sub="Registered workers by district, coloured by share not yet paid for June"
          action={<div className="chips">{[['all', 'All'], ['high', 'High arrears'], ['low', 'Low arrears']].map(([v, l]) => <button key={v} className="chip" aria-pressed={mapFilter === v} onClick={() => setMapFilter(v)}>{l}</button>)}</div>}>
          <SabahMap districts={districts} selected={sel} onSelect={setSel} filter={mapFilter} renderPanel={(d) => (
            <div className="stack" style={{ gap: 14 }}>
              <DistrictDetail d={d} />
              <button className="btn sm outline" onClick={() => go(`${BASE}/workers?district=${encodeURIComponent(d.name)}`)}><Users /> Open worker records</button>
            </div>
          )} />
        </Card>
      </div>
    </>
  )
}

/* =====================================================================
   Approvals
   ===================================================================== */
const TYPE_ICON = { 'Employer sign-up': Building2, 'Merchant offer': Store, 'Record mismatch': Users, 'Merchant sign-up': Store, Announcement: Megaphone }
const TYPES = ['Employer sign-up', 'Merchant offer', 'Record mismatch', 'Merchant sign-up', 'Announcement']

function Approvals() {
  const toast = useToast()
  const go = useNavigate()
  const [params] = useSearchParams()
  const q = useQueue()
  const [tab, setTab] = useState(params.get('type') || 'All')
  const [back, setBack] = useState(null)
  const [reason, setReason] = useState('')
  const list = q.items.filter((i) => tab === 'All' || i.type === tab)
  const waiting = list.filter((i) => i.status !== 'Approved' && i.status !== 'Sent back')
  const decided = list.filter((i) => i.status === 'Approved' || i.status === 'Sent back')

  const approve = (i) => {
    if (i.source === 'approval') updateApproval(i.id, { status: 'Approved' })
    if (i.source === 'offer') updateOffer(i.id, { status: 'Approved' })
    logEvent('Approved ' + i.type.toLowerCase(), `${i.id} · ${i.name}`)
    toast(`${i.type} approved: ${i.name}`)
  }
  const sendBack = () => {
    const i = back
    if (i.source === 'approval') updateApproval(i.id, { status: 'Sent back', reason })
    if (i.source === 'offer') updateOffer(i.id, { status: 'Rejected', reason })
    logEvent('Sent back ' + i.type.toLowerCase(), `${i.id} · ${i.name}`)
    toast(`${i.type} sent back with your reason: ${i.name}`)
    setBack(null); setReason('')
  }
  const counts = Object.fromEntries(TYPES.map((t) => [t, q.items.filter((i) => i.type === t && i.status !== 'Approved' && i.status !== 'Sent back').length]))

  const row = (i) => {
    const Icon = TYPE_ICON[i.type] || ClipboardCheck
    return (
      <div className="gv-ap" key={i.id}>
        <span className="ic"><Icon aria-hidden="true" /></span>
        <div className="txt">
          <small>{i.type} · {i.id} · {i.age}</small>
          <b>{i.name}</b>
          <small>{i.detail}</small>
        </div>
        <div className="acts">
          {i.source === 'notice' && (
            <>
              <Status>Waiting for State approval</Status>
              <button className="btn sm" disabled title="Only the State can approve notices to workers"><Check /> Approve</button>
              <span className="why">Only Kerajaan Negeri Sabah can approve notices to workers. Microtek cannot approve them.</span>
            </>
          )}
          {i.source === 'application' && <button className="btn sm primary" onClick={() => go(`${BASE}/merchants?tab=apps&open=${i.id}`)}><FileCheck2 /> Check documents</button>}
          {(i.source === 'approval' || i.source === 'offer') && (i.status === 'Approved' || i.status === 'Sent back'
            ? <Status tone={i.status === 'Sent back' ? 'bad' : undefined}>{i.status}</Status>
            : (
              <>
                {i.source === 'approval' && i.type === 'Record mismatch' && i.workerId && <button className="btn sm ghost" onClick={() => go(`${BASE}/workers/${i.workerId}`)}><Eye /> Record</button>}
                <button className="btn sm outline" onClick={() => setBack(i)}><X /> Send back</button>
                <button className="btn sm success" onClick={() => approve(i)}><Check /> Approve</button>
              </>
            ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHead title="Approvals" sub="Sign-ups, merchant offers and record corrections waiting for Microtek. Every decision is written to the audit log." />
      <Callout icon={ShieldCheck}>Notices to workers are approved by the State, not here. Record corrections never change a worker’s permit or immigration status.</Callout>
      <Card>
        <Tabs items={[{ value: 'All', label: 'All', count: q.waiting.length + q.stateWaiting }, ...TYPES.map((t) => ({ value: t, label: t, count: counts[t] }))]} value={tab} onChange={setTab} label="Type" />
        <div style={{ paddingTop: 4 }}>
          {waiting.length === 0 && <Empty title="Nothing waiting" icon={CircleCheck}>New sign-ups, offers and record corrections appear here.</Empty>}
          {waiting.map(row)}
        </div>
        {decided.length > 0 && (
          <>
            <div className="gv-sub" style={{ marginTop: 16 }}>Decided this session</div>
            {decided.map(row)}
          </>
        )}
      </Card>
      {back && (
        <Modal title={`Send back: ${back.name}`} onClose={() => setBack(null)} actions={<><button className="btn outline" onClick={() => setBack(null)}>Cancel</button><button className="btn primary" disabled={reason.trim().length < 5} onClick={sendBack}>Send back</button></>}>
          <Field label="Reason" hint="The applicant sees this. Say what to fix.">
            <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: the SSM certificate is older than 3 months" />
          </Field>
        </Modal>
      )}
    </>
  )
}

/* =====================================================================
   Merchants
   ===================================================================== */
function Merchants() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'dir'
  const offerSubs = useStore((s) => s.offerSubs)
  const apps = useStore((s) => s.merchantApps)
  const setTab = (t) => setParams(t === 'dir' ? {} : { tab: t })
  const toast = useToast()
  return (
    <>
      <PageHead title="Merchants" sub="Partner shops that give perks to workers who are up to date. Merchants never see worker records.">
        <button className="btn outline" onClick={() => { logEvent('Exported merchant list', `${merchants.length} merchants`); toast('Merchant list exported. The export is in the audit log.') }}><Download /> Export</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={Store} label="Active merchants" value={num(merchants.filter((m) => m.status === 'Active').length)} note={`${num(merchants.reduce((s, m) => s + (m.status === 'Active' ? m.outlets : 0), 0))} outlets`} />
        <Kpi icon={Receipt} tone="ok" label="Confirmed redemptions" value={num(merchants.reduce((s, m) => s + m.redemptions, 0))} note="Counted only after the shop confirms" />
        <Kpi icon={FileCheck2} tone="warn" label="Sign-ups to check" value={num(apps.filter((a) => a.status === 'In review' || a.status === 'Needs info').length)} />
        <Kpi icon={ClipboardCheck} tone="purple" label="Offers to review" value={num(offerSubs.filter((o) => o.status === 'Pending').length)} />
      </div>
      <Card>
        <Tabs items={[
          { value: 'dir', label: 'Directory', count: merchants.length },
          { value: 'apps', label: 'Onboarding applications', count: apps.filter((a) => a.status === 'In review' || a.status === 'Needs info').length },
          { value: 'offers', label: 'Offer submissions', count: offerSubs.filter((o) => o.status === 'Pending').length },
        ]} value={tab} onChange={setTab} label="Merchants" />
        <div style={{ paddingTop: 16 }}>
          {tab === 'dir' && <Directory />}
          {tab === 'apps' && <Applications openId={params.get('open')} />}
          {tab === 'offers' && <OfferSubs openId={params.get('open')} />}
        </div>
      </Card>
    </>
  )
}

function Directory() {
  const go = useNavigate()
  const [view, setView] = useState('grid')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const cats = [...new Set(merchants.map((m) => m.category))]
  const rows = merchants.filter((m) => (cat === 'All' || m.category === cat) && (!q || m.name.toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search merchants" />
        <Select label="Category" value={cat} onChange={setCat} options={[{ value: 'All', label: 'All categories' }, ...cats]} />
        <Seg items={[{ value: 'grid', label: <LayoutGrid size={16} aria-label="Grid" /> }, { value: 'list', label: <List size={16} aria-label="List" /> }]} value={view} onChange={setView} label="View" />
      </div>
      {rows.length === 0 && <Empty title="No merchants found">Try another name or category.</Empty>}
      {view === 'grid' && rows.length > 0 && (
        <div className="gv-mgrid">
          {rows.map((m) => (
            <Link key={m.id} to={`${BASE}/merchants/${m.id}`} className="gv-mcard">
              <div className="row between" style={{ alignItems: 'flex-start' }}><Mono name={m.name} color={m.color} size="lg" /><Status>{m.status}</Status></div>
              <div><h3>{m.name}</h3><span className="small muted">{m.category} · joined {m.joined}</span></div>
              <dl className="meta">
                <div><dt>Outlets</dt><dd className="num">{num(m.outlets)}</dd></div>
                <div><dt>Offers</dt><dd className="num">{m.offers}</dd></div>
                <div><dt>Uses</dt><dd className="num">{num(m.redemptions)}</dd></div>
              </dl>
            </Link>
          ))}
        </div>
      )}
      {view === 'list' && rows.length > 0 && (
        <Table rows={rows} onRowClick={(m) => go(`${BASE}/merchants/${m.id}`)} columns={[
          { key: 'name', label: 'Merchant', render: (m) => <div className="who"><Mono name={m.name} color={m.color} /><div><b>{m.name}</b><small>{m.company}</small></div></div> },
          { key: 'category', label: 'Category' },
          { key: 'outlets', label: 'Outlets', align: 'r', render: (m) => num(m.outlets) },
          { key: 'offers', label: 'Offers', align: 'r' },
          { key: 'redemptions', label: 'Confirmed uses', align: 'r', render: (m) => num(m.redemptions) },
          { key: 'status', label: 'Status', render: (m) => <Status>{m.status}</Status> },
        ]} />
      )}
    </div>
  )
}

function Applications({ openId }) {
  const toast = useToast()
  const apps = useStore((s) => s.merchantApps)
  const [open, setOpen] = useState(openId)
  const [mode, setMode] = useState(null) // 'info' | 'reject'
  const [text, setText] = useState('')
  const a = apps.find((x) => x.id === open)
  const docs = a ? applicationDocs[a.id] || [] : []
  const allDocs = docs.every(([, ok]) => ok)
  const m = a ? merchants.find((x) => x.name === a.merchant) : null
  const close = () => { setOpen(null); setMode(null); setText('') }
  const decide = (status, msg, action) => {
    updateApplication(a.id, { status, note: text || undefined })
    logEvent(action, `${a.id} · ${a.merchant}`)
    toast(msg)
    close()
  }
  const decided = a && (a.status === 'Approved' || a.status === 'Rejected')
  return (
    <>
      <Table rows={apps} onRowClick={(r) => setOpen(r.id)} columns={[
        { key: 'id', label: 'Application', render: (r) => <b className="mono-id">{r.id}</b> },
        { key: 'merchant', label: 'Merchant', render: (r) => <div className="who"><Mono name={r.merchant} color={(merchants.find((x) => x.name === r.merchant) || {}).color} /><b>{r.merchant}</b></div> },
        { key: 'category', label: 'Category' },
        { key: 'outlets', label: 'Outlets', align: 'r' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'docs', label: 'Documents', render: (r) => { const d = applicationDocs[r.id] || []; const n = d.filter(([, ok]) => ok).length; return <span className="num">{n} of {d.length}</span> } },
        { key: 'status', label: 'Status', render: (r) => <Status>{r.status}</Status> },
        { key: 'view', label: '', align: 'r', render: () => <span className="link small b" style={{ color: 'var(--blue)' }}>View</span> },
      ]} />
      {a && (
        <Drawer title={a.merchant} sub={`${a.id} · submitted ${a.submitted}`} onClose={close}
          footer={decided ? <button className="btn primary" onClick={close}>Close</button> : mode ? (
            <>
              <button className="btn outline" onClick={() => { setMode(null); setText('') }}>Back</button>
              {mode === 'info'
                ? <button className="btn primary" disabled={text.trim().length < 5} onClick={() => decide('Needs info', `Asked ${a.merchant} for more information`, 'Asked merchant for more information')}><Send /> Send request</button>
                : <button className="btn danger" disabled={text.trim().length < 5} onClick={() => decide('Rejected', `${a.merchant} application rejected. The reason was sent to them.`, 'Rejected merchant sign-up')}><X /> Reject application</button>}
            </>
          ) : (
            <>
              <button className="btn danger" onClick={() => setMode('reject')}><X /> Reject</button>
              <button className="btn outline" onClick={() => setMode('info')}><MessageSquareWarning /> Ask for more information</button>
              <button className="btn success" disabled={!allDocs} title={allDocs ? undefined : 'Every document must be received first'} onClick={() => decide('Approved', `${a.merchant} approved. They can now sign in and submit offers.`, 'Approved merchant sign-up')}><Check /> Approve</button>
            </>
          )}>
          <div className="row" style={{ gap: 12 }}><Mono name={a.merchant} color={m && m.color} size="lg" /><div><b style={{ fontSize: 16 }}>{a.merchant}</b><div className="small muted">{a.category} · {a.outlets} outlet{a.outlets > 1 ? 's' : ''}</div></div><span style={{ marginLeft: 'auto' }}><Status>{a.status}</Status></span></div>
          {m && (
            <dl className="kv">
              <div><dt>Company</dt><dd>{m.company}</dd></div>
              <div><dt>SSM number</dt><dd>{m.ssm}</dd></div>
              <div><dt>Contact</dt><dd>{m.contact}</dd></div>
              <div><dt>Email</dt><dd>{m.email}</dd></div>
            </dl>
          )}
          <div>
            <div className="gv-sub">Documents</div>
            <div className="gv-check">
              {docs.map(([d, ok]) => (
                <div key={d} className={ok ? 'yes' : 'no'}>{ok ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}<span>{d}</span><span className="act small muted">{ok ? 'Received' : 'Missing'}</span></div>
              ))}
            </div>
          </div>
          {!allDocs && !decided && <Callout tone="warn">Some documents are missing. Ask for more information before you approve.</Callout>}
          {a.note && <Callout tone={a.status === 'Rejected' ? 'bad' : 'warn'}>Message sent: {a.note}</Callout>}
          {mode && (
            <Field label={mode === 'info' ? 'What do you need from them?' : 'Reason for rejecting'} hint="The merchant sees this message.">
              <textarea className="input" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'info' ? 'For example: please upload the bank account statement for settlement' : 'For example: the business is outside Sabah'} />
            </Field>
          )}
        </Drawer>
      )}
    </>
  )
}

function OfferSubs({ openId }) {
  const toast = useToast()
  const subs = useStore((s) => s.offerSubs)
  const [open, setOpen] = useState(openId)
  const [status, setStatus] = useState('All')
  const [q, setQ] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const o = subs.find((x) => x.id === open)
  const m = o ? merchants.find((x) => x.name === o.merchant) : null
  const rows = subs.filter((x) => (status === 'All' || x.status === status) && (!q || (x.merchant + x.title).toLowerCase().includes(q.toLowerCase())))
  const close = () => { setOpen(null); setRejecting(false); setReason('') }
  const decide = (st) => {
    updateOffer(o.id, { status: st, reason: st === 'Rejected' ? reason : undefined })
    logEvent(st === 'Approved' ? 'Approved merchant offer' : 'Rejected merchant offer', `${o.merchant} · ${o.title}`)
    toast(st === 'Approved' ? `Offer approved. It goes live on ${o.goLive}.` : 'Offer rejected. The merchant can see your reason.')
    close()
  }
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search merchant or offer" />
        <Select label="Status" value={status} onChange={setStatus} options={[{ value: 'All', label: 'All statuses' }, 'Pending', 'Approved', 'Rejected']} />
      </div>
      <Table rows={rows} onRowClick={(r) => setOpen(r.id)} columns={[
        { key: 'no', label: 'No.', render: (r) => subs.indexOf(r) + 1, width: 50 },
        { key: 'merchant', label: 'Merchant', render: (r) => <div className="who"><Mono name={r.merchant} color={(merchants.find((x) => x.name === r.merchant) || {}).color} /><b>{r.merchant}</b></div> },
        { key: 'title', label: 'Offer title' },
        { key: 'submitted', label: 'Date submitted' },
        { key: 'goLive', label: 'Go-live date' },
        { key: 'status', label: 'Status', render: (r) => <Status>{r.status}</Status> },
        { key: 'act', label: 'Actions', align: 'r', render: () => <span className="small b" style={{ color: 'var(--blue)' }}>View</span> },
      ]} />
      {o && (
        <Drawer title="Offer submission" sub={`${o.id} · ${o.merchant}`} onClose={close}
          footer={o.status !== 'Pending' ? <button className="btn primary" onClick={close}>Close</button> : rejecting ? (
            <><button className="btn outline" onClick={() => setRejecting(false)}>Back</button><button className="btn danger" disabled={reason.trim().length < 5} onClick={() => decide('Rejected')}><X /> Reject offer</button></>
          ) : (
            <><button className="btn danger" onClick={() => setRejecting(true)}><X /> Reject</button><button className="btn success" onClick={() => decide('Approved')}><Check /> Approve offer</button></>
          )}>
          <div className="gv-offer">
            <div className="row between"><span className="row" style={{ gap: 10 }}><Mono name={o.merchant} color={m && m.color} /><b>{o.merchant}</b></span><span className="pill white">Preview</span></div>
            <span className="big">{o.discount}</span>
            <span className="t">{o.title}</span>
            <span className="small">{o.limit} · from {o.goLive} · {o.audience}</span>
            <span className="code">Show code at the counter</span>
          </div>
          <dl className="kv">
            <div><dt>Discount</dt><dd>{o.discount}</dd></div>
            <div><dt>Limit</dt><dd>{o.limit}</dd></div>
            <div><dt>Who sees it</dt><dd>{o.audience}</dd></div>
            <div><dt>Go-live</dt><dd>{o.goLive}</dd></div>
            <div><dt>Submitted</dt><dd>{o.submitted}</dd></div>
            <div><dt>Status</dt><dd><Status>{o.status}</Status></dd></div>
          </dl>
          <div>
            <div className="gv-sub">Checks</div>
            <div className="gv-check">
              <div className="yes"><CircleCheck aria-hidden="true" />Terms are clear and in plain words</div>
              <div className="yes"><CircleCheck aria-hidden="true" />Needs no worker data from SCANS</div>
              <div className={m && m.status === 'Active' ? 'yes' : 'no'}>{m && m.status === 'Active' ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}Merchant account is active</div>
            </div>
          </div>
          {o.reason && <Callout tone="bad">Rejected: {o.reason}</Callout>}
          {rejecting && <Field label="Reason for rejecting" hint="The merchant sees this."><textarea className="input" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: the offer needs worker data SCANS does not share" /></Field>}
          <p className="small muted">A perk counts as used only after the shop confirms it. Merchants never see worker records.</p>
        </Drawer>
      )}
    </div>
  )
}

function MerchantDetail() {
  const { id } = useParams()
  const toast = useToast()
  const base = merchants.find((m) => m.id === id)
  const [offers, setOffers] = useState(() => (base ? merchantDetail(base).live : []))
  const [edit, setEdit] = useState(null)
  if (!base) return <><PageHead title="Merchant not found" back={BASE + '/merchants'} /><Card><Empty title="No merchant with this ID">Go back to the merchant directory.</Empty></Card></>
  const m = merchantDetail(base)
  const save = (o) => {
    setOffers(offers.map((x) => (x.id === o.id ? o : x)))
    logEvent('Edited merchant offer', `${m.name} · ${o.title}`)
    toast('Offer saved. The merchant is told about the change.')
    setEdit(null)
  }
  return (
    <>
      <PageHead title={m.name} back={BASE + '/merchants'} crumbs={[{ label: 'Merchants', to: BASE + '/merchants' }, { label: m.name }]} />
      <Card>
        <div className="gv-head-card">
          <Mono name={m.name} color={m.color} size="lg" />
          <div className="grow"><h2>{m.name}</h2><div className="meta"><span>{m.company}</span><span>SSM {m.ssm}</span><span>{m.category}</span></div></div>
          <Status>{m.status}</Status>
        </div>
      </Card>
      <div className="grid g-4 keep2">
        <Kpi icon={MapPin} label="Outlets" value={num(m.outlets)} />
        <Kpi icon={Store} tone="ok" label="Live offers" value={num(offers.filter((o) => o.status === 'Live').length)} />
        <Kpi icon={Receipt} tone="purple" label="Confirmed uses" value={num(m.redemptions)} note="Since joining" />
        <Kpi icon={CalendarDays} label="Joined" value={m.joined} />
      </div>
      <div className="grid g-main" style={{ alignItems: 'start' }}>
        <Card title="Offers" sub="Edits are logged and the merchant is told">
          <Table rows={offers} empty={<Empty title="No offers yet">Offers the merchant submits appear here after review.</Empty>} columns={[
            { key: 'title', label: 'Offer', render: (o) => <span><b>{o.title}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{o.outlets}</small></span> },
            { key: 'ends', label: 'Ends', render: (o) => <span className="gv-nowrap">{o.ends}</span> },
            { key: 'redemptions', label: 'Uses', align: 'r', render: (o) => num(o.redemptions) },
            { key: 'status', label: 'Status', render: (o) => <Status>{o.status}</Status> },
            { key: 'edit', label: '', align: 'r', render: (o) => <button className="gv-icon-btn" aria-label={'Edit ' + o.title} onClick={() => setEdit(o)}><PencilLine /></button> },
          ]} />
        </Card>
        <Card title="Confirmed uses each month" sub="2027, counted after the shop confirms">
          {m.redemptions > 0 ? <BarChart data={m.monthly} height={220} highlight={m.monthly.length - 1} format={shortAxis} /> : <Empty title="No uses yet">The merchant has not gone live.</Empty>}
        </Card>
      </div>
      <div className="grid g-main" style={{ alignItems: 'start' }}>
        <Card title="Outlets" sub={m.outletList.length < m.outlets ? `Showing ${m.outletList.length} of ${num(m.outlets)} outlets` : `${m.outlets} outlets`}>
          <Table rows={m.outletList} columns={[
            { key: 'name', label: 'Outlet', render: (o) => <b>{o.name}</b> },
            { key: 'district', label: 'District' },
            { key: 'redemptions', label: 'Uses', align: 'r', render: (o) => num(o.redemptions) },
            { key: 'status', label: 'Status', render: (o) => <Status>{o.status}</Status> },
          ]} />
        </Card>
        <Card title="Contact">
          <dl className="kv one">
            <div><dt>Contact person</dt><dd>{m.contact}</dd></div>
            <div><dt>Email</dt><dd>{m.email}</dd></div>
            <div><dt>Joined SCANS</dt><dd>{m.joined}</dd></div>
          </dl>
          <Callout style={{ marginTop: 14 }}>Merchants see confirmed uses and outlet figures only. They never see worker records.</Callout>
        </Card>
      </div>
      {edit && <EditOffer o={edit} onClose={() => setEdit(null)} onSave={save} />}
    </>
  )
}

function EditOffer({ o, onClose, onSave }) {
  const [f, setF] = useState(o)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <Drawer title="Edit offer" sub={o.title} onClose={onClose} footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!f.title.trim()} onClick={() => onSave(f)}>Save changes</button></>}>
      <div className="form-grid">
        <Field label="Offer title" full><input className="input" value={f.title} onChange={set('title')} /></Field>
        <Field label="Discount"><input className="input" value={f.discount} onChange={set('discount')} /></Field>
        <Field label="Limit"><select className="select" value={f.limit} onChange={set('limit')}>{['One a month', 'Two a month', 'One a week', f.limit].filter((v, i, a) => a.indexOf(v) === i).map((l) => <option key={l}>{l}</option>)}</select></Field>
        <Field label="Ends"><input className="input" value={f.ends} onChange={set('ends')} /></Field>
        <Field label="Outlets"><input className="input" value={f.outlets} onChange={set('outlets')} /></Field>
        <div className="field full">
          <span>Status</span>
          <div className="row"><Switch checked={f.status === 'Live'} onChange={(v) => setF({ ...f, status: v ? 'Live' : 'Paused' })} label="Offer is live" /><span>{f.status === 'Live' ? 'Live in the worker app' : 'Paused, hidden from workers'}</span></div>
        </div>
      </div>
      <Callout>Changes to the discount or terms are shown to workers straight away. Uses already confirmed are not affected.</Callout>
    </Drawer>
  )
}

/* =====================================================================
   Global announcements
   ===================================================================== */
function Announcements() {
  const toast = useToast()
  const notices = useStore((s) => s.notices)
  const [compose, setCompose] = useState(false)
  const [view, setView] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const sent = notices.filter((n) => n.status === 'Sent')
  const reached = sent.reduce((s, n) => s + Math.round(n.recipients * n.reached), 0)
  const rows = notices.filter((n) => (status === 'All' || n.status === status) && (!q || n.title.toLowerCase().includes(q.toLowerCase())))
  const v = notices.find((n) => n.id === view)
  const submit = (n) => {
    const id = addNotice(n)
    logEvent(n.status === 'Waiting for State approval' ? 'Sent announcement to State for approval' : 'Created announcement', `${id} · ${n.title}`)
    toast(n.status === 'Waiting for State approval' ? 'Announcement sent to the State. It shows as waiting for State approval.' : `Announcement ${n.status.toLowerCase()}.`)
    setCompose(false)
  }
  const resubmit = (n) => {
    updateNotice(n.id, { status: 'Waiting for State approval', comment: undefined })
    logEvent('Sent announcement to State for approval', `${n.id} · ${n.title}`)
    toast('Sent to the State for approval')
    setView(null)
  }
  return (
    <>
      <PageHead title="Global announcements" sub="Messages to workers, employers and merchants in six languages. Notices to workers are approved by the State before sending.">
        <button className="btn primary" onClick={() => setCompose(true)}><Plus /> New announcement</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={Users} label="Recipients reached" value={num(reached)} note="Across sent announcements" />
        <Kpi icon={Send} tone="ok" label="Sent" value={num(sent.length)} />
        <Kpi icon={CalendarDays} tone="purple" label="Scheduled" value={num(notices.filter((n) => n.status === 'Scheduled').length)} />
        <Kpi icon={Lock} tone="warn" label="Waiting for State" value={num(notices.filter((n) => n.status === 'Waiting for State approval').length)} note="Only the State can approve" />
      </div>
      <Card>
        <div className="toolbar" style={{ marginBottom: 14 }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search announcements" />
          <Select label="Status" value={status} onChange={setStatus} options={[{ value: 'All', label: 'All statuses' }, 'Sent', 'Scheduled', 'Waiting for State approval', 'Returned', 'Draft']} />
        </div>
        <Table rows={rows} onRowClick={(n) => setView(n.id)} columns={[
          { key: 'title', label: 'Announcement', render: (n) => <span><b>{n.title}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{n.sub}</small></span> },
          { key: 'audience', label: 'Audience', render: (n) => <AudiencePill a={n.audience} /> },
          { key: 'channels', label: 'Channels', render: (n) => <ChannelIcons list={n.channels} /> },
          { key: 'recipients', label: 'Recipients', align: 'r', render: (n) => (n.recipients ? num(n.recipients) : '—') },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status', render: (n) => <Status tone={n.status === 'Returned' ? 'bad' : undefined}>{n.status}</Status> },
          { key: 'view', label: 'View', align: 'r', render: (n) => <button className="gv-icon-btn" aria-label={'View ' + n.title} onClick={(e) => { e.stopPropagation(); setView(n.id) }}><Eye /></button> },
        ]} />
      </Card>
      {compose && <NoticeComposer mode="admin" onClose={() => setCompose(false)} onSubmit={submit} />}
      {v && <NoticeView n={v} onClose={() => setView(null)} footer={
        v.status === 'Draft' || v.status === 'Returned'
          ? <><button className="btn outline" onClick={() => setView(null)}>Close</button><button className="btn primary" onClick={() => resubmit(v)}><Send /> Send to State for approval</button></>
          : v.status === 'Waiting for State approval'
            ? <><span className="small muted grow">Waiting for State approval. Microtek cannot approve notices.</span><button className="btn primary" onClick={() => setView(null)}>Close</button></>
            : null
      } />}
    </>
  )
}

/* =====================================================================
   Admin management
   ===================================================================== */
const ORGS = ['Microtek', 'Jabatan Kewangan Negeri', 'Kementerian Kewangan Negeri', 'JTK Sabah', 'Jabatan Audit Negeri']
const PERMS = ['View worker records', 'Export reports', 'Approve offers and sign-ups', 'Correct records', 'Approve State notices', 'Manage users']
const MATRIX = {
  Superadmin: [1, 1, 1, 1, 0, 1], Operations: [1, 1, 1, 1, 0, 0], Support: [1, 0, 0, 0, 0, 0], 'State finance': [1, 1, 0, 0, 0, 0],
  'State approver': [1, 1, 0, 0, 1, 0], 'Agency officer': [1, 0, 0, 0, 0, 0], Auditor: [1, 1, 0, 0, 0, 0],
}

function AdminUsers() {
  const toast = useToast()
  const [tab, setTab] = useState('Users')
  const [users, setUsers] = useState(adminUsers)
  const [invite, setInvite] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [f, setF] = useState({ name: '', email: '', org: 'Microtek', role: 'Support' })
  const [tried, setTried] = useState(false)
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)
  const send = () => {
    setTried(true)
    if (!f.name.trim() || !emailOk) return
    setUsers([...users, { name: f.name.trim(), email: f.email.trim(), org: f.org, role: f.role, twoFA: false, last: '—', status: 'Invited' }])
    logEvent('Invited admin user', `${f.email} · ${f.role}`)
    toast(`Invitation sent to ${f.email}. They must set up 2-step sign-in first.`)
    setInvite(false); setTried(false); setF({ name: '', email: '', org: 'Microtek', role: 'Support' })
  }
  const toggle = (u) => {
    const dis = u.status !== 'Disabled'
    setUsers(users.map((x) => (x.email === u.email ? { ...x, status: dis ? 'Disabled' : 'Active' } : x)))
    logEvent(dis ? 'Disabled admin user' : 'Enabled admin user', u.email)
    toast(dis ? `${u.name} can no longer sign in` : `${u.name} can sign in again`)
    setConfirm(null)
  }
  return (
    <>
      <PageHead title="Admin management" sub="People from Microtek, the State and agencies who can sign in to SCANS. 2-step sign-in is always required.">
        <button className="btn primary" onClick={() => setInvite(true)}><MailPlus /> Invite user</button>
      </PageHead>
      <Card>
        <Tabs items={[{ value: 'Users', label: 'Users', count: users.length }, { value: 'Roles', label: 'Roles', count: adminRoles.length }]} value={tab} onChange={setTab} label="Admin management" />
        <div style={{ paddingTop: 16 }}>
          {tab === 'Users' && (
            <Table rows={users} rowKey={(u) => u.email} columns={[
              { key: 'name', label: 'Name', render: (u) => <div className="who"><Avatar name={u.name} /><div><b>{u.name}</b><small>{u.email}</small></div></div> },
              { key: 'org', label: 'Organisation' },
              { key: 'role', label: 'Role', render: (u) => <Pill tone="grey">{u.role}</Pill> },
              { key: 'twoFA', label: '2-step sign-in', render: (u) => (u.twoFA ? <Pill tone="ok">On</Pill> : <Pill tone="warn">At first sign-in</Pill>) },
              { key: 'last', label: 'Last sign-in' },
              { key: 'status', label: 'Status', render: (u) => <Status>{u.status}</Status> },
              { key: 'act', label: '', align: 'r', render: (u) => u.role === 'Superadmin' && u.name === 'Faizal Rahman' ? <span className="small muted">You</span> : <button className={'btn sm ' + (u.status === 'Disabled' ? 'outline' : 'danger')} onClick={() => setConfirm(u)}>{u.status === 'Disabled' ? 'Enable' : 'Disable'}</button> },
            ]} />
          )}
          {tab === 'Roles' && (
            <div className="stack">
              <Table rows={adminRoles} rowKey={(r) => r.name} columns={[
                { key: 'name', label: 'Role', render: (r) => <b>{r.name}</b> },
                { key: 'who', label: 'Who' },
                { key: 'can', label: 'Can' },
                { key: 'users', label: 'Users', align: 'r', render: (r) => users.filter((u) => u.role === r.name && u.status !== 'Disabled').length },
              ]} />
              <div className="gv-sub">What each role can do</div>
              <div className="table-wrap">
                <table className="data stack">
                  <thead><tr><th>Role</th>{PERMS.map((p) => <th key={p}>{p}</th>)}</tr></thead>
                  <tbody>
                    {adminRoles.map((r) => (
                      <tr key={r.name}><td data-label="Role"><b>{r.name}</b></td>{PERMS.map((p, i) => <td key={p} data-label={p}>{MATRIX[r.name][i] ? <Check size={16} color="var(--ok)" aria-label="Yes" /> : <X size={16} color="var(--ink3)" aria-label="No" />}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Callout icon={Lock}>No role can issue, suspend or cancel a permit: SCANS has no such function. Microtek roles cannot approve State notices.</Callout>
            </div>
          )}
        </div>
      </Card>
      {invite && (
        <Modal title="Invite a user" onClose={() => setInvite(false)} actions={<><button className="btn outline" onClick={() => setInvite(false)}>Cancel</button><button className="btn primary" onClick={send}><MailPlus /> Send invitation</button></>}>
          <div className="form-grid">
            <Field label="Full name" full error={tried && !f.name.trim() ? 'Enter their name.' : null}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Work email" full error={tried && !emailOk ? 'Enter a work email, like name@sabah.gov.my.' : null}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Organisation"><select className="select" value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })}>{ORGS.map((o) => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Role"><select className="select" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{adminRoles.map((r) => <option key={r.name}>{r.name}</option>)}</select></Field>
            <div className="field full"><span>2-step sign-in</span><div className="row"><Switch checked onChange={() => {}} label="2-step sign-in, always on" /><span className="small ink2">Always required for every web user. It cannot be turned off.</span></div></div>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal title={confirm.status === 'Disabled' ? `Enable ${confirm.name}?` : `Disable ${confirm.name}?`} onClose={() => setConfirm(null)}
          actions={<><button className="btn outline" onClick={() => setConfirm(null)}>Cancel</button><button className={'btn ' + (confirm.status === 'Disabled' ? 'primary' : 'danger')} onClick={() => toggle(confirm)}>{confirm.status === 'Disabled' ? 'Enable user' : 'Disable user'}</button></>}>
          <p className="ink2">{confirm.status === 'Disabled' ? 'They can sign in again with their 2-step sign-in.' : 'They are signed out now and cannot sign in until enabled again. Their past actions stay in the audit log.'}</p>
        </Modal>
      )}
    </>
  )
}

/* =====================================================================
   Audit log
   ===================================================================== */
function AuditLog() {
  const toast = useToast()
  const audit = useStore((s) => s.audit)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('All')
  const [org, setOrg] = useState('All')
  const rows = audit.filter((a) => {
    if (kind !== 'All' && a.kind !== kind) return false
    if (org === 'Microtek' && !a.who.includes('Microtek')) return false
    if (org === 'State' && !a.who.includes('State')) return false
    if (org === 'System' && a.who !== 'System') return false
    const t = q.toLowerCase()
    return !t || (a.who + a.action + a.target).toLowerCase().includes(t)
  })
  return (
    <>
      <PageHead title="Audit log" sub="Every view, export and change in SCANS, with who did it and when. Kept for the State’s auditors and cannot be edited.">
        <button className="btn outline" onClick={() => { logEvent('Exported audit log extract', `${rows.length} events`); toast('Audit log extract exported. The export is itself logged.') }}><Download /> Export extract</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={ScrollText} label="Events this session" value={num(audit.length)} />
        <Kpi icon={Eye} label="Record views" value={num(audit.filter((a) => a.kind === 'View').length)} />
        <Kpi icon={Download} tone="purple" label="Exports" value={num(audit.filter((a) => a.kind === 'Export').length)} />
        <Kpi icon={PencilLine} tone="warn" label="Changes" value={num(audit.filter((a) => a.kind === 'Change').length)} />
      </div>
      <Card>
        <div className="gv-filters f3" style={{ marginBottom: 14 }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search user, action or record" />
          <Select label="Type" value={kind} onChange={setKind} options={[{ value: 'All', label: 'All types' }, 'View', 'Export', 'Change', 'System']} />
          <Select label="Organisation" value={org} onChange={setOrg} options={[{ value: 'All', label: 'Everyone' }, 'Microtek', 'State', 'System']} />
        </div>
        <Table rows={rows} pageSize={12} columns={[
          { key: 'at', label: 'When', render: (a) => <span className="num">{a.at}</span> },
          { key: 'who', label: 'Who' },
          { key: 'kind', label: 'Type', render: (a) => <Pill tone={{ View: 'info', Export: 'purple', Change: 'warn', System: 'grey' }[a.kind] || 'grey'}>{a.kind}</Pill> },
          { key: 'action', label: 'What' },
          { key: 'target', label: 'Record' },
        ]} />
      </Card>
    </>
  )
}

/* =====================================================================
   Connected systems
   ===================================================================== */
function Systems() {
  const toast = useToast()
  const [breaks, setBreaks] = useState(reconciliationBreaks)
  const [checking, setChecking] = useState(null)
  const open = breaks.filter((b) => b.status === 'Open')
  const check = (s) => {
    setChecking(s.name)
    setTimeout(() => { setChecking(null); logEvent('Checked connection', s.name); toast(`${s.name}: connection checked, ${s.state === 'Degraded' ? 'still slower than usual' : 'working'}`) }, 700)
  }
  const resolve = (b) => {
    setBreaks(breaks.map((x) => (x.id === b.id ? { ...x, status: 'Resolved' } : x)))
    logEvent('Resolved reconciliation break', `${b.id} · ${b.ref}`)
    toast(`${b.id} marked as resolved`)
  }
  return (
    <>
      <PageHead title="Connected systems" sub="Data comes in under signed data-sharing agreements. Nothing written back can change a worker’s status." />
      <div className="grid g-4 keep2">
        <Kpi hero icon={Gauge} label="Uptime, 30 days" value={pct(uptime30, 2)} note="Target 99.5%, payments 99.9%" />
        <Kpi icon={CreditCard} tone="ok" label="Payment success" value={pct(paymentSuccess, 1)} note="Today" />
        <Kpi icon={Scale} tone={open.length ? 'bad' : 'ok'} label="Reconciliation breaks" value={num(open.length)} note="Open" />
        <Kpi icon={Activity} tone="warn" label="Degraded links" value={num(systems.filter((s) => s.state === 'Degraded').length)} note="SMS and WhatsApp" />
      </div>
      <Card title="Systems" sub="Checked every minute">
        <Table rows={systems} rowKey={(s) => s.name} columns={[
          { key: 'name', label: 'System', render: (s) => <span><b>{s.name}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{s.owner}</small></span> },
          { key: 'mode', label: 'Access', render: (s) => <Pill tone="grey">{s.mode}</Pill> },
          { key: 'state', label: 'Status', render: (s) => <Status>{s.state === 'Read only' ? 'Connected' : s.state}</Status> },
          { key: 'latency', label: 'Response', align: 'r', render: (s) => <span className="num gv-nowrap">{s.latency >= 1000 ? (s.latency / 1000).toFixed(1) + ' s' : s.latency + ' ms'}</span> },
          { key: 'sync', label: 'Last sync', render: (s) => <span className="gv-nowrap">{s.sync}</span> },
          { key: 'uptime', label: 'Uptime', align: 'r', render: (s) => <span className="num">{pct(s.uptime, 2)}</span> },
          { key: 'note', label: 'Detail', render: (s) => <span className="small ink2">{s.records}. {s.note}</span> },
          { key: 'act', label: '', align: 'r', render: (s) => <button className="btn sm outline" disabled={checking === s.name} onClick={() => check(s)}><RefreshCw /> {checking === s.name ? 'Checking' : 'Check now'}</button> },
        ]} />
      </Card>
      <Card title="Reconciliation breaks" sub="Acquirer credits into the FWECF account matched against SCANS receipts, June 2027">
        <Table rows={breaks} columns={[
          { key: 'id', label: 'Break', render: (b) => <b className="mono-id gv-nowrap">{b.id}</b> },
          { key: 'date', label: 'Date', render: (b) => <span className="gv-nowrap">{b.date}</span> },
          { key: 'kind', label: 'Type' },
          { key: 'ref', label: 'Reference' },
          { key: 'amount', label: 'Amount', align: 'r', render: (b) => <span className="gv-nowrap">{rm(b.amount)}</span> },
          { key: 'note', label: 'Detail', render: (b) => <span className="small ink2">{b.note}</span> },
          { key: 'status', label: 'Status', render: (b) => <Status tone={b.status === 'Open' ? 'bad' : undefined}>{b.status}</Status> },
          { key: 'act', label: '', align: 'r', render: (b) => b.status === 'Open' ? <button className="btn sm primary" onClick={() => resolve(b)}><Check /> Resolve</button> : null },
        ]} />
      </Card>
    </>
  )
}
