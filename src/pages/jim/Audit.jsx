// Audit log (/jim/audit). This portal's lookups, exports and changes, read from the shared audit log
// that Microtek and the State's auditors also see. Append-only.
import { useState } from 'react'
import { ScrollText, Eye, Download, PencilLine, ShieldCheck } from 'lucide-react'
import { PageHead, Card, Kpi, Callout, Pill, SearchInput, Select, Table, Empty, useToast } from '../../components/ui.jsx'
import { num } from '../../data/demo.js'
import { useStore, logEvent } from '../shared/store.js'
import { ACTOR } from './data.js'

const KIND_TONE = { View: 'info', Export: 'purple', Change: 'warn', 'Sign-in': 'grey', System: 'grey' }

export default function Audit() {
  const toast = useToast()
  const audit = useStore((s) => s.audit)
  const jim = audit.filter((a) => a.who.includes('(JIM'))
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('All')
  const [who, setWho] = useState('All')
  const rows = jim.filter((a) => {
    if (kind !== 'All' && a.kind !== kind) return false
    if (who === 'Me' && a.who !== ACTOR) return false
    const t = q.toLowerCase()
    return !t || (a.who + a.action + a.target).toLowerCase().includes(t)
  })
  const exportLog = () => {
    logEvent('Exported audit log extract', `JIM Sabah · ${num(rows.length)} events`)
    toast('Audit log extract exported as CSV. The export is itself logged.')
  }
  return (
    <>
      <PageHead title="Audit log" sub="Every lookup, export and change made by JIM officers in SCANS, with who did it and when.">
        <button className="btn outline" onClick={exportLog}><Download /> Export extract</button>
      </PageHead>
      <Callout icon={ShieldCheck}>Append-only. The same events are visible to Microtek and to the State’s auditors, and cannot be edited or deleted.</Callout>
      <div className="grid g-4 keep2">
        <Kpi icon={ScrollText} label="JIM events" value={num(jim.length)} note="This session and seed data" />
        <Kpi icon={Eye} label="Lookups and views" value={num(jim.filter((a) => a.kind === 'View').length)} />
        <Kpi icon={Download} tone="purple" label="Exports" value={num(jim.filter((a) => a.kind === 'Export').length)} />
        <Kpi icon={PencilLine} tone="warn" label="Answers and notices" value={num(jim.filter((a) => a.kind === 'Change').length)} />
      </div>
      <Card>
        <div className="jim-filters" style={{ marginBottom: 14 }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search officer, action or record" />
          <Select label="Type" value={kind} onChange={setKind} options={[{ value: 'All', label: 'All types' }, 'View', 'Export', 'Change', 'Sign-in']} />
          <Select label="Officer" value={who} onChange={setWho} options={[{ value: 'All', label: 'All JIM officers' }, { value: 'Me', label: 'Only me' }]} />
        </div>
        <Table rows={rows} pageSize={12} empty={<Empty title="No events match">Try another search or type.</Empty>} columns={[
          { key: 'at', label: 'When', render: (a) => <span className="num">{a.at}</span> },
          { key: 'who', label: 'Officer' },
          { key: 'kind', label: 'Type', render: (a) => <Pill tone={KIND_TONE[a.kind] || 'grey'}>{a.kind}</Pill> },
          { key: 'action', label: 'Action' },
          { key: 'target', label: 'Record or detail', render: (a) => <span className="mono-id small">{a.target}</span> },
        ]} />
      </Card>
    </>
  )
}
