import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Check, CheckCircle2, X, Download, Share2, Store, Clock, WifiOff, LifeBuoy, RotateCcw, ShieldCheck, Lock, Receipt as ReceiptIcon, ChevronRight, Building2, Info, AlertCircle } from 'lucide-react'
import { Logo } from '../../components/ui.jsx'
import { demoWorker as w, workerPayments, RATE, rm } from '../../data/demo.js'
import { useWk, useTone, TopBar } from './shell.jsx'
import { PLAN_DEFS, planFor, monthName, period, DUE_IDX } from './account.js'

// A payment period always starts at the first month not yet paid, so arrears
// are cleared first. English labels go on the summary and the receipt.
export function buildPlan(id, acct, lang = 'en') {
  const d = planFor(id)
  const last = acct.first + d.months - 1
  return {
    ...d,
    total: d.months * RATE,
    label: period(acct.first, last, 'en'),
    localLabel: period(acct.first, last, lang),
    upTo: monthName(last),
    stillOwed: Math.max(0, acct.owed - d.months),
  }
}
const ENGLISH_NAME = { m: 'Monthly', q: '3 months', y: 'Annually' }
// Smallest period that clears what is owed, or the worker's usual one if longer.
const coverPlan = (owed, saved) => {
  const s = planFor(saved)
  if (s.months >= owed) return s.id
  return (PLAN_DEFS.find((p) => p.months >= owed) || PLAN_DEFS[PLAN_DEFS.length - 1]).id
}
const savedPlan = () => { try { return localStorage.getItem('scans-plan') || 'm' } catch { return 'm' } }

// Payment marks: real images where we have them, a lettered tile otherwise.
export const METHODS = [
  { id: 'tng', name: 'Touch ’n Go eWallet', group: 'E-wallet', tile: { t: 'TNG', bg: '#005ABB' } },
  { id: 'duitnow', name: 'DuitNow QR', group: 'Bank', img: ['/img/pay/duitnow.png'], note: 'Any Malaysian bank app' },
  { id: 'cash', name: 'Cash at 7-Eleven', group: 'Cash', tile: { t: '7E', bg: '#0E8F57' }, note: 'Show a code at the counter' },
  { id: 'boost', name: 'Boost', group: 'E-wallet', tile: { t: 'B', bg: '#E4002B' } },
  { id: 'grab', name: 'GrabPay', group: 'E-wallet', tile: { t: 'G', bg: '#00A651' } },
  { id: 'shopee', name: 'ShopeePay', group: 'E-wallet', tile: { t: 'S', bg: '#EE4D2D' } },
  { id: 'fpx', name: 'FPX online banking', group: 'Bank', img: ['/img/pay/fpx.png'], note: 'Pay from your bank account' },
  { id: 'card', name: 'Debit or credit card', group: 'Card', img: ['/img/pay/visa.png', '/img/pay/mastercard.png'], note: 'Visa or Mastercard' },
]

export function MethodMark({ m }) {
  if (m.img) return <span className={'wk-mark img' + (m.img.length > 1 ? ' two' : '')}>{m.img.map((s) => <img key={s} src={s} alt="" />)}</span>
  if (m.tile) return <span className="wk-mark" style={{ background: m.tile.bg }}>{m.tile.t}</span>
  return <span className="wk-mark" style={{ background: 'var(--blue)' }}><ReceiptIcon aria-hidden="true" /></span>
}
const GROUPS = ['E-wallet', 'Bank', 'Cash', 'Card']
const GROUP_LABEL = { 'E-wallet': 'E-wallets', Bank: 'Bank and DuitNow', Cash: 'Cash', Card: 'Cards' }
const markFor = (name) => METHODS.find((m) => m.name === name) || (name === 'Employer bulk payment' ? { tile: { t: 'BP', bg: '#13407A' } } : {})

const NEW_ID = 'RCP-2706-121907'
const COUNTER = 'SCN 2706 4721 8'

