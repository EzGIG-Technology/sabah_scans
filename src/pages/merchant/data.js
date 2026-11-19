// Merchant portal sample data, derived from src/data/demo.js so totals reconcile:
// - 46 outlets (merchantSelf.outlets): the 6 in demo.js plus 40 generated here.
// - Redemptions all time 15,234 (merchantSelf.redemptions) = sum of every offer, including two
//   early offers that ended before the ones listed in demo.js.
// - December offer redemptions add up to December in merchantRedemptionsMonthly (3,404), and each
//   outlet's December figure is the sum of the offers it took part in.
import { merchantSelf, merchantOffers, merchantOutlets, merchantRedemptionsMonthly, districts, offerSubmissions } from '../../data/demo.js'

export const ME = { name: 'Tan Mei Ling', role: 'Partnerships manager', email: 'meiling.tan@7eleven.example.my' }
export const MERCHANT = merchantSelf
export const JUNE_TOTAL = merchantRedemptionsMonthly[merchantRedemptionsMonthly.length - 1].value
export const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const NOW = '17 Dec 2027'
// demo.js monthly figures add up to 40 fewer than merchantSelf.redemptions; the gap is put in
// July (launch week) so the monthly chart and the all-time total agree on every screen.
const monthlyGap = merchantSelf.redemptions - merchantRedemptionsMonthly.reduce((s, m) => s + m.value, 0)
export const MONTHLY = merchantRedemptionsMonthly.map((m, i) => (i === 0 ? { ...m, value: m.value + monthlyGap } : m))

// Deterministic pseudo-random numbers so every reload shows the same sample.
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)

// Split a whole number across weights so the parts add up exactly (largest remainder).
export function split(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  const raw = weights.map((w) => (total * w) / sum)
  const out = raw.map(Math.floor)
  let left = total - out.reduce((a, b) => a + b, 0)
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0 && weights[i] > 0) { out[i] += 1; left -= 1 } })
  return out
}

export const districtName = (id) => (districts.find((d) => d.id === id) || {}).name || id
export const districtOptions = districts.map((d) => ({ value: d.id, label: d.name }))
const districtId = (name) => (districts.find((d) => d.name === name) || {}).id

