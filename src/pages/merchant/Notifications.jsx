import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, BarChart3, Clock, ShieldCheck, XCircle, FileText, Store, Hourglass, PartyPopper, CheckCheck, ChevronRight, Settings as SettingsIcon } from 'lucide-react'
import { PageHead, Card, Tabs, Empty, useToast } from '../../components/ui.jsx'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'

const KINDS = {
  approved: { icon: CheckCircle2, tone: 'ok' },
  milestone: { icon: BarChart3, tone: 'info' },
  ending: { icon: Clock, tone: 'warn' },
  review: { icon: Hourglass, tone: 'info' },
  sentback: { icon: XCircle, tone: 'bad' },
  statement: { icon: FileText, tone: 'info' },
  outlet: { icon: Store, tone: 'ok' },
  licence: { icon: ShieldCheck, tone: 'warn' },
  welcome: { icon: PartyPopper, tone: 'ok' },
}
const AREAS = ['All', 'Offers', 'Outlets', 'Reports', 'Account']

export default function Notifications() {
  const { notes, markRead } = useMerchant()
  const toast = useToast()
  const go = useNavigate()
  const [area, setArea] = useState('All')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const unread = notes.filter((n) => !n.read).length
  const list = notes.filter((n) => (area === 'All' || n.area === area) && (!unreadOnly || !n.read))

  const open = (n) => { markRead(n.id); go(n.to) }

  return (
    <MShell title="Notifications">
      <PageHead title="Notifications" sub="News about your own offers, outlets and account. SCANS never sends you worker details or advertising.">
        <Link className="btn outline" to="/merchant/settings?tab=notifications"><SettingsIcon /> Choose what we send</Link>
        <button className="btn primary" disabled={!unread} onClick={() => { markRead(null); toast('All notifications marked as read') }}><CheckCheck /> Mark all as read</button>
      </PageHead>

      <Card>
        <Tabs label="Show" value={area} onChange={setArea}
          items={AREAS.map((a) => ({ value: a, label: a, count: (a === 'All' ? notes : notes.filter((n) => n.area === a)).filter((n) => !n.read).length || undefined }))} />
        <div className="toolbar" style={{ margin: '14px 0 6px' }}>
          <label className="check" style={{ margin: 0 }}>
            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
            <span>Unread only ({unread})</span>
          </label>
        </div>
        {list.length === 0 ? (
          <Empty title={unreadOnly ? 'You are all caught up' : 'Nothing here yet'}>
            {unreadOnly ? 'No unread notifications in this list.' : 'Notifications about this area will appear here.'}
          </Empty>
        ) : (
          <ul className="mx-notes">
            {list.map((n) => {
              const k = KINDS[n.kind] || KINDS.review
              const Icon = k.icon
              return (
                <li key={n.id} className={n.read ? '' : 'unread'}>
                  <button type="button" onClick={() => open(n)}>
                    <span className={'mx-note-ic ' + k.tone}><Icon aria-hidden="true" /></span>
                    <span className="grow">
                      <b>{n.title}{!n.read && <span className="vh"> (unread)</span>}</b>
                      <span className="mx-note-body">{n.body}</span>
                      <small>{n.ago === n.at ? n.at : `${n.ago} · ${n.at}`} · {n.area}</small>
                    </span>
                    {!n.read && <span className="mx-note-dot" aria-hidden="true" />}
                    <ChevronRight className="mx-note-go" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </MShell>
  )
}
