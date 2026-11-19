// Merchant partners (/state/merchants). From the Figma "Merchant Analytics" and "Merchant List" frames
// (and the merchant table on the "Start" frame): active partners, top category, perks used, the use
// trend by category, and a filterable partner list with a read-only detail drawer.
// The State sees partners and confirmed uses only. Merchants never see worker records, and the State
// does not approve offers here (Microtek does).
import { useMemo, useState } from 'react'
import { Store, Tags, Receipt, Download, ShieldCheck, Filter } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Empty, SearchInput, Select, Table, Drawer, Mono, LineChart, Callout, Modal, PAL, useToast } from '../../components/ui.jsx'
import { merchants, num, pct } from '../../data/demo.js'
import { merchantDetail, offerCounts } from '../shared/data.js'
import { logEvent, useStore } from '../shared/store.js'

const details = merchants.map(merchantDetail)
const active = details.filter((m) => m.status === 'Active')
const CATS = [...new Set(merchants.map((m) => m.category))]
const MONTHS = details[0].monthly.map((x) => x.label)

// Confirmed uses per month, all partners, and per category
const byCat = CATS.map((c) => ({ c, total: details.filter((m) => m.category === c).reduce((s, m) => s + m.redemptions, 0) })).sort((a, b) => b.total - a.total)
const topCats = byCat.filter((x) => x.total > 0).slice(0, 4)
const trend = topCats.map((x, i) => ({
  name: x.c, color: PAL[i],
  points: MONTHS.map((label, j) => ({ label, value: details.filter((m) => m.category === x.c).reduce((s, m) => s + m.monthly[j].value, 0) })),
}))
const monthTotal = (j) => details.reduce((s, m) => s + m.monthly[j].value, 0)
const juneUses = monthTotal(MONTHS.length - 1)
const mayUses = monthTotal(MONTHS.length - 2)
const allUses = details.reduce((s, m) => s + m.redemptions, 0)

const USE_BANDS = [{ value: 'All', label: 'Any number of uses' }, { value: '5000', label: 'Over 5,000 uses' }, { value: '1000', label: '1,000 to 5,000 uses' }, { value: '0', label: 'Under 1,000 uses' }]
const inBand = (m, b) => b === 'All' || (b === '5000' ? m.redemptions > 5000 : b === '1000' ? m.redemptions >= 1000 && m.redemptions <= 5000 : m.redemptions < 1000)

