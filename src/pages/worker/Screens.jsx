import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Clock, CheckCircle2, Store, Mic, EyeOff, Send, Volume2, Languages, ShieldCheck, Receipt, LifeBuoy, LogOut, Lock, Database, Eye, Ban, FileText, UserCheck, WifiOff, Megaphone, Info, Check } from 'lucide-react'
import { Logo, Mono, Status, initials } from '../../components/ui.jsx'
import { demoWorker as w, notices, offers, languages } from '../../data/demo.js'
import { useWk, useTone, TopBar, Sheet, QR } from './shell.jsx'
import { kindIcon, kindTone } from './Home.jsx'
import { langName } from './i18n.js'

/* ---------- Perks ---------- */
const USED = [
  { id: 'u1', merchant: '7-Eleven Sabah', title: 'RM3 off a RM30 prepaid reload', at: '7-Eleven Fajar Centre, Lahad Datu', when: '12 May 2027, 18:20' },
]

export function Perks() {
  const { t, toast } = useWk()
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [used, setUsed] = useState(USED)
  const live = offers.filter((o) => o.status === 'Live')
  const close = () => { setOpen(null); setConfirmed(false) }
  const code = open ? String(482913 + live.indexOf(open) * 104729).slice(-6) : ''
  const shopConfirms = () => {
    setConfirmed(true)
    setUsed((u) => [{ id: 'u-' + open.id, merchant: open.merchant, title: open.title, at: open.merchant === '7-Eleven Sabah' ? '7-Eleven Fajar Centre, Lahad Datu' : open.merchant + ', Lahad Datu', when: 'Today, 10:42' }, ...u.filter((x) => x.id !== 'u-' + open.id)])
    toast('The shop confirmed. Perk used.')
  }
  return (
    <div className="wk-page has-nav">
      <TopBar title={t.perks} back={false} />
      <div className="wk-pad">
        <div className="wk-perk-hero">
          <b>Thank you for paying on time</b>
          <p>Small savings from partner shops for workers who are up to date. Shops never see your record.</p>
        </div>
        <div className="seg wk-seg" role="tablist" aria-label="Perks">
          <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>All <span className="n">{live.length}</span></button>
          <button type="button" role="tab" aria-selected={tab === 'used'} onClick={() => setTab('used')}>Used <span className="n">{used.length}</span></button>
        </div>
        {tab === 'all' ? (
          <div className="wk-perks">
            {live.map((o) => (
              <article key={o.id} className="wk-perk">
                <Mono name={o.merchant} size="lg" />
                <div className="grow">
                  <small>{o.merchant}</small>
                  <b>{o.title}</b>
                  <span>{o.terms}</span>
                  <span className="ends"><Clock aria-hidden="true" /> Ends {o.ends}</span>
                </div>
                <button type="button" className="btn primary sm" onClick={() => setOpen(o)}>Show code</button>
              </article>
            ))}
          </div>
        ) : (
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
        )}
      </div>
      {open && (
        <Sheet title={open.title} onClose={close}>
          <div className="wk-code">
            <Mono name={open.merchant} size="lg" />
            <small>{open.merchant}</small>
            <h2>{open.title}</h2>
            <div className="qr"><QR seed={open.id} size={176} label={'Code for ' + open.title} /></div>
            <b className="digits num" aria-label={'Code ' + code.split('').join(' ')}>{code.slice(0, 3)} {code.slice(3)}</b>
            {confirmed
              ? <p className="wk-state ok" role="status"><CheckCircle2 aria-hidden="true" /> The shop confirmed at 10:42. This perk is now used.</p>
              : <p className="wk-state" role="status"><span className="pulse" aria-hidden="true" /> Waiting for the shop to scan</p>}
            <p className="wk-note"><Info aria-hidden="true" />Counts as used only after the shop confirms. If you close this before, you can use it later.</p>
            {!confirmed && <button type="button" className="wk-demo" onClick={shopConfirms}>Demo: the shop confirms</button>}
            <button type="button" className="btn outline lg block" onClick={() => { const c = confirmed; close(); if (c) setTab('used') }}>{confirmed ? 'See used perks' : 'Close'}</button>
          </div>
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
          {KINDS.map((k) => <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
        </div>
        <div className="wk-list">
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

/* ---------- Me: digital SCANS card ---------- */
export function Me() {
  useTone('light')
  const { lang, setLang, offline, setOffline, t } = useWk()
  const nav = useNavigate()
  return (
    <div className="wk-page has-nav">
      <section className="wk-mehead">
        <h1>{t.card}</h1>
        <div className="wk-idcard">
          <div className="top"><Logo light width={92} /><span>Contribution card</span></div>
          <div className="who">
            <span className="wk-av lg">{initials(w.name)}</span>
            <div className="grow"><b>{w.name}</b><small className="num">{w.scansId}</small></div>
          </div>
          <div className="qrwrap">
            <div className="qr"><QR seed="card" size={150} /></div>
            <div className="st">
              <span className="pill ok dot">Paid</span>
              <small>Paid up to</small><b>{w.paidThrough}</b>
              <small>Owing</small><b>None</b>
            </div>
          </div>
          <p className="note"><ShieldCheck aria-hidden="true" />Shows contribution status only. Not an immigration document.</p>
        </div>
        {offline && <p className="wk-stamp light"><WifiOff aria-hidden="true" />Works without a connection. Checked today at 08:12.</p>}
      </section>
      <div className="wk-pad">
        <div className="wk-card wk-kv">
          <div><span>Work permit (PLKS)</span><b className="num">{w.plks}</b></div>
          <div><span>Permit valid until</span><b>{w.permitExpiry}</b></div>
          <div><span>Passport</span><b className="num">{w.passport}</b></div>
          <div><span>Nationality</span><b>{w.nationality}</b></div>
          <div><span>Phone</span><b className="num">{w.phone}</b></div>
          <div><span>{t.employer}</span><b>{w.employer}</b></div>
        </div>
        <p className="wk-note"><Info aria-hidden="true" />Permit dates come from JIM and are shown for your information only. SCANS cannot change them.</p>

        <div className="wk-sec-h" id="language"><h2>Language</h2></div>
        <div className="wk-opts compact" role="radiogroup" aria-label="Language">
          {languages.map((l) => (
            <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} className="wk-opt" onClick={() => setLang(l.code)}>
              <span className="grow"><b>{l.label}</b></span><span className="radio" aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="wk-sec-h"><h2>More</h2></div>
        <div className="wk-list">
          <Link to="/worker/history" className="wk-li"><span className="wk-ico c-green"><Receipt aria-hidden="true" /></span><span className="tx"><b>{t.receipts}</b></span><ChevronRight className="chev" aria-hidden="true" /></Link>
          <Link to="/worker/help" className="wk-li"><span className="wk-ico c-purple"><LifeBuoy aria-hidden="true" /></span><span className="tx"><b>Help and complaints</b></span><ChevronRight className="chev" aria-hidden="true" /></Link>
          <Link to="/worker/privacy" className="wk-li"><span className="wk-ico c-navy"><Lock aria-hidden="true" /></span><span className="tx"><b>How we use your information</b></span><ChevronRight className="chev" aria-hidden="true" /></Link>
          <div className="wk-li"><span className="wk-ico c-orange"><WifiOff aria-hidden="true" /></span><span className="tx"><b>Try with no connection</b><small>Demo only</small></span><button type="button" className="switch" role="switch" aria-checked={offline} aria-label="Try with no connection" onClick={() => setOffline(!offline)} /></div>
          <button type="button" className="wk-li" onClick={() => nav('/login?portal=worker')}><span className="wk-ico"><LogOut aria-hidden="true" /></span><span className="tx"><b>Sign out</b></span><ChevronRight className="chev" aria-hidden="true" /></button>
        </div>
      </div>
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
