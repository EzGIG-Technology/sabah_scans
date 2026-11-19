// Figures used only by the Microtek operator console (/admin/*).
// Everything that also appears in another portal is derived from src/data/demo.js or
// src/pages/shared/data.js so totals reconcile. Demo-only figures are marked as such.
import {
  REGISTERED, RATE, STATE_SHARE, channels, monthly, workers, employerTotals, merchants, merchantRedeemers,
  merchantRedemptionsMonthly, collectionToday, adminUsers,
} from '../../data/demo.js'
import { settlements, paymentSuccess } from '../shared/data.js'

export const BASE = '/admin'
export const ACTOR = 'Faizal Rahman (Microtek)'

export const short = (v) => (v >= 1e6 ? 'RM ' + (v / 1e6).toFixed(2) + 'm' : v >= 1e3 ? 'RM ' + (v / 1e3).toFixed(1) + 'k' : 'RM ' + v)
export const shortAxis = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'm' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : String(Math.round(v)))
export const ms = (v) => (v >= 1000 ? (v / 1000).toFixed(1) + ' s' : v + ' ms')

/* ---------- Employers and app use (Figma overview KPIs, demo-only) ---------- */
// Employers by share of their workers paid for December. Adds up to the 4,821 employers in eNORES.
export const companyCompliance = [
  { label: 'All workers paid', value: 3278, color: 'var(--okFill)' },
  { label: 'Some workers owing', value: 1061, color: 'var(--warnFill)' },
  { label: 'Under half paid', value: 482, color: 'var(--badFill)' },
]
export const companiesActive = 3204 // employers who paid for at least one worker in December (not the same as the 4,192 portal-active employers)
export const appUsers = 89730 // workers signed up to the SCANS app (same as the push audience in announcements)

// Permits ending within 90 days, scaled from the 160-record sample to all registered workers.
const soonShare = workers.filter((w) => w.permitDays >= 0 && w.permitDays <= 90).length / workers.length
export const permitsEndingSoon = Math.round(soonShare * REGISTERED)

/* ---------- Payment methods (shares from demo.js channels) ---------- */
// Approval rate by method. The weighted mix equals paymentSuccess (98.6%) in shared/data.js.
const SUCCESS = [0.984, 0.997, 0.981, 0.993, 0.962, 0.978]
const CONFIRM = ['4 s', 'At the counter', '6 s', 'Same day', '18 s', '5 s']
export const METHOD_COLORS = ['#1D66B8', '#4D9AD3', '#13407A', '#14B8A6', '#7B4DE3', '#FF8A1F']
export function paymentMethods(total) {
  const rows = channels.map((c, i) => {
    const collected = Math.round((total * c.share) / RATE) * RATE
    return { name: c.name, share: c.share, collected, payments: collected / RATE, success: SUCCESS[i], confirm: CONFIRM[i], color: METHOD_COLORS[i], status: SUCCESS[i] < 0.97 ? 'Watch' : 'Healthy' }
  })
  // Rounding difference goes to the largest method so the column adds up to the total.
  rows[0].collected += total - rows.reduce((s, r) => s + r.collected, 0)
  rows[0].payments = Math.round(rows[0].collected / RATE)
  return rows
}
export const weightedSuccess = channels.reduce((s, c, i) => s + c.share * SUCCESS[i], 0)
export { paymentSuccess }

/* ---------- Platform services (System health) ---------- */
export const services = [
  { name: 'API gateway', uptime: 0.9999, latency: 82 },
  { name: 'Sign-in and 2-step', uptime: 0.9999, latency: 64 },
  { name: 'Worker app service', uptime: 0.9998, latency: 120 },
  { name: 'Payments and receipts', uptime: 0.9998, latency: 140 },
  { name: 'Payment acquirer link', uptime: 0.9998, latency: 220 },
  { name: 'SWIMS link', uptime: 0.9995, latency: 180 },
  { name: 'eNORES link', uptime: 0.9991, latency: 240 },
  { name: 'KDN identity check', uptime: 0.9989, latency: 2100 },
  { name: 'JIM permit feed', uptime: 0.9993, latency: 310 },
  { name: 'SMS and WhatsApp', uptime: 0.9962, latency: 1150 },
  { name: 'Push notifications', uptime: 0.9999, latency: 95 },
  { name: 'Reports and exports', uptime: 0.9997, latency: 410 },
].map((s) => ({ ...s, watch: s.uptime < 0.998 || (s.latency > 600 && s.name !== 'KDN identity check') }))

