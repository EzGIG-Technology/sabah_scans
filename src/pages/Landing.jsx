import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ArrowRight, ChevronRight, Smartphone, CreditCard, Landmark, PieChart, ReceiptText, ShieldCheck, Database, FileLock2, HandHeart, Building2, Store, ServerCog, Languages, ScanFace, Plus } from 'lucide-react'
import '../styles/landing.css'
import { Logo } from '../components/ui.jsx'
import { REGISTERED, RATE, STATE_SHARE, DEMO_DATE, num, rm, languages } from '../data/demo.js'

/* The five portals, shared with the sign-in page. */
export const PORTALS = [
  { key: 'worker', to: '/worker', who: 'Workers · iOS and Android', name: 'Worker app', tag: 'Mobile app', img: '/img/portal-worker.jpg', crest: '/favicon.png', icon: Smartphone,
    desc: 'See what is due, pay any way you like, keep every receipt and read notices from the State in your own language.' },
  { key: 'employer', to: '/employer', who: 'Companies with foreign workers', name: 'Employer portal', img: '/img/portal-employer.jpg', icon: Building2,
    desc: 'See which workers have paid, pay for several at once with their consent, and download statements.' },
  { key: 'state', to: '/state', who: 'Kerajaan Negeri Sabah', name: 'State dashboard', img: '/img/portal-state.jpg', crest: '/img/logos/mof-sabah.png', icon: Landmark,
    desc: 'Collection, the 70% State share and arrears by district and sector, the same day. Notices and complaints in one place.' },
  { key: 'merchant', to: '/merchant', who: 'Partner shops', name: 'Merchant portal', img: '/img/portal-merchant.jpg', icon: Store,
    desc: 'Offer small savings to workers who are up to date and see how often they are used at each outlet.' },
  { key: 'admin', to: '/admin', who: 'Platform operator', name: 'Microtek operations', img: '/img/portal-operator.jpg', icon: ServerCog,
    desc: 'Approvals, record checks against SWIMS and eNORES, the audit log and daily reconciliation for the State.' },
]

export function Crest({ p, size = 44 }) {
  if (p.crest) return <img src={p.crest} alt="" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', borderRadius: 10 }} />
  const Icon = p.icon
  return <Icon aria-hidden="true" style={{ width: size * 0.6, height: size * 0.6, color: 'var(--blue)' }} />
}

const STEPS = [
  { icon: Smartphone, t: 'The worker pays', d: 'In the app, with cash at any 7-Eleven, or through the employer with the worker’s consent.', more: 'Touch ’n Go, DuitNow QR, Boost, GrabPay, ShopeePay, FPX, cards and 7-Eleven cash. Every payment gets a receipt in the app and by SMS.' },
  { icon: CreditCard, t: 'A licensed acquirer takes it', d: 'The payment goes through a licensed payment acquirer, never through SCANS.', more: 'SCANS records the payment and the acquirer reference. It never holds or moves the money itself.' },
  { icon: Landmark, t: 'Into the FWECF account', d: 'The acquirer settles into the FWECF account held by Jabatan Kewangan Negeri Sabah.', more: 'Settlement runs every night. The State’s finance team reconciles the account against every receipt the next morning.' },
  { icon: PieChart, t: 'Split 70 to 30', d: '70% stays with the State. 30% pays Microtek to build and run SCANS.', more: `Of every ${rm(RATE)}, ${rm(RATE * STATE_SHARE)} stays with Kerajaan Negeri Sabah. Under the Private Finance Initiative the State carries no build or running cost.` },
  { icon: ReceiptText, t: 'Receipt and status everywhere', d: 'The worker, the employer and the State see the same record the same day.', more: 'One record, many views: the worker app, the employer portal and the State dashboard all read the same payment.' },
]

const PROMISES = [
  { icon: ShieldCheck, t: 'No permit action, ever', d: 'Owing money never leads to permit action, a held passport, a travel ban or detention. SCANS has no function to issue or cancel permits, and signing up is not an immigration check.' },
  { icon: Database, t: 'The State owns the data', d: 'Records belong to Kerajaan Negeri Sabah and are hosted in Malaysia. Access depends on role, and every view, export and change is logged for the State’s auditors.' },
  { icon: FileLock2, t: 'PDPA applies', d: 'Personal data is handled under the Personal Data Protection Act 2010. Every web user signs in with two steps. Nothing is sold or used for advertising.' },
  { icon: HandHeart, t: 'Consent comes first', d: 'Employers pay for a worker only with that worker’s consent, and deduct from wages only with a JTK Sabah permit under Labour Ordinance s.113(4).' },
]

