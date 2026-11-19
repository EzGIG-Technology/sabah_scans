// Demo data for the SCANS prototype.
// Figures marked "proposal" come from the SCANS proposal paper (Kertas Cadangan FWECF & SCANS).
// Everything else is sample data for the prototype and must be replaced with live data.

export const RATE = 100 // RM per worker per month (proposal s.6.1)
export const STATE_SHARE = 0.7 // proposal s.6.4
export const REGISTERED = 130391 // registered foreign workers, 31 Dec 2025 (proposal s.3.1)
export const DEMO_MONTH = 'December 2027'
export const DEMO_MONTH_SHORT = 'Dec 2027'
export const DEMO_DATE = 'Fri, 17 Dec 2027'
// Collection started on 1 July 2027. The sample covers July to December 2027; month index 0 = July 2027.
export const LAUNCH_MONTH = 6 // July, as a 0-based calendar month

export const rm = (n, dp = 0) =>
  'RM ' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: dp, maximumFractionDigits: dp })
export const num = (n) => Number(n).toLocaleString('en-MY')
export const pct = (n, dp = 0) => (n * 100).toFixed(dp) + '%'

// Sectors (proposal s.3.1)
export const sectors = [
  { name: 'Plantation', workers: 76726 },
  { name: 'Agriculture', workers: 26736 },
  { name: 'Services', workers: 7783 },
  { name: 'Manufacturing', workers: 6870 },
  { name: 'Domestic work', workers: 6844 },
  { name: 'Construction', workers: 5345 },
  { name: 'Mining and quarrying', workers: 87 },
]

// Districts: sample split of the 130,391 registered workers, with sample payment rates. The west coast pays
// best (Kota Kinabalu and Kudat at 90% or more) and the east-coast plantation areas least (Lahad Datu, Tawau
// and Semporna under 50%). Paid workers still add up to 78,455 for Sabah, the figure on every dashboard.
// col/row place each district on the tile map in rough geographic order (west to east, north to south).
export const districts = [
  { id: 'kudat', name: 'Kudat', workers: 6200, rate: 0.91, col: 2, row: 0 },
  { id: 'kk', name: 'Kota Kinabalu', workers: 18900, rate: 0.92, col: 1, row: 1 },
  { id: 'sandakan', name: 'Sandakan', workers: 24600, rate: 0.5748, col: 4, row: 1 },
  { id: 'beaufort', name: 'Beaufort', workers: 7900, rate: 0.7, col: 0, row: 2 },
  { id: 'keningau', name: 'Keningau', workers: 12300, rate: 0.62, col: 1, row: 2 },
  { id: 'lahaddatu', name: 'Lahad Datu', workers: 26800, rate: 0.46, col: 4, row: 2 },
  { id: 'tawau', name: 'Tawau', workers: 28400, rate: 0.48, col: 3, row: 3 },
  { id: 'semporna', name: 'Semporna', workers: 5291, rate: 0.41, col: 5, row: 3 },
].map((d) => {
  const paid = Math.round(d.workers * d.rate)
  return { ...d, paid, overdue: d.workers - paid, collected: paid * RATE }
})

// Split a whole number over weights so the parts add up exactly (largest remainder).
const apportion = (total, weights) => {
  const sum = weights.reduce((s, w) => s + w, 0)
  const raw = weights.map((w) => (total * w) / sum)
  const out = raw.map(Math.floor)
  let left = total - out.reduce((s, x) => s + x, 0)
  raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { out[i] += 1; left -= 1 } })
  return out
}

// Employers by reporting area (sample split of the 4,821 registered employers) and how many paid for at
// least one worker this month (3,204 in all, the figure on the Microtek command centre).
export const EMPLOYERS = 4821
export const EMPLOYERS_PAID = 3204
const empIn = apportion(EMPLOYERS, districts.map((d) => d.workers))
// More of an area's companies have paid where more of its workers have; never more than the area has.
const empPaidIn = apportion(EMPLOYERS_PAID, districts.map((d, i) => empIn[i] * (0.3 + 0.7 * d.rate)))
districts.forEach((d, i) => { d.employers = empIn[i]; d.employersPaid = empPaidIn[i] })

// One set of contribution statuses for every portal. Owing = every unpaid month, the current one included.
//   Paid               nothing owing
//   Due this month     only the current month owing (RM100)
//   1–2 months overdue 1 or 2 earlier months owing as well (RM200–300)
//   3+ months overdue  3 or more earlier months owing as well (RM400 or more)
export const STATUSES = ['Paid', 'Due this month', '1–2 months overdue', '3+ months overdue']
export const statusFor = (owingMonths) => (owingMonths <= 0 ? STATUSES[0] : owingMonths === 1 ? STATUSES[1] : owingMonths <= 3 ? STATUSES[2] : STATUSES[3])

export const paidThisMonth = districts.reduce((s, d) => s + d.paid, 0)
export const overdueThisMonth = REGISTERED - paidThisMonth // not yet paid for the current month
export const dueThisMonth = Math.round(overdueThisMonth * 0.3)
export const overdue1 = Math.round(overdueThisMonth * 0.4) // 1–2 months overdue
export const overdue3 = overdueThisMonth - dueThisMonth - overdue1 // 3+ months overdue
export const collectedThisMonth = paidThisMonth * RATE
export const complianceRate = paidThisMonth / REGISTERED

// Daily settlements into the FWECF account for the demo month (1 to 17 December). They include arrears
// cleared and months paid in advance, so the month's total is more than December contributions alone.
export const dailyCollection = [612400, 958300, 1104200, 1322800, 1486100, 248600, 189400, 233900, 201700, 188300, 176200, 214800, 96400, 88100, 251300, 302700, 412300]
  .map((v, i) => ({ label: String(i + 1), value: v }))
export const settledThisMonth = dailyCollection.reduce((s, d) => s + d.value, 0)

// Reconciled settlements into the FWECF account each month since launch (sample ramp towards the
// proposal's 60% Year 1 rate). The 70:30 split and the operator invoice use these settlements,
// never the month's contributions (Brief v0.2 fig. 1: operator 30% is calculated after reconciliation).
export const monthly = [
  { m: 'Jul', v: 5214800 },
  { m: 'Aug', v: 6102300 },
  { m: 'Sep', v: 6744900 },
  { m: 'Oct', v: 7188200 },
  { m: 'Nov', v: 7560400 },
  { m: 'Dec', v: settledThisMonth },
]
export const ytd = monthly.reduce((s, x) => s + x.v, 0)
export const stateYtd = ytd * STATE_SHARE
export const operatorYtd = ytd - stateYtd

