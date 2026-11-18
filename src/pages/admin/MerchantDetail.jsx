// One merchant: analytics, offers (edit, deactivate with a remark) and outlets.
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { MapPin, Store, Receipt, Users, Tag, CalendarDays, PencilLine, Power, Download, Ban } from 'lucide-react'
import {
  PageHead, Card, Kpi, Status, Pill, Callout, Empty, Seg, Tabs, Field, Switch, Table, Drawer, Modal, Mono, LineChart, HBarChart, Donut, useToast,
} from '../../components/ui.jsx'
import { merchants, num, pct } from '../../data/demo.js'
import { merchantDetail } from '../shared/data.js'
import { logEvent } from '../shared/store.js'
import { BASE, ROLE_APPLIED, ANALYTIC_PERIODS, merchantAnalytics } from './data.js'
import { useAdmin, setOfferOff } from './store.js'
import { useMerchantState } from './Merchants.jsx'

export default function MerchantDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'analytics'
  const setTab = (t) => setParams(t === 'analytics' ? {} : { tab: t }, { replace: true })
  const base = merchants.find((m) => m.id === id)
  const st = useMerchantState()
  const off = useAdmin((s) => s.offerOff)
  const [offers, setOffers] = useState(() => (base ? merchantDetail(base).live : []))
  const [period, setPeriod] = useState('6M')
  const [edit, setEdit] = useState(null)
  const [deact, setDeact] = useState(null)
  const [remark, setRemark] = useState('')
  useEffect(() => { if (base) logEvent('Viewed merchant', base.name) }, [id])
  if (!base) return <><PageHead title="Merchant not found" back={BASE + '/merchants'} /><Card><Empty title="No merchant with this ID">Go back to the merchant directory.</Empty></Card></>
  const m = merchantDetail(base)
  const s = st(m)
  const key = (o) => `${m.id}:${o.id}`
  const statusOf = (o) => (off[key(o)] != null ? 'Paused' : o.status)
  const live = offers.filter((o) => statusOf(o) === 'Live')
  const A = merchantAnalytics(m, offers, period)
  const change = A.prev ? (A.uses - A.prev) / A.prev : null

  const save = (o) => {
    setOffers(offers.map((x) => (x.id === o.id ? o : x)))
    logEvent('Edited merchant offer', `${m.name} · ${o.title}`)
    toast('Offer saved. The merchant is told about the change.')
    setEdit(null)
  }
  const doDeact = () => {
    setOfferOff(key(deact), remark.trim())
    logEvent('Deactivated merchant offer', `${m.name} · ${deact.title} · ${remark.trim()}`)
    toast(`${deact.title} deactivated. Workers no longer see it.`)
    setDeact(null); setRemark('')
  }
  const reactivate = (o) => {
    setOfferOff(key(o), null)
    logEvent('Reactivated merchant offer', `${m.name} · ${o.title}`)
    toast(`${o.title} is live again`)
  }

  return (
    <>
      <PageHead title={m.name} back={BASE + '/merchants'} crumbs={[{ label: 'Merchants', to: BASE + '/merchants' }, { label: m.name }]}>
        <button className="btn outline" onClick={() => { logEvent('Exported merchant analytics', `${m.name} · ${period}`); toast('Merchant analytics exported. The export is in the audit log.') }}><Download /> Export</button>
      </PageHead>
      <Card>
        <div className="gv-head-card">
          <Mono name={m.name} color={m.color} size="lg" />
          <div className="grow"><h2>{m.name}</h2><div className="meta"><span>{m.company}</span><span>SSM {m.ssm}</span><span>{m.category}</span><span>{ROLE_APPLIED[m.id]}</span></div></div>
          <Status>{s.status}</Status>
        </div>
        {s.reason && <Callout tone="bad" icon={Ban} style={{ marginTop: 14 }}>Suspended: {s.reason}. Offers are hidden from workers until reinstated.</Callout>}
      </Card>

      <Card>
        <Tabs items={[{ value: 'analytics', label: 'Analytics' }, { value: 'offers', label: 'Offers', count: offers.length }, { value: 'outlets', label: 'Outlets and contact', count: m.outlets }]} value={tab} onChange={setTab} label="Merchant" />
        <div style={{ paddingTop: 16 }} className="stack">
          {tab === 'analytics' && (m.redemptions === 0 ? <Empty title="No uses yet">This merchant has not gone live. Figures appear after the first confirmed use.</Empty> : (
            <>
              <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
                <span className="small muted">{period === '1M' ? 'June 2027, by week' : period === '3M' ? 'April to June 2027' : 'January to June 2027'}. Counted only after the shop confirms.</span>
                <Seg items={ANALYTIC_PERIODS} value={period} onChange={setPeriod} label="Period" />
              </div>
              <div className="grid g-4 keep2">
                <Kpi icon={Users} label="Workers who used a perk" value={num(A.workersUsed)} note="Counted once each" />
                <Kpi icon={Receipt} tone="ok" label="Confirmed uses" value={num(A.uses)} delta={change != null ? (change >= 0 ? '+' : '') + pct(change) : null} down={change != null && change < 0} note={change != null ? 'against the period before' : 'Since go-live'} />
                <Kpi icon={Store} tone="purple" label="Live offers" value={num(live.length)} />
                <Kpi icon={MapPin} label="Outlets" value={num(m.outlets)} note={`Joined ${m.joined}`} />
              </div>
              <div className="ad-two" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
                <div>
                  <div className="gv-sub">Confirmed uses</div>
                  <LineChart data={A.points} height={230} />
                </div>
              </div>
              <div className="ad-two">
                <div>
                  <div className="gv-sub">Top offers</div>
                  {A.offers.length ? <HBarChart data={A.offers} /> : <Empty title="No offer uses in this period" />}
                </div>
                <div>
                  <div className="gv-sub">Who used perks, by nationality</div>
                  <Donut data={A.nat} center={num(A.workersUsed)} centerSub="workers" size={160} format={(v) => num(v)} />
                  <p className="small muted" style={{ marginTop: 10 }}>Totals only. Merchants never see who the workers are.</p>
                </div>
              </div>
            </>
          ))}

          {tab === 'offers' && (
            <>
              <div className="row between" style={{ flexWrap: 'wrap', gap: 8 }}>
                <span className="small muted">Edits and deactivations are logged and the merchant is told.</span>
                <Pill tone="info">{live.length} live offer{live.length === 1 ? '' : 's'}</Pill>
              </div>
              {offers.length === 0 ? <Empty title="No offers yet">Offers the merchant submits appear here after review.</Empty> : (
                <div>
                  {offers.map((o) => {
                    const stt = statusOf(o)
                    return (
                      <div className="ad-orow" key={o.id}>
                        <span className="ic"><Tag aria-hidden="true" /></span>
                        <div className="t">
                          <b>{o.title}</b>
                          <span className="tags"><Status>{stt}</Status>{o.category && <Pill tone="grey">{o.category}</Pill>}</span>
                          <p>{o.discount && o.discount !== '—' ? `${o.discount} · ` : ''}{o.limit} · {o.outlets}</p>
                          <div className="m"><span><CalendarDays aria-hidden="true" /> Ends {o.ends}</span><span><Users aria-hidden="true" /> {num(o.redemptions)} confirmed uses</span></div>
                          {off[key(o)] && <p style={{ color: 'var(--bad)', marginTop: 6 }}>Deactivated: {off[key(o)]}</p>}
                        </div>
                        <div className="a">
                          <button className="btn sm outline" onClick={() => setEdit(o)}><PencilLine /> Edit</button>
                          {stt === 'Live' && <button className="btn sm danger" onClick={() => { setDeact(o); setRemark('') }}><Power /> Deactivate</button>}
                          {off[key(o)] != null && <button className="btn sm success" onClick={() => reactivate(o)}><Power /> Reactivate</button>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'outlets' && (
            <div className="grid g-main" style={{ alignItems: 'start' }}>
              <div>
                <div className="gv-sub">{m.outletList.length < m.outlets ? `Showing ${m.outletList.length} of ${num(m.outlets)} outlets` : `${m.outlets} outlets`}</div>
                <Table rows={m.outletList} columns={[
                  { key: 'name', label: 'Outlet', render: (o) => <b>{o.name}</b> },
                  { key: 'district', label: 'District' },
                  { key: 'redemptions', label: 'Uses', align: 'r', render: (o) => num(o.redemptions) },
                  { key: 'status', label: 'Status', render: (o) => <Status>{o.status}</Status> },
                ]} />
              </div>
              <div>
                <div className="gv-sub">Contact</div>
                <dl className="kv one">
                  <div><dt>Contact person</dt><dd>{m.contact}</dd></div>
                  <div><dt>Email</dt><dd>{m.email}</dd></div>
                  <div><dt>Joined SCANS</dt><dd>{m.joined}</dd></div>
                </dl>
                <Callout style={{ marginTop: 14 }}>Merchants see confirmed uses and outlet figures only. They never see worker records.</Callout>
              </div>
            </div>
          )}
        </div>
      </Card>
      {edit && <EditOffer o={edit} onClose={() => setEdit(null)} onSave={save} />}
      {deact && (
        <Modal title="Deactivate offer" onClose={() => setDeact(null)} actions={<><button className="btn outline" onClick={() => setDeact(null)}>Cancel</button><button className="btn danger" disabled={remark.trim().length < 5} onClick={doDeact}><Power /> Deactivate offer</button></>}>
          <p className="ink2" style={{ marginBottom: 14 }}>{deact.title} is hidden from workers straight away. Uses already confirmed stay counted.</p>
          <Field label="Reason" hint="Kept with the offer and sent to the merchant."><input className="input" autoFocus value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="For example: outlet list out of date" /></Field>
        </Modal>
      )}
    </>
  )
}

function EditOffer({ o, onClose, onSave }) {
  const [f, setF] = useState(o)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <Drawer title="Edit offer" sub={o.title} onClose={onClose} footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!f.title.trim()} onClick={() => onSave(f)}>Save changes</button></>}>
      <div className="form-grid">
        <Field label="Offer title" full><input className="input" value={f.title} onChange={set('title')} /></Field>
        <Field label="Discount"><input className="input" value={f.discount} onChange={set('discount')} /></Field>
        <Field label="Limit"><select className="select" value={f.limit} onChange={set('limit')}>{['One a month', 'Two a month', 'One a week', f.limit].filter((v, i, a) => a.indexOf(v) === i).map((l) => <option key={l}>{l}</option>)}</select></Field>
        <Field label="Ends"><input className="input" value={f.ends} onChange={set('ends')} /></Field>
        <Field label="Outlets"><input className="input" value={f.outlets} onChange={set('outlets')} /></Field>
        <div className="field full">
          <span>Status</span>
          <div className="row"><Switch checked={f.status === 'Live'} onChange={(v) => setF({ ...f, status: v ? 'Live' : 'Paused' })} label="Offer is live" /><span>{f.status === 'Live' ? 'Live in the worker app' : 'Paused, hidden from workers'}</span></div>
        </div>
      </div>
      <Callout>Changes to the discount or terms are shown to workers straight away. Uses already confirmed are not affected.</Callout>
    </Drawer>
  )
}
