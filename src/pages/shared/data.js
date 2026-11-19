// Figures derived from src/data/demo.js for the Microtek and State consoles.
// Everything here is computed from demo.js so totals reconcile across portals.
import {
  REGISTERED, RATE, STATE_SHARE, districts, employers, employerUsers, employerBatches, workers, merchants, merchantOffers,
  merchantOutlets, merchantRedemptionsMonthly, offers, offerSubmissions, integrations, complaints, dailyCollection,
  collectionToday, collectedThisMonth, settledThisMonth, channels, demoWorker,
} from '../../data/demo.js'

export const districtByName = Object.fromEntries(districts.map((d) => [d.name, d]))

/* ---------- Collection by period ---------- */
// Today, by hour to 15:00 (adds up to collectionToday)
const HOUR_W = [2, 1, 1, 1, 2, 6, 14, 22, 30, 34, 31, 28, 26, 24, 23, 21]
const hw = HOUR_W.reduce((a, b) => a + b, 0)
export const hourlyToday = HOUR_W.map((w, i) => ({ label: String(i).padStart(2, '0'), value: Math.round((collectionToday * w) / hw) }))
hourlyToday[hourlyToday.length - 1].value += collectionToday - hourlyToday.reduce((s, x) => s + x.value, 0)

// Last 7 and last 30 days, built from the daily June figures
export const last7 = dailyCollection.slice(-7).map((d) => ({ label: d.label + ' Jun', value: d.value }))
export const week = last7.reduce((s, d) => s + d.value, 0)
const MAY_TAIL = [142300, 128900, 117400, 96200, 88700, 131800, 120600, 109300, 101500, 87400, 79200, 93600, 116800, 168500]
export const last30 = [
  ...MAY_TAIL.map((v, i) => ({ label: String(18 + i), value: v })),
  ...dailyCollection,
].slice(-30)
export const month30 = last30.reduce((s, d) => s + d.value, 0)
export const settledJune = settledThisMonth
// June settlements include arrears cleared and advance payments, on top of June contributions
export const arrearsAndAdvance = settledJune - collectedThisMonth

export const paymentSuccess = 0.986
export const uptime30 = 0.9997

/* ---------- Payment channels with colours ---------- */
export const CH_COLORS = ['#1D66B8', '#4D9AD3', '#13407A', '#14B8A6', '#7B4DE3', '#FF8A1F']
export const channelData = channels.map((c, i) => ({ label: c.name, value: c.share, color: CH_COLORS[i] }))

/* ---------- Reconciliation breaks: one log for the State and the operator ---------- */
// 3 resolved (4 and 11 June) and 2 open from today's run (17 June). Both portals count from this list.
export const reconciliationBreaks = [
  { id: 'RB-2706-007', date: '17 Jun 2027', kind: 'Credit with no receipt', ref: 'ACQ-88412093', amount: 100, note: 'Acquirer credit received, no SCANS receipt yet. Usually a late callback.', status: 'Open' },
  { id: 'RB-2706-006', date: '17 Jun 2027', kind: 'Duplicate payment', ref: 'TXN44271903', amount: 100, note: 'Worker paid twice for June by DuitNow QR. Refund or carry forward to July.', status: 'Open' },
  { id: 'RB-2706-005', date: '11 Jun 2027', kind: 'Amount mismatch', ref: 'BAT-2706-00431', amount: 300, note: 'Employer batch total differs from acquirer credit by RM300.', status: 'Resolved' },
  { id: 'RB-2706-004', date: '4 Jun 2027', kind: 'Credit with no receipt', ref: 'ACQ-88203317', amount: 200, note: 'Matched after acquirer resent callbacks.', status: 'Resolved' },
  { id: 'RB-2706-003', date: '4 Jun 2027', kind: 'Late settlement', ref: 'STL-270604', amount: 0, note: 'Settlement arrived 02:10 instead of 23:00. No money missing.', status: 'Resolved' },
]
// Breaks on each settlement day, counted from a break list (pass the live list so resolving one updates every page).
export const breaksOn = (list, date) => {
  const day = list.filter((b) => b.date === date)
  return { all: day.length, open: day.filter((b) => b.status === 'Open').length, resolved: day.filter((b) => b.status !== 'Open').length }
}

