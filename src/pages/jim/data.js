// Immigration portal (/jim) data for Jabatan Imigresen Malaysia, Negeri Sabah (JIM Sabah).
// Everything is derived from src/data/demo.js so figures reconcile with the State and Microtek views.
// JIM sees contribution status only. Permit data comes in from JIM read-only and is shown for
// information; nothing JIM confirms here changes a worker's permit or immigration status.
import { useSyncExternalStore } from 'react'
import { REGISTERED, districts, workers, employers, STATUSES } from '../../data/demo.js'

export const BASE = '/jim'
export const ACTOR = 'Mohd Hafiz Rahim (JIM Sabah)'
export const SWIMS_RECORDS = 122228 // proposal s.3.1

/* ---------- Contribution status, as JIM sees it ----------
   The same four statuses as every other portal (STATUSES in demo.js). Information only. */
const CONTRIB_TONE = { Paid: 'ok', 'Due this month': 'info', '1–2 months overdue': 'warn', '3+ months overdue': 'bad' }
export function contrib(w) {
  return { label: w.status, tone: CONTRIB_TONE[w.status] || 'grey' }
}
export const CONTRIB_LEVELS = STATUSES

/* ---------- Matching SCANS records to JIM permit records, by district ----------
   matched + waiting for JIM + not yet in JIM data = registered workers in each district. */
const WAITING = { kudat: 58, kk: 156, sandakan: 214, beaufort: 72, keningau: 108, lahaddatu: 248, tawau: 262, semporna: 66 }
const NOT_FOUND = { kudat: 37, kk: 115, sandakan: 150, beaufort: 48, keningau: 75, lahaddatu: 165, tawau: 170, semporna: 35 }
export const matchByDistrict = districts.map((d) => {
  const waiting = WAITING[d.id] || 0
  const notFound = NOT_FOUND[d.id] || 0
  return { id: d.id, name: d.name, workers: d.workers, waiting, notFound, matched: d.workers - waiting - notFound }
})
export const JIM_WAITING = matchByDistrict.reduce((s, d) => s + d.waiting, 0)
export const JIM_NOT_FOUND = matchByDistrict.reduce((s, d) => s + d.notFound, 0)
export const JIM_MATCHED = REGISTERED - JIM_WAITING - JIM_NOT_FOUND

/* ---------- Permits ending (information only) ----------
   Scaled from the 160-record sample to all registered workers, the same way as the Microtek console. */
const scale = REGISTERED / workers.length
export const permitsWithin = (days) => Math.round(workers.filter((w) => w.permitDays >= 0 && w.permitDays <= days).length * scale)
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const expiryByMonth = Array.from({ length: 12 }, (_, i) => {
  const m = i % 12 // twelve months from January 2028, the month after the demo month
  const y = 2028 + Math.floor(i / 12)
  const key = `${MON[m]} ${y}`
  const n = workers.filter((w) => w.permitExpiry.endsWith(key)).length
  return { label: MON[m], full: key, value: Math.round(n * scale) }
})

/* ---------- JIM offices in Sabah ---------- */
export const OFFICES = [
  { id: 'kk', name: 'Kota Kinabalu', short: 'KK', checks: 64 },
  { id: 'tawau', name: 'Tawau', short: 'Tawau', checks: 52 },
  { id: 'sandakan', name: 'Sandakan', short: 'Sandakan', checks: 41 },
  { id: 'lahaddatu', name: 'Lahad Datu', short: 'Lahad Datu', checks: 38 },
  { id: 'keningau', name: 'Keningau', short: 'Keningau', checks: 19 },
  { id: 'semporna', name: 'Semporna', short: 'Semporna', checks: 15 },
  { id: 'kudat', name: 'Kudat', short: 'Kudat', checks: 11 },
]
export const CHECKS_TODAY = OFFICES.reduce((s, o) => s + o.checks, 0)

/* ---------- Officer accounts linked to JIM staff IDs ---------- */
export const OFFICERS = [
  { name: 'Mohd Hafiz Rahim', jimId: 'JIM-SBH-04412', office: 'Kota Kinabalu', role: 'Immigration officer', twoStep: true, last: 'Today 08:52', status: 'Linked' },
  { name: 'Nur Syafiqah Abdullah', jimId: 'JIM-SBH-03987', office: 'Sandakan', role: 'Immigration officer', twoStep: true, last: 'Today 08:31', status: 'Linked' },
  { name: 'Jeffrey Gimbang', jimId: 'JIM-SBH-05120', office: 'Tawau', role: 'Senior officer', twoStep: true, last: 'Today 08:14', status: 'Linked' },
  { name: 'Siti Aminah Yusof', jimId: 'JIM-SBH-04876', office: 'Lahad Datu', role: 'Immigration officer', twoStep: true, last: 'Today 07:58', status: 'Linked' },
  { name: 'Rosnah Majalin', jimId: 'JIM-SBH-02764', office: 'Keningau', role: 'Immigration officer', twoStep: true, last: 'Yesterday', status: 'Linked' },
  { name: 'Azman Lajim', jimId: 'JIM-SBH-03311', office: 'Kudat', role: 'Immigration officer', twoStep: true, last: '2 days ago', status: 'Linked' },
  { name: 'Hamdan Sapri', jimId: 'JIM-SBH-05402', office: 'Semporna', role: 'Immigration officer', twoStep: true, last: 'Today 08:47', status: 'Linked' },
]

