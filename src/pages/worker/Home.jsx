import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Wallet, Receipt, Gift, LifeBuoy, ChevronRight, CheckCircle2, Building2, Megaphone, ShieldAlert, Scale, QrCode, Search, IdCard, HelpCircle, Sparkles, ShieldCheck, Info, MapPin, Clock, AlertCircle } from 'lucide-react'
import { Logo, initials } from '../../components/ui.jsx'
import { demoWorker as w, notices, workerPayments, rm, daysFromDemo } from '../../data/demo.js'
import { useWk, useTone, QR, Sheet } from './shell.jsx'
import { DaysRing } from './kit.jsx'
import { monthName, period, DUE_IDX } from './account.js'

export const kindIcon = { Payment: Wallet, Rights: Scale, Safety: ShieldAlert, Receipt: Receipt }
export const kindTone = { Payment: 'c-blue', Rights: 'c-purple', Safety: 'c-orange', Receipt: 'c-green' }

// Permit expiry 14 Sep 2028, counted from the demo day. Information only.
const PERMIT_DAYS = daysFromDemo(2028, 2, 14)
// The State notice teased in the SCANS info card (JTK Sabah, rest days).
const INFO_NOTICE = notices.find((n) => n.id === 'n2') || notices[0]

const STATUS = {
  ok: { key: 'statusOk', icon: CheckCircle2 },
  due: { key: 'statusDue', icon: Clock },
  over: { key: 'statusOver', icon: AlertCircle },
}

