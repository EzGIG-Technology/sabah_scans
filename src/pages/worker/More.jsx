import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Wallet, Download, Sun, WifiOff, Info, ChevronDown, UserCheck, Sparkles, RotateCcw, Mic, Send, Receipt, CalendarClock, Building2, PenLine, Megaphone, Store, ArrowLeft, Lock } from 'lucide-react'
import { Logo } from '../../components/ui.jsx'
import { demoWorker as w, employers, notices, daysFromDemo } from '../../data/demo.js'
import { useWk, useTone, TopBar, QR } from './shell.jsx'
import { CopyId, DaysRing } from './kit.jsx'
import { langName } from './i18n.js'
import { period, DUE_IDX } from './account.js'

const PERMIT_DAYS = daysFromDemo(2028, 2, 14)
const EMP = employers.find((e) => e.id === w.employerId)
const DOB = '12 Feb 1991'

/* =====================================================================
   /worker/card  The SCANS card as a full-screen pass
   ===================================================================== */
export function CardPass() {
  useTone('light')
  const { toast, offline, acct } = useWk()
  const owing = acct.owed > 1 ? (acct.owed - 1) + (acct.owed === 2 ? ' month' : ' months') + ' · ' + period(acct.first, DUE_IDX - 1) : 'None'
  return (
    <div className="wk-page wk-pass-page">
      <header className="wk-pass-head">
        <TopBarLight title="My SCANS card" sub="Kad SCANS" back="/worker/me" />
      </header>
      <div className="wk-pad wk-pass-wrap">
        <article className="wk-pass" aria-label="SCANS contribution card">
          <div className="wk-pass-top">
            <span className="eyebrow">SCANS contribution card</span>
            <b>{w.name.toUpperCase()}</b>
            <span className="chips">
              <span>{w.nationality}</span><span>{w.sector}</span><span>Paid to {acct.paidThrough}</span>
            </span>
          </div>
          <div className="wk-pass-qr">
            <QR seed="card" size={196} label={'SCANS code for ' + w.name + '. Shows contribution status only.'} />
          </div>
          <p className="wk-verified"><ShieldCheck aria-hidden="true" /> Contribution recorded · checked today 08:12</p>
          <dl className="wk-pass-grid">
            <div><dt>SCANS ID</dt><dd className="num">{w.scansId} <CopyId value={w.scansId} label="Copy SCANS ID" /></dd></div>
            <div><dt>Paid up to</dt><dd>{acct.paidThrough}</dd></div>
            <div><dt>Earlier months owing</dt><dd>{owing}</dd></div>
            <div><dt>Due now</dt><dd>{acct.owed ? w.due.month + ' · RM100' : 'Nothing'}</dd></div>
          </dl>
        </article>
        <div className="wk-two">
          <button type="button" className="btn outline lg" onClick={() => toast('Added to your phone wallet')}><Wallet aria-hidden="true" /> Add to wallet</button>
          <button type="button" className="btn outline lg" onClick={() => toast('Card saved as PDF')}><Download aria-hidden="true" /> Save PDF</button>
        </div>
        <p className="wk-note"><ShieldCheck aria-hidden="true" /><span><b>Shows contribution status only. Not an immigration document.</b> Whoever scans it sees your name, SCANS ID and whether you have paid. Never your passport, permit or employer.</span></p>
        <p className="wk-note"><Sun aria-hidden="true" />Turn your screen brightness up so the code scans easily.</p>
        {offline && <p className="wk-note warn"><WifiOff aria-hidden="true" />No connection. The card still works. Status checked today at 08:12.</p>}
      </div>
    </div>
  )
}

function TopBarLight({ title, sub, back }) {
  const nav = useNavigate()
  return (
    <div className="wk-top light">
      <button type="button" className="wk-ib glass" aria-label="Back" onClick={() => nav(back)}><ArrowLeft aria-hidden="true" /></button>
      <div className="wk-top-t"><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      <span className="wk-ib-sp" />
    </div>
  )
}

/* =====================================================================
   /worker/details  Permit, personal and employer details (Figma "Permit details")
   ===================================================================== */