// Requests by hour today, in thousands, to 15:00 (all apps and dashboards).
const REQ_W = [9, 6, 5, 5, 8, 21, 46, 71, 88, 94, 90, 86, 83, 80, 78, 62]
export const requestsToday = REQ_W.map((v, i) => ({ label: String(i).padStart(2, '0'), value: v * 1000 }))
export const requestsTotal = requestsToday.reduce((s, x) => s + x.value, 0)

// Who can sign in, by portal. Microtek and government counts come from adminUsers; the rest are demo-only.
const count = (orgs) => adminUsers.filter((u) => orgs.includes(u.org) && u.status !== 'Disabled').length
export const accessByRole = [
  { portal: 'SCANS Operation Team', users: count(['Microtek']), review: '5 Dec 2027', note: 'Superadmin, operations, support' },
  { portal: 'State finance and approvers', users: count(['Jabatan Kewangan Negeri', 'Kementerian Kewangan Negeri']), review: '1 Dec 2027', note: 'Collection, notices, exports' },
  { portal: 'Agency officers', users: count(['JTK Sabah']), review: '1 Dec 2027', note: 'Complaints routed to their agency' },
  { portal: 'Auditors', users: count(['Jabatan Audit Negeri']), review: '1 Dec 2027', note: 'Read everything, export audit log' },
  { portal: 'Employers', users: 6912, review: 'Self-service', note: 'Contribution status only' },
  { portal: 'Merchants', users: 118, review: 'Self-service', note: 'Offers and confirmed uses only' },
]

/* ---------- Settlement (from shared/data.js settlements, so the State sees the same) ---------- */
export { settlements }
export const operatorInvoices = monthly.map((m, i) => {
  const last = i === monthly.length - 1
  return {
    id: 'INV-MT-2027' + String(i + 7).padStart(2, '0'), // July 2027 is the first month
    month: m.m + ' 2027',
    gross: m.v,
    state: Math.round(m.v * STATE_SHARE),
    operator: m.v - Math.round(m.v * STATE_SHARE),
    status: last ? 'Accruing' : 'Paid by the State',
    paid: last ? '—' : `${10} ${monthly[i + 1].m} 2027`,
  }
})

/* ---------- Merchants ---------- */
// What each merchant applied to be. Cash collection points take contribution cash at the counter.
export const ROLE_APPLIED = { 'mer-711': 'Both', 'mer-cd': 'Perks partner', 'mer-grab': 'Perks partner', 'mer-servay': 'Perks partner', 'mer-kmb': 'Perks partner', 'mer-ws': 'Perks partner', 'mer-99': 'Both', 'mer-ahseng': 'Cash collection point' }
export const APP_EXTRA = {
  'MA-2712-014': { merchantId: 'mer-99', role: 'Both', hours: 76, risk: 'Low', portalEmail: 'scans@99speedmart.example.my', phone: '+60 3-3341 9999' },
  'MA-2712-011': { merchantId: 'mer-ahseng', role: 'Cash collection point', hours: 148, risk: 'Medium', portalEmail: 'ahseng.tawau@example.my', phone: '+60 89-771 205', note: 'Bank statement not uploaded. Name on SSM differs from the shop sign.' },
  'MA-2711-087': { merchantId: 'mer-ws', role: 'Perks partner', hours: 0, risk: 'Low', portalEmail: 'scans@watsons.example.my', phone: '+60 88-255 100' },
  'MA-2711-061': { merchantId: null, role: 'Perks partner', hours: 0, risk: 'High', portalEmail: 'megaphone.tawau@example.my', phone: '+60 89-762 118', company: 'Mega Phone Tawau Enterprise', ssm: '202101044210', contact: 'Chin Kok Leong' },
}
export const OFFER_EXTRA = {
  'OS-2712-021': { expiry: '29 Feb 2028', type: 'Free item', desc: 'A free 600ml mineral water with any meal set bought at a participating 7-Eleven.', terms: ['Show your SCANS code at the counter before paying.', 'One a month for each worker whose contributions are up to date.', 'Selected outlets in Kota Kinabalu while stocks last.', 'Cannot be exchanged for cash.'] },
  'OS-2712-019': { expiry: '20 Mar 2028', type: 'Discount', desc: 'Get 10% off any Celcom prepaid reload from RM10.', terms: ['Show your SCANS code at a CelcomDigi store.', 'One a month for each worker whose contributions are up to date.', 'Maximum discount RM5 a month.'] },
  'OS-2712-016': { expiry: '30 Jun 2028', type: 'Discount', desc: 'RM5 off a GrabCar ride in Kota Kinabalu, Sandakan or Tawau.', terms: ['Code applied in the Grab app after the SCANS code is shown.', 'Two a month.'] },
  'OS-2711-044': { expiry: '30 Jun 2028', type: 'Discount', desc: 'RM3 off any first-aid kit at Watsons Sabah.', terms: ['One a month.', 'All Watsons outlets in Sabah.'] },
  'OS-2711-031': { expiry: '—', type: 'Points', desc: 'Double loyalty points on rice purchases.', terms: ['Needs a loyalty card.'] },
}