export const channels = [
  { name: 'Touch ’n Go eWallet', share: 0.34 },
  { name: 'Cash at 7-Eleven', share: 0.24 },
  { name: 'DuitNow QR', share: 0.17 },
  { name: 'Employer bulk payment', share: 0.13 },
  { name: 'FPX online banking', share: 0.07 },
  { name: 'Boost, GrabPay, ShopeePay', share: 0.05 },
]

// Sample data: the proposal has no nationality breakdown. Label it as sample wherever it is shown.
export const nationalities = [
  { name: 'Indonesia', share: 0.61 },
  { name: 'Philippines', share: 0.29 },
  { name: 'India', share: 0.04 },
  { name: 'Bangladesh', share: 0.03 },
  { name: 'Others', share: 0.03 },
]

// The one demo worker, used the same way in every portal.
export const demoWorker = {
  name: 'Agus Salim',
  scansId: 'SCN26W0047218',
  passport: 'C 5539120',
  nationality: 'Indonesia',
  plks: 'PLKS-SBH-2026-0481193',
  permitExpiry: '14 Sep 2028',
  phone: '+60 11-2847 3391',
  language: 'Bahasa Indonesia',
  employer: 'Borneo Palm Plantations Sdn Bhd',
  employerId: 'emp-bpp',
  site: 'Ladang Segama, Lahad Datu',
  district: 'Lahad Datu',
  sector: 'Plantation',
  role: 'Harvester',
  paidThrough: 'Nov 2027',
  due: { month: 'December 2027', amount: 100, dueDate: '5 Dec 2027' },
  arrears: 100, // owing, current month included
}

export const workerPayments = [
  { id: 'RCP-2711-118204', month: 'Nov 2027', amount: 100, method: 'Touch ’n Go eWallet', date: '3 Nov 2027', by: 'Agus Salim' },
  { id: 'RCP-2710-097731', month: 'October 2027', amount: 100, method: 'Cash at 7-Eleven', date: '4 Oct 2027', by: 'Agus Salim' },
  { id: 'RCP-2707-004415', month: 'July to September 2027', amount: 300, method: 'Employer bulk payment', date: '6 Jul 2027', by: 'Borneo Palm Plantations Sdn Bhd' },
]

export const notices = [
  { id: 'n1', from: 'Kerajaan Negeri Sabah', date: '28 Nov 2027', title: 'December contribution is due by 5 December', body: 'Pay RM100 by 5 December through the app, at any 7-Eleven, or ask your employer. Paying late does not affect your permit. You will get a reminder.', kind: 'Payment' },
  { id: 'n2', from: 'Jabatan Tenaga Kerja Sabah', date: '19 Nov 2027', title: 'Your rights on rest days', body: 'Workers are entitled to one rest day each week. If you are asked to work on your rest day you must be paid for it. Use Help to report a problem.', kind: 'Rights' },
  { id: 'n3', from: 'Kerajaan Negeri Sabah', date: '6 Nov 2027', title: 'Flood warning: Lahad Datu and Sandakan', body: 'Heavy rain is expected until Friday. Stay away from rivers. Follow your supervisor and the Civil Defence (APM) instructions.', kind: 'Safety' },
  { id: 'n4', from: 'Kerajaan Negeri Sabah', date: '3 Nov 2027', title: 'Payment received for November', body: 'We received RM100 for November 2027. Receipt RCP-2711-118204.', kind: 'Receipt' },
]

export const offers = [
  { id: 'o1', merchant: '7-Eleven Sabah', title: 'RM3 off a RM30 prepaid reload', terms: 'One use a month. Any 7-Eleven in Sabah.', ends: '30 Dec 2027', redemptions: 4120, status: 'Live' },
  { id: 'o2', merchant: 'CelcomDigi', title: '10GB extra data on the RM35 plan', terms: 'New and existing prepaid lines.', ends: '31 Jan 2028', redemptions: 2287, status: 'Live' },
  { id: 'o3', merchant: 'Pasaraya Servay', title: '5% off rice', terms: 'Tawau, Sandakan and Lahad Datu branches.', ends: '15 Jan 2028', redemptions: 1904, status: 'Live' },
  { id: 'o4', merchant: 'Klinik Mesra Borneo', title: 'RM20 general consultation', terms: 'Show your SCANS card. Weekdays only.', ends: '29 Feb 2028', redemptions: 611, status: 'Live' },
  { id: 'o5', merchant: '7-Eleven Sabah', title: 'Free 600ml water with any meal set', terms: 'Selected outlets in Kota Kinabalu.', ends: '20 Feb 2028', redemptions: 0, status: 'Waiting for approval' },
]

export const employers = [
  { id: 'emp-bpp', name: 'Borneo Palm Plantations Sdn Bhd', ssm: '201401023318', district: 'Lahad Datu', sector: 'Plantation', workers: 412, paid: 371, status: 'Partly paid' },
  { id: 'emp-kae', name: 'Kinabatangan Agro Estates Sdn Bhd', ssm: '200901041187', district: 'Sandakan', sector: 'Plantation', workers: 1288, paid: 1182, status: 'Partly paid' },
  { id: 'emp-tch', name: 'Tawau Cocoa Holdings Bhd', ssm: '199701008842', district: 'Tawau', sector: 'Agriculture', workers: 640, paid: 640, status: 'All paid' },
  { id: 'emp-stw', name: 'Sandakan Timber Works Sdn Bhd', ssm: '201201015506', district: 'Sandakan', sector: 'Manufacturing', workers: 233, paid: 120, status: 'Behind' },
  { id: 'emp-kaf', name: 'Kudat Aqua Farms Sdn Bhd', ssm: '201801029934', district: 'Kudat', sector: 'Agriculture', workers: 96, paid: 92, status: 'Partly paid' },
  { id: 'emp-khv', name: 'Keningau Highland Vegetables Sdn Bhd', ssm: '201601031102', district: 'Keningau', sector: 'Agriculture', workers: 188, paid: 151, status: 'Partly paid' },
  { id: 'emp-khs', name: 'KK Harbour Services Sdn Bhd', ssm: '200501019963', district: 'Kota Kinabalu', sector: 'Services', workers: 154, paid: 154, status: 'All paid' },
  { id: 'emp-ssp', name: 'Semporna Seafood Processing Sdn Bhd', ssm: '201901008170', district: 'Semporna', sector: 'Manufacturing', workers: 121, paid: 52, status: 'Behind' },
  { id: 'emp-brm', name: 'Beaufort Rice Mills Sdn Bhd', ssm: '199901004417', district: 'Beaufort', sector: 'Agriculture', workers: 74, paid: 70, status: 'Partly paid' },
  { id: 'emp-tce', name: 'Tenom Coffee Estates Sdn Bhd', ssm: '200701027719', district: 'Keningau', sector: 'Agriculture', workers: 58, paid: 58, status: 'All paid' },
]

