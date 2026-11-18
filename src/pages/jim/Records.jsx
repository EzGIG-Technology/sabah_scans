// Record matching (/jim/records). Where a SCANS record and a JIM permit record disagree (name spelling,
// renewed passport, changed employer, date of birth), a JIM officer says which value is correct.
// "JIM value is correct" sends a correction to Microtek for review; nothing JIM confirms here changes a
// worker's permit, immigration status or contribution status. Every view and decision is logged.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitCompareArrows, CheckCircle2, Send, Clock, ShieldCheck, Building2, MapPin, ExternalLink } from 'lucide-react'
import { PageHead, Card, Kpi, Callout, Tabs, Table, Drawer, Field, Status, Pill, SearchInput, Select, Avatar, Empty, useToast } from '../../components/ui.jsx'
import { findWorker, districts, num } from '../../data/demo.js'
import { logEvent, addApproval } from '../shared/store.js'
import { BASE, ACTOR, JIM_WAITING, useJim, decideMatch, stampNow } from './data.js'

const CHOICES = [
  { value: 'JIM value is correct', note: 'The SCANS record is corrected after Microtek checks it.' },
  { value: 'SCANS value is correct', note: 'Nothing changes in SCANS. JIM updates its own file if needed.' },
  { value: 'Needs a check at the office', note: 'The record stays waiting until the worker or employer brings the document to a JIM office.' },
]
const FIELDS = ['Name spelling', 'Passport number', 'Employer', 'Date of birth']
const ageText = (d) => (d === 1 ? '1 day' : `${d} days`)

export default function Records() {
  const toast = useToast()
  const matches = useJim((s) => s.matches)
  const [tab, setTab] = useState('Waiting')
  const [open, setOpen] = useState(null)
  const [q, setQ] = useState('')
  const [field, setField] = useState('All')
  const [district, setDistrict] = useState('All')
  const counts = { Waiting: 0, Confirmed: 0, 'Sent to Microtek': 0 }
  matches.forEach((m) => { counts[m.status] += 1 })
  const decided = counts.Confirmed + counts['Sent to Microtek']
  const rows = useMemo(() => matches.filter((m) => {
    if (m.status !== tab) return false
    if (field !== 'All' && m.field !== field) return false
    if (district !== 'All' && m.district !== district) return false
    const t = q.trim().toLowerCase()
    return !t || (m.name + m.workerId + m.scans + m.jim).toLowerCase().includes(t)
  }), [matches, tab, field, district, q])
  const m = matches.find((x) => x.id === open)

  const openRow = (r) => { setOpen(r.id); logEvent('Viewed record mismatch', `${r.workerId} · ${r.field}`) }
  const decide = (choice, remark) => {
    const at = stampNow()
    if (choice === 'JIM value is correct') {
      decideMatch(m.id, { status: 'Sent to Microtek', decision: choice, remark, by: ACTOR, at, officeCheck: false })
      addApproval({ type: 'Record mismatch', name: m.name, detail: `${m.field}: “${m.scans}” to “${m.jim}” · confirmed by JIM Sabah`, workerId: m.workerId })
      logEvent('Confirmed JIM value, sent correction to Microtek', `${m.workerId} · ${m.field}`)
      toast(`Sent to Microtek for review. ${m.name}’s permit and contribution status do not change.`)
      setTab('Sent to Microtek')
    } else if (choice === 'SCANS value is correct') {
      decideMatch(m.id, { status: 'Confirmed', decision: choice, remark, by: ACTOR, at, officeCheck: false })
      logEvent('Confirmed SCANS value is correct', `${m.workerId} · ${m.field}`)
      toast(`Confirmed. The SCANS record for ${m.name} stays as it is.`)
      setTab('Confirmed')
    } else {
      decideMatch(m.id, { decision: choice, remark, by: ACTOR, at, officeCheck: true })
      logEvent('Asked for a check at a JIM office', `${m.workerId} · ${m.field}`)
      toast(`Marked for a check at the office. ${m.name}’s record stays waiting.`)
    }
    setOpen(null)
  }

  return (
    <>
      <PageHead title="Record matching" sub="Records where SCANS and JIM permit data disagree. Say which value is correct; corrections to SCANS go to Microtek for review." />
      <Callout icon={ShieldCheck}>
        Your answer only fixes a detail on the record. It never changes a worker’s permit, immigration status or contribution status, and nothing is written back to JIM. Each record you open and each answer is written to the audit log.
      </Callout>
      <div className="grid g-4 keep2">
        <Kpi icon={GitCompareArrows} tone="warn" label="Waiting in all of Sabah" value={num(JIM_WAITING - decided)} note="SCANS and JIM disagree on a detail" />
        <Kpi icon={Clock} label="Waiting in this sample" value={num(counts.Waiting)} note={`${matches.filter((x) => x.status === 'Waiting' && x.officeCheck).length} need a check at the office`} />
        <Kpi icon={CheckCircle2} tone="ok" label="SCANS value confirmed" value={num(counts.Confirmed)} note="No change to SCANS" />
        <Kpi icon={Send} tone="purple" label="Sent to Microtek" value={num(counts['Sent to Microtek'])} note="Correction waiting for review" />
      </div>
      <Card>
        <Tabs items={[
          { value: 'Waiting', label: 'Waiting', count: counts.Waiting },
          { value: 'Confirmed', label: 'Confirmed', count: counts.Confirmed },
          { value: 'Sent to Microtek', label: 'Sent to Microtek', count: counts['Sent to Microtek'] },
        ]} value={tab} onChange={setTab} label="Record matching" />
        <div className="stack" style={{ gap: 14, paddingTop: 16 }}>
          <div className="jim-filters">
            <SearchInput value={q} onChange={setQ} placeholder="Search name, SCANS ID or value" />
            <Select label="Detail" value={field} onChange={setField} options={[{ value: 'All', label: 'All details' }, ...FIELDS]} />
            <Select label="District" value={district} onChange={setDistrict} options={[{ value: 'All', label: 'All districts' }, ...districts.map((d) => d.name)]} />
          </div>
          <Table rows={rows} pageSize={8} onRowClick={openRow}
            empty={<Empty icon={CheckCircle2} title={tab === 'Waiting' ? 'Nothing waiting' : 'Nothing here yet'}>{tab === 'Waiting' ? 'Every record in this sample has an answer.' : 'Records you answer appear here.'}</Empty>}
            columns={[
              { key: 'name', label: 'Worker', render: (r) => <div className="who"><Avatar name={r.name} /><div style={{ minWidth: 0 }}><b>{r.name}</b><small>{r.workerId}</small></div></div> },
              { key: 'field', label: 'Detail', render: (r) => <span>{r.field}{r.why && <small className="muted" style={{ display: 'block', fontSize: 12 }}>{r.why}</small>}</span> },
              { key: 'scans', label: 'SCANS value', render: (r) => <span className="jim-val">{r.scans}</span> },
              { key: 'jim', label: 'JIM value', render: (r) => <span className="jim-val jim">{r.jim}</span> },
              { key: 'source', label: 'SCANS value from' },
              { key: 'age', label: tab === 'Waiting' ? 'Waiting' : 'Answered', render: (r) => (tab === 'Waiting' ? <span className="num">{ageText(r.age)}</span> : <span className="num small">{r.at}</span>) },
              { key: 'status', label: 'Status', render: (r) => (r.officeCheck && r.status === 'Waiting' ? <Pill tone="purple">Office check</Pill> : <Status tone={r.status === 'Waiting' ? 'warn' : r.status === 'Confirmed' ? 'ok' : 'info'}>{r.status}</Status>) },
            ]} />
        </div>
      </Card>
      {m && <CompareDrawer m={m} onClose={() => setOpen(null)} onDecide={decide} />}
    </>
  )
}