// Offer type and one-line description shown on the merchant's offer list (7-Eleven sample offers).
export const OFFER_INFO = {
  o1: { type: 'Voucher', desc: 'RM3 off any prepaid reload of RM30 or more, all networks.' },
  o6: { type: 'Discount', desc: '20% off mobile top-up above RM50, up to RM15 off.' },
  o7: { type: 'Voucher', desc: 'RM5 off a grocery bill above RM40.' },
  o8: { type: 'Promotion', desc: 'Free delivery through the 7-Eleven app on orders above RM25.' },
  o5: { type: 'Free item', desc: 'A free 600ml mineral water with any meal set.' },
  o9: { type: 'Voucher', desc: 'RM2 off any phone case.' },
  o10: { type: 'Promotion', desc: 'Hari Raya grocery bundle with RM8 off.' },
}
export function offerType(o) {
  const t = (OFFER_INFO[o.id] && OFFER_INFO[o.id].type) || (OFFER_EXTRA[o.id] && OFFER_EXTRA[o.id].type)
  if (t && t !== 'Points') return t
  const d = o.discount && o.discount !== '—' ? o.discount : o.title
  if (/^free item|free \d/i.test(d)) return 'Free item'
  if (/%/.test(d)) return 'Discount'
  if (/^RM\d+$|RM\d+ off/i.test(d)) return 'Voucher'
  return 'Promotion'
}
export const offerDesc = (o) => (OFFER_INFO[o.id] && OFFER_INFO[o.id].desc) || (OFFER_EXTRA[o.id] && OFFER_EXTRA[o.id].desc) || o.terms || `${o.limit} · ${o.outlets}`

// Analytics for a merchant: confirmed uses by month, unique workers, top offers, redeemer nationality.
export const ANALYTIC_PERIODS = [{ value: '1M', label: '1M' }, { value: '3M', label: '3M' }, { value: '6M', label: '6M' }]
export function merchantAnalytics(m, live, period) {
  const scale = m.redemptions / 15234
  const all = merchantRedemptionsMonthly.map((x) => ({ label: x.label, value: Math.round(x.value * scale) }))
  const n = period === '1M' ? 1 : period === '3M' ? 3 : 6
  const months = all.slice(-n)
  const uses = months.reduce((s, x) => s + x.value, 0)
  // Weekly view for one month so the line has points
  const points = n === 1 ? [0.22, 0.24, 0.26, 0.28].map((w, i) => ({ label: `Wk ${i + 1}`, value: Math.round(months[0].value * w) })) : months
  const offers = live.filter((o) => o.redemptions > 0).map((o) => ({ label: o.title, value: Math.round(o.redemptions * (uses / Math.max(1, m.redemptions))) })).sort((a, b) => b.value - a.value).slice(0, 5)
  const workersUsed = Math.round(uses * 0.62)
  const nat = merchantRedeemers.map((r, i) => ({ label: r.label, value: Math.round(r.value * workersUsed), color: METHOD_COLORS[i] }))
  return { points, uses, workersUsed, offers, nat, prev: all.length > n ? all.slice(-2 * n, -n).reduce((s, x) => s + x.value, 0) : null }
}
export const merchantCategories = [...new Set(merchants.map((m) => m.category))]

