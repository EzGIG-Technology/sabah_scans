import { LayoutDashboard, Tag, ScanLine, Store, FileBarChart, Settings as SettingsIcon, UserPlus } from 'lucide-react'
import { AppShell } from '../../components/ui.jsx'
import { useMerchant } from './store.jsx'
import { ME, MERCHANT } from './data.js'

const notifications = [
  { title: 'Free 600ml water offer is with Microtek for review', time: 'Sent 14 Jun 2027' },
  { title: 'Statement for May 2027 is ready to download', time: '1 Jun 2027' },
  { title: 'RM3 off a RM30 prepaid reload ends on 30 Jun', time: 'Reminder' },
]

export function MShell({ title, children }) {
  const { offers, outlets } = useMerchant()
  const waiting = offers.filter((o) => o.status === 'Waiting for approval').length
  const nav = [
    { group: 'Overview', items: [{ to: '/merchant', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
    {
      group: 'Perks',
      items: [
        { to: '/merchant/offers', label: 'Offer management', icon: Tag, count: waiting || undefined },
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
      searchPlaceholder="Search offers or outlets"
    >
      {children}
    </AppShell>
  )
}
