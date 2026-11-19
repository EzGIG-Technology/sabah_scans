import { Link, useNavigate } from 'react-router-dom'
import { Users, CheckCircle2, Clock, Smartphone, AlertTriangle, ChevronRight, CalendarClock, Download, CreditCard, Info } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Callout, Table, MeterRows, LineChart, BarChart, Sparkline, Empty, useToast } from '../../components/ui.jsx'
import { perksRedemptionsByMonth, rm, num, pct } from '../../data/demo.js'
import { EmpShell, WStatus, Who } from './shell.jsx'
import { COMPANY, useRoster, summarise, paidPerMonth, useEmp, allBatches } from './data.js'

function Score({ s }) {
  const share = s.rate
  // Same scale as the State and Microtek map: good 90% and over, caution 50% to 89%, critical under 50%.
  const standing = share >= 0.9 ? 'Good standing' : share >= 0.5 ? 'Caution' : 'Critical'
  const tone = share >= 0.9 ? 'ok' : share >= 0.5 ? 'warn' : 'bad'
  return (
    <Card>
      <div className="emp-score">
        <div>
          <div className="row between wrap">
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Your compliance score</h2>
            <Status tone={tone}>{standing}</Status>
          </div>
          <p className="small muted" style={{ marginTop: 2 }}>Share of your workers who have paid for December 2027, by anyone</p>
          <div className="row" style={{ alignItems: 'baseline', gap: 12, marginTop: 14 }}>
            <span className="emp-big num" style={{ color: `var(--${tone})` }}>{pct(share, 1)}</span>
            <span className="muted">{num(s.paid)} of {num(s.total)} workers</span>
          </div>
          <div className="emp-zones" role="img" aria-label={`Score ${pct(share, 1)}. Critical under 50%, caution 50 to 89%, good 90% and over.`}>
            <div className="track" />
            <div className="fill" style={{ width: share * 100 + '%' }}><span style={{ width: 100 / share + '%' }} /></div>
            <span className="tick" style={{ left: '50%' }} /><span className="tick" style={{ left: '90%' }} />
            <span className="knob" style={{ left: share * 100 + '%' }} />
            <span className="lbl l" style={{ color: 'var(--bad)' }}>Critical under 50%</span>
            <span className="lbl mid" style={{ left: '70%', color: 'var(--warn)' }}>Caution 50 to 89%</span>
            <span className="lbl r" style={{ color: 'var(--ok)' }}>Good 90% and over</span>
          </div>
          <p className="small muted">Updated 06:00 today from payments received by the State. The score is for your information. It does not affect any worker’s permit.</p>
        </div>
        <div className="side-list">
          <div><span>Workers compliant</span><b className="num" style={{ color: 'var(--ok)' }}>{num(s.paid)} of {num(s.total)}</b></div>
          <div><span>Due this month</span><b className="num" style={{ color: 'var(--blue)' }}>{num(s.due)}</b></div>
          <div><span>1–2 months overdue</span><b className="num" style={{ color: 'var(--warn)' }}>{num(s.late)}</b></div>
          <div><span>3+ months overdue</span><b className="num" style={{ color: 'var(--bad)' }}>{num(s.risk)}</b></div>
          <Link to="/employer/workers" className="row" style={{ gap: 4, fontWeight: 600, fontSize: 13, textDecoration: 'none', marginTop: 8 }}>See every worker <ChevronRight size={15} /></Link>
        </div>
      </div>
    </Card>
  )
}

