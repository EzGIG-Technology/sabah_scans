import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, PenLine, UserPlus, Trash2, ShieldCheck, Download, Lock, FileSignature } from 'lucide-react'
import { PageHead, Card, Tabs, Status, Table, Modal, Field, Switch, Callout, Avatar, Seg, useToast } from '../../components/ui.jsx'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'
import { MERCHANT, ME, roles, districtOptions } from './data.js'

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'company'
  return (
    <MShell title="Merchant settings">
      <PageHead title="Merchant settings" sub="Company details, who can sign in and what we tell you about." />
      <Tabs label="Settings" value={tab} onChange={(v) => setParams({ tab: v })} items={[{ value: 'company', label: 'Company' }, { value: 'users', label: 'Users' }, { value: 'notifications', label: 'Notifications' }]} />
      {tab === 'company' && <Company />}
      {tab === 'users' && <UsersTab />}
      {tab === 'notifications' && <Notifications />}
    </MShell>
  )
}

const details = [
  ['Registered name', MERCHANT.company],
  ['SSM number', MERCHANT.ssm],
  ['Name shown to workers', MERCHANT.name],
  ['Category', MERCHANT.category],
  ['Head office', 'Level 3, Wisma Lintas, Jalan Lintas, 88300 Kota Kinabalu'],
  ['Partner since', MERCHANT.joined],
  ['Person in charge', `${ME.name}, ${ME.role}`],
  ['Contact email', MERCHANT.email],
]

