// Admin management: who can sign in to the government and operator consoles, and what each role can do.
import { useState } from 'react'
import { MailPlus, Check, X, Lock, PencilLine, Trash2 } from 'lucide-react'
import { PageHead, Card, Status, Pill, Callout, Tabs, SearchInput, Field, Switch, Table, Drawer, Modal, Avatar, useToast } from '../../components/ui.jsx'
import { adminRoles } from '../../data/demo.js'
import { logEvent } from '../shared/store.js'
import { useAdmin, setUsers } from './store.js'

const ORGS = ['Microtek', 'Jabatan Kewangan Negeri', 'Kementerian Kewangan Negeri', 'JTK Sabah', 'Jabatan Audit Negeri']
const PERMS = ['View worker records', 'Export reports', 'Approve offers and sign-ups', 'Correct records', 'Approve State notices', 'Manage users']
const MATRIX = {
  Superadmin: [1, 1, 1, 1, 0, 1], Operations: [1, 1, 1, 1, 0, 0], Support: [1, 0, 0, 0, 0, 0], 'State finance': [1, 1, 0, 0, 0, 0],
  'State approver': [1, 1, 0, 0, 1, 0], 'Agency officer': [1, 0, 0, 0, 0, 0], Auditor: [1, 1, 0, 0, 0, 0],
}
// Roles a Microtek superadmin may give to people from each organisation.
const ROLES_FOR = {
  Microtek: ['Superadmin', 'Operations', 'Support'],
  'Jabatan Kewangan Negeri': ['State finance', 'State approver'], 'Kementerian Kewangan Negeri': ['State approver', 'State finance'],
  'JTK Sabah': ['Agency officer'], 'Jabatan Audit Negeri': ['Auditor'],
}
const ME = 'faizal@microtek.example.my'
const EMPTY = { name: '', email: '', org: 'Microtek', role: 'Support' }

