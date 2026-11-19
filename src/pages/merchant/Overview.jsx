import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag, Hourglass, Trophy, ScanLine, Plus, CheckCircle2, Clock, ChevronRight, ShieldCheck, EyeOff, Check, X } from 'lucide-react'
import { PageHead, Card, Kpi, BarChart, HBarChart, LineChart, Donut, Sparkline, Status, Seg, useLivePayments } from '../../components/ui.jsx'
import { merchantPeakHours, merchantRedeemers, num, pct } from '../../data/demo.js'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'
import { MERCHANT, JUNE_TOTAL, MONTHLY, peakIndex, juneDaily } from './data.js'

export default function Overview() {
  const { offers, redemptions } = useMerchant()
  const [span, setSpan] = useState('month')
  const live = offers.filter((o) => o.status === 'Live')
  const waiting = offers.filter((o) => o.status === 'Waiting for approval')
  const allTime = offers.reduce((s, o) => s + o.redemptions, 0)
  const june = offers.reduce((s, o) => s + (o.june || 0), 0)
  const liveR = Math.floor(useLivePayments() / 3) // redemptions confirmed at counters since the page opened
  const top = [...offers].sort((a, b) => b.redemptions - a.redemptions)[0]
  const perf = [...live].sort((a, b) => b.june - a.june).map((o) => ({ label: o.title, value: o.june }))
  const peak = peakIndex(merchantPeakHours)
  const confirmed = redemptions.filter((r) => r.status === 'Confirmed').slice(0, 6)
  const pending = redemptions.filter((r) => r.status !== 'Confirmed')
  const may = MONTHLY[MONTHLY.length - 2].value
  const endingSoon = live.filter((o) => o.ends.includes('Dec 2027')).length
  const monthly = MONTHLY.map((m, i, a) => (i === a.length - 1 ? { ...m, value: m.value + (june - JUNE_TOTAL) } : m))

  return (
    <MShell title="Dashboard">
      <PageHead title="Good evening, Mei Ling" sub="How your SCANS perks are doing in December 2027. You see counts and shares only, never who a worker is.">
        <Link className="btn outline" to="/merchant/offers/new"><Plus /> New offer</Link>
        <Link className="btn primary" to="/merchant/redeem"><ScanLine /> Confirm a redemption</Link>
      </PageHead>

      <div className="grid g-4">
        <Kpi hero icon={CheckCircle2} label="Redemptions all time" value={num(allTime + liveR)} note={`${num(june + liveR)} in December so far`} delta={'+' + pct(june / may - 1, 0) + ' on November'}>
          <div style={{ marginTop: 6 }}><Sparkline values={monthly.map((m) => m.value)} /></div>
        </Kpi>
        <Kpi icon={Tag} label="Active offers" value={num(live.length)} note={endingSoon ? `${endingSoon} ends on 30 Dec` : 'Live in the worker app'} />
        <Kpi icon={Hourglass} tone="warn" label="Waiting for approval" value={num(waiting.length)} note={waiting[0] ? `With Microtek since ${waiting[0].submitted}` : 'Nothing waiting'} />
        <div className="card">
          <div className="kpi">
            <div className="k-top"><span className="k-ic ok"><Trophy aria-hidden="true" /></span><span>Top offer</span></div>
            <Link to={'/merchant/offers/' + top.id} className="mx-top-offer">{top.title}</Link>
            <div className="k-note"><span className="delta">{num(top.redemptions)} redemptions</span>{pct(top.redemptions / top.views)} of views</div>
          </div>
        </div>
      </div>

      <div className="grid g-main">
        <Card title="Offer performance this month" sub="Confirmed redemptions, 1 to 17 December 2027" action={<Link className="link" to="/merchant/offers">All offers <ChevronRight size={15} /></Link>}>
          <HBarChart data={perf} />
          <p className="small muted" style={{ marginTop: 14 }}>{num(june)} redemptions across {live.length} live offers. Counts include only codes your staff confirmed at the counter.</p>
        </Card>
        <Card title="Redeemers by nationality" sub="Share of everyone who used one of your perks this year. Sample data">
          <Donut data={merchantRedeemers} center={pct(merchantRedeemers[0].value)} centerSub={merchantRedeemers[0].label} size={168} />
          <div className="mx-privacy-line"><EyeOff size={15} aria-hidden="true" />Totals only. Groups under 50 people are joined into Others.</div>
        </Card>
      </div>

      <div className="grid g-2">
        <Card title="Peak redemption hours" sub="Average confirmed redemptions per hour, December" action={<span className="pill info"><Clock size={13} /> Busiest {merchantPeakHours[peak - 1].label} to {merchantPeakHours[peak + 1].label}</span>}>
          <BarChart data={merchantPeakHours.map((h) => ({ ...h, label: h.label.replace('am', 'a').replace('pm', 'p') }))} highlight={peak} height={230} format={num} />
          <p className="small muted" style={{ marginTop: 8 }}>Most workers come after their shift. Keep a second till open from 7pm.</p>
        </Card>
        <Card title="Redemptions over time" sub={span === 'month' ? 'Confirmed redemptions per month, 2027' : 'Confirmed redemptions per day, December 2027'}
          action={<Seg label="Show" value={span} onChange={setSpan} items={[{ value: 'month', label: 'Monthly' }, { value: 'day', label: 'Daily' }]} />}>
          {span === 'month' ? <LineChart data={monthly} height={230} format={num} /> : <BarChart data={juneDaily(june)} height={230} format={num} />}
          <p className="small muted" style={{ marginTop: 8 }}>{span === 'month' ? 'December is up to 17 December. ' : `${num(june)} in December so far. Busier at weekends. `}<Link className="link" to="/merchant/reports">Reports</Link></p>
        </Card>
      </div>

      <div className="grid g-main">
        <Card title="Recent confirmed redemptions" sub="Workers are shown by the last digits of their SCANS ID only" action={<Link className="link" to="/merchant/reports">See all <ChevronRight size={15} /></Link>}>
          <div className="feed">
            {confirmed.map((r) => (
              <div className={'it' + (r.fresh ? ' mx-fresh' : '')} key={r.id}>
                <span className="ic ok"><CheckCircle2 /></span>
                <div className="grow">
                  <b>{r.offer}</b>
                  <span><span className="mx-mask">{r.worker}</span> · {r.outlet}</span>
                </div>
                <div className="amt"><Status>Confirmed</Status><span style={{ display: 'block', marginTop: 4 }}>{r.at.slice(-5)}</span></div>
              </div>
            ))}
          </div>
          {pending.length > 0 && (
            <div className="mx-pending">
              <Clock size={16} aria-hidden="true" />
              <span>{pending.length} code shown at {pending[0].outlet} is waiting for the counter to confirm. It does not count until it is confirmed.</span>
            </div>
          )}
        </Card>
        <div className="stack">
          <section className="card navy mx-quick">
            <span className="mx-quick-ic"><ScanLine aria-hidden="true" /></span>
            <h2>Confirm a redemption</h2>
            <p>The worker shows a 6-digit code in the SCANS app. Type it in, check the offer and confirm. Then it counts as used.</p>
            <Link to="/merchant/redeem" className="btn white">Open counter screen <ChevronRight /></Link>
          </section>
          <Card title="What you can see" sub={`${MERCHANT.name} and every partner shop`}>
            <ul className="mx-cansee">
              <li><Check aria-hidden="true" className="yes" />Masked SCANS ID, for example SCN26W•••7218</li>
              <li><Check aria-hidden="true" className="yes" />Contribution status: up to date</li>
              <li><Check aria-hidden="true" className="yes" />Counts and shares for your offers</li>
              <li><X aria-hidden="true" className="no" />Names, passports, phone numbers or employers</li>
              <li><X aria-hidden="true" className="no" />Any use of worker data for advertising</li>
            </ul>
            <div className="mx-privacy-line"><ShieldCheck size={15} aria-hidden="true" />Set by the State under PDPA. Every view is logged.</div>
          </Card>
        </div>
      </div>
    </MShell>
  )
}