/* ---------------- Outlets ---------------- */
const extraOutlets = [
  ['Wisma Merdeka', 'kk', 'Jalan Tun Razak, Kota Kinabalu'], ['Lintas Plaza', 'kk', 'Jalan Lintas, Luyang'], ['Damai Plaza', 'kk', 'Jalan Damai, Luyang'],
  ['Inanam Baru', 'kk', 'Jalan Tuaran, Inanam'], ['Menggatal', 'kk', 'Pekan Menggatal'], ['Tanjung Aru', 'kk', 'Jalan Mat Salleh, Tanjung Aru'],
  ['Likas Square', 'kk', 'Jalan Istiadat, Likas'], ['Kepayan Ridge', 'kk', 'Jalan Kepayan'], ['Api-Api Centre', 'kk', 'Jalan Centre Point'],
  ['Bandar Utama', 'sandakan', 'Batu 6, Jalan Utara'], ['Taman Mawar', 'sandakan', 'Batu 4, Jalan Utara'], ['Bandar Indah', 'sandakan', 'Mile 4, Bandar Indah'],
  ['Sim Sim', 'sandakan', 'Jalan Sim Sim'], ['Tanah Merah', 'sandakan', 'Jalan Tanah Merah'], ['Prima Square', 'sandakan', 'Batu 4, Prima Square'],
  ['Jalan Chester', 'tawau', 'Jalan Chester, Tawau'], ['Taman Megah', 'tawau', 'Jalan Kuhara, Taman Megah'], ['Sabindo', 'tawau', 'Sabindo Square, Tawau'],
  ['Kubota', 'tawau', 'Jalan Kubota'], ['Jalan Apas', 'tawau', 'Batu 3, Jalan Apas'], ['Bandar Tawau Lama', 'tawau', 'Jalan Bunga, Tawau'],
  ['Jalan Segama', 'lahaddatu', 'Jalan Segama, Lahad Datu'], ['Bandar Sri Perdana', 'lahaddatu', 'Jalan Bunga Tanjung'], ['Jalan Kastam', 'lahaddatu', 'Jalan Kastam Lama'],
  ['Silam', 'lahaddatu', 'Jalan Silam'], ['Cenderawasih', 'lahaddatu', 'Taman Cenderawasih'],
  ['Pekan Kudat', 'kudat', 'Jalan Lo Thien Chock, Kudat'], ['Bandar Maju', 'kudat', 'Bandar Maju, Kudat'], ['Jalan Ibrahim', 'kudat', 'Jalan Ibrahim, Kudat'],
  ['Bandar Keningau', 'keningau', 'Jalan Masak, Keningau'], ['Taman Bunga Raya', 'keningau', 'Jalan Apin-Apin'], ['Keningau Plaza', 'keningau', 'Jalan Arusap'],
  ['Pekan Beaufort', 'beaufort', 'Jalan Padas, Beaufort'], ['Membakut', 'beaufort', 'Pekan Membakut'], ['Kuala Penyu', 'beaufort', 'Jalan Kuala Penyu'],
  ['Pekan Semporna', 'semporna', 'Jalan Kastam, Semporna'], ['Bandar Baru Semporna', 'semporna', 'Bandar Baru, Semporna'],
  ['Kinabatangan', 'sandakan', 'Pekan Kinabatangan'], ['Kunak', 'lahaddatu', 'Pekan Kunak'], ['Merotai', 'tawau', 'Jalan Merotai Besar'],
]
const baseAddress = { 'OUT-01': 'Jalan Dunlop, Tawau', 'OUT-02': 'Bandar Sri Indah, Jalan Apas', 'OUT-03': 'Jalan Tiga, Sandakan', 'OUT-04': 'Fajar Centre, Lahad Datu', 'OUT-05': 'Jalan Gaya, Kota Kinabalu', 'OUT-06': 'Bundusan, Penampang' }
const extraAllTime = merchantSelf.redemptions - merchantOutlets.reduce((s, o) => s + o.redemptions, 0)
const extraWeights = extraOutlets.map((x) => 0.5 + rng(hash(x[0]))())
const extraTotals = split(extraAllTime, extraWeights)

const firstNames = ['Nurul', 'Jason', 'Siti', 'Mohd', 'Alvin', 'Farah', 'Jeffrey', 'Aisyah', 'Rudy', 'Joanna', 'Hafiz', 'Melissa', 'Azlan', 'Christine', 'Ismail', 'Wendy', 'Rosnah', 'Kelvin', 'Norma', 'Ronald']
const lastNames = ['Ahmad', 'Wong', 'Abdullah', 'Lee', 'Gimbang', 'Tan', 'Majinbon', 'Hassan', 'Lim', 'Sinsuat', 'Chin', 'Yusof', 'Liew', 'Juman', 'Ho', 'Ismail']
function staffFor(id, n) {
  const r = rng(hash(id + 'staff'))
  return Array.from({ length: n }, (_, i) => ({
    id: id + '-S' + (i + 1),
    name: firstNames[Math.floor(r() * firstNames.length)] + ' ' + lastNames[Math.floor(r() * lastNames.length)],
    role: i === 0 ? 'Store manager' : 'Cashier',
    added: ['12 Jul 2027', '3 Aug 2027', '20 Sep 2027', '8 Nov 2027'][Math.floor(r() * 4)],
  }))
}

