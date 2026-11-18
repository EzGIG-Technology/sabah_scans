import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Clock, CheckCircle2, Store, Mic, EyeOff, Send, Volume2, Languages, ShieldCheck, Receipt, LifeBuoy, LogOut, Lock, Database, Eye, Ban, FileText, UserCheck, WifiOff, Megaphone, Info, Check, QrCode, IdCard, CalendarDays, BellRing, Bell, MessageSquare, MessageCircle, Fingerprint, HelpCircle, Sparkles } from 'lucide-react'
import { Logo, Mono, Status, initials } from '../../components/ui.jsx'
import { demoWorker as w, notices, offers, workerPayments } from '../../data/demo.js'
import { Group, LangSheet } from './kit.jsx'
import { useWk, useTone, TopBar, Sheet, QR } from './shell.jsx'
import { kindIcon, kindTone } from './Home.jsx'
import { langName } from './i18n.js'

/* ---------- Perks (Sabah GO rewards pattern, no points: perks are open to workers who are up to date) ---------- */
const USED = [
  { id: 'u1', merchant: '7-Eleven Sabah', title: 'RM3 off a RM30 prepaid reload', at: '7-Eleven Fajar Centre, Lahad Datu', when: '12 May 2027, 18:20', saved: 3 },
]
const STUB = { o1: ['RM3', 'off'], o2: ['10GB', 'extra'], o3: ['5%', 'off'], o4: ['RM20', 'visit'] }
const STUB_C = { '7-Eleven Sabah': '#0E8F57', CelcomDigi: '#1460E0', 'Pasaraya Servay': '#D42253', 'Klinik Mesra Borneo': '#7B4DE3' }
const CODE_SECS = 300

function Stub({ o }) {
  const [a, b] = STUB[o.id] || ['', '']
  return <span className="wk-stub" style={{ background: STUB_C[o.merchant] || 'var(--blue)' }} aria-hidden="true"><b>{a}</b><small>{b}</small></span>
}

