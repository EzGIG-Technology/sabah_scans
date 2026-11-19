import { useState } from 'react'
import { Download, FileText, Wallet, Layers, Users, FileSpreadsheet } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Table, Drawer, Callout, useToast } from '../../components/ui.jsx'
import { rm, num } from '../../data/demo.js'
import { EmpShell } from './shell.jsx'
import { COMPANY, useEmp, allBatches, useRoster, summarise } from './data.js'

const STATEMENTS = [
  { id: 'ST-2712', month: 'December 2027', note: 'Month to date, final on 1 January', ready: false },
  { id: 'ST-2711', month: 'Nov 2027', note: 'Issued 1 Dec 2027', ready: true },
  { id: 'ST-2710', month: 'October 2027', note: 'Issued 1 Nov 2027', ready: true },
  { id: 'ST-2709', month: 'September 2027', note: 'Issued 1 Oct 2027', ready: true },
  { id: 'ST-2708', month: 'August 2027', note: 'Issued 1 Sep 2027', ready: true },
  { id: 'ST-2707', month: 'July 2027', note: 'Issued 1 Aug 2027', ready: true },
]

export default function Statements() {
  const st = useEmp()
  const toast = useToast()
  const roster = useRoster()
  const s = summarise(roster)
  const [open, setOpen] = useState(null)
  const batches = allBatches(st)
  const paid = batches.reduce((a, b) => a + b.amount, 0)
  const covered = batches.reduce((a, b) => a + b.workers * b.months, 0)
  return (
    <EmpShell title="Statements">
      <PageHead title="Statements" crumbs={[{ label: 'Payments' }, { label: 'Statements' }]} sub="Batch payments made by the company and monthly statements for your records and auditors. Payments made by workers themselves appear in the monthly statement too." />
      <div className="grid g-3">
        <Kpi hero icon={Wallet} label="Paid by the company in 2027" value={rm(paid)} note={`${batches.length} batch payments`} />
        <Kpi icon={Layers} label="Worker-months covered" value={num(covered)} note={`At ${rm(100)} each`} />
        <Kpi icon={Users} tone="warn" label="Still owing today" value={rm(s.owing)} note={`${num(s.unpaid)} workers, all methods`} />
      </div>
      <Card title="Batch payments" sub="Click a batch to see its details and receipts" flush={false}>
        <Table rows={batches} onRowClick={setOpen} pageSize={8} columns={[
          { key: 'id', label: 'Batch', render: (b) => <span><b className="num">{b.id}</b>{b.session && <span className="pill info" style={{ marginLeft: 8 }}>New</span>}</span> },
          { key: 'date', label: 'Date' },
          { key: 'workers', label: 'Workers', align: 'r', render: (b) => num(b.workers) },
          { key: 'months', label: 'Months', align: 'r' },
          { key: 'method', label: 'Paid with' },
          { key: 'amount', label: 'Amount', align: 'r', render: (b) => <b className="num">{rm(b.amount, 2)}</b> },
          { key: 'status', label: 'Status', render: (b) => <Status>{b.status}</Status> },
          { key: 'dl', label: 'Receipt', align: 'r', render: (b) => <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); toast(`Batch receipt ${b.id} downloaded`) }}><Download /> PDF</button> },
        ]} footer={<tfoot><tr><td colSpan={5}>Total, {batches.length} batches</td><td className="r num">{rm(paid, 2)}</td><td colSpan={2} /></tr></tfoot>} />
      </Card>
      <Card title="Monthly statements" sub={`Every contribution paid for your ${num(COMPANY.workers)} workers, by the company or by the worker`}>
        <div className="emp-rows">
          {STATEMENTS.map((m) => (
            <div key={m.id}>
              <span className="k-ic" style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--sky)', color: 'var(--blue)', flex: 'none' }}><FileText size={18} /></span>
              <div className="grow"><b>{m.month} statement</b><small>{m.note}</small></div>
              {!m.ready && <Status tone="info">In progress</Status>}
              <div className="row" style={{ gap: 6 }}>
                <button className="btn outline sm" onClick={() => toast(`${m.month} statement downloaded as PDF`)}><Download /> PDF</button>
                <button className="btn ghost sm" onClick={() => toast(`${m.month} statement downloaded as CSV`)}><FileSpreadsheet /> CSV</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {open && (
        <Drawer title={open.id} sub={`${open.date} · ${open.method}`} onClose={() => setOpen(null)}
          footer={<><button className="btn outline" onClick={() => setOpen(null)}>Close</button><button className="btn primary" onClick={() => toast(`Batch receipt ${open.id} downloaded`)}><Download /> Download receipt</button></>}>
          <dl className="kv">
            <div><dt>Amount</dt><dd className="num">{rm(open.amount, 2)}</dd></div>
            <div><dt>Status</dt><dd><Status>{open.status}</Status></dd></div>
            <div><dt>Workers</dt><dd className="num">{num(open.workers)}</dd></div>
            <div><dt>Months each</dt><dd>{open.months}</dd></div>
            <div><dt>Paid with</dt><dd>{open.method}</dd></div>
            <div><dt>Paid to</dt><dd>FWECF account, Jabatan Kewangan Negeri Sabah</dd></div>
          </dl>
          {open.receipts ? (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Receipts</h3>
              <div className="emp-lines">
                {open.receipts.map((r) => <div key={r.id}><div className="grow"><b>{r.name}</b><small className="num">{r.id} · {r.period}</small></div><span className="amt num">{rm(r.amount)}</span></div>)}
              </div>
            </div>
          ) : (
            <Callout>One receipt was issued for each of the {num(open.workers)} workers. Download the batch receipt for the full list.</Callout>
          )}
          {open.status === 'Processing' && <Callout tone="ok">Settles into the FWECF account tonight at 23:00.</Callout>}
        </Drawer>
      )}
    </EmpShell>
  )
}
