// Approvals: everything waiting on Microtek. State announcements show here for visibility
// but only the State can approve them.
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, Store, Users, Megaphone, ClipboardCheck, Check, X, Eye, FileCheck2, ShieldCheck, CircleCheck } from 'lucide-react'
import { PageHead, Card, Status, Callout, Empty, Tabs, Field, Modal, useToast } from '../../components/ui.jsx'
import { logEvent, updateApproval } from '../shared/store.js'
import { BASE } from './data.js'
import { useQueue } from './store.js'

const TYPE_ICON = { 'Employer sign-up': Building2, 'Merchant offer': Store, 'Record mismatch': Users, 'Merchant sign-up': Store, Announcement: Megaphone }
const TYPES = ['Employer sign-up', 'Merchant offer', 'Record mismatch', 'Merchant sign-up', 'Announcement']

export default function Approvals() {
  const toast = useToast()
  const go = useNavigate()
  const [params] = useSearchParams()
  const q = useQueue()
  const [tab, setTab] = useState(params.get('type') || 'All')
  const [back, setBack] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [reason, setReason] = useState('')
  const list = q.items.filter((i) => tab === 'All' || i.type === tab)
  const waiting = list.filter((i) => i.status !== 'Approved' && i.status !== 'Sent back')
  const decided = list.filter((i) => i.status === 'Approved' || i.status === 'Sent back')

  const approve = (i) => {
    updateApproval(i.id, { status: 'Approved' })
    logEvent('Approved ' + i.type.toLowerCase(), `${i.id} · ${i.name}`)
    toast(`${i.type} approved: ${i.name}`)
    setConfirm(null)
  }
  const sendBack = () => {
    const i = back
    updateApproval(i.id, { status: 'Sent back', reason })
    logEvent('Sent back ' + i.type.toLowerCase(), `${i.id} · ${i.name}`)
    toast(`${i.type} sent back with your reason: ${i.name}`)
    setBack(null); setReason('')
  }
  const counts = Object.fromEntries(TYPES.map((t) => [t, q.items.filter((i) => i.type === t && i.status !== 'Approved' && i.status !== 'Sent back').length]))

  const row = (i) => {
    const Icon = TYPE_ICON[i.type] || ClipboardCheck
    return (
      <div className="gv-ap" key={i.id}>
        <span className="ic"><Icon aria-hidden="true" /></span>
        <div className="txt">
          <small>{i.type} · {i.id} · {i.age}</small>
          <b>{i.name}</b>
          <small>{i.detail}</small>
        </div>
        <div className="acts">
          {i.source === 'notice' && (
            <>
              <Status>Waiting for State approval</Status>
              <button className="btn sm" disabled title="Only the State can approve notices to workers"><Check /> Approve</button>
              <span className="why">Only Kerajaan Negeri Sabah can approve notices to workers. Microtek cannot approve them.</span>
            </>
          )}
          {i.source === 'application' && <button className="btn sm primary" onClick={() => go(`${BASE}/merchants/applications/${i.id}`)}><FileCheck2 /> Check documents</button>}
          {i.source === 'offer' && <button className="btn sm primary" onClick={() => go(`${BASE}/merchants/offers/${i.id}`)}><Eye /> Review offer</button>}
          {i.source === 'approval' && (i.status === 'Approved' || i.status === 'Sent back'
            ? <Status tone={i.status === 'Sent back' ? 'bad' : undefined}>{i.status}</Status>
            : (
              <>
                {i.type === 'Record mismatch' && i.workerId && <button className="btn sm ghost" onClick={() => go(`${BASE}/workers/${i.workerId}`)}><Eye /> Record</button>}
                <button className="btn sm outline" onClick={() => setBack(i)}><X /> Send back</button>
                <button className="btn sm success" onClick={() => setConfirm(i)}><Check /> Approve</button>
              </>
            ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHead title="Approvals" sub="Sign-ups, merchant offers and record corrections waiting for Microtek. Every decision is written to the audit log." />
      <Callout icon={ShieldCheck}>Notices to workers are approved by the State, not here. Record corrections never change a worker’s permit or immigration status.</Callout>
      <Card>
        <Tabs items={[{ value: 'All', label: 'All', count: q.waiting.length + q.stateWaiting }, ...TYPES.map((t) => ({ value: t, label: t, count: counts[t] }))]} value={tab} onChange={setTab} label="Type" />
        <div style={{ paddingTop: 4 }}>
          {waiting.length === 0 && <Empty title="Nothing waiting" icon={CircleCheck}>New sign-ups, offers and record corrections appear here.</Empty>}
          {waiting.map(row)}
        </div>
        {decided.length > 0 && (
          <>
            <div className="gv-sub" style={{ marginTop: 16 }}>Decided this session</div>
            {decided.map(row)}
          </>
        )}
      </Card>
      {confirm && (
        <Modal title={`Approve ${confirm.type.toLowerCase()}?`} onClose={() => setConfirm(null)} actions={<><button className="btn outline" onClick={() => setConfirm(null)}>Cancel</button><button className="btn success" onClick={() => approve(confirm)}><Check /> Approve</button></>}>
          <p className="ink2">{confirm.type === 'Record mismatch'
            ? `The corrected details for ${confirm.name} are applied after a second officer checks them against the source system. The worker’s permit and immigration status do not change.`
            : `${confirm.name} can sign in to the employer portal and see contribution status for their workers. They are told by email.`}</p>
        </Modal>
      )}
      {back && (
        <Modal title={`Send back: ${back.name}`} onClose={() => setBack(null)} actions={<><button className="btn outline" onClick={() => setBack(null)}>Cancel</button><button className="btn primary" disabled={reason.trim().length < 5} onClick={sendBack}>Send back</button></>}>
          <Field label="Reason" hint="The applicant sees this. Say what to fix.">
            <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: the SSM certificate is older than 3 months" />
          </Field>
        </Modal>
      )}
    </>
  )
}
