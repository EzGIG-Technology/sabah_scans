import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Download, ShieldCheck, CreditCard, CalendarClock, Receipt, UserX, SlidersHorizontal, X, CheckCircle2, Clock, AlertTriangle, Smartphone } from 'lucide-react'
import { PageHead, Card, Status, Callout, Tabs, SearchInput, Table, Empty, Avatar, Modal, Field, useToast } from '../../components/ui.jsx'
import { rm, num, pct, RATE } from '../../data/demo.js'
import { EmpShell, WStatus, Who, permitText } from './shell.jsx'
import { COMPANY, useRoster, summarise, useEmp, historyFor, monthLabel, CUR } from './data.js'

const TABS = ['All', 'Not paid', 'Permit ends soon']
const BUCKETS = [
  { value: 'paid', label: 'Paid for June' },
  { value: 'due', label: 'Due this month' },
  { value: 'late', label: '1–2 months overdue' },
  { value: 'risk', label: '3+ months overdue' },
]
const PERMIT = [{ value: '30', label: 'Permit ends within 30 days' }, { value: '90', label: 'Permit ends within 90 days' }]
const NO_FILTER = { buckets: [], permit: '', nat: [], consent: '', app: '' }

/* Figma "Filter" modal (893:58210): status, permit renewal window and nationality, plus consent and app use. */
function FilterModal({ value, natOptions, onApply, onClose }) {
  const [f, setF] = useState(value)
  const tog = (key, v) => setF({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] })
  return (
    <Modal title="Filter workers" onClose={onClose} actions={<>
      <button className="btn ghost" onClick={() => setF(NO_FILTER)}>Clear all</button>
      <span className="grow" />
      <button className="btn outline" onClick={onClose}>Cancel</button>
      <button className="btn primary" onClick={() => onApply(f)}>Apply</button>
    </>}>
      <p className="small muted" style={{ marginTop: -6, marginBottom: 10 }}>Choose as many as you need.</p>
      <div className="emp-fsec"><fieldset className="emp-fgroup"><legend>June 2027 status</legend>
        <div className="emp-fgrid">{BUCKETS.map((b) => (
          <label key={b.value} className="check"><input type="checkbox" checked={f.buckets.includes(b.value)} onChange={() => tog('buckets', b.value)} /><span>{b.label}</span></label>
        ))}</div>
      </fieldset></div>
      <div className="emp-fsec"><fieldset className="emp-fgroup"><legend>Permit renewal</legend>
        <div className="emp-fgrid">
          {[{ value: '', label: 'Any date' }, ...PERMIT].map((o) => (
            <label key={o.value} className="check"><input type="radio" name="permit" checked={f.permit === o.value} onChange={() => setF({ ...f, permit: o.value })} /><span>{o.label}</span></label>
          ))}
        </div>
        <small className="muted">From JIM, for planning only. It has nothing to do with contributions.</small>
      </fieldset></div>
      <div className="emp-fsec"><fieldset className="emp-fgroup"><legend>Nationality</legend>
        <div className="emp-fgrid">{natOptions.map((n) => (
          <label key={n} className="check"><input type="checkbox" checked={f.nat.includes(n)} onChange={() => tog('nat', n)} /><span>{n}</span></label>
        ))}</div>
      </fieldset></div>
      <div className="emp-fsec"><div className="emp-fgrid">
        <Field label="Consent to company payment">
          <select className="select" value={f.consent} onChange={(e) => setF({ ...f, consent: e.target.value })}>
            <option value="">Any</option><option value="yes">Given</option><option value="no">Not given</option>
          </select>
        </Field>
        <Field label="SCANS app">
          <select className="select" value={f.app} onChange={(e) => setF({ ...f, app: e.target.value })}>
            <option value="">Any</option><option value="yes">Uses the app</option><option value="no">Not using it recently</option>
          </select>
        </Field>
      </div></div>
    </Modal>
  )
}