export default function Merchants() {
  const subs = useStore((s) => s.offerSubs)
  const toast = useToast()
  const [q, setQ] = useState('')
  const [cats, setCats] = useState([])
  const [status, setStatus] = useState('All')
  const [band, setBand] = useState('All')
  const [panel, setPanel] = useState(false)
  const [open, setOpen] = useState(null)
  const rows = useMemo(() => details.filter((m) => {
    const t = q.trim().toLowerCase()
    if (t && !(m.name.toLowerCase().includes(t) || m.company.toLowerCase().includes(t) || m.ssm.includes(t))) return false
    if (cats.length && !cats.includes(m.category)) return false
    if (status !== 'All' && m.status !== status) return false
    return inBand(m, band)
  }), [q, cats, status, band])
  const nFilters = (cats.length ? 1 : 0) + (status !== 'All' ? 1 : 0) + (band !== 'All' ? 1 : 0)
  const clear = () => { setQ(''); setCats([]); setStatus('All'); setBand('All') }
  const m = details.find((x) => x.id === open)
  const openRow = (x) => { setOpen(x.id); logEvent('Viewed merchant partner', x.name) }

  return (
    <>
      <PageHead title="Merchant partners" sub="Partner shops that give perks to workers who are up to date. A perk counts as used only after the shop confirms it.">
        <button className="btn outline" onClick={() => { logEvent('Exported merchant list', `${rows.length} merchants`); toast(`Merchant list exported (${rows.length} partners). The export is in the audit log.`) }}><Download /> Export</button>
      </PageHead>
      <div className="grid g-4 keep2">
        <Kpi icon={Store} label="Active partners" value={num(active.length)} note={`${num(active.reduce((s, x) => s + x.outlets, 0))} outlets · ${details.length - active.length} waiting to join`} />
        <Kpi icon={Tags} tone="purple" label="Top category" value={byCat[0].c} note={`${pct(byCat[0].total / allUses)} of confirmed uses`} />
        <Kpi icon={Receipt} tone="ok" label="Perks used in December" value={num(juneUses)} delta={(juneUses >= mayUses ? '+' : '−') + Math.abs(((juneUses - mayUses) / mayUses) * 100).toFixed(1) + '%'} down={juneUses < mayUses} note="against November" />
        <Kpi icon={Receipt} label="Perks used since July" value={num(allUses)} note="Confirmed by the shop" />
      </div>
      <Card title="Perks used each month" sub="Confirmed uses by category, July to December 2027">
        <LineChart series={trend} height={240} area={false} />
      </Card>
      <Card title="Partners" sub={`${rows.length} of ${details.length} merchants`}
        action={(q || nFilters) ? <button className="st-link" onClick={clear}>Clear filters</button> : null}>
        <div className="stack" style={{ gap: 14 }}>
          <div className="toolbar">
            <SearchInput value={q} onChange={setQ} placeholder="Search merchant, company or SSM number" />
            <button className="btn outline" onClick={() => setPanel(true)} aria-haspopup="dialog"><Filter /> Filter{nFilters ? ` (${nFilters})` : ''}</button>
          </div>
          <Table rows={rows} onRowClick={openRow}
            empty={<Empty title="No merchants match">Change the search or clear the filters.</Empty>}
            columns={[
              { key: 'name', label: 'Merchant', render: (x) => <div className="who"><Mono name={x.name} color={x.color} /><div style={{ minWidth: 0 }}><b>{x.name}</b><small>{x.company}</small></div></div> },
              { key: 'category', label: 'Category' },
              { key: 'outlets', label: 'Outlets', align: 'r', render: (x) => num(x.outlets) },
              { key: 'offers', label: 'Offers', align: 'r', render: (x) => offerCounts(x, subs).text },
              { key: 'redemptions', label: 'Perks used', align: 'r', render: (x) => num(x.redemptions) },
              { key: 'joined', label: 'Joined' },
              { key: 'status', label: 'Status', render: (x) => <Status>{x.status}</Status> },
            ]} />
        </div>
      </Card>
      <Callout icon={ShieldCheck}>Merchants never see worker records. They see only that a perk was used at their outlet. New partners and offers are checked by Microtek before they go live.</Callout>

      {panel && <FilterPanel initial={{ cats, status, band }} onClose={() => setPanel(false)} onApply={(f) => { setCats(f.cats); setStatus(f.status); setBand(f.band); setPanel(false) }} />}
      {m && (
        <Drawer title={m.name} sub={`${m.company} · SSM ${m.ssm}`} onClose={() => setOpen(null)} footer={<button className="btn primary" onClick={() => setOpen(null)}>Close</button>}>
          <div className="row wrap" style={{ gap: 8 }}><Status>{m.status}</Status><span className="pill grey">{m.category}</span></div>
          <dl className="kv">
            <div><dt>Outlets</dt><dd className="num">{num(m.outlets)}</dd></div>
            <div><dt>Joined</dt><dd>{m.joined}</dd></div>
            <div><dt>Perks used since July</dt><dd className="num">{num(m.redemptions)}</dd></div>
            <div><dt>Contact</dt><dd>{m.contact}</dd></div>
          </dl>
          {m.status === 'Active' ? (
            <>
              <div className="gv-sub">Perks used each month</div>
              <LineChart data={m.monthly} height={160} />
              <div className="gv-sub">Offers</div>
              {m.live.length === 0 ? <p className="small muted">No offers yet.</p> : (
                <ul className="st-recent">
                  {m.live.map((o) => <li key={o.id}><span><b style={{ fontWeight: 600 }}>{o.title}</b><small className="muted" style={{ display: 'block' }}>{o.outlets} · {o.limit}</small></span><Status>{o.status}</Status></li>)}
                </ul>
              )}
              <div className="gv-sub">Outlets</div>
              <ul className="st-recent">
                {m.outletList.map((o) => <li key={o.id}><span>{o.name}<small className="muted" style={{ display: 'block' }}>{o.district}</small></span><span className="num small">{num(o.redemptions)} uses</span></li>)}
              </ul>
            </>
          ) : <Callout>This merchant has applied to join. Microtek checks the documents before any offer goes live.</Callout>}
        </Drawer>
      )}
    </>
  )
}

function FilterPanel({ initial, onClose, onApply }) {
  const [cats, setCats] = useState(initial.cats)
  const [status, setStatus] = useState(initial.status)
  const [band, setBand] = useState(initial.band)
  const toggle = (c) => setCats(cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c])
  return (
    <Modal title="Filter merchants" onClose={onClose} actions={<>
      <button className="btn ghost" onClick={() => { setCats([]); setStatus('All'); setBand('All') }} style={{ marginRight: 'auto' }}>Clear all</button>
      <button className="btn outline" onClick={onClose}>Cancel</button>
      <button className="btn primary" onClick={() => onApply({ cats, status, band })}>Apply</button>
    </>}>
      <div className="stack" style={{ gap: 18 }}>
        <fieldset className="st-fs">
          <legend>Category</legend>
          <div className="chips">{CATS.map((c) => <button key={c} type="button" className="chip" aria-pressed={cats.includes(c)} onClick={() => toggle(c)}>{c}</button>)}</div>
        </fieldset>
        <fieldset className="st-fs">
          <legend>Perks used</legend>
          <Select label="Perks used" value={band} onChange={setBand} options={USE_BANDS} />
        </fieldset>
        <fieldset className="st-fs">
          <legend>Status</legend>
          <div className="chips">{['All', 'Active', 'Pending'].map((s) => <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>{s === 'All' ? 'All' : s === 'Pending' ? 'Waiting to join' : s}</button>)}</div>
        </fieldset>
      </div>
    </Modal>
  )
}
