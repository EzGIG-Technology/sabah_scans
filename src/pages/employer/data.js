// Employer portal data for Borneo Palm Plantations Sdn Bhd.
// Built on src/data/demo.js. The sample roster holds every worker who has not
// paid for June 2027 (41 of 412) plus the sample of paid workers from demo.js,
// so the counts on every employer screen reconcile with employerSelf (412 / 371).
import { useSyncExternalStore } from 'react'
import { workers, employerSelf, employerBatches, paymentsFor, fpxBanks, RATE } from '../../data/demo.js'

export const COMPANY = {
  ...employerSelf,
  short: 'Borneo Palm Plantations',
  enores: 'SBH-E-018832',
  address: 'Batu 12, Jalan Lahad Datu–Tawau, 91100 Lahad Datu, Sabah',
  registered: '14 Jul 2014',
  type: 'Private limited company',
  directors: 2,
  site: 'Ladang Segama, Lahad Datu',
  appUsers: 363,
}
export const DEMO_TODAY = '17 Jun 2027'
const TODAY = new Date(2027, 5, 17)

/* ---------- Months: index 0 = Jan 2027, 5 = Jun 2027 (the demo month) ---------- */
const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ML = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const CUR = 5
export const monthLabel = (i, long) => {
  const y = 2027 + Math.floor(i / 12)
  const m = ((i % 12) + 12) % 12
  return `${long ? ML[m] : MS[m]} ${y}`
}
export function periodLabel(from, count) {
  const to = from + count - 1
  if (count === 1) return monthLabel(from, true)
  const fy = 2027 + Math.floor(from / 12), ty = 2027 + Math.floor(to / 12)
  const f = MS[((from % 12) + 12) % 12], t = MS[((to % 12) + 12) % 12]
  return fy === ty ? `${f} to ${t} ${ty}` : `${f} ${fy} to ${t} ${ty}`
}
const idxOf = (s) => {
  const [m, y] = s.split(' ')
  return (Number(y) - 2027) * 12 + MS.indexOf(m.slice(0, 3))
}
export function parseDate(s) {
  const [d, m, y] = s.split(' ')
  return new Date(Number(y), MS.indexOf(m.slice(0, 3)), Number(d))
}
export const daysUntil = (s) => Math.round((parseDate(s) - TODAY) / 86400000)

/* ---------- Extra sample records (unpaid workers not in the demo.js sample) ---------- */
const EXTRA = [
  // name, nationality, role, paid up to (month index, -1 = nothing paid yet), consent, uses app, permit valid until
  ['Ramon Castillo', 'Philippines', 'Harvester', 1, true, true, '19 Jul 2027'],
  ['Imran Hossain', 'Bangladesh', 'Mill operator', 1, true, true, '28 Oct 2027'],
  ['Wayan Sudarma', 'Indonesia', 'Harvester', 0, false, false, '6 Feb 2028'],
  ['Maricel Reyes', 'Philippines', 'Weeding', 1, true, true, '9 Aug 2027'],
  ['Rudi Purnomo', 'Indonesia', 'Fruit collector', -1, true, true, '22 Jan 2028'],
  ['Arjun Nair', 'India', 'Mechanic', 1, true, true, '3 May 2028'],
  ['Siti Rahayu', 'Indonesia', 'Nursery', 0, true, true, '11 Nov 2027'],
  ['Jun Torres', 'Philippines', 'Tractor driver', 1, true, true, '27 Mar 2028'],
  ['Budi Hidayat', 'Indonesia', 'Harvester', 3, true, true, '2 Jul 2027'],
  ['Nasir Uddin', 'Bangladesh', 'Mill operator', 3, false, true, '14 Dec 2027'],
  ['Grace Aquino', 'Philippines', 'Weeding', 3, true, true, '30 Apr 2028'],
  ['Joko Saputra', 'Indonesia', 'Harvester', 3, true, true, '18 Sep 2027'],
  ['Ayu Kartika', 'Indonesia', 'Nursery', 3, true, true, '7 Jan 2028'],
  ['Arnel Santos', 'Philippines', 'Fruit collector', 3, false, false, '25 Feb 2028'],
  ['Yusuf Saputra', 'Indonesia', 'Tractor driver', 3, true, true, '12 Jun 2028'],
  ['Thant Zaw', 'Others', 'Harvester', 3, true, true, '4 Oct 2027'],
  ['Rina Kusuma', 'Indonesia', 'Weeding', 3, true, true, '28 Jul 2027'],
  ['Cristina Garcia', 'Philippines', 'Nursery', 3, true, true, '15 Mar 2028'],
  ['Wayan Santoso', 'Indonesia', 'Harvester', 4, true, true, '21 Nov 2027'],
  ['Rodel Mendoza', 'Philippines', 'Fruit collector', 4, true, true, '8 Aug 2028'],
  ['Sohel Ahmed', 'Bangladesh', 'Mill operator', 4, false, false, '19 Jan 2028'],
  ['Nur Fadilah', 'Indonesia', 'Harvester', 4, true, true, '2 Apr 2028'],
  ['Jose Villanueva', 'Philippines', 'Tractor driver', 4, true, true, '13 Sep 2027'],
  ['Dewi Saputra', 'Indonesia', 'Nursery', 4, true, true, '29 Dec 2027'],
  ['Ravi Kumar', 'India', 'Mechanic', 4, true, true, '17 May 2028'],
  ['Siti Aminah', 'Indonesia', 'Weeding', 4, true, true, '6 Oct 2027'],
  ['Mario Ramos', 'Philippines', 'Harvester', 4, false, true, '24 Feb 2028'],
  ['Agus Rahayu', 'Indonesia', 'Fruit collector', 4, true, true, '10 Jul 2028'],
  ['Bishnu Thapa', 'Others', 'Harvester', 4, true, true, '1 Dec 2027'],
  ['Ana Torres', 'Philippines', 'Weeding', 4, true, true, '18 Jan 2028'],
  ['Hasan Pillai', 'India', 'Mill operator', 4, true, true, '5 Nov 2027'],
  ['Maricel Santos', 'Philippines', 'Fruit collector', 4, true, true, '27 Sep 2028'],
  ['Liza Mendoza', 'Philippines', 'Weeding', 4, true, true, '3 Sep 2027'],
]

