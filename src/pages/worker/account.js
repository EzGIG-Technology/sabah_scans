import { RATE } from '../../data/demo.js'

/* The demo worker's contribution account, counted in months from January 2027.
   Default: paid up to May 2027 with June 2027 due (demoWorker in demo.js).
   ?demo=arrears: paid up to March 2027, owing April to June 2027.
   Paying moves the paid-up month forward. Owing months never touch the permit. */

const BASE_Y = 2027
export const DUE_IDX = 5 // June 2027, the demo month
export const DEFAULT_PAID = 4 // May 2027
export const ARREARS_PAID = 2 // March 2027

const EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const mod = (i) => ((i % 12) + 12) % 12
const year = (i) => BASE_Y + Math.floor(i / 12)
const dateOf = (i) => new Date(Date.UTC(BASE_Y, i, 1))
const fmt = (lang) => new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' })

// "June 2027" in English; the phone's own month names in the other languages.
export function monthName(i, lang = 'en') {
  if (lang !== 'en') { try { return fmt(lang).format(dateOf(i)) } catch { /* fall back to English */ } }
  return EN[mod(i)] + ' ' + year(i)
}

// "April to June 2027", or a localised range such as "April–Jun 2027".
export function period(a, b, lang = 'en') {
  if (a === b) return monthName(a, lang)
  if (lang !== 'en') { try { return fmt(lang).formatRange(dateOf(a), dateOf(b)) } catch { /* fall back */ } }
  return year(a) === year(b) ? `${EN[mod(a)]} to ${monthName(b)}` : `${monthName(a)} to ${monthName(b)}`
}

export function account(paidIdx) {
  const owed = Math.max(0, DUE_IDX - paidIdx)
  return {
    paidIdx,
    owed,
    amount: owed * RATE,
    first: paidIdx + 1, // first month not yet paid
    paidThrough: monthName(paidIdx),
    status: owed === 0 ? 'ok' : owed === 1 ? 'due' : 'over',
  }
}

// Payment frequencies offered in Pay. Labels live in the i18n dictionaries.
export const PLAN_DEFS = [
  { id: 'm', months: 1, key: 'planM' },
  { id: 'q', months: 3, key: 'planQ' },
  { id: 'y', months: 12, key: 'planY' },
]
export const planFor = (id) => PLAN_DEFS.find((p) => p.id === id) || PLAN_DEFS[0]
export const planPrice = (id) => planFor(id).months * RATE
