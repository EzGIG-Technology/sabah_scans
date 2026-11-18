import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, UserPlus, ShieldCheck, Mail, Info, Database, Pencil, KeyRound, Monitor, Smartphone, History, LogOut, CalendarClock } from 'lucide-react'
import { PageHead, Card, Status, Pill, Callout, Tabs, Table, Modal, Field, Switch, Avatar, useToast } from '../../components/ui.jsx'
import { employerUsers } from '../../data/demo.js'
import { EmpShell } from './shell.jsx'
import { COMPANY, useEmp, setEmp, PIC_DEFAULT } from './data.js'

const ROLES = [
  { value: 'Admin', note: 'Everything, including adding people and setting up auto-pay' },
  { value: 'Payments', note: 'Pay for workers and download statements' },
  { value: 'Viewer', note: 'See contribution status and statements only' },
]

/* Figma "Person In Charge (PIC) Details" with an edit action. */
function Pic() {
  const toast = useToast()
  const st = useEmp()
  const pic = st.pic || PIC_DEFAULT
  const [open, setOpen] = useState(false)
  const [f, setF] = useState(pic)
  const [errs, setErrs] = useState({})
  const save = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'Enter the full name as it appears on the MyKad.'
    if (!f.role.trim()) e.role = 'Enter the person’s job title.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a work email address, for example name@company.com.my.'
    if (!/^(60)?0?1\d{8,9}$/.test(f.phone.replace(/\D/g, ''))) e.phone = 'Enter a Malaysian mobile number, for example 012-345 6789.'
    setErrs(e)
    if (Object.keys(e).length) return
    setEmp({ pic: { name: f.name.trim(), role: f.role.trim(), email: f.email.trim(), phone: f.phone.trim() } })
    setOpen(false)
    toast('Person in charge updated. A confirmation was sent to the old and new email addresses.')
  }
  return (
    <Card title="Person in charge" sub="Gets official SCANS messages and confirms changes to auto-pay"
      action={<button className="btn outline sm" onClick={() => { setF(pic); setErrs({}); setOpen(true) }}><Pencil /> Edit</button>}>
      <dl className="kv three">
        <div><dt>Full name</dt><dd>{pic.name}</dd></div>
        <div><dt>Job title</dt><dd>{pic.role}</dd></div>
        <div><dt>Mobile number</dt><dd className="num">{pic.phone}</dd></div>
        <div style={{ gridColumn: '1 / -1' }}><dt>Work email</dt><dd style={{ overflowWrap: 'anywhere' }}>{pic.email}</dd></div>
      </dl>
      {open && (
        <Modal title="Edit person in charge" onClose={() => setOpen(false)} actions={<>
          <button className="btn outline" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn primary" onClick={save}>Save changes</button>
        </>}>
          <div className="stack" style={{ gap: 14 }}>
            <Field label="Full name" error={errs.name}><input className={'input' + (errs.name ? ' err' : '')} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Job title" error={errs.role}><input className={'input' + (errs.role ? ' err' : '')} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="For example, HR manager" /></Field>
            <Field label="Work email" error={errs.email} hint="Used for official messages and 2-step sign-in. Use a mailbox someone checks."><input className={'input' + (errs.email ? ' err' : '')} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Mobile number" error={errs.phone}><input className={'input num' + (errs.phone ? ' err' : '')} inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          </div>
        </Modal>
      )}
    </Card>
  )
}

