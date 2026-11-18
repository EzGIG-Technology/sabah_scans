// Demo data for the SCANS prototype.
// Figures marked "proposal" come from the SCANS proposal paper (Kertas Cadangan FWECF & SCANS).
// Everything else is sample data for the prototype and must be replaced with live data.

export const RATE = 100 // RM per worker per month (proposal s.6.1)
export const STATE_SHARE = 0.7 // proposal s.6.4
export const REGISTERED = 130391 // registered foreign workers, 31 Dec 2025 (proposal s.3.1)
export const DEMO_MONTH = 'June 2027'
export const DEMO_MONTH_SHORT = 'Jun 2027'
export const DEMO_DATE = 'Thu, 17 Jun 2027'

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

// Districts: sample split of the 130,391 registered workers, with sample payment rates.
// col/row place each district on the tile map in rough geographic order (west to east, north to south).
export const districts = [
  { id: 'kudat', name: 'Kudat', workers: 6200, rate: 0.66, col: 2, row: 0 },
  { id: 'kk', name: 'Kota Kinabalu', workers: 18900, rate: 0.71, col: 1, row: 1 },
  { id: 'sandakan', name: 'Sandakan', workers: 24600, rate: 0.63, col: 4, row: 1 },
  { id: 'beaufort', name: 'Beaufort', workers: 7900, rate: 0.62, col: 0, row: 2 },
  { id: 'keningau', name: 'Keningau', workers: 12300, rate: 0.57, col: 1, row: 2 },
  { id: 'lahaddatu', name: 'Lahad Datu', workers: 26800, rate: 0.54, col: 4, row: 2 },
  { id: 'tawau', name: 'Tawau', workers: 28400, rate: 0.58, col: 3, row: 3 },
  { id: 'semporna', name: 'Semporna', workers: 5291, rate: 0.49, col: 5, row: 3 },
].map((d) => {
  const paid = Math.round(d.workers * d.rate)
  return { ...d, paid, overdue: d.workers - paid, collected: paid * RATE }
})

export const paidThisMonth = districts.reduce((s, d) => s + d.paid, 0)
export const overdueThisMonth = REGISTERED - paidThisMonth
export const overdue1 = Math.round(overdueThisMonth * 0.625)
export const overdue3 = overdueThisMonth - overdue1
export const collectedThisMonth = paidThisMonth * RATE
export const complianceRate = paidThisMonth / REGISTERED

// Monthly gross collection since launch (sample ramp towards the proposal's 60% Year 1 rate)
export const monthly = [
  { m: 'Jan', v: 5214800 },
  { m: 'Feb', v: 6102300 },
  { m: 'Mar', v: 6744900 },
  { m: 'Apr', v: 7188200 },
  { m: 'May', v: 7560400 },
  { m: 'Jun', v: collectedThisMonth },
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
  permitExpiry: '14 Mar 2028',
  phone: '+60 11-2847 3391',
  language: 'Bahasa Indonesia',
  employer: 'Borneo Palm Plantations Sdn Bhd',
  employerId: 'emp-bpp',
  site: 'Ladang Segama, Lahad Datu',
  district: 'Lahad Datu',
  sector: 'Plantation',
  role: 'Harvester',
  paidThrough: 'May 2027',
  due: { month: 'June 2027', amount: 100, dueDate: '5 Jun 2027' },
  arrears: 0,
}

export const workerPayments = [
  { id: 'RCP-2705-118204', month: 'May 2027', amount: 100, method: 'Touch ’n Go eWallet', date: '3 May 2027', by: 'Agus Salim' },
  { id: 'RCP-2704-097731', month: 'April 2027', amount: 100, method: 'Cash at 7-Eleven', date: '4 Apr 2027', by: 'Agus Salim' },
  { id: 'RCP-2701-004415', month: 'January to March 2027', amount: 300, method: 'Employer bulk payment', date: '6 Jan 2027', by: 'Borneo Palm Plantations Sdn Bhd' },
]