const FAQS = [
  ['Who has to pay the contribution?', 'Foreign workers registered in Sabah, in the categories the State sets in law. The proposed amount is RM100 a month, which can also be paid as RM300 a quarter or RM1,200 a year. Collection only starts once the State has passed the legal instrument.'],
  ['What happens if a worker cannot pay on time?', 'They get reminders and the amount shows as owed. Late payment never cancels a permit, never stops anyone from travelling and never leads to a passport being held. SCANS has no power over permits.'],
  ['Can an employer take it from wages?', 'Only with a written deduction permit from Jabatan Tenaga Kerja Sabah under section 113(4) of the Labour Ordinance. Without that permit on file, the employer portal does not allow payment through payroll.'],
  ['How does someone pay without a bank account?', 'In cash at any 7-Eleven in Sabah with a counter code from the app, or with Touch ’n Go, DuitNow QR, Boost, GrabPay or ShopeePay. Every payment gives a receipt in the app and by SMS.'],
  ['Which languages does the app use?', 'Bahasa Melayu, English, Bahasa Indonesia, Filipino, Bengali and Nepali. Official notices from the State arrive in the language the worker chooses.'],
  ['Where does the money go?', 'Into an FWECF account held by Jabatan Kewangan Negeri Sabah. 70% stays with the State. 30% pays the operator to build and run the platform, so the State carries no build or running cost.'],
  ['Who can see a worker’s information?', 'Only people whose job needs it, and every view is logged for the State’s auditors. Employers see contribution status only. Shops never see worker records.'],
  ['Is SCANS an immigration check?', 'No. Signing up to SCANS is not an immigration check and the app does not decide anyone’s status. The SCANS card shows contribution status only and is not an immigration document.'],
]

