// Command centre: the operator's live view of collection, connected systems and work waiting.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Wallet, CalendarDays, CreditCard, UserCheck, ChevronRight, ClipboardCheck, Megaphone, Scale, Plug, Users, Receipt,
  Building2, Smartphone, CalendarClock, Headset, Gauge,
} from 'lucide-react'
import { PageHead, Card, Kpi, Seg, BarChart, Donut, MeterRows, Sparkline, SabahMap, DistrictDetail, Status, useLiveFeed, useLivePayments } from '../../components/ui.jsx'
import { REGISTERED, STATE_SHARE, monthly, collectionToday, collectionMonth, settledThisMonth, paidThisMonth, paymentMetrics, recentTxns, makeTxn, districts, employerTotals, rm, num, pct } from '../../data/demo.js'
import { hourlyToday, last7, last30, week, month30, paymentSuccess, uptime30, channelData, systems } from '../shared/data.js'
import { BASE, short, shortAxis, ms, companyCompliance, companiesActive, appUsers, permitsEndingSoon, paymentMethods } from './data.js'
import { useQueue, useAdmin } from './store.js'

const PERIODS = [
  { value: 'today', label: 'Today' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: 'month', label: 'Month' },
]
const SEED = recentTxns.filter((t, i, a) => a.findIndex((x) => x.scansId === t.scansId) === i).slice(0, 7)
const liveTxn = (n) => ({ ...makeTxn(n), born: Date.now() })
const ago = (t) => { const s = Math.max(1, Math.round((Date.now() - t.born) / 1000)); return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago` }

export default function CommandCentre() {
  const go = useNavigate()
  const [period, setPeriod] = useState('today')
  const [mapFilter, setMapFilter] = useState('all')
  const [sel, setSel] = useState('lahaddatu')
  const feed = useLiveFeed(SEED, liveTxn, 4000, 7)
  const live = useLivePayments()
  const liveAmt = live * 100
  const monthNow = collectionMonth + liveAmt
  const todayNow = collectionToday + liveAmt
  const paidNow = paidThisMonth + live
  const q = useQueue()
  const breaks = useAdmin((s) => s.breaks)
  const tickets = useAdmin((s) => s.tickets)
  const openBreaks = breaks.filter((b) => b.status === 'Open')
  const late = tickets.filter((t) => t.status !== 'Resolved' && t.age > t.target)
  const per = {
    today: { label: 'Today, by hour to 15:00', data: hourlyToday, total: todayNow, sub: 'today' },
    '7d': { label: 'Last 7 days', data: last7, total: week, sub: '7 days' },
    '30d': { label: 'Last 30 days, 18 Nov to 17 December', data: last30, total: month30, sub: '30 days' },
    month: { label: 'Settled into the FWECF account each month in 2027', data: monthly.map((m) => ({ label: m.m, value: m.v })), total: settledThisMonth, sub: 'December' },
  }[period]
  const methods = paymentMethods(per.total)
  const byType = q.waiting.reduce((m, i) => ({ ...m, [i.type]: (m[i.type] || 0) + 1 }), {})
  const companies = companyCompliance.reduce((s, c) => s + c.value, 0)

  return (
    <>
      <PageHead title="Command centre" sub="Friday 17 December 2027. December contributions were due on 5 December.">
        <Seg items={PERIODS} value={period} onChange={setPeriod} label="Period" />
      </PageHead>

      <div className="grid g-4 keep2 gv-kpis">
        <Kpi hero icon={Wallet} label="Contributions for December" value={rm(monthNow)} note={`${num(paidNow)} workers paid for December`}>
          <div className="gv-hero-split" style={{ marginTop: 14 }}><span>Settled in December <b>{rm(settledThisMonth)}</b></span></div>
          <div className="gv-hero-split"><span>State 70% <b>{rm(Math.round(settledThisMonth * STATE_SHARE))}</b></span><span>Operator 30% <b>{rm(settledThisMonth - Math.round(settledThisMonth * STATE_SHARE))}</b></span></div>
          <div className="gv-hero-spark"><Sparkline values={monthly.map((m) => m.v)} /></div>
          <div className="gv-hero-split"><span>Settled July to December 2027</span></div>
        </Kpi>
        <Kpi icon={CalendarDays} label="Today" value={rm(todayNow)} note={`${num(todayNow / 100)} payments so far · ${rm(week)} in 7 days`} />
        <Kpi icon={CreditCard} tone="ok" label="Payment success" value={pct(paymentSuccess, 1)} note="Approved of all attempts today" />
        <Kpi icon={Building2} label="Employers registered" value={num(employerTotals.count)} note={`${num(companiesActive)} paid for at least one worker in December`} />
        <Kpi icon={Users} label="Workers registered" value={num(REGISTERED)} note="31 Dec 2025, Parliament reply. SWIMS holds 122,228 records" />
        <Kpi icon={UserCheck} tone="purple" label="Workers paying" value={pct(paidNow / REGISTERED, 2)} note={`${num(paidNow)} of ${num(REGISTERED)}`} />
        <Kpi icon={Smartphone} tone="ok" label="Using the SCANS app" value={num(appUsers)} note={`${pct(appUsers / REGISTERED)} of registered workers`} />
      </div>

      <div className="card strip gv-strip" style={{ padding: '12px 16px' }}>
        {systems.map((s) => (
          <span key={s.name} className={'pill dot ' + (s.state === 'Degraded' ? 'warn' : s.state === 'Read only' ? 'info' : 'ok')}>
            {s.name} · {ms(s.latency)}
          </span>
        ))}
        <span className="pill dot ok"><Gauge size={13} aria-hidden="true" /> Uptime {pct(uptime30, 2)}</span>
        <Link to={BASE + '/system'} className="gv-strip-note" style={{ textDecoration: 'none' }}>Links checked every minute</Link>
      </div>

      <div className="grid g-main">
        <Card title="Collection" sub={per.label} action={<span className="pill info num">{rm(per.total)}</span>}>
          <BarChart data={per.data} height={250} format={shortAxis} highlight={period === 'month' ? per.data.length - 1 : undefined} colors={['#1D66B8']} />
        </Card>
        <Card title="How workers paid" sub={`Payment channel, ${per.sub}`}>
          <Donut data={channelData} center={short(per.total)} centerSub={per.sub} size={170} />
        </Card>
      </div>

      <div className="grid g-main">
        <Card title={<span className="row" style={{ gap: 8 }}><span className="gv-legend-dot" style={{ background: 'var(--okFill)', boxShadow: '0 0 0 4px var(--okBg)' }} />Live transactions</span>}
          sub={`${num(todayNow / 100)} payments today · updates every few seconds`} action={<Link className="link" to={BASE + '/workers'}>Worker records <ChevronRight size={14} /></Link>}>
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
            {late.length > 0 && (
              <Link to={BASE + '/support'}>
                <span className="ic bad"><Headset aria-hidden="true" /></span>
                <div><b>{late.length} support request{late.length > 1 ? 's' : ''} past the response target</b><small>{late.map((t) => t.id).join(', ')}</small></div>
                <ChevronRight className="chev" size={16} />
              </Link>
            )}
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
            {openBreaks.length > 0 && (
              <Link to={BASE + '/settlement'}>
                <span className="ic bad"><Scale aria-hidden="true" /></span>
                <div><b>{openBreaks.length} reconciliation break{openBreaks.length > 1 ? 's' : ''} open</b><small>{rm(openBreaks.reduce((s, b) => s + b.amount, 0))} to match against acquirer credits</small></div>
                <ChevronRight className="chev" size={16} />
              </Link>
            )}
            <Link to={BASE + '/system'}>
              <span className="ic warn"><Plug aria-hidden="true" /></span>
              <div><b>WhatsApp delivery slower than usual</b><small>SMS and WhatsApp · degraded for 14 min</small></div>
              <ChevronRight className="chev" size={16} />
            </Link>
          </div>
        </Card>
      </div>

      <div className="ad-banner" role="note">
        <span className="ic"><CalendarClock aria-hidden="true" /></span>
        <div>
          <b>{num(permitsEndingSoon)} workers have a permit ending in the next 90 days</b>
          <p>Shown for information, from JIM. SCANS takes no permit action, and contributions or arrears never affect a permit.</p>
        </div>
        <button className="btn outline sm" onClick={() => go(BASE + '/workers?permit=90')}><Users /> See these workers</button>
      </div>

      <div className="grid g-2">
        <Card title="Worker payment metrics" sub={`December 2027, all ${num(REGISTERED)} registered workers`}>
          <MeterRows big items={paymentMetrics.map((m) => ({ label: m.label, share: m.value / REGISTERED, text: num(m.value) + ' workers', color: m.color }))} />
          <p className="small muted" style={{ marginTop: 16 }}>Overdue workers get reminders in their language. Arrears never lead to permit action, passport holding or travel restriction.</p>
        </Card>
        <Card title="Employer compliance" sub="Employers by share of their workers paid for December" action={<Link className="link" to={BASE + '/employers'}>Employers <ChevronRight size={14} /></Link>}>
          <Donut data={companyCompliance} center={num(companies)} centerSub="employers" size={170} format={(v, t) => `${pct(v / t)} · ${num(v)}`} />
        </Card>
      </div>

      <Card flush title={`Payment methods · ${per.sub}`} sub="Collected through the licensed acquirer straight into the FWECF account">
        <div className="table-wrap">
          <table className="data stack">
            <thead><tr><th>Method</th><th className="r">Payments</th><th className="r">Collected</th><th className="r">Share</th><th className="r">Approved</th><th>Confirmation</th><th>Status</th></tr></thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.name}>
                  <td data-label="Method"><span className="ad-method"><i className="ad-sw" style={{ background: m.color }} />{m.name}</span></td>
                  <td data-label="Payments" className="r num">{num(m.payments)}</td>
                  <td data-label="Collected" className="r num">{rm(m.collected)}</td>
                  <td data-label="Share" className="r num">{pct(m.share)}</td>
                  <td data-label="Approved" className="r num">{pct(m.success, 1)}</td>
                  <td data-label="Confirmation">{m.confirm}</td>
                  <td data-label="Status"><Status tone={m.status === 'Watch' ? 'warn' : 'ok'}>{m.status}</Status></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td data-label="Method">Total</td><td data-label="Payments" className="r num">{num(methods.reduce((s, m) => s + m.payments, 0))}</td><td data-label="Collected" className="r num">{rm(per.total)}</td><td data-label="Share" className="r num">100%</td><td data-label="Approved" className="r num">{pct(paymentSuccess, 1)}</td><td /><td /></tr></tfoot>
          </table>
        </div>
      </Card>

      <Card title="Workforce map" sub="Where registered workers are across Sabah’s 27 districts, coloured by the share of workers paid for December: green 90% or more, orange 50% to 89%, red under 50%. Ripples are payments arriving. Hover an area for its figures."
        action={<div className="chips">{[['all', 'All'], ['high', 'High arrears'], ['low', 'Low arrears']].map(([v, l]) => <button key={v} className="chip" aria-pressed={mapFilter === v} onClick={() => setMapFilter(v)}>{l}</button>)}</div>}>
        <SabahMap districts={districts} selected={sel} onSelect={setSel} filter={mapFilter} renderPanel={(d) => (
          <div className="stack" style={{ gap: 14 }}>
            <DistrictDetail d={d} />
            <button className="btn sm outline" onClick={() => go(`${BASE}/workers?district=${encodeURIComponent(d.name)}`)}><Users /> Open worker records</button>
          </div>
        )} />
      </Card>
    </>
  )
}