/* ---------- Record mismatches waiting for JIM ----------
   Each one is a field where the SCANS record and the JIM permit record disagree. */
// Typical spelling differences between a passport and an older record.
const variantName = (n, nat) => {
  if (nat === 'Indonesia') return /u/.test(n) ? n.replace('u', 'oe') : n.replace(/i$/, 'y')
  if (nat === 'Philippines') return n.replace(' ', ' R. ') // middle initial on the passport
  if (nat === 'Bangladesh') return 'Md ' + n
  return n.replace(/a/, 'aa')
}
const otherEmployer = (w) => (employers.find((e) => e.name !== w.employer && e.district === w.district) || employers.find((e) => e.name !== w.employer)).name
const newPassport = (w) => w.passport.split(' ')[0] + ' ' + String(((parseInt(w.passport.split(' ')[1], 10) * 7) % 8999999) + 1000000)
const swapDob = (d) => { const [dd, mm, yy] = d.split(' '); return `${Math.min(28, Number(dd) + 1)} ${mm} ${yy}` }
const MISMATCH_KIND = [
  { field: 'Name spelling', key: 'name', jim: (w) => variantName(w.name, w.nationality), source: 'SWIMS' },
  { field: 'Passport number', key: 'passport', jim: newPassport, source: 'SCANS app passport scan', why: 'Passport renewed' },
  { field: 'Employer', key: 'employer', jim: otherEmployer, source: 'eNORES', why: 'Employer changed' },
  { field: 'Date of birth', key: 'dob', jim: (w) => swapDob(w.dob), source: 'SWIMS' },
]
const PICK = [3, 7, 12, 18, 22, 27, 31, 38, 44, 51, 58, 63, 70, 77]
const AGES = [1, 1, 2, 2, 3, 4, 4, 5, 6, 8, 9, 11, 13, 16]
const SEED = PICK.map((wi, i) => {
  const w = workers[wi]
  const k = MISMATCH_KIND[i % MISMATCH_KIND.length]
  const decided = i >= 11
  return {
    id: 'MM-' + (2063 - i), workerId: w.id, name: w.name, district: w.district,
    field: k.field, scans: w[k.key], jim: k.jim(w), source: k.source, why: k.why || null, age: AGES[i],
    status: !decided ? 'Waiting' : i === 11 ? 'Sent to Microtek' : 'Confirmed',
    decision: !decided ? null : i === 11 ? 'JIM value is correct' : 'SCANS value is correct',
    remark: !decided ? '' : i === 11 ? 'Renewed passport seen at the KK counter on 14 Dec.' : 'Checked against the permit file.',
    by: decided ? 'Nur Syafiqah Abdullah (JIM Sabah)' : null, at: decided ? '15 Dec 2027 10:12' : null,
  }
})

/* ---------- JIM data link runs ---------- */
const RUNS = [
  { id: 'SY-1217-06', at: '17 Dec 2027 06:00', kind: 'Scheduled', received: 1412, updated: 386, failed: 0, took: '4 min 12 s', status: 'Completed' },
  { id: 'SY-1216-18', at: '16 Dec 2027 18:00', kind: 'Scheduled', received: 1088, updated: 241, failed: 2, took: '3 min 47 s', status: 'Completed with 2 errors' },
  { id: 'SY-1216-11', at: '16 Dec 2027 11:20', kind: 'Run by an officer', received: 214, updated: 37, failed: 0, took: '52 s', status: 'Completed' },
  { id: 'SY-1216-06', at: '16 Dec 2027 06:00', kind: 'Scheduled', received: 1530, updated: 402, failed: 0, took: '4 min 31 s', status: 'Completed' },
  { id: 'SY-1215-18', at: '15 Dec 2027 18:00', kind: 'Scheduled', received: 976, updated: 198, failed: 0, took: '3 min 05 s', status: 'Completed' },
  { id: 'SY-1215-06', at: '15 Dec 2027 06:00', kind: 'Scheduled', received: 1477, updated: 371, failed: 1, took: '4 min 20 s', status: 'Completed with 1 error' },
]

/* ---------- Small store so decisions and sync runs carry across pages in one session ---------- */
const state = { matches: SEED, runs: RUNS }
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
export function useJim(select) { return useSyncExternalStore(subscribe, () => select(state)) }

export function decideMatch(id, patch) {
  state.matches = state.matches.map((m) => (m.id === id ? { ...m, ...patch } : m))
  emit()
}
let runSeq = 1
export function addRun(run) {
  state.runs = [{ id: 'SY-1217-M' + runSeq++, ...run }, ...state.runs]
  emit()
}

/* "17 Dec 2027 HH:MM" for the current time on the demo date. */
export function stampNow() {
  const d = new Date()
  return '17 Dec 2027 ' + [d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join(':')
}
