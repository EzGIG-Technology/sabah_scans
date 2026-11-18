// Shared in-memory store for the two government consoles.
// The audit log, notices and the review queue live here so that an action in one
// console (a Microtek announcement, a worker record view, an export) shows up in the
// other (State approval queue, audit log) during a demo session.
// Replace with the live API: AuditEvent, Notice and Approval in SCANS_HANDOFF.md §6.
import { useSyncExternalStore } from 'react'
import { auditLog, globalAnnouncements, approvals as seedApprovals, offerSubmissions, merchantApplications } from '../../data/demo.js'

const state = {
  audit: auditLog.map((a, i) => ({ id: 'AU-' + (9000 - i), ...a, kind: kindOf(a.action) })),
  notices: globalAnnouncements.map((n) => ({ ...n, origin: n.sub === 'Safety notice from the State' ? 'State' : 'Microtek', message: '' })),
  // Employer sign-ups and record mismatches. Merchant offers, merchant sign-ups and announcements
  // are read from offerSubs, merchantApps and notices so each item has one status everywhere.
  approvals: seedApprovals.filter((a) => a.type === 'Employer sign-up' || a.type === 'Record mismatch').map((a) => ({ ...a, status: 'Waiting' })),
  offerSubs: offerSubmissions.map((o) => ({ ...o })),
  merchantApps: merchantApplications.map((a) => ({ ...a })),
}
let actor = 'Faizal Rahman (Microtek)'
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }

export function useStore(select) {
  return useSyncExternalStore(subscribe, () => select(state))
}
export const getState = () => state

/* The signed-in user for this console. Each console sets it when it mounts. */
export function setActor(name) { actor = name }
export const currentActor = () => actor

function kindOf(action) {
  const a = action.toLowerCase()
  if (a.startsWith('viewed') || a.startsWith('looked up')) return 'View'
  if (a.startsWith('exported') || a.startsWith('downloaded')) return 'Export'
  if (a.includes('sign') && a.includes('in')) return 'Sign-in'
  if (a.startsWith('daily') || a.startsWith('system')) return 'System'
  return 'Change'
}

function stamp() {
  const d = new Date()
  return '17 Jun 2027 ' + [d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join(':')
}

let seq = 9100
/* Write one event to the audit log. Repeated identical events within a second are ignored
   (React StrictMode runs effects twice in development). */
export function logEvent(action, target, who = actor) {
  const top = state.audit[0]
  const now = Date.now()
  if (top && top.action === action && top.target === target && top.who === who && now - (top.t || 0) < 1500) return
  state.audit = [{ id: 'AU-' + seq++, at: stamp(), who, action, target, kind: kindOf(action), t: now }, ...state.audit]
  emit()
}

/* ---------- Notices ---------- */
let noticeSeq = 49
export function addNotice(n) {
  const id = 'GA-' + String(noticeSeq++).padStart(4, '0')
  state.notices = [{ id, reached: 0, ...n }, ...state.notices]
  emit()
  return id
}
export function updateNotice(id, patch) {
  state.notices = state.notices.map((n) => (n.id === id ? { ...n, ...patch } : n))
  emit()
}

/* ---------- Review queue ---------- */
let apSeq = 1183
export function addApproval(a) {
  const id = 'AP-' + apSeq++
  state.approvals = [{ id, age: 'Just now', status: 'Waiting', ...a }, ...state.approvals]
  emit()
  return id
}
export function updateApproval(id, patch) {
  state.approvals = state.approvals.map((a) => (a.id === id ? { ...a, ...patch } : a))
  emit()
}

/* ---------- Merchant offers and sign-ups ---------- */
export function updateOffer(id, patch) {
  state.offerSubs = state.offerSubs.map((o) => (o.id === id ? { ...o, ...patch } : o))
  emit()
}
export function updateApplication(id, patch) {
  state.merchantApps = state.merchantApps.map((a) => (a.id === id ? { ...a, ...patch } : a))
  emit()
}