export function Details() {
  const { t, acct } = useWk()
  return (
    <div className="wk-page has-nav">
      <TopBar title={t.details} back="/worker/me" />
      <div className="wk-pad">
        <div className="wk-card wk-det-status">
          <DaysRing days={PERMIT_DAYS} label={PERMIT_DAYS + ' days left on your work permit'} />
          <div className="grow">
            <span className={'pill dot ' + (acct.owed > 1 ? 'warn' : 'ok')}>Contribution paid to {acct.paidThrough}</span>
            <b>Work permit valid until {w.permitExpiry}</b>
            <small>For your information only. Paying late never affects your permit.</small>
          </div>
        </div>

        <section className="wk-card wk-det">
          <h2><CalendarClock aria-hidden="true" /> Work permit</h2>
          <dl>
            <div><dt>PLKS number</dt><dd className="num">{w.plks}</dd></div>
            <div><dt>Pass</dt><dd>Temporary Employment Visit Pass (PLKS)</dd></div>
            <div><dt>Sector</dt><dd>{w.sector}</dd></div>
            <div><dt>Valid until</dt><dd>{w.permitExpiry}</dd></div>
          </dl>
          <p className="wk-src-line"><span className="pill grey">From JIM, read only</span> SCANS cannot change or cancel a permit.</p>
        </section>

        <section className="wk-card wk-det">
          <h2><UserCheck aria-hidden="true" /> About you</h2>
          <dl>
            <div><dt>Full name</dt><dd>{w.name}</dd></div>
            <div><dt>SCANS ID</dt><dd className="num">{w.scansId}</dd></div>
            <div><dt>Passport</dt><dd className="num">{w.passport}</dd></div>
            <div><dt>Nationality</dt><dd>{w.nationality}</dd></div>
            <div><dt>Date of birth</dt><dd>{DOB}</dd></div>
            <div><dt>Job</dt><dd>{w.role}</dd></div>
            <div><dt>Phone</dt><dd className="num">{w.phone}</dd></div>
            <div><dt>Language</dt><dd>{w.language}</dd></div>
          </dl>
          <p className="wk-src-line"><span className="pill grey">From SWIMS, Sabah State</span></p>
        </section>

        <section className="wk-card wk-det">
          <h2><Building2 aria-hidden="true" /> Employer</h2>
          <dl>
            <div><dt>Company</dt><dd>{w.employer}</dd></div>
            <div><dt>Registration (SSM)</dt><dd className="num">{EMP?.ssm}</dd></div>
            <div><dt>Workplace</dt><dd>{w.site}</dd></div>
            <div><dt>District</dt><dd>{w.district}</dd></div>
          </dl>
          <p className="wk-src-line"><span className="pill grey">From eNORES, JTK Sabah</span> Your employer sees only whether you have paid.</p>
        </section>

        <Link to="/worker/help?topic=record" className="btn outline lg block">Something is wrong</Link>
        <p className="wk-note"><UserCheck aria-hidden="true" />A person checks it by hand. This is a manual review, never a rejection, and you can keep using the app.</p>
      </div>
    </div>
  )
}

/* =====================================================================
   /worker/faq  About SCANS and common questions
   ===================================================================== */