export default function AdminUsers() {
  const toast = useToast()
  const users = useAdmin((s) => s.users)
  const [tab, setTab] = useState('Users')
  const [q, setQ] = useState('')
  const [invite, setInvite] = useState(false)
  const [edit, setEdit] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [cancel, setCancel] = useState(null)
  const [f, setF] = useState(EMPTY)
  const [tried, setTried] = useState(false)
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)
  const dup = users.some((u) => u.email.toLowerCase() === f.email.trim().toLowerCase())
  const rows = users.filter((u) => !q || (u.name + u.email + u.org + u.role).toLowerCase().includes(q.toLowerCase()))
  const setOrg = (org, obj, set) => set({ ...obj, org, role: ROLES_FOR[org].includes(obj.role) ? obj.role : ROLES_FOR[org][0] })

  const send = () => {
    setTried(true)
    if (!f.name.trim() || !emailOk || dup) return
    setUsers([...users, { name: f.name.trim(), email: f.email.trim(), org: f.org, role: f.role, twoFA: false, last: '—', status: 'Invited' }])
    logEvent('Invited admin user', `${f.email} · ${f.role}`)
    toast(`Invitation sent to ${f.email}. They must set up 2-step sign-in first.`)
    setInvite(false); setTried(false); setF(EMPTY)
  }
  const saveEdit = () => {
    const before = users.find((u) => u.email === edit.email)
    setUsers(users.map((u) => (u.email === edit.email ? { ...u, org: edit.org, role: edit.role } : u)))
    logEvent('Changed admin user role', `${edit.email} · ${before.role} to ${edit.role}`)
    toast(`${edit.name} is now ${edit.role}. The change takes effect at their next sign-in.`)
    setEdit(null)
  }
  const toggle = (u) => {
    const dis = u.status !== 'Disabled'
    setUsers(users.map((x) => (x.email === u.email ? { ...x, status: dis ? 'Disabled' : 'Active' } : x)))
    logEvent(dis ? 'Disabled admin user' : 'Enabled admin user', u.email)
    toast(dis ? `${u.name} can no longer sign in` : `${u.name} can sign in again`)
    setConfirm(null)
  }
  const cancelInvite = (u) => {
    setUsers(users.filter((x) => x.email !== u.email))
    logEvent('Cancelled admin invitation', u.email)
    toast(`Invitation to ${u.email} cancelled`)
    setCancel(null)
  }
  return (
    <>
      <PageHead title="Admin management" sub="People from Microtek, the State and agencies who can sign in to SCANS. 2-step sign-in is always required.">
        <button className="btn primary" onClick={() => { setInvite(true); setTried(false); setF(EMPTY) }}><MailPlus /> Invite user</button>
      </PageHead>
      <Card>
        <Tabs items={[{ value: 'Users', label: 'Users', count: users.length }, { value: 'Roles', label: 'Roles', count: adminRoles.length }]} value={tab} onChange={setTab} label="Admin management" />
        <div style={{ paddingTop: 16 }}>
          {tab === 'Users' && (
            <div className="stack" style={{ gap: 12 }}>
              <div className="toolbar">
                <span className="b" style={{ color: 'var(--blue)', fontSize: 16 }}>{users.filter((u) => u.status !== 'Disabled').length} people can sign in</span>
                <SearchInput value={q} onChange={setQ} placeholder="Search name, email or role" />
              </div>
              <Table rows={rows} rowKey={(u) => u.email} columns={[
                { key: 'name', label: 'Name', render: (u) => <div className="who"><Avatar name={u.name} /><div><b>{u.name}</b><small>{u.email}</small></div></div> },
                { key: 'org', label: 'Organisation' },
                { key: 'role', label: 'Role', render: (u) => <Pill tone="grey">{u.role}</Pill> },
                { key: 'twoFA', label: '2-step sign-in', render: (u) => (u.twoFA ? <Pill tone="ok">On</Pill> : <Pill tone="warn">At first sign-in</Pill>) },
                { key: 'last', label: 'Last sign-in' },
                { key: 'status', label: 'Status', render: (u) => <Status>{u.status}</Status> },
                { key: 'act', label: '', align: 'r', render: (u) => u.email === ME ? <span className="small muted">You</span> : (
                  <span className="row" style={{ gap: 6, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                    <button className="gv-icon-btn" aria-label={'Edit ' + u.name} onClick={() => setEdit({ ...u })}><PencilLine /></button>
                    {u.status === 'Invited'
                      ? <button className="gv-icon-btn" aria-label={'Cancel invitation for ' + u.name} onClick={() => setCancel(u)}><Trash2 /></button>
                      : <button className={'btn sm ' + (u.status === 'Disabled' ? 'outline' : 'danger')} onClick={() => setConfirm(u)}>{u.status === 'Disabled' ? 'Enable' : 'Disable'}</button>}
                  </span>
                ) },
              ]} />
            </div>
          )}
          {tab === 'Roles' && (
            <div className="stack">
              <Table rows={adminRoles} rowKey={(r) => r.name} columns={[
                { key: 'name', label: 'Role', render: (r) => <b>{r.name}</b> },
                { key: 'who', label: 'Who' },
                { key: 'can', label: 'Can' },
                { key: 'users', label: 'People', align: 'r', render: (r) => users.filter((u) => u.role === r.name && u.status !== 'Disabled').length },
              ]} />
              <div className="gv-sub">What each role can do</div>
              <div className="table-wrap">
                <table className="data stack">
                  <thead><tr><th>Role</th>{PERMS.map((p) => <th key={p}>{p}</th>)}</tr></thead>
                  <tbody>
                    {adminRoles.map((r) => (
                      <tr key={r.name}><td data-label="Role"><b>{r.name}</b></td>{PERMS.map((p, i) => <td key={p} data-label={p}>{MATRIX[r.name][i] ? <Check size={16} color="var(--ok)" aria-label="Yes" /> : <X size={16} color="var(--ink3)" aria-label="No" />}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Callout icon={Lock}>No role can issue, suspend or cancel a permit: SCANS has no such function. Microtek roles cannot approve State notices.</Callout>
            </div>
          )}
        </div>
      </Card>
      {invite && (
        <Modal title="Invite a user" onClose={() => setInvite(false)} actions={<><button className="btn outline" onClick={() => setInvite(false)}>Cancel</button><button className="btn primary" onClick={send}><MailPlus /> Send invitation</button></>}>
          <div className="form-grid">
            <Field label="Full name" full error={tried && !f.name.trim() ? 'Enter their name.' : null}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Work email" full error={tried && !emailOk ? 'Enter a work email, like name@sabah.gov.my.' : tried && dup ? 'This person already has access.' : null}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Organisation"><select className="select" value={f.org} onChange={(e) => setOrg(e.target.value, f, setF)}>{ORGS.map((o) => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Role"><select className="select" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES_FOR[f.org].map((r) => <option key={r}>{r}</option>)}</select></Field>
            <div className="field full"><span>2-step sign-in</span><div className="row"><Switch checked onChange={() => {}} label="2-step sign-in, always on" /><span className="small ink2">Always required for every web user. It cannot be turned off.</span></div></div>
          </div>
          <Callout style={{ marginTop: 14 }}>They get an email link to set a password and 2-step sign-in. SCANS never sends passwords.</Callout>
        </Modal>
      )}
      {edit && (
        <Drawer title="Edit access" sub={edit.email} onClose={() => setEdit(null)} footer={<><button className="btn outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn primary" disabled={(() => { const u = users.find((x) => x.email === edit.email); return u && u.role === edit.role && u.org === edit.org })()} onClick={saveEdit}>Save changes</button></>}>
          <div className="row" style={{ gap: 12 }}><Avatar name={edit.name} /><div><b>{edit.name}</b><div className="small muted">Last sign-in {edit.last}</div></div><span style={{ marginLeft: 'auto' }}><Status>{edit.status}</Status></span></div>
          <div className="form-grid">
            <Field label="Organisation"><select className="select" value={edit.org} onChange={(e) => setOrg(e.target.value, edit, setEdit)}>{ORGS.map((o) => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Role"><select className="select" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>{ROLES_FOR[edit.org].map((r) => <option key={r}>{r}</option>)}</select></Field>
          </div>
          <div>
            <div className="gv-sub">This role can</div>
            <div className="gv-check">
              {PERMS.map((p, i) => <div key={p} className={MATRIX[edit.role][i] ? 'yes' : 'no'}>{MATRIX[edit.role][i] ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}<span>{p}</span></div>)}
            </div>
          </div>
          <Callout icon={Lock}>Role changes are written to the audit log and take effect at their next sign-in.</Callout>
        </Drawer>
      )}
      {confirm && (
        <Modal title={confirm.status === 'Disabled' ? `Enable ${confirm.name}?` : `Disable ${confirm.name}?`} onClose={() => setConfirm(null)}
          actions={<><button className="btn outline" onClick={() => setConfirm(null)}>Cancel</button><button className={'btn ' + (confirm.status === 'Disabled' ? 'primary' : 'danger')} onClick={() => toggle(confirm)}>{confirm.status === 'Disabled' ? 'Enable user' : 'Disable user'}</button></>}>
          <p className="ink2">{confirm.status === 'Disabled' ? 'They can sign in again with their 2-step sign-in.' : 'They are signed out now and cannot sign in until enabled again. Their past actions stay in the audit log.'}</p>
        </Modal>
      )}
      {cancel && (
        <Modal title="Cancel this invitation?" onClose={() => setCancel(null)}
          actions={<><button className="btn outline" onClick={() => setCancel(null)}>Keep it</button><button className="btn danger" onClick={() => cancelInvite(cancel)}><Trash2 /> Cancel invitation</button></>}>
          <p className="ink2">The link sent to {cancel.email} stops working. You can invite them again later.</p>
        </Modal>
      )}
    </>
  )
}
