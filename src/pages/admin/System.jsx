// System health: platform services, requests, connected government systems, access by role
// and today's audit trail. Data comes in under signed data-sharing agreements; nothing written
// back can change a worker's status.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gauge, CreditCard, Activity, Server, RefreshCw, ChevronRight, ShieldCheck } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Pill, Callout, Table, BarChart, useToast } from '../../components/ui.jsx'
import { num, pct } from '../../data/demo.js'
import { systems, uptime30, paymentSuccess } from '../shared/data.js'
import { useStore, logEvent } from '../shared/store.js'
import { BASE, ms, shortAxis, services, requestsToday, requestsTotal, accessByRole } from './data.js'

export default function Systems() {
  const toast = useToast()
  const audit = useStore((s) => s.audit)
  const [checking, setChecking] = useState(null)
  const check = (s) => {
    setChecking(s.name)
    setTimeout(() => { setChecking(null); logEvent('Checked connection', s.name); toast(`${s.name}: connection checked, ${s.state === 'Degraded' ? 'still slower than usual' : 'working'}`) }, 700)
  }
  const watch = services.filter((s) => s.watch)
  const today = audit.filter((a) => a.at.startsWith('17 Jun 2027')).slice(0, 8)
  return (
    <>
      <PageHead title="System health" sub="Platform services, connected systems and who can sign in. SCANS is hosted in Malaysia." />
      <div className="grid g-4 keep2">
        <Kpi hero icon={Gauge} label="Uptime, 30 days" value={pct(uptime30, 2)} note="Target 99.5%, payments 99.9%" />
        <Kpi icon={CreditCard} tone="ok" label="Payment success" value={pct(paymentSuccess, 1)} note="Today" />
        <Kpi icon={Activity} tone={watch.length ? 'warn' : 'ok'} label="Services to watch" value={num(watch.length)} note={watch.map((s) => s.name).join(', ') || 'All healthy'} />
        <Kpi icon={Server} label="Requests today" value={num(requestsTotal)} note="All apps and dashboards, to 15:00" />
      </div>

      <Card title="Services" sub="30-day uptime and response time, checked every minute">
        <div className="ad-svc">
          {services.map((s) => (
            <div className="s" key={s.name}>
              <div className="row between" style={{ gap: 8 }}><b>{s.name}</b><Status tone={s.watch ? 'warn' : 'ok'}>{s.watch ? 'Watch' : 'Healthy'}</Status></div>
              <small>Uptime <b>{pct(s.uptime, 2)}</b> · response <b>{ms(s.latency)}</b></small>
              <div className="bar" role="img" aria-label={`Uptime ${pct(s.uptime, 2)}`}><span style={{ width: Math.max(4, (s.uptime - 0.99) * 10000) + '%', background: s.watch ? 'var(--warnFill)' : 'var(--okFill)' }} /></div>
            </div>
          ))}
        </div>
      </Card>

      <div className="ad-two">
        <Card title="Requests today" sub="By hour, all apps and dashboards">
          <BarChart data={requestsToday} height={220} format={shortAxis} colors={['#1460E0']} />
        </Card>
        <Card flush title="Access by role" sub="Each party sees only what its role needs. 2-step sign-in is required for every web user.">
          <Table rows={accessByRole} rowKey={(r) => r.portal} columns={[
            { key: 'portal', label: 'Who', render: (r) => <span><b>{r.portal}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{r.note}</small></span> },
            { key: 'users', label: 'People', align: 'r', render: (r) => num(r.users) },
            { key: 'twofa', label: '2-step', render: () => <Pill tone="ok">Required</Pill> },
            { key: 'review', label: 'Last access review', render: (r) => <span className="gv-nowrap">{r.review}</span> },
          ]} />
        </Card>
      </div>

      <Card title="Connected systems" sub="Read only except payments and messages">
        <Table rows={systems} rowKey={(s) => s.name} columns={[
          { key: 'name', label: 'System', render: (s) => <span><b>{s.name}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{s.owner}</small></span> },
          { key: 'mode', label: 'Access', render: (s) => <Pill tone="grey">{s.mode}</Pill> },
          { key: 'state', label: 'Status', render: (s) => <Status>{s.state === 'Read only' ? 'Connected' : s.state}</Status> },
          { key: 'latency', label: 'Response', align: 'r', render: (s) => <span className="num gv-nowrap">{ms(s.latency)}</span> },
          { key: 'sync', label: 'Last sync', render: (s) => <span className="gv-nowrap">{s.sync}</span> },
          { key: 'uptime', label: 'Uptime', align: 'r', render: (s) => <span className="num">{pct(s.uptime, 2)}</span> },
          { key: 'note', label: 'Detail', render: (s) => <span className="small ink2">{s.records}. {s.note}</span> },
          { key: 'act', label: '', align: 'r', render: (s) => <button className="btn sm outline" disabled={checking === s.name} onClick={() => check(s)}><RefreshCw /> {checking === s.name ? 'Checking' : 'Check now'}</button> },
        ]} />
        <Callout icon={ShieldCheck} style={{ marginTop: 14 }}>JIM permit data is shown for information only. SCANS writes nothing back to SWIMS, eNORES, KDN or JIM, and nothing it does can change a worker’s permit or immigration status.</Callout>
      </Card>

      <Card flush title="Audit log, today" sub="Append-only. Every view of a worker record is logged." action={<Link className="link" to={BASE + '/audit'}>Full audit log <ChevronRight size={14} /></Link>}>
        <Table rows={today} pageSize={8} columns={[
          { key: 'at', label: 'Time', render: (a) => <span className="num">{a.at.slice(-5)}</span> },
          { key: 'who', label: 'Who' },
          { key: 'kind', label: 'Type', render: (a) => <Pill tone={{ View: 'info', Export: 'purple', Change: 'warn', System: 'grey' }[a.kind] || 'grey'}>{a.kind}</Pill> },
          { key: 'action', label: 'What', render: (a) => <b>{a.action}</b> },
          { key: 'target', label: 'Record' },
        ]} />
      </Card>
    </>
  )
}