const FAQ = [
  ['How much do I pay?', 'RM100 a month. You can also pay RM300 for three months or RM1,200 for a year. Pay by the 5th of each month.'],
  ['What happens if I pay late?', 'You get reminders by SMS and in the app. Paying late never affects your permit, your passport or your travel. SCANS has no way to do any of that.'],
  ['Can my employer pay for me?', 'Yes, but only if you agree. Your employer can take it from your wages only with a written permit from JTK Sabah under Labour Ordinance s.113(4), and only with your consent.'],
  ['Where does my money go?', 'Straight into the FWECF account held by Jabatan Kewangan Negeri Sabah. 70% stays with the State and 30% pays for running SCANS. SCANS never holds the money.'],
  ['Is the SCANS card an immigration document?', 'No. It shows your contribution status only. Signing up for SCANS is not an immigration check and does not decide your status in Malaysia.'],
  ['Who can see my record?', 'Only staff whose work needs it, and every view is logged. Your employer sees only whether you have paid. Shops never see your record.'],
  ['My details are wrong. What do I do?', 'Go to Help and choose “My details are wrong”. A person checks it by hand within 3 working days. It is never a rejection.'],
  ['I lost my phone.', 'Sign in on a new phone with your phone number. Your receipts and card come back. If your number changed, use Help from any phone or ask at a 7-Eleven counter for the SCANS helpline.'],
  ['How do perks work?', 'Perks are small savings at partner shops. Show the code at the counter. A perk counts as used only after the shop confirms it.'],
]

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <div className="wk-page has-nav">
      <TopBar title="Questions" back="/worker/me" />
      <div className="wk-pad">
        <article className="wk-about">
          <div className="ph" style={{ backgroundImage: 'url(/img/portal-worker.jpg)' }} />
          <div className="tx">
            <span className="wk-eyebrow"><Logo width={70} /></span>
            <h2>About SCANS</h2>
            <p>Kerajaan Negeri Sabah runs SCANS to collect the Foreign Worker Economic Contribution from workers who hold a PLKS. It gives you one place to pay, keep your receipts and hear from the State in your language.</p>
          </div>
        </article>
        <div className="wk-faq">
          {FAQ.map(([q, a], i) => (
            <section key={q} className={'wk-faq-i' + (open === i ? ' open' : '')}>
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'faq-' + i} id={'faq-q-' + i} onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{q}</span><ChevronDown aria-hidden="true" />
                </button>
              </h3>
              <div id={'faq-' + i} role="region" aria-labelledby={'faq-q-' + i} hidden={open !== i}><p>{a}</p></div>
            </section>
          ))}
        </div>
        <Link to="/worker/assistant" className="wk-li single"><span className="wk-ico c-purple"><Sparkles aria-hidden="true" /></span><span className="tx"><b>Ask the assistant</b><small>Preview. It explains, it never changes anything.</small></span></Link>
        <Link to="/worker/help" className="btn outline lg block">Still need help? Write to us</Link>
      </div>
    </div>
  )
}

/* =====================================================================
   /worker/assistant  Multilingual assistant (PREVIEW, not yet approved)
   Rule (SCANS_HANDOFF.md §10.5): it can suggest and explain, never change
   a worker's status, permit or payment. Answers here are scripted.
   ===================================================================== */
const SUGGEST = [
  { id: 'due', icon: Receipt, t: 'Explain my December payment', s: 'What I owe and by when' },
  { id: 'cash', icon: Store, t: 'How do I pay at 7-Eleven?', s: 'Cash with a counter code' },
  { id: 'employer', icon: Building2, t: 'What can my employer see?', s: 'And when they can pay for me' },
  { id: 'permit', icon: CalendarClock, t: 'Does paying late affect my permit?', s: 'In plain words' },
  { id: 'notice', icon: Megaphone, t: 'Explain the latest notice', s: notices[0].title },
  { id: 'complain', icon: PenLine, t: 'Help me write a complaint', s: 'I will send it myself' },
]

const ANSWERS = {
  due: { a: `Your December 2027 contribution is RM${w.due.amount}, due by ${w.due.dueDate}. You have paid up to ${w.paidThrough} and owe nothing from earlier months. You can pay in the app, with cash at any 7-Eleven, or your employer can pay if you agree.`, go: [['Go to Pay', '/worker/pay']] },
  cash: { a: 'In Pay, choose “Cash at 7-Eleven” and tap “Get counter code”. Show the code at any 7-Eleven in Sabah and pay the cashier. Keep the printed slip. Your receipt appears in the app within a minute.', go: [['Go to Pay', '/worker/pay']] },
  employer: { a: 'Your employer sees only whether you have paid. They cannot see your complaints, your perks or your passport. They can pay for you only if you agree, and can take it from your wages only with a written permit from JTK Sabah.', go: [['How we use your information', '/worker/privacy']] },
  permit: { a: 'No. Paying late never affects your permit, your passport or your travel. SCANS cannot cancel permits or keep passports. If you are late you get reminders, that is all.', go: [['See my details', '/worker/details']] },
  notice: { a: `“${notices[0].title}” from ${notices[0].from}. In short: ${notices[0].body}`, go: [['Open the notice', '/worker/notices/' + notices[0].id]] },
  complain: { a: 'Tell me what happened in a few words and I will suggest how to write it. You send it yourself from Help, in any language, and you can keep your name hidden from your employer.', go: [['Open Help', '/worker/help']] },
  action: { a: 'I cannot do that. I can only explain and suggest. I cannot pay, change your record, your permit or your payments. You can do it yourself here, or a person in Help can.', go: [['Pay', '/worker/pay'], ['Help', '/worker/help']] },
  other: { a: 'I am not sure about that one. I can explain payments, receipts, your SCANS card, notices and perks. For anything else, a person answers in Help, usually within 2 working days.', go: [['Open Help', '/worker/help'], ['Questions', '/worker/faq']] },
}