const outletsBase = [
  ...merchantOutlets.map((o) => ({ ...o, districtId: districtId(o.district), address: baseAddress[o.id], allTime: o.redemptions, weight: o.redemptions || 0 })),
  ...extraOutlets.map(([n, d, a], i) => ({
    id: 'OUT-' + String(i + 7).padStart(2, '0'), name: '7-Eleven ' + n, district: districtName(d), districtId: d, address: a,
    allTime: extraTotals[i], weight: extraTotals[i], status: 'Active',
  })),
]

/* ---------------- Offers ---------------- */
const offerExtras = {
  o1: { type: 'amount', value: '3', minSpend: '30', june: 1380, ref: 'OS-2707-004', what: 'RM3 off when you buy a RM30 prepaid reload for any network.', terms: 'One use a month. Reloads of RM30 or more. Cannot be used with other promotions.', districtsIn: null },
  o6: { type: 'percent', value: '20', minSpend: '50', june: 374, ref: 'OS-2708-011', what: '20% off a mobile top-up of RM50 or more.', terms: 'One use a month. Top-up must be RM50 or more. Discount up to RM15.', districtsIn: null },
  o7: { type: 'amount', value: '5', minSpend: '40', june: 1040, ref: 'OS-2709-019', what: 'RM5 off groceries when you spend RM40 or more.', terms: 'Two uses a month. Rice, oil, flour, sugar, tinned food and drinks. Not for cigarettes or phone cards.', districtsIn: ['tawau', 'lahaddatu', 'sandakan'] },
  o8: { type: 'free', value: 'Delivery', minSpend: '25', june: 610, ref: 'OS-2710-007', what: 'Free delivery on orders of RM25 or more through 7-Eleven delivery.', terms: 'One use a week. Kota Kinabalu outlets only. Delivery within 5 km.', districtsIn: ['kk'] },
  o5: { type: 'free', value: '600ml water', minSpend: '', june: 0, ref: 'OS-2712-021', submitted: '14 Dec 2027', what: 'A free 600ml bottle of water with any meal set.', terms: 'One use a month. Selected outlets in Kota Kinabalu.', districtsIn: ['kk'] },
  o9: { type: 'amount', value: '2', minSpend: '', june: 0, ref: 'OS-2612-002', what: 'RM2 off any phone case.', terms: 'One use a month.', districtsIn: null },
  o10: { type: 'amount', value: '8', minSpend: '60', june: 0, ref: '', what: 'RM8 off a Hari Raya bundle of rice, sugar and biscuits.', terms: '', districtsIn: null },
}
const earlyOffers = [
  { id: 'o11', title: 'Free 500ml Milo with any bun', discount: 'Free item', category: 'Food', starts: '15 Jul 2027', ends: '28 Aug 2027', limit: 'One a month', redemptions: 1980, views: 7410, status: 'Expired', outlets: 'All outlets',
    type: 'free', value: '500ml Milo', minSpend: '', june: 0, ref: 'OS-2707-001', what: 'A free 500ml Milo with any bun.', terms: 'One use a month.', districtsIn: null },
  { id: 'o12', title: 'RM1 off a Touch n Go reload', discount: 'RM1', category: 'Top-up', starts: '15 Jul 2027', ends: '30 Sep 2027', limit: 'One a month', redemptions: 1252, views: 5030, status: 'Expired', outlets: 'All outlets',
    type: 'amount', value: '1', minSpend: '10', june: 0, ref: 'OS-2707-002', what: 'RM1 off a Touch n Go reload of RM10 or more.', terms: 'One use a month.', districtsIn: null },
]
// An offer Microtek sent back with a reason (no redemptions, so totals are unchanged).
const sentBack = [
  { id: 'o13', title: '30% off all items', discount: '30%', category: 'Other', starts: '1 Jan 2028', ends: '31 Jan 2028', limit: 'One a month', redemptions: 0, views: 0, status: 'Sent back', outlets: 'All outlets',
    type: 'percent', value: '30', minSpend: '', june: 0, ref: 'OS-2712-012', submitted: '9 Dec 2027', reviewed: '11 Dec 2027',
    reason: 'Say which items the offer covers and add a minimum spend. "All items" would include cigarettes and phone cards, which perks cannot cover.',
    what: '30% off everything in the shop.', terms: '', districtsIn: null },
]
const offersBase = [...merchantOffers.map((o) => ({ ...o, ...offerExtras[o.id] })), ...earlyOffers, ...sentBack]