// Workers at the demo employer (sample of 12 of 412)
const first = ['Agus', 'Rina', 'Joel', 'Sitti', 'Ramon', 'Dewi', 'Imran', 'Ana', 'Budi', 'Liza', 'Hasan', 'Mario']
const last = ['Salim', 'Wulandari', 'Dela Cruz', 'Nurhaliza', 'Bautista', 'Lestari', 'Hossain', 'Reyes', 'Santoso', 'Mendoza', 'Ahmad', 'Villanueva']
const nat = ['Indonesia', 'Indonesia', 'Philippines', 'Indonesia', 'Philippines', 'Indonesia', 'Bangladesh', 'Philippines', 'Indonesia', 'Philippines', 'India', 'Philippines']
const roles = ['Harvester', 'Fruit collector', 'Tractor driver', 'Weeding', 'Harvester', 'Nursery', 'Mill operator', 'Weeding', 'Harvester', 'Fruit collector', 'Mechanic', 'Harvester']
const statuses = ['Paid', 'Paid', 'Due this month', 'Paid', '1–2 months overdue', 'Paid', 'Paid', '3+ months overdue', 'Paid', 'Due this month', 'Paid', 'Paid']
const expiry = ['14 Sep 2028', '2 Feb 2028', '30 Jan 2028', '11 Jul 2028', '19 Dec 2027', '5 Aug 2028', '28 Apr 2028', '9 Jan 2028', '17 Jun 2028', '3 Mar 2028', '22 Oct 2028', '1 May 2028']
export const employerWorkers = first.map((f, i) => ({
  id: i === 0 ? 'SCN26W0047218' : 'SCN26W00' + (47219 + i * 37),
  name: `${f} ${last[i]}`,
  nationality: nat[i],
  role: roles[i],
  status: statuses[i],
  permitExpiry: expiry[i],
  arrears: { 'Due this month': 100, '1–2 months overdue': 200, '3+ months overdue': 400 }[statuses[i]] || 0,
  appActive: i % 5 !== 3,
}))

export const complaints = [
  { id: 'CMP-2712-0095', topic: 'Wages paid late', district: 'Lahad Datu', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '2 Dec 2027', status: 'With agency' },
  { id: 'CMP-2712-0091', topic: 'Wages paid late', district: 'Sandakan', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '2 Dec 2027', status: 'With agency' },
  { id: 'CMP-2712-0088', topic: 'Payment taken twice', district: 'Tawau', lang: 'Filipino', agency: 'SCANS support', opened: '1 Dec 2027', status: 'Resolved' },
  { id: 'CMP-2711-0412', topic: 'Passport kept by employer', district: 'Lahad Datu', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '28 Nov 2027', status: 'With agency' },
  { id: 'CMP-2711-0397', topic: 'Cannot log in to the app', district: 'Kota Kinabalu', lang: 'English', agency: 'SCANS support', opened: '27 Nov 2027', status: 'Resolved' },
  { id: 'CMP-2711-0380', topic: 'Housing conditions', district: 'Keningau', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '26 Nov 2027', status: 'New' },
]

export const announcements = [
  { id: 'a1', title: 'December contribution is due by 5 December', audience: 'All workers', langs: 6, sent: '28 Nov 2027', reached: 0.92, status: 'Sent' },
  { id: 'a2', title: 'Flood warning: Lahad Datu and Sandakan', audience: 'Lahad Datu, Sandakan', langs: 6, sent: '6 Nov 2027', reached: 0.88, status: 'Sent' },
  { id: 'a3', title: 'Christmas office hours', audience: 'All workers and employers', langs: 6, sent: '—', reached: 0, status: 'Waiting for State approval' },
]

export const approvals = [
  { id: 'AP-1182', type: 'Employer sign-up', name: 'Lahad Datu Oil Palm Mill Sdn Bhd', detail: 'SSM 202001017721 · 286 workers in eNORES', age: '2 days' },
  { id: 'AP-1181', type: 'Merchant offer', name: '7-Eleven Sabah', detail: 'Free 600ml water with any meal set', age: '3 days' },
  { id: 'AP-1179', type: 'Record mismatch', name: 'Rina Wulandari', detail: 'Name in SWIMS differs from passport scan', age: '4 days' },
  { id: 'AP-1176', type: 'Announcement', name: 'Christmas office hours', detail: 'Needs State approval before sending', age: '5 days' },
  { id: 'AP-1170', type: 'Merchant sign-up', name: 'Kedai Runcit Ah Seng', detail: 'Tawau · 2 outlets', age: '6 days' },
]