export function Perks() {
  const { t, toast, offline } = useWk()
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState(null)
  const [phase, setPhase] = useState('detail') // detail | code | done | expired
  const [left, setLeft] = useState(CODE_SECS)
  const [how, setHow] = useState(false)
  const [used, setUsed] = useState(USED)
  const live = offers.filter((o) => o.status === 'Live')
  const close = () => { setOpen(null); setPhase('detail') }
  const code = open ? String(482913 + live.indexOf(open) * 104729).slice(-6) : ''
  useEffect(() => {
    if (phase !== 'code') return
    if (left <= 0) { setPhase('expired'); return }
    const id = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, left])
  const showCode = () => { setLeft(CODE_SECS); setPhase('code') }
  const shopConfirms = () => {
    setPhase('done')
    setUsed((u) => [{ id: 'u-' + open.id, merchant: open.merchant, title: open.title, at: open.merchant === '7-Eleven Sabah' ? '7-Eleven Fajar Centre, Lahad Datu' : open.merchant + ', Lahad Datu', when: 'Today, 10:42' }, ...u.filter((x) => x.id !== 'u-' + open.id)])
    toast('The shop confirmed. Perk used.')
  }
  const saved = used.reduce((a, u) => a + (u.saved || 0), 0)
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  return (
    <div className="wk-page has-nav">
      <TopBar title={t.perks} back={false} />
      <div className="wk-pad">
        <div className="wk-tier">
          <div className="row">
            <span className="wk-tier-ic"><ShieldCheck aria-hidden="true" /></span>
            <div className="grow"><b>You are up to date</b><small>Paid up to {w.paidThrough}. All perks are open to you.</small></div>
          </div>
          <div className="wk-tier-stats">
            <div><b className="num">{live.length}</b><span>Perks open</span></div>
            <div><b className="num">{used.length}</b><span>Used</span></div>
            <div><b className="num">RM{saved}</b><span>Saved so far</span></div>
          </div>
          <p>Shops never see your record. They see only that a code is valid.</p>
        </div>

        <section className="wk-how">
          <button type="button" aria-expanded={how} onClick={() => setHow(!how)}><Info aria-hidden="true" /><span>How perks work</span><ChevronRight className={'chev' + (how ? ' down' : '')} aria-hidden="true" /></button>
          {how && (
            <ol>
              <li>Pick a perk and tap <b>Show code</b> at the counter.</li>
              <li>The code works for 5 minutes. The shop scans it or keys in the 6 digits.</li>
              <li>It counts as used only after the shop confirms. If you close it before, you can use it later.</li>
              <li>New perks come every month. If you fall behind, perks wait until you are up to date. Your permit is never affected.</li>
            </ol>
          )}
        </section>

        <div className="seg wk-seg" role="tablist" aria-label="Perks">
          <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>Open <span className="n">{live.length}</span></button>
          <button type="button" role="tab" aria-selected={tab === 'used'} onClick={() => setTab('used')}>Used <span className="n">{used.length}</span></button>
        </div>
        {tab === 'all' ? (
          <div className="wk-perks">
            {live.map((o) => (
              <button key={o.id} type="button" className="wk-coupon" onClick={() => { setOpen(o); setPhase('detail') }}>
                <Stub o={o} />
                <span className="grow">
                  <small>{o.merchant}</small>
                  <b>{o.title}</b>
                  <span className="ends"><Clock aria-hidden="true" /> Ends {o.ends}</span>
                </span>
                <ChevronRight className="chev" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : used.length ? (
          <div className="wk-perks">
            {used.map((u) => (
              <article key={u.id} className="wk-perk used">
                <Mono name={u.merchant} size="lg" />
                <div className="grow">
                  <small>{u.merchant}</small>
                  <b>{u.title}</b>
                  <span>{u.at}</span>
                  <span className="ends ok"><CheckCircle2 aria-hidden="true" /> Confirmed by the shop · {u.when}</span>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="wk-empty">No perks used yet.</p>}
      </div>
      {open && (
        <Sheet title={open.title} onClose={close}>
          {phase === 'detail' ? (
            <div className="wk-code">
              <Stub o={open} />
              <small>{open.merchant}</small>
              <h2>{open.title}</h2>
              <div className="wk-terms">
                <b>Terms</b>
                <ul>
                  <li>{open.terms}</li>
                  <li>For workers who are up to date with their contribution.</li>
                  <li>Cannot be combined with other offers.</li>
                  <li>Ends {open.ends}.</li>
                </ul>
              </div>
              {offline && <p className="wk-note warn"><WifiOff aria-hidden="true" />You are offline. The shop needs a connection to confirm the code.</p>}
              <button type="button" className="btn primary lg block" onClick={showCode}>Show code</button>
            </div>
          ) : phase === 'expired' ? (
            <div className="wk-code">
              <span className="wk-state warn"><Clock aria-hidden="true" /> The code expired</span>
              <h2>Nothing was used</h2>
              <p className="wk-lead small">The shop did not confirm in 5 minutes, so the perk is still yours.</p>
              <button type="button" className="btn primary lg block" onClick={showCode}>Show a new code</button>
              <button type="button" className="btn ghost block" onClick={close}>Close</button>
            </div>
          ) : (
            <div className="wk-code">
              <div className="wk-code-top">
                <span className={'pill ' + (phase === 'done' ? 'ok' : 'info')}>{phase === 'done' ? 'Used' : 'Ready to scan'}</span>
                {phase === 'code' && <span className="wk-timer num" aria-label={'Code works for ' + mmss + ' more'}><Clock aria-hidden="true" /> {mmss}</span>}
              </div>
              <small>{open.merchant}</small>
              <h2>{open.title}</h2>
              <div className="qr"><QR seed={open.id} size={176} label={'Code for ' + open.title} /></div>
              <b className="digits num" aria-label={'Code ' + code.split('').join(' ')}>{code.slice(0, 3)} {code.slice(3)}</b>
              {phase === 'done'
                ? <p className="wk-state ok" role="status"><CheckCircle2 aria-hidden="true" /> The shop confirmed at 10:42. This perk is now used.</p>
                : <p className="wk-state" role="status"><span className="pulse" aria-hidden="true" /> Waiting for the shop to scan</p>}
              <p className="wk-note"><Info aria-hidden="true" />Counts as used only after the shop confirms. If you close this before, you can use it later.</p>
              {phase === 'code' && <button type="button" className="wk-demo" onClick={shopConfirms}>Demo: the shop confirms</button>}
              <button type="button" className="btn outline lg block" onClick={() => { const c = phase === 'done'; close(); if (c) setTab('used') }}>{phase === 'done' ? 'See used perks' : 'Close'}</button>
            </div>
          )}
        </Sheet>
      )}
    </div>
  )
}

/* ---------- Notices ---------- */
const KINDS = ['All', 'Payment', 'Rights', 'Safety', 'Receipt']

export function Notices() {
  const { t, lang } = useWk()
  const [kind, setKind] = useState('All')
  const list = notices.filter((n) => kind === 'All' || n.kind === kind)
  return (
    <div className="wk-page has-nav">
      <TopBar title={t.notices} back={false} />
      <div className="wk-pad">
        <p className="wk-lead small"><Languages aria-hidden="true" className="inl" />Official notices from the State and its agencies, sent in {langName[lang]}.</p>
        <div className="wk-chips scroll" role="group" aria-label="Filter">
          {KINDS.map((k) => <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k} <span className="n num">{k === 'All' ? notices.length : notices.filter((n) => n.kind === k).length}</span></button>)}
        </div>
        {list.length === 0 && <p className="wk-empty">No notices of this kind yet.</p>}
        <div className="wk-list" hidden={list.length === 0}>
          {list.map((n) => {
            const Icon = kindIcon[n.kind] || Megaphone
            const fresh = notices.indexOf(n) < 2
            return (
              <Link key={n.id} to={'/worker/notices/' + n.id} className="wk-li tall">
                <span className={'wk-ico ' + (kindTone[n.kind] || '')}><Icon aria-hidden="true" /></span>
                <span className="tx"><b>{n.title}</b><small>{n.from} · {n.date}</small></span>
                {fresh && <i className="unread" aria-label="New" />}
                <ChevronRight className="chev" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function Notice() {
  const { id } = useParams()
  const { lang, toast } = useWk()
  const n = notices.find((x) => x.id === id) || notices[0]
  const Icon = kindIcon[n.kind] || Megaphone
  return (
    <div className="wk-page has-nav">
      <TopBar title="Notice" back="/worker/notices" />
      <div className="wk-pad">
        <article className="wk-card wk-notice">
          <div className="row">
            <span className={'wk-ico ' + (kindTone[n.kind] || '')}><Icon aria-hidden="true" /></span>
            <div className="grow"><b className="from">{n.from}</b><small className="muted">{n.date}</small></div>
            <span className="pill info">{n.kind}</span>
          </div>
          <h1>{n.title}</h1>
          <p>{n.body}</p>
          <button type="button" className="btn outline block" onClick={() => toast('Reading the notice aloud')}><Volume2 aria-hidden="true" /> Read it aloud</button>
        </article>
        <p className="wk-note"><Languages aria-hidden="true" /><span>Sent to you in {langName[lang]}. <Link to="/worker/me#language">Change language</Link></span></p>
        {n.kind === 'Rights' && <Link to="/worker/help" className="wk-li single"><span className="wk-ico c-purple"><LifeBuoy aria-hidden="true" /></span><span className="tx"><b>Report a problem</b><small>In your own language. Your employer does not need to know.</small></span><ChevronRight className="chev" aria-hidden="true" /></Link>}
      </div>
    </div>
  )
}

/* ---------- Help ---------- */
const TOPICS = ['Payment problem', 'My details are wrong', 'Wages or working hours', 'My passport is being kept', 'Housing', 'Something else']
const AGENCY = { 'Payment problem': 'SCANS support', 'My details are wrong': 'SCANS support', 'Something else': 'SCANS support' }
const EARLIER = [
  { id: 'CMP-2605-0412', topic: 'Payment taken twice', note: 'Refunded RM100 on 9 May 2027', status: 'Resolved' },
  { id: 'CMP-2604-0218', topic: 'Cannot see April receipt', note: 'Answered on 22 Apr 2027', status: 'Resolved' },
]

export function Help() {
  const loc = useLocation()
  const { toast, offline } = useWk()
  const fromRecord = new URLSearchParams(loc.search).get('topic') === 'record'
  const [topic, setTopic] = useState(fromRecord ? 'My details are wrong' : 'Payment problem')
  const [text, setText] = useState('')
  const [anon, setAnon] = useState(true)
  const [sent, setSent] = useState(null)
  const agency = AGENCY[topic] || 'JTK Sabah'
  const submit = (e) => {
    e.preventDefault()
    if (offline) { toast('Saved. We send it when you are back online.'); return }
    setSent({ id: 'CMP-2706-0094', topic, agency, anon })
    toast('Complaint sent')
  }
  return (
    <div className="wk-page has-nav">
      <TopBar title="Help and complaints" />
      <div className="wk-pad">
        {sent ? (
          <div className="wk-card wk-sent">
            <div className="row"><span className="wk-ico c-green"><CheckCircle2 aria-hidden="true" /></span><div className="grow"><b>We have your complaint</b><small className="num muted">{sent.id} · {sent.topic}</small></div><Status>New</Status></div>
            <ol className="wk-timeline">
              <li className="done"><b>Sent today</b><span>In your own words and language</span></li>
              <li className="on"><b>Sent to {sent.agency}</b><span>{sent.agency === 'JTK Sabah' ? 'The labour department acts on wages, housing and passports' : 'The SCANS team answers payment and record questions'}</span></li>
              <li><b>Answer within 2 working days</b><span>By SMS and here in the app</span></li>
            </ol>
            {sent.anon && <p className="wk-note"><EyeOff aria-hidden="true" />Your employer will not be told your name.</p>}
            <button type="button" className="btn outline block" onClick={() => { setSent(null); setText('') }}>Send another</button>
          </div>
        ) : (
          <form className="wk-form" onSubmit={submit}>
            <p className="wk-lead">Tell us what happened in your own language. We send it to the agency that can act on it, and you can follow it here.</p>
            {fromRecord && <p className="wk-note"><UserCheck aria-hidden="true" />A person checks your record by hand. You can keep using the app while we check.</p>}
            <fieldset className="wk-fs">
              <legend>What is it about?</legend>
              <div className="wk-chips">
                {TOPICS.map((x) => <button key={x} type="button" className="chip" aria-pressed={topic === x} onClick={() => setTopic(x)}>{topic === x && <Check aria-hidden="true" />}{x}</button>)}
              </div>
            </fieldset>
            <label className="wk-field">
              <span>What happened?</span>
              <textarea className="input" rows={5} required value={text} onChange={(e) => setText(e.target.value)} placeholder="Write in any language. Bahasa Indonesia, Bengali, Nepali, Tagalog or any other is fine." />
            </label>
            <button type="button" className="btn outline block" onClick={() => toast('Recording. Tap again to stop.')}><Mic aria-hidden="true" /> Record a voice note instead</button>
            <div className="wk-switch">
              <span className="grow"><b>Do not tell my employer my name</b><small>{anon ? 'Your employer will not see who sent this.' : 'The agency may contact your employer with your name.'}</small></span>
              <button type="button" className="switch" role="switch" aria-checked={anon} aria-label="Do not tell my employer my name" onClick={() => setAnon(!anon)} />
            </div>
            <p className="wk-note"><Info aria-hidden="true" /><span>Goes to <b>{agency}</b>. Making a complaint never affects your permit or your contribution.</span></p>
            {offline && <p className="wk-note warn"><WifiOff aria-hidden="true" />You are offline. We keep it on your phone and send it when you are back online.</p>}
            <button type="submit" className="btn primary lg block"><Send aria-hidden="true" /> {offline ? 'Save and send later' : 'Send complaint'}</button>
          </form>
        )}

        <div className="wk-sec-h"><h2>Your earlier requests</h2></div>
        <div className="wk-list">
          {sent && <div className="wk-li tall"><span className="tx"><b>{sent.topic}</b><small className="num">{sent.id} · sent today · {sent.agency}</small></span><Status>New</Status></div>}
          <div className="wk-li tall"><span className="tx"><b>Wages paid late</b><small className="num">CMP-2706-0091 · 2 Jun 2027 · JTK Sabah</small></span><Status>With agency</Status></div>
          {EARLIER.map((x) => (
            <div key={x.id} className="wk-li tall"><span className="tx"><b>{x.topic}</b><small className="num">{x.id} · {x.note}</small></span><Status>{x.status}</Status></div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- Me: profile with the SCANS card (Sabah GO profile pattern) ---------- */
const PLAN_NAMES = { m: 'One month', q: 'Three months', y: 'One year' }
const readLS = (k, d) => { try { return localStorage.getItem(k) ?? d } catch { return d } }
const writeLS = (k, v) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } }

function Row({ to, icon: Icon, c, title, sub, children, onClick }) {
  const inner = <><span className={'wk-ico ' + (c || '')}><Icon aria-hidden="true" /></span><span className="tx"><b>{title}</b>{sub && <small>{sub}</small>}</span>{children || <ChevronRight className="chev" aria-hidden="true" />}</>
  if (to) return <Link to={to} className="wk-li">{inner}</Link>
  if (onClick) return <button type="button" className="wk-li" onClick={onClick}>{inner}</button>
  return <div className="wk-li">{inner}</div>
}

export function Me() {
  useTone('light')
  const { lang, offline, setOffline, t, toast } = useWk()
  const nav = useNavigate()
  const [langOpen, setLangOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [plan, setPlan] = useState(() => readLS('scans-plan', 'm'))
  const [pref, setPref] = useState(() => {
    try { return { remind: true, sms: true, wa: false, push: true, bio: false, ...JSON.parse(readLS('scans-notif', '{}')) } } catch { return { remind: true, sms: true, wa: false, push: true, bio: false } }
  })
  const flip = (k) => { const n = { ...pref, [k]: !pref[k] }; setPref(n); writeLS('scans-notif', JSON.stringify(n)) }
  const loc = useLocation()
  useEffect(() => { if (loc.hash === '#language') setLangOpen(true) }, [loc.hash])
  const monthsPaid = 5 // January to May 2027, from the receipts list
  const sw = (k, label) => <button type="button" className="switch" role="switch" aria-checked={pref[k]} aria-label={label} onClick={() => flip(k)} />
  return (
    <div className="wk-page has-nav">
      <section className="wk-profhead">
        <div className="who">
          <span className="wk-av xl">{initials(w.name)}</span>
          <div className="grow">
            <h1>{w.name}</h1>
            <small>{w.nationality} · {w.role}</small>
            <span className="pill white"><CheckCircle2 aria-hidden="true" /> Paid up to {w.paidThrough}</span>
          </div>
        </div>
        <div className="wk-stats" role="list">
          <div role="listitem"><b className="num">{monthsPaid}</b><span>Months paid in 2027</span></div>
          <div role="listitem"><b className="num">{workerPayments.length}</b><span>{t.receipts}</span></div>
          <div role="listitem"><b className="num">1</b><span>Perks used</span></div>
        </div>
      </section>
      <div className="wk-pad">
        <Link to="/worker/card" className="wk-cardmini">
          <span className="qrbox"><QR seed="card" size={54} label="" /></span>
          <span className="grow"><b>{t.card}</b><small>{t.cardSub}</small><small className="num">{w.scansId}</small></span>
          <ChevronRight aria-hidden="true" className="ic" />
        </Link>
        {offline && <p className="wk-stamp"><WifiOff aria-hidden="true" />Works without a connection. Checked today at 08:12.</p>}

        <Group title="My documents">
          <Row to="/worker/card" icon={QrCode} c="c-blue" title={t.card} sub="Not an immigration document" />
          <Row to="/worker/details" icon={IdCard} c="c-navy" title="Permit and record details" sub={'PLKS valid until ' + w.permitExpiry} />
        </Group>

        <Group title="Payments">
          <Row to="/worker/history" icon={Receipt} c="c-green" title={t.receipts} sub={'Paid up to ' + w.paidThrough} />
          <Row icon={CalendarDays} c="c-teal" title="Usual payment period" sub={PLAN_NAMES[plan] + ' · chosen first in Pay'} onClick={() => setPlanOpen(true)} />
          <Row icon={BellRing} c="c-orange" title="Payment reminders" sub="3 days before the 5th">{sw('remind', 'Payment reminders')}</Row>
        </Group>

        <Group title="Preferences" id="language">
          <Row icon={Languages} c="c-blue" title={t.changeLang} sub={langName[lang]} onClick={() => setLangOpen(true)} />
          <Row icon={MessageSquare} c="c-green" title="SMS" sub="Receipts, reminders and notices">{sw('sms', 'SMS')}</Row>
          <Row icon={MessageCircle} c="c-teal" title="WhatsApp" sub="The same messages on WhatsApp">{sw('wa', 'WhatsApp')}</Row>
          <Row icon={Bell} c="c-purple" title="App notifications" sub="Notices from the State">{sw('push', 'App notifications')}</Row>
          <Row icon={Fingerprint} c="c-navy" title="Fingerprint or face sign-in" sub="Stays on this phone">{sw('bio', 'Fingerprint or face sign-in')}</Row>
        </Group>

        <Group title="Support">
          <Row to="/worker/help" icon={LifeBuoy} c="c-purple" title="Help and complaints" sub="In your own language" />
          <Row to="/worker/faq" icon={HelpCircle} c="c-blue" title="Questions and answers" sub="About SCANS" />
          <Row to="/worker/assistant" icon={Sparkles} c="c-purple" title={t.assistant} sub={t.preview + ' · explains, never changes anything'} />
          <Row to="/worker/privacy" icon={Lock} c="c-navy" title="How we use your information" sub="PDPA · kept in Malaysia" />
          <Row icon={WifiOff} c="c-orange" title="Try with no connection" sub="Demo only"><button type="button" className="switch" role="switch" aria-checked={offline} aria-label="Try with no connection" onClick={() => setOffline(!offline)} /></Row>
        </Group>

        <button type="button" className="btn danger lg block wk-logout" onClick={() => nav('/worker/signin')}><LogOut aria-hidden="true" /> Sign out</button>
        <button type="button" className="btn ghost block" onClick={() => nav('/worker/welcome')}>Restart the demo</button>
        <p className="wk-ver">SCANS worker app · prototype · Kerajaan Negeri Sabah</p>
      </div>
      {langOpen && <LangSheet onClose={() => { setLangOpen(false); if (loc.hash) nav('/worker/me', { replace: true }) }} />}
      {planOpen && (
        <Sheet title="Usual payment period" onClose={() => setPlanOpen(false)}>
          <h2 className="wk-sheet-h">Usual payment period</h2>
          <p className="wk-lead small">We choose this first when you pay. You can still change it each time.</p>
          <div className="wk-opts compact" role="radiogroup" aria-label="Usual payment period">
            {Object.entries(PLAN_NAMES).map(([k, v]) => (
              <button key={k} type="button" role="radio" aria-checked={plan === k} className="wk-opt" onClick={() => { setPlan(k); writeLS('scans-plan', k); setPlanOpen(false); toast('Saved') }}>
                <span className="grow"><b>{v}</b><small>{k === 'm' ? 'RM100' : k === 'q' ? 'RM300' : 'RM1,200'}</small></span><span className="radio" aria-hidden="true" />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}

/* ---------- Privacy ---------- */
const PRIVACY = [
  { icon: Database, c: 'c-navy', t: 'Your record belongs to the State', d: 'Kerajaan Negeri Sabah owns your record. Microtek runs SCANS for the State and may use it only to run SCANS. It is kept in Malaysia.' },
  { icon: FileText, c: 'c-blue', t: 'What we keep', d: 'Your name, passport and permit details, your payments, the notices sent to you and your complaints. We check your identity once with KDN when you sign up.' },
  { icon: Eye, c: 'c-teal', t: 'Who can see it', d: 'Only staff whose work needs it. Every time they open your record it is written in a log that the State’s auditors read. Your employer sees only whether you have paid. Shops never see your record.' },
  { icon: Ban, c: 'c-red', t: 'What we never do', d: 'We never sell your information or use it for advertising. Nothing in SCANS can cancel a permit, keep a passport or stop you from travelling.' },
  { icon: UserCheck, c: 'c-green', t: 'Your rights', d: 'Under the Personal Data Protection Act 2010 you can ask for a copy of your record and ask us to correct it. Use Help and choose “My details are wrong”.' },
]

export function Privacy() {
  return (
    <div className="wk-page has-nav">
      <TopBar title="Your information" back="/worker/me" />
      <div className="wk-pad">
        <h1 className="wk-h1">How we use your information</h1>
        <div className="wk-privacy">
          {PRIVACY.map((p) => (
            <section key={p.t} className="wk-card">
              <span className={'wk-bub sm ' + p.c}><p.icon aria-hidden="true" /></span>
              <div><h2>{p.t}</h2><p>{p.d}</p></div>
            </section>
          ))}
        </div>
        <Link to="/worker/help?topic=record" className="btn outline lg block">Ask for a copy or a correction</Link>
      </div>
    </div>
  )
}
