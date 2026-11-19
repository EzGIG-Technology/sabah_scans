// Merchants: directory (cards or list), onboarding queue and offer submissions,
// plus full pages for one application and one offer submission.
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Store, Receipt, FileCheck2, ClipboardCheck, Download, LayoutGrid, List, SlidersHorizontal, PencilLine, ChartLine, Check, X,
  CircleCheck, CircleAlert, MessageSquareWarning, Send, ChevronDown, Clock, ShieldCheck, Ban,
} from 'lucide-react'
import {
  PageHead, Card, Kpi, Status, Pill, Callout, Empty, Seg, Tabs, SearchInput, Field, Switch, Table, Modal, Mono, useToast,
} from '../../components/ui.jsx'
import { merchants, num } from '../../data/demo.js'
import { applicationDocs, offerCounts } from '../shared/data.js'
import { useStore, logEvent, updateOffer, updateApplication } from '../shared/store.js'
import { BASE, ROLE_APPLIED, APP_EXTRA, OFFER_EXTRA, merchantCategories } from './data.js'
import { useAdmin, setMerchantStatus } from './store.js'

/* Merchant status after any suspension made in this console. */
export function useMerchantState() {
  const over = useAdmin((s) => s.merchantStatus)
  return (m) => ({ status: (over[m.id] && over[m.id].status) || m.status, reason: over[m.id] && over[m.id].reason })
}

export function Merchants() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'dir'
  const offerSubs = useStore((s) => s.offerSubs)
  const apps = useStore((s) => s.merchantApps)
  const st = useMerchantState()
  const setTab = (t) => setParams(t === 'dir' ? {} : { tab: t })
  const toast = useToast()
  const openApps = apps.filter((a) => a.status === 'In review' || a.status === 'Needs info')
  return (
    <>
      <PageHead title="Merchants" sub="Partner shops that give perks to workers who are up to date, and cash collection points. Merchants never see worker records.">
        <button className="btn outline" onClick={() => { logEvent('Exported merchant list', `${merchants.length} merchants`); toast('Merchant list exported. The export is in the audit log.') }}><Download /> Export</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={Store} label="Active merchants" value={num(merchants.filter((m) => st(m).status === 'Active').length)} note={`${num(merchants.reduce((s, m) => s + (st(m).status === 'Active' ? m.outlets : 0), 0))} outlets`} />
        <Kpi icon={Receipt} tone="ok" label="Confirmed uses" value={num(merchants.reduce((s, m) => s + m.redemptions, 0))} note="Counted only after the shop confirms" />
        <Kpi icon={FileCheck2} tone="warn" label="Sign-ups to check" value={num(openApps.length)} note="Target: decide within 48 hours" />
        <Kpi icon={ClipboardCheck} tone="purple" label="Offers to review" value={num(offerSubs.filter((o) => o.status === 'Pending').length)} />
      </div>
      <Card>
        <Tabs items={[
          { value: 'dir', label: 'Directory', count: merchants.length },
          { value: 'apps', label: 'Onboarding', count: openApps.length },
          { value: 'offers', label: 'Offer submissions', count: offerSubs.filter((o) => o.status === 'Pending').length },
        ]} value={tab} onChange={setTab} label="Merchants" />
        <div style={{ paddingTop: 16 }}>
          {tab === 'dir' && <Directory />}
          {tab === 'apps' && <Applications />}
          {tab === 'offers' && <OfferSubs />}
        </div>
      </Card>
    </>
  )
}

/* ---------------- Directory ---------------- */
const STATUSES = ['Active', 'Pending', 'Suspended']