export default function Overview() {
  const roster = useRoster()
  const s = summarise(roster)
  const st = useEmp()
  const go = useNavigate()
  const toast = useToast()
  const behind = roster.filter((w) => w.bucket === 'risk' || w.bucket === 'late').sort((a, b) => b.owing - a.owing)
  const soon = roster.filter((w) => w.permitDays >= 0 && w.permitDays <= 60).sort((a, b) => a.permitDays - b.permitDays)
  const batches = allBatches(st).slice(0, 4)
  const perMonth = paidPerMonth(s.paid)
  return (
    <EmpShell title="Overview">
      <PageHead title="Good morning, Jennifer" sub={`December 2027 contributions for ${COMPANY.name}. Each worker’s payment was due by 5 December. Workers are responsible for their own contribution; you may pay for those who agreed in the app.`}>
        <button className="btn outline" onClick={() => toast('December 2027 statement downloaded')}><Download /> December statement</button>
        <Link to="/employer/pay" className="btn primary"><CreditCard /> Pay for workers</Link>
      </PageHead>

      <div className="grid g-4">
        <Kpi hero icon={Users} label="Workers on SCANS" value={num(s.total)} note="From eNORES, synced 06:00 today">
          <div style={{ marginTop: 6 }}><Sparkline values={perMonth.map((p) => p.value)} /></div>
        </Kpi>
        <Kpi icon={CheckCircle2} tone="ok" label="Paid for December" value={num(s.paid)} note={`${pct(s.rate)} of your workers`} delta={`+${s.paid - 366} on November`} />
        <Kpi icon={Clock} tone="warn" label="Not paid yet" value={num(s.unpaid)} note={`${rm(s.owing)} owing in total`} />
        <Kpi icon={Smartphone} tone="purple" label="Using the SCANS app" value={num(COMPANY.appUsers)} note={`${pct(COMPANY.appUsers / s.total)} of your workers`} />
      </div>

      <Score s={s} />

      {behind.length > 0 ? (
        <Card>
          <div className="emp-risk">
            <span className="ic"><AlertTriangle size={22} /></span>
            <div className="grow">
              <h3>{behind.length} {behind.length === 1 ? 'worker owes' : 'workers owe'} earlier months</h3>
              <div className="pills">
                <span className="pill warn num">{s.late} owe 1 to 2 months</span>
                <span className="pill bad num">{s.risk} owe 3 months or more</span>
              </div>
              <p>Late payment never affects a permit. You can pay for a worker only if they agreed in the app.</p>
            </div>
            <Link to="/employer/workers?tab=Not+paid" className="btn sm outline">All workers who owe <ChevronRight /></Link>
          </div>
          <div style={{ marginTop: 14 }}>
            <Table rows={behind} pageSize={6} onRowClick={(w) => go('/employer/workers/' + w.id)} columns={[
              { key: 'name', label: 'Worker', render: (w) => <Who w={w} /> },
              { key: 'status', label: 'Status', render: (w) => <WStatus w={w} /> },
              { key: 'paidThrough', label: 'Paid up to' },
              { key: 'permit', label: 'Permit valid until', render: (w) => <span className="muted">{w.permitExpiry}</span> },
              { key: 'owing', label: 'Owing', align: 'r', render: (w) => <b className="num" style={{ color: w.bucket === 'risk' ? 'var(--bad)' : 'var(--warn)' }}>{rm(w.owing)}</b> },
              { key: 'act', label: 'Action', align: 'r', render: (w) => w.consent
                ? <button className="btn sm primary" onClick={(e) => { e.stopPropagation(); go('/employer/pay?w=' + w.id) }}>Pay now</button>
                : <span className="small muted" title="This worker has not agreed to employer payment in the app">No consent</span> },
            ]} />
          </div>
        </Card>
      ) : (
        <Callout tone="ok" icon={CheckCircle2}>No worker owes any month before December.</Callout>
      )}

      <div className="grid g-2">
        <Card title="Worker payment metrics" sub={`All ${num(s.total)} workers, December 2027`}>
          <MeterRows big items={[
            { label: 'Paid for December', text: `${num(s.paid)} workers`, share: s.paid / s.total, color: 'linear-gradient(90deg,#0E9F6E,#17B26A)' },
            { label: 'Due this month', text: `${num(s.due)} workers`, share: s.due / s.total, color: 'var(--gradBtn)' },
            { label: '1–2 months overdue', text: `${num(s.late)} workers`, share: s.late / s.total, color: 'linear-gradient(90deg,#FF8A1F,#FFB020)' },
            { label: '3+ months overdue', text: `${num(s.risk)} workers`, share: s.risk / s.total, color: 'linear-gradient(90deg,#D42253,#F0436A)' },
          ]} />
        </Card>
        <Card title="Perks used by your workers" sub="Offers confirmed by partner shops each month"
          action={<div style={{ textAlign: 'right' }}><b className="num" style={{ fontSize: 22, fontWeight: 700 }}>{num(perksRedemptionsByMonth.reduce((a, b) => a + b.value, 0))}</b><div className="small muted">this year</div></div>}>
          <LineChart data={perksRedemptionsByMonth} height={210} format={(v) => num(Math.round(v))} />
        </Card>
      </div>

      <div className="grid g-main">
        <Card title="Workers paid each month" sub={`Out of ${num(s.total)} workers, 2027`}>
          <BarChart data={perMonth} highlight={5} format={(v) => num(Math.round(v))} height={300} />
        </Card>
        <Card title="Permits ending within 60 days" sub="For your renewal planning only">
          <Callout icon={Info} style={{ marginBottom: 12 }}>Permit dates come from JIM and are shown for planning. They have nothing to do with contributions, and SCANS takes no action on permits.</Callout>
          {soon.length === 0 ? <Empty icon={CalendarClock} title="No permits end in the next 60 days" /> : (
            <div className="feed">
              {soon.map((w) => (
                <Link key={w.id} to={'/employer/workers/' + w.id} className="it" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="ic"><CalendarClock /></span>
                  <div className="grow"><b>{w.name}</b><span>{w.role} · ends {w.permitExpiry}</span></div>
                  <div className="amt"><span className="pill warn">{w.permitDays} days</span></div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent batch payments" sub="Paid by the company for workers who agreed" action={<Link to="/employer/statements" className="link">All statements <ChevronRight size={15} /></Link>}>
        <Table rows={batches} pageSize={4} onRowClick={() => go('/employer/statements')} columns={[
          { key: 'id', label: 'Batch', render: (b) => <b className="num">{b.id}</b> },
          { key: 'date', label: 'Date' },
          { key: 'workers', label: 'Workers', align: 'r', render: (b) => num(b.workers) },
          { key: 'months', label: 'Months', align: 'r' },
          { key: 'method', label: 'Paid with' },
          { key: 'amount', label: 'Amount', align: 'r', render: (b) => <b className="num">{rm(b.amount, 2)}</b> },
          { key: 'status', label: 'Status', render: (b) => <Status>{b.status}</Status> },
        ]} />
      </Card>
    </EmpShell>
  )
}
