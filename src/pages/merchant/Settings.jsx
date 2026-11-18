import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, PenLine, UserPlus, Trash2, ShieldCheck, Download, Lock, FileSignature, Eye, EyeOff, Upload, FileText, CalendarClock, KeyRound, Smartphone, LogOut, Globe, ImagePlus } from 'lucide-react'
import { PageHead, Card, Tabs, Status, Table, Modal, Field, Switch, Callout, Avatar, Seg, useToast } from '../../components/ui.jsx'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'
import { MERCHANT, ME, roles, districtOptions, signIns } from './data.js'

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'company'
  return (
    <MShell title="Merchant settings">
      <PageHead title="Merchant settings" sub="Company details, documents, who can sign in and what we tell you about." />
      <Tabs label="Settings" value={tab} onChange={(v) => setParams({ tab: v })} items={[{ value: 'company', label: 'Company' }, { value: 'documents', label: 'Agreement and documents' }, { value: 'users', label: 'Users' }, { value: 'security', label: 'Security' }, { value: 'notifications', label: 'Notifications' }]} />
      {tab === 'company' && <Company />}
      {tab === 'documents' && <Documents />}
      {tab === 'security' && <Security />}
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
  ['Website', 'www.7eleven.com.my'],
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
        <LogoCard />
        <Card title="Partner agreement" sub="Signed 12 Jan 2027 with Microtek for Kerajaan Negeri Sabah">
          <ul className="mx-cansee">
            <li><Lock aria-hidden="true" className="yes" />You never see worker records, only a masked SCANS ID and "up to date"</li>
            <li><ShieldCheck aria-hidden="true" className="yes" />Microtek approves every new or changed offer</li>
            <li><FileSignature aria-hidden="true" className="yes" />A perk counts as used only after your staff confirm it</li>
            <li><Building2 aria-hidden="true" className="yes" />No use of SCANS or worker data for advertising</li>
          </ul>
          <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn outline" onClick={() => toast('Partner agreement downloaded (PDF)')}><Download /> Download agreement</button>
            <Link className="btn ghost" to="/merchant/settings?tab=documents">All documents</Link>
          </div>
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

/* ---------------- Company logo ---------------- */
function LogoCard() {
  const toast = useToast()
  const [file, setFile] = useState(null) // { url, name }
  const [error, setError] = useState('')
  const pick = (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!/^image\/(png|jpeg|svg\+xml)$/.test(f.type)) { setError('Choose a PNG, JPG or SVG file.'); return }
    if (f.size > 2 * 1024 * 1024) { setError('The logo is over 2 MB. Choose a smaller file.'); return }
    setError('')
    setFile({ url: URL.createObjectURL(f), name: f.name })
    toast('Logo sent to Microtek. Workers see it once it is approved.')
  }
  return (
    <Card title="Logo shown to workers" sub="On every perk card in the worker app">
      <div className="mx-logo-row">
        {file ? <img src={file.url} alt="New logo, waiting for approval" className="mx-logo-img" /> : <span className="mono lg" style={{ background: MERCHANT.color }} aria-hidden="true">7E</span>}
        <div className="grow" style={{ minWidth: 0 }}>
          {file ? <><b className="mx-ellipsis">{file.name}</b><Status tone="warn">Waiting for approval</Status></> : <><b>Letter tile</b><small className="muted">Used until your logo is approved</small></>}
        </div>
      </div>
      {error && <p className="small" role="alert" style={{ color: 'var(--bad)', marginTop: 8 }}>{error}</p>}
      <label className="btn outline block" style={{ marginTop: 12 }}>
        <ImagePlus /> {file ? 'Choose another logo' : 'Upload logo'}
        <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="vh" onChange={pick} />
      </label>
      <p className="small muted" style={{ marginTop: 8 }}>Square, PNG, JPG or SVG, up to 2 MB.</p>
    </Card>
  )
}