function Directory() {
  const go = useNavigate()
  const toast = useToast()
  const st = useMerchantState()
  const subs = useStore((s) => s.offerSubs)
  const [view, setView] = useState('grid')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState({ cats: [], statuses: [] })
  const [draft, setDraft] = useState(null)
  const [suspend, setSuspend] = useState(null)
  const [reason, setReason] = useState('')
  const rows = merchants.filter((m) => (!filter.cats.length || filter.cats.includes(m.category)) && (!filter.statuses.length || filter.statuses.includes(st(m).status)) && (!q || m.name.toLowerCase().includes(q.toLowerCase())))
  const nFilters = filter.cats.length + filter.statuses.length
  const toggleIn = (k, v) => setDraft({ ...draft, [k]: draft[k].includes(v) ? draft[k].filter((x) => x !== v) : [...draft[k], v] })

  const flip = (m) => {
    if (st(m).status === 'Suspended') {
      setMerchantStatus(m.id, 'Active')
      logEvent('Reinstated merchant', m.name)
      toast(`${m.name} reinstated. Their live offers show in the worker app again.`)
    } else { setSuspend(m); setReason('') }
  }
  const doSuspend = () => {
    setMerchantStatus(suspend.id, 'Suspended', reason.trim())
    logEvent('Suspended merchant', `${suspend.name} · ${reason.trim()}`)
    toast(`${suspend.name} suspended. The merchant is told the reason.`)
    setSuspend(null)
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="toolbar">
        <span className="b" style={{ color: 'var(--blue)', fontSize: 16 }}>{rows.length} merchant{rows.length === 1 ? '' : 's'}</span>
        <SearchInput value={q} onChange={setQ} placeholder="Search merchants" />
        <button className="btn outline" onClick={() => setDraft(filter)} aria-label={`Filter${nFilters ? `, ${nFilters} on` : ''}`}><SlidersHorizontal /> Filter{nFilters ? <span className="pill info" style={{ marginLeft: 4, padding: '0 8px' }}>{nFilters}</span> : null}</button>
        <Seg items={[{ value: 'grid', label: <LayoutGrid size={16} aria-label="Cards" /> }, { value: 'list', label: <List size={16} aria-label="List" /> }]} value={view} onChange={setView} label="View" />
      </div>
      {nFilters > 0 && (
        <div className="gv-active-filters">
          Showing {[...filter.cats, ...filter.statuses].join(', ')}
          <button className="btn ghost sm" onClick={() => setFilter({ cats: [], statuses: [] })}>Clear all</button>
        </div>
      )}
      {rows.length === 0 && <Empty title="No merchants found">Try another name or clear the filter.</Empty>}
      {view === 'grid' && rows.length > 0 && (
        <div className="gv-mgrid">
          {rows.map((m) => {
            const s = st(m)
            return (
              <article key={m.id} className={'ad-mcard' + (s.status === 'Suspended' ? ' off' : '')}>
                <div className="top">
                  <Mono name={m.name} color={m.color} size="lg" />
                  <div className="st">
                    <Status>{s.status}</Status>
                    {s.status !== 'Pending' && <Switch checked={s.status === 'Active'} onChange={() => flip(m)} label={(s.status === 'Active' ? 'Suspend ' : 'Reinstate ') + m.name} />}
                  </div>
                </div>
                <div>
                  <h3><Link to={`${BASE}/merchants/${m.id}`}>{m.name}</Link></h3>
                  <span className="small muted">{m.category} · {m.joined === '—' ? 'not live yet' : 'joined ' + m.joined}</span>
                </div>
                {s.reason && <span className="small" style={{ color: 'var(--bad)' }}>Suspended: {s.reason}</span>}
                <dl className="figs">
                  <div><dt>Confirmed uses</dt><dd>{num(m.redemptions)}</dd></div>
                  <div><dt>Offers</dt><dd>{offerCounts(m, subs).text}</dd></div>
                </dl>
                <div className="foot">
                  <button className="btn sm ghost" onClick={() => go(`${BASE}/merchants/${m.id}?tab=offers`)}><PencilLine /> Offers</button>
                  <button className="btn sm outline" onClick={() => go(`${BASE}/merchants/${m.id}`)}><ChartLine /> Analytics</button>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {view === 'list' && rows.length > 0 && (
        <Table rows={rows} onRowClick={(m) => go(`${BASE}/merchants/${m.id}`)} columns={[
          { key: 'name', label: 'Merchant', render: (m) => <div className="who"><Mono name={m.name} color={m.color} /><div><b>{m.name}</b><small>{m.company}</small></div></div> },
          { key: 'category', label: 'Category' },
          { key: 'role', label: 'Role', render: (m) => ROLE_APPLIED[m.id] },
          { key: 'outlets', label: 'Outlets', align: 'r', render: (m) => num(m.outlets) },
          { key: 'offers', label: 'Offers', align: 'r', render: (m) => offerCounts(m, subs).text },
          { key: 'redemptions', label: 'Confirmed uses', align: 'r', render: (m) => num(m.redemptions) },
          { key: 'status', label: 'Status', render: (m) => <Status>{st(m).status}</Status> },
        ]} />
      )}
      {draft && (
        <Modal title="Filter merchants" onClose={() => setDraft(null)} actions={<>
          <button className="btn ghost" onClick={() => setDraft({ cats: [], statuses: [] })}>Clear all</button>
          <button className="btn outline" onClick={() => setDraft(null)}>Cancel</button>
          <button className="btn primary" onClick={() => { setFilter(draft); setDraft(null) }}>Apply</button>
        </>}>
          <div className="ad-checks">
            <fieldset><legend>Category</legend>
              {merchantCategories.map((c) => <label key={c}><input type="checkbox" checked={draft.cats.includes(c)} onChange={() => toggleIn('cats', c)} />{c}</label>)}
            </fieldset>
            <fieldset><legend>Status</legend>
              {STATUSES.map((c) => <label key={c}><input type="checkbox" checked={draft.statuses.includes(c)} onChange={() => toggleIn('statuses', c)} />{c}</label>)}
            </fieldset>
          </div>
        </Modal>
      )}
      {suspend && (
        <Modal title={`Suspend ${suspend.name}?`} onClose={() => setSuspend(null)} actions={<><button className="btn outline" onClick={() => setSuspend(null)}>Cancel</button><button className="btn danger" disabled={reason.trim().length < 5} onClick={doSuspend}><Ban /> Suspend</button></>}>
          <p className="ink2" style={{ marginBottom: 14 }}>Their offers are hidden from workers until you reinstate them. Uses already confirmed stay. The merchant is told the reason.</p>
          <Field label="Reason" hint="The merchant sees this."><input className="input" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: perks refused at two outlets, under review" /></Field>
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Onboarding ---------------- */
const isOpen = (a) => a.status === 'In review' || a.status === 'Needs info'
const appMerchant = (a) => merchants.find((x) => x.name === a.merchant)

function Applications() {
  const go = useNavigate()
  const toast = useToast()
  const apps = useStore((s) => s.merchantApps)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const open = apps.filter(isOpen)
  const rows = apps.filter((a) => (status === 'All' || a.status === status) && (!q || a.merchant.toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="stack" style={{ gap: 18 }}>
      <div>
        <div className="gv-sub">Waiting for a decision</div>
        {open.length === 0 ? <Empty title="All caught up" icon={CircleCheck}>No applications are waiting.</Empty> : (
          <div className="ad-tiles">
            {open.map((a) => {
              const x = APP_EXTRA[a.id] || {}
              const m = appMerchant(a)
              const docs = applicationDocs[a.id] || []
              const okDocs = docs.every(([, ok]) => ok)
              return (
                <article key={a.id} className="ad-tile">
                  <div className="ph" style={{ backgroundImage: 'url(/img/portal-merchant.jpg)' }}>
                    <Mono name={a.merchant} color={m && m.color} size="lg" />
                    <Pill tone={x.risk === 'Low' ? 'ok' : 'warn'}>{x.risk} risk</Pill>
                  </div>
                  <div className="row between" style={{ gap: 8 }}>
                    <Status>{a.status}</Status>
                    <small className={x.hours > 48 ? 'ad-late' : 'muted'}><Clock size={13} style={{ verticalAlign: '-2px' }} /> {x.hours} hours waiting</small>
                  </div>
                  <div><h3>{a.merchant}</h3><small className="muted">{a.category} · {a.outlets} outlet{a.outlets > 1 ? 's' : ''} · {x.role}</small></div>
                  <div className="docs">
                    {docs.map(([d, ok]) => <div key={d} className={ok ? '' : 'no'}>{ok ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}{d}{ok ? '' : ' (missing)'}</div>)}
                  </div>
                  {x.note && <Callout tone="warn" style={{ padding: '8px 10px' }}><small>{x.note}</small></Callout>}
                  <div className="acts">
                    <button className="btn sm outline" onClick={() => { logEvent('Asked merchant for documents', `${a.id} · ${a.merchant}`); updateApplication(a.id, { status: 'Needs info', note: 'Please upload the missing documents.' }); toast(`Document request sent to ${a.merchant}`) }} disabled={okDocs}><MessageSquareWarning /> Ask for documents</button>
                    <span className="grow" />
                    <button className="btn sm primary" onClick={() => go(`${BASE}/merchants/applications/${a.id}`)}><FileCheck2 /> Review</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
      <div className="stack" style={{ gap: 12 }}>
        <div className="toolbar">
          <div className="gv-sub grow" style={{ margin: 0 }}>All applications</div>
          <SearchInput value={q} onChange={setQ} placeholder="Search applications" style={{ maxWidth: 260 }} />
          <label><span className="vh">Status</span><select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">{['All', 'In review', 'Needs info', 'Approved', 'Rejected'].map((s) => <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>)}</select></label>
        </div>
        <Table rows={rows} onRowClick={(r) => go(`${BASE}/merchants/applications/${r.id}`)} columns={[
          { key: 'no', label: 'No.', width: 50, render: (r) => apps.indexOf(r) + 1 },
          { key: 'merchant', label: 'Merchant', render: (r) => <div className="who"><Mono name={r.merchant} color={(appMerchant(r) || {}).color} /><div><b>{r.merchant}</b><small>{r.id}</small></div></div> },
          { key: 'ssm', label: 'Registration no.', render: (r) => <span className="num">{(appMerchant(r) || APP_EXTRA[r.id] || {}).ssm || '—'}</span> },
          { key: 'role', label: 'Applied as', render: (r) => (APP_EXTRA[r.id] || {}).role },
          { key: 'submitted', label: 'Submitted' },
          { key: 'docs', label: 'Documents', render: (r) => { const d = applicationDocs[r.id] || []; return <span className="num">{d.filter(([, ok]) => ok).length} of {d.length}</span> } },
          { key: 'status', label: 'Status', render: (r) => <Status>{r.status}</Status> },
          { key: 'view', label: '', align: 'r', render: () => <span className="small b" style={{ color: 'var(--blue)' }}>View</span> },
        ]} />
      </div>
    </div>
  )
}

/* One application, full page (Figma: Merchant Onboarding View) */
export function ApplicationPage() {
  const { id } = useParams()
  const go = useNavigate()
  const toast = useToast()
  const apps = useStore((s) => s.merchantApps)
  const a = apps.find((x) => x.id === id)
  const [tab, setTab] = useState('details')
  const [mode, setMode] = useState(null) // 'approve' | 'info' | 'reject'
  const [text, setText] = useState('')
  if (!a) return <><PageHead title="Application not found" back={BASE + '/merchants?tab=apps'} /><Card><Empty title="No application with this ID">Go back to the onboarding queue.</Empty></Card></>
  const x = APP_EXTRA[a.id] || {}
  const m = appMerchant(a) || {}
  const docs = applicationDocs[a.id] || []
  const allDocs = docs.every(([, ok]) => ok)
  const decided = a.status === 'Approved' || a.status === 'Rejected'
  const close = () => { setMode(null); setText('') }
  const decide = (status, msg, action) => {
    updateApplication(a.id, { status, note: text.trim() || undefined })
    logEvent(action, `${a.id} · ${a.merchant}`)
    toast(msg)
    close()
    if (status !== 'Needs info') go(BASE + '/merchants?tab=apps')
  }
  return (
    <>
      <PageHead title={a.merchant} back={BASE + '/merchants?tab=apps'} crumbs={[{ label: 'Merchants', to: BASE + '/merchants' }, { label: 'Onboarding', to: BASE + '/merchants?tab=apps' }, { label: a.id }]}>
        <span className="small muted">Submitted {a.submitted}</span>
        <Status>{a.status}</Status>
      </PageHead>
      <div className="ad-split">
        <Card>
          <div className="ad-head" style={{ marginBottom: 14 }}>
            <Mono name={a.merchant} color={m.color} size="lg" />
            <div><h2>{a.merchant}</h2><div className="meta">SSM {m.ssm || x.ssm || '—'} · {a.category}</div></div>
          </div>
          <Tabs items={[{ value: 'details', label: 'Details' }, { value: 'docs', label: 'Documents', count: docs.length }]} value={tab} onChange={setTab} label="Application" />
          <div style={{ paddingTop: 16 }}>
            {tab === 'details' && (
              <dl className="kv">
                <div><dt>Business name</dt><dd>{m.company || x.company || a.merchant}</dd></div>
                <div><dt>Business registration no.</dt><dd className="num">{m.ssm || x.ssm || '—'}</dd></div>
                <div><dt>Business category</dt><dd>{a.category}</dd></div>
                <div><dt>Applied as</dt><dd><Pill tone="warn">{x.role}</Pill></dd></div>
                <div><dt>Outlets</dt><dd className="num">{a.outlets}</dd></div>
                <div><dt>Person in charge</dt><dd>{m.contact || x.contact || '—'}</dd></div>
                <div><dt>Contact email</dt><dd>{m.email || '—'}</dd></div>
                <div><dt>Contact phone</dt><dd className="num">{x.phone || '—'}</dd></div>
                <div><dt>Merchant portal sign-in</dt><dd>{x.portalEmail || '—'}</dd></div>
                <div><dt>Risk check</dt><dd>{x.risk || '—'}</dd></div>
              </dl>
            )}
            {tab === 'docs' && (
              <div className="gv-check">
                {docs.map(([d, ok]) => (
                  <div key={d} className={ok ? 'yes' : 'no'}>{ok ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}<span>{d}</span><span className="act small muted">{ok ? 'Received, checked' : 'Missing'}</span></div>
                ))}
              </div>
            )}
          </div>
          {a.note && <Callout tone={a.status === 'Rejected' ? 'bad' : 'warn'} style={{ marginTop: 14 }}>Message sent: {a.note}</Callout>}
          {x.note && !a.note && <Callout tone="warn" style={{ marginTop: 14 }}>{x.note}</Callout>}
        </Card>
        <Card title="Actions">
          {decided ? <p className="small ink2">This application was {a.status.toLowerCase()}. The decision is in the audit log.</p> : (
            <div className="ad-actions">
              <button className="btn success" disabled={!allDocs} onClick={() => setMode('approve')}><Check /> Approve application</button>
              {!allDocs && <small className="muted">Every document must be received before you approve.</small>}
              <button className="btn danger" onClick={() => setMode('reject')}><X /> Reject application</button>
              <button className="btn outline" onClick={() => setMode('info')}><MessageSquareWarning /> Ask for more information</button>
            </div>
          )}
          <p className="small muted" style={{ marginTop: 14 }}>Merchants get no access to worker records. Approved merchants can submit offers, which Microtek reviews before they go live.</p>
        </Card>
      </div>
      {mode === 'approve' && (
        <Modal title="Approve this merchant?" onClose={close} actions={<><button className="btn outline" onClick={close}>Cancel</button><button className="btn success" onClick={() => decide('Approved', `${a.merchant} approved. They can now sign in and submit offers.`, 'Approved merchant sign-up')}><Check /> Approve</button></>}>
          <p className="ink2">{a.merchant} joins SCANS as a {(x.role || '').toLowerCase()} and is told through the merchant portal.</p>
        </Modal>
      )}
      {(mode === 'info' || mode === 'reject') && (
        <Modal title={mode === 'info' ? 'Ask for more information' : 'Reject application'} onClose={close} actions={<>
          <button className="btn outline" onClick={close}>Cancel</button>
          {mode === 'info'
            ? <button className="btn primary" disabled={text.trim().length < 5} onClick={() => decide('Needs info', `Asked ${a.merchant} for more information`, 'Asked merchant for more information')}><Send /> Send request</button>
            : <button className="btn danger" disabled={text.trim().length < 5} onClick={() => decide('Rejected', `${a.merchant} rejected. The reason was sent to them.`, 'Rejected merchant sign-up')}><X /> Reject</button>}
        </>}>
          <Field label={mode === 'info' ? 'What do you need from them?' : 'Reason for rejecting'} hint="The merchant sees this message.">
            <textarea className="input" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'info' ? 'For example: please upload the bank account statement for settlement' : 'For example: the business is outside Sabah'} />
          </Field>
        </Modal>
      )}
    </>
  )
}

/* ---------------- Offer submissions ---------------- */
function OfferSubs() {
  const go = useNavigate()
  const subs = useStore((s) => s.offerSubs)
  const [status, setStatus] = useState('All')
  const [q, setQ] = useState('')
  const rows = subs.filter((x) => (status === 'All' || x.status === status) && (!q || (x.merchant + x.title).toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Search merchant or offer" />
        <label><span className="vh">Status</span><select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">{['All', 'Pending', 'Approved', 'Rejected'].map((s) => <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>)}</select></label>
      </div>
      <Table rows={rows} onRowClick={(r) => go(`${BASE}/merchants/offers/${r.id}`)} columns={[
        { key: 'no', label: 'No.', render: (r) => subs.indexOf(r) + 1, width: 50 },
        { key: 'merchant', label: 'Merchant', render: (r) => <div className="who"><Mono name={r.merchant} color={(merchants.find((x) => x.name === r.merchant) || {}).color} /><b>{r.merchant}</b></div> },
        { key: 'title', label: 'Offer title' },
        { key: 'submitted', label: 'Date submitted' },
        { key: 'goLive', label: 'Go-live date' },
        { key: 'status', label: 'Status', render: (r) => <Status>{r.status}</Status> },
        { key: 'act', label: 'Actions', align: 'r', render: () => <span className="small b" style={{ color: 'var(--blue)' }}>View</span> },
      ]} />
    </div>
  )
}

/* One offer submission, full page (Figma: Offer Submissions View) */
export function OfferPage() {
  const { id } = useParams()
  const go = useNavigate()
  const toast = useToast()
  const subs = useStore((s) => s.offerSubs)
  const o = subs.find((x) => x.id === id)
  const st = useMerchantState()
  const [mode, setMode] = useState(null)
  const [reason, setReason] = useState('')
  if (!o) return <><PageHead title="Offer not found" back={BASE + '/merchants?tab=offers'} /><Card><Empty title="No offer with this ID">Go back to offer submissions.</Empty></Card></>
  const m = merchants.find((x) => x.name === o.merchant) || {}
  const x = OFFER_EXTRA[o.id] || { terms: [] }
  const active = m.id && st(m).status === 'Active'
  const close = () => { setMode(null); setReason('') }
  const decide = (status) => {
    updateOffer(o.id, { status, reason: status === 'Rejected' ? reason.trim() : undefined })
    logEvent(status === 'Approved' ? 'Approved merchant offer' : 'Rejected merchant offer', `${o.merchant} · ${o.title}`)
    toast(status === 'Approved' ? `Offer approved. It goes live in the worker app on ${o.goLive}.` : 'Offer rejected. The merchant can see your reason.')
    close()
    go(BASE + '/merchants?tab=offers')
  }
  return (
    <>
      <PageHead title={o.title} back={BASE + '/merchants?tab=offers'} crumbs={[{ label: 'Merchants', to: BASE + '/merchants' }, { label: 'Offer submissions', to: BASE + '/merchants?tab=offers' }, { label: o.id }]}>
        <Status>{o.status}</Status>
      </PageHead>
      <div className="ad-split">
        <div className="stack">
          <Card title="Offer details" action={<span className="row" style={{ gap: 8 }}><Mono name={o.merchant} color={m.color} /><b>{o.merchant}</b></span>}>
            <dl className="kv">
              <div style={{ gridColumn: '1 / -1' }}><dt>Offer title</dt><dd>{o.title}</dd></div>
              <div style={{ gridColumn: '1 / -1' }}><dt>Description</dt><dd style={{ fontWeight: 500 }}>{x.desc}</dd></div>
              <div><dt>Discount</dt><dd>{o.discount}</dd></div>
              <div><dt>Offer type</dt><dd>{x.type}</dd></div>
              <div><dt>Who sees it</dt><dd><Pill tone="ok">{o.audience}</Pill></dd></div>
              <div><dt>Limit</dt><dd>{o.limit}</dd></div>
              <div><dt>Go-live date</dt><dd>{o.goLive}</dd></div>
              <div><dt>End date</dt><dd>{x.expiry}</dd></div>
            </dl>
            <details className="ad-acc" style={{ marginTop: 16 }}>
              <summary>Terms and conditions <ChevronDown size={16} aria-hidden="true" /></summary>
              <ul>{x.terms.map((t) => <li key={t}>{t}</li>)}</ul>
            </details>
          </Card>
          <Card title="How workers see it" sub="Offer tile in the worker app">
            <div className="gv-offer">
              <div className="row between"><span className="row" style={{ gap: 10 }}><Mono name={o.merchant} color={m.color} /><b>{o.merchant}</b></span><span className="pill white">Preview</span></div>
              <span className="big">{o.discount}</span>
              <span className="t">{o.title}</span>
              <span className="small">{o.limit} · from {o.goLive} · {o.audience}</span>
              <span className="code">Show code at the counter</span>
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card title="Actions">
            {o.status !== 'Pending' ? <p className="small ink2">This offer was {o.status.toLowerCase()}.</p> : (
              <div className="ad-actions">
                <button className="btn success" disabled={!active} onClick={() => setMode('approve')}><Check /> Approve offer</button>
                {!active && <small className="muted">The merchant account must be active first.</small>}
                <button className="btn danger" onClick={() => setMode('reject')}><X /> Reject offer</button>
              </div>
            )}
            {o.reason && <Callout tone="bad" style={{ marginTop: 12 }}>Rejected: {o.reason}</Callout>}
          </Card>
          <Card title="Checks">
            <div className="gv-check">
              <div className="yes"><CircleCheck aria-hidden="true" />Terms are clear and in plain words</div>
              <div className="yes"><CircleCheck aria-hidden="true" />Needs no worker data from SCANS</div>
              <div className={active ? 'yes' : 'no'}>{active ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}Merchant account is active</div>
            </div>
            <p className="small muted" style={{ marginTop: 12 }}><ShieldCheck size={14} style={{ verticalAlign: '-2px' }} /> A perk counts as used only after the shop confirms it. Merchants never see worker records.</p>
          </Card>
        </div>
      </div>
      {mode === 'approve' && (
        <Modal title="Approve this offer?" onClose={close} actions={<><button className="btn outline" onClick={close}>Cancel</button><button className="btn success" onClick={() => decide('Approved')}><Check /> Approve</button></>}>
          <p className="ink2">The offer goes live in the worker app on {o.goLive}, for {o.audience.toLowerCase()}.</p>
        </Modal>
      )}
      {mode === 'reject' && (
        <Modal title="Reject this offer?" onClose={close} actions={<><button className="btn outline" onClick={close}>Cancel</button><button className="btn danger" disabled={reason.trim().length < 5} onClick={() => decide('Rejected')}><X /> Reject</button></>}>
          <Field label="Reason for rejecting" hint="The merchant sees this."><textarea className="input" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: the offer needs worker data SCANS does not share" /></Field>
        </Modal>
      )}
    </>
  )
}