function CompareDrawer({ m, onClose, onDecide }) {
  const w = findWorker(m.workerId)
  const [choice, setChoice] = useState(m.status === 'Waiting' ? (m.officeCheck ? 'Needs a check at the office' : '') : m.decision)
  const [remark, setRemark] = useState(m.status === 'Waiting' && !m.officeCheck ? '' : m.remark)
  const [tried, setTried] = useState(false)
  const done = m.status !== 'Waiting'
  const ok = choice && remark.trim().length >= 5
  const submit = () => { setTried(true); if (ok) onDecide(choice, remark.trim()) }
  return (
    <Drawer title={m.field} sub={`${m.id} · ${m.name} · ${m.workerId}`} onClose={onClose}
      footer={done
        ? <button className="btn primary" onClick={onClose}>Close</button>
        : <><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={submit}><CheckCircle2 /> Save answer</button></>}>
      <div className="row wrap" style={{ gap: 8 }}>
        <Status tone={m.status === 'Waiting' ? 'warn' : m.status === 'Confirmed' ? 'ok' : 'info'}>{m.status}</Status>
        {m.why && <Pill tone="grey">{m.why}</Pill>}
        <span className="small muted">Waiting {ageText(m.age)}</span>
      </div>
      <div className="jim-compare">
        <div>
          <small>SCANS record</small>
          <b>{m.scans}</b>
          <span>From {m.source}</span>
        </div>
        <div className="jim">
          <small>JIM permit record</small>
          <b>{m.jim}</b>
          <span>From JIM permit data, read-only</span>
        </div>
      </div>
      {w && (
        <dl className="kv">
          <div><dt>PLKS number</dt><dd className="mono-id">{w.plks}</dd></div>
          <div><dt>Permit expiry</dt><dd>{w.permitExpiry}</dd></div>
          <div><dt><Building2 size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Employer on SCANS</dt><dd>{w.employer}</dd></div>
          <div><dt><MapPin size={12} style={{ display: 'inline', verticalAlign: -1 }} /> District</dt><dd>{w.district}</dd></div>
        </dl>
      )}
      {w && <Link className="st-link" to={`${BASE}/workers/${w.id}`}><ExternalLink size={13} style={{ display: 'inline', verticalAlign: -2 }} /> View record</Link>}
      {done ? (
        <div className="gv-kv-card small">
          <b>{m.decision}</b><br />
          {m.remark}<br />
          <span className="muted">{m.by} · {m.at}</span>
        </div>
      ) : (
        <>
          <div className="field">
            <span>Which value is correct?</span>
            <div className="gv-opts" role="radiogroup" aria-label="Which value is correct?">
              {CHOICES.map((c) => (
                <button key={c.value} type="button" className="option jim-choice" role="radio" aria-checked={choice === c.value} onClick={() => setChoice(c.value)}>
                  <span className="radio" />
                  <span><b>{c.value}</b><small>{c.note}</small></span>
                </button>
              ))}
            </div>
            {tried && !choice && <small className="error">Choose which value is correct.</small>}
          </div>
          <Field label="Remark" hint="At least 5 characters. Microtek and the State’s auditors can read this." error={tried && remark.trim().length < 5 ? 'Add a short remark, for example which document you checked.' : null}>
            <textarea className={'input' + (tried && remark.trim().length < 5 ? ' err' : '')} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="For example: renewed passport seen at the counter" />
          </Field>
        </>
      )}
    </Drawer>
  )
}
