import { createContext, useContext, useEffect, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation, useParams, Routes, Route } from 'react-router-dom'
import { Home, Wallet, Gift, Bell, User, HelpCircle, ChevronRight, ScanLine, Camera, Check, ShieldCheck, Download, Share2, ArrowLeft, Receipt as ReceiptIcon } from 'lucide-react'
import { Logo, Status, useToast } from '../../components/ui.jsx'
import { demoWorker as w, workerPayments, notices, offers, languages, RATE, rm } from '../../data/demo.js'
import './worker.css'

/* A small dictionary for the parts of the app a worker sees first. The full app ships all six languages. */
const dict = {
  en: { hello: 'Good morning', due: 'Due for', pay: 'Pay', home: 'Home', perks: 'Perks', notices: 'Notices', me: 'Me', help: 'Help', paidUp: 'Paid up to', permit: 'Work permit', latest: 'Latest from the State', all: 'See all' },
  ms: { hello: 'Selamat pagi', due: 'Perlu dibayar untuk', pay: 'Bayar', home: 'Utama', perks: 'Ganjaran', notices: 'Notis', me: 'Saya', help: 'Bantuan', paidUp: 'Dibayar sehingga', permit: 'Permit kerja', latest: 'Terkini daripada Kerajaan Negeri', all: 'Lihat semua' },
  id: { hello: 'Selamat pagi', due: 'Tagihan untuk', pay: 'Bayar', home: 'Beranda', perks: 'Promo', notices: 'Pemberitahuan', me: 'Saya', help: 'Bantuan', paidUp: 'Lunas sampai', permit: 'Izin kerja', latest: 'Kabar terbaru dari Pemerintah Negeri', all: 'Lihat semua' },
  fil: { hello: 'Magandang umaga', due: 'Babayaran para sa', pay: 'Magbayad', home: 'Home', perks: 'Perks', notices: 'Abiso', me: 'Ako', help: 'Tulong', paidUp: 'Bayad hanggang', permit: 'Work permit', latest: 'Pinakabago mula sa Estado', all: 'Tingnan lahat' },
}
const LangCtx = createContext({ lang: 'id', t: dict.id, setLang: () => {} })
const useLang = () => useContext(LangCtx)

function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('scans-lang') || 'id' } catch { return 'id' }
  })
  const setLang = (l) => { setLangState(l); try { localStorage.setItem('scans-lang', l) } catch {} }
  return <LangCtx.Provider value={{ lang, setLang, t: dict[lang] || dict.en }}>{children}</LangCtx.Provider>
}

function WorkerShell({ children }) {
  const { t } = useLang()
  const loc = useLocation()
  useEffect(() => window.scrollTo(0, 0), [loc.pathname])
  const items = [
    { to: '/worker', label: t.home, icon: Home, end: true },
    { to: '/worker/pay', label: t.pay, icon: Wallet },
    { to: '/worker/perks', label: t.perks, icon: Gift },
    { to: '/worker/notices', label: t.notices, icon: Bell },
    { to: '/worker/me', label: t.me, icon: User },
  ]
  return (
    <div className="wk">
      <nav className="wk-nav" aria-label="App">
        <Link to="/" className="wk-brand" aria-label="SCANS home"><Logo light width={150} /></Link>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}><Icon size={22} strokeWidth={1.9} aria-hidden="true" /><span>{label}</span></NavLink>
        ))}
        <NavLink to="/worker/help" className="wk-help"><HelpCircle size={22} strokeWidth={1.9} aria-hidden="true" /><span>{t.help}</span></NavLink>
      </nav>
      <main className="wk-main">{children}</main>
    </div>
  )
}

function Back({ to = '/worker', label = 'Back' }) {
  return <Link to={to} className="wk-back"><ArrowLeft size={18} /> {label}</Link>
}

