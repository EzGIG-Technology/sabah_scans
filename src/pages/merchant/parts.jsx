import { Lock, QrCode, MapPin, Repeat, CalendarDays } from 'lucide-react'
import { MERCHANT } from './data.js'

// Brand tile for the merchant (no third-party logos in the prototype).
export function BrandTile({ size }) {
  return <span className={'mono' + (size === 'lg' ? ' lg' : '')} style={{ background: MERCHANT.color }} aria-hidden="true">7E</span>
}

const tones = { 'Top-up': 'blue', Groceries: 'green', Food: 'orange', Delivery: 'purple', Accessories: 'teal', Health: 'pink', Transport: 'navy', Other: 'navy' }
export function shortDiscount(o) {
  if (o.type === 'amount') return 'RM' + (o.value || '?')
  if (o.type === 'percent') return (o.value || '?') + '%'
  return 'Free'
}
export function OfferThumb({ offer }) {
  return (
    <span className={'mx-thumb ' + (tones[offer.category] || 'navy')} aria-hidden="true">
      <b>{shortDiscount(offer)}</b>
      <small>{offer.type === 'free' ? (offer.value || 'item').split(' ')[0] : 'off'}</small>
    </span>
  )
}

// How the perk looks in the worker app (based on the Figma worker perks screen).
export function PerkPhone({ offer }) {
  const label = offer.discountText
  return (
    <div className="mx-phone" aria-label="Preview of the perk in the worker app">
      <div className="mx-phone-screen">
        <div className="mx-ph-status"><span>9:41</span><span className="mx-ph-notch" /><span>4G</span></div>
        <div className="mx-ph-head">Perks</div>
        <div className="mx-ph-seg"><span className="on">All</span><span>Used</span></div>
        <div className="mx-ph-card on">
          <BrandTile />
          <div className="grow">
            <small>{MERCHANT.name}</small>
            <b>{offer.title || 'Your offer title'}</b>
            <span>{offer.ends ? 'Ends ' + offer.ends : 'Set an end date'}</span>
          </div>
          <span className="mx-ph-badge">{label}</span>
        </div>
        <div className="mx-ph-detail">
          {offer.image ? <img className="mx-ph-img" src={offer.image} alt="" /> : null}
          <div className="mx-ph-big">{label}</div>
          <p>{offer.what || 'Say in one line what the worker gets.'}</p>
          <ul>
            <li><Repeat size={13} aria-hidden="true" />{offer.limit || 'One a month'}</li>
            <li><MapPin size={13} aria-hidden="true" />{offer.outletsText || 'All outlets'}</li>
            <li><CalendarDays size={13} aria-hidden="true" />{offer.starts && offer.ends ? `${offer.starts} to ${offer.ends}` : 'Dates not set'}</li>
          </ul>
          {offer.terms && <p className="mx-ph-terms">{offer.terms}</p>}
          <span className="mx-ph-btn"><QrCode size={15} aria-hidden="true" /> Show code at the counter</span>
          <p className="mx-ph-note"><Lock size={11} aria-hidden="true" /> The shop sees your SCANS ID ending only. It counts as used after the shop confirms.</p>
        </div>
        <div className="mx-ph-card dim">
          <span className="mono" style={{ background: '#1460E0' }} aria-hidden="true">CD</span>
          <div className="grow"><small>CelcomDigi</small><b>10GB extra data</b><span>Ends 31 Jul 2027</span></div>
        </div>
      </div>
    </div>
  )
}

// Readable date "2027-07-01" -> "1 Jul 2027"
const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${M[m - 1]} ${y}`
}
export function toIso(text) {
  if (!text || text === '—') return ''
  const [d, mon, y] = text.split(' ')
  const m = M.indexOf(mon) + 1
  if (!m) return ''
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