export const auditLog = [
  { at: '17 Dec 2027 09:42', who: 'Nurul Ain (State, JKN)', action: 'Exported monthly collection report', target: 'Nov 2027' },
  { at: '17 Dec 2027 09:31', who: 'Jeffrey Gimbang (JIM Sabah)', action: 'Looked up contribution status', target: 'SCN26W0047477' },
  { at: '17 Dec 2027 09:26', who: 'Siti Aminah Yusof (JIM Sabah)', action: 'Looked up contribution status', target: 'SCN26W0047551' },
  { at: '17 Dec 2027 09:18', who: 'Nur Syafiqah Abdullah (JIM Sabah)', action: 'Looked up contribution status', target: 'SCN26W0047736' },
  { at: '17 Dec 2027 09:15', who: 'Faizal Rahman (Microtek)', action: 'Viewed worker record', target: 'SCN26W0047218' },
  { at: '17 Dec 2027 09:05', who: 'Mohd Hafiz Rahim (JIM Sabah)', action: 'Looked up contribution status', target: 'SCN26W0047847' },
  { at: '17 Dec 2027 08:58', who: 'Rosnah Majalin (JIM Sabah)', action: 'Looked up contribution status', target: 'SCN26W0048439' },
  { at: '17 Dec 2027 08:52', who: 'Mohd Hafiz Rahim (JIM Sabah)', action: 'Signed in with two steps', target: 'Immigration dashboard' },
  { at: '17 Dec 2027 08:47', who: 'Hamdan Sapri (JIM Sabah)', action: 'Looked up contribution status', target: 'SCN26W0047958' },
  { at: '16 Dec 2027 17:03', who: 'System', action: 'Daily reconciliation completed, 0 breaks', target: '16 Dec 2027' },
  { at: '16 Dec 2027 15:40', who: 'Nur Syafiqah Abdullah (JIM Sabah)', action: 'Exported permits ending soon', target: '11 sample records · within 60 days, Sandakan' },
  { at: '16 Dec 2027 14:22', who: 'Lim Wei Ling (Microtek)', action: 'Approved merchant offer', target: 'Pasaraya Servay · 5% off rice' },
  { at: '16 Dec 2027 11:08', who: 'Faizal Rahman (Microtek)', action: 'Corrected worker name after SWIMS check', target: 'SCN26W0051882' },
]

export const integrations = [
  { name: 'SWIMS', owner: 'Sabah State', state: 'Connected', note: 'Last sync 06:00 today, 0 errors' },
  { name: 'eNORES', owner: 'JTK Sabah', state: 'Connected', note: 'Last sync 06:00 today, 3 records held for review' },
  { name: 'KDN identity check', owner: 'KDN', state: 'Connected', note: '1,204 checks today, median 2.1 s' },
  { name: 'JIM permit data', owner: 'JIM', state: 'Read only', note: 'Expiry dates for display only' },
  { name: 'Payment gateway', owner: 'Licensed acquirer', state: 'Connected', note: 'Settlement to FWECF account at 23:00' },
  { name: 'SMS and WhatsApp', owner: 'Messaging provider', state: 'Degraded', note: 'WhatsApp delivery slower than usual' },
]

export const merchantOutlets = [
  { id: 'OUT-01', name: '7-Eleven Jalan Dunlop', district: 'Tawau', redemptions: 812, status: 'Active' },
  { id: 'OUT-02', name: '7-Eleven Bandar Sri Indah', district: 'Tawau', redemptions: 604, status: 'Active' },
  { id: 'OUT-03', name: '7-Eleven Jalan Tiga', district: 'Sandakan', redemptions: 733, status: 'Active' },
  { id: 'OUT-04', name: '7-Eleven Fajar Centre', district: 'Lahad Datu', redemptions: 921, status: 'Active' },
  { id: 'OUT-05', name: '7-Eleven Gaya Street', district: 'Kota Kinabalu', redemptions: 455, status: 'Active' },
  { id: 'OUT-06', name: '7-Eleven Bundusan', district: 'Kota Kinabalu', redemptions: 0, status: 'Paused' },
]

export const languages = [
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'fil', label: 'Filipino' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ne', label: 'नेपाली (Nepali)' },
]

/* =====================================================================
   Extended sample data for the full portal journeys.
   Everything below is generated deterministically so every portal sees
   the same records. Replace with the live API (see SCANS_HANDOFF.md §6).
   ===================================================================== */

// Small deterministic random generator so the sample never changes between reloads.
function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
const pick = (r, xs) => xs[Math.floor(r() * xs.length)]

// Collection by period (gross, before the 70:30 split)
export const collectionToday = 412300
export const collectionMonth = collectedThisMonth

// Paid / due this month / 1–2 months overdue / 3+ months overdue across all registered workers (adds up to REGISTERED)
export const paymentMetrics = [
  { label: 'Paid', value: paidThisMonth, color: 'var(--okFill)' },
  { label: 'Due this month', value: dueThisMonth, color: 'var(--blue)' },
  { label: '1–2 months overdue', value: overdue1, color: 'var(--warnFill)' },
  { label: '3+ months overdue', value: overdue3, color: 'var(--badFill)' },
]

// Last 7 days of the daily figures. December settlements also include arrears cleared and months paid in advance.
export const collectionWeek = dailyCollection.slice(-7).reduce((s, d) => s + d.value, 0)

// Monthly settlements split into State and operator share
export const monthlySplit = monthly.map((m) => ({ label: m.m, values: [Math.round(m.v * STATE_SHARE), Math.round(m.v * (1 - STATE_SHARE))] }))

// Sabah-wide workers per nationality (shares above applied to the registered total)
export const nationalityCounts = nationalities.map((n) => ({ label: n.name, value: Math.round(n.share * REGISTERED) }))

/* ---------- Worker master list (sample of 160 records) ---------- */
const FIRST = {
  Indonesia: ['Agus', 'Rina', 'Sitti', 'Dewi', 'Budi', 'Wayan', 'Siti', 'Joko', 'Ayu', 'Rudi', 'Yusuf', 'Nur'],
  Philippines: ['Joel', 'Ramon', 'Ana', 'Liza', 'Mario', 'Jose', 'Maricel', 'Arnel', 'Grace', 'Rodel', 'Jun', 'Cristina'],
  Bangladesh: ['Imran', 'Rahim', 'Karim', 'Nasir', 'Sohel', 'Rafiq'],
  India: ['Hasan', 'Ravi', 'Suresh', 'Arjun'],
  Others: ['Thant', 'Aung', 'Bishnu', 'Ram'],
}
const LAST = {
  Indonesia: ['Salim', 'Wulandari', 'Nurhaliza', 'Lestari', 'Santoso', 'Sudarma', 'Rahayu', 'Purnomo', 'Hidayat', 'Saputra'],
  Philippines: ['Dela Cruz', 'Bautista', 'Reyes', 'Mendoza', 'Villanueva', 'Santos', 'Garcia', 'Ramos', 'Aquino', 'Torres'],
  Bangladesh: ['Hossain', 'Uddin', 'Rahman', 'Islam', 'Ahmed'],
  India: ['Ahmad', 'Kumar', 'Nair', 'Pillai'],
  Others: ['Zaw', 'Kyaw', 'Thapa', 'Gurung'],
}
const SITE_ROLE = {
  Plantation: ['Harvester', 'Fruit collector', 'Tractor driver', 'Weeding', 'Nursery', 'Mill operator'],
  Agriculture: ['Farm hand', 'Packer', 'Sprayer', 'Picker'],
  Manufacturing: ['Machine operator', 'Packer', 'Forklift driver'],
  Services: ['Cleaner', 'Kitchen helper', 'Port hand'],
  'Domestic work': ['Domestic helper'],
  Construction: ['General worker', 'Bricklayer'],
}
const NAT_SHARE = [['Indonesia', 0.61], ['Philippines', 0.29], ['India', 0.04], ['Bangladesh', 0.03], ['Others', 0.03]]
const PASSPORT_PREFIX = { Indonesia: 'C', Philippines: 'P', Bangladesh: 'B', India: 'Z', Others: 'M' }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Days from the demo date (17 Dec 2027) to a permit expiry date.
const DEMO_DAY = Date.UTC(2027, 11, 17)
export const daysFromDemo = (y, m, d) => Math.round((Date.UTC(y, m, d) - DEMO_DAY) / 86400000)

