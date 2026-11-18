import { useState } from 'react'
import { Plus, Store, CheckCircle2, Users, MapPin, Pause, Play, Trash2, UserPlus, Info, Pencil, Phone, UserRound, Award, LayoutGrid, List } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Table, SearchInput, Select, Seg, Drawer, Field, Callout, HBarChart, Empty, useToast } from '../../components/ui.jsx'
import { num } from '../../data/demo.js'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'
import { districtOptions, districtName } from './data.js'

export default function Outlets() {
  const { outlets, updateOutlet, addOutlet } = useMerchant()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [district, setDistrict] = useState('all')
  const [status, setStatus] = useState('All')
  const [openId, setOpenId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [view, setView] = useState('cards')

  const rows = outlets.filter((o) =>
    (o.name + ' ' + o.id + ' ' + o.address).toLowerCase().includes(q.toLowerCase()) &&
    (district === 'all' || o.districtId === district) && (status === 'All' || o.status === status))
  const staffTotal = outlets.filter((o) => o.status === 'Active').reduce((s, o) => s + o.staff.length, 0)
  const june = outlets.reduce((s, o) => s + o.june, 0)
  const byDistrict = districtOptions.map((d) => ({ label: d.label, value: outlets.filter((o) => o.districtId === d.value).reduce((s, o) => s + o.june, 0) })).sort((a, b) => b.value - a.value)
  const active = outlets.filter((o) => o.status === 'Active').length
  const topOutlets = [...outlets].sort((a, b) => b.june - a.june).slice(0, 8).map((o) => ({ label: o.name.replace('7-Eleven ', '') + ', ' + o.district, value: o.june }))
  const open = outlets.find((o) => o.id === openId)
  const editing = outlets.find((o) => o.id === editId)
  const topId = [...outlets].sort((a, b) => b.june - a.june)[0]?.id

  const toggle = (o) => {
    const paused = o.status === 'Paused'
    updateOutlet(o.id, { status: paused ? 'Active' : 'Paused' })
    toast(paused ? `${o.name} can confirm redemptions again` : `${o.name} paused. Staff there cannot confirm codes.`)
  }

  return (
    <MShell title="Branches and outlets">
      <PageHead title="Branches and outlets" sub="Staff at active outlets can confirm redemptions at the counter. Paused outlets cannot.">
        <button className="btn primary" onClick={() => setAdding(true)}><Plus /> Add outlet</button>
      </PageHead>

      <div className="grid g-4 keep2">
        <Kpi hero icon={Store} label="Outlets" value={num(outlets.length)} note={`In ${new Set(outlets.map((o) => o.districtId)).size} districts`} />
        <Kpi icon={CheckCircle2} tone="ok" label="Active" value={num(active)} note={`${outlets.length - active} paused or in review`} />
        <Kpi icon={MapPin} label="Redemptions in June" value={num(june)} note="Confirmed, 1 to 17 June" />
        <Kpi icon={Users} tone="purple" label="Staff who can confirm" value={num(staffTotal)} note="At active outlets" />
      </div>

      <div className="grid g-2">
        <Card title="Redemptions by district" sub="June 2027, confirmed">
          <HBarChart data={byDistrict} />
        </Card>
        <Card title="Busiest outlets" sub="June 2027, confirmed">
          <HBarChart data={topOutlets} />
        </Card>
      </div>

      <Card title="All outlets" sub="Select an outlet to see its staff">
        <div className="toolbar" style={{ marginBottom: 14 }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search outlet, ID or street" />
          <Select label="District" value={district} onChange={setDistrict} options={[{ value: 'all', label: 'All districts' }, ...districtOptions]} />
          <Seg label="Status" value={status} onChange={setStatus} items={['All', 'Active', 'Paused', 'In review']} />
          <Seg label="Layout" value={view} onChange={setView} items={[{ value: 'cards', label: <><LayoutGrid size={15} /> Cards</> }, { value: 'table', label: <><List size={15} /> Table</> }]} />
        </div>
        {view === 'cards' ? <OutletCards rows={rows} topId={topId} onOpen={setOpenId} onEdit={setEditId} onToggle={toggle} /> : <Table rows={rows} pageSize={10} onRowClick={(o) => setOpenId(o.id)} columns={[
          { key: 'name', label: 'Outlet', render: (o) => <div className="who"><span className="mx-outlet-ic"><Store size={16} /></span><div style={{ minWidth: 0 }}><b>{o.name.replace('7-Eleven ', '')}</b><small>{o.id} · {o.address}</small></div></div> },
          { key: 'pic', label: 'Person in charge', render: (o) => <div style={{ minWidth: 0 }}><span style={{ display: 'block' }}>{o.pic}</span><small className="muted">{o.phone}</small></div> },
          { key: 'district', label: 'District' },
          { key: 'june', label: 'June', align: 'r', render: (o) => num(o.june) },
          { key: 'allTime', label: 'All time', align: 'r', render: (o) => num(o.allTime) },
          { key: 'staff', label: 'Staff', align: 'r', render: (o) => o.staff.length },
          { key: 'status', label: 'Status', render: (o) => <Status>{o.status}</Status> },
          { key: 'act', label: 'Action', align: 'r', render: (o) => o.status === 'In review' ? <span className="small muted">With Microtek</span> : (
            <button className="btn sm outline" onClick={(e) => { e.stopPropagation(); toggle(o) }}>{o.status === 'Paused' ? <><Play /> Resume</> : <><Pause /> Pause</>}</button>
          ) },
        ]} empty={<Empty title="No outlets match">Try another search or district.</Empty>} />}
      </Card>

      {open && <OutletDrawer o={open} top={open.id === topId} onClose={() => setOpenId(null)} onToggle={() => toggle(open)} onEdit={() => { setOpenId(null); setEditId(open.id) }} />}
      {editing && <OutletForm o={editing} onClose={() => setEditId(null)} onSave={(patch) => { updateOutlet(editing.id, patch); setEditId(null); toast(`${patch.name} saved`) }} />}
      {adding && <AddOutlet onClose={() => setAdding(false)} onAdd={(o) => { addOutlet(o); setAdding(false); toast('Outlet sent to Microtek. Staff can confirm codes once it is approved.') }} />}
    </MShell>
  )
}

const PAGE = 12
function OutletCards({ rows, topId, onOpen, onEdit, onToggle }) {
  const [n, setN] = useState(PAGE)
  if (!rows.length) return <Empty title="No outlets match">Try another search or district.</Empty>
  const top = rows.find((o) => o.id === topId)
  const rest = rows.filter((o) => o.id !== topId).slice(0, top ? n - 1 : n)
  return (
    <>
      <div className="grid g-3 mx-outlets">
        {[top, ...rest].filter(Boolean).map((o) => (
          <article key={o.id} className={'mx-outlet' + (o.id === topId ? ' top' : '')}>
            <button type="button" className="mx-outlet-main" onClick={() => onOpen(o.id)} aria-label={`${o.name}, see staff and details`}>
              <div className="row between" style={{ gap: 8, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}><b>{o.name}</b><small>{o.address}</small></div>
                <Status>{o.status}</Status>
              </div>
              {o.id === topId && <span className="mx-topbadge"><Award size={14} aria-hidden="true" /> Busiest outlet in June</span>}
              <dl className="mx-outlet-kv">
                <div><dt><UserRound size={14} aria-hidden="true" /> Person in charge</dt><dd>{o.pic}</dd></div>
                <div><dt><Phone size={14} aria-hidden="true" /> Phone</dt><dd>{o.phone}</dd></div>
                <div><dt><CheckCircle2 size={14} aria-hidden="true" /> Redemptions in June</dt><dd>{num(o.june)}</dd></div>
              </dl>
            </button>
            <div className="mx-outlet-act">
              <button className="btn sm outline" onClick={() => onEdit(o.id)}><Pencil /> Edit</button>
              {o.status === 'In review'
                ? <span className="small muted" style={{ alignSelf: 'center' }}>With Microtek</span>
                : <button className="btn sm outline" onClick={() => onToggle(o)}>{o.status === 'Paused' ? <><Play /> Resume</> : <><Pause /> Pause</>}</button>}
            </div>
          </article>
        ))}
      </div>
      {rows.length > n && (
        <div className="row" style={{ justifyContent: 'center', marginTop: 16, gap: 10 }}>
          <span className="small muted">Showing {n} of {rows.length}</span>
          <button className="btn outline sm" onClick={() => setN(n + PAGE)}>Show more</button>
        </div>
      )}
    </>
  )
}

function OutletDrawer({ o, top, onClose, onToggle, onEdit }) {
  const { updateOutlet } = useMerchant()
  const toast = useToast()
  const [name, setName] = useState('')
  const [role, setRole] = useState('Cashier')
  const add = () => {
    if (!name.trim()) return
    updateOutlet(o.id, (x) => ({ staff: [...x.staff, { id: x.id + '-S' + Date.now(), name: name.trim(), role, added: '17 Jun 2027' }] }))
    setName('')
    toast(`${name.trim()} can now confirm redemptions at this outlet`)
  }
  return (
    <Drawer title={o.name} sub={`${o.id} · ${o.address}`} onClose={onClose}
      footer={<><button className="btn outline" onClick={onEdit}><Pencil /> Edit</button>{o.status !== 'In review' && <button className="btn outline" onClick={onToggle}>{o.status === 'Paused' ? <><Play /> Resume outlet</> : <><Pause /> Pause outlet</>}</button>}<button className="btn primary" onClick={onClose}>Done</button></>}>
      <div className="row between"><span className="row" style={{ gap: 8 }}><Status>{o.status}</Status>{top && <span className="mx-topbadge"><Award size={14} aria-hidden="true" /> Busiest in June</span>}</span><span className="small muted">{o.district}</span></div>
      <dl className="kv">
        <div><dt>Person in charge</dt><dd>{o.pic}</dd></div>
        <div><dt>Outlet phone</dt><dd>{o.phone || '—'}</dd></div>
      </dl>
      <div className="grid g-2 keep2" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <div className="mx-mini"><small>June</small><b>{num(o.june)}</b></div>
        <div className="mx-mini"><small>All time</small><b>{num(o.allTime)}</b></div>
      </div>
      {o.status === 'Paused' && <Callout tone="warn" icon={Pause}>This outlet is paused. Its staff cannot confirm codes and workers do not see it in the perk details.</Callout>}
      {o.status === 'In review' && <Callout icon={Info}>Microtek is checking this outlet. Staff can confirm codes once it is approved.</Callout>}
      <div>
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>Staff who can confirm redemptions</h3>
        <p className="small muted">They sign in on the counter tablet with their own PIN.</p>
        <div className="list-rows" style={{ marginTop: 8 }}>
          {o.staff.map((s) => (
            <div key={s.id}>
              <div className="row" style={{ minWidth: 0 }}>
                <span className="avatar">{s.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                <div style={{ minWidth: 0 }}><b style={{ display: 'block', fontSize: 13.5 }}>{s.name}</b><small className="muted">{s.role} · added {s.added}</small></div>
              </div>
              <button className="btn ghost sm icon" aria-label={'Remove ' + s.name} onClick={() => { updateOutlet(o.id, (x) => ({ staff: x.staff.filter((y) => y.id !== s.id) })); toast(`${s.name} removed`) }}><Trash2 /></button>
            </div>
          ))}
          {o.staff.length === 0 && <p className="small muted">No staff yet.</p>}
        </div>
      </div>
      <div className="mx-addstaff">
        <Field label="Add a staff member"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></Field>
        <Field label="Role"><select className="select" value={role} onChange={(e) => setRole(e.target.value)}><option>Cashier</option><option>Store manager</option></select></Field>
        <button className="btn" onClick={add} disabled={!name.trim()}><UserPlus /> Add</button>
      </div>
    </Drawer>
  )
}

function AddOutlet({ onClose, onAdd }) {
  const [f, setF] = useState({ name: '', district: 'kk', address: '', manager: '', phone: '' })
  const [tried, setTried] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const errs = { name: !f.name.trim() && 'Enter the outlet name.', address: !f.address.trim() && 'Enter the street address.', manager: !f.manager.trim() && 'Enter the store manager’s name.' }
  const save = () => {
    setTried(true)
    if (Object.values(errs).some(Boolean)) return
    const nm = f.name.trim().startsWith('7-Eleven') ? f.name.trim() : '7-Eleven ' + f.name.trim()
    onAdd({ name: nm, district: districtName(f.district), districtId: f.district, address: f.address.trim(), status: 'In review', june: 0, allTime: 0, weight: 1, redemptions: 0, pic: f.manager.trim(), phone: f.phone.trim() || '—',
      staff: [{ id: 'new-' + Date.now(), name: f.manager.trim(), role: 'Store manager', added: '17 Jun 2027' }] })
  }
  return (
    <Drawer title="Add outlet" sub="Microtek checks new outlets, usually within 1 working day" onClose={onClose}
      footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={save}><Plus /> Add outlet</button></>}>
      <Field label="Outlet name" error={tried && errs.name}><input className="input" value={f.name} onChange={set('name')} placeholder="7-Eleven Jalan Pantai" /></Field>
      <Field label="District"><select className="select" value={f.district} onChange={set('district')}>{districtOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</select></Field>
      <Field label="Address" error={tried && errs.address}><textarea className="input" style={{ minHeight: 80 }} value={f.address} onChange={set('address')} placeholder="Lot 12, Jalan Pantai, 88000 Kota Kinabalu" /></Field>
      <div className="form-grid">
        <Field label="Store manager" error={tried && errs.manager}><input className="input" value={f.manager} onChange={set('manager')} placeholder="Full name" /></Field>
        <Field label="Outlet phone (optional)"><input className="input" value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="088 123 456" /></Field>
      </div>
      <Callout>The store manager can confirm redemptions once Microtek approves the outlet. Add cashiers from the outlet page later.</Callout>
    </Drawer>
  )
}

// Edit an outlet's details. Name and address changes are checked by Microtek; the outlet keeps working meanwhile.
function OutletForm({ o, onClose, onSave }) {
  const [f, setF] = useState({ name: o.name, district: o.districtId, address: o.address, pic: o.pic, phone: o.phone === '—' ? '' : o.phone })
  const [tried, setTried] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const errs = {
    name: !f.name.trim() && 'Enter the outlet name.',
    address: !f.address.trim() && 'Enter the street address.',
    pic: !f.pic.trim() && 'Enter the person in charge.',
    phone: f.phone.trim() && f.phone.replace(/\D/g, '').length < 9 && 'Enter a phone number with the area code, for example 088 123 456.',
  }
  const moved = f.name.trim() !== o.name || f.address.trim() !== o.address || f.district !== o.districtId
  const save = () => {
    setTried(true)
    if (Object.values(errs).some(Boolean)) return
    onSave({ name: f.name.trim(), district: districtName(f.district), districtId: f.district, address: f.address.trim(), pic: f.pic.trim(), phone: f.phone.trim() || '—' })
  }
  return (
    <Drawer title="Edit outlet" sub={`${o.id} · ${o.name}`} onClose={onClose}
      footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={save}>Save</button></>}>
      <Field label="Outlet name" error={tried && errs.name}><input className="input" value={f.name} onChange={set('name')} /></Field>
      <Field label="District"><select className="select" value={f.district} onChange={set('district')}>{districtOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</select></Field>
      <Field label="Address" error={tried && errs.address}><textarea className="input" style={{ minHeight: 80 }} value={f.address} onChange={set('address')} /></Field>
      <div className="form-grid">
        <Field label="Person in charge" error={tried && errs.pic}><input className="input" value={f.pic} onChange={set('pic')} /></Field>
        <Field label="Outlet phone (optional)" error={tried && errs.phone}><input className="input" value={f.phone} onChange={set('phone')} inputMode="tel" /></Field>
      </div>
      {moved
        ? <Callout tone="warn" icon={Info}>Microtek is told about the new name or address and checks it within 1 working day. The outlet keeps confirming codes meanwhile.</Callout>
        : <Callout>To stop this outlet confirming codes, use Pause instead of editing it. Every change is written to the audit log.</Callout>}
    </Drawer>
  )
}