/* ---------- Onboarding ---------- */
function Onboarding() {
  const [step, setStep] = useState(0)
  const [agree, setAgree] = useState(false)
  const [scan, setScan] = useState('idle')
  const [face, setFace] = useState('idle')
  const { lang, setLang } = useLang()
  const nav = useNavigate()
  const next = () => setStep((s) => s + 1)
  const steps = ['Language', 'Rules', 'Passport', 'Face', 'Your record']
  useEffect(() => {
    if (scan === 'busy') { const id = setTimeout(() => setScan('done'), 1400); return () => clearTimeout(id) }
  }, [scan])
  useEffect(() => {
    if (face === 'busy') { const id = setTimeout(() => setFace('done'), 1600); return () => clearTimeout(id) }
  }, [face])
  return (
    <div className="wk-onb">
      <header className="wk-onb-top">
        <Link to="/" aria-label="SCANS home"><Logo width={132} /></Link>
        <span className="num" style={{ color: 'var(--muted)', fontSize: 15 }}>Step {step + 1} of {steps.length}</span>
      </header>
      <div className="stepper" aria-hidden="true">{steps.map((s, i) => <span key={s} className={i <= step ? 'on' : ''} />)}</div>
      <section className="wk-onb-body">
        {step === 0 && <>
          <h1>Choose your language</h1>
          <p className="lead">Notices from the State will come in this language. You can change it later.</p>
          <div className="stack">
            {languages.map((l) => (
              <button key={l.code} className={'choice' + (lang === l.code ? ' on' : '')} onClick={() => setLang(l.code)}>
                <span className="grow">{l.label}</span>{lang === l.code && <Check size={20} />}
              </button>
            ))}
          </div>
          <button className="btn primary block lg" onClick={next}>Continue</button>
        </>}
        {step === 1 && <>
          <h1>Before you start</h1>
          <p className="lead">Read these six points. They are the rules of the contribution.</p>
          <ul className="rules">
            <li><b>RM100 a month.</b> You can also pay RM300 for three months or RM1,200 for a year.</li>
            <li><b>Pay by the 5th.</b> Use the app, cash at any 7-Eleven, or your employer if you agree to it.</li>
            <li><b>Paying late does not touch your permit.</b> SCANS cannot cancel permits, keep passports or stop you from travelling.</li>
            <li><b>Your employer cannot cut your wages for this</b> unless JTK Sabah has given them a written permit.</li>
            <li><b>The money goes to the State.</b> 70% to Kerajaan Negeri Sabah, 30% to run this service.</li>
            <li><b>You can complain.</b> Use Help in the app. We send it to the agency that can act on it.</li>
          </ul>
          <label className="agree"><input type="checkbox" className="check" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I have read the rules and agree to them</label>
          <button className="btn primary block lg" disabled={!agree} onClick={next}>I agree, continue</button>
        </>}
        {step === 2 && <>
          <h1>Scan your passport</h1>
          <p className="lead">Open your passport at the photo page and hold it inside the frame. We read the two lines at the bottom.</p>
          <div className={'scanbox' + (scan === 'done' ? ' ok' : '')} aria-live="polite">
            {scan === 'idle' && <><ScanLine size={40} /><span>Photo page goes here</span></>}
            {scan === 'busy' && <><span className="pulse" /><span>Reading the passport…</span></>}
            {scan === 'done' && <dl className="kv" style={{ width: '100%' }}>
              <dt>Name</dt><dd>{w.name.toUpperCase()}</dd><dt>Passport</dt><dd>{w.passport}</dd><dt>Nationality</dt><dd>{w.nationality}</dd>
            </dl>}
          </div>
          {scan !== 'done'
            ? <button className="btn primary block lg" onClick={() => setScan('busy')} disabled={scan === 'busy'}><Camera size={18} /> Scan passport</button>
            : <button className="btn primary block lg" onClick={next}>These details are right</button>}
          {scan === 'done' && <button className="btn quiet block" onClick={() => setScan('idle')}>Scan again</button>}
        </>}
        {step === 3 && <>
          <h1>Check it is you</h1>
          <p className="lead">Look at the camera and blink when asked. We compare your face with the passport photo through KDN.</p>
          <div className={'facebox' + (face === 'done' ? ' ok' : '')} aria-live="polite">
            <div className="ring">{face === 'done' ? <Check size={48} /> : <User size={64} strokeWidth={1.3} />}</div>
            <span>{face === 'idle' ? 'Remove your cap and glasses' : face === 'busy' ? 'Blink now…' : 'Matched with your passport'}</span>
          </div>
          {face !== 'done'
            ? <button className="btn primary block lg" onClick={() => setFace('busy')} disabled={face === 'busy'}>Start face check</button>
            : <button className="btn primary block lg" onClick={next}>Continue</button>}
        </>}
        {step === 4 && <>
          <h1>We found your record</h1>
          <p className="lead">This comes from the State’s registration records. If something is wrong, tell us and a person will check it. You can still use the app.</p>
          <div className="panel tint">
            <dl className="kv">
              <dt>Name</dt><dd>{w.name}</dd>
              <dt>SCANS ID</dt><dd className="num">{w.scansId}</dd>
              <dt>Work permit (PLKS)</dt><dd className="num">{w.plks}</dd>
              <dt>Permit valid until</dt><dd>{w.permitExpiry}</dd>
              <dt>Employer</dt><dd>{w.employer}</dd>
              <dt>Workplace</dt><dd>{w.site}</dd>
            </dl>
          </div>
          <button className="btn primary block lg" onClick={() => nav('/worker')}>Everything is right</button>
          <button className="btn quiet block" onClick={() => nav('/worker/help?topic=record')}>Something is wrong</button>
        </>}
      </section>
    </div>
  )
}

