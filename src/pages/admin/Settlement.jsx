// Settlement: how each day's contributions reach the FWECF account, daily reconciliation,
// open breaks and the operator share invoiced to the State. SCANS never holds funds.
import { useState } from 'react'
import { Landmark, PiggyBank, Wallet, Scale, Check, FileText, ShieldCheck } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Callout, Field, Table, Modal, useToast } from '../../components/ui.jsx'
import { rm, num } from '../../data/demo.js'
import { logEvent } from '../shared/store.js'
import { settlements, operatorInvoices } from './data.js'
import { useAdmin, updateBreak } from './store.js'

const settlementsTotal = (list) => list.reduce((t, s) => ({
  gross: t.gross + s.gross, receipts: t.receipts + s.receipts, state: t.state + s.state, operator: t.operator + s.operator,
  reconciled: t.reconciled + (s.status === 'Pending' ? 0 : 1),
}), { gross: 0, receipts: 0, state: 0, operator: 0, reconciled: 0 })

export default function Settlement() {
  const toast = useToast()
  const breaks = useAdmin((s) => s.breaks)
  const settled = settlements.filter((s) => s.status !== 'Pending')
  const [day, setDay] = useState(settled[settled.length - 1].id)
  const [resolve, setResolve] = useState(null)
  const [note, setNote] = useState('')
  const d = settlements.find((s) => s.id === day)
  const T = settlementsTotal(settlements)
  const open = breaks.filter((b) => b.status === 'Open')
  const mx = d.gross || 1
  const wf = [
    ['Paid by workers and employers', 0, d.gross, '#1D66B8'],
    ['Credited to the FWECF account', 0, d.credited, '#4D9AD3'],
    ['State share (70%), stays in the account', 0, d.state, '#13407A'],
    ['Operator share (30%), invoiced monthly', d.state, d.operator, '#7B4DE3'],
  ]
  const doResolve = () => {
    updateBreak(resolve.id, { status: 'Resolved', note: note.trim() })
    logEvent('Resolved reconciliation break', `${resolve.id} · ${resolve.ref} · ${note.trim()}`)
    toast(`${resolve.id} marked as resolved`)
    setResolve(null); setNote('')
  }
  return (
    <>
      <PageHead title="Settlement" sub="How each day’s contributions reach the FWECF account held by Jabatan Kewangan Negeri Sabah. SCANS never holds money.">
        <button className="btn outline" onClick={() => { logEvent('Downloaded report', `Daily settlement · ${d.date} · PDF`); toast(`Settlement report for ${d.date} downloaded. The download is in the audit log.`) }}><FileText /> Daily report</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi hero icon={Landmark} label="Settled in June" value={rm(T.gross)} note={`${num(T.receipts)} receipts, 1 to 17 June`} />
        <Kpi icon={PiggyBank} tone="ok" label="State share (70%)" value={rm(T.state)} note="Stays in the FWECF account" />
        <Kpi icon={Wallet} tone="purple" label="Operator share (30%)" value={rm(T.operator)} note="Invoiced to the State monthly" />
        <Kpi icon={Scale} tone={open.length ? 'bad' : 'ok'} label="Breaks open" value={num(open.length)} note={`${T.reconciled} of ${settlements.length} days reconciled`} />
      </div>

      <Card title={d.date} sub="Where the money went on this day"
        action={<label><span className="vh">Day</span><select className="select" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Day">{[...settled].reverse().map((s) => <option key={s.id} value={s.id}>{s.date}</option>)}</select></label>}>
        <div className="ad-wf">
          {wf.map(([l, o, v, c]) => (
            <div className="w" key={l}>
              <span>{l}</span>
              <div className="bx"><i style={{ left: (o / mx) * 100 + '%', width: (v / mx) * 100 + '%', background: c }} /></div>
              <b>{rm(v)}</b>
            </div>
          ))}
        </div>
        <Callout icon={ShieldCheck} style={{ marginTop: 16 }}>The licensed acquirer pays straight into the FWECF account at 23:00 each day. {num(d.receipts)} receipts on {d.date}{d.breaks ? `, with ${d.breaks} break${d.breaks > 1 ? 's' : ''} found and resolved` : ', no breaks'}.</Callout>
      </Card>

      <div className="ad-two">
        <Card flush title="Daily reconciliation" sub="SCANS receipts, acquirer report and bank credit, June 2027">
          <Table rows={[...settlements].reverse()} pageSize={8} onRowClick={(s) => s.status !== 'Pending' && setDay(s.id)} columns={[
            { key: 'date', label: 'Day', render: (s) => <span className="gv-nowrap">{s.date}</span> },
            { key: 'receipts', label: 'Receipts', align: 'r', render: (s) => num(s.receipts) },
            { key: 'credited', label: 'Credited', align: 'r', render: (s) => (s.status === 'Pending' ? <span className="muted">At 23:00</span> : rm(s.credited)) },
            { key: 'status', label: 'Status', render: (s) => <Status>{s.status}</Status> },
          ]} />
        </Card>
        <Card flush title="Operator share invoices" sub="30% of collection, paid by the State from the FWECF account">
          <Table rows={[...operatorInvoices].reverse()} columns={[
            { key: 'month', label: 'Month' },
            { key: 'gross', label: 'Collected', align: 'r', render: (i) => rm(i.gross) },
            { key: 'operator', label: 'Operator share', align: 'r', render: (i) => rm(i.operator) },
            { key: 'status', label: 'Status', render: (i) => <Status tone={i.status === 'Accruing' ? 'info' : 'ok'}>{i.status}</Status> },
          ]} />
        </Card>
      </div>

      <Card title="Reconciliation breaks" sub="Acquirer credits that do not match a SCANS receipt. Fixing a break never changes a worker’s status.">
        <Table rows={breaks} columns={[
          { key: 'id', label: 'Break', render: (b) => <b className="mono-id gv-nowrap">{b.id}</b> },
          { key: 'date', label: 'Date', render: (b) => <span className="gv-nowrap">{b.date}</span> },
          { key: 'kind', label: 'Type' },
          { key: 'ref', label: 'Reference' },
          { key: 'amount', label: 'Amount', align: 'r', render: (b) => <span className="gv-nowrap">{rm(b.amount)}</span> },
          { key: 'note', label: 'Detail', render: (b) => <span className="small ink2">{b.note}</span> },
          { key: 'status', label: 'Status', render: (b) => <Status tone={b.status === 'Open' ? 'bad' : undefined}>{b.status}</Status> },
          { key: 'act', label: '', align: 'r', render: (b) => (b.status === 'Open' ? <button className="btn sm primary" onClick={() => { setResolve(b); setNote('') }}><Check /> Resolve</button> : null) },
        ]} />
      </Card>

      {resolve && (
        <Modal title={`Resolve ${resolve.id}`} onClose={() => setResolve(null)} actions={<><button className="btn outline" onClick={() => setResolve(null)}>Cancel</button><button className="btn primary" disabled={note.trim().length < 5} onClick={doResolve}><Check /> Mark as resolved</button></>}>
          <p className="ink2" style={{ marginBottom: 14 }}>{resolve.kind}, {rm(resolve.amount)}. {resolve.note}</p>
          <Field label="What was done" hint="Kept with the break and in the audit log."><textarea className="input" autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: refund of RM100 sent to the worker’s DuitNow account" /></Field>
        </Modal>
      )}
    </>
  )
}