/* ---------- Daily settlement into the FWECF account ---------- */
export const settlements = dailyCollection.map((d, i) => {
  const day = i + 1
  const date = `${day} Jun 2027`
  const pending = day === 17
  const b = breaksOn(reconciliationBreaks, date)
  return {
    id: 'STL-2706' + String(day).padStart(2, '0'),
    date,
    gross: d.value,
    receipts: Math.round(d.value / RATE),
    state: Math.round(d.value * STATE_SHARE),
    operator: d.value - Math.round(d.value * STATE_SHARE),
    credited: pending ? 0 : d.value,
    breaks: b.all,
    status: pending ? 'Pending' : b.all ? 'Resolved' : 'Reconciled',
  }
})

/* ---------- Connected systems ---------- */
const SYS_EXTRA = {
  SWIMS: { latency: 180, sync: 'Today 06:00', uptime: 0.9995, mode: 'Read only', records: '122,228 records' },
  eNORES: { latency: 240, sync: 'Today 06:00', uptime: 0.9991, mode: 'Read only', records: '4,821 employers' },
  'KDN identity check': { latency: 2100, sync: 'Live', uptime: 0.9989, mode: 'Check only', records: 'Face and identity checks at sign-up' },
  'JIM permit data': { latency: 310, sync: 'Today 05:30', uptime: 0.9993, mode: 'Read only', records: 'Permit expiry feed' },
  'Payment gateway': { latency: 220, sync: 'Live', uptime: 0.9998, mode: 'Payments', records: '4,123 payments today' },
  'SMS and WhatsApp': { latency: 1150, sync: 'Live', uptime: 0.9962, mode: 'Messages', records: '38,210 messages today' },
}
export const systems = integrations.map((s) => ({ ...s, ...SYS_EXTRA[s.name] }))

/* ---------- Employers ---------- */
const ENORES = { 'emp-bpp': 'JTKS-LD-004812', 'emp-kae': 'JTKS-SDK-002291', 'emp-tch': 'JTKS-TWU-000874', 'emp-stw': 'JTKS-SDK-003318', 'emp-kaf': 'JTKS-KDT-001107', 'emp-khv': 'JTKS-KGU-002045', 'emp-khs': 'JTKS-KK-000963', 'emp-ssp': 'JTKS-SPN-001582', 'emp-brm': 'JTKS-BFT-000417', 'emp-tce': 'JTKS-KGU-000719' }
const STREET = { 'Lahad Datu': 'Batu 12, Jalan Segama, 91100 Lahad Datu', Sandakan: 'Batu 8, Jalan Labuk, 90000 Sandakan', Tawau: 'Jalan Apas, 91000 Tawau', Kudat: 'Jalan Pantai, 89050 Kudat', Keningau: 'Jalan Apin-Apin, 89007 Keningau', 'Kota Kinabalu': 'Jalan Tun Fuad Stephens, 88000 Kota Kinabalu', Semporna: 'Jalan Kastam, 91308 Semporna', Beaufort: 'Jalan Padas, 89808 Beaufort' }
const CONTACTS = ['Jennifer Liew', 'Tan Boon Huat', 'Rosnah Abdullah', 'Wong Kah Wai', 'Jainal Ahmad', 'Michelle Chin', 'Lo Siew Mei', 'Hamid Salleh', 'Peter Gimbang', 'Chong Li Ying']