/* ---------- Home ---------- */
function WorkerHome() {
  const { t } = useLang()
  return (
    <div className="wk-page">
      <header className="wk-hello">
        <p>{t.hello},</p>
        <h1>{w.name.split(' ')[0]}</h1>
      </header>
      <section className="due">
        <div>
          <span className="due-label">{t.due} {w.due.month}</span>
          <span className="due-amt num">RM{w.due.amount}</span>
          <span className="due-sub">Pay by {w.due.dueDate}. You have no other amount owing.</span>
        </div>
        <Link to="/worker/pay" className="btn paper lg">{t.pay} RM{w.due.amount}</Link>
      </section>
      <section className="wk-facts">
        <div><span>{t.paidUp}</span><b>{w.paidThrough}</b></div>
        <div><span>{t.permit}</span><b>Valid to {w.permitExpiry}</b></div>
        <div><span>Employer</span><b>Borneo Palm Plantations</b></div>
      </section>
      <section>
        <div className="wk-sec-head"><h2>{t.latest}</h2><Link to="/worker/notices">{t.all}</Link></div>
        <div className="rows">
          {notices.slice(0, 3).map((n) => (
            <Link key={n.id} to={'/worker/notices/' + n.id} className="row wk-link">
              <div className="grow"><div className="t">{n.title}</div><div className="d">{n.from} · {n.date}</div></div>
              <ChevronRight size={18} color="#475b6f" />
            </Link>
          ))}
        </div>
      </section>
      <section className="wk-two">
        <Link to="/worker/history" className="wk-tile"><ReceiptIcon size={22} /><b>Receipts</b><span>3 payments</span></Link>
        <Link to="/worker/help" className="wk-tile"><HelpCircle size={22} /><b>Help and complaints</b><span>Answer in 2 working days</span></Link>
      </section>
    </div>
  )
}

/* ---------- Pay ---------- */
const plans = [
  { id: 'm', label: 'June 2027', months: 1 },
  { id: 'q', label: 'June to August 2027', months: 3 },
  { id: 'y', label: 'June 2027 to May 2028', months: 12 },
]
const mcode = { 'Touch ’n Go eWallet': 'TNG', 'DuitNow QR': 'DQR', 'Cash at 7-Eleven': '7E', Boost: 'BST', GrabPay: 'GRB', ShopeePay: 'SPY', 'FPX online banking': 'FPX' }
const methods = ['Touch ’n Go eWallet', 'DuitNow QR', 'Cash at 7-Eleven', 'Boost', 'GrabPay', 'ShopeePay', 'FPX online banking']

