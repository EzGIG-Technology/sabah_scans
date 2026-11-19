import { useState } from 'react'
import { Download, FileText, ShieldCheck, CalendarClock } from 'lucide-react'
import { PageHead, Card, Status, Table, Seg, BarChart, Donut, Callout, useToast } from '../../components/ui.jsx'
import { num } from '../../data/demo.js'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'
import { offerMonthly, JUNE_TOTAL, MONTHLY, MERCHANT } from './data.js'

const FULL = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June' }

export default function Reports() {
  const { offers, outlets, redemptions } = useMerchant()
  const toast = useToast()
  const [fmt, setFmt] = useState('PDF')
  const juneNow = offers.reduce((s, o) => s + (o.june || 0), 0)
  const monthly = MONTHLY.map((m, i, a) => (i === a.length - 1 ? { ...m, value: m.value + (juneNow - JUNE_TOTAL) } : m))
  const outletsUsed = outlets.filter((o) => o.allTime > 0).length
  const statements = monthly.map((m, i) => ({
    id: m.label,
    month: FULL[m.label] + ' 2027',
    redemptions: m.value,
    offers: offers.filter((o) => offerMonthly(o)[i].value > 0).length,
    outlets: Math.min(outletsUsed, 30 + i * 3),
    status: i === monthly.length - 1 ? 'In progress' : 'Ready',
    issued: i === monthly.length - 1 ? 'Ready on 1 Jul 2027' : `1 ${['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]} 2027`,
  })).reverse()
  const byOffer = offers.filter((o) => o.redemptions > 0).sort((a, b) => b.redemptions - a.redemptions)
  const donut = [...byOffer.slice(0, 5).map((o) => ({ label: o.title, value: o.redemptions })), { label: 'Other offers', value: byOffer.slice(5).reduce((s, o) => s + o.redemptions, 0) }].filter((d) => d.value > 0)
  // Whole-number shares that add up to 100%: the rounding difference goes to the last slice ("Other offers").
  const donutTotal = donut.reduce((s, d) => s + d.value, 0)
  const shares = donut.map((d) => Math.round((d.value / donutTotal) * 100))
  if (shares.length) shares[shares.length - 1] = 100 - shares.slice(0, -1).reduce((s, x) => s + x, 0)

  const download = (s) => toast(`Statement for ${s.month} downloaded (${fmt})`)

  return (
    <MShell title="Reports">
      <PageHead title="Reports" sub="Monthly statements of confirmed redemptions, for your own records. Counts only, never worker details.">
        <Seg label="File type" value={fmt} onChange={setFmt} items={['PDF', 'CSV']} />
      </PageHead>

      <div className="grid g-main">
        <Card title="Redemptions per month" sub="Confirmed at the counter, 2027">
          <BarChart data={monthly} highlight={monthly.length - 1} format={num} height={240} />
          <p className="small muted" style={{ marginTop: 8 }}>June is up to 17 June. {num(monthly.reduce((s, m) => s + m.value, 0))} redemptions since you joined on {MERCHANT.joined}.</p>
        </Card>
        <Card title="By offer" sub="Share of all redemptions since you joined">
          <Donut data={donut} center={num(offers.reduce((s, o) => s + o.redemptions, 0))} centerSub="redemptions" size={160} format={(v, t, i) => shares[i] + '%'} />
        </Card>
      </div>

      <Card title="Monthly statements" sub="Issued on the 1st of each month for the month before">
        <Table rows={statements} columns={[
          { key: 'month', label: 'Month', render: (s) => <div className="who"><span className="mx-outlet-ic"><FileText size={16} /></span><div><b>{s.month}</b><small>{s.issued}</small></div></div> },
          { key: 'redemptions', label: 'Redemptions', align: 'r', render: (s) => num(s.redemptions) },
          { key: 'offers', label: 'Offers running', align: 'r' },
          { key: 'outlets', label: 'Outlets with uses', align: 'r' },
          { key: 'status', label: 'Status', render: (s) => <Status tone={s.status === 'Ready' ? 'ok' : 'info'}>{s.status}</Status> },
          { key: 'dl', label: 'Download', align: 'r', render: (s) => s.status === 'Ready'
            ? <button className="btn sm outline" onClick={() => download(s)}><Download /> {fmt}</button>
            : <span className="small muted row" style={{ gap: 6, justifyContent: 'flex-end' }}><CalendarClock size={14} /> 1 Jul</span> },
        ]} />
      </Card>

      <Card title="Latest redemptions" sub="Every confirmed code, newest first" action={<button className="btn sm outline" onClick={() => toast(`Redemption list downloaded (${fmt})`)}><Download /> Download</button>}>
        <Table rows={redemptions} pageSize={8} columns={[
          { key: 'id', label: 'Redemption', render: (r) => <b>{r.id}</b> },
          { key: 'at', label: 'Time' },
          { key: 'offer', label: 'Offer' },
          { key: 'worker', label: 'SCANS ID', render: (r) => <span className="mx-mask">{r.worker}</span> },
          { key: 'outlet', label: 'Outlet' },
          { key: 'status', label: 'Status', render: (r) => <Status tone={r.status === 'Confirmed' ? 'ok' : 'warn'}>{r.status === 'Confirmed' ? 'Confirmed' : 'Waiting for counter'}</Status> },
        ]} />
      </Card>

      <Callout icon={ShieldCheck}>Statements show counts by offer and outlet. They never include names, passports, phone numbers or nationality per person, and they may not be used for advertising. SCANS does not pay merchants for perks.</Callout>
    </MShell>
  )
}