function Company() {
  const toast = useToast()
  const { outlets } = useMerchant()
  const [open, setOpen] = useState(false)
  const [field, setField] = useState(details[4][0])
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [tried, setTried] = useState(false)
  const send = () => {
    setTried(true)
    if (!value.trim()) return
    setOpen(false); setValue(''); setReason(''); setTried(false)
    toast('Correction request sent to Microtek')
  }
  return (
    <div className="grid g-main">
      <Card title="Company details" sub="From the SSM register and your sign-up. Read only." action={<button className="btn sm outline" onClick={() => setOpen(true)}><PenLine /> Request a correction</button>}>
        <div className="mx-company">
          <span className="mono lg" style={{ background: MERCHANT.color }} aria-hidden="true">7E</span>
          <div><b>{MERCHANT.name}</b><small>{MERCHANT.category} · {outlets.length} outlets</small></div>
          <Status>Active</Status>
        </div>
        <dl className="kv">
          {details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </Card>
      <div className="stack">
        <Card title="Partner agreement" sub="Signed 12 Jan 2027 with Microtek for Kerajaan Negeri Sabah">
          <ul className="mx-cansee">
            <li><Lock aria-hidden="true" className="yes" />You never see worker records, only a masked SCANS ID and "up to date"</li>
            <li><ShieldCheck aria-hidden="true" className="yes" />Microtek approves every new or changed offer</li>
            <li><FileSignature aria-hidden="true" className="yes" />A perk counts as used only after your staff confirm it</li>
            <li><Building2 aria-hidden="true" className="yes" />No use of SCANS or worker data for advertising</li>
          </ul>
          <button className="btn outline block" style={{ marginTop: 14 }} onClick={() => toast('Partner agreement downloaded (PDF)')}><Download /> Download agreement</button>
        </Card>
        <Callout>Changes to the registered name or SSM number must match the SSM register. Microtek checks each request, usually within 2 working days.</Callout>
      </div>

      {open && (
        <Modal title="Request a correction" onClose={() => setOpen(false)} actions={<><button className="btn outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn primary" onClick={send}>Send to Microtek</button></>}>
          <div className="stack" style={{ gap: 14 }}>
            <Field label="Which detail is wrong">
              <select className="select" value={field} onChange={(e) => setField(e.target.value)}>{details.map(([k]) => <option key={k}>{k}</option>)}</select>
            </Field>
            <Field label="What it should say" error={tried && !value.trim() ? 'Enter the correct detail.' : undefined}>
              <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={details.find((d) => d[0] === field)[1]} />
            </Field>
            <Field label="Why (optional)"><textarea className="input" style={{ minHeight: 80 }} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: we moved our head office in May 2027" /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UsersTab() {
  const { users, setUsers } = useMerchant()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [remove, setRemove] = useState(null)
  return (
    <>
      <Card title="People who can sign in" sub="Two-step sign-in is required for every user" action={<button className="btn primary sm" onClick={() => setOpen(true)}><UserPlus /> Invite user</button>}>
        <Table rows={users} columns={[
          { key: 'name', label: 'Name', render: (u) => <div className="who"><Avatar name={u.name} /><div style={{ minWidth: 0 }}><b>{u.name}{u.name === ME.name ? ' (you)' : ''}</b><small>{u.email}</small></div></div> },
          { key: 'role', label: 'Role' },
          { key: 'scope', label: 'Outlets' },
          { key: 'twoFA', label: 'Two-step sign-in', render: (u) => <Status tone={u.twoFA ? 'ok' : 'warn'}>{u.twoFA ? 'On' : 'Not set up yet'}</Status> },
          { key: 'last', label: 'Last sign-in' },
          { key: 'status', label: 'Status', render: (u) => <Status>{u.status}</Status> },
          { key: 'x', label: 'Remove', align: 'r', render: (u) => u.name === ME.name ? <span className="small muted">—</span> : <button className="btn ghost sm icon" aria-label={'Remove ' + u.name} onClick={() => setRemove(u)}><Trash2 /></button> },
        ]} />
      </Card>
      <div className="grid g-4 keep2 mx-roles">
        {roles.map((r) => <div className="card tint" key={r.value}><b>{r.label}</b><p className="small muted" style={{ marginTop: 4 }}>{r.note}</p></div>)}
      </div>
      {open && <InviteModal onClose={() => setOpen(false)} onInvite={(u) => { setUsers((xs) => [...xs, u]); setOpen(false); toast(`Invitation sent to ${u.email}`) }} />}
      {remove && (
        <Modal title={`Remove ${remove.name}?`} onClose={() => setRemove(null)} actions={<><button className="btn outline" onClick={() => setRemove(null)}>Cancel</button><button className="btn danger" onClick={() => { setUsers((xs) => xs.filter((x) => x.id !== remove.id)); toast(`${remove.name} can no longer sign in`); setRemove(null) }}><Trash2 /> Remove</button></>}>
          <p className="ink2">They are signed out straight away and can no longer see offers or reports. This is written to the audit log.</p>
        </Modal>
      )}
    </>
  )
}

function InviteModal({ onClose, onInvite }) {
  const [f, setF] = useState({ name: '', email: '', role: 'Offer manager', scope: 'all', districts: [] })
  const [tried, setTried] = useState(false)
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)
  const send = () => {
    setTried(true)
    if (!f.name.trim() || !emailOk) return
    onInvite({ id: 'u' + Date.now(), name: f.name.trim(), email: f.email.trim(), role: f.role, scope: f.scope === 'all' ? 'All outlets' : f.districts.map((d) => districtOptions.find((x) => x.value === d).label).join(', ') || 'No outlets yet', twoFA: false, last: '—', status: 'Invited' })
  }
  return (
    <Modal title="Invite a user" onClose={onClose} actions={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={send}><UserPlus /> Send invitation</button></>}>
      <div className="stack" style={{ gap: 14 }}>
        <div className="form-grid">
          <Field label="Full name" error={tried && !f.name.trim() ? 'Enter their name.' : undefined}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Work email" error={tried && !emailOk ? 'Enter a work email, for example name@7eleven.com.my' : undefined}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        </div>
        <div className="field">
          <span>Role</span>
          <div className="stack" style={{ gap: 8 }}>
            {roles.map((r) => (
              <button type="button" key={r.value} className="option" aria-pressed={f.role === r.value} onClick={() => setF({ ...f, role: r.value })} style={{ padding: '12px 14px' }}>
                <span className="radio" /><span><b style={{ display: 'block' }}>{r.label}</b><small className="muted">{r.note}</small></span>
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Outlets they can see</span>
          <Seg label="Outlets" value={f.scope} onChange={(v) => setF({ ...f, scope: v })} items={[{ value: 'all', label: 'All outlets' }, { value: 'some', label: 'Some districts' }]} />
          {f.scope === 'some' && (
            <div className="chips" style={{ marginTop: 8 }}>
              {districtOptions.map((d) => { const on = f.districts.includes(d.value); return <button type="button" key={d.value} className="chip" aria-pressed={on} onClick={() => setF({ ...f, districts: on ? f.districts.filter((x) => x !== d.value) : [...f.districts, d.value] })}>{d.label}</button> })}
            </div>
          )}
        </div>
        <p className="small muted">They get an email link that lasts 48 hours and must set up two-step sign-in before they can see anything.</p>
      </div>
    </Modal>
  )
}

const notes = [
  { k: 'approval', t: 'Offer approved or sent back', s: 'When Microtek finishes checking an offer', on: true },
  { k: 'ending', t: 'Offer about to end', s: '7 days before the end date', on: true },
  { k: 'statement', t: 'Monthly statement ready', s: 'On the 1st of each month', on: true },
  { k: 'weekly', t: 'Weekly summary', s: 'Redemptions by offer and outlet, every Monday', on: false },
  { k: 'outlet', t: 'Outlet approved', s: 'When a new outlet can start confirming codes', on: true },
  { k: 'signin', t: 'New sign-in to your account', s: 'Always on for your security', on: true, locked: true },
]
function Notifications() {
  const toast = useToast()
  const [state, setState] = useState(Object.fromEntries(notes.map((n) => [n.k, n.on])))
  const [channel, setChannel] = useState('email')
  return (
    <div className="grid g-main">
      <Card title="Tell me when" sub={`Sent to ${ME.email}`} action={<Seg label="Channel" value={channel} onChange={setChannel} items={[{ value: 'email', label: 'Email' }, { value: 'both', label: 'Email and SMS' }]} />}>
        <div className="list-rows">
          {notes.map((n) => (
            <div key={n.k}>
              <div style={{ minWidth: 0 }}><b style={{ display: 'block', fontSize: 14 }}>{n.t}</b><small className="muted">{n.s}</small></div>
              {n.locked ? <span className="pill grey"><Lock size={12} /> Always on</span> : <Switch label={n.t} checked={state[n.k]} onChange={(v) => setState({ ...state, [n.k]: v })} />}
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}><button className="btn primary" onClick={() => toast('Notification settings saved')}>Save</button></div>
      </Card>
      <Callout icon={ShieldCheck}>We only send you news about your own offers and outlets. SCANS never sends you worker details and never sends advertising.</Callout>
    </div>
  )
}
