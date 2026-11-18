// Audit log: every view, export and change, append-only.
import { useState } from 'react'
import { ScrollText, Eye, Download, PencilLine } from 'lucide-react'
import { PageHead, Card, Kpi, Pill, SearchInput, Select, Table, useToast } from '../../components/ui.jsx'
import { num } from '../../data/demo.js'
import { useStore, logEvent } from '../shared/store.js'

export default function AuditLog() {
  const toast = useToast()
  const audit = useStore((s) => s.audit)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('All')
  const [org, setOrg] = useState('All')
  const rows = audit.filter((a) => {
    if (kind !== 'All' && a.kind !== kind) return false
    if (org === 'Microtek' && !a.who.includes('Microtek')) return false
    if (org === 'State' && !a.who.includes('State')) return false
    if (org === 'JIM' && !a.who.includes('(JIM')) return false
    if (org === 'System' && a.who !== 'System') return false
    const t = q.toLowerCase()
    return !t || (a.who + a.action + a.target).toLowerCase().includes(t)
  })
  return (
    <>
      <PageHead title="Audit log" sub="Every view, export and change in SCANS, with who did it and when. Append-only: kept for the State’s auditors and cannot be edited.">
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
          <Select label="Type" value={kind} onChange={setKind} options={[{ value: 'All', label: 'All types' }, 'View', 'Export', 'Change', 'Sign-in', 'System']} />
          <Select label="Organisation" value={org} onChange={setOrg} options={[{ value: 'All', label: 'Everyone' }, 'Microtek', 'State', { value: 'JIM', label: 'JIM Sabah' }, 'System']} />
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
