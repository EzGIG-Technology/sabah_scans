import { LayoutGrid, Users, CreditCard, Repeat, FileText, Settings, UserPlus, BarChart3 } from 'lucide-react'
import { AppShell, Status } from '../../components/ui.jsx'
import { useRoster, summarise } from './data.js'
import './employer.css'

export const user = { name: 'Jennifer Liew', role: 'HR manager' }
export const portal = { name: 'Borneo Palm Plantations', sub: 'Employer · Lahad Datu', mark: 'BP' }

export function EmpShell({ title, children }) {
  const roster = useRoster()
  const s = summarise(roster)
  const nav = [
    { group: 'Monitor', items: [
      { to: '/employer', label: 'Overview', icon: LayoutGrid, end: true },
      { to: '/employer/workers', label: 'Workers', icon: Users, count: s.unpaid || undefined },
      { to: '/employer/reports', label: 'Reports', icon: BarChart3 },
    ] },
    { group: 'Payments', items: [
      { to: '/employer/pay', label: 'Pay for workers', icon: CreditCard },
      { to: '/employer/auto-debit', label: 'Monthly auto-pay', icon: Repeat },
      { to: '/employer/statements', label: 'Statements', icon: FileText },
    ] },
    { group: 'Account', items: [
      { to: '/employer/settings', label: 'Settings', icon: Settings },
      { to: '/employer/register', label: 'New company sign-up', icon: UserPlus },
    ] },
  ]
  const notifications = [
    s.risk ? { title: `${s.risk} workers owe 3 months or more`, time: 'Today, 06:00' } : null,
    { title: 'Batch BAT-2706-00418 settled into the FWECF account', time: '7 Jun 2027' },
    { title: 'Your May 2027 statement is ready', time: '1 Jun 2027' },
  ].filter(Boolean)
  return (
    <AppShell nav={nav} portal={portal} user={user} title={title} kicker="Employer portal" notifications={notifications}
      searchPlaceholder="Search worker name or SCANS ID">
      <div className="emp-root">{children}</div>
    </AppShell>
  )
}

export const WStatus = ({ w }) => <Status tone={w.tone}>{w.status}</Status>

export function Who({ w, sub }) {
  return (
    <div className="who">
      <span className="avatar" aria-hidden="true" style={{ width: 34, height: 34, fontSize: 12 }}>{w.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
      <div style={{ minWidth: 0, textAlign: 'left' }}><b>{w.name}</b><small className="num">{sub || w.id}</small></div>
    </div>
  )
}

export function permitText(w) {
  if (w.permitDays < 0) return 'Ended ' + w.permitExpiry
  if (w.permitDays <= 60) return `${w.permitExpiry} · ${w.permitDays} days`
  return w.permitExpiry
}
