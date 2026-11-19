// Permits ending soon (/jim/permits). Information only, for planning office workload.
// Permit dates come from JIM read-only. The list is deliberately not linked to contributions:
// it shows no contribution status, and contribution status must not be used to refuse, delay or cancel a permit.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, CalendarClock, Info, Building2 } from 'lucide-react'
import { PageHead, Card, Kpi, Callout, Seg, Select, Table, HBarChart, Avatar, Pill, useToast } from '../../components/ui.jsx'
import { REGISTERED, workers, districts, employers, num } from '../../data/demo.js'
import { logEvent } from '../shared/store.js'
import { BASE, permitsWithin } from './data.js'

const WINDOWS = [{ value: '30', label: '30 days' }, { value: '60', label: '60 days' }, { value: '90', label: '90 days' }]
// JIM office that serves each district (Beaufort is served from Kota Kinabalu).
const OFFICE_FOR = { Kudat: 'Kudat', 'Kota Kinabalu': 'Kota Kinabalu', Beaufort: 'Kota Kinabalu', Sandakan: 'Sandakan', Keningau: 'Keningau', 'Lahad Datu': 'Lahad Datu', Tawau: 'Tawau', Semporna: 'Semporna' }
const scale = REGISTERED / workers.length

export default function Permits() {
  const toast = useToast()
  const go = useNavigate()
  const [win, setWin] = useState('60')
  const [district, setDistrict] = useState('All')
  const [employer, setEmployer] = useState('All')
  const days = Number(win)
  const inWindow = useMemo(() => workers.filter((w) => w.permitDays >= 0 && w.permitDays <= days), [days])
  const rows = useMemo(() => inWindow
    .filter((w) => (district === 'All' || w.district === district) && (employer === 'All' || w.employer === employer))
    .sort((a, b) => a.permitDays - b.permitDays), [inWindow, district, employer])
  const byOffice = useMemo(() => {
    const m = {}
    inWindow.forEach((w) => { const o = OFFICE_FOR[w.district]; m[o] = (m[o] || 0) + 1 })
    return Object.entries(m).map(([label, n]) => ({ label, value: Math.round(n * scale) })).sort((a, b) => b.value - a.value)
  }, [inWindow])
  const exportList = () => {
    const desc = [`within ${days} days`, district !== 'All' && district, employer !== 'All' && employer].filter(Boolean).join(', ')
    logEvent('Exported permits ending soon', `${num(rows.length)} sample records · ${desc}`)
    toast(`Permits ending ${desc} exported as CSV. The export is in the audit log.`)
  }
  return (
    <>
      <PageHead title="Permits ending soon" sub="PLKS end dates from JIM permit data, to plan counter staff and appointments at each office.">
        <button className="btn outline" onClick={exportList}><Download /> Export CSV</button>
      </PageHead>
      <Callout icon={Info}>
        <b>Information only.</b> This list is for planning office workload. It is not linked to contributions and shows no contribution status: a worker who owes contributions is treated the same as one who has paid. Exports are written to the audit log.
      </Callout>
      <div className="grid g-3 jim-keep3">
        <Kpi icon={CalendarClock} tone="bad" label="Within 30 days" value={num(permitsWithin(30))} />
        <Kpi icon={CalendarClock} tone="warn" label="Within 60 days" value={num(permitsWithin(60))} />
        <Kpi icon={CalendarClock} label="Within 90 days" value={num(permitsWithin(90))} />
      </div>
      <Card title="Permits ending" sub={`${num(rows.length)} of ${num(workers.length)} sample records end within ${days} days`}>
          <div className="stack" style={{ gap: 14 }}>
            <div className="jim-filters">
              <Seg items={WINDOWS} value={win} onChange={setWin} label="Ends within" />
              <Select label="District" value={district} onChange={setDistrict} options={[{ value: 'All', label: 'All districts' }, ...districts.map((d) => d.name)]} />
              <Select label="Employer" value={employer} onChange={setEmployer} options={[{ value: 'All', label: 'All employers' }, ...employers.map((e) => e.name)]} />
            </div>
            <Table rows={rows} pageSize={10} onRowClick={(w) => go(`${BASE}/workers/${w.id}`)} columns={[
              { key: 'name', label: 'Worker', render: (w) => <div className="who"><Avatar name={w.name} /><div style={{ minWidth: 0 }}><b>{w.name}</b><small>{w.id}</small></div></div> },
              { key: 'plks', label: 'PLKS', render: (w) => <span className="mono-id small jim-nowrap">{w.plks}</span> },
              { key: 'ends', label: 'Permit ends', render: (w) => <span className="num jim-nowrap">{w.permitExpiry}</span> },
              { key: 'left', label: 'Days left', align: 'r', render: (w) => <Pill tone={w.permitDays <= 30 ? 'bad' : w.permitDays <= 60 ? 'warn' : 'info'}>{w.permitDays} days</Pill> },
              { key: 'employer', label: 'Employer', render: (w) => <div><span>{w.employer.replace(/ (Sdn Bhd|Bhd)$/, '')}</span><small className="muted" style={{ display: 'block' }}>{w.district}</small></div> },
              { key: 'office', label: 'JIM office', render: (w) => OFFICE_FOR[w.district] + (OFFICE_FOR[w.district] !== w.district ? ` (serves ${w.district})` : '') },
            ]} />
          </div>
      </Card>
      <Card title="By JIM office" sub={`All registered workers, permits ending within ${days} days`}>
          <HBarChart data={byOffice} />
          <p className="small muted" style={{ marginTop: 14 }}><Building2 size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Scaled from the sample to all {num(REGISTERED)} registered workers. Beaufort is served from the Kota Kinabalu office.</p>
      </Card>
    </>
  )
}