// SCANS employer ID, derived from the SSM number so it is stable across the demo (format SCN26E + 7 digits).
export const employerScansId = (e) => e.scansId || 'SCN26E' + String(1000 + (parseInt(e.ssm.slice(-5), 10) * 37) % 3800).padStart(7, '0')
// Employer portal status: Inactive when no one from the company has signed in for 90 days (sample).
const PORTAL_INACTIVE = { 'emp-kaf': '2 Mar 2027', 'emp-ssp': '14 Feb 2027' }
export const employerPortal = (e) => (e.status === 'Invited' ? 'Invited' : PORTAL_INACTIVE[e.id] ? 'Inactive' : 'Active')
export const employerLastSignIn = (e) => PORTAL_INACTIVE[e.id] || null

export function employerDetail(e) {
  const i = employers.findIndex((x) => x.id === e.id)
  const owing = (e.workers - e.paid) * RATE
  const sample = workers.filter((w) => w.employerId === e.id)
  const permit = i % 3 === 1 ? 'Not on file' : i % 4 === 3 ? 'Expired' : 'Valid'
  return {
    ...e,
    enores: ENORES[e.id] || 'JTKS-' + e.ssm.slice(-6),
    scansId: employerScansId(e),
    portal: employerPortal(e),
    address: STREET[e.district],
    registered: ['2014', '2009', '1997', '2012', '2018', '2016', '2005', '2019', '1999', '2007'][i] || '2015',
    contact: CONTACTS[i] || 'Company admin',
    paidShare: e.paid / e.workers,
    owing,
    sample,
    deductionPermit: permit,
    permitRef: permit === 'Not on file' ? '—' : `JTKS/113(4)/${e.district.slice(0, 3).toUpperCase()}/${2026 - (i % 2)}/${String(400 + i * 37)}`,
    permitValid: permit === 'Valid' ? '31 Dec 2027' : permit === 'Expired' ? '31 Mar 2027' : '—',
    autoDebit: i % 2 === 0 ? 'Active' : 'Not set up',
    users: i === 0 ? employerUsers : [
      { name: CONTACTS[i] || 'Company admin', email: 'admin@' + e.id.slice(4) + '.example.my', role: 'Admin', twoFA: true, last: 'Today', status: 'Active' },
      { name: 'Finance clerk', email: 'finance@' + e.id.slice(4) + '.example.my', role: 'Payments', twoFA: true, last: '3 days ago', status: 'Active' },
    ],
    batches: i === 0 ? employerBatches : employerBatches.slice(0, 3).map((b, j) => {
      const n = Math.max(4, Math.round(e.paid * (j === 0 ? 0.55 : 0.4)))
      const months = j === 2 ? 3 : 1
      return { ...b, id: b.id.replace(/\d{5}$/, String(500 + i * 13 + j).padStart(5, '0')), workers: n, months, amount: n * months * RATE, method: j === 1 ? 'FPX · CIMB Clicks' : 'FPX · Maybank2u' }
    }),
  }
}

/* ---------- Workers ---------- */
export function siteFor(w) {
  if (w.id === demoWorker.scansId) return demoWorker.site
  const short = w.employer.replace(/ (Sdn Bhd|Bhd)$/, '')
  return `${short}, ${w.district}`
}
export const permitText = (w) => (w.permitDays < 0 ? 'Permit date passed' : `${w.permitDays} days left`)

