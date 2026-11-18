// Reports centre, shared by /admin (all reports) and /state (State reports only).
import { useState } from 'react'
import { FileText, FileSpreadsheet, Download, ShieldCheck, History } from 'lucide-react'
import { PageHead, Card, Pill, Callout, Empty, Table } from '../../components/ui.jsx'
import { reportsCatalog } from '../../data/demo.js'
import { logEvent, useStore } from './store.js'
import { useToast } from '../../components/ui.jsx'
import './shared.css'

const PERIODS = ['June 2027', 'May 2027', 'April 2027', 'Q2 2027', 'January to June 2027']

function ReportCard({ r }) {
  const toast = useToast()
  const [period, setPeriod] = useState(r.period)
  const dl = (fmt) => {
    logEvent('Downloaded report', `${r.name} · ${period} · ${fmt}`)
    toast(`${r.name}, ${period} (${fmt}) downloaded. The download is in the audit log.`)
  }
  const Icon = r.formats.includes('PDF') ? FileText : FileSpreadsheet
  return (
    <div className="card">
      <div className="gv-report">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <span className="ic"><Icon size={20} aria-hidden="true" /></span>
          <Pill tone="grey">{r.owner}</Pill>
        </div>
        <div><h3>{r.name}</h3><p>{r.desc}</p></div>
        <label>
          <span className="vh">Period for {r.name}</span>
          <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {[...new Set([r.period, ...PERIODS])].map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <div className="foot">
          {r.formats.map((f, i) => <button key={f} className={'btn sm ' + (i === 0 ? 'primary' : 'outline')} onClick={() => dl(f)}><Download /> {f}</button>)}
        </div>
      </div>
    </div>
  )
}

export function ReportsCentre({ scope }) {
  const list = scope === 'state' ? reportsCatalog.filter((r) => r.owner !== 'Microtek') : reportsCatalog
  const audit = useStore((s) => s.audit)
  const recent = audit.filter((a) => a.kind === 'Export')
  return (
    <>
      <PageHead title="Reports centre" sub={scope === 'state' ? 'Reports for the State. Figures match the dashboard and the FWECF account.' : 'Every report SCANS produces for Microtek, the State and auditors.'} />
      <Callout icon={ShieldCheck}>Every download is written to the audit log with your name, the report and the time. Reports never include wages, complaints or immigration details for employers.</Callout>
      <div className="grid g-3">
        {list.map((r) => <ReportCard key={r.id} r={r} />)}
      </div>
      <Card title="Recent exports" sub="From the audit log, newest first" action={<span className="row small muted"><History size={15} /> {recent.length} exports</span>}>
        <Table rows={recent} pageSize={6} empty={<Empty title="No exports yet">Downloads you make appear here.</Empty>} columns={[
          { key: 'at', label: 'When', render: (a) => <span className="num">{a.at}</span> },
          { key: 'who', label: 'Who' },
          { key: 'action', label: 'Export' },
          { key: 'target', label: 'Report and period' },
        ]} />
      </Card>
    </>
  )
}
