// Microtek operator / superadmin console (/admin/*).
// Microtek runs SCANS for the State. It cannot approve State notices, has no permit
// functions, and every view, export and change it makes is written to the audit log.
import { Routes, Route, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, Store, ClipboardCheck, Megaphone, FileBarChart, UserCog, ScrollText, Server, Headset, Landmark,
} from 'lucide-react'
import { AppShell, Card, Empty } from '../../components/ui.jsx'
import { WorkerList, WorkerProfile } from '../shared/Workers.jsx'
import { EmployerList, EmployerProfile } from '../shared/Employers.jsx'
import { ReportsCentre } from '../shared/Reports.jsx'
import { setActor, useStore } from '../shared/store.js'
import '../shared/shared.css'
import './admin.css'
import { BASE, ACTOR } from './data.js'
import { useQueue, useAdmin } from './store.js'
import CommandCentre from './CommandCentre.jsx'
import Approvals from './Approvals.jsx'
import { Merchants, ApplicationPage, OfferPage } from './Merchants.jsx'
import MerchantDetail from './MerchantDetail.jsx'
import Announcements from './Announcements.jsx'
import AdminUsers from './Users.jsx'
import AuditLog from './AuditLog.jsx'
import Systems from './System.jsx'
import Settlement from './Settlement.jsx'
import Support from './Support.jsx'

const TITLES = [
  [/^\/admin\/?$/, 'Command centre'], [/^\/admin\/workers\/.+/, 'Worker profile'], [/^\/admin\/workers/, 'Workers'],
  [/^\/admin\/employers\/.+/, 'Employer profile'], [/^\/admin\/employers/, 'Employers'], [/^\/admin\/merchants\/applications/, 'Merchant application'],
  [/^\/admin\/merchants\/offers/, 'Offer submission'], [/^\/admin\/merchants\/.+/, 'Merchant'],
  [/^\/admin\/merchants/, 'Merchants'], [/^\/admin\/approvals/, 'Approvals'], [/^\/admin\/support/, 'Support queue'], [/^\/admin\/announcements/, 'Global announcements'],
  [/^\/admin\/settlement/, 'Settlement'], [/^\/admin\/reports/, 'Reports centre'], [/^\/admin\/users/, 'Admin management'], [/^\/admin\/audit/, 'Audit log'],
  [/^\/admin\/system/, 'System health'],
]

export default function AdminApp() {
  setActor(ACTOR)
  const loc = useLocation()
  const q = useQueue()
  const offerSubs = useStore((s) => s.offerSubs)
  const apps = useStore((s) => s.merchantApps)
  const tickets = useAdmin((s) => s.tickets)
  const breaks = useAdmin((s) => s.breaks)
  const openTickets = tickets.filter((t) => t.status !== 'Resolved').length
  const lateTickets = tickets.filter((t) => t.status !== 'Resolved' && t.age > t.target).length
  const openBreaks = breaks.filter((b) => b.status === 'Open').length
  const merchantCount = offerSubs.filter((o) => o.status === 'Pending').length + apps.filter((a) => a.status === 'In review' || a.status === 'Needs info').length
  const title = (TITLES.find(([re]) => re.test(loc.pathname)) || [, 'Operations'])[1]
  const nav = [
    { group: 'Monitor', items: [
      { to: BASE, label: 'Command centre', icon: LayoutDashboard, end: true },
      { to: BASE + '/approvals', label: 'Approvals', icon: ClipboardCheck, count: q.waiting.length || null },
      { to: BASE + '/support', label: 'Support queue', icon: Headset, count: openTickets || null },
    ] },
    { group: 'Records', items: [
      { to: BASE + '/workers', label: 'Workers', icon: Users },
      { to: BASE + '/employers', label: 'Employers', icon: Building2 },
      { to: BASE + '/merchants', label: 'Merchants', icon: Store, count: merchantCount || null },
    ] },
    { group: 'Money and messages', items: [
      { to: BASE + '/settlement', label: 'Settlement', icon: Landmark, count: openBreaks || null },
      { to: BASE + '/announcements', label: 'Global announcements', icon: Megaphone },
    ] },
    { group: 'Back office', items: [
      { to: BASE + '/reports', label: 'Reports centre', icon: FileBarChart },
      { to: BASE + '/users', label: 'Admin management', icon: UserCog },
      { to: BASE + '/audit', label: 'Audit log', icon: ScrollText },
      { to: BASE + '/system', label: 'System health', icon: Server },
    ] },
  ]
  const notifications = [
    { title: `${q.waiting.length} items waiting for review`, time: 'Approvals queue' },
    ...(lateTickets ? [{ title: `${lateTickets} support request${lateTickets > 1 ? 's' : ''} past the response target`, time: 'Support queue' }] : []),
    ...(openBreaks ? [{ title: `${openBreaks} reconciliation break${openBreaks > 1 ? 's' : ''} open`, time: 'Settlement' }] : []),
    { title: 'WhatsApp delivery slower than usual', time: 'System health · 14 min ago' },
    { title: `${q.stateWaiting} announcement${q.stateWaiting === 1 ? '' : 's'} waiting for State approval`, time: 'Global announcements' },
  ]
  return (
    <AppShell nav={nav} portal={{ name: 'Microtek operations', sub: 'SCANS operator console', mark: 'MT' }} user={{ name: 'Faizal Rahman', role: 'Superadmin' }}
      title={title} kicker="Platform operator" notifications={notifications} searchPlaceholder="Search SCANS ID, name or passport">
      <Routes>
        <Route index element={<CommandCentre />} />
        <Route path="workers" element={<WorkerList base={BASE} />} />
        <Route path="workers/:id" element={<WorkerProfile base={BASE} />} />
        <Route path="employers" element={<EmployerList base={BASE} canRegister />} />
        <Route path="employers/:id" element={<EmployerProfile base={BASE} />} />
        <Route path="merchants" element={<Merchants />} />
        <Route path="merchants/applications/:id" element={<ApplicationPage />} />
        <Route path="merchants/offers/:id" element={<OfferPage />} />
        <Route path="merchants/:id" element={<MerchantDetail />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="support" element={<Support />} />
        <Route path="settlement" element={<Settlement />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="reports" element={<ReportsCentre scope="admin" />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="system" element={<Systems />} />
        <Route path="*" element={<Card><Empty title="This page does not exist">Use the menu to find what you need.</Empty></Card>} />
      </Routes>
    </AppShell>
  )
}