export default function WorkerHome() {
  useTone('light')
  const { t, tf, offline, acct, lang } = useWk()
  const [searchOpen, setSearchOpen] = useState(false)
  const st = STATUS[acct.status]
  const owedLabel = acct.owed ? period(acct.first, DUE_IDX, lang) : ''
  const paidThrough = monthName(acct.paidIdx, lang)
  const actions = [
    { to: '/worker/pay', label: t.pay, icon: Wallet, c: 'c-blue' },
    { to: '/worker/history', label: t.receipts, icon: Receipt, c: 'c-green' },
    { to: '/worker/perks', label: t.perks, icon: Gift, c: 'c-orange' },
    { to: '/worker/help', label: t.help, icon: LifeBuoy, c: 'c-purple' },
    { to: '/worker/card', label: t.cardShort, icon: QrCode, c: 'c-navy' },
    { to: '/worker/details', label: t.details, icon: IdCard, c: 'c-teal' },
    { to: '/worker/faq', label: t.faq, icon: HelpCircle, c: 'c-blue' },
    { to: '/worker/assistant', label: t.assistant, icon: Sparkles, c: 'c-red', badge: t.preview },
  ]
  return (
    <div className="wk-page has-nav">
      <section className="wk-hero photo">
        <div className="wk-hero-top">
          <span className="wk-logochip"><Logo width={112} /></span>
          <div className="wk-hero-ic">
            <button type="button" className="wk-ib glass" aria-label={t.search} onClick={() => setSearchOpen(true)}><Search aria-hidden="true" /></button>
            <Link to="/worker/notices" className="wk-ib glass" aria-label={t.notices + ', 2 new'}><Bell aria-hidden="true" /><i className="dot" /></Link>
          </div>
        </div>

        <div className="wk-prof">
          <Link to="/worker/me" className="wk-prof-av" aria-label={t.me}>
            <span className="wk-av xl">{initials(w.name)}</span>
            <span className={'wk-stbadge ' + acct.status}><st.icon aria-hidden="true" />{t[st.key]}</span>
          </Link>
          <h1 className="wk-prof-name">{w.name}</h1>
          <p className="wk-prof-line"><MapPin aria-hidden="true" />{w.nationality}</p>
          <p className="wk-prof-line"><Building2 aria-hidden="true" />{w.employer}</p>
        </div>

        <div className={'wk-due' + (acct.status === 'over' ? ' over' : '')}>
          <span className="lbl">{acct.owed ? tf('dueFor', { m: owedLabel }) : t.nothingDue}</span>
          <div className="mid">
            <b className="amt num">RM{acct.amount.toLocaleString('en-MY')}</b>
            <Link to="/worker/pay" className="btn white lg">{acct.owed ? t.payNow : t.payAhead}</Link>
          </div>
          <span className="sub">{acct.owed ? tf('payBy', { d: w.due.dueDate }) : tf('noArrears', { m: paidThrough })}</span>
        </div>
        <div className="wk-hero-foot">
          <span><CheckCircle2 aria-hidden="true" /> {t.paidUp} <b>{paidThrough}</b></span>
          <span className="sep" aria-hidden="true" />
          <span>{acct.owed > 1 ? tf('owing', { n: acct.owed }) : t.nothingElse}</span>
        </div>
      </section>

      {offline && <p className="wk-stamp">Last updated today at 08:12. It updates again when you are online.</p>}

      <section className="wk-actions grid8" aria-label="Quick actions">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="wk-act">
            <span className={'wk-bub ' + a.c}><a.icon aria-hidden="true" /></span>
            <span>{a.label}</span>
            {a.badge && <i className="wk-badge">{a.badge}</i>}
          </Link>
        ))}
      </section>

      <section className="wk-sec">
        <div className="wk-card wk-permit2">
          <div className="top">
            <DaysRing days={PERMIT_DAYS} size={84} unit={t.days} label={tf('daysLeft', { n: PERMIT_DAYS })} />
            <dl className="grow">
              <dt className="ttl">{t.permitTitle}</dt>
              <div><dt>{t.plksNo}</dt><dd className="num">{w.plks}</dd></div>
              <div><dt>{t.expiry}</dt><dd>{w.permitExpiry}</dd></div>
            </dl>
          </div>
          <p className="note"><Info aria-hidden="true" />{t.permitInfo}</p>
        </div>
      </section>

      <section className="wk-sec">
        <Link to="/worker/card" className="wk-scard" aria-label={t.card + '. ' + t.cardLine + ' ' + t.expand}>
          <div className="body">
            <div className="grow">
              <Logo width={118} />
              <small className="num id">{w.scansId}</small>
              <p>{t.cardLine}</p>
            </div>
            <span className="qr"><QR seed="card" size={96} label="" /></span>
          </div>
          <div className="foot">
            <span><ShieldCheck aria-hidden="true" />{t.paidUp} {paidThrough}</span>
            <span className="go">{t.expand}<ChevronRight aria-hidden="true" /></span>
          </div>
        </Link>
      </section>

      <section className="wk-sec">
        <article className="wk-info">
          <span className="ph" style={{ backgroundImage: 'url(/img/helpdesk.jpg)' }} role="img" aria-label="A SCANS helpdesk officer" />
          <div className="tx">
            <h2>{t.scansInfo}</h2>
            <p>{t.infoText}</p>
            <Link to={'/worker/notices/' + INFO_NOTICE.id} className="more" aria-label={t.readMore + ': ' + INFO_NOTICE.title}>{t.readMore} <ChevronRight aria-hidden="true" /></Link>
          </div>
        </article>
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
        <Link to="/worker/assistant" className="wk-askcard">
          <span className="wk-chat-av" aria-hidden="true"><Sparkles /></span>
          <span className="grow"><b>{t.assistant} <span className="pill warn">{t.preview}</span></b><small>Questions about paying, receipts or notices? It explains. It never changes your record.</small></span>
          <ChevronRight aria-hidden="true" className="chev" />
        </Link>
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
      {searchOpen && <SearchSheet onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

/* Search across screens, notices, receipts and questions (Sabah GO home search). */
const SCREENS = [
  ['Pay my contribution', '/worker/pay', 'pay bayar cash 7-eleven duitnow fpx touch grab boost'],
  ['My SCANS card', '/worker/card', 'qr card kad kartu status'],
  ['Permit and record details', '/worker/details', 'permit plks passport employer details wrong'],
  ['Receipts', '/worker/history', 'receipt resit bukti history'],
  ['Perks', '/worker/perks', 'perk offer discount promo 7-eleven celcom'],
  ['Help and complaints', '/worker/help', 'help complaint aduan wages passport housing'],
  ['Questions and answers', '/worker/faq', 'faq question late employer money'],
  ['How we use your information', '/worker/privacy', 'privacy data pdpa'],
  ['Language', '/worker/me#language', 'language bahasa bengali nepali filipino'],
]
function SearchSheet({ onClose }) {
  const { t } = useWk()
  const [q, setQ] = useState('')
  const s = q.trim().toLowerCase()
  const hits = !s ? [] : [
    ...SCREENS.filter(([l, , k]) => (l + ' ' + k).toLowerCase().includes(s)).map(([l, to]) => ({ l, to, sub: 'In the app', icon: ChevronRight })),
    ...notices.filter((n) => (n.title + ' ' + n.body).toLowerCase().includes(s)).map((n) => ({ l: n.title, to: '/worker/notices/' + n.id, sub: n.from + ' · ' + n.date, icon: Megaphone })),
    ...workerPayments.filter((p) => (p.month + ' ' + p.method + ' ' + p.id).toLowerCase().includes(s)).map((p) => ({ l: 'Receipt ' + p.month, to: '/worker/receipt/' + p.id, sub: p.method + ' · ' + rm(p.amount), icon: Receipt })),
  ]
  return (
    <Sheet title={t.search} onClose={onClose}>
      <h2 className="wk-sheet-h">{t.search}</h2>
      <label className="wk-search">
        <Search aria-hidden="true" />
        <input className="input" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="For example: receipt, 7-Eleven, permit" aria-label={t.search} />
      </label>
      {s && (hits.length ? (
        <div className="wk-list flat" role="list">
          {hits.slice(0, 8).map((h) => (
            <Link key={h.to + h.l} to={h.to} className="wk-li" role="listitem" onClick={onClose}>
              <span className="wk-ico"><h.icon aria-hidden="true" /></span>
              <span className="tx"><b>{h.l}</b><small>{h.sub}</small></span>
            </Link>
          ))}
        </div>
      ) : <p className="wk-empty">Nothing found for “{q}”. Try another word, or <Link to="/worker/help" onClick={onClose}>ask for help</Link>.</p>)}
      {!s && <div className="wk-chips">{['Receipt', '7-Eleven', 'Permit', 'Language'].map((x) => <button key={x} type="button" className="chip" onClick={() => setQ(x)}>{x}</button>)}</div>}
    </Sheet>
  )
}
