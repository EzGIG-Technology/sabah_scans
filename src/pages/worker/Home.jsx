import { Link } from 'react-router-dom'
import { Bell, Wallet, Receipt, Gift, LifeBuoy, ChevronRight, CheckCircle2, CalendarClock, Building2, Megaphone, ShieldAlert, Scale, QrCode } from 'lucide-react'
import { Logo, initials } from '../../components/ui.jsx'
import { demoWorker as w, notices, workerPayments, rm, daysFromDemo } from '../../data/demo.js'
import { useWk, useTone, QR } from './shell.jsx'

export const kindIcon = { Payment: Wallet, Rights: Scale, Safety: ShieldAlert, Receipt: Receipt }
export const kindTone = { Payment: 'c-blue', Rights: 'c-purple', Safety: 'c-orange', Receipt: 'c-green' }

// Permit expiry 14 Mar 2028, counted from the demo day. Information only.
const PERMIT_DAYS = daysFromDemo(2028, 2, 14)

export default function WorkerHome() {
  useTone('light')
  const { t, tf, offline } = useWk()
  const first = w.name.split(' ')[0]
  const actions = [
    { to: '/worker/pay', label: t.pay, icon: Wallet, c: 'c-blue' },
    { to: '/worker/history', label: t.receipts, icon: Receipt, c: 'c-green' },
    { to: '/worker/perks', label: t.perks, icon: Gift, c: 'c-orange' },
    { to: '/worker/help', label: t.help, icon: LifeBuoy, c: 'c-purple' },
  ]
  return (
    <div className="wk-page has-nav">
      <section className="wk-hero">
        <div className="wk-hero-top">
          <span className="wk-logochip"><Logo width={92} /></span>
          <div className="wk-hero-ic">
            <Link to="/worker/notices" className="wk-ib glass" aria-label={t.notices + ', 2 new'}><Bell aria-hidden="true" /><i className="dot" /></Link>
            <Link to="/worker/me" className="wk-av" aria-label={t.me}>{initials(w.name)}</Link>
          </div>
        </div>
        <p className="wk-hi">{t.hello},</p>
        <h1 className="wk-name">{first}</h1>
        <div className="wk-due">
          <span className="lbl">{tf('dueFor', { m: w.due.month })}</span>
          <div className="mid">
            <b className="amt num">RM{w.due.amount}</b>
            <Link to="/worker/pay" className="btn white lg">{t.payNow}</Link>
          </div>
          <span className="sub">{tf('payBy', { d: w.due.dueDate })}</span>
        </div>
        <div className="wk-hero-foot">
          <span><CheckCircle2 aria-hidden="true" /> {t.paidUp} <b>{w.paidThrough}</b></span>
          <span className="sep" aria-hidden="true" />
          <span>{t.nothingElse}</span>
        </div>
      </section>

      {offline && <p className="wk-stamp">Last updated today at 08:12. It updates again when you are online.</p>}

      <section className="wk-actions" aria-label="Quick actions">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="wk-act">
            <span className={'wk-bub ' + a.c}><a.icon aria-hidden="true" /></span>
            <span>{a.label}</span>
          </Link>
        ))}
      </section>

      <Link to="/worker/me" className="wk-cardmini">
        <span className="qrbox"><QR seed="card" size={54} label="" /></span>
        <span className="grow"><b>{t.card}</b><small>{t.cardSub}</small><small className="num">{w.scansId}</small></span>
        <QrCode aria-hidden="true" className="ic" />
      </Link>

      <section className="wk-sec">
        <div className="wk-card wk-permit">
          <div className="row">
            <span className="wk-ico"><CalendarClock aria-hidden="true" /></span>
            <div className="grow"><span className="muted small">{t.permit}</span><b>{w.permitExpiry}</b></div>
            <span className="pill ok dot">{tf('daysLeft', { n: PERMIT_DAYS })}</span>
          </div>
          <div className="bar" aria-hidden="true"><span style={{ width: Math.min(100, (PERMIT_DAYS / 730) * 100) + '%' }} /></div>
          <p className="small muted">{t.permitNote}</p>
        </div>
      </section>

      <section className="wk-sec">
        <div className="wk-card wk-emp">
          <span className="wk-mono">{initials(w.employer)}</span>
          <div className="grow"><span className="muted small">{t.employer}</span><b>{w.employer}</b><small>{w.role} · {w.site}</small></div>
        </div>
      </section>

      <section className="wk-sec">
        <div className="wk-sec-h"><h2>{t.latest}</h2><Link to="/worker/notices">{t.all}</Link></div>
        <div className="wk-list">
          {notices.slice(0, 3).map((n, i) => {
            const Icon = kindIcon[n.kind] || Megaphone
            return (
              <Link key={n.id} to={'/worker/notices/' + n.id} className="wk-li">
                <span className={'wk-ico ' + (kindTone[n.kind] || '')}><Icon aria-hidden="true" /></span>
                <span className="tx"><b>{n.title}</b><small>{n.from} · {n.date}</small></span>
                {i < 2 && <i className="unread" aria-label="New" />}
                <ChevronRight className="chev" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      </section>

      <section className="wk-sec">
        <div className="wk-sec-h"><h2>{t.receipts}</h2><Link to="/worker/history">{t.all}</Link></div>
        <div className="wk-list">
          {workerPayments.slice(0, 2).map((p) => (
            <Link key={p.id} to={'/worker/receipt/' + p.id} className="wk-li">
              <span className="wk-ico c-green"><Receipt aria-hidden="true" /></span>
              <span className="tx"><b>{p.month}</b><small>{p.method} · {p.date}</small></span>
              <span className="amt num">{rm(p.amount)}</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="wk-fine"><Building2 aria-hidden="true" />Run for Kerajaan Negeri Sabah. Your money goes to the State’s FWECF account.</p>
    </div>
  )
}