// Which outlets take part in an offer.
export function outletsForOffer(o, outlets) {
  if (o.outletIds && o.outletIds.length) return outlets.filter((x) => o.outletIds.includes(x.id))
  if (o.districtsIn) return outlets.filter((x) => o.districtsIn.includes(x.districtId))
  return outlets
}

// December redemptions per outlet per live offer, split by outlet weight. Paused outlets take none.
function allocate(offers, outlets) {
  const map = {}
  offers.forEach((o) => {
    if (!o.june) return
    const part = outletsForOffer(o, outlets).filter((x) => x.status !== 'Paused')
    const counts = split(o.june, part.map((x) => x.weight || 1))
    map[o.id] = Object.fromEntries(part.map((x, i) => [x.id, counts[i]]))
  })
  return map
}
export const juneByOfferOutlet = allocate(offersBase, outletsBase)
const areaCode = { kk: '088', kudat: '088', sandakan: '089', tawau: '089', lahaddatu: '089', semporna: '089', keningau: '087', beaufort: '087' }
export const initialOutlets = outletsBase.map((o) => {
  const june = Object.values(juneByOfferOutlet).reduce((s, m) => s + (m[o.id] || 0), 0)
  const staffCount = o.status === 'Paused' ? 2 : 2 + (hash(o.id) % 3)
  const staff = staffFor(o.id, staffCount)
  const r = rng(hash(o.id + 'tel'))
  const phone = (areaCode[o.districtId] || '088') + ' ' + (200 + Math.floor(r() * 700)) + ' ' + String(Math.floor(r() * 1000)).padStart(3, '0')
  return { ...o, june, staff, pic: staff[0].name, phone }
})

// Redemptions per month for one offer, from its first month to December (or its last month).
const monthIndex = (d) => { const m = MONTHS.findIndex((x) => d && d.includes(x)); return d && d.includes('2027') ? m : -1 }
export function offerMonthly(o) {
  const s = Math.max(0, monthIndex(o.starts))
  const e = o.status === 'Expired' || o.status === 'Ended' ? Math.max(s, monthIndex(o.ends)) : 5
  if (!o.redemptions) return MONTHS.slice(0, 6).map((label) => ({ label, value: 0 }))
  const span = []
  for (let i = s; i <= e; i++) span.push(i)
  const fixedJune = e === 5 && o.june ? o.june : null
  const rest = fixedJune != null ? span.slice(0, -1) : span
  const restTotal = o.redemptions - (fixedJune || 0)
  const parts = rest.length ? split(restTotal, rest.map((_, i) => 0.7 + i * 0.35)) : []
  const vals = Object.fromEntries(rest.map((m, i) => [m, parts[i]]))
  if (fixedJune != null) vals[5] = fixedJune
  return MONTHS.map((label, i) => ({ label, value: vals[i] || 0 }))
}

export const initialOffers = offersBase.map((o) => ({
  ...o,
  submitted: o.submitted || (o.status === 'Draft' ? null : o.starts),
  // Shown to workers: "views" are opens of the perk card in the worker app.
}))

/* ---------------- Redemptions feed ---------------- */
// Codes the counter staff can try in the demo. Never shows a name, passport or nationality.
export const demoCodes = {
  '482913': { kind: 'ok', offerId: 'o1', worker: 'SCN26W•••2650' },
  '731406': { kind: 'ok', offerId: 'o7', worker: 'SCN26W•••5524' },
  '115820': { kind: 'expired' },
  '904417': { kind: 'used', offerId: 'o1', worker: 'SCN26W•••3092' },
  '260071': { kind: 'unavailable' },
}