/* ---------------- Agreement and documents ---------------- */
function Documents() {
  const { docs, updateDoc } = useMerchant()
  const toast = useToast()
  const [view, setView] = useState(null)
  const agreement = docs.find((d) => d.kind === 'agreement')
  const files = docs.filter((d) => d.kind === 'file')
  const replace = (d) => (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!/pdf|jpeg|png/.test(f.type)) { toast('Choose a PDF, JPG or PNG file'); return }
    if (f.size > 5 * 1024 * 1024) { toast('That file is over 5 MB. Choose a smaller one.'); return }
    updateDoc(d.k, { pending: f.name })
    toast(`${d.t} sent to Microtek for checking`)
  }
  return (
    <div className="grid g-main">
      <div className="stack">
        <Card title="Partner agreement" sub={agreement.s}
          action={<button className="btn sm outline" onClick={() => toast('Partner agreement downloaded (PDF)')}><Download /> Download</button>}>
          <dl className="kv">
            <div><dt>Signed</dt><dd>{agreement.uploaded}</dd></div>
            <div><dt>Ends</dt><dd>{agreement.expires} <span className="pill info" style={{ marginLeft: 6 }}>{agreement.daysLeft} days left</span></dd></div>
            <div><dt>Renewal opens</dt><dd>12 Nov 2027</dd></div>
            <div><dt>File</dt><dd className="mx-ellipsis">{agreement.file}</dd></div>
          </dl>
          <Callout icon={CalendarClock} style={{ marginTop: 14 }}>You can upload renewal documents from 60 days before the agreement ends. We remind you by email before then.</Callout>
        </Card>
        <Card title="Company documents" sub="Checked by Microtek when you joined. Replace a document when it is renewed.">
          <div className="list-rows">
            {files.map((d) => {
              const soon = d.daysLeft != null && d.daysLeft <= 60
              return (
                <div key={d.k} className="mx-doc">
                  <div className="row" style={{ minWidth: 0, alignItems: 'flex-start' }}>
                    <span className="mx-outlet-ic"><FileText size={16} /></span>
                    <div style={{ minWidth: 0 }}>
                      <b style={{ display: 'block', fontSize: 14 }}>{d.t}</b>
                      <small className="muted" style={{ display: 'block' }}>{d.s}</small>
                      <small className="muted" style={{ display: 'block' }}>Uploaded {d.uploaded}{d.expires ? ` · ends ${d.expires}` : ''}</small>
                      <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {d.pending ? <Status tone="info">New file with Microtek</Status> : soon ? <Status tone="warn">{`Ends in ${d.daysLeft} days`}</Status> : <Status tone="ok">Checked</Status>}
                      </div>
                    </div>
                  </div>
                  <div className="mx-doc-act">
                    <button className="btn sm ghost" onClick={() => setView(d)}><Eye /> View</button>
                    <label className="btn sm outline"><Upload /> Replace<input type="file" accept="application/pdf,image/png,image/jpeg" className="vh" onChange={replace(d)} /></label>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
      <div className="stack">
        {files.filter((d) => d.daysLeft != null && d.daysLeft <= 60 && !d.pending).map((d) => (
          <Callout key={d.k} tone="warn" icon={CalendarClock}><b>{d.t} ends on {d.expires}.</b> Upload the renewed one before then so your outlets keep confirming codes.</Callout>
        ))}
        <Callout icon={ShieldCheck}>Documents are kept by Microtek for Kerajaan Negeri Sabah under PDPA. Every view and download is written to the audit log.</Callout>
      </div>
      {view && (
        <Modal title={view.t} onClose={() => setView(null)} actions={<><button className="btn outline" onClick={() => setView(null)}>Close</button><button className="btn primary" onClick={() => { toast(`${view.t} downloaded`); setView(null) }}><Download /> Download</button></>}>
          <div className="mx-docview" aria-label={`Preview of ${view.file}`}>
            <FileText aria-hidden="true" />
            <b>{view.file}</b>
            <small>{view.size} · uploaded {view.uploaded}</small>
          </div>
          {view.pending && <p className="small muted" style={{ marginTop: 10 }}>A new file, {view.pending}, is with Microtek. This one stays in use until they approve it.</p>}
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Security ---------------- */
function Security() {
  const toast = useToast()
  const [pw, setPw] = useState({ now: '', next: '', again: '' })
  const [show, setShow] = useState(false)
  const [tried, setTried] = useState(false)
  const [sessions, setSessions] = useState(signIns)
  const [method, setMethod] = useState('app')
  const rules = [
    [pw.next.length >= 12, 'At least 12 characters'],
    [/[A-Z]/.test(pw.next) && /[a-z]/.test(pw.next), 'Upper and lower case letters'],
    [/\d/.test(pw.next), 'At least one number'],
  ]
  const errs = {
    now: !pw.now && 'Enter your current password.',
    next: !rules.every((x) => x[0]) ? 'The new password does not meet the rules below.' : pw.next === pw.now && 'Choose a password you have not used before.',
    again: pw.again !== pw.next && 'The two new passwords do not match.',
  }
  const save = () => {
    setTried(true)
    if (Object.values(errs).some(Boolean)) return
    setPw({ now: '', next: '', again: '' }); setTried(false)
    toast('Password changed. Other devices are signed out.')
    setSessions((xs) => xs.filter((x) => x.current))
  }
  const type = show ? 'text' : 'password'
  return (
    <div className="grid g-main">
      <Card title="Change password" sub={`For ${ME.email}`} action={<button className="btn sm ghost" onClick={() => setShow(!show)} aria-pressed={show}>{show ? <><EyeOff /> Hide</> : <><Eye /> Show</>}</button>}>
        <div className="stack" style={{ gap: 14 }}>
          <Field label="Current password" error={tried && errs.now}><input className="input" type={type} autoComplete="current-password" value={pw.now} onChange={(e) => setPw({ ...pw, now: e.target.value })} /></Field>
          <div className="form-grid">
            <Field label="New password" error={tried && errs.next}><input className="input" type={type} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            <Field label="New password again" error={tried && errs.again}><input className="input" type={type} autoComplete="new-password" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} /></Field>
          </div>
          <ul className="mx-pwrules" aria-label="Password rules">
            {rules.map(([ok, t]) => <li key={t} className={ok ? 'ok' : ''}><span aria-hidden="true" />{t}<span className="vh">{ok ? ' (met)' : ' (not met)'}</span></li>)}
          </ul>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn primary" onClick={save}><KeyRound /> Change password</button></div>
        </div>
      </Card>
      <div className="stack">
        <Card title="Two-step sign-in" sub="Required for every SCANS web user" action={<Status tone="ok">On</Status>}>
          <p className="small muted" style={{ marginBottom: 10 }}>After your password, we ask for a 6-digit code.</p>
          <Seg label="Code from" value={method} onChange={(v) => { setMethod(v); toast(v === 'app' ? 'Codes now come from your authenticator app' : 'Codes now come by SMS to +60 12-••• 4417') }}
            items={[{ value: 'app', label: <><Smartphone size={15} /> Authenticator app</> }, { value: 'sms', label: 'SMS' }]} />
          <p className="small muted" style={{ marginTop: 10 }}><Lock size={13} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> It cannot be turned off. If you lose your phone, ask another admin or Microtek to reset it.</p>
        </Card>
        <Card title="Where you are signed in" action={sessions.length > 1 && <button className="btn sm outline" onClick={() => { setSessions((xs) => xs.filter((x) => x.current)); toast('Signed out on all other devices') }}><LogOut /> Sign out others</button>}>
          <div className="list-rows">
            {sessions.map((x) => (
              <div key={x.id}>
                <div style={{ minWidth: 0 }}><b style={{ display: 'block', fontSize: 13.5 }}>{x.device}</b><small className="muted">{x.place} · {x.at}</small></div>
                {x.current ? <Status tone="ok">This device</Status> : <button className="btn ghost sm" onClick={() => { setSessions((xs) => xs.filter((y) => y.id !== x.id)); toast(`Signed out on ${x.device}`) }}>Sign out</button>}
              </div>
            ))}
          </div>
          <div className="mx-privacy-line"><Globe size={15} aria-hidden="true" />Do not recognise one? Sign it out, change your password and tell Microtek.</div>
        </Card>
      </div>
    </div>
  )
}