const base = [
  ...workers.filter((w) => w.employerId === 'emp-bpp').map((w) => ({
    id: w.id, name: w.name, nationality: w.nationality, role: w.role, permitExpiry: w.permitExpiry,
    paidIdx: idxOf(w.paidThrough), consent: w.consent, appActive: w.appActive, src: w,
  })),
  ...EXTRA.map(([name, nationality, role, paidIdx, consent, appActive, permitExpiry], i) => ({
    id: 'SCN26W01' + String(10021 + i * 53).padStart(5, '0'), name, nationality, role, permitExpiry, paidIdx, consent, appActive,
  })),
]

/* Status from the number of unpaid months (June included). */
export function statusOf(paidIdx) {
  const owing = Math.max(0, CUR - paidIdx)
  const earlier = Math.max(0, owing - 1)
  if (owing === 0) return { label: 'Paid', tone: 'ok', owing, earlier, bucket: 'paid' }
  if (earlier === 0) return { label: 'Due', tone: 'info', owing, earlier, bucket: 'due' }
  if (earlier < 3) return { label: earlier === 1 ? '1 month overdue' : '2 months overdue', tone: 'warn', owing, earlier, bucket: 'late' }
  return { label: '3+ months overdue', tone: 'bad', owing, earlier, bucket: 'risk' }
}

/* ---------- Session store: payments, auto-pay, permit and invites made in this visit ---------- */
let state = { paidAdd: {}, batches: [], mandate: null, permit: null, invited: [], seq: 0, exports: [], pic: null }
const subs = new Set()
const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }
export const getEmp = () => state
export function setEmp(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  subs.forEach((f) => f())
}
export const useEmp = () => useSyncExternalStore(subscribe, getEmp)

function enrich(w, paidAdd) {
  const paidIdx = w.paidIdx + (paidAdd[w.id] || 0)
  const st = statusOf(paidIdx)
  const days = daysUntil(w.permitExpiry)
  return {
    ...w, paidIdx, status: st.label, tone: st.tone, bucket: st.bucket, owingMonths: st.owing, earlier: st.earlier,
    owing: st.owing * RATE, paidThrough: paidIdx < 0 ? 'No payment yet' : monthLabel(paidIdx), permitDays: days,
  }
}

export function useRoster() {
  const s = useEmp()
  return base.map((w) => enrich(w, s.paidAdd))
}

/* Company-wide counts. The roster holds every unpaid worker, so paid = 412 minus unpaid. */
export function summarise(roster) {
  const c = { due: 0, late: 0, risk: 0 }
  roster.forEach((w) => { if (w.bucket !== 'paid') c[w.bucket] += 1 })
  const unpaid = c.due + c.late + c.risk
  const paid = COMPANY.workers - unpaid
  const owing = roster.reduce((s, w) => s + w.owing, 0)
  return { total: COMPANY.workers, paid, unpaid, ...c, owing, rate: paid / COMPANY.workers }
}

