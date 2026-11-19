// State overview (/state). Follows the Figma "Kerajaan Negeri Sabah Dashboard - Start" prototype frame:
// total collection with a date range, monthly / weekly / daily collection, live transactions,
// payment channel, worker payment metrics and the workforce map. Every figure comes from demo.js
// (through shared/data.js) so it matches the Microtek console and the FWECF account page.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarRange, ChevronDown, Check, Download, Receipt, RefreshCw, Pause, Play, Users, Wallet, CalendarDays, Clock3, MapPin,
} from 'lucide-react'
import {
  PageHead, Card, Kpi, Seg, BarChart, HBarChart, Donut, MeterRows, SplitBar, SabahMap, DistrictDetail, Skeleton, useToast, useLiveFeed, useLivePayments, AnimatedValue,
} from '../../components/ui.jsx'
import {
  REGISTERED, STATE_SHARE, districts, sectors, monthly, monthlySplit, ytd, stateYtd, operatorYtd, paidThisMonth, collectedThisMonth,
  collectionToday, dailyCollection, paymentMetrics, nationalityCounts, recentTxns, makeTxn, rm, num, pct,
} from '../../data/demo.js'
import { channelData, week, month30 } from '../shared/data.js'
import { logEvent } from '../shared/store.js'

const BASE = '/state'
const axisRm = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'm' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : String(v))
const rmM = (v) => 'RM ' + (v / 1e6).toFixed(2) + 'm'
const delta = (now, before) => (now - before) / before
const signed = (d) => (d >= 0 ? '+' : '−') + Math.abs(d * 100).toFixed(1) + '%'

/* ---------- Periods for the total collection header ---------- */
const RANGES = [
  { value: 'today', label: 'Today', range: '17 Dec 2027', total: collectionToday, note: 'Payments to 15:00' },
  { value: '7d', label: 'Last 7 days', range: '11 Dec to 17 Dec 2027', total: week, note: 'Credited to the FWECF account, including arrears cleared' },
  { value: '30d', label: 'Last 30 days', range: '18 Nov to 17 Dec 2027', total: month30, note: 'Credited to the FWECF account, including arrears cleared' },
  { value: 'ytd', label: 'This year', range: '1 Jul to 17 Dec 2027', total: ytd, note: `Settled into the FWECF account, July to December. State share ${rmM(stateYtd)}` },
]

/* ---------- Monthly / weekly / daily collection with change ---------- */
const may = monthly[monthly.length - 2].v
const prevWeek = dailyCollection.slice(-14, -7).reduce((s, d) => s + d.value, 0)
const yesterday = dailyCollection[dailyCollection.length - 2].value