function Company() {
  const toast = useToast()
  const [fix, setFix] = useState(false)
  const [field, setField] = useState('Address')
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const rows = [
    ['Company name', COMPANY.name, 'SSM'], ['SSM number', COMPANY.ssm, 'SSM'], ['Company type', COMPANY.type, 'SSM'],
    ['Registered on', COMPANY.registered, 'SSM'], ['Registered address', COMPANY.address, 'SSM'],
    ['eNORES employer code', COMPANY.enores, 'eNORES'], ['Sector', COMPANY.sector, 'eNORES'], ['District', COMPANY.district, 'eNORES'],
    ['Foreign workers registered', `${COMPANY.workers} workers`, 'eNORES'],
  ]
  return (
    <div className="grid g-main">
      <div className="stack">
      <Card title="Registration" sub="Read only. Synced from SSM and eNORES at 06:00 today."
        action={<button className="btn outline sm" onClick={() => setFix(true)}>Request a correction</button>}>
        <dl className="kv">
          {rows.map(([k, v, src]) => (
            <div key={k} style={k === 'Registered address' ? { gridColumn: '1 / -1' } : undefined}>
              <dt>{k} <span className="pill grey" style={{ fontSize: 10.5, padding: '0 6px', marginLeft: 4 }}>{src}</span></dt>
              <dd className={/SSM number|code/.test(k) ? 'num' : ''}>{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Pic />
      </div>
      <div className="stack">
        <Card title="Where this comes from">
          <div className="emp-rows">
            <div><span className="k-ic" style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--sky)', color: 'var(--blue)', flex: 'none' }}><Building2 size={18} /></span><div className="grow"><b>SSM</b><small>Company name, number, type and address</small></div><Status>Connected</Status></div>
            <div><span className="k-ic" style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--sky)', color: 'var(--blue)', flex: 'none' }}><Database size={18} /></span><div className="grow"><b>eNORES, JTK Sabah</b><small>Employer code, sector, district and workers</small></div><Status>Connected</Status></div>
          </div>
        </Card>
        <Callout icon={Info}>SCANS cannot change these details. A correction request goes to Microtek, who asks SSM or JTK Sabah to fix the source record. The change then flows back here.</Callout>
      </div>
      {fix && (
        <Modal title="Request a correction" onClose={() => setFix(false)} actions={<>
          <button className="btn outline" onClick={() => setFix(false)}>Cancel</button>
          <button className="btn primary" onClick={() => {
            if (text.trim().length < 5) { setErr('Tell us what the correct value should be, so the source agency can check it.'); return }
            setFix(false); setText(''); setErr(''); toast('Correction request COR-2706-0112 sent to Microtek')
          }}>Send request</button>
        </>}>
          <div className="stack" style={{ gap: 14 }}>
            <Field label="What is wrong?">
              <select className="select" value={field} onChange={(e) => setField(e.target.value)}>
                {rows.map(([k]) => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="What should it say?" error={err} hint="Attach proof later if Microtek asks for it.">
              <textarea className={'input' + (err ? ' err' : '')} value={text} onChange={(e) => { setText(e.target.value); setErr('') }} placeholder="For example, the new registered address" />
            </Field>
            <Callout icon={Info}>This goes to {rows.find((r) => r[0] === field)[2] === 'eNORES' ? 'JTK Sabah (eNORES)' : 'SSM'} through Microtek. It usually takes 5 to 10 working days.</Callout>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UsersTab() {
  const toast = useToast()
  const { invited } = useEmp()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', email: '', role: 'Viewer' })
  const [errs, setErrs] = useState({})
  const users = [...employerUsers, ...invited]
  const submit = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'Enter the person’s full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a work email address, for example name@company.com.my.'
    else if (users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) e.email = 'This person already has access. Change their role instead.'
    setErrs(e)
    if (Object.keys(e).length) return
    setEmp((s) => ({ invited: [...s.invited, { name: f.name.trim(), email: f.email.trim(), role: f.role, twoFA: false, last: '—', status: 'Invited' }] }))
    toast(`Invitation sent to ${f.email.trim()}`)
    setOpen(false); setF({ name: '', email: '', role: 'Viewer' })
  }
  return (
    <div className="stack">
      <Card title="People who can sign in" sub={`${users.length} people at ${COMPANY.short}`}
        action={<button className="btn primary sm" onClick={() => setOpen(true)}><UserPlus /> Invite someone</button>}>
        <Table rows={users} rowKey={(u) => u.email} columns={[
          { key: 'name', label: 'Name', render: (u) => <div className="who"><Avatar name={u.name} /><div><b>{u.name}</b><small>{u.email}</small></div></div> },
          { key: 'role', label: 'Role', render: (u) => <Pill tone={u.role === 'Admin' ? 'purple' : u.role === 'Payments' ? 'info' : 'grey'}>{u.role}</Pill> },
          { key: 'twoFA', label: '2-step sign-in', render: (u) => <Status tone={u.twoFA ? 'ok' : 'warn'}>{u.twoFA ? 'Enabled' : 'Set up at first sign-in'}</Status> },
          { key: 'last', label: 'Last signed in' },
          { key: 'status', label: 'Status', render: (u) => <Status>{u.status}</Status> },
        ]} />
      </Card>
      <div className="grid g-3">
        {ROLES.map((r) => (
          <Card key={r.value}><b>{r.value}</b><p className="small muted" style={{ marginTop: 4 }}>{r.note}</p></Card>
        ))}
      </div>
      <Callout icon={ShieldCheck}>Everyone must use 2-step sign-in. Nobody in your company can see workers’ wages, complaints or immigration details, whatever their role.</Callout>
      {open && (
        <Modal title="Invite someone" onClose={() => setOpen(false)} actions={<>
          <button className="btn outline" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn primary" onClick={submit}><Mail /> Send invitation</button>
        </>}>
          <div className="stack" style={{ gap: 14 }}>
            <Field label="Full name" error={errs.name}><input className={'input' + (errs.name ? ' err' : '')} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Work email" error={errs.email}><input className={'input' + (errs.email ? ' err' : '')} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@company.com.my" /></Field>
            <div className="field"><span>Role</span>
              <div className="emp-rolecards" role="radiogroup" aria-label="Role">
                {ROLES.map((r) => (
                  <button key={r.value} type="button" className="option" role="radio" aria-checked={f.role === r.value} onClick={() => setF({ ...f, role: r.value })}>
                    <span className="radio" /><span className="grow"><b>{r.value}</b><small>{r.note}</small></span>
                  </button>
                ))}
              </div>
            </div>
            <Callout icon={ShieldCheck}>They must set up 2-step sign-in the first time they sign in. The invitation expires in 7 days.</Callout>
          </div>
        </Modal>
      )}
    </div>
  )
}

const NOTIFY = [
  ['receipts', 'Batch payment receipts', 'When a batch payment is confirmed by the bank', true],
  ['statement', 'Monthly statement ready', 'On the 1st of each month', true],
  ['risk', 'Workers owing 3 months or more', 'A weekly summary every Monday', true],
  ['permits', 'Permits ending within 60 days', 'For renewal planning only. It does not affect contributions', false],
  ['autopay', 'Auto-pay reminder', '3 days before each monthly debit', true],
  ['signin', 'New sign-in to your company account', 'Sent to admins only', true],
]

function Notifications() {
  const toast = useToast()
  const [on, setOn] = useState(() => Object.fromEntries(NOTIFY.map(([k, , , v]) => [k, v])))
  const [email, setEmail] = useState(true)
  const [sms, setSms] = useState(false)
  return (
    <div className="grid g-main">
      <Card title="What we tell you about" sub="Sent to Jennifer Liew">
        <div className="emp-rows">
          {NOTIFY.map(([k, t, d]) => (
            <div key={k}>
              <div className="grow"><b>{t}</b><small>{d}</small></div>
              <Switch checked={on[k]} onChange={(v) => setOn({ ...on, [k]: v })} label={t} />
            </div>
          ))}
        </div>
      </Card>
      <div className="stack">
        <Card title="How we reach you">
          <div className="emp-rows">
            <div><div className="grow"><b>Email</b><small>jennifer.liew@bpp.example.my</small></div><Switch checked={email} onChange={setEmail} label="Email" /></div>
            <div><div className="grow"><b>SMS</b><small>+60 12-•••• 4410</small></div><Switch checked={sms} onChange={setSms} label="SMS" /></div>
          </div>
          {!email && !sms && <Callout tone="warn" style={{ marginTop: 12 }}>Turn on email or SMS, or you will only see updates when you sign in.</Callout>}
          <button className="btn primary block" style={{ marginTop: 16 }} onClick={() => toast('Notification settings saved')}>Save changes</button>
        </Card>
        <Callout icon={Info}>Security messages, such as sign-in codes and changes to auto-pay, are always sent.</Callout>
      </div>
    </div>
  )
}

const SIGNINS = [
  { id: 1, when: 'Today, 08:12', device: 'Chrome on Windows', place: 'Lahad Datu', result: 'Signed in' },
  { id: 2, when: '16 Jun 2027, 17:40', device: 'Safari on iPhone', place: 'Lahad Datu', result: 'Signed in' },
  { id: 3, when: '16 Jun 2027, 08:05', device: 'Chrome on Windows', place: 'Lahad Datu', result: 'Signed in' },
  { id: 4, when: '15 Jun 2027, 21:13', device: 'Chrome on Android', place: 'Kota Kinabalu', result: 'Wrong code, blocked' },
  { id: 5, when: '15 Jun 2027, 08:09', device: 'Chrome on Windows', place: 'Lahad Datu', result: 'Signed in' },
  { id: 6, when: '14 Jun 2027, 08:15', device: 'Chrome on Windows', place: 'Lahad Datu', result: 'Signed in' },
]

/* Figma "Security & Verification": last sign-in with history, 2-step sign-in, linked records. */
function Security() {
  const toast = useToast()
  const [hist, setHist] = useState(false)
  const [others, setOthers] = useState(true)
  return (
    <div className="grid g-main">
      <Card title="Your sign-in" sub="Jennifer Liew, Admin">
        <div className="emp-rows">
          <div>
            <span className="emp-ic"><History size={18} /></span>
            <div className="grow"><b>Last signed in</b><small>Today at 08:12 · Chrome on Windows · Lahad Datu</small></div>
            <button className="btn ghost sm" onClick={() => setHist(true)}>See history</button>
          </div>
          <div>
            <span className="emp-ic ok"><KeyRound size={18} /></span>
            <div className="grow"><b>2-step sign-in</b><small>Authenticator app. Required for everyone, so it cannot be turned off.</small></div>
            <Status tone="ok">Enabled</Status>
          </div>
          <div>
            <span className="emp-ic"><Smartphone size={18} /></span>
            <div className="grow"><b>Change 2-step method</b><small>Switch to SMS codes or a new phone</small></div>
            <button className="btn outline sm" onClick={() => toast('We sent a link to jennifer.liew@bpp.example.my to change your 2-step method')}>Change</button>
          </div>
          <div>
            <span className="emp-ic"><Monitor size={18} /></span>
            <div className="grow"><b>Signed in on other devices</b><small>{others ? 'Safari on iPhone, last used yesterday' : 'Only this device'}</small></div>
            <button className="btn outline sm" disabled={!others} onClick={() => { setOthers(false); toast('Signed out of all other devices') }}><LogOut /> Sign out others</button>
          </div>
        </div>
      </Card>
      <div className="stack">
        <Card title="Linked records">
          <div className="emp-rows">
            <div><span className="emp-ic"><Building2 size={18} /></span><div className="grow"><b>SSM</b><small>Company registration</small></div><Status>Connected</Status></div>
            <div><span className="emp-ic"><Database size={18} /></span><div className="grow"><b>eNORES, JTK Sabah</b><small>Your foreign workers</small></div><Status>Connected</Status></div>
            <div><span className="emp-ic grey"><CalendarClock size={18} /></span><div className="grow"><b>JIM permit dates</b><small>Shown for planning only. SCANS cannot change a permit.</small></div><Status tone="info">Read only</Status></div>
          </div>
        </Card>
        <Callout icon={ShieldCheck}>Every sign-in, view, download and change in your company account is recorded in the SCANS audit log, under the Personal Data Protection Act 2010.</Callout>
      </div>
      {hist && (
        <Modal title="Sign-in history" onClose={() => setHist(false)} actions={<button className="btn primary" onClick={() => setHist(false)}>Done</button>}>
          <p className="small muted" style={{ marginTop: -6, marginBottom: 10 }}>The last 6 sign-ins to Jennifer Liew’s account. If you do not recognise one, change your 2-step method and tell your SCANS admin.</p>
          <div className="emp-rows">
            {SIGNINS.map((x) => (
              <div key={x.id}>
                <div className="grow"><b>{x.when}</b><small>{x.device} · {x.place}</small></div>
                <Status tone={x.result === 'Signed in' ? 'ok' : 'bad'}>{x.result}</Status>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

const TABS = ['Company', 'Users', 'Security', 'Notifications']
export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'Company'
  return (
    <EmpShell title="Settings">
      <PageHead title="Settings" crumbs={[{ label: 'Account' }, { label: 'Settings' }]} sub="Company registration, the person in charge, who can sign in, security and the messages you get." />
      <Tabs label="Settings" value={tab} onChange={(t) => setParams(t === 'Company' ? {} : { tab: t })} items={TABS} />
      {tab === 'Company' && <Company />}
      {tab === 'Users' && <UsersTab />}
      {tab === 'Security' && <Security />}
      {tab === 'Notifications' && <Notifications />}
    </EmpShell>
  )
}