/* ---------- Merchants ---------- */
const OUTLET_AREAS = ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau', 'Kudat', 'Semporna', 'Beaufort']
export function merchantDetail(m) {
  const is711 = m.id === 'mer-711'
  const live = is711 ? merchantOffers : [
    ...offers.filter((o) => o.merchant === m.name).map((o) => ({ ...o, discount: '—', category: m.category, starts: '1 Mar 2027', limit: 'One a month', views: o.redemptions * 4, outlets: 'All outlets' })),
    ...offerSubmissions.filter((o) => o.merchant === m.name && o.status === 'Approved').map((o) => ({ id: o.id, title: o.title, discount: o.discount, category: m.category, starts: o.goLive, ends: '31 Dec 2027', limit: o.limit, redemptions: Math.round(m.redemptions * 0.4), views: Math.round(m.redemptions * 1.6), status: 'Live', outlets: o.audience })),
  ]
  const scale = m.redemptions / 15234
  const monthly = merchantRedemptionsMonthly.map((x) => ({ ...x, value: Math.round(x.value * scale) }))
  const outletList = is711 ? merchantOutlets : Array.from({ length: Math.min(m.outlets, 6) }, (_, i) => ({
    id: 'OUT-' + String(i + 1).padStart(2, '0'),
    name: `${m.name} ${OUTLET_AREAS[(i * 3 + m.name.length) % OUTLET_AREAS.length]}${i > 0 ? ' ' + (i + 1) : ''}`,
    district: OUTLET_AREAS[(i * 3 + m.name.length) % OUTLET_AREAS.length],
    redemptions: m.status === 'Active' ? Math.round((m.redemptions / Math.max(1, Math.min(m.outlets, 6))) * (1.2 - i * 0.08)) : 0,
    status: m.status === 'Active' ? 'Active' : 'Pending',
  }))
  return { ...m, live, monthly, outletList }
}

// Live and waiting offers for one merchant, the same on the State and Microtek pages.
// Pass the session's offer submissions so an approval in the console shows straight away.
export function offerCounts(m, subs = offerSubmissions) {
  const d = merchantDetail(m)
  const mine = subs.filter((o) => o.merchant === m.name)
  const wasPending = new Set(offerSubmissions.filter((o) => o.merchant === m.name && o.status === 'Pending').map((o) => o.id))
  const live = d.live.filter((o) => o.status === 'Live').length + mine.filter((o) => o.status === 'Approved' && wasPending.has(o.id)).length
  const waiting = mine.filter((o) => o.status === 'Pending').length
  return { live, waiting, text: waiting ? `${live} live, ${waiting} waiting` : `${live} live` }
}

export const applicationDocs = {
  'MA-2706-014': [['SSM company certificate', true], ['List of outlets with addresses', true], ['Bank account for settlement', true], ['Signed partner agreement', true], ['PDPA undertaking (no worker data)', false]],
  'MA-2706-011': [['SSM business registration', true], ['List of outlets with addresses', true], ['Bank account for settlement', false], ['Signed partner agreement', true], ['PDPA undertaking (no worker data)', false]],
  'MA-2705-087': [['SSM company certificate', true], ['List of outlets with addresses', true], ['Bank account for settlement', true], ['Signed partner agreement', true], ['PDPA undertaking (no worker data)', true]],
  'MA-2705-061': [['SSM business registration', true], ['List of outlets with addresses', false], ['Bank account for settlement', false], ['Signed partner agreement', false], ['PDPA undertaking (no worker data)', false]],
}