function makeWorkers() {
  const r = rng(20270617)
  const out = []
  const usedNames = new Set([demoWorker.name])
  for (let i = 0; i < 160; i++) {
    const roll = r()
    let acc = 0, nat = 'Indonesia'
    for (const [n, s] of NAT_SHARE) { acc += s; if (roll <= acc) { nat = n; break } }
    const emp = i < 12 ? employers[0] : pick(r, employers)
    const st = r()
    // Months owing, the current month included. Same random draws as before so the sample stays the same.
    const owing = st < 0.6 ? 0 : st < 0.72 ? 1 : st < 0.88 ? 2 + (i % 2) : 4 + Math.floor(r() * 2)
    const status = statusFor(owing)
    const arrears = owing * RATE
    let yr = 2027 + Math.floor(r() * 2)
    let mo = Math.floor(r() * 12)
    if (yr === 2027 && mo < 6) yr = 2028 // every permit in the sample is still valid on the demo date
    mo += LAUNCH_MONTH; if (mo > 11) { mo -= 12; yr += 1 } // same draws as before, moved to the July 2027 launch
    let name = `${pick(r, FIRST[nat])} ${pick(r, LAST[nat])}`
    while (usedNames.has(name)) name = `${pick(r, FIRST[nat])} ${pick(r, LAST[nat])}`
    usedNames.add(name)
    const expiryDay = 1 + Math.floor(r() * 27)
    out.push({
      id: 'SCN26W00' + String(47218 + i * 37).padStart(5, '0'),
      name,
      gender: r() < 0.82 ? 'Male' : 'Female',
      dob: `${1 + Math.floor(r() * 27)} ${pick(r, MONTHS)} ${1975 + Math.floor(r() * 26)}`,
      nationality: nat,
      passport: `${PASSPORT_PREFIX[nat]} ${String(Math.floor(1000000 + r() * 8999999))}`,
      plks: `PLKS-SBH-2026-0${String(Math.floor(100000 + r() * 899999))}`,
      permitExpiry: `${expiryDay} ${MONTHS[mo]} ${yr}`,
      permitDays: daysFromDemo(yr, mo, expiryDay),
      employer: emp.name,
      employerId: emp.id,
      district: emp.district,
      sector: emp.sector,
      role: pick(r, SITE_ROLE[emp.sector] || ['General worker']),
      status,
      arrears,
      paidThrough: `${MONTHS[LAUNCH_MONTH + 5 - owing]} 2027`,
      appActive: r() > 0.12,
      consent: r() > 0.15,
      language: nat === 'Indonesia' ? 'Bahasa Indonesia' : nat === 'Philippines' ? 'Filipino' : nat === 'Bangladesh' ? 'Bengali' : nat === 'Others' ? 'Nepali' : 'English',
      phone: `+60 1${Math.floor(r() * 9)}-${String(Math.floor(1000 + r() * 8999))} ${String(Math.floor(1000 + r() * 8999))}`,
      arrived: `${1 + Math.floor(r() * 27)} ${pick(r, MONTHS)} ${2018 + Math.floor(r() * 8)}`,
    })
  }
  // The demo worker is always first and always the same.
  out[0] = {
    ...out[0], id: demoWorker.scansId, name: demoWorker.name, gender: 'Male', dob: '12 Feb 1991', nationality: 'Indonesia',
    passport: demoWorker.passport, plks: demoWorker.plks, permitExpiry: demoWorker.permitExpiry, permitDays: daysFromDemo(2028, 8, 14),
    employer: demoWorker.employer, employerId: demoWorker.employerId, district: demoWorker.district, sector: 'Plantation',
    role: demoWorker.role, status: 'Due this month', arrears: demoWorker.arrears, paidThrough: 'Nov 2027', appActive: true, consent: true,
    language: demoWorker.language, phone: demoWorker.phone, arrived: '3 Feb 2022',
  }
  return out
}
export const workers = makeWorkers()
export const findWorker = (id) => workers.find((w) => w.id === id)

// Payment history for any worker (most recent first)
export function paymentsFor(w) {
  if (w.id === demoWorker.scansId) return workerPayments
  const r = rng(parseInt(w.id.slice(-5), 10))
  const methods = ['Touch ’n Go eWallet', 'Cash at 7-Eleven', 'DuitNow QR', 'Employer bulk payment', 'FPX online banking']
  const startIdx = MONTHS.indexOf(w.paidThrough.slice(0, 3)) - LAUNCH_MONTH // months since launch
  const rows = []
  for (let m = startIdx; m >= 0 && rows.length < 6; m--) {
    const method = pick(r, methods)
    rows.push({
      id: `RCP-27${String(LAUNCH_MONTH + m + 1).padStart(2, '0')}-${String(Math.floor(100000 + r() * 899999))}`,
      month: `${['July', 'August', 'September', 'October', 'November', 'December'][m]} 2027`, amount: 100, method,
      date: `${1 + Math.floor(r() * 5)} ${MONTHS[LAUNCH_MONTH + m]} 2027`, by: method === 'Employer bulk payment' ? w.employer : w.name,
    })
  }
  return rows
}