function classify(text) {
  const s = text.toLowerCase()
  if (/\b(change|cancel|update|delete|pay for me|refund|renew|extend|remove|edit)\b/.test(s)) return 'action'
  if (/7-?eleven|cash|counter/.test(s)) return 'cash'
  if (/permit|plks|passport|deport|immigration|late/.test(s)) return 'permit'
  if (/employer|boss|wage|salary|majikan/.test(s)) return 'employer'
  if (/notice|announcement|news/.test(s)) return 'notice'
  if (/complain|problem|report|help/.test(s)) return 'complain'
  if (/pay|due|owe|june|bayar|amount|rm/.test(s)) return 'due'
  return 'other'
}

export function Assistant() {
  const { lang, offline, toast } = useWk()
  const nav = useNavigate()
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [msgs, typing])

  const ask = (q, key) => {
    if (offline || typing) return
    setMsgs((m) => [...m, { me: true, text: q }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { me: false, key: key || classify(q) }])
    }, 900)
  }
  const submit = (e) => { e.preventDefault(); const q = text.trim(); if (!q) return; setText(''); ask(q) }

  return (
    <div className="wk-page wk-chat">
      <header className="wk-chat-head">
        <button type="button" className="wk-ib" aria-label="Back" onClick={() => nav(-1)}><ArrowLeft aria-hidden="true" /></button>
        <span className="wk-chat-av" aria-hidden="true"><Sparkles /></span>
        <div className="grow"><b>SCANS assistant</b><small><span className="pill warn">Preview</span> Not yet approved</small></div>
        <button type="button" className="wk-ib" aria-label="Start again" onClick={() => { setMsgs([]); setTyping(false) }}><RotateCcw aria-hidden="true" /></button>
      </header>
      <div className="wk-pad wk-chat-body" aria-live="polite">
        <div className="wk-chat-hero">
          <div className="bubble">
            <b>Hello {w.name.split(' ')[0]}.</b> I can explain your contribution, receipts, card and notices. I cannot change anything on your record.
          </div>
          <span className="tag"><Lock aria-hidden="true" /> Explains and suggests only</span>
        </div>
        <p className="wk-note warn"><Info aria-hidden="true" /><span><b>This is a preview.</b> Answers are suggestions and may be wrong. The assistant cannot pay, change your status, your permit or your payments. In the real build it answers in {langName[lang]}.</span></p>

        {msgs.length === 0 && (
          <div className="wk-list">
            {SUGGEST.map((s) => (
              <button key={s.id} type="button" className="wk-li" onClick={() => ask(s.t, s.id)} disabled={offline}>
                <span className="wk-ico"><s.icon aria-hidden="true" /></span>
                <span className="tx"><b>{s.t}</b><small>{s.s}</small></span>
              </button>
            ))}
          </div>
        )}

        {msgs.map((m, i) => m.me
          ? <p key={i} className="wk-msg me">{m.text}</p>
          : (
            <div key={i} className="wk-msg bot">
              <p>{ANSWERS[m.key].a}</p>
              <div className="go">{ANSWERS[m.key].go.map(([l, to]) => <Link key={to} to={to} className="btn outline sm">{l}</Link>)}</div>
              <small>Suggestion only · check the details in the app</small>
            </div>
          ))}
        {typing && <p className="wk-msg bot typing" aria-label="The assistant is writing"><i /><i /><i /></p>}
        {msgs.length > 0 && !typing && (
          <div className="wk-chips">
            {SUGGEST.filter((s) => !msgs.some((m) => m.key === s.id)).slice(0, 3).map((s) => <button key={s.id} type="button" className="chip" onClick={() => ask(s.t, s.id)}>{s.t}</button>)}
          </div>
        )}
        <div ref={end} />
      </div>
      <form className="wk-chat-in" onSubmit={submit}>
        <button type="button" className="wk-ib" aria-label="Speak instead" onClick={() => toast('Voice is not in the preview yet')}><Mic aria-hidden="true" /></button>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={offline ? 'You are offline' : 'Ask about payments, receipts, notices'} aria-label="Ask the assistant" disabled={offline} />
        <button type="submit" className="wk-send" aria-label="Send" disabled={offline || !text.trim()}><Send aria-hidden="true" /></button>
      </form>
    </div>
  )
}