export const peakIndex = (arr) => arr.reduce((b, d, i) => (d.value > arr[b].value ? i : b), 0)

export const pendingSubmission = offerSubmissions.find((s) => s.merchant === merchantSelf.name && s.status === 'Pending')

export const initialUsers = [
  { id: 'u1', name: 'Tan Mei Ling', email: 'meiling.tan@7eleven.example.my', role: 'Admin', scope: 'All outlets', twoFA: true, last: 'Today 19:40', status: 'Active' },
  { id: 'u2', name: 'Daniel Chong', email: 'daniel.chong@7eleven.example.my', role: 'Offer manager', scope: 'All outlets', twoFA: true, last: 'Today 11:02', status: 'Active' },
  { id: 'u3', name: 'Siti Aminah Juman', email: 'siti.juman@7eleven.example.my', role: 'Area manager', scope: 'Tawau, Lahad Datu, Semporna', twoFA: true, last: 'Yesterday', status: 'Active' },
  { id: 'u4', name: 'Kelvin Ho', email: 'kelvin.ho@7eleven.example.my', role: 'Reports viewer', scope: 'All outlets', twoFA: false, last: '—', status: 'Invited' },
]
export const roles = [
  { value: 'Admin', label: 'Admin', note: 'Everything, including users and company details' },
  { value: 'Offer manager', label: 'Offer manager', note: 'Create and change offers, see reports' },
  { value: 'Area manager', label: 'Area manager', note: 'Outlets, staff and reports for chosen districts' },
  { value: 'Reports viewer', label: 'Reports viewer', note: 'See and download reports only' },
]

export const categories = ['Top-up', 'Groceries', 'Food', 'Delivery', 'Accessories', 'Health', 'Transport', 'Other']
export const limits = ['One a month', 'Two a month', 'One a week', 'Once only']

export function discountLabel(type, value) {
  if (type === 'amount') return value ? 'RM' + value + ' off' : 'RM off'
  if (type === 'percent') return value ? value + '% off' : '% off'
  return value ? 'Free ' + value.toLowerCase() : 'Free item'
}

/* ---------------- Daily figures for December ---------------- */
// 1 to 17 December 2027. 1 December is a Wednesday. Weekends and the days after the 7th (when most
// workers are paid) are busier. Any December total splits across these weights exactly.
export const JUNE_DAYS = Array.from({ length: 17 }, (_, i) => i + 1)
const dow = (d) => (d + 2) % 7 // 0 = Sunday
export const DAILY_W = JUNE_DAYS.map((d) => (dow(d) === 0 ? 1.3 : dow(d) === 6 ? 1.2 : 1) * (d >= 7 && d <= 10 ? 1.25 : 1) * (1 + d * 0.01))
export function juneDaily(total) {
  return split(total, DAILY_W).map((value, i) => ({ label: String(JUNE_DAYS[i]), value }))
}
// Monday 13 to Friday 17 December.
export const thisWeek = (juneTotal) => split(juneTotal, DAILY_W).slice(12).reduce((a, b) => a + b, 0)

