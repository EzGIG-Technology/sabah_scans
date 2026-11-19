// Immigration dashboard (/jim/*) for Jabatan Imigresen Malaysia, Negeri Sabah (JIM Sabah).
// JIM sees contribution status only, for information. SCANS never decides immigration status and has
// no function to issue, hold, suspend or cancel a permit; contribution status must not be used to
// refuse, delay or cancel one. JIM permit data comes in read-only. Every view, lookup and export
// is written to the shared audit log. Wages, complaint content and merchant data are not shown here.
import { Routes, Route, useLocation } from 'react-router-dom'
import { LayoutDashboard, ScanLine, GitCompareArrows, Users, CalendarClock, RefreshCw, Megaphone, ScrollText } from 'lucide-react'
import { AppShell, Card, Empty } from '../../components/ui.jsx'
import { useStore, setActor } from '../shared/store.js'
import '../shared/shared.css'
import '../state/state.css'
import './jim.css'
import { BASE, ACTOR, useJim } from './data.js'
import Overview from './Overview.jsx'
import Check from './Check.jsx'
import Records from './Records.jsx'
import { JimWorkerList, JimWorkerProfile } from './Workers.jsx'
import Permits from './Permits.jsx'
import Sync from './Sync.jsx'
import Notices from './Notices.jsx'
import Audit from './Audit.jsx'

const TITLES = [
  [/^\/jim\/?$/, 'Overview'], [/^\/jim\/check/, 'Status check'], [/^\/jim\/records/, 'Record matching'],
  [/^\/jim\/workers\/.+/, 'Worker record'], [/^\/jim\/workers/, 'Workers'], [/^\/jim\/permits/, 'Permits ending soon'],
  [/^\/jim\/sync/, 'JIM data link'], [/^\/jim\/notices/, 'Notices'], [/^\/jim\/audit/, 'Audit log'],
]

export default function JimApp() {
  setActor(ACTOR)
  const loc = useLocation()
  const waiting = useJim((s) => s.matches.filter((m) => m.status === 'Waiting').length)
  const returned = useStore((s) => s.notices.filter((n) => n.origin === 'JIM' && n.status === 'Returned').length)
  const title = (TITLES.find(([re]) => re.test(loc.pathname)) || [, 'Immigration dashboard'])[1]
  const nav = [
    { group: 'Monitor', items: [
      { to: BASE, label: 'Overview', icon: LayoutDashboard, end: true },
      { to: BASE + '/permits', label: 'Permits ending soon', icon: CalendarClock },
    ] },
    { group: 'Records', items: [
      { to: BASE + '/check', label: 'Status check', icon: ScanLine },
      { to: BASE + '/workers', label: 'Workers', icon: Users },
      { to: BASE + '/records', label: 'Record matching', icon: GitCompareArrows, count: waiting || null },
    ] },
    { group: 'Data and notices', items: [
      { to: BASE + '/sync', label: 'JIM data link', icon: RefreshCw },
      { to: BASE + '/notices', label: 'Notices', icon: Megaphone, count: returned || null },
      { to: BASE + '/audit', label: 'Audit log', icon: ScrollText },
    ] },
  ]
  const notifications = [
    ...(waiting ? [{ title: `${waiting} record${waiting > 1 ? 's' : ''} in your sample waiting for JIM to confirm`, time: 'Record matching', to: BASE + '/records' }] : []),
    { title: 'JIM permit data received: 1,412 records, 0 failed', time: '17 Dec 2027, 06:04', to: BASE + '/sync' },
    { title: 'Your notice on Christmas counter hours was sent by the State', time: '14 Dec 2027', to: BASE + '/notices' },
  ]
  return (
    <AppShell nav={nav} portal={{ name: 'Imigresen Negeri Sabah', sub: 'Jabatan Imigresen Malaysia', crest: '/img/logos/imigresen.png' }}
      user={{ name: 'Mohd Hafiz Rahim', role: 'Immigration officer, KK office' }} title={title} kicker="Immigration dashboard"
      notifications={notifications} searchPlaceholder="Search SCANS ID, passport or PLKS">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="check" element={<Check />} />
        <Route path="records" element={<Records />} />
        <Route path="workers" element={<JimWorkerList />} />
        <Route path="workers/:id" element={<JimWorkerProfile />} />
        <Route path="permits" element={<Permits />} />
        <Route path="sync" element={<Sync />} />
        <Route path="notices" element={<Notices />} />
        <Route path="audit" element={<Audit />} />
        <Route path="*" element={<Card><Empty title="This page does not exist">Use the menu to find what you need.</Empty></Card>} />
      </Routes>
    </AppShell>
  )
}
