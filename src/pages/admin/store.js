// State that only the Microtek console changes during a demo session: merchant suspensions,
// offer deactivations, admin users, support tickets and reconciliation breaks.
// Shared items (audit log, notices, review queue) stay in ../shared/store.js.
import { useMemo, useSyncExternalStore } from 'react'
import { adminUsers } from '../../data/demo.js'
import { reconciliationBreaks } from '../shared/data.js'
import { tickets } from './data.js'
import { useStore } from '../shared/store.js'

const state = {
  merchantStatus: {}, // id -> { status: 'Suspended' | 'Active', reason }
  offerOff: {}, // `${merchantId}:${offerId}` -> remark
  users: adminUsers.map((u) => ({ ...u })),
  tickets: tickets.map((t) => ({ ...t })),
  breaks: reconciliationBreaks.map((b) => ({ ...b })),
}
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
export function useAdmin(select) { return useSyncExternalStore(subscribe, () => select(state)) }

export function setMerchantStatus(id, status, reason) { state.merchantStatus = { ...state.merchantStatus, [id]: { status, reason } }; emit() }
export function setOfferOff(key, remark) {
  const next = { ...state.offerOff }
  if (remark == null) delete next[key]; else next[key] = remark
  state.offerOff = next; emit()
}
export function setUsers(users) { state.users = users; emit() }
export function updateTicket(id, patch) { state.tickets = state.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)); emit() }
export function updateBreak(id, patch) { state.breaks = state.breaks.map((b) => (b.id === id ? { ...b, ...patch } : b)); emit() }

/* Items waiting on Microtek, from the shared store. */
export function useQueue() {
  const approvals = useStore((s) => s.approvals)
  const offerSubs = useStore((s) => s.offerSubs)
  const apps = useStore((s) => s.merchantApps)
  const notices = useStore((s) => s.notices)
  return useMemo(() => {
    const items = [
      ...approvals.map((a) => ({ ...a, source: 'approval' })),
      ...offerSubs.filter((o) => o.status === 'Pending').map((o) => ({ id: o.id, type: 'Merchant offer', name: o.merchant, detail: `${o.title} · go-live ${o.goLive}`, age: 'Sent ' + o.submitted, status: 'Waiting', source: 'offer' })),
      ...apps.filter((a) => a.status === 'In review' || a.status === 'Needs info').map((a) => ({ id: a.id, type: 'Merchant sign-up', name: a.merchant, detail: `${a.category} · ${a.outlets} outlet${a.outlets > 1 ? 's' : ''} · ${a.status === 'Needs info' ? 'waiting for documents' : 'documents received'}`, age: 'Sent ' + a.submitted, status: 'Waiting', source: 'application' })),
      ...notices.filter((n) => n.status === 'Waiting for State approval').map((n) => ({ id: n.id, type: 'Announcement', name: n.title, detail: `${n.audience} · ${n.recipients ? n.recipients.toLocaleString('en-MY') : '—'} recipients`, age: 'Sent to State', status: 'Waiting for State approval', source: 'notice' })),
    ]
    return { items, waiting: items.filter((i) => i.status === 'Waiting'), stateWaiting: items.filter((i) => i.source === 'notice').length }
  }, [approvals, offerSubs, apps, notices])
}