/* ---------- Support queue (demo-only) ---------- */
// Help requests that reach Microtek: worker complaints routed to SCANS support, employer and merchant tickets.
// "Name hidden from employer" mirrors the worker app option "Do not tell my employer my name".
export const tickets = [
  { id: 'TK-2712-0418', subject: 'Paid twice for December', from: 'Worker', who: 'Joel Aquino', scansId: 'SCN26W0047329', channel: 'WhatsApp', lang: 'Filipino', priority: 'High', age: 95, target: 60, status: 'Open', hidden: true,
    original: 'Nabawasan ako ng dalawang beses para sa Disyembre. Pakibalik po ang sobra.', english: 'I was charged twice for December. Please return the extra.', summary: 'Duplicate DuitNow QR payment on 16 December. Matches reconciliation break RB-2712-006.', suggest: 'Refund RM100 or carry it forward to January, as the worker prefers.' },
  { id: 'TK-2712-0415', subject: 'Receipt not showing in the app', from: 'Worker', who: 'Ayu Lestari', scansId: 'SCN26W0047366', channel: 'App', lang: 'Bahasa Indonesia', priority: 'Medium', age: 42, target: 240, status: 'Open', hidden: false,
    original: 'Saya sudah bayar di 7-Eleven tapi struk belum muncul di aplikasi.', english: 'I paid at 7-Eleven but the receipt has not appeared in the app.', summary: 'Cash payment at 7-Eleven Fajar Centre, counter code issued. Receipt waits for the end-of-day cash file.', suggest: 'Tell the worker the receipt appears by 23:00 today. No action needed.' },
  { id: 'TK-2712-0411', subject: 'Cannot add workers to a payment batch', from: 'Employer', who: 'Kinabatangan Agro Estates Sdn Bhd', channel: 'Portal', lang: 'English', priority: 'Medium', age: 310, target: 240, status: 'Open', hidden: false,
    original: '18 of our workers are greyed out on the Pay page.', english: '18 of our workers are greyed out on the Pay page.', summary: 'Those 18 workers have not given consent for the employer to pay. This is expected.', suggest: 'Explain that each worker gives consent in the SCANS app before the employer can pay for them.' },
  { id: 'TK-2712-0409', subject: 'Perk code refused at the counter', from: 'Worker', who: 'Nur Purnomo', scansId: 'SCN26W0047255', channel: 'App', lang: 'Bahasa Indonesia', priority: 'Low', age: 520, target: 1440, status: 'Escalated', hidden: true,
    original: 'Kasir bilang kode tidak bisa dipakai.', english: 'The cashier said the code cannot be used.', summary: 'Outlet 7-Eleven Bundusan is paused for offers. The worker was not told.', suggest: 'Apologise, suggest the nearest active outlet, ask the merchant to update outlet status.' },
  { id: 'TK-2712-0406', subject: 'Offer edit not saved', from: 'Merchant', who: 'CelcomDigi', channel: 'Email', lang: 'English', priority: 'Low', age: 1310, target: 1440, status: 'Open', hidden: false,
    original: 'We changed the end date of our reload offer but it still shows the old date.', english: 'We changed the end date of our reload offer but it still shows the old date.', summary: 'Changes to live offers go to Microtek for review before workers see them.', suggest: 'Approve the change in Approvals, then reply.' },
  { id: 'TK-2712-0401', subject: 'Changed phone number', from: 'Worker', who: 'Nasir Hossain', scansId: 'SCN26W0051362', channel: 'Phone', lang: 'Bengali', priority: 'Medium', age: 30, target: 240, status: 'Open', hidden: false,
    original: 'আমার নতুন ফোন নম্বর আছে। আমি অ্যাপে ঢুকতে পারছি না।', english: 'I have a new phone number. I cannot get into the app.', summary: 'Sign-in needs the old number. Identity can be re-checked with a new KDN face check.', suggest: 'Send a face-check link to the new number. Do not change the record without it.' },
  { id: 'TK-2712-0397', subject: 'Statement totals for November', from: 'Employer', who: 'Tawau Cocoa Holdings Bhd', channel: 'Email', lang: 'English', priority: 'Low', age: 2880, target: 2880, status: 'Resolved', hidden: false,
    original: 'Our November statement shows RM64,000. Please confirm.', english: 'Our November statement shows RM64,000. Please confirm.', summary: '640 workers × RM100. Statement is correct.', suggest: 'Confirmed by reply.' },
]
export const fmtAge = (m) => (m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${Math.floor(m / 1440)} d`)
export const fmtTarget = (m) => (m < 60 ? `${m} min` : m < 1440 ? `${m / 60} h` : `${m / 1440} d`)

// Help topics today (worker app, WhatsApp and phone), demo-only.
export const helpTopics = [
  { label: 'Paying and receipts', value: 412 }, { label: 'Signing up and face check', value: 236 }, { label: 'Perks at shops', value: 141 },
  { label: 'Employer paying for me', value: 118 }, { label: 'Changing phone or language', value: 87 }, { label: 'Notices', value: 39 },
]
export const helpLangs = [
  { label: 'Bahasa Indonesia', value: 498, color: '#1D66B8' }, { label: 'Filipino', value: 287, color: '#4D9AD3' }, { label: 'Bahasa Melayu', value: 104, color: '#13407A' },
  { label: 'English', value: 72, color: '#14B8A6' }, { label: 'Bengali', value: 41, color: '#7B4DE3' }, { label: 'Nepali', value: 31, color: '#FF8A1F' },
]
export const helpTotal = helpTopics.reduce((s, x) => s + x.value, 0)
export const SUPPORT_AGENCIES = ['JTK Sabah', 'JIM', 'KDN', 'Jabatan Kesihatan', 'PDRM']

export { collectionToday, employerTotals }
