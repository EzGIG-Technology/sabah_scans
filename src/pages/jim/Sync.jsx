// JIM data link (/jim/sync). Permit data flows from JIM into SCANS read-only, for display and for
// matching records. Nothing is written back to JIM and nothing received changes a worker's status.
import { useEffect, useRef, useState } from 'react'
import { RefreshCw, DatabaseZap, Inbox, PencilLine, AlertTriangle, CalendarClock, ShieldCheck, ArrowRight, Link2, Check, Send } from 'lucide-react'
import { PageHead, Card, Kpi, Callout, Table, Status, Pill, useToast } from '../../components/ui.jsx'
import { num } from '../../data/demo.js'
import { logEvent } from '../shared/store.js'
import { useJim, addRun, stampNow, OFFICERS } from './data.js'

const STEPS = ['Connecting to JIM', 'Receiving permit records', 'Matching to SCANS records', 'Finished']
const FIELDS = [
  ['PLKS number', 'Shown on the record and used to match'],
  ['Permit expiry date', 'Shown for information, never linked to contributions'],
  ['Passport number', 'Used to match; differences go to record matching'],
  ['Name as on the permit', 'Used to match; differences go to record matching'],
  ['Employer on the permit', 'Used to match; differences go to record matching'],
]

export default function Sync() {
  const toast = useToast()
  const runs = useJim((s) => s.runs)
  const [progress, setProgress] = useState(null)
  const [officers, setOfficers] = useState(OFFICERS)
  const timer = useRef(null)
  useEffect(() => () => clearInterval(timer.current), [])
  const today = runs.filter((r) => r.at.startsWith('17 Jun'))
  const sum = (k) => today.reduce((s, r) => s + r[k], 0)
  const last = runs[0]

  const runNow = () => {
    setProgress(0)
    logEvent('Started JIM permit data sync', 'Run by an officer')
    timer.current = setInterval(() => {
      setProgress((p) => {
        const n = Math.min(100, p + 5)
        if (n >= 100) {
          clearInterval(timer.current)
          setTimeout(() => {
            addRun({ at: stampNow(), kind: 'Run by an officer', received: 168, updated: 29, failed: 0, took: '41 s', status: 'Completed' })
            logEvent('Finished JIM permit data sync', '168 records received, 29 updated, 0 failed')
            toast('Sync finished: 168 permit records received, 29 updated, 0 failed.')
            setProgress(null)
          }, 400)
        }
        return n
      })
    }, 110)
  }
  const step = progress == null ? -1 : progress < 15 ? 0 : progress < 70 ? 1 : progress < 100 ? 2 : 3
  const sendLink = (o) => {
    setOfficers(officers.map((x) => (x.jimId === o.jimId ? { ...x, status: 'Link sent' } : x)))
    logEvent('Sent account link request', `${o.name} · ${o.jimId}`)
    toast(`Link request sent to ${o.name}. They confirm it with their JIM staff ID and a 2-step code.`)
  }

  return (
    <>
      <PageHead title="JIM data link" sub="Permit data from JIM comes into SCANS twice a day, at 06:00 and 18:00. You can also run it now.">
        <button className="btn primary" onClick={runNow} disabled={progress != null}><RefreshCw className={progress != null ? 'st-spin' : ''} /> {progress != null ? 'Running…' : 'Run sync now'}</button>
      </PageHead>
      <Callout icon={ShieldCheck}>
        One way only: JIM to SCANS, read-only. SCANS uses permit data to show expiry dates and to match records. Nothing is written back to JIM, and nothing received changes a worker’s permit, immigration status or contribution status. Each run is written to the audit log.
      </Callout>

      <div className="card jim-link">
        <div className="jim-link-ends">
          <span className="jim-node"><img src="/img/logos/imigresen.png" alt="" /><b>JIM permit data</b><small>Jabatan Imigresen Malaysia</small></span>
          <span className="jim-arrow" aria-hidden="true"><ArrowRight /></span>
          <span className="jim-node"><img src="/favicon.png" alt="" /><b>SCANS</b><small>Read-only copy for display</small></span>
        </div>
        <div className="jim-link-state">
          <Status tone="ok">Connected</Status>
          <span className="small muted">Last run {last.at} · {last.status}</span>
          {progress != null && (
            <div className="jim-progress" aria-live="polite">
              <div className="row between small"><b>{STEPS[step]}</b><span className="num">{progress}%</span></div>
              <div className="bar"><span style={{ width: progress + '%' }} /></div>
              <ol className="jim-steps">{STEPS.slice(0, 3).map((s, i) => <li key={s} className={i < step ? 'done' : i === step ? 'on' : ''}>{i < step ? <Check aria-hidden="true" /> : <span>{i + 1}</span>}{s}</li>)}</ol>
            </div>
          )}
        </div>
      </div>

      <div className="grid g-4 keep2">
        <Kpi icon={Inbox} label="Records received today" value={num(sum('received'))} note={`${today.length} run${today.length === 1 ? '' : 's'} today`} />
        <Kpi icon={PencilLine} tone="ok" label="Records updated today" value={num(sum('updated'))} note="New expiry dates and renewals" />
        <Kpi icon={AlertTriangle} tone={sum('failed') ? 'bad' : 'ok'} label="Failed today" value={num(sum('failed'))} note="Retried at the next run" />
        <Kpi icon={CalendarClock} tone="purple" label="Next scheduled run" value="18:00" note="Today, then 06:00 tomorrow" />
      </div>

      <Card title="Last runs" sub="Newest first">
          <Table rows={runs} pageSize={8} columns={[
            { key: 'at', label: 'Started', render: (r) => <span><b className="num jim-nowrap">{r.at}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{r.id}</small></span> },
            { key: 'kind', label: 'How' },
            { key: 'received', label: 'Received', align: 'r', render: (r) => num(r.received) },
            { key: 'updated', label: 'Updated', align: 'r', render: (r) => num(r.updated) },
            { key: 'failed', label: 'Failed', align: 'r', render: (r) => (r.failed ? <Pill tone="warn">{r.failed}</Pill> : '0') },
            { key: 'took', label: 'Took', render: (r) => <span className="num">{r.took}</span> },
            { key: 'status', label: 'Result', render: (r) => <Status tone={r.failed ? 'warn' : 'ok'}>{r.status}</Status> },
          ]} />
          <p className="small muted" style={{ marginTop: 10 }}>Failed records are usually a PLKS number JIM has not issued yet. They are retried at the next run.</p>
      </Card>
      <Card title="What comes in" sub="The only fields SCANS reads from JIM">
        <div className="jim-fields">
          {FIELDS.map(([f, d]) => (
            <div key={f} className="jim-field"><span className="ic"><DatabaseZap aria-hidden="true" /></span><div><b>{f}</b><small>{d}</small></div></div>
          ))}
        </div>
      </Card>

      <Card title="Officer accounts" sub="SCANS accounts for JIM officers, linked to their JIM staff ID. 2-step sign-in is required for every account.">
        <Table rows={officers} rowKey={(o) => o.jimId} pageSize={10} columns={[
          { key: 'name', label: 'Officer', render: (o) => <span><b>{o.name}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{o.role}</small></span> },
          { key: 'jimId', label: 'JIM staff ID', render: (o) => <span className="mono-id">{o.jimId}</span> },
          { key: 'office', label: 'Office' },
          { key: 'twoStep', label: '2-step sign-in', render: (o) => (o.twoStep ? <Status tone="ok">On</Status> : <Status tone="warn">Not set up</Status>) },
          { key: 'last', label: 'Last sign-in' },
          { key: 'status', label: 'Account', render: (o) => (o.status === 'Waiting for link'
            ? <button className="btn sm outline" onClick={() => sendLink(o)}><Send /> Send link request</button>
            : <Status tone={o.status === 'Linked' ? 'ok' : 'info'}>{o.status}</Status>) },
        ]} />
        <p className="small muted" style={{ marginTop: 10 }}><Link2 size={13} style={{ display: 'inline', verticalAlign: -2 }} /> An account works only after it is linked to a JIM staff ID and 2-step sign-in is set up.</p>
      </Card>
    </>
  )
}