function chipsFor(f) {
  const out = []
  f.buckets.forEach((b) => out.push({ k: 'buckets', v: b, label: BUCKETS.find((x) => x.value === b).label }))
  if (f.permit) out.push({ k: 'permit', v: f.permit, label: PERMIT.find((x) => x.value === f.permit).label })
  f.nat.forEach((n) => out.push({ k: 'nat', v: n, label: n }))
  if (f.consent) out.push({ k: 'consent', v: f.consent, label: f.consent === 'yes' ? 'Consent given' : 'No consent' })
  if (f.app) out.push({ k: 'app', v: f.app, label: f.app === 'yes' ? 'Uses the app' : 'Not using the app' })
  return out
}

export function WorkersList() {
  const roster = useRoster()
  const s = summarise(roster)
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'All'
  const [q, setQ] = useState('')
  const [f, setF] = useState(() => {
    const b = params.get('status')
    return BUCKETS.some((x) => x.value === b) ? { ...NO_FILTER, buckets: [b] } : NO_FILTER
  })
  const [open, setOpen] = useState(false)
  const go = useNavigate()
  const toast = useToast()
  const soon = (w) => w.permitDays <= 60
  const natOptions = [...new Set(roster.map((w) => w.nationality))].sort()
  const counts = { All: roster.length, 'Not paid': roster.filter((w) => w.bucket !== 'paid').length, 'Permit ends soon': roster.filter(soon).length }
  const rows = roster
    .filter((w) => tab === 'All' || (tab === 'Not paid' ? w.bucket !== 'paid' : soon(w)))
    .filter((w) => !f.buckets.length || f.buckets.includes(w.bucket))
    .filter((w) => !f.permit || (w.permitDays >= 0 && w.permitDays <= Number(f.permit)))
    .filter((w) => !f.nat.length || f.nat.includes(w.nationality))
    .filter((w) => !f.consent || (f.consent === 'yes' ? w.consent : !w.consent))
    .filter((w) => !f.app || (f.app === 'yes' ? w.appActive : !w.appActive))
    .filter((w) => !q || (w.name + ' ' + w.id + ' ' + w.role).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (tab === 'Permit ends soon' ? a.permitDays - b.permitDays : tab === 'Not paid' ? b.owing - a.owing : 0))
  const chips = chipsFor(f)
  const only = (b) => setF(f.buckets.length === 1 && f.buckets[0] === b ? NO_FILTER : { ...NO_FILTER, buckets: [b] })
  const removeChip = (c) => setF({ ...f, [c.k]: Array.isArray(f[c.k]) ? f[c.k].filter((x) => x !== c.v) : '' })
  const tiles = [
    { b: 'paid', label: 'Paid for June', v: s.paid, note: `${pct(s.rate, 1)} of ${num(s.total)}`, tone: 'ok', Icon: CheckCircle2, click: false },
    { b: 'due', label: 'Due this month', v: s.due, note: 'No earlier months owing', tone: '', Icon: Clock, click: true },
    { b: 'late', label: '1–2 months overdue', v: s.late, note: 'Caution', tone: 'warn', Icon: AlertTriangle, click: true },
    { b: 'risk', label: '3+ months overdue', v: s.risk, note: 'Critical', tone: 'bad', Icon: AlertTriangle, click: true },
    { b: 'app', label: 'Not using the app', v: s.total - COMPANY.appUsers, note: `${num(COMPANY.appUsers)} workers use it`, tone: 'grey', Icon: Smartphone, click: false },
  ]
  return (
    <EmpShell title="Workers">
      <PageHead title="Workers" sub={`${num(s.total)} workers registered to ${COMPANY.name} in eNORES. This list shows every worker who has not paid for June and a sample of those who have. Records can only be corrected through JTK Sabah.`}>
        <button className="btn outline" onClick={() => toast(`Worker list downloaded as CSV (${num(rows.length)} rows). The download is recorded in the audit log.`)}><Download /> Download list</button>
        <Link to="/employer/pay" className="btn primary"><CreditCard /> Pay for workers</Link>
      </PageHead>
      <div className="emp-tiles">
        {tiles.map((t) => {
          const body = (<>
            <span className="row" style={{ gap: 8 }}><span className={'emp-ic ' + t.tone} style={{ width: 30, height: 30, borderRadius: 9 }}><t.Icon size={16} /></span><span className="small ink2">{t.label}</span></span>
            <span className="v num" style={{ color: t.tone && t.tone !== 'grey' ? `var(--${t.tone})` : undefined }}>{num(t.v)}</span>
            <small>{t.note}</small>
          </>)
          return t.click
            ? <button key={t.b} type="button" className="emp-tile" aria-pressed={f.buckets.length === 1 && f.buckets[0] === t.b} onClick={() => only(t.b)} title={`Show only: ${t.label}`}>{body}</button>
            : <div key={t.b} className="emp-tile">{body}</div>
        })}
      </div>
      <Card>
        <Tabs label="Filter workers" value={tab} onChange={(t) => setParams(t === 'All' ? {} : { tab: t })} items={TABS.map((t) => ({ value: t, label: t, count: counts[t] }))} />
        <div className="toolbar" style={{ margin: '16px 0 12px' }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search name, SCANS ID or job" />
          <button className="btn outline emp-filterbtn" onClick={() => setOpen(true)}><SlidersHorizontal /> Filter{chips.length > 0 && <span className="n">{chips.length}</span>}</button>
        </div>
        {chips.length > 0 && (
          <div className="emp-filters" aria-label="Active filters">
            {chips.map((c) => <span key={c.k + c.v} className="chip">{c.label}<button type="button" aria-label={`Remove filter: ${c.label}`} onClick={() => removeChip(c)}><X size={14} /></button></span>)}
            <button className="btn ghost sm" onClick={() => setF(NO_FILTER)}>Clear all</button>
            <span className="small muted num">{num(rows.length)} {rows.length === 1 ? 'worker' : 'workers'}</span>
          </div>
        )}
        {tab === 'Permit ends soon' && <Callout icon={CalendarClock} style={{ marginBottom: 12 }}>Permit dates come from JIM and are shown for renewal planning only. They do not affect contributions, and late payment never affects a permit.</Callout>}
        <Table rows={rows} onRowClick={(w) => go('/employer/workers/' + w.id)} pageSize={10}
          empty={<Empty title={q || chips.length ? 'No worker matches' : 'Nobody here'}>{q || chips.length ? <>Check the spelling, search by SCANS ID or clear the filters. <div style={{ marginTop: 12 }}><button className="btn outline sm" onClick={() => { setQ(''); setF(NO_FILTER) }}>Clear search and filters</button></div></> : 'Every worker in this view is up to date.'}</Empty>}
          columns={[
            { key: 'name', label: 'Worker', render: (w) => <Who w={w} /> },
            { key: 'nationality', label: 'Nationality' },
            { key: 'role', label: 'Job' },
            { key: 'status', label: 'June 2027', render: (w) => <WStatus w={w} /> },
            { key: 'paidThrough', label: 'Paid up to' },
            { key: 'owing', label: 'Owing', align: 'r', render: (w) => <span className="num" style={{ whiteSpace: 'nowrap', fontWeight: 600, color: w.owing ? (w.bucket === 'risk' ? 'var(--bad)' : 'var(--ink)') : 'var(--ink3)' }}>{rm(w.owing)}</span> },
            { key: 'consent', label: 'Consent', render: (w) => <Status tone={w.consent ? 'ok' : 'grey'}>{w.consent ? 'Given' : 'Not given'}</Status> },
            { key: 'app', label: 'App', render: (w) => <span className={'pill ' + (w.appActive ? 'info' : 'grey')} style={{ whiteSpace: 'nowrap' }}>{w.appActive ? 'Uses app' : 'Not recently'}</span> },
            { key: 'permit', label: 'Permit valid until', render: (w) => <span className={w.permitDays <= 60 ? '' : 'muted'} style={{ color: w.permitDays < 0 ? 'var(--ink3)' : w.permitDays <= 60 ? 'var(--warn)' : undefined }}>{permitText(w)}</span> },
          ]} />
      </Card>
      {open && <FilterModal value={f} natOptions={natOptions} onClose={() => setOpen(false)} onApply={(v) => { setF(v); setOpen(false) }} />}
    </EmpShell>
  )
}

/* Twelve months of 2027 for one worker: who paid each month, what is owing, what is ahead. */
function Months({ w, history, added }) {
  const cells = Array.from({ length: 12 }, (_, m) => {
    const label = monthLabel(m)
    if (m <= w.paidIdx) {
      const h = history.find((p) => p.month === monthLabel(m, true))
      const company = m > w.paidIdx - added || (h && h.by === COMPANY.name)
      return { m, label, cls: company ? 'company' : 'self', text: company ? 'Paid by company' : 'Paid' }
    }
    if (m < CUR) return { m, label, cls: 'owing', text: 'Not paid' }
    if (m === CUR) return { m, label, cls: 'due', text: 'Due 5 Jun' }
    return { m, label, cls: 'ahead', text: 'Not due yet' }
  })
  return (
    <div className="stack">
      <div className="emp-stat2">
        <div><small>Owing now</small><b className="num" style={{ color: w.bucket === 'risk' ? 'var(--bad)' : undefined }}>{rm(w.owing)}</b></div>
        <div><small>Monthly contribution</small><b className="num">{rm(RATE)}</b></div>
        <div><small>Paid up to</small><b>{w.paidThrough}</b></div>
      </div>
      <div className="emp-months" role="list" aria-label="Months of 2027">
        {cells.map((c) => <div key={c.m} role="listitem" className={'emp-month ' + c.cls}><b>{c.label.split(' ')[0]}</b><small>{c.text}</small></div>)}
      </div>
      <div className="legend">
        <span><i style={{ background: 'var(--okFill)' }} />Paid by the worker</span>
        <span><i style={{ background: 'var(--purple)' }} />Paid by your company</span>
        <span><i style={{ background: 'var(--info)' }} />Due this month</span>
        <span><i style={{ background: 'var(--bad)' }} />Not paid</span>
      </div>
    </div>
  )
}

export function WorkerProfile() {
  const { id } = useParams()
  const roster = useRoster()
  const st = useEmp()
  const go = useNavigate()
  const [tab, setTab] = useState('Contribution')
  const w = roster.find((x) => x.id === id)
  if (!w) {
    return (
      <EmpShell title="Worker">
        <PageHead title="Worker not found" back="/employer/workers" />
        <Card><Empty icon={UserX} title="We could not find this worker">The SCANS ID may be wrong, or the worker is no longer registered to your company in eNORES. <div style={{ marginTop: 14 }}><Link to="/employer/workers" className="btn">Back to workers</Link></div></Empty></Card>
      </EmpShell>
    )
  }
  const history = historyFor(w, st.batches)
  const permitShare = Math.max(0, Math.min(1, w.permitDays / 730))
  return (
    <EmpShell title="Worker">
      <PageHead title="Contribution status" back="/employer/workers" crumbs={[{ label: 'Workers', to: '/employer/workers' }, { label: w.name }]}>
        {w.consent && w.owing > 0 && <button className="btn primary" onClick={() => go('/employer/pay?w=' + w.id)}><CreditCard /> Pay for this worker</button>}
        {w.consent && w.owing === 0 && <button className="btn outline" onClick={() => go('/employer/pay?w=' + w.id)}><CreditCard /> Pay months ahead</button>}
      </PageHead>
      <div className="grid g-profile">
        <Card>
          <div className="emp-prof">
            <Avatar name={w.name} size="lg" grad />
            <h2>{w.name}</h2>
            <span className="muted num">{w.id}</span>
            <span className="small muted">{w.role} · {COMPANY.site}</span>
            <div className="emp-owing">
              <div><b className="num" style={{ color: w.bucket === 'risk' ? 'var(--bad)' : undefined }}>{rm(w.owing)}</b><small>{w.owing ? `Owing, ${w.owingMonths} ${w.owingMonths === 1 ? 'month' : 'months'} including June` : 'Nothing owing'}</small></div>
              <WStatus w={w} />
            </div>
            <div style={{ width: '100%', textAlign: 'left', marginTop: 14 }}>
              <div className="row between small"><b>Permit valid until</b><span className="muted">{w.permitDays < 0 ? 'Ended' : `${num(w.permitDays)} days left`}</span></div>
              <div className="bar" style={{ marginTop: 8 }}><span style={{ width: permitShare * 100 + '%', background: w.permitDays <= 60 ? 'linear-gradient(90deg,#FF8A1F,#FFB020)' : undefined }} /></div>
              <p className="small muted" style={{ marginTop: 6 }}>{w.permitExpiry}, from JIM. For planning only. It has nothing to do with contributions.</p>
            </div>
          </div>
        </Card>
        <Card>
          <Tabs label="Worker details" value={tab} onChange={setTab} items={['Contribution', { value: 'Months', label: 'Months covered' }, { value: 'History', label: 'Payment history', count: history.length }]} />
          <div style={{ marginTop: 18 }}>
            {tab === 'Months' ? <Months w={w} history={history} added={st.paidAdd[w.id] || 0} /> : tab === 'Contribution' ? (
              <div className="stack">
                <dl className="kv">
                  <div><dt>SCANS ID</dt><dd className="num">{w.id}</dd></div>
                  <div><dt>Job</dt><dd>{w.role}</dd></div>
                  <div><dt>Nationality</dt><dd>{w.nationality}</dd></div>
                  <div><dt>Work site</dt><dd>{COMPANY.site}</dd></div>
                  <div><dt>June 2027</dt><dd><WStatus w={w} /></dd></div>
                  <div><dt>Paid up to</dt><dd>{w.paidThrough}</dd></div>
                  <div><dt>Amount owing</dt><dd className="num">{rm(w.owing)}</dd></div>
                  <div><dt>Next month due</dt><dd>{monthLabel(Math.max(w.paidIdx + 1, CUR), true)}</dd></div>
                  <div><dt>Uses the SCANS app</dt><dd>{w.appActive ? 'Yes' : 'Not recently'}</dd></div>
                  <div><dt>Consent to employer payment</dt><dd><Status tone={w.consent ? 'ok' : 'grey'}>{w.consent ? 'Given in the app' : 'Not given'}</Status></dd></div>
                </dl>
                {!w.consent && (
                  <Callout tone="warn">{w.name} has not agreed to let the company pay for them, so you cannot pay for this worker. They can still pay themselves in the app, at 7-Eleven or online. Only the worker can give consent, in the app under Me.</Callout>
                )}
                <Callout icon={ShieldCheck}>You see this worker’s contribution status only. Wages, complaints and immigration details are not shared with employers.</Callout>
              </div>
            ) : history.length === 0 ? (
              <Empty icon={Receipt} title="No payments yet">Nothing has been paid for this worker since SCANS started in January 2027.</Empty>
            ) : (
              <Table rows={history} pageSize={8} columns={[
                { key: 'id', label: 'Receipt', render: (p) => <b className="num">{p.id}</b> },
                { key: 'month', label: 'For' },
                { key: 'date', label: 'Paid on' },
                { key: 'by', label: 'Paid by', render: (p) => (p.by === COMPANY.name ? 'Your company' : 'The worker') },
                { key: 'method', label: 'Method' },
                { key: 'amount', label: 'Amount', align: 'r', render: (p) => <b className="num">{rm(p.amount)}</b> },
              ]} />
            )}
          </div>
        </Card>
      </div>
    </EmpShell>
  )
}