/* ---------- Complaints (demo.js has five; this adds older ones for the State figures) ---------- */
const MORE_COMPLAINTS = [
  { id: 'CMP-2705-0361', topic: 'Receipt not received', district: 'Sandakan', lang: 'Filipino', agency: 'SCANS support', opened: '24 May 2027', status: 'Resolved' },
  { id: 'CMP-2705-0344', topic: 'Overtime not paid', district: 'Tawau', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '22 May 2027', status: 'Resolved' },
  { id: 'CMP-2705-0322', topic: 'Lost passport', district: 'Kota Kinabalu', lang: 'Bengali', agency: 'JIM', opened: '20 May 2027', status: 'With agency' },
  { id: 'CMP-2705-0310', topic: 'Identity check failed', district: 'Lahad Datu', lang: 'Bahasa Indonesia', agency: 'KDN', opened: '19 May 2027', status: 'Resolved' },
  { id: 'CMP-2705-0298', topic: 'Unsafe transport to site', district: 'Keningau', lang: 'Nepali', agency: 'JTK Sabah', opened: '17 May 2027', status: 'With agency' },
  { id: 'CMP-2705-0276', topic: 'Perk not honoured at shop', district: 'Tawau', lang: 'Bahasa Indonesia', agency: 'SCANS support', opened: '15 May 2027', status: 'Resolved' },
  { id: 'CMP-2705-0251', topic: 'Medical leave refused', district: 'Semporna', lang: 'Filipino', agency: 'JTK Sabah', opened: '12 May 2027', status: 'New' },
  { id: 'CMP-2705-0415', topic: 'Payment taken twice', district: 'Lahad Datu', lang: 'Bahasa Indonesia', agency: 'SCANS support', opened: '7 May 2027', status: 'Resolved' },
  { id: 'CMP-2704-0218', topic: 'Cannot see April receipt', district: 'Lahad Datu', lang: 'Bahasa Indonesia', agency: 'SCANS support', opened: '20 Apr 2027', status: 'Resolved' },
]
const BODY = {
  'Wages paid late': ['Gaji bulan Mei belum dibayar sampai sekarang. Mandor bilang tunggu bulan depan.', 'May wages have still not been paid. The supervisor says to wait until next month.'],
  'Payment taken twice': ['Nabawasan ako ng dalawang beses para sa Hunyo sa DuitNow.', 'I was charged twice for June through DuitNow.'],
  'Passport kept by employer': ['Paspor saya dipegang oleh kantor estet dan tidak dikembalikan.', 'The estate office is keeping my passport and has not given it back.'],
  'Housing conditions': ['Atap rumah kongsi bocor dan air tidak ada sejak dua minggu.', 'The roof of the workers’ quarters leaks and there has been no water for two weeks.'],
}
export const complaintsAll = [...complaints, ...MORE_COMPLAINTS].map((c, i) => {
  const b = BODY[c.topic] || [null, `Worker reports: ${c.topic.toLowerCase()}.`]
  return { ...c, anonymous: i % 3 !== 1, original: b[0], english: b[1], days: c.status === 'Resolved' ? 3 + (i % 6) : null }
})
export const AGENCIES = ['JTK Sabah', 'SCANS support', 'JIM', 'KDN', 'Jabatan Kesihatan', 'PDRM']