export default function Pay() {
  const loc = useLocation()
  const nav = useNavigate()
  const { offline, acct, setPaidIdx, t, tf, lang } = useWk()
  const demo = new URLSearchParams(loc.search).get('demo')
  const [plan, setPlan] = useState(() => coverPlan(demo === 'arrears' ? 3 : acct.owed, savedPlan()))
  const [method, setMethod] = useState('tng')
  const [fail, setFail] = useState(demo === 'fail')
  const [phase, setPhase] = useState('choose') // choose | cash | processing | success | failed
  const [done, setDone] = useState(null) // what was paid, kept for the success screen and receipt
  useEffect(() => {
    const d = new URLSearchParams(loc.search).get('demo')
    setPhase('choose'); setFail(d === 'fail')
    if (d === 'arrears') setPlan(coverPlan(3, savedPlan()))
  }, [loc.search])

  const p = buildPlan(plan, acct, lang)
  const m = METHODS.find((x) => x.id === method)
  const total = p.total
  useTone(phase === 'success' ? 'light' : 'dark')

  const receiptState = { total, months: p.label, method: m.name, upTo: p.upTo, plan: ENGLISH_NAME[p.id] }

  useEffect(() => {
    if (phase !== 'processing') return
    const id = setTimeout(() => {
      if (fail) { setPhase('failed'); setFail(false); return }
      setDone(receiptState)
      setPaidIdx(acct.first + p.months - 1)
      setPhase('success')
    }, 1900)
    return () => clearTimeout(id)
    // receiptState is rebuilt every render; the timer only needs the phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, fail])

  if (phase === 'processing') return (
    <div className="wk-page wk-center">
      <div className="wk-spin" aria-hidden="true"><MethodMark m={m} /></div>
      <h1 className="wk-h1 center" role="status">Waiting for {m.id === 'cash' ? 'the cashier' : m.name}</h1>
      <p className="wk-lead center">{m.id === 'cash' ? 'The cashier is confirming your cash payment.' : m.id === 'card' || m.id === 'fpx' ? 'Finish the payment on your bank’s page.' : `Confirm ${rm(total)} in the ${m.name} app.`} Do not close this screen.</p>
      <p className="wk-secure"><Lock aria-hidden="true" />Paid through a licensed payment acquirer straight to the State’s FWECF account.</p>
    </div>
  )

  if (phase === 'success' && done) return (
    <div className="wk-page wk-success">
      <div className="wk-success-top">
        <div className="wk-done-mark"><Check aria-hidden="true" /></div>
        <h1>Payment received</h1>
        <b className="num">{rm(done.total, 2)}</b>
        <p>{done.months} · {done.method}</p>
      </div>
      <div className="wk-pad">
        <div className="wk-card wk-kv">
          <div><span>Receipt</span><b className="num">{NEW_ID}</b></div>
          <div><span>Period</span><b>{done.plan} · {done.months}</b></div>
          <div><span>Paid up to</span><b>{done.upTo}</b></div>
          <div><span>Date</span><b>4 Jun 2027, 08:41</b></div>
          <div><span>Sent to</span><b>Your phone by SMS</b></div>
        </div>
        <div className="wk-foot static">
          <button type="button" className="btn primary lg block" onClick={() => nav('/worker/receipt/' + NEW_ID, { state: done })}><ReceiptIcon aria-hidden="true" /> See receipt</button>
          <Link to="/worker" className="btn ghost block">Back to home</Link>
        </div>
      </div>
    </div>
  )

  if (phase === 'failed') return (
    <div className="wk-page wk-center">
      <div className="wk-done-mark bad"><X aria-hidden="true" /></div>
      <h1 className="wk-h1 center">Payment did not go through</h1>
      <p className="wk-lead center">No money was taken from your account. {m.name} did not confirm the payment in time.</p>
      <div className="wk-card wk-kv one">
        <div><span>Amount</span><b className="num">{rm(total, 2)} · not paid</b></div>
        <div><span>If you see a charge</span><b>It is returned to you within 3 working days</b></div>
      </div>
      <div className="wk-foot static">
        <button type="button" className="btn primary lg block" onClick={() => setPhase('processing')}><RotateCcw aria-hidden="true" /> Try again</button>
        <button type="button" className="btn ghost block" onClick={() => setPhase('choose')}>Choose another way to pay</button>
        <Link to="/worker/help" className="btn ghost block"><LifeBuoy aria-hidden="true" /> Get help</Link>
      </div>
    </div>
  )

  if (phase === 'cash') return (
    <div className="wk-page has-bar">
      <TopBar title="Pay at 7-Eleven" onBack={() => setPhase('choose')} />
      <div className="wk-pad">
        <div className="wk-counter">
          <span className="lbl">Show this at the counter</span>
          <b className="num">{COUNTER}</b>
          <div className="wk-barcode" aria-hidden="true">{Array.from({ length: 46 }, (_, i) => <i key={i} style={{ width: [1, 2, 3, 1, 2][(i * 7) % 5] + 'px' }} />)}</div>
          <span className="amt num">{rm(total, 2)} · {p.label}</span>
        </div>
        <ol className="wk-steps">
          <li><b>Go to any 7-Eleven in Sabah</b><span>The code works until 5 Jun 2027.</span></li>
          <li><b>Show the code and pay {rm(total)} in cash</b><span>The cashier scans or keys in the code.</span></li>
          <li><b>Keep the printed slip</b><span>Your receipt also appears in the app within a minute.</span></li>
        </ol>
      </div>
      <div className="wk-paybar">
        <div className="grow"><span>Total</span><b className="num">{rm(total, 2)}</b></div>
        <button type="button" className="btn primary lg" onClick={() => setPhase('processing')}>The cashier scanned it</button>
      </div>
    </div>
  )

  return (
    <div className="wk-page has-bar">
      <TopBar title="Pay contribution" sub={`${w.name} · ${w.scansId}`} />
      <div className="wk-pad">
        <section className="wk-amtcard" aria-label={t.amountDue}>
          <div className="strip"><Logo width={92} /><span className="num">{w.scansId}</span></div>
          <div className="body">
            <span className="cur" aria-hidden="true">RM</span>
            <div className="grow">
              <span className="lbl">{t.amountDue}</span>
              <b className="num">RM{acct.amount.toLocaleString('en-MY')}</b>
              <span className="sub">{acct.owed ? tf('forM', { m: period(acct.first, DUE_IDX, lang) }) : t.nothingDue}</span>
              {acct.owed > 1 && <span className="wk-duepill over"><AlertCircle aria-hidden="true" />{tf('monthsDue', { n: acct.owed })}</span>}
              {acct.owed === 1 && <span className="wk-duepill due"><Clock aria-hidden="true" />{t.oneMonthDue}</span>}
              {acct.owed === 0 && <span className="wk-duepill ok"><CheckCircle2 aria-hidden="true" />{tf('noArrears', { m: monthName(acct.paidIdx, lang) })}</span>}
            </div>
          </div>
        </section>
        {acct.owed > 1 && <p className="wk-note"><Info aria-hidden="true" />Owing months never affect your permit or passport. Pay when you can; the oldest month is cleared first.</p>}

        <h2 className="wk-h2">{t.payFreq}</h2>
        <div className="wk-freq" role="radiogroup" aria-label={t.payFreq}>
          {PLAN_DEFS.map((d) => {
            const x = buildPlan(d.id, acct, lang)
            return (
              <button key={x.id} type="button" role="radio" aria-checked={plan === x.id} className="wk-freq-opt" onClick={() => setPlan(x.id)}>
                <span className="grow"><b>{t[x.key]}</b><small>{x.localLabel}</small></span>
                <b className="amt num">{rm(x.total)}</b>
                <span className="radio" aria-hidden="true" />
              </button>
            )
          })}
        </div>
        <p className="wk-hint">{p.label}. Paid up to {p.upTo} after this.{p.stillOwed > 0 && ` ${p.stillOwed} ${p.stillOwed === 1 ? 'month' : 'months'} still owing after this.`}</p>

        <h2 className="wk-h2">How will you pay?</h2>
        {GROUPS.map((g) => (
          <section key={g} className="wk-mgroup">
            <h3 id={'mg-' + g}>{GROUP_LABEL[g]}</h3>
            <div className="wk-methods" role="radiogroup" aria-labelledby={'mg-' + g}>
              {METHODS.filter((x) => x.group === g).map((x) => (
                <button key={x.id} type="button" role="radio" aria-checked={method === x.id} className="wk-method" onClick={() => setMethod(x.id)}>
                  <MethodMark m={x} />
                  <span className="grow"><b>{x.name}</b>{x.note && <small>{x.note}</small>}</span>
                  <span className="radio" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="wk-card wk-summary">
          <h3>Summary</h3>
          <div><span>Contribution · {p.months} × {rm(RATE)}</span><b className="num">{rm(total, 2)}</b></div>
          <div><span>Period</span><b>{ENGLISH_NAME[p.id]} · {p.label}</b></div>
          <div><span>Paid with</span><b>{m.name}</b></div>
          <div className="tot"><span>Total</span><b className="num">{rm(total, 2)}</b></div>
        </div>

        {method === 'cash' && <p className="wk-note"><Store aria-hidden="true" />You get a counter code next. Pay in cash at any 7-Eleven in Sabah and keep the printed slip.</p>}
        {method === 'duitnow' && <p className="wk-note"><Info aria-hidden="true" />Next we show a DuitNow QR. Scan it with any Malaysian bank or e-wallet app.</p>}
        {method === 'card' && <p className="wk-note"><Lock aria-hidden="true" />You type your card details on the bank’s secure page. SCANS never sees or keeps them.</p>}
        {offline && <div className="wk-alert warn"><b><WifiOff aria-hidden="true" /> You are offline</b><p>Connect to the internet to pay. Your receipts and status still show.</p></div>}

        <p className="wk-secure"><ShieldCheck aria-hidden="true" />The money goes straight to the State’s FWECF account at Jabatan Kewangan Negeri Sabah. SCANS never holds it.</p>
        <button type="button" className="wk-demo" aria-pressed={fail} onClick={() => setFail(!fail)}>Demo: {fail ? 'this payment will fail' : 'make this payment fail'}</button>
      </div>
      <div className="wk-paybar">
        <div className="grow"><span>Total · {ENGLISH_NAME[p.id].toLowerCase()}</span><b className="num">{rm(total, 2)}</b></div>
        <button type="button" className="btn primary lg" disabled={offline} onClick={() => setPhase(method === 'cash' ? 'cash' : 'processing')}>
          {method === 'cash' ? 'Get counter code' : `Pay ${rm(total)}`}
        </button>
      </div>
    </div>
  )
}

/* ---------- Receipt ---------- */
export function Receipt() {
  const { id } = useParams()
  const loc = useLocation()
  const { toast, offline } = useWk()
  const known = workerPayments.find((x) => x.id === id)
  const s = known
    ? { total: known.amount, months: known.month, method: known.method, date: known.date, by: known.by }
    : { total: 100, months: 'June 2027', method: 'Touch ’n Go eWallet', date: '4 Jun 2027, 08:41', by: w.name, plan: 'Monthly', upTo: 'June 2027', ...(loc.state || {}) }
  const byEmployer = s.by && s.by !== w.name
  return (
    <div className="wk-page">
      <TopBar title="Receipt" back="/worker/history" />
      <div className="wk-pad">
        <article className="wk-slip" aria-label={'Receipt ' + id}>
          <header>
            <Logo width={96} />
            <span><small>Official receipt</small><b className="num">{id}</b></span>
          </header>
          <div className="wk-slip-amt">
            <span className="paid"><Check aria-hidden="true" /> Paid</span>
            <b className="num">{rm(s.total, 2)}</b>
            <span>{s.months}</span>
          </div>
          <dl>
            <div><dt>Name</dt><dd>{w.name}</dd></div>
            <div><dt>SCANS ID</dt><dd className="num">{w.scansId}</dd></div>
            {s.plan && <div><dt>Period</dt><dd>{s.plan} · {s.months}</dd></div>}
            {s.upTo && <div><dt>Paid up to</dt><dd>{s.upTo}</dd></div>}
            <div><dt>Paid with</dt><dd>{s.method}</dd></div>
            <div><dt>Paid by</dt><dd>{byEmployer ? s.by + ' (with your consent)' : 'You'}</dd></div>
            <div><dt>Date</dt><dd>{s.date}</dd></div>
            <div><dt>Paid into</dt><dd>FWECF account, Jabatan Kewangan Negeri Sabah</dd></div>
          </dl>
          <div className="wk-slip-split">
            <div><span>State share (70%)</span><b className="num">{rm(s.total * 0.7, 2)}</b></div>
            <div><span>Running SCANS (30%)</span><b className="num">{rm(s.total * 0.3, 2)}</b></div>
          </div>
          <footer>Keep this receipt. It shows a contribution only and is not an immigration document.</footer>
        </article>
        {offline && <p className="wk-note"><WifiOff aria-hidden="true" />Saved on this phone, so it shows without a connection.</p>}
        <div className="wk-two">
          <button type="button" className="btn outline lg" onClick={() => toast('Receipt saved to your phone')}><Download aria-hidden="true" /> Save</button>
          <button type="button" className="btn outline lg" onClick={() => toast('Choose an app to share with')}><Share2 aria-hidden="true" /> Share</button>
        </div>
        <Link to="/worker" className="btn primary lg block">Back to home</Link>
      </div>
    </div>
  )
}

/* ---------- Receipts list ---------- */
export function History() {
  const { t, acct } = useWk()
  const total = workerPayments.reduce((a, p) => a + p.amount, 0)
  return (
    <div className="wk-page has-nav">
      <TopBar title={t.receipts} />
      <div className="wk-pad">
        <div className="wk-sum">
          <div><span>Paid up to</span><b>{acct.paidThrough}</b></div>
          <div><span>Paid in 2027</span><b className="num">{rm(total)}</b></div>
        </div>
        <div className="wk-list">
          {workerPayments.map((p) => {
            const emp = p.by !== w.name
            return (
              <Link key={p.id} to={'/worker/receipt/' + p.id} className="wk-li tall">
                <MethodMark m={markFor(p.method)} />
                <span className="tx">
                  <b>{p.month}</b>
                  <small>{p.method} · {p.date}</small>
                  {emp && <span className="pill info"><Building2 aria-hidden="true" /> Paid by your employer</span>}
                </span>
                <span className="amt num">{rm(p.amount)}</span>
                <ChevronRight className="chev" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
        <p className="wk-note"><Clock aria-hidden="true" />When your employer pays for you, with your consent, the receipt shows here too.</p>
      </div>
    </div>
  )
}
