import { LayoutDashboard, Tag, ScanLine, Store, FileBarChart, Settings as SettingsIcon, UserPlus, Bell } from 'lucide-react'
import { AppShell } from '../../components/ui.jsx'
import { useMerchant } from './store.jsx'
import { ME, MERCHANT } from './data.js'

export function MShell({ title, children }) {
  const { offers, outlets, notes } = useMerchant()
  const waiting = offers.filter((o) => o.status === 'Waiting for approval').length
  const sentBack = offers.filter((o) => o.status === 'Sent back').length
  const unread = notes.filter((n) => !n.read)
  // The top bar shows the newest unread items; the full list is on the Notifications page.
  const notifications = unread.slice(0, 4).map((n) => ({ title: n.title, time: n.ago }))
  const nav = [
    {
      group: 'Overview',
      items: [
        { to: '/merchant', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/merchant/notifications', label: 'Notifications', icon: Bell, count: unread.length || undefined },
      ],
    },
    {
      group: 'Perks',
      items: [
        { to: '/merchant/offers', label: 'Offer management', icon: Tag, count: waiting + sentBack || undefined },
        { to: '/merchant/redeem', label: 'Confirm a redemption', icon: ScanLine },
      ],
    },
    {
      group: 'Business',
      items: [
        { to: '/merchant/outlets', label: 'Branches and outlets', icon: Store },
        { to: '/merchant/reports', label: 'Reports', icon: FileBarChart },
        { to: '/merchant/settings', label: 'Merchant settings', icon: SettingsIcon },
      ],
    },
    { group: 'New partners', items: [{ to: '/merchant/register', label: 'Partner sign-up', icon: UserPlus }] },
  ]
  return (
    <AppShell
      nav={nav}
      portal={{ name: MERCHANT.name, sub: `Merchant partner · ${outlets.length} outlets`, mark: '7E' }}
      user={ME}
      kicker="Merchant partner"
      title={title}
      notifications={notifications}
      notificationsHref="/merchant/notifications"
      searchPlaceholder="Search offers or outlets"
    >
      {children}
    </AppShell>
  )
}
