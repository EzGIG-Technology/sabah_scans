// Global announcements. Notices to workers go to the State for approval; Microtek cannot approve them.
import { useState } from 'react'
import { Users, Send, CalendarDays, Lock, Plus, Eye } from 'lucide-react'
import { PageHead, Card, Kpi, Status, SearchInput, Select, Table, useToast } from '../../components/ui.jsx'
import { num } from '../../data/demo.js'
import { useStore, logEvent, updateNotice, addNotice } from '../shared/store.js'
import { NoticeComposer, NoticeView, ChannelIcons, AudiencePill } from '../shared/Notices.jsx'

export default function Announcements() {
  const toast = useToast()
  const notices = useStore((s) => s.notices)
  const [compose, setCompose] = useState(false)
  const [view, setView] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const sent = notices.filter((n) => n.status === 'Sent')
  const reached = sent.reduce((s, n) => s + Math.round(n.recipients * n.reached), 0)
  const rows = notices.filter((n) => (status === 'All' || n.status === status) && (!q || n.title.toLowerCase().includes(q.toLowerCase())))
  const v = notices.find((n) => n.id === view)
  const submit = (n) => {
    const id = addNotice(n)
    logEvent(n.status === 'Waiting for State approval' ? 'Sent announcement to State for approval' : 'Created announcement', `${id} · ${n.title}`)
    toast(n.status === 'Waiting for State approval' ? 'Announcement sent to the State. It shows as waiting for State approval.' : `Announcement ${n.status.toLowerCase()}.`)
    setCompose(false)
  }
  const resubmit = (n) => {
    updateNotice(n.id, { status: 'Waiting for State approval', comment: undefined })
    logEvent('Sent announcement to State for approval', `${n.id} · ${n.title}`)
    toast('Sent to the State for approval')
    setView(null)
  }
  return (
    <>
      <PageHead title="Global announcements" sub="Messages to workers, employers and merchants in six languages. Notices to workers are approved by the State before sending.">
        <button className="btn primary" onClick={() => setCompose(true)}><Plus /> New announcement</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={Users} label="Recipients reached" value={num(reached)} note="Across sent announcements" />
        <Kpi icon={Send} tone="ok" label="Sent" value={num(sent.length)} />
        <Kpi icon={CalendarDays} tone="purple" label="Scheduled" value={num(notices.filter((n) => n.status === 'Scheduled').length)} />
        <Kpi icon={Lock} tone="warn" label="Waiting for State" value={num(notices.filter((n) => n.status === 'Waiting for State approval').length)} note="Only the State can approve" />
      </div>
      <Card>
        <div className="toolbar" style={{ marginBottom: 14 }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search announcements" />
          <Select label="Status" value={status} onChange={setStatus} options={[{ value: 'All', label: 'All statuses' }, 'Sent', 'Scheduled', 'Waiting for State approval', 'Returned', 'Draft']} />
        </div>
        <Table rows={rows} onRowClick={(n) => setView(n.id)} columns={[
          { key: 'title', label: 'Announcement', render: (n) => <span><b>{n.title}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{n.sub}</small></span> },
          { key: 'audience', label: 'Audience', render: (n) => <AudiencePill a={n.audience} /> },
          { key: 'channels', label: 'Channels', render: (n) => <ChannelIcons list={n.channels} /> },
          { key: 'recipients', label: 'Recipients', align: 'r', render: (n) => (n.recipients ? num(n.recipients) : '—') },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status', render: (n) => <Status tone={n.status === 'Returned' ? 'bad' : undefined}>{n.status}</Status> },
          { key: 'view', label: 'View', align: 'r', render: (n) => <button className="gv-icon-btn" aria-label={'View ' + n.title} onClick={(e) => { e.stopPropagation(); setView(n.id) }}><Eye /></button> },
        ]} />
      </Card>
      {compose && <NoticeComposer mode="admin" onClose={() => setCompose(false)} onSubmit={submit} />}
      {v && <NoticeView n={v} onClose={() => setView(null)} footer={
        v.status === 'Draft' || v.status === 'Returned'
          ? <><button className="btn outline" onClick={() => setView(null)}>Close</button><button className="btn primary" onClick={() => resubmit(v)}><Send /> Send to State for approval</button></>
          : v.status === 'Waiting for State approval'
            ? <><span className="small muted grow">Waiting for State approval. Microtek cannot approve notices.</span><button className="btn primary" onClick={() => setView(null)}>Close</button></>
            : null
      } />}
    </>
  )
}