/* ---------- Live transactions feed ---------- */
const FEED_METHODS = ['Touch ’n Go eWallet', 'DuitNow QR', 'Cash at 7-Eleven', 'FPX online banking', 'Boost', 'GrabPay', 'Employer bulk payment']
export function makeTxn(n) {
  const r = rng(9000 + n * 13)
  r()
  const w = workers[(n * 37) % workers.length] // a different worker for each consecutive transaction
  const months = r() < 0.8 ? 1 : 3
  return {
    id: `TXN${String(74442815 + n * 7919).slice(-8)}`,
    worker: w.name, scansId: w.id, nationality: w.nationality, employer: w.employer, district: w.district,
    method: pick(r, FEED_METHODS), amount: months * RATE, period: months === 1 ? 'December 2027' : 'December 2027 to February 2028',
    cleared: w.status !== 'Paid' && r() < 0.4,
    at: n === 0 ? 'now' : `${n * 4}s ago`,
  }
}
export const recentTxns = Array.from({ length: 8 }, (_, i) => ({ ...makeTxn(1000 - i), at: `${(i + 1) * 3} min ago` }))

/* ---------- Merchants ---------- */
export const merchants = [
  { id: 'mer-711', name: '7-Eleven Sabah', company: '7-Eleven Malaysia Sdn Bhd', ssm: '198401015607', category: 'Convenience store', outlets: 46, offers: 4, redemptions: 15234, joined: '12 Jul 2027', status: 'Active', color: '#0E8F57', contact: 'Tan Mei Ling', email: 'partners@7eleven.example.my' },
  { id: 'mer-cd', name: 'CelcomDigi', company: 'CelcomDigi Berhad', ssm: '199701009694', category: 'Telco', outlets: 18, offers: 2, redemptions: 6420, joined: '20 Jul 2027', status: 'Active', color: '#1D66B8', contact: 'Hafiz Osman', email: 'b2b@celcomdigi.example.my' },
  { id: 'mer-grab', name: 'Grab', company: 'MyTeksi Sdn Bhd', ssm: '201201007917', category: 'Transport and food', outlets: 1, offers: 1, redemptions: 3102, joined: '3 Aug 2027', status: 'Active', color: '#17B26A', contact: 'Priya Nair', email: 'partners@grab.example.my' },
  { id: 'mer-servay', name: 'Pasaraya Servay', company: 'Servay Hypermarket Sdn Bhd', ssm: '198701004422', category: 'Supermarket', outlets: 12, offers: 1, redemptions: 1904, joined: '15 Aug 2027', status: 'Active', color: '#D42253', contact: 'Jessica Wong', email: 'marketing@servay.example.my' },
  { id: 'mer-kmb', name: 'Klinik Mesra Borneo', company: 'Klinik Mesra Borneo Sdn Bhd', ssm: '201501022881', category: 'Clinic', outlets: 7, offers: 1, redemptions: 611, joined: '2 Sep 2027', status: 'Active', color: '#7B4DE3', contact: 'Dr Lim Kok Wai', email: 'admin@kmb.example.my' },
  { id: 'mer-ws', name: 'Watsons Sabah', company: 'Watsons Personal Care Stores Sdn Bhd', ssm: '199401012345', category: 'Pharmacy', outlets: 9, offers: 1, redemptions: 880, joined: '18 Sep 2027', status: 'Active', color: '#14B8A6', contact: 'Nadia Karim', email: 'partners@watsons.example.my' },
  { id: 'mer-99', name: '99 Speedmart', company: '99 Speed Mart Sdn Bhd', ssm: '200101006655', category: 'Convenience store', outlets: 38, offers: 0, redemptions: 0, joined: '—', status: 'Pending', color: '#B85407', contact: 'Lee Chong Wei', email: 'bd@99speedmart.example.my' },
  { id: 'mer-ahseng', name: 'Kedai Runcit Ah Seng', company: 'Kedai Runcit Ah Seng', ssm: '202203011122', category: 'Grocery', outlets: 2, offers: 0, redemptions: 0, joined: '—', status: 'Pending', color: '#13407A', contact: 'Ah Seng', email: 'ahseng.tawau@example.my' },
]

// Merchant sign-up applications waiting on Microtek
export const merchantApplications = [
  { id: 'MA-2712-014', merchant: '99 Speedmart', category: 'Convenience store', outlets: 38, submitted: '14 Dec 2027', docs: 4, status: 'In review' },
  { id: 'MA-2712-011', merchant: 'Kedai Runcit Ah Seng', category: 'Grocery', outlets: 2, submitted: '11 Dec 2027', docs: 3, status: 'Needs info' },
  { id: 'MA-2711-087', merchant: 'Watsons Sabah', category: 'Pharmacy', outlets: 9, submitted: '2 Sep 2027', docs: 4, status: 'Approved' },
  { id: 'MA-2711-061', merchant: 'Mega Phone Tawau', category: 'Phone shop', outlets: 1, submitted: '28 Aug 2027', docs: 2, status: 'Rejected' },
]

// Offer submissions from merchants (Microtek approves before they go live)
export const offerSubmissions = [
  { id: 'OS-2712-021', merchant: '7-Eleven Sabah', title: 'Free 600ml water with any meal set', submitted: '14 Dec 2027', goLive: '1 Jan 2028', status: 'Pending', discount: 'Free item', limit: 'One a month', audience: 'All compliant workers' },
  { id: 'OS-2712-019', merchant: 'CelcomDigi', title: '10% off Celcom prepaid reload', submitted: '12 Dec 2027', goLive: '20 Dec 2027', status: 'Pending', discount: '10%', limit: 'One a month', audience: 'All compliant workers' },
  { id: 'OS-2712-016', merchant: 'Grab', title: 'RM5 off a GrabCar ride', submitted: '10 Dec 2027', goLive: '15 Dec 2027', status: 'Approved', discount: 'RM5', limit: 'Two a month', audience: 'Kota Kinabalu, Sandakan, Tawau' },
  { id: 'OS-2711-044', merchant: 'Watsons Sabah', title: 'RM3 off first-aid kits', submitted: '28 Nov 2027', goLive: '1 Dec 2027', status: 'Approved', discount: 'RM3', limit: 'One a month', audience: 'All compliant workers' },
  { id: 'OS-2711-031', merchant: 'Pasaraya Servay', title: 'Double points on rice', submitted: '20 Nov 2027', goLive: '—', status: 'Rejected', discount: 'Points', limit: '—', audience: 'All workers', reason: 'Loyalty points need a separate data agreement.' },
]