/* ---------------- Notifications ---------------- */
// kind sets the icon and tone. "to" is where the notification leads.
export const initialNotes = [
  { id: 'nt1', kind: 'review', title: 'Free 600ml water offer is with Microtek', body: 'Microtek is checking "Free 600ml water with any meal set". They usually reply within 2 working days.', at: '14 Dec 2027', ago: '3 days ago', to: '/merchant/offers/o5', area: 'Offers', read: false },
  { id: 'nt2', kind: 'milestone', title: 'Your prepaid reload offer passed 4,000 uses', body: '"RM3 off a RM30 prepaid reload" has 4,120 confirmed redemptions since 1 Aug 2027.', at: '16 Dec 2027', ago: 'Yesterday', to: '/merchant/offers/o1', area: 'Offers', read: false },
  { id: 'nt3', kind: 'ending', title: 'RM3 off a RM30 prepaid reload ends on 30 Dec', body: 'Workers stop seeing it after 30 December. To keep it going, copy it into a new offer and send it to Microtek.', at: '16 Dec 2027', ago: 'Yesterday', to: '/merchant/offers/o1', area: 'Offers', read: false },
  { id: 'nt4', kind: 'licence', title: 'Business licence ends on 31 Jan 2028', body: 'Upload the renewed licence from your local council so your outlets keep confirming codes.', at: '15 Dec 2027', ago: '2 days ago', to: '/merchant/settings?tab=documents', area: 'Account', read: false },
  { id: 'nt5', kind: 'sentback', title: 'Microtek sent back "30% off all items"', body: 'Reason: say which items the offer covers and add a minimum spend. Change it and send it again.', at: '11 Dec 2027', ago: '6 days ago', to: '/merchant/offers/o13', area: 'Offers', read: true },
  { id: 'nt6', kind: 'statement', title: 'Statement for November 2027 is ready', body: '3,350 confirmed redemptions across 4 offers. Download it from Reports.', at: '1 Dec 2027', ago: '1 Dec 2027', to: '/merchant/reports', area: 'Reports', read: true },
  { id: 'nt7', kind: 'outlet', title: '7-Eleven Kunak can confirm codes', body: 'Microtek approved the outlet. Its store manager can now confirm redemptions at the counter.', at: '28 Nov 2027', ago: '28 Nov 2027', to: '/merchant/outlets', area: 'Outlets', read: true },
  { id: 'nt8', kind: 'approved', title: 'Offer approved: RM5 off groceries above RM40', body: 'Microtek approved the offer. It went live for workers on 1 Oct 2027.', at: '29 Sep 2027', ago: '29 Sep 2027', to: '/merchant/offers/o7', area: 'Offers', read: true },
  { id: 'nt9', kind: 'welcome', title: 'Welcome to SCANS', body: 'Your partner application was approved. Add your outlets and send your first offer.', at: '12 Jul 2027', ago: '12 Jul 2027', to: '/merchant', area: 'Account', read: true },
]

/* ---------------- Documents and security ---------------- */
export const documents = [
  { k: 'agreement', t: 'Partner agreement', s: 'Signed 12 Jul 2027 with Microtek for Kerajaan Negeri Sabah', file: 'SCANS_partner_agreement_7-Eleven.pdf', size: '1.2 MB', uploaded: '12 Jul 2027', expires: '11 Jul 2028', daysLeft: 208, kind: 'agreement' },
  { k: 'ssm', t: 'SSM certificate', s: 'e-Info company profile', file: 'SSM_e-Info_198401015607.pdf', size: '412 KB', uploaded: '5 Jul 2027', expires: null, kind: 'file' },
  { k: 'licence', t: 'Business licence', s: 'Premises licence, Dewan Bandaraya Kota Kinabalu', file: 'Lesen_perniagaan_2027.pdf', size: '286 KB', uploaded: '5 Jul 2027', expires: '31 Jan 2028', daysLeft: 44, kind: 'file' },
  { k: 'auth', t: 'Authorisation letter', s: 'Names Tan Mei Ling as the person in charge', file: 'Authorisation_letter.pdf', size: '138 KB', uploaded: '5 Jul 2027', expires: null, kind: 'file' },
]
export const signIns = [
  { id: 's1', device: 'Chrome on Windows', place: 'Kota Kinabalu', at: 'Today 19:40', current: true },
  { id: 's2', device: 'Safari on iPhone', place: 'Kota Kinabalu', at: 'Today 08:15' },
  { id: 's3', device: 'Chrome on Windows', place: 'Kota Kinabalu', at: '15 Dec 2027 17:02' },
  { id: 's4', device: 'Safari on iPhone', place: 'Sandakan', at: '10 Dec 2027 12:44' },
]