export default function Landing() {
  const [step, setStep] = useState(0)
  const S = STEPS[step]
  return (
    <div className="lp">
      <header className="lp-top">
        <div className="lp-photo" aria-hidden="true" />
        <div className="lp-scrim" aria-hidden="true" />
        <div className="lp-wrap">
          <nav className="lp-nav" aria-label="Site">
            <Link to="/" className="lp-chip" aria-label="SCANS home">
              <Logo width={176} />
              <span className="sep" aria-hidden="true" />
              <img className="crest" src="/img/logos/mof-sabah.png" alt="" aria-hidden="true" />
              <span className="txt"><b>Contribution system</b><small>Kerajaan Negeri Sabah</small></span>
            </Link>
            <div className="lp-meta"><span>{DEMO_DATE}</span><span>Sample data</span></div>
          </nav>
          <div className="lp-hero">
            <div className="lp-hero-copy">
              <h1>RM100 a month. <span>One record per worker.</span></h1>
              <p>SCANS runs the Foreign Worker Economic Contribution Fund for Kerajaan Negeri Sabah: one record for each registered foreign worker, what they pay, the receipts they keep and the notices the State sends them in their own language.</p>
              <div className="lp-actions">
                <Link to="/login" className="btn white lg"><Lock aria-hidden="true" /> Sign in to a portal</Link>
                <a href="#how" className="btn lg lp-glass">How it works</a>
              </div>
            </div>
            <div className="lp-stats">
              <div className="lp-stat"><b className="num">{num(REGISTERED)}</b><span>registered foreign workers in Sabah, 31 December 2025</span></div>
              <div className="lp-stat"><b className="num">RM{RATE}</b><span>a month, or RM300 a quarter, or RM1,200 a year</span></div>
              <div className="lp-stat"><b className="num">{STATE_SHARE * 100}%</b><span>of every ringgit stays with the State</span></div>
              <div className="lp-stat"><b className="num">RM0</b><span>build or running cost to the State</span></div>
            </div>
          </div>
        </div>
      </header>

      <main className="lp-wrap lp-body">
        <section aria-labelledby="signin" className="lp-sec" id="portals">
          <h2 id="signin">Sign in</h2>
          <p>Choose your portal. Each one shows only what that role needs.</p>
        </section>
        <div className="lp-grid">
          {PORTALS.map((p) => (
            <Link key={p.key} to={'/login?portal=' + p.key} className="pcard">
              <span className="pcover" style={{ backgroundImage: `url(${p.img})` }} aria-hidden="true" />
              {p.tag && <span className="ptag">{p.tag}</span>}
              <span className="pcrest" aria-hidden="true"><Crest p={p} /></span>
              <span className="pbody">
                <span className="who">{p.who}</span>
                <span className="pname">{p.name}</span>
                <span className="pdesc">{p.desc}</span>
                <span className="go">Open <ChevronRight aria-hidden="true" /></span>
              </span>
            </Link>
          ))}
        </div>

        <section className="lp-sec" aria-labelledby="how-h" id="how">
          <h2 id="how-h">How a contribution moves</h2>
          <p>From the worker’s phone to the State’s account, with a receipt at every step.</p>
        </section>
        <ol className="jsteps" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <button type="button" className={'jstep' + (i === step ? ' on' : '')} aria-pressed={i === step} onClick={() => setStep(i)} onMouseEnter={() => setStep(i)}>
                <span className="jic"><s.icon aria-hidden="true" /></span>
                <span className="t">Step {i + 1}</span>
                <b>{s.t}</b>
                <span className="d">{s.d}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="jdetail" aria-live="polite">
          <span className="ic"><S.icon aria-hidden="true" /></span>
          <p><b>{S.t}.</b> {S.more}</p>
          {step === 3 && <div className="jsplit" aria-label="70% State, 30% operator"><span style={{ width: '70%' }}>State 70%</span><span style={{ width: '30%' }}>Operator 30%</span></div>}
        </div>

        <section className="lp-band">
          <div className="lp-band-img" style={{ backgroundImage: 'url(/img/helpdesk.jpg)' }} aria-hidden="true" />
          <div className="lp-band-copy">
            <h2>Built for the worker first</h2>
            <p>A phone app in six languages that works on slow connections. Status, the SCANS card and receipts still show offline. A complaint can be written in any language and can be kept from the employer.</p>
            <div className="lp-langs">{languages.map((l) => <span key={l.code}>{l.label}</span>)}</div>
            <div className="lp-pay">
              <span className="lbl">Pay with</span>
              {['fpx', 'duitnow', 'visa', 'mastercard'].map((m) => <img key={m} src={`/img/pay/${m}.png`} alt={m === 'fpx' ? 'FPX' : m === 'duitnow' ? 'DuitNow' : m === 'visa' ? 'Visa' : 'Mastercard'} />)}
              <span className="more">Touch ’n Go, Boost, GrabPay, ShopeePay and cash at 7-Eleven</span>
            </div>
            <div className="lp-band-actions">
              <Link to="/worker/start" className="btn primary lg"><ScanFace aria-hidden="true" /> Try the sign-up</Link>
              <Link to="/worker" className="btn outline lg"><Languages aria-hidden="true" /> Open the worker app</Link>
            </div>
          </div>
        </section>

        <section className="lp-sec" aria-labelledby="promise">
          <h2 id="promise">What SCANS will never do</h2>
          <p>The rules are written into the platform, not left to policy.</p>
        </section>
        <div className="lp-promises">
          {PROMISES.map((x) => (
            <article key={x.t} className="promise">
              <span className="pic"><x.icon aria-hidden="true" /></span>
              <h3>{x.t}</h3>
              <p>{x.d}</p>
            </article>
          ))}
        </div>

        <section className="lp-sec" aria-labelledby="faq" id="questions">
          <h2 id="faq">Questions people ask</h2>
          <p>Short answers. The full rules come with the State’s legal instrument.</p>
        </section>
        <div className="lp-faq">
          {FAQS.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary><span>{q}</span><Plus aria-hidden="true" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="lp-foot-top">
            <div className="lp-foot-brand">
              <Logo light width={150} />
              <p>Sabah Contribution Administration Network System, for Kerajaan Negeri Sabah. Operated by Microtek under a Private Finance Initiative agreement.</p>
            </div>
            <div className="lp-foot-cols">
              <div><b>Portals</b>{PORTALS.map((p) => <Link key={p.key} to={'/login?portal=' + p.key}>{p.name}</Link>)}</div>
              <div><b>Join</b><Link to="/employer/register">Register your company</Link><Link to="/merchant/register">Become a merchant partner</Link><Link to="/worker/start">Set up the worker app</Link></div>
              <div><b>Learn</b><a href="#how">How it works</a><a href="#questions">Questions</a><Link to="/worker/privacy">Privacy</Link></div>
            </div>
          </div>
          <div className="lp-foot-last">
            <span>Prototype with sample data. Figures follow the SCANS proposal paper; names and records are samples.</span>
            <Link to="/login" className="lp-foot-signin">Sign in <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