/* ---------- Notice templates with translations into the six worker languages ---------- */
export const LANGS = [
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'fil', label: 'Filipino' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ne', label: 'Nepali' },
]
export const TEMPLATES = [
  {
    key: 'due', name: 'Contribution reminder',
    en: ['July contribution is due by 5 July', 'Pay RM100 by 5 July in the SCANS app, at any 7-Eleven, or ask your employer. Paying late does not affect your permit.'],
    ms: ['Caruman Julai perlu dibayar sebelum 5 Julai', 'Bayar RM100 sebelum 5 Julai melalui aplikasi SCANS, di mana-mana 7-Eleven, atau minta majikan anda. Bayaran lewat tidak menjejaskan permit anda.'],
    id: ['Iuran Juli harus dibayar sebelum 5 Juli', 'Bayar RM100 sebelum 5 Juli lewat aplikasi SCANS, di 7-Eleven mana saja, atau minta majikan Anda. Terlambat bayar tidak mempengaruhi izin kerja Anda.'],
    fil: ['Ang kontribusyon para sa Hulyo ay dapat bayaran bago ang 5 Hulyo', 'Magbayad ng RM100 bago ang 5 Hulyo sa SCANS app, sa kahit anong 7-Eleven, o hilingin sa iyong employer. Hindi maaapektuhan ang iyong permit kung mahuli ang bayad.'],
    bn: ['জুলাইয়ের অবদান ৫ জুলাইয়ের মধ্যে দিতে হবে', '৫ জুলাইয়ের মধ্যে SCANS অ্যাপে, যেকোনো 7-Eleven-এ, অথবা আপনার নিয়োগকর্তার মাধ্যমে RM100 পরিশোধ করুন। দেরিতে পরিশোধ করলে আপনার পারমিটে কোনো প্রভাব পড়বে না।'],
    ne: ['जुलाईको योगदान ५ जुलाईभित्र तिर्नुपर्छ', '५ जुलाईभित्र SCANS एपमा, कुनै पनि 7-Eleven मा, वा आफ्नो रोजगारदातामार्फत RM100 तिर्नुहोस्। ढिलो तिर्दा तपाईंको अनुमतिपत्रमा असर पर्दैन।'],
  },
  {
    key: 'hours', name: 'Office hours',
    en: ['Help desks closed on 7 July', 'SCANS help desks are closed on 7 July for Awal Muharram. The app and payments work as normal.'],
    ms: ['Kaunter bantuan ditutup pada 7 Julai', 'Kaunter bantuan SCANS ditutup pada 7 Julai sempena Awal Muharram. Aplikasi dan pembayaran berjalan seperti biasa.'],
    id: ['Loket bantuan tutup pada 7 Juli', 'Loket bantuan SCANS tutup pada 7 Juli untuk Tahun Baru Islam. Aplikasi dan pembayaran tetap berjalan seperti biasa.'],
    fil: ['Sarado ang help desk sa 7 Hulyo', 'Sarado ang mga help desk ng SCANS sa 7 Hulyo para sa Awal Muharram. Gumagana pa rin ang app at ang pagbabayad.'],
    bn: ['৭ জুলাই সহায়তা কেন্দ্র বন্ধ', 'আওয়াল মুহাররম উপলক্ষে ৭ জুলাই SCANS সহায়তা কেন্দ্র বন্ধ থাকবে। অ্যাপ ও পেমেন্ট স্বাভাবিকভাবে চলবে।'],
    ne: ['७ जुलाईमा सहायता कक्ष बन्द', 'अवल मुहर्रमको अवसरमा ७ जुलाईमा SCANS सहायता कक्ष बन्द रहनेछ। एप र भुक्तानी सामान्य रूपमा चल्नेछ।'],
  },
  {
    key: 'safety', name: 'Safety notice',
    en: ['Heavy rain warning until Friday', 'Heavy rain is expected in your district until Friday. Stay away from rivers and follow Civil Defence (APM) instructions.'],
    ms: ['Amaran hujan lebat sehingga Jumaat', 'Hujan lebat dijangka di daerah anda sehingga Jumaat. Jauhi sungai dan ikut arahan Angkatan Pertahanan Awam (APM).'],
    id: ['Peringatan hujan lebat sampai Jumat', 'Hujan lebat diperkirakan terjadi di daerah Anda sampai Jumat. Jauhi sungai dan ikuti petunjuk Pertahanan Awam (APM).'],
    fil: ['Babala sa malakas na ulan hanggang Biyernes', 'Inaasahan ang malakas na ulan sa inyong distrito hanggang Biyernes. Lumayo sa mga ilog at sundin ang Civil Defence (APM).'],
    bn: ['শুক্রবার পর্যন্ত ভারী বৃষ্টির সতর্কতা', 'শুক্রবার পর্যন্ত আপনার জেলায় ভারী বৃষ্টি হতে পারে। নদী থেকে দূরে থাকুন এবং সিভিল ডিফেন্স (APM)-এর নির্দেশ মেনে চলুন।'],
    ne: ['शुक्रबारसम्म भारी वर्षाको चेतावनी', 'तपाईंको जिल्लामा शुक्रबारसम्म भारी वर्षा हुने सम्भावना छ। नदीबाट टाढा रहनुहोस् र सिभिल डिफेन्स (APM) को निर्देशन पालना गर्नुहोस्।'],
  },
]

export const REGISTERED_ALL = REGISTERED
// People reachable per audience (workers + employers + merchants)
export const AUDIENCE_SIZE = { workers: REGISTERED, employers: 4821, merchants: merchants.filter((m) => m.status === 'Active').length }
