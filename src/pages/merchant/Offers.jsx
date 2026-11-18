import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { Plus, Eye, CheckCircle2, Percent, Pause, Play, Pencil, Ban, Copy, Trash2, Hourglass, Send, ShieldCheck, LayoutGrid, List, ChevronRight, ChevronLeft, Save, Info, Lock, Undo2 } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Tabs, SearchInput, Seg, Field, Stepper, Modal, Callout, Empty, LineChart, HBarChart, Table, useToast } from '../../components/ui.jsx'
import { num, pct } from '../../data/demo.js'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'
import { categories, limits, districtOptions, districtName, discountLabel, outletsForOffer, offerMonthly, split, NOW } from './data.js'
import { OfferThumb, PerkPhone, fmtDate, toIso } from './parts.jsx'

const TABS = [
  { value: 'live', label: 'Live', match: ['Live', 'Paused'] },
  { value: 'waiting', label: 'Waiting for approval', match: ['Waiting for approval'] },
  { value: 'draft', label: 'Draft', match: ['Draft'] },
  { value: 'expired', label: 'Expired', match: ['Expired', 'Ended'] },
]
const conv = (o) => (o.views ? o.redemptions / o.views : 0)

/* =====================================================================
   List
   ===================================================================== */
export function OffersList() {
  const { offers } = useMerchant()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'live'
  const [q, setQ] = useState('')
  const [view, setView] = useState('cards')
  const t = TABS.find((x) => x.value === tab) || TABS[0]
  const list = offers.filter((o) => t.match.includes(o.status) && o.title.toLowerCase().includes(q.toLowerCase()))
  const live = offers.filter((o) => o.status === 'Live')
  const views = offers.reduce((s, o) => s + o.views, 0)
  const reds = offers.reduce((s, o) => s + o.redemptions, 0)

  return (
    <MShell title="Offer management">
      <PageHead title="Offer management" sub="Every new or changed offer is checked by Microtek before workers see it. Only workers whose contribution is up to date can use your perks.">
        <Link className="btn primary" to="/merchant/offers/new"><Plus /> New offer</Link>
      </PageHead>

      <div className="grid g-4 keep2">
        <Kpi icon={CheckCircle2} tone="ok" label="Live offers" value={num(live.length)} note="Shown in the worker app" />
        <Kpi icon={Eye} label="Views, all offers" value={num(views)} note="Times a worker opened a perk" />
        <Kpi icon={CheckCircle2} label="Redemptions" value={num(reds)} note="Confirmed at the counter" />
        <Kpi icon={Percent} tone="purple" label="Views that led to a use" value={pct(reds / views, 1)} note="All offers, all time" />
      </div>

      <Card>
        <Tabs label="Offer status" value={tab} onChange={(v) => setParams({ tab: v })}
          items={TABS.map((x) => ({ value: x.value, label: x.label, count: offers.filter((o) => x.match.includes(o.status)).length }))} />
        <div className="toolbar" style={{ margin: '16px 0' }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search offers" />
          <Seg label="Layout" value={view} onChange={setView} items={[{ value: 'cards', label: <><LayoutGrid size={15} /> Cards</> }, { value: 'table', label: <><List size={15} /> Table</> }]} />
        </div>
        {list.length === 0 ? (
          <Empty title={q ? 'No offers match' : 'No offers here'}>
            {q ? 'Try another word.' : tab === 'draft' ? 'Offers you save without sending appear here.' : 'Offers will appear here when their status changes.'}
            {!q && <div style={{ marginTop: 14 }}><Link className="btn primary sm" to="/merchant/offers/new"><Plus /> New offer</Link></div>}
          </Empty>
        ) : view === 'cards' ? (
          <div className="grid g-3 mx-offers">
            {list.map((o) => <OfferCard key={o.id} o={o} />)}
          </div>
        ) : (
          <OfferTable rows={list} />
        )}
      </Card>
    </MShell>
  )
}

function OfferCard({ o }) {
  return (
    <Link to={'/merchant/offers/' + o.id} className="mx-offer">
      <div className="mx-offer-top">
        <OfferThumb offer={o} />
        <div className="grow">
          <b>{o.title}</b>
          <small>{o.category} · {o.outlets}</small>
        </div>
      </div>
      <div className="row between wrap" style={{ gap: 8 }}>
        <Status>{o.status}</Status>
        <span className="small muted">{o.status === 'Draft' ? 'Not sent yet' : o.status === 'Waiting for approval' ? 'Sent ' + o.submitted : `${o.starts} to ${o.ends}`}</span>
      </div>
      {o.status === 'Waiting for approval' || o.status === 'Draft' ? (
        <div className="mx-offer-note">
          {o.status === 'Draft' ? <><Pencil size={14} /> Finish the details and send it to Microtek</> : <><Hourglass size={14} /> Microtek replies within 2 working days</>}
        </div>
      ) : (
        <>
          <div className="mx-offer-stats">
            <div><small>Views</small><b>{num(o.views)}</b></div>
            <div><small>Redemptions</small><b>{num(o.redemptions)}</b></div>
            <div><small>Conversion</small><b>{pct(conv(o), 1)}</b></div>
          </div>
          <div className="bar"><span style={{ width: Math.min(100, conv(o) * 300) + '%' }} /></div>
        </>
      )}
    </Link>
  )
}

function OfferTable({ rows }) {
  const go = useNavigate()
  return (
    <Table rows={rows} onRowClick={(o) => go('/merchant/offers/' + o.id)} columns={[
      { key: 'title', label: 'Offer', render: (o) => <div className="who"><OfferThumb offer={o} /><div style={{ minWidth: 0 }}><b>{o.title}</b><small>{o.category}</small></div></div> },
      { key: 'dates', label: 'Runs', render: (o) => (o.starts === '—' ? '—' : `${o.starts} to ${o.ends}`) },
      { key: 'views', label: 'Views', align: 'r', render: (o) => num(o.views) },
      { key: 'redemptions', label: 'Redemptions', align: 'r', render: (o) => num(o.redemptions) },
      { key: 'conv', label: 'Conversion', align: 'r', render: (o) => (o.views ? pct(conv(o), 1) : '—') },
      { key: 'status', label: 'Status', render: (o) => <Status>{o.status}</Status> },
    ]} />
  )
}

/* =====================================================================
   New / edit offer
   ===================================================================== */
const STEPS = ['Details', 'Rules', 'Outlets', 'Preview']
const blank = { title: '', category: 'Top-up', type: 'amount', value: '', minSpend: '', what: '', starts: '2027-07-01', ends: '2027-08-31', limit: 'One a month', terms: '', outletMode: 'all', districts: [], outletIds: [] }

function formFromOffer(o) {
  return {
    title: o.title, category: o.category, type: o.type || 'amount', value: o.value || '', minSpend: o.minSpend || '', what: o.what || '',
    starts: toIso(o.starts), ends: toIso(o.ends), limit: limits.includes(o.limit) ? o.limit : 'One a month', terms: o.terms || '',
    outletMode: o.outletIds && o.outletIds.length ? 'pick' : o.districtsIn ? 'districts' : 'all', districts: o.districtsIn || [], outletIds: o.outletIds || [],
  }
}

function outletsText(f, outlets) {
  if (f.outletMode === 'all') return 'All outlets'
  if (f.outletMode === 'districts') return f.districts.map(districtName).join(', ') || 'No district chosen'
  const n = f.outletIds.length
  return n === 1 ? outlets.find((o) => o.id === f.outletIds[0])?.name : `${n} chosen outlets`
}

export function OfferNew() {
  const loc = useLocation()
  const copyOf = loc.state && loc.state.copy
  return <OfferForm initial={copyOf ? { ...formFromOffer(copyOf), starts: blank.starts, ends: blank.ends } : blank} mode="new" />
}

export function OfferEdit() {
  const { id } = useParams()
  const { offers } = useMerchant()
  const o = offers.find((x) => x.id === id)
  if (!o) return <NotFound />
  return <OfferForm initial={formFromOffer(o)} mode="edit" offer={o} />
}

function OfferForm({ initial, mode, offer }) {
  const { outlets, addOffer, updateOffer } = useMerchant()
  const toast = useToast()
  const go = useNavigate()
  const [step, setStep] = useState(0)
  const [f, setF] = useState(initial)
  const [tried, setTried] = useState(false)
  const [ack, setAck] = useState(false)
  const [outletQ, setOutletQ] = useState('')
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v && v.target ? v.target.value : v }))

  const errors = useMemo(() => {
    const e = {}
    if (!f.title.trim()) e.title = 'Give the offer a short title.'
    else if (f.title.length > 60) e.title = 'Keep the title under 60 characters so it fits on a phone.'
    if (f.type !== 'free' && !(Number(f.value) > 0)) e.value = f.type === 'percent' ? 'Enter a percentage, for example 10.' : 'Enter an amount in RM, for example 3.'
    if (f.type === 'percent' && Number(f.value) > 50) e.value = 'Percent off can be 50 or less.'
    if (f.type === 'free' && !f.value.trim()) e.value = 'Say what is free, for example 600ml water.'
    if (!f.starts) e.starts = 'Choose a start date.'
    else if (f.starts < '2027-06-21') e.starts = 'Start on 21 Jun 2027 or later. Microtek needs up to 2 working days to check it.'
    if (!f.ends) e.ends = 'Choose an end date.'
    else if (f.starts && f.ends <= f.starts) e.ends = 'The end date must be after the start date.'
    if (f.outletMode === 'districts' && !f.districts.length) e.outlets = 'Choose at least one district.'
    if (f.outletMode === 'pick' && !f.outletIds.length) e.outlets = 'Choose at least one outlet.'
    return e
  }, [f])
  const stepFields = [['title', 'value'], ['starts', 'ends'], ['outlets'], []]
  const stepOk = (i) => !stepFields[i].some((k) => errors[k])

  const label = discountLabel(f.type, f.value)
  const preview = {
    title: f.title, discountText: label, what: f.what, limit: f.limit, terms: f.terms,
    starts: fmtDate(f.starts), ends: fmtDate(f.ends), outletsText: outletsText(f, outlets),
  }
  const toOffer = (status) => ({
    title: f.title.trim() || 'Untitled offer', category: f.category, type: f.type, value: f.value, minSpend: f.minSpend, what: f.what, terms: f.terms,
    discount: f.type === 'amount' ? 'RM' + f.value : f.type === 'percent' ? f.value + '%' : 'Free item',
    starts: fmtDate(f.starts) || '—', ends: fmtDate(f.ends) || '—', limit: f.limit,
    districtsIn: f.outletMode === 'districts' ? f.districts : null, outletIds: f.outletMode === 'pick' ? f.outletIds : [],
    outlets: outletsText(f, outlets), status,
    submitted: status === 'Waiting for approval' ? NOW : null,
  })

  const next = () => {
    setTried(true)
    if (!stepOk(step)) return
    setTried(false)
    setStep(step + 1)
    window.scrollTo(0, 0)
  }
  const saveDraft = () => {
    if (mode === 'edit' && offer.status !== 'Draft') {
      // A live offer keeps running; a draft of the change is not kept in this prototype.
      toast('Changes discarded. The offer is unchanged.')
      go('/merchant/offers/' + offer.id)
      return
    }
    if (mode === 'edit') { updateOffer(offer.id, toOffer('Draft')); toast('Draft saved'); go('/merchant/offers?tab=draft'); return }
    addOffer({ ...toOffer('Draft'), redemptions: 0, views: 0, june: 0, ref: '' })
    toast('Saved as a draft. Nothing is sent to Microtek yet.')
    go('/merchant/offers?tab=draft')
  }
  const submit = () => {
    setTried(true)
    const bad = [0, 1, 2].find((i) => !stepOk(i))
    if (bad != null) { setStep(bad); return }
    if (!ack) return
    const ref = 'OS-2706-0' + (22 + Math.floor(Math.random() * 70))
    if (mode === 'edit') {
      updateOffer(offer.id, { ...toOffer('Waiting for approval'), ref, changeOf: offer.status === 'Draft' ? null : offer.status })
      toast('Sent to Microtek for approval')
      go('/merchant/offers/' + offer.id)
    } else {
      const id = addOffer({ ...toOffer('Waiting for approval'), ref, redemptions: 0, views: 0, june: 0 })
      toast('Sent to Microtek for approval')
      go('/merchant/offers/' + id)
    }
  }

  const editingLive = mode === 'edit' && offer.status !== 'Draft'
  const visibleOutlets = outlets.filter((o) => (o.name + o.district).toLowerCase().includes(outletQ.toLowerCase()))
  const err = (k) => (tried ? errors[k] : undefined)

  return (
    <MShell title={mode === 'new' ? 'New offer' : 'Edit offer'}>
      <PageHead title={mode === 'new' ? 'New offer' : editingLive ? 'Change ' + offer.title : 'Finish ' + offer.title} back={mode === 'new' ? '/merchant/offers' : '/merchant/offers/' + offer.id}
        crumbs={[{ label: 'Offer management', to: '/merchant/offers' }, { label: mode === 'new' ? 'New offer' : 'Edit' }]}
        sub="Keep it simple: one saving, plain conditions. Microtek checks it before workers see it." />

      {editingLive && <Callout tone="warn" icon={Info}>Changes go back to Microtek for approval. Until they approve, the offer is shown as waiting for approval.</Callout>}

      <div className="grid mx-form-grid">
        <Card>
          <Stepper steps={STEPS} current={step} />
          <div className="mx-step">
            {step === 0 && (
              <div className="form-grid">
                <Field label="Offer title" full hint="What the worker sees first. For example: RM3 off a RM30 prepaid reload" error={err('title')}>
                  <input className={'input' + (err('title') ? ' err' : '')} value={f.title} onChange={set('title')} maxLength={80} placeholder="RM2 off any phone top-up of RM20 or more" />
                </Field>
                <Field label="Category">
                  <select className="select" value={f.category} onChange={set('category')}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
                </Field>
                <div className="field">
                  <span>Discount type</span>
                  <Seg label="Discount type" value={f.type} onChange={(v) => setF((x) => ({ ...x, type: v, value: '' }))} items={[{ value: 'amount', label: 'RM off' }, { value: 'percent', label: '% off' }, { value: 'free', label: 'Free item' }]} />
                </div>
                <Field label={f.type === 'amount' ? 'Amount off (RM)' : f.type === 'percent' ? 'Percent off' : 'What is free'} error={err('value')}>
                  <div className="mx-affix">
                    {f.type === 'amount' && <span>RM</span>}
                    <input className={'input' + (err('value') ? ' err' : '')} value={f.value} onChange={set('value')} inputMode={f.type === 'free' ? 'text' : 'decimal'} placeholder={f.type === 'free' ? '600ml water' : f.type === 'percent' ? '10' : '3'} />
                    {f.type === 'percent' && <span>%</span>}
                  </div>
                </Field>
                <Field label="Minimum spend (RM, optional)" hint="Leave empty if there is none">
                  <div className="mx-affix"><span>RM</span><input className="input" value={f.minSpend} onChange={set('minSpend')} inputMode="decimal" placeholder="30" /></div>
                </Field>
                <Field label="What the worker gets, in one line" full hint="Short sentences translate better into the six worker languages">
                  <input className="input" value={f.what} onChange={set('what')} placeholder="RM2 off when you top up RM20 or more for any network." />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="form-grid">
                <Field label="Starts" error={err('starts')}><input type="date" className={'input' + (err('starts') ? ' err' : '')} value={f.starts} onChange={set('starts')} /></Field>
                <Field label="Ends" error={err('ends')}><input type="date" className={'input' + (err('ends') ? ' err' : '')} value={f.ends} onChange={set('ends')} /></Field>
                <div className="field full">
                  <span>Limit per worker</span>
                  <div className="chips">{limits.map((l) => <button type="button" key={l} className="chip" aria-pressed={f.limit === l} onClick={() => set('limit')(l)}>{l}</button>)}</div>
                </div>
                <div className="field full">
                  <span>Who can use it</span>
                  <div className="mx-locked"><Lock size={16} aria-hidden="true" /><div><b>Workers whose contribution is up to date</b><small>Set by SCANS. Offers cannot be aimed at a nationality, employer or any personal detail.</small></div></div>
                </div>
                <Field label="Terms and conditions" full hint="Where, when and what is not included. Plain words.">
                  <textarea className="input" value={f.terms} onChange={set('terms')} placeholder="One use a month. Not for cigarettes or phone cards. Cannot be used with other promotions." />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="stack">
                <div className="grid g-3 mx-modes">
                  {[['all', 'All outlets', `${outlets.filter((o) => o.status !== 'Paused').length} active outlets`], ['districts', 'By district', 'Choose one or more districts'], ['pick', 'Choose outlets', 'Pick outlets one by one']].map(([v, l, s]) => (
                    <button type="button" key={v} className="option" aria-pressed={f.outletMode === v} onClick={() => set('outletMode')(v)}>
                      <span className="radio" /><span><b style={{ display: 'block' }}>{l}</b><small className="muted">{s}</small></span>
                    </button>
                  ))}
                </div>
                {f.outletMode === 'districts' && (
                  <div className="chips">
                    {districtOptions.map((d) => {
                      const on = f.districts.includes(d.value)
                      const n = outlets.filter((o) => o.districtId === d.value).length
                      return <button type="button" key={d.value} className="chip" aria-pressed={on} onClick={() => set('districts')(on ? f.districts.filter((x) => x !== d.value) : [...f.districts, d.value])}>{d.label} · {n}</button>
                    })}
                  </div>
                )}
                {f.outletMode === 'pick' && (
                  <div className="stack" style={{ gap: 10 }}>
                    <div className="toolbar">
                      <SearchInput value={outletQ} onChange={setOutletQ} placeholder="Search outlets or districts" />
                      <span className="small muted">{f.outletIds.length} chosen</span>
                    </div>
                    <div className="mx-picklist">
                      {visibleOutlets.map((o) => {
                        const on = f.outletIds.includes(o.id)
                        return (
                          <label key={o.id} className="check">
                            <input type="checkbox" checked={on} disabled={o.status === 'Paused'} onChange={() => set('outletIds')(on ? f.outletIds.filter((x) => x !== o.id) : [...f.outletIds, o.id])} />
                            <span className="grow">{o.name}<small className="muted" style={{ display: 'block' }}>{o.district}{o.status === 'Paused' ? ' · paused' : ''}</small></span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
                {err('outlets') && <Callout tone="bad">{err('outlets')}</Callout>}
                <Callout>Staff at the chosen outlets confirm the code at the counter. A perk counts as used only after they confirm it.</Callout>
              </div>
            )}

            {step === 3 && (
              <div className="stack">
                <dl className="kv">
                  <div><dt>Title</dt><dd>{f.title}</dd></div>
                  <div><dt>Discount</dt><dd>{label}{f.minSpend ? ` on RM${f.minSpend} or more` : ''}</dd></div>
                  <div><dt>Category</dt><dd>{f.category}</dd></div>
                  <div><dt>Runs</dt><dd>{fmtDate(f.starts)} to {fmtDate(f.ends)}</dd></div>
                  <div><dt>Limit per worker</dt><dd>{f.limit}</dd></div>
                  <div><dt>Outlets</dt><dd>{preview.outletsText}</dd></div>
                  <div style={{ gridColumn: '1 / -1' }}><dt>Terms</dt><dd style={{ fontWeight: 400 }}>{f.terms || 'None added'}</dd></div>
                </dl>
                <div className="mx-timeline">
                  <div className="on"><span><Send size={14} /></span><div><b>You send it</b><small>Today</small></div></div>
                  <div><span><ShieldCheck size={14} /></span><div><b>Microtek checks it</b><small>Within 2 working days</small></div></div>
                  <div><span><CheckCircle2 size={14} /></span><div><b>Live for workers</b><small>From {fmtDate(f.starts)}</small></div></div>
                </div>
                <label className="check">
                  <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                  <span>We will honour this offer at the chosen outlets, confirm each use at the counter, and not ask workers for personal details or use SCANS for advertising.</span>
                </label>
                {tried && !ack && <Callout tone="bad">Tick the box to confirm before you send it.</Callout>}
              </div>
            )}
          </div>

          <div className="mx-form-foot">
            {step > 0 ? <button className="btn outline" onClick={() => setStep(step - 1)}><ChevronLeft /> Back</button> : <Link className="btn outline" to="/merchant/offers">Cancel</Link>}
            <span className="grow" />
            <button className="btn ghost" onClick={saveDraft}><Save /> {editingLive ? 'Discard changes' : 'Save as draft'}</button>
            {step < 3 ? <button className="btn primary" onClick={next}>Next <ChevronRight /></button>
              : <button className="btn primary" onClick={submit}><Send /> {editingLive ? 'Send changes for approval' : 'Send for approval'}</button>}
          </div>
        </Card>

        <div className="mx-preview-col">
          <Card title="How workers see it" sub="Live preview in the SCANS worker app">
            <PerkPhone offer={preview} />
          </Card>
        </div>
      </div>
    </MShell>
  )
}

/* =====================================================================
   Detail
   ===================================================================== */
function NotFound() {
  return (
    <MShell title="Offer">
      <Card><Empty title="We could not find this offer">It may have been deleted. <div style={{ marginTop: 14 }}><Link className="btn primary sm" to="/merchant/offers">Back to offers</Link></div></Empty></Card>
    </MShell>
  )
}

export function OfferDetail() {
  const { id } = useParams()
  const { offers, outlets, updateOffer } = useMerchant()
  const toast = useToast()
  const go = useNavigate()
  const [modal, setModal] = useState(null)
  const o = offers.find((x) => x.id === id)
  if (!o) return <NotFound />

  const isLive = o.status === 'Live' || o.status === 'Paused'
  const done = o.status === 'Expired' || o.status === 'Ended'
  const allMonths = offerMonthly(o)
  const first = allMonths.findIndex((m) => m.value > 0)
  const monthly = allMonths.slice(Math.max(0, Math.min(first, allMonths.length - 2)))
  const part = outletsForOffer(o, outlets).filter((x) => x.status !== 'Paused' || x.allTime > 0)
  const counts = split(o.redemptions, part.map((x) => x.weight || 1))
  const byOutlet = part.map((x, i) => ({ label: x.name.replace('7-Eleven ', ''), value: counts[i] })).sort((a, b) => b.value - a.value).slice(0, 8)
  const label = discountLabel(o.type, o.value)

  const actions = (
    <>
      {isLive && (o.status === 'Live'
        ? <button className="btn outline" onClick={() => { updateOffer(o.id, { status: 'Paused' }); toast('Offer paused. Workers no longer see it.') }}><Pause /> Pause</button>
        : <button className="btn outline" onClick={() => { updateOffer(o.id, { status: 'Live' }); toast('Offer is live again') }}><Play /> Resume</button>)}
      {(isLive || o.status === 'Waiting for approval') && <button className="btn outline" onClick={() => setModal('edit')}><Pencil /> Edit</button>}
      {o.status === 'Waiting for approval' && <button className="btn outline" onClick={() => setModal('withdraw')}><Undo2 /> Withdraw</button>}
      {isLive && <button className="btn danger" onClick={() => setModal('end')}><Ban /> End offer</button>}
      {o.status === 'Draft' && <button className="btn danger" onClick={() => setModal('delete')}><Trash2 /> Delete draft</button>}
      {o.status === 'Draft' && <Link className="btn primary" to={`/merchant/offers/${o.id}/edit`}><Pencil /> Continue editing</Link>}
      {done && <button className="btn primary" onClick={() => go('/merchant/offers/new', { state: { copy: o } })}><Copy /> Run again</button>}
    </>
  )

  return (
    <MShell title="Offer details">
      <PageHead title={o.title} back="/merchant/offers" crumbs={[{ label: 'Offer management', to: '/merchant/offers' }, { label: o.status }]}
        sub={`${o.category} · ${o.outlets}${o.ref ? ' · Microtek ref ' + o.ref : ''}`}>
        {actions}
      </PageHead>

      {o.status === 'Waiting for approval' && (
        <Card>
          <div className="mx-timeline wide">
            <div className="on"><span><Send size={14} /></span><div><b>Sent to Microtek</b><small>{o.submitted}</small></div></div>
            <div className="now"><span><Hourglass size={14} /></span><div><b>Microtek is checking it</b><small>Usually within 2 working days</small></div></div>
            <div><span><CheckCircle2 size={14} /></span><div><b>Live for workers</b><small>From {o.starts}</small></div></div>
          </div>
          {o.changeOf && <p className="small muted" style={{ marginTop: 12 }}>This is a change to a live offer. Workers see it again once Microtek approves.</p>}
        </Card>
      )}
      {o.status === 'Paused' && <Callout tone="warn" icon={Pause}>This offer is paused. Workers do not see it and codes cannot be confirmed until you resume it.</Callout>}
      {o.status === 'Draft' && <Callout icon={Pencil}>This draft has not been sent. Finish it and send it to Microtek for approval.</Callout>}

      {(o.views > 0 || isLive || done) && <>
      <div className="grid g-4 keep2">
        <Kpi hero icon={Eye} label="Views" value={num(o.views)} note="Workers who opened the perk" />
        <Kpi icon={CheckCircle2} tone="ok" label="Redemptions" value={num(o.redemptions)} note="Confirmed at the counter" />
        <Kpi icon={Percent} tone="purple" label="Conversion" value={o.views ? pct(conv(o), 1) : '—'} note="Views that led to a use" />
        <Kpi icon={CheckCircle2} label="This month" value={num(o.june || 0)} note="1 to 17 June 2027" />
      </div>

      <div className="grid g-main">
        <Card title="Redemptions over time" sub="Confirmed redemptions per month, 2027">
          {o.redemptions ? <LineChart data={monthly} format={num} height={300} /> : <Empty title="No redemptions yet">Figures appear once the offer is live and staff confirm the first code.</Empty>}
        </Card>
        <Card title="By outlet" sub={o.redemptions ? `All time, top ${byOutlet.length} of ${part.length} outlets` : 'Outlets taking part'}>
          {o.redemptions ? <HBarChart data={byOutlet} /> : <Empty title={`${part.length} outlets`}>{o.outlets}</Empty>}
        </Card>
      </div>
      </>}

      <div className="grid g-main" style={{ alignItems: 'start' }}>
        <Card title="Offer details">
          <dl className="kv">
            <div><dt>Discount</dt><dd>{label}{o.minSpend ? ` on RM${o.minSpend} or more` : ''}</dd></div>
            <div><dt>Category</dt><dd>{o.category}</dd></div>
            <div><dt>Runs</dt><dd>{o.starts === '—' ? 'Not set' : `${o.starts} to ${o.ends}`}</dd></div>
            <div><dt>Limit per worker</dt><dd>{o.limit}</dd></div>
            <div><dt>Outlets</dt><dd>{o.outlets}</dd></div>
            <div><dt>Who can use it</dt><dd>Workers whose contribution is up to date</dd></div>
            <div style={{ gridColumn: '1 / -1' }}><dt>What the worker gets</dt><dd style={{ fontWeight: 400 }}>{o.what || '—'}</dd></div>
            <div style={{ gridColumn: '1 / -1' }}><dt>Terms</dt><dd style={{ fontWeight: 400 }}>{o.terms || '—'}</dd></div>
          </dl>
        </Card>
        <Card title="In the worker app">
          <PerkPhone offer={{ ...o, discountText: label, outletsText: o.outlets }} />
        </Card>
      </div>

      {modal === 'end' && (
        <Modal title="End this offer?" onClose={() => setModal(null)} actions={<><button className="btn outline" onClick={() => setModal(null)}>Keep it running</button><button className="btn danger" onClick={() => { updateOffer(o.id, { status: 'Ended', ends: NOW }); setModal(null); toast('Offer ended. Workers no longer see it.') }}><Ban /> End offer</button></>}>
          <p className="ink2">Workers stop seeing <b>{o.title}</b> straight away. Codes already on screen can still be confirmed for 5 minutes. An ended offer cannot be restarted, but you can copy it into a new one.</p>
        </Modal>
      )}
      {modal === 'edit' && (
        <Modal title="Edit this offer?" onClose={() => setModal(null)} actions={<><button className="btn outline" onClick={() => setModal(null)}>Cancel</button><Link className="btn primary" to={`/merchant/offers/${o.id}/edit`}><Pencil /> Continue to edit</Link></>}>
          <p className="ink2">Any change goes back to Microtek for approval before workers see it. Microtek usually replies within 2 working days.</p>
        </Modal>
      )}
      {modal === 'withdraw' && (
        <Modal title="Withdraw from review?" onClose={() => setModal(null)} actions={<><button className="btn outline" onClick={() => setModal(null)}>Cancel</button><button className="btn primary" onClick={() => { updateOffer(o.id, { status: 'Draft', submitted: null }); setModal(null); toast('Withdrawn. The offer is a draft again.') }}>Withdraw</button></>}>
          <p className="ink2">Microtek stops checking it and the offer goes back to your drafts. You can change it and send it again.</p>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title="Delete this draft?" onClose={() => setModal(null)} actions={<><button className="btn outline" onClick={() => setModal(null)}>Cancel</button><button className="btn danger" onClick={() => { updateOffer(o.id, { status: 'Deleted' }); toast('Draft deleted'); go('/merchant/offers?tab=draft') }}><Trash2 /> Delete</button></>}>
          <p className="ink2">The draft has not been sent to anyone. Deleting it cannot be undone.</p>
        </Modal>
      )}
    </MShell>
  )
}