/* ---------- Live feed ---------- */
const SEED = recentTxns.filter((t, i, a) => a.findIndex((x) => x.scansId === t.scansId) === i).slice(0, 7)
const liveTxn = (n) => ({ ...makeTxn(n), born: Date.now() })
const ago = (t) => { const s = Math.max(1, Math.round((Date.now() - t.born) / 1000)); return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago` }
const shortMethod = (m) => m.replace(' eWallet', '').replace(' online banking', '')

/* ---------- Map ---------- */
const MAP_FILTERS = [['all', 'All districts'], ['high', 'High arrears only'], ['low', 'Low arrears only']]
const MAP_PERIODS = [{ value: 'today', label: 'Today' }, { value: 'week', label: 'This week' }, { value: 'month', label: 'This month' }]
const PERIOD_TOTAL = { today: collectionToday, week, month: collectedThisMonth }
const PERIOD_TEXT = { today: 'today', week: 'in the last 7 days', month: 'for December' }

export default function Overview() {
  const toast = useToast()
  const liveAmt = useLivePayments() * 100
  const monthNow = collectedThisMonth + liveAmt
  const todayNow = collectionToday + liveAmt
  const weekNow = week + liveAmt
  const go = useNavigate()
  return (
    <>
      <PageHead title="Overview" sub={`Friday 17 December 2027. ${num(paidThisMonth)} of ${num(REGISTERED)} registered workers have paid for December; payment was due on 5 December.`}>
        <button className="btn outline" onClick={() => { logEvent('Downloaded report', 'Monthly collection and reconciliation · December 2027 · PDF'); toast('December 2027 report downloaded. The download is in the audit log.') }}><Download /> Monthly report</button>
      </PageHead>

      <TotalCollection />

      <div className="grid g-2 st-top">
        <Card className="st-periods" title="Collection" sub="Gross, before the 70:30 split">
          <div className="st-period-list">
            <Kpi icon={Wallet} label="Monthly collection" value={rm(monthNow)}
              delta={signed(delta(monthNow, may))} down={monthNow < may} note={`December contributions, against ${rm(may)} for November`} />
            <Kpi icon={CalendarDays} label="Weekly collection" value={rm(weekNow)}
              delta={signed(delta(week, prevWeek))} down={week < prevWeek} note="11 to 17 December, against 4 to 10 December, which had the 5 December due date" />
            <Kpi icon={Clock3} label="Daily collection" value={rm(todayNow)}
              delta={signed(delta(todayNow, yesterday))} down={todayNow < yesterday} note={`Today so far, against ${rm(yesterday)} on 16 December`} />
          </div>
        </Card>
        <LiveTransactions />
      </div>

      <div className="grid g-2">
        <Card title="Payment channel" sub="How workers paid for December 2027">
          <Donut data={channelData} center={rmM(monthNow)} centerSub="December" size={170} />
        </Card>
        <Card title="Worker payment metrics" sub={`December 2027, all ${num(REGISTERED)} registered workers`}>
          <MeterRows big items={paymentMetrics.map((m) => ({ label: m.label, share: m.value / REGISTERED, text: num(m.value) + ' workers', color: m.color }))} />
          <p className="small muted" style={{ marginTop: 16 }}>Workers who are behind get reminders in their own language. Arrears never lead to permit action, passport holding or travel restriction.</p>
          <button className="st-link" style={{ marginTop: 10 }} onClick={() => go(`${BASE}/workers?status=${encodeURIComponent('3+ months overdue')}`)}>See workers 3+ months overdue</button>
        </Card>
      </div>

      <WorkforceMap />

      <div className="grid g-main">
        <Card title="Settled each month" sub="2027, reconciled settlements split between the State (70%) and the operator (30%)">
          <BarChart data={monthlySplit} series={['State share (70%)', 'Operator (30%)']} colors={['#1D66B8', '#4D9AD3']} height={250} format={axisRm} />
        </Card>
        <Card title="Where the money goes" sub="Settled July to December 2027, after reconciliation">
          <SplitBar parts={[
            { label: 'Kerajaan Negeri Sabah', share: STATE_SHARE, text: rm(stateYtd), color: '#1D66B8' },
            { label: 'Operator, Microtek', share: 1 - STATE_SHARE, text: rm(operatorYtd), color: '#4D9AD3' },
          ]} />
          <p className="small muted" style={{ marginTop: 16 }}>Payments go from the licensed acquirer straight into the FWECF account held by Jabatan Kewangan Negeri Sabah. SCANS never holds funds.</p>
        </Card>
      </div>
      <div className="grid g-2">
        <Card title="By sector" sub="Registered workers, proposal s.3.1">
          <HBarChart data={sectors.map((s) => ({ label: s.name, value: s.workers }))} />
        </Card>
        <Card title="Nationality" sub="Registered workers. Sample data: the proposal has no nationality split">
          <Donut data={nationalityCounts} center={num(REGISTERED)} centerSub="workers" size={170} />
        </Card>
      </div>
    </>
  )
}

/* =====================================================================
   Total collection with a date range picker
   ===================================================================== */
function TotalCollection() {
  const [range, setRange] = useState('ytd')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const r = RANGES.find((x) => x.value === range)
  const liveAmt = useLivePayments() * 100
  useEffect(() => {
    if (!open) return
    const click = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key) }
  }, [open])
  return (
    <div className="card st-total">
      <div className="st-range" ref={ref}>
        <button className="st-range-btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)}>
          <CalendarRange aria-hidden="true" />
          <span><small>Date range</small><b className="num">{r.range}</b></span>
          <ChevronDown aria-hidden="true" className="chev" />
        </button>
        {open && (
          <div className="st-range-pop" role="group" aria-label="Choose a date range">
            {RANGES.map((x) => (
              <button key={x.value} aria-pressed={x.value === range} onClick={() => { setRange(x.value); setOpen(false) }}>
                <span><b>{x.label}</b><small className="num">{x.range}</small></span>
                {x.value === range && <Check aria-hidden="true" />}
              </button>
            ))}
            <p>Prototype data runs from 1 July to 17 December 2027.</p>
          </div>
        )}
      </div>
      <div className="st-total-fig" aria-live="polite">
        <span>Total collection</span>
        <b className="num"><AnimatedValue value={rm(r.total + liveAmt)} /></b>
        <small>{r.note}</small>
      </div>
    </div>
  )
}

/* =====================================================================
   Live transactions
   ===================================================================== */
function LiveTransactions() {
  const go = useNavigate()
  const [paused, setPaused] = useState(false)
  const feed = useLiveFeed(SEED, liveTxn, paused ? 1e9 : 4000, 7)
  const liveN = useLivePayments()
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(id) }, [])
  return (
    <Card title={<span className="row" style={{ gap: 8 }}>Live transactions <span className={'pill ' + (paused ? 'grey' : 'ok') + ' dot st-live'}>{paused ? 'Paused' : 'Live'}</span></span>}
      sub={`${num(collectionToday / 100 + liveN)} transactions today`}
      action={<button className="btn sm ghost" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? <><Play /> Resume</> : <><Pause /> Pause</>}</button>}>
      <div className={'feed st-feed' + (paused ? '' : ' fresh')} aria-live={paused ? 'off' : 'polite'}>
        {feed.map((t) => (
          <div key={t.id} className="it gv-feed-it" role="link" tabIndex={0} aria-label={`${t.scansId}, ${t.worker}, ${rm(t.amount)} by ${t.method}. Open record`}
            onClick={() => go(`${BASE}/workers/${t.scansId}`)} onKeyDown={(e) => e.key === 'Enter' && go(`${BASE}/workers/${t.scansId}`)}>
            <span className={'ic ' + (t.cleared ? 'ok' : '')}><Receipt aria-hidden="true" /></span>
            <div style={{ minWidth: 0 }}>
              <b>{t.scansId}</b>
              <div className="gv-tags">
                <span className="pill grey">{t.nationality}</span>
                {t.cleared ? <span className="pill ok">Arrears cleared</span> : <span className="pill info">Now paid up</span>}
              </div>
              <span className="st-feed-sub">{t.employer.replace(/ (Sdn Bhd|Bhd)$/, '')} · {t.district} · {t.period}</span>
            </div>
            <div className="amt"><b className="num">{rm(t.amount)}</b><span style={{ display: 'block' }}>{shortMethod(t.method)} · {t.born ? ago(t) : t.at}</span></div>
          </div>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>Choose a payment to open the worker record. Opening a record is written to the audit log.</p>
    </Card>
  )
}

/* =====================================================================
   Workforce map
   ===================================================================== */
function WorkforceMap() {
  const go = useNavigate()
  const toast = useToast()
  const [sel, setSel] = useState('lahaddatu')
  const [filter, setFilter] = useState('all')
  const [period, setPeriod] = useState('month')
  const [updated, setUpdated] = useState(() => Date.now() - 3 * 60000)
  const [loading, setLoading] = useState(false)
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(id) }, [])
  const mins = Math.round((Date.now() - updated) / 60000)
  const refresh = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setUpdated(Date.now()); toast('Map updated with the latest payments') }, 700)
  }
  const received = (d) => (period === 'month' ? d.collected : Math.round(PERIOD_TOTAL[period] * (d.collected / collectedThisMonth)))
  return (
    <Card className="st-map" title="Workforce by district"
      sub="Sabah’s 27 districts in 8 reporting areas, coloured by the share not yet paid for December. Glows show where registered workers are, by work site on eNORES; ripples are payments arriving. Not a tracked position."
      action={
        <div className="row" style={{ gap: 8 }}>
          <span className="pill ok dot" aria-live="polite">{loading ? 'Updating' : mins < 1 ? 'Updated just now' : `Updated ${mins} min${mins > 1 ? 's' : ''} ago`}</span>
          <button className="btn sm ghost icon" onClick={refresh} disabled={loading} aria-label="Refresh map"><RefreshCw className={loading ? 'st-spin' : ''} /></button>
        </div>
      }>
      <div className="st-map-bar">
        <div className="chips" role="group" aria-label="Show districts">
          {MAP_FILTERS.map(([v, l]) => <button key={v} className="chip" aria-pressed={filter === v} onClick={() => setFilter(v)}>{l}</button>)}
        </div>
        <Seg items={MAP_PERIODS} value={period} onChange={setPeriod} label="Payments received" />
      </div>
      <p className="small muted st-map-note"><MapPin size={13} aria-hidden="true" /> {rm(PERIOD_TOTAL[period])} received {PERIOD_TEXT[period]} across {districts.length} reporting areas. Choose an area for detail.</p>
      {loading ? (
        <div className="st-map-skel"><Skeleton h={300} /><div className="stack" style={{ gap: 10 }}><Skeleton h={22} w="60%" /><Skeleton /><Skeleton /><Skeleton w="80%" /></div></div>
      ) : (
        <SabahMap districts={districts} selected={sel} onSelect={setSel} filter={filter} renderPanel={(d) => (
          <div className="stack" style={{ gap: 14 }}>
            <DistrictDetail d={d} />
            <div className="gv-kv-card small">Received {PERIOD_TEXT[period]}: <b className="num">{rm(received(d))}</b></div>
            <button className="btn sm outline" onClick={() => go(`${BASE}/workers?district=${encodeURIComponent(d.name)}`)}><Users /> Look up workers</button>
          </div>
        )} />
      )}
    </Card>
  )
}