export const notices = [
  { id: 'n1', from: 'Kerajaan Negeri Sabah', date: '28 May 2027', title: 'June contribution is due by 5 June', body: 'Pay RM100 by 5 June through the app, at any 7-Eleven, or ask your employer. Paying late does not affect your permit. You will get a reminder.', kind: 'Payment' },
  { id: 'n2', from: 'Jabatan Tenaga Kerja Sabah', date: '19 May 2027', title: 'Your rights on rest days', body: 'Workers are entitled to one rest day each week. If you are asked to work on your rest day you must be paid for it. Use Help to report a problem.', kind: 'Rights' },
  { id: 'n3', from: 'Kerajaan Negeri Sabah', date: '6 May 2027', title: 'Flood warning: Lahad Datu and Kinabatangan', body: 'Heavy rain is expected until Friday. Stay away from rivers. Follow your supervisor and the Civil Defence (APM) instructions.', kind: 'Safety' },
  { id: 'n4', from: 'Kerajaan Negeri Sabah', date: '3 May 2027', title: 'Payment received for May', body: 'We received RM100 for May 2027. Receipt RCP-2705-118204.', kind: 'Receipt' },
]

export const offers = [
  { id: 'o1', merchant: '7-Eleven Sabah', title: 'RM3 off a RM30 prepaid reload', terms: 'One use a month. Any 7-Eleven in Sabah.', ends: '30 Jun 2027', redemptions: 4120, status: 'Live' },
  { id: 'o2', merchant: 'CelcomDigi', title: '10GB extra data on the RM35 plan', terms: 'New and existing prepaid lines.', ends: '31 Jul 2027', redemptions: 2287, status: 'Live' },
  { id: 'o3', merchant: 'Pasaraya Servay', title: '5% off rice and cooking oil', terms: 'Tawau, Sandakan and Lahad Datu branches.', ends: '15 Jul 2027', redemptions: 1904, status: 'Live' },
  { id: 'o4', merchant: 'Klinik Mesra Borneo', title: 'RM20 general consultation', terms: 'Show your SCANS card. Weekdays only.', ends: '31 Aug 2027', redemptions: 611, status: 'Live' },
  { id: 'o5', merchant: '7-Eleven Sabah', title: 'Free 600ml water with any meal set', terms: 'Selected outlets in Kota Kinabalu.', ends: '20 Jul 2027', redemptions: 0, status: 'Waiting for approval' },
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
const statuses = ['Paid', 'Paid', 'Due', 'Paid', '1 month overdue', 'Paid', 'Paid', '3+ months overdue', 'Paid', 'Due', 'Paid', 'Paid']
const expiry = ['14 Mar 2028', '2 Aug 2027', '30 Jul 2027', '11 Jan 2028', '19 Jun 2027', '5 Feb 2028', '28 Oct 2027', '9 Jul 2027', '17 Dec 2027', '3 Sep 2027', '22 Apr 2028', '1 Nov 2027']
export const employerWorkers = first.map((f, i) => ({
  id: i === 0 ? 'SCN26W0047218' : 'SCN26W00' + (47219 + i * 37),
  name: `${f} ${last[i]}`,
  nationality: nat[i],
  role: roles[i],
  status: statuses[i],
  permitExpiry: expiry[i],
  arrears: statuses[i] === '1 month overdue' ? 100 : statuses[i] === '3+ months overdue' ? 300 : 0,
  appActive: i % 5 !== 3,
}))

export const complaints = [
  { id: 'CMP-2706-0091', topic: 'Wages paid late', district: 'Sandakan', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '2 Jun 2027', status: 'With agency' },
  { id: 'CMP-2706-0088', topic: 'Payment taken twice', district: 'Tawau', lang: 'Filipino', agency: 'SCANS support', opened: '1 Jun 2027', status: 'Resolved' },
  { id: 'CMP-2705-0412', topic: 'Passport kept by employer', district: 'Lahad Datu', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '28 May 2027', status: 'With agency' },
  { id: 'CMP-2705-0397', topic: 'Cannot log in to the app', district: 'Kota Kinabalu', lang: 'English', agency: 'SCANS support', opened: '27 May 2027', status: 'Resolved' },
  { id: 'CMP-2705-0380', topic: 'Housing conditions', district: 'Keningau', lang: 'Bahasa Indonesia', agency: 'JTK Sabah', opened: '26 May 2027', status: 'New' },
]

export const announcements = [
  { id: 'a1', title: 'June contribution is due by 5 June', audience: 'All workers', langs: 6, sent: '28 May 2027', reached: 0.92, status: 'Sent' },
  { id: 'a2', title: 'Flood warning: Lahad Datu and Kinabatangan', audience: 'Lahad Datu, Sandakan', langs: 6, sent: '6 May 2027', reached: 0.88, status: 'Sent' },
  { id: 'a3', title: 'Hari Raya Aidiladha office hours', audience: 'All workers and employers', langs: 6, sent: '—', reached: 0, status: 'Waiting for State approval' },
]

export const approvals = [
  { id: 'AP-1182', type: 'Employer sign-up', name: 'Lahad Datu Oil Palm Mill Sdn Bhd', detail: 'SSM 202001017721 · 286 workers in eNORES', age: '2 days' },
  { id: 'AP-1181', type: 'Merchant offer', name: '7-Eleven Sabah', detail: 'Free 600ml water with any meal set', age: '3 days' },
  { id: 'AP-1179', type: 'Record mismatch', name: 'Rina Wulandari', detail: 'Name in SWIMS differs from passport scan', age: '4 days' },
  { id: 'AP-1176', type: 'Announcement', name: 'Hari Raya Aidiladha office hours', detail: 'Needs State approval before sending', age: '5 days' },
  { id: 'AP-1170', type: 'Merchant sign-up', name: 'Kedai Runcit Ah Seng', detail: 'Tawau · 2 outlets', age: '6 days' },
]

export const auditLog = [
  { at: '17 Jun 2027 09:42', who: 'Nurul Ain (State, JKN)', action: 'Exported monthly collection report', target: 'May 2027' },
  { at: '17 Jun 2027 09:15', who: 'Faizal Rahman (Microtek)', action: 'Viewed worker record', target: 'SCN26W0047218' },
  { at: '16 Jun 2027 17:03', who: 'System', action: 'Daily reconciliation completed, 0 breaks', target: '16 Jun 2027' },
  { at: '16 Jun 2027 14:22', who: 'Lim Wei Ling (Microtek)', action: 'Approved merchant offer', target: 'Pasaraya Servay · 5% off rice' },
  { at: '16 Jun 2027 11:08', who: 'Faizal Rahman (Microtek)', action: 'Corrected worker name after SWIMS check', target: 'SCN26W0051882' },
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
export const collectionWeek = 2318600
export const collectionMonth = collectedThisMonth

// Paid / 1 month owing / 3+ months owing across all registered workers
export const paymentMetrics = [
  { label: 'Paid', value: paidThisMonth, color: 'var(--okFill)' },
  { label: '1 month overdue', value: overdue1, color: 'var(--warnFill)' },
  { label: '3+ months overdue', value: overdue3, color: 'var(--badFill)' },
]

// Daily collection for the demo month (1 to 17 June)
export const dailyCollection = [612400, 958300, 1104200, 1322800, 1486100, 248600, 189400, 233900, 201700, 188300, 176200, 214800, 96400, 88100, 251300, 302700, 412300]
  .map((v, i) => ({ label: String(i + 1), value: v }))

// Monthly collection split into State and operator share
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

function makeWorkers() {
  const r = rng(20270617)
  const out = []
  for (let i = 0; i < 160; i++) {
    const roll = r()
    let acc = 0, nat = 'Indonesia'
    for (const [n, s] of NAT_SHARE) { acc += s; if (roll <= acc) { nat = n; break } }
    const emp = i < 12 ? employers[0] : pick(r, employers)
    const st = r()
    const status = st < 0.6 ? 'Paid' : st < 0.72 ? 'Due' : st < 0.88 ? '1 month overdue' : '3+ months overdue'
    const arrears = status === '1 month overdue' ? 100 : status === '3+ months overdue' ? 300 + Math.floor(r() * 4) * 100 : 0
    const yr = 2027 + Math.floor(r() * 2)
    const mo = Math.floor(r() * 12)
    const name = `${pick(r, FIRST[nat])} ${pick(r, LAST[nat])}`
    out.push({
      id: 'SCN26W00' + String(47218 + i * 37).padStart(5, '0'),
      name,
      gender: r() < 0.82 ? 'Male' : 'Female',
      dob: `${1 + Math.floor(r() * 27)} ${pick(r, MONTHS)} ${1975 + Math.floor(r() * 26)}`,
      nationality: nat,
      passport: `${PASSPORT_PREFIX[nat]} ${String(Math.floor(1000000 + r() * 8999999))}`,
      plks: `PLKS-SBH-2026-0${String(Math.floor(100000 + r() * 899999))}`,
      permitExpiry: `${1 + Math.floor(r() * 27)} ${MONTHS[mo]} ${yr}`,
      permitDays: Math.round(((yr - 2027) * 12 + mo - 5) * 30.4 + r() * 20),
      employer: emp.name,
      employerId: emp.id,
      district: emp.district,
      sector: emp.sector,
      role: pick(r, SITE_ROLE[emp.sector] || ['General worker']),
      status,
      arrears,
      paidThrough: status === 'Paid' ? 'Jun 2027' : status === 'Due' ? 'May 2027' : status === '1 month overdue' ? 'Apr 2027' : 'Feb 2027',
      appActive: r() > 0.12,
      consent: r() > 0.15,
      language: nat === 'Indonesia' ? 'Bahasa Indonesia' : nat === 'Philippines' ? 'Filipino' : nat === 'Bangladesh' ? 'Bengali' : nat === 'Others' ? 'Nepali' : 'English',
      phone: `+60 1${Math.floor(r() * 9)}-${String(Math.floor(1000 + r() * 8999))} ${String(Math.floor(1000 + r() * 8999))}`,
      arrived: `${1 + Math.floor(r() * 27)} ${pick(r, MONTHS)} ${2018 + Math.floor(r() * 8)}`,
    })
  }
  // The demo worker is always first and always the same.
  out[0] = {
    ...out[0], id: demoWorker.scansId, name: demoWorker.name, gender: 'Male', dob: '12 Aug 1991', nationality: 'Indonesia',
    passport: demoWorker.passport, plks: demoWorker.plks, permitExpiry: demoWorker.permitExpiry, permitDays: 636,
    employer: demoWorker.employer, employerId: demoWorker.employerId, district: demoWorker.district, sector: 'Plantation',
    role: demoWorker.role, status: 'Due', arrears: 0, paidThrough: 'May 2027', appActive: true, consent: true,
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
  const startIdx = { 'Jun 2027': 5, 'May 2027': 4, 'Apr 2027': 3, 'Feb 2027': 1 }[w.paidThrough] ?? 4
  const rows = []
  for (let m = startIdx; m >= 0 && rows.length < 6; m--) {
    const method = pick(r, methods)
    rows.push({
      id: `RCP-27${String(m + 1).padStart(2, '0')}-${String(Math.floor(100000 + r() * 899999))}`,
      month: `${['January', 'February', 'March', 'April', 'May', 'June'][m]} 2027`, amount: 100, method,
      date: `${1 + Math.floor(r() * 5)} ${MONTHS[m]} 2027`, by: method === 'Employer bulk payment' ? w.employer : w.name,
    })
  }
  return rows
}

/* ---------- Live transactions feed ---------- */
const FEED_METHODS = ['Touch ’n Go eWallet', 'DuitNow QR', 'Cash at 7-Eleven', 'FPX online banking', 'Boost', 'GrabPay', 'Employer bulk payment']
export function makeTxn(n) {
  const r = rng(9000 + n * 13)
  const w = workers[Math.floor(r() * workers.length)]
  const months = r() < 0.8 ? 1 : 3
  return {
    id: `TXN${String(74442815 + n * 7919).slice(-8)}`,
    worker: w.name, scansId: w.id, nationality: w.nationality, employer: w.employer, district: w.district,
    method: pick(r, FEED_METHODS), amount: months * RATE, period: months === 1 ? 'June 2027' : 'June to August 2027',
    cleared: w.status !== 'Paid' && r() < 0.4,
    at: n === 0 ? 'now' : `${n * 4}s ago`,
  }
}
export const recentTxns = Array.from({ length: 8 }, (_, i) => ({ ...makeTxn(1000 - i), at: `${(i + 1) * 3} min ago` }))

/* ---------- Merchants ---------- */
export const merchants = [
  { id: 'mer-711', name: '7-Eleven Sabah', company: '7-Eleven Malaysia Sdn Bhd', ssm: '198401015607', category: 'Convenience store', outlets: 46, offers: 3, redemptions: 15234, joined: '12 Jan 2027', status: 'Active', color: '#0E8F57', contact: 'Tan Mei Ling', email: 'partners@7eleven.example.my' },
  { id: 'mer-cd', name: 'CelcomDigi', company: 'CelcomDigi Berhad', ssm: '199701009694', category: 'Telco', outlets: 18, offers: 2, redemptions: 6420, joined: '20 Jan 2027', status: 'Active', color: '#1460E0', contact: 'Hafiz Osman', email: 'b2b@celcomdigi.example.my' },
  { id: 'mer-grab', name: 'Grab', company: 'MyTeksi Sdn Bhd', ssm: '201201007917', category: 'Transport and food', outlets: 1, offers: 1, redemptions: 3102, joined: '3 Feb 2027', status: 'Active', color: '#17B26A', contact: 'Priya Nair', email: 'partners@grab.example.my' },
  { id: 'mer-servay', name: 'Pasaraya Servay', company: 'Servay Hypermarket Sdn Bhd', ssm: '198701004422', category: 'Supermarket', outlets: 12, offers: 1, redemptions: 1904, joined: '15 Feb 2027', status: 'Active', color: '#D42253', contact: 'Jessica Wong', email: 'marketing@servay.example.my' },
  { id: 'mer-kmb', name: 'Klinik Mesra Borneo', company: 'Klinik Mesra Borneo Sdn Bhd', ssm: '201501022881', category: 'Clinic', outlets: 7, offers: 1, redemptions: 611, joined: '2 Mar 2027', status: 'Active', color: '#7B4DE3', contact: 'Dr Lim Kok Wai', email: 'admin@kmb.example.my' },
  { id: 'mer-ws', name: 'Watsons Sabah', company: 'Watsons Personal Care Stores Sdn Bhd', ssm: '199401012345', category: 'Pharmacy', outlets: 9, offers: 1, redemptions: 880, joined: '18 Mar 2027', status: 'Active', color: '#14B8A6', contact: 'Nadia Karim', email: 'partners@watsons.example.my' },
  { id: 'mer-99', name: '99 Speedmart', company: '99 Speed Mart Sdn Bhd', ssm: '200101006655', category: 'Convenience store', outlets: 38, offers: 0, redemptions: 0, joined: '—', status: 'Pending', color: '#B85407', contact: 'Lee Chong Wei', email: 'bd@99speedmart.example.my' },
  { id: 'mer-ahseng', name: 'Kedai Runcit Ah Seng', company: 'Kedai Runcit Ah Seng', ssm: '202203011122', category: 'Grocery', outlets: 2, offers: 0, redemptions: 0, joined: '—', status: 'Pending', color: '#0B2F7A', contact: 'Ah Seng', email: 'ahseng.tawau@example.my' },
]

// Merchant sign-up applications waiting on Microtek
export const merchantApplications = [
  { id: 'MA-2706-014', merchant: '99 Speedmart', category: 'Convenience store', outlets: 38, submitted: '14 Jun 2027', docs: 4, status: 'In review' },
  { id: 'MA-2706-011', merchant: 'Kedai Runcit Ah Seng', category: 'Grocery', outlets: 2, submitted: '11 Jun 2027', docs: 3, status: 'Needs info' },
  { id: 'MA-2705-087', merchant: 'Watsons Sabah', category: 'Pharmacy', outlets: 9, submitted: '2 Mar 2027', docs: 4, status: 'Approved' },
  { id: 'MA-2705-061', merchant: 'Mega Phone Tawau', category: 'Phone shop', outlets: 1, submitted: '28 Feb 2027', docs: 2, status: 'Rejected' },
]

// Offer submissions from merchants (Microtek approves before they go live)
export const offerSubmissions = [
  { id: 'OS-2706-021', merchant: '7-Eleven Sabah', title: 'Free 600ml water with any meal set', submitted: '14 Jun 2027', goLive: '1 Jul 2027', status: 'Pending', discount: 'Free item', limit: 'One a month', audience: 'All compliant workers' },
  { id: 'OS-2706-019', merchant: 'CelcomDigi', title: '10% off Celcom prepaid reload', submitted: '12 Jun 2027', goLive: '20 Jun 2027', status: 'Pending', discount: '10%', limit: 'One a month', audience: 'All compliant workers' },
  { id: 'OS-2706-016', merchant: 'Grab', title: 'RM5 off a GrabCar ride', submitted: '10 Jun 2027', goLive: '15 Jun 2027', status: 'Approved', discount: 'RM5', limit: 'Two a month', audience: 'Kota Kinabalu, Sandakan, Tawau' },
  { id: 'OS-2705-044', merchant: 'Watsons Sabah', title: 'RM3 off first-aid kits', submitted: '28 May 2027', goLive: '1 Jun 2027', status: 'Approved', discount: 'RM3', limit: 'One a month', audience: 'All compliant workers' },
  { id: 'OS-2705-031', merchant: 'Pasaraya Servay', title: 'Double points on rice', submitted: '20 May 2027', goLive: '—', status: 'Rejected', discount: 'Points', limit: '—', audience: 'All workers', reason: 'Loyalty points need a separate data agreement.' },
]

/* ---------- Merchant portal: 7-Eleven Sabah ---------- */
export const merchantSelf = merchants[0]
export const merchantOffers = [
  { id: 'o1', title: 'RM3 off a RM30 prepaid reload', discount: 'RM3', category: 'Top-up', starts: '1 Feb 2027', ends: '30 Jun 2027', limit: 'One a month', redemptions: 4120, views: 18240, status: 'Live', outlets: 'All outlets' },
  { id: 'o6', title: '20% off mobile top-up above RM50', discount: '20%', category: 'Top-up', starts: '1 Mar 2027', ends: '31 Aug 2027', limit: 'One a month', redemptions: 492, views: 4410, status: 'Live', outlets: 'All outlets' },
  { id: 'o7', title: 'RM5 off groceries above RM40', discount: 'RM5', category: 'Groceries', starts: '1 Apr 2027', ends: '31 Jul 2027', limit: 'Two a month', redemptions: 3870, views: 12950, status: 'Live', outlets: 'Tawau, Lahad Datu, Sandakan' },
  { id: 'o8', title: 'Free delivery on orders above RM25', discount: 'Free delivery', category: 'Delivery', starts: '15 Apr 2027', ends: '15 Jul 2027', limit: 'One a week', redemptions: 2310, views: 9080, status: 'Live', outlets: 'Kota Kinabalu' },
  { id: 'o5', title: 'Free 600ml water with any meal set', discount: 'Free item', category: 'Food', starts: '1 Jul 2027', ends: '20 Aug 2027', limit: 'One a month', redemptions: 0, views: 0, status: 'Waiting for approval', outlets: 'Kota Kinabalu' },
  { id: 'o9', title: 'RM2 off phone cases', discount: 'RM2', category: 'Accessories', starts: '1 Jan 2027', ends: '31 Mar 2027', limit: 'One a month', redemptions: 1210, views: 6620, status: 'Expired', outlets: 'All outlets' },
  { id: 'o10', title: 'Hari Raya bundle', discount: 'RM8', category: 'Groceries', starts: '—', ends: '—', limit: '—', redemptions: 0, views: 0, status: 'Draft', outlets: '—' },
]
export const merchantRedemptionsMonthly = [
  { label: 'Jan', value: 1240 }, { label: 'Feb', value: 1810 }, { label: 'Mar', value: 2430 }, { label: 'Apr', value: 2960 }, { label: 'May', value: 3350 }, { label: 'Jun', value: 3404 },
]
export const merchantPeakHours = [
  ['6am', 120], ['7am', 210], ['8am', 260], ['9am', 190], ['10am', 160], ['11am', 170], ['12pm', 310], ['1pm', 290], ['2pm', 180],
  ['3pm', 150], ['4pm', 170], ['5pm', 240], ['6pm', 420], ['7pm', 610], ['8pm', 650], ['9pm', 540], ['10pm', 300], ['11pm', 140],
].map(([label, value]) => ({ label, value }))
export const merchantRedeemers = [
  { label: 'Indonesia', value: 0.58 }, { label: 'Philippines', value: 0.31 }, { label: 'Bangladesh', value: 0.05 }, { label: 'India', value: 0.04 }, { label: 'Others', value: 0.02 },
]
export const recentRedemptions = [
  { id: 'RDM-881204', worker: 'SCN26W•••7218', offer: 'RM3 off a RM30 prepaid reload', outlet: '7-Eleven Fajar Centre', at: '17 Jun 2027 19:42', status: 'Confirmed' },
  { id: 'RDM-881197', worker: 'SCN26W•••3092', offer: 'RM5 off groceries above RM40', outlet: '7-Eleven Jalan Dunlop', at: '17 Jun 2027 19:31', status: 'Confirmed' },
  { id: 'RDM-881190', worker: 'SCN26W•••5511', offer: 'Free delivery on orders above RM25', outlet: '7-Eleven Gaya Street', at: '17 Jun 2027 19:08', status: 'Confirmed' },
  { id: 'RDM-881183', worker: 'SCN26W•••0408', offer: '20% off mobile top-up above RM50', outlet: '7-Eleven Jalan Tiga', at: '17 Jun 2027 18:55', status: 'Pending' },
  { id: 'RDM-881176', worker: 'SCN26W•••8821', offer: 'RM3 off a RM30 prepaid reload', outlet: '7-Eleven Bandar Sri Indah', at: '17 Jun 2027 18:40', status: 'Confirmed' },
]

/* ---------- Employer portal: Borneo Palm Plantations ---------- */
export const employerSelf = employers[0]
export const employerUsers = [
  { name: 'Jennifer Liew', email: 'jennifer.liew@bpp.example.my', role: 'Admin', twoFA: true, last: 'Today 08:12', status: 'Active' },
  { name: 'Ahmad Faiz', email: 'ahmad.faiz@bpp.example.my', role: 'Payments', twoFA: true, last: 'Yesterday', status: 'Active' },
  { name: 'Grace Lim', email: 'grace.lim@bpp.example.my', role: 'Viewer', twoFA: false, last: '—', status: 'Invited' },
]
export const employerBatches = [
  { id: 'BAT-2706-00418', date: '6 Jun 2027', workers: 214, months: 1, amount: 21400, method: 'FPX · Maybank2u', status: 'Settled' },
  { id: 'BAT-2705-00377', date: '5 May 2027', workers: 198, months: 1, amount: 19800, method: 'FPX · Maybank2u', status: 'Settled' },
  { id: 'BAT-2704-00302', date: '4 Apr 2027', workers: 120, months: 3, amount: 36000, method: 'FPX · CIMB Clicks', status: 'Settled' },
  { id: 'BAT-2701-00041', date: '6 Jan 2027', workers: 160, months: 3, amount: 48000, method: 'FPX · Maybank2u', status: 'Settled' },
]
export const perksRedemptionsByMonth = [
  { label: 'Jan', value: 210 }, { label: 'Feb', value: 280 }, { label: 'Mar', value: 352 }, { label: 'Apr', value: 344 }, { label: 'May', value: 418 }, { label: 'Jun', value: 436 },
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
  { id: 'GA-0048', title: 'June 2027 contribution is due by 5 June', sub: 'System-generated reminder', audience: 'Workers', channels: ['App', 'SMS', 'WhatsApp'], recipients: 130391, date: '28 May 2027', status: 'Sent', reached: 0.92 },
  { id: 'GA-0047', title: 'Scheduled maintenance, 20 June 01:00 to 03:00', sub: 'Platform update', audience: 'All', channels: ['App', 'Email'], recipients: 135212, date: '20 Jun 2027', status: 'Scheduled', reached: 0 },
  { id: 'GA-0046', title: 'New offer: RM5 off a GrabCar ride', sub: 'Merchant offer', audience: 'Workers', channels: ['App', 'Push'], recipients: 89730, date: '15 Jun 2027', status: 'Sent', reached: 0.81 },
  { id: 'GA-0045', title: 'Permit renewals: check your expiry date', sub: 'Information only, no action on contributions', audience: 'Employers', channels: ['Email', 'App'], recipients: 4821, date: '12 Jun 2027', status: 'Sent', reached: 0.97 },
  { id: 'GA-0044', title: 'Hari Raya Aidiladha office hours', sub: 'Festive notice', audience: 'All', channels: ['App', 'SMS', 'Email'], recipients: 135212, date: '14 Jun 2027', status: 'Waiting for State approval', reached: 0 },
  { id: 'GA-0043', title: 'Flood warning: Lahad Datu and Kinabatangan', sub: 'Safety notice from the State', audience: 'Workers', channels: ['App', 'SMS', 'WhatsApp'], recipients: 41400, date: '6 May 2027', status: 'Sent', reached: 0.88 },
  { id: 'GA-0042', title: 'Pay 12 months at once', sub: 'Feature announcement', audience: 'All', channels: ['App'], recipients: 135212, date: '—', status: 'Draft', reached: 0 },
  { id: 'GA-0041', title: 'Employer portal: new monthly statements', sub: 'Feature announcement', audience: 'Employers', channels: ['Email'], recipients: 4821, date: '2 May 2027', status: 'Sent', reached: 0.99 },
]

/* ---------- Reports centre ---------- */
export const reportsCatalog = [
  { id: 'R-01', name: 'Monthly collection and reconciliation', desc: 'Gross collection, 70:30 split, settlement into the FWECF account', period: 'June 2027', formats: ['PDF', 'CSV'], owner: 'State finance' },
  { id: 'R-02', name: 'FWECF account statement', desc: 'Credits from the acquirer, matched to receipts', period: 'June 2027', formats: ['PDF'], owner: 'State finance' },
  { id: 'R-03', name: 'District and sector report', desc: 'Workers, payers and arrears by district and sector', period: 'June 2027', formats: ['PDF', 'XLSX'], owner: 'All State users' },
  { id: 'R-04', name: 'Employer compliance report', desc: 'Employers by share of workers paid, with arrears', period: 'June 2027', formats: ['XLSX', 'CSV'], owner: 'All State users' },
  { id: 'R-05', name: 'Complaints by agency', desc: 'Complaints opened, routed and resolved', period: 'Q2 2027', formats: ['PDF'], owner: 'Agency officers' },
  { id: 'R-06', name: 'Merchant offers and redemptions', desc: 'Offers, confirmed redemptions and outlets', period: 'June 2027', formats: ['XLSX'], owner: 'Microtek' },
  { id: 'R-07', name: 'Audit log extract', desc: 'Every view, export and change with user and time', period: '1 to 17 June 2027', formats: ['CSV'], owner: 'Auditor' },
]

/* ---------- Employer list extras ---------- */
export const employerTotals = { count: 4821, workers: REGISTERED }