/* ---------- Merchant portal: 7-Eleven Sabah ---------- */
export const merchantSelf = merchants[0]
export const merchantOffers = [
  { id: 'o1', title: 'RM3 off a RM30 prepaid reload', discount: 'RM3', category: 'Top-up', starts: '1 Aug 2027', ends: '30 Dec 2027', limit: 'One a month', redemptions: 4120, views: 18240, status: 'Live', outlets: 'All outlets' },
  { id: 'o6', title: '20% off mobile top-up above RM50', discount: '20%', category: 'Top-up', starts: '1 Sep 2027', ends: '29 Feb 2028', limit: 'One a month', redemptions: 492, views: 4410, status: 'Live', outlets: 'All outlets' },
  { id: 'o7', title: 'RM5 off groceries above RM40', discount: 'RM5', category: 'Groceries', starts: '1 Oct 2027', ends: '31 Jan 2028', limit: 'Two a month', redemptions: 3870, views: 12950, status: 'Live', outlets: 'Tawau, Lahad Datu, Sandakan' },
  { id: 'o8', title: 'Free delivery on orders above RM25', discount: 'Free delivery', category: 'Delivery', starts: '15 Oct 2027', ends: '15 Jan 2028', limit: 'One a week', redemptions: 2310, views: 9080, status: 'Live', outlets: 'Kota Kinabalu' },
  { id: 'o5', title: 'Free 600ml water with any meal set', discount: 'Free item', category: 'Food', starts: '1 Jan 2028', ends: '20 Feb 2028', limit: 'One a month', redemptions: 0, views: 0, status: 'Waiting for approval', outlets: 'Kota Kinabalu' },
  { id: 'o9', title: 'RM2 off phone cases', discount: 'RM2', category: 'Accessories', starts: '1 Jul 2027', ends: '30 Sep 2027', limit: 'One a month', redemptions: 1210, views: 6620, status: 'Expired', outlets: 'All outlets' },
  { id: 'o10', title: 'Hari Raya bundle', discount: 'RM8', category: 'Groceries', starts: '—', ends: '—', limit: '—', redemptions: 0, views: 0, status: 'Draft', outlets: '—' },
]
export const merchantRedemptionsMonthly = [
  { label: 'Jul', value: 1280 }, { label: 'Aug', value: 1810 }, { label: 'Sep', value: 2430 }, { label: 'Oct', value: 2960 }, { label: 'Nov', value: 3350 }, { label: 'Dec', value: 3404 },
]
export const merchantPeakHours = [
  ['6am', 120], ['7am', 210], ['8am', 260], ['9am', 190], ['10am', 160], ['11am', 170], ['12pm', 310], ['1pm', 290], ['2pm', 180],
  ['3pm', 150], ['4pm', 170], ['5pm', 240], ['6pm', 420], ['7pm', 610], ['8pm', 650], ['9pm', 540], ['10pm', 300], ['11pm', 140],
].map(([label, value]) => ({ label, value }))
export const merchantRedeemers = [
  { label: 'Indonesia', value: 0.58 }, { label: 'Philippines', value: 0.31 }, { label: 'India', value: 0.05 }, { label: 'Bangladesh', value: 0.04 }, { label: 'Others', value: 0.02 },
]
export const recentRedemptions = [
  { id: 'RDM-881204', worker: 'SCN26W•••7218', offer: 'RM3 off a RM30 prepaid reload', outlet: '7-Eleven Fajar Centre', at: '17 Dec 2027 19:42', status: 'Confirmed' },
  { id: 'RDM-881197', worker: 'SCN26W•••3092', offer: 'RM5 off groceries above RM40', outlet: '7-Eleven Jalan Dunlop', at: '17 Dec 2027 19:31', status: 'Confirmed' },
  { id: 'RDM-881190', worker: 'SCN26W•••5511', offer: 'Free delivery on orders above RM25', outlet: '7-Eleven Gaya Street', at: '17 Dec 2027 19:08', status: 'Confirmed' },
  { id: 'RDM-881183', worker: 'SCN26W•••0408', offer: '20% off mobile top-up above RM50', outlet: '7-Eleven Jalan Tiga', at: '17 Dec 2027 18:55', status: 'Pending' },
  { id: 'RDM-881176', worker: 'SCN26W•••8821', offer: 'RM3 off a RM30 prepaid reload', outlet: '7-Eleven Bandar Sri Indah', at: '17 Dec 2027 18:40', status: 'Confirmed' },
]

/* ---------- Employer portal: Borneo Palm Plantations ---------- */
export const employerSelf = employers[0]
export const employerUsers = [
  { name: 'Jennifer Liew', email: 'jennifer.liew@bpp.example.my', role: 'Admin', twoFA: true, last: 'Today 08:12', status: 'Active' },
  { name: 'Ahmad Faiz', email: 'ahmad.faiz@bpp.example.my', role: 'Payments', twoFA: true, last: 'Yesterday', status: 'Active' },
  { name: 'Grace Lim', email: 'grace.lim@bpp.example.my', role: 'Viewer', twoFA: false, last: '—', status: 'Invited' },
]
export const employerBatches = [
  { id: 'BAT-2712-00418', date: '6 Dec 2027', workers: 214, months: 1, amount: 21400, method: 'FPX · Maybank2u', status: 'Settled' },
  { id: 'BAT-2711-00377', date: '5 Nov 2027', workers: 198, months: 1, amount: 19800, method: 'FPX · Maybank2u', status: 'Settled' },
  { id: 'BAT-2710-00302', date: '4 Oct 2027', workers: 120, months: 3, amount: 36000, method: 'FPX · CIMB Clicks', status: 'Settled' },
  { id: 'BAT-2707-00041', date: '6 Jul 2027', workers: 160, months: 3, amount: 48000, method: 'FPX · Maybank2u', status: 'Settled' },
]
export const perksRedemptionsByMonth = [
  { label: 'Jul', value: 210 }, { label: 'Aug', value: 280 }, { label: 'Sep', value: 352 }, { label: 'Oct', value: 344 }, { label: 'Nov', value: 418 }, { label: 'Dec', value: 436 },
]
export const fpxBanks = ['Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Now', 'Hong Leong Connect', 'Bank Islam', 'AmOnline', 'Bank Rakyat']