export const paidPerMonth = (paid) => [
  { label: 'Jan', value: 298 }, { label: 'Feb', value: 322 }, { label: 'Mar', value: 340 },
  { label: 'Apr', value: 351 }, { label: 'May', value: 366 }, { label: 'Jun', value: paid },
]

/* Payment history: this session's batch receipts first, then the record. */
export function historyFor(w, batches) {
  const own = []
  batches.forEach((b) => b.receipts.filter((r) => r.workerId === w.id).forEach((r) => own.push({
    id: r.id, month: r.period, amount: r.amount, method: 'Employer bulk payment · ' + b.method, date: b.date, by: COMPANY.name,
  })))
  if (w.src) return [...own, ...paymentsFor({ ...w.src, paidThrough: w.src.paidThrough })]
  const rows = []
  const methods = ['Touch ’n Go eWallet', 'Cash at 7-Eleven', 'DuitNow QR', 'Employer bulk payment']
  for (let m = w.paidIdx - (state.paidAdd[w.id] || 0); m >= 0 && rows.length < 6; m--) {
    const method = methods[(m + w.name.length) % methods.length]
    rows.push({
      id: `RCP-27${String(m + 1).padStart(2, '0')}-${String(200000 + ((w.name.length * 7919 + m * 104729) % 799999))}`,
      month: monthLabel(m, true), amount: RATE, method, date: `${2 + ((m + w.name.length) % 4)} ${MS[m]} 2027`,
      by: method === 'Employer bulk payment' ? COMPANY.name : w.name,
    })
  }
  return [...own, ...rows]
}

export const allBatches = (s) => [...s.batches.map((b) => ({ ...b, session: true })), ...employerBatches]

const BANK_COLOURS = ['#E0A800', '#C8102E', '#D42253', '#1460E0', '#0B2F7A', '#0E8F57', '#B85407', '#7B4DE3']
export const banks = fpxBanks.map((name, i) => ({ name, color: BANK_COLOURS[i % BANK_COLOURS.length] }))

/* ---------- Reports: month-by-month figures that end at today's live counts ---------- */
/* Jan to May are fixed history; June comes from the live roster so every screen agrees. */
const TREND = [
  // paid, june-style "this month not paid yet", owing 1-2 earlier months, owing 3+ months (sums to 412)
  { label: 'Jan', paid: 298, due: 114, late: 0, risk: 0 },
  { label: 'Feb', paid: 322, due: 58, late: 32, risk: 0 },
  { label: 'Mar', paid: 340, due: 44, late: 28, risk: 0 },
  { label: 'Apr', paid: 351, due: 33, late: 20, risk: 8 },
  { label: 'May', paid: 366, due: 20, late: 14, risk: 12 },
]
export const complianceTrend = (s) => [...TREND, { label: 'Jun', paid: s.paid, due: s.due, late: s.late, risk: s.risk }]

/* Workers using the SCANS app each month (June = COMPANY.appUsers). */
export const appUsersByMonth = [
  { label: 'Jan', value: 240 }, { label: 'Feb', value: 281 }, { label: 'Mar', value: 305 },
  { label: 'Apr', value: 322 }, { label: 'May', value: 347 }, { label: 'Jun', value: 363 },
]
/* Who paid June: the company's June batch (214 workers) plus batches made this visit; the rest paid themselves. */
export function juneSplit(roster, s, st) {
  const fromSession = roster.filter((w) => st.paidAdd[w.id] && w.paidIdx >= CUR).length
  const company = 214 + fromSession
  return { company, self: s.paid - company }
}

export const SEED_EXPORTS = [
  { id: 'EXP-2706-031', name: 'Contribution status report, May 2027', date: '1 Jun 2027', format: 'PDF', size: '412 KB' },
  { id: 'EXP-2705-022', name: 'Payment history report, Jan to Apr 2027', date: '8 May 2027', format: 'CSV', size: '96 KB' },
  { id: 'EXP-2705-019', name: 'App use report, April 2027', date: '3 May 2027', format: 'PDF', size: '188 KB' },
]
export const PIC_DEFAULT = { name: 'Jennifer Liew', role: 'HR manager', email: 'jennifer.liew@bpp.example.my', phone: '012-884 4410' }