function Pay() {
  const [plan, setPlan] = useState('m')
  const [method, setMethod] = useState(methods[0])
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const p = plans.find((x) => x.id === plan)
  const total = p.months * RATE
  const go = () => {
    setBusy(true)
    setTimeout(() => nav('/worker/receipt/RCP-2706-121907', { state: { total, months: p.label, method } }), 1300)
  }
  return (
    <div className="wk-page">
      <Back />
      <h1 className="wk-title">Pay your contribution</h1>
      <section>
        <h2 className="wk-h2">What are you paying for?</h2>
        <div className="stack">
          {plans.map((x) => (
            <button key={x.id} className={'choice' + (plan === x.id ? ' on' : '')} onClick={() => setPlan(x.id)}>
              <span className="grow"><b style={{ display: 'block' }}>{x.months === 1 ? 'One month' : x.months === 3 ? 'Three months' : 'One year'}</b><span style={{ fontSize: 13, color: 'var(--muted)' }}>{x.label}</span></span>
              <span className="price">{rm(x.months * RATE)}</span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="wk-h2">How will you pay?</h2>
        <div className="methods">
          {methods.map((m) => (
            <button key={m} className={'choice' + (method === m ? ' on' : '')} onClick={() => setMethod(m)}>
              <span className="mlogo" aria-hidden="true">{mcode[m]}</span>
              <span className="grow">{m}</span>{method === m && <Check size={18} />}
            </button>
          ))}
        </div>
        {method === 'Cash at 7-Eleven' && <p className="callout" style={{ marginTop: 12 }}>Show this code at the counter: <b className="num">SCN 2706 4721 8</b>. The cashier keys it in and you get a printed slip and a receipt in the app.</p>}
      </section>
      <div className="paybar">
        <div><span style={{ color: 'var(--muted)', fontSize: 13 }}>Total</span><b className="num" style={{ display: 'block', fontSize: 24 }}>{rm(total, 2)}</b></div>
        <button className="btn primary lg" onClick={go} disabled={busy}>{busy ? 'Paying…' : method === 'Cash at 7-Eleven' ? 'Done, I paid at 7-Eleven' : `Pay ${rm(total)}`}</button>
      </div>
    </div>
  )
}

function Receipt() {
  const { id } = useParams()
  const loc = useLocation()
  const toast = useToast()
  const s = loc.state || { total: 100, months: 'June 2027', method: 'Touch ’n Go eWallet' }
  return (
    <div className="wk-page">
      <div className="paid-mark"><Check size={36} /></div>
      <h1 className="wk-title" style={{ textAlign: 'center' }}>Payment received</h1>
      <p className="lead" style={{ textAlign: 'center' }}>We sent this receipt to your phone by SMS too.</p>
      <div className="slip">
        <div className="slip-top"><Logo width={110} /><span className="num">{id}</span></div>
        <dl className="kv">
          <dt>Name</dt><dd>{w.name}</dd>
          <dt>SCANS ID</dt><dd className="num">{w.scansId}</dd>
          <dt>Paid for</dt><dd>{s.months}</dd>
          <dt>Paid with</dt><dd>{s.method}</dd>
          <dt>Date</dt><dd>4 Jun 2027, 08:41</dd>
        </dl>
        <div className="slip-total"><span>Amount</span><b className="num">{rm(s.total, 2)}</b></div>
      </div>
      <div className="wk-two">
        <button className="btn block" onClick={() => toast('Receipt saved to your phone')}><Download size={18} /> Save</button>
        <button className="btn block" onClick={() => toast('Share sheet opened')}><Share2 size={18} /> Share</button>
      </div>
      <Link to="/worker" className="btn primary block lg">Back to home</Link>
    </div>
  )
}

function History() {
  return (
    <div className="wk-page">
      <Back />
      <h1 className="wk-title">Receipts</h1>
      <div className="rows">
        {workerPayments.map((p) => (
          <div key={p.id} className="row">
            <div className="grow"><div className="t">{p.month}</div><div className="d">{p.method} · {p.date}{p.by !== w.name ? ' · paid by your employer' : ''}</div><div className="d num">{p.id}</div></div>
            <b className="num">{rm(p.amount)}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

function Perks() {
  const [code, setCode] = useState(null)
  const live = offers.filter((o) => o.status === 'Live')
  return (
    <div className="wk-page">
      <h1 className="wk-title">Perks</h1>
      <p className="lead">For workers who are up to date. Show the code at the shop; the shop scans it to use it.</p>
      <div className="stack">
        {live.map((o) => (
          <div key={o.id} className="perk">
            <div className="grow"><span className="d">{o.merchant}</span><b>{o.title}</b><span className="d">{o.terms} Ends {o.ends}.</span></div>
            <button className="btn sm primary" onClick={() => setCode(o)}>Show code</button>
          </div>
        ))}
      </div>
      {code && (
        <div className="sheetwrap" role="dialog" aria-modal="true" aria-label={code.title} onClick={() => setCode(null)}>
          <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
            <span className="d">{code.merchant}</span>
            <h2 style={{ fontSize: 22, margin: '4px 0 16px' }}>{code.title}</h2>
            <QR seed={code.id} />
            <p className="num" style={{ textAlign: 'center', fontWeight: 700, margin: '12px 0' }}>{code.id.toUpperCase()}-4721-8</p>
            <p className="callout">Waiting for the shop to scan. It counts as used only after the shop confirms.</p>
            <button className="btn block" style={{ marginTop: 12 }} onClick={() => setCode(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Notices() {
  return (
    <div className="wk-page">
      <h1 className="wk-title">Notices</h1>
      <div className="rows">
        {notices.map((n) => (
          <Link key={n.id} to={'/worker/notices/' + n.id} className="row wk-link">
            <div className="grow"><div className="t">{n.title}</div><div className="d">{n.kind} · {n.from} · {n.date}</div></div>
            <ChevronRight size={18} color="#475b6f" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function Notice() {
  const { id } = useParams()
  const n = notices.find((x) => x.id === id) || notices[0]
  return (
    <div className="wk-page">
      <Back to="/worker/notices" label="Notices" />
      <span className="d">{n.kind} · {n.from} · {n.date}</span>
      <h1 className="wk-title">{n.title}</h1>
      <p style={{ fontSize: 18, lineHeight: 1.6 }}>{n.body}</p>
      <p className="callout">This notice was sent in Bahasa Indonesia. <Link to="/worker/me">Change language</Link></p>
    </div>
  )
}

function Help() {
  const toast = useToast()
  const [sent, setSent] = useState(false)
  const [topic, setTopic] = useState(new URLSearchParams(useLocation().search).get('topic') === 'record' ? 'My details are wrong' : 'Payment problem')
  return (
    <div className="wk-page">
      <Back />
      <h1 className="wk-title">Help and complaints</h1>
      <p className="lead">Tell us what happened in your own language. We send it to the agency that can act on it and you can follow it here.</p>
      {!sent ? (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); setSent(true); toast('Complaint sent') }}>
          <div className="field"><label htmlFor="topic">What is it about?</label>
            <select id="topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {['Payment problem', 'My details are wrong', 'Wages or working hours', 'My passport is being kept', 'Housing', 'Something else'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="what">What happened?</label>
            <textarea id="what" className="input" required placeholder="Write or record a voice note. Any language is fine." />
          </div>
          <label className="agree"><input type="checkbox" className="check" /> Do not tell my employer my name</label>
          <button className="btn primary block lg">Send complaint</button>
        </form>
      ) : (
        <div className="panel tint">
          <Status>New</Status>
          <h2 style={{ fontSize: 20, marginTop: 10 }}>CMP-2706-0094 · {topic}</h2>
          <p className="sub" style={{ color: 'var(--muted)', marginTop: 6 }}>Sent today. You will get an answer within 2 working days. If it is about wages, housing or your passport, it goes to JTK Sabah.</p>
        </div>
      )}
      <section>
        <h2 className="wk-h2">Your earlier requests</h2>
        <div className="row"><div className="grow"><div className="t">Payment taken twice</div><div className="d">CMP-2605-0412 · refunded RM100 on 9 May 2027</div></div><Status>Resolved</Status></div>
      </section>
    </div>
  )
}

function QR({ seed = 'scans' }) {
  // A drawn stand-in for the real QR code, which the backend generates per worker.
  let h = 0; for (const c of seed + w.scansId) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const n = 25, cells = []
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8)
    if (finder) continue
    h = (h * 1103515245 + 12345) >>> 0
    if (h % 100 < 47) cells.push([x, y])
  }
  const F = ({ x, y }) => <g><rect x={x} y={y} width="7" height="7" fill="#0d2236" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="#0d2236" /></g>
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width="100%" style={{ maxWidth: 240, display: 'block', margin: '0 auto', background: '#fff' }} role="img" aria-label="Your SCANS code">
      {cells.map(([x, y]) => <rect key={x + '-' + y} x={x} y={y} width="1" height="1" fill="#0d2236" />)}
      <F x={0} y={0} /><F x={n - 7} y={0} /><F x={0} y={n - 7} />
    </svg>
  )
}

function Me() {
  const { lang, setLang } = useLang()
  return (
    <div className="wk-page">
      <h1 className="wk-title">My SCANS card</h1>
      <div className="card-id">
        <div className="ci-top"><Logo light width={120} /><span>Contribution record</span></div>
        <div className="ci-body">
          <div className="ci-photo" aria-hidden="true"><User size={44} strokeWidth={1.3} /></div>
          <div><b style={{ fontSize: 20 }}>{w.name}</b><div className="num">{w.scansId}</div><Status>Paid</Status></div>
        </div>
        <QR />
        <p className="ci-note">This card shows your contribution status only. It is not an immigration document.</p>
      </div>
      <section className="panel tint">
        <dl className="kv">
          <dt>Work permit (PLKS)</dt><dd className="num">{w.plks}</dd>
          <dt>Permit valid until</dt><dd>{w.permitExpiry}</dd>
          <dt>Passport</dt><dd className="num">{w.passport}</dd>
          <dt>Phone</dt><dd className="num">{w.phone}</dd>
          <dt>Employer</dt><dd>{w.employer}</dd>
        </dl>
      </section>
      <section>
        <h2 className="wk-h2">Language</h2>
        <select className="input" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
          {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </section>
      <section className="rows">
        <Link to="/worker/history" className="row wk-link"><span className="grow t">Receipts</span><ChevronRight size={18} /></Link>
        <Link to="/worker/help" className="row wk-link"><span className="grow t">Help and complaints</span><ChevronRight size={18} /></Link>
        <Link to="/worker/privacy" className="row wk-link"><span className="grow t">How we use your information</span><ShieldCheck size={18} /></Link>
      </section>
    </div>
  )
}

function Privacy() {
  return (
    <div className="wk-page">
      <Back to="/worker/me" label="My SCANS card" />
      <h1 className="wk-title">How we use your information</h1>
      <div className="stack prose">
        <p>Your record belongs to Kerajaan Negeri Sabah. Microtek runs the service for the State and may only use it to run SCANS.</p>
        <p>We keep your name, passport and permit details, your payments, the notices sent to you and your complaints. We check your identity once with KDN when you sign up.</p>
        <p>Only staff whose work needs it can open your record, and every time they do, it is written in a log the State’s auditors read.</p>
        <p>We never sell your information or use it for advertising. Perks are offered by shops but shops never see your record.</p>
      </div>
    </div>
  )
}

export default function WorkerApp() {
  return (
    <LangProvider>
      <Routes>
        <Route path="start" element={<Onboarding />} />
        <Route path="*" element={
          <WorkerShell>
            <Routes>
              <Route index element={<WorkerHome />} />
              <Route path="pay" element={<Pay />} />
              <Route path="receipt/:id" element={<Receipt />} />
              <Route path="history" element={<History />} />
              <Route path="perks" element={<Perks />} />
              <Route path="notices" element={<Notices />} />
              <Route path="notices/:id" element={<Notice />} />
              <Route path="help" element={<Help />} />
              <Route path="me" element={<Me />} />
              <Route path="privacy" element={<Privacy />} />
            </Routes>
          </WorkerShell>
        } />
      </Routes>
    </LangProvider>
  )
}