/* ---------- Operator: admin users and roles ---------- */
export const adminUsers = [
  { name: 'Faizal Rahman', email: 'faizal@microtek.example.my', org: 'Microtek', role: 'Superadmin', twoFA: true, last: 'Today 09:15', status: 'Active' },
  { name: 'Lim Wei Ling', email: 'weiling@microtek.example.my', org: 'Microtek', role: 'Operations', twoFA: true, last: 'Today 08:40', status: 'Active' },
  { name: 'Nurul Ain', email: 'nurul.ain@sabah.gov.my', org: 'Jabatan Kewangan Negeri', role: 'State finance', twoFA: true, last: 'Today 09:42', status: 'Active' },
  { name: 'Datuk Haji Rosli', email: 'rosli@sabah.gov.my', org: 'Kementerian Kewangan Negeri', role: 'State approver', twoFA: true, last: 'Yesterday', status: 'Active' },
  { name: 'Mohd Azlan', email: 'azlan@jtk.sabah.gov.my', org: 'JTK Sabah', role: 'Agency officer', twoFA: true, last: '2 days ago', status: 'Active' },
  { name: 'Siti Hajar', email: 'sitihajar@audit.sabah.gov.my', org: 'Jabatan Audit Negeri', role: 'Auditor', twoFA: true, last: '1 week ago', status: 'Active' },
  { name: 'Kevin Chong', email: 'kevin@microtek.example.my', org: 'Microtek', role: 'Support', twoFA: false, last: '—', status: 'Invited' },
]
export const adminRoles = [
  { name: 'Superadmin', who: 'Microtek', can: 'Everything except approving State notices', users: 1 },
  { name: 'Operations', who: 'Microtek', can: 'Approvals queue, worker records, merchants, reconciliation', users: 1 },
  { name: 'Support', who: 'Microtek', can: 'Worker records (view), complaints, help desk', users: 1 },
  { name: 'State finance', who: 'Jabatan Kewangan Negeri', can: 'Collection, FWECF statements, exports', users: 1 },
  { name: 'State approver', who: 'Kementerian Kewangan Negeri', can: 'Approve notices and policy changes', users: 1 },
  { name: 'Agency officer', who: 'JTK Sabah, KDN, JIM', can: 'Complaints routed to the agency, read-only records', users: 1 },
  { name: 'Auditor', who: 'Jabatan Audit Negeri', can: 'Read everything, export audit log', users: 1 },
]

/* ---------- Global announcements ---------- */
export const globalAnnouncements = [
  { id: 'GA-0048', title: 'December 2027 contribution is due by 5 December', sub: 'System-generated reminder', audience: 'Workers', channels: ['App', 'SMS', 'WhatsApp'], recipients: 130391, date: '28 Nov 2027', status: 'Sent', reached: 0.92 },
  { id: 'GA-0047', title: 'Scheduled maintenance, 20 December 01:00 to 03:00', sub: 'Platform update', audience: 'Workers and employers', channels: ['App', 'Email'], recipients: 135212, date: '20 Dec 2027', status: 'Scheduled', reached: 0 },
  { id: 'GA-0046', title: 'New offer: RM5 off a GrabCar ride', sub: 'Merchant offer', audience: 'Workers', channels: ['App', 'Push'], recipients: 89730, date: '15 Dec 2027', status: 'Sent', reached: 0.81 },
  { id: 'GA-0045', title: 'Permit renewals: check your expiry date', sub: 'Information only, no action on contributions', audience: 'Employers', channels: ['Email', 'App'], recipients: 4821, date: '12 Dec 2027', status: 'Sent', reached: 0.97 },
  { id: 'GA-0044', title: 'Christmas office hours', sub: 'Festive notice', audience: 'Workers and employers', channels: ['App', 'SMS', 'Email'], recipients: 135212, date: '14 Dec 2027', status: 'Waiting for State approval', reached: 0 },
  { id: 'GA-0039', title: 'JIM counter hours over Christmas', sub: 'Notice from JIM Sabah', origin: 'JIM', audience: 'Workers and employers', channels: ['App', 'SMS'], recipients: 135212, date: '14 Dec 2027', status: 'Sent', reached: 0.9, message: 'JIM offices in Sabah close at 12:00 on Friday 24 December for Christmas and open again on Monday 27 December at 8:00.' },
  { id: 'GA-0043', title: 'Flood warning: Lahad Datu and Sandakan', sub: 'Safety notice from the State', audience: 'Workers', channels: ['App', 'SMS', 'WhatsApp'], recipients: 41400, date: '6 Nov 2027', status: 'Sent', reached: 0.88 },
  { id: 'GA-0042', title: 'Pay 12 months at once', sub: 'Feature announcement', audience: 'Workers and employers', channels: ['App'], recipients: 135212, date: '—', status: 'Draft', reached: 0 },
  { id: 'GA-0041', title: 'Employer portal: new monthly statements', sub: 'Feature announcement', audience: 'Employers', channels: ['Email'], recipients: 4821, date: '2 Nov 2027', status: 'Sent', reached: 0.99 },
]

/* ---------- Reports centre ---------- */
export const reportsCatalog = [
  { id: 'R-01', name: 'Monthly collection and reconciliation', desc: 'Gross collection, 70:30 split, settlement into the FWECF account', period: 'December 2027', formats: ['PDF', 'CSV'], owner: 'State finance' },
  { id: 'R-02', name: 'FWECF account statement', desc: 'Credits from the acquirer, matched to receipts', period: 'December 2027', formats: ['PDF'], owner: 'State finance' },
  { id: 'R-03', name: 'District and sector report', desc: 'Workers, payers and arrears by district and sector', period: 'December 2027', formats: ['PDF', 'XLSX'], owner: 'All State users' },
  { id: 'R-04', name: 'Employer compliance report', desc: 'Employers by share of workers paid, with arrears', period: 'December 2027', formats: ['XLSX', 'CSV'], owner: 'All State users' },
  { id: 'R-05', name: 'Complaints by agency', desc: 'Complaints opened, routed and resolved', period: 'Q4 2027', formats: ['PDF'], owner: 'Agency officers' },
  { id: 'R-06', name: 'Merchant offers and redemptions', desc: 'Offers, confirmed redemptions and outlets', period: 'December 2027', formats: ['XLSX'], owner: 'Microtek' },
  { id: 'R-07', name: 'Audit log extract', desc: 'Every view, export and change with user and time', period: '1 to 17 December 2027', formats: ['CSV'], owner: 'Auditor' },
]

/* ---------- Employer list extras ---------- */
export const employerTotals = { count: 4821, workers: REGISTERED }

