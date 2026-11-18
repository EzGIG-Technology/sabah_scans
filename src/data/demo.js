// Demo data for the SCANS prototype.
// Figures marked "proposal" come from the SCANS proposal paper (Kertas Cadangan FWECF & SCANS).
// Everything else is sample data for the prototype and must be replaced with live data.

export const RATE = 100 // RM per worker per month (proposal s.6.1)
export const STATE_SHARE = 0.7 // proposal s.6.4
export const REGISTERED = 130391 // registered foreign workers, 31 Dec 2025 (proposal s.3.1)
export const DEMO_MONTH = 'June 2027'
export const DEMO_MONTH_SHORT = 'Jun 2027'

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
