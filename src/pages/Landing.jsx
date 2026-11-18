import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/landing.css'
import { Logo } from '../components/ui.jsx'
import { REGISTERED, num, rm, ytd, stateYtd, collectedThisMonth, paidThisMonth, complianceRate, pct, demoWorker } from '../data/demo.js'

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current ? ref.current.querySelectorAll('.rv') : []
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { threshold: 0.15 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
  return ref
}

function Receipt({ stage }) {
  return (
    <div className="rcpt" data-ui>
      <div className="r-top"><Logo width={82} /><span style={{ fontSize: 12, color: 'var(--muted)' }}>{['Record', 'Due', 'Receipt', 'Recorded'][stage]}</span></div>
      <div className="r-name">{demoWorker.name}</div>
      <div className="r-id">{demoWorker.scansId}</div>
      <dl>
        <dt>Employer</dt><dd>Borneo Palm</dd>
        <dt>District</dt><dd>{demoWorker.district}</dd>
        {stage >= 1 && <><dt>For</dt><dd>June 2027</dd><dt>Due by</dt><dd>5 Jun 2027</dd></>}
        {stage >= 2 && <><dt>Paid with</dt><dd>Touch ’n Go</dd><dt>Receipt</dt><dd>RCP-2706-121907</dd></>}
        {stage >= 3 && <><dt>State share</dt><dd>RM 70.00</dd><dt>Operator fee</dt><dd>RM 30.00</dd></>}
      </dl>
      <div className="r-big">
        <span style={{ color: 'var(--muted)' }}>{stage === 0 ? 'Status' : stage === 1 ? 'Amount due' : stage === 2 ? 'Paid' : 'To FWECF account'}</span>
        <b>{stage === 0 ? 'Matched' : 'RM100'}</b>
      </div>
    </div>
  )
}

const portals = [
  { key: 'worker', name: 'Workers', who: 'Phone app, 6 languages', to: '/worker/start',
    desc: 'See what is due, pay it any way you like, keep every receipt, and read notices from the State in your own language. Nothing in the app can touch your permit or passport.' },
  { key: 'employer', name: 'Employers', who: 'Web portal', to: '/employer',
    desc: 'See which of your workers have paid, pay for several of them at once with their consent, and download statements for your records.' },
  { key: 'state', name: 'State Government', who: 'Kerajaan Negeri Sabah', to: '/state',
    desc: 'Collection, the 70% State share and arrears by district and sector, the same day. Send official notices and follow complaints to the agency that owns them.' },
  { key: 'merchant', name: 'Merchants', who: 'Partner shops', to: '/merchant',
    desc: 'Offer small savings to workers who are up to date, and see how often they are used at each outlet.' },
  { key: 'admin', name: 'Microtek', who: 'Operator', to: '/admin',
    desc: 'Run the platform for the State: approvals, record checks against SWIMS and eNORES, the audit log and daily reconciliation.' },
]

function Fragment({ k }) {
  if (k === 'worker') return (
    <div className="frag" data-ui>
      <div className="fh"><Logo light width={92} /><span>Selamat pagi, Agus</span></div>
      <div className="fb">
        <span style={{ color: 'var(--muted)' }}>Due for June 2027</span>
        <span className="big">RM100</span>
        <span className="status ok" style={{ alignSelf: 'flex-start' }}>Paid up to May 2027</span>
        <span className="btn primary block">Pay RM100</span>
        <div className="ln"><span>Your rights on rest days</span><span style={{ color: 'var(--muted)' }}>JTK Sabah</span></div>
      </div>
    </div>
  )
  if (k === 'employer') return (
    <div className="frag" data-ui>
      <div className="fh"><Logo light width={92} /><span>Borneo Palm Plantations</span></div>
      <div className="fb">
        <div className="mini"><div><b>412</b>workers</div><div><b>371</b>paid</div><div><b>41</b>not yet</div></div>
        <div className="ln"><span>5 workers × 1 month</span><b>RM 500.00</b></div>
        <div className="ln"><span>Pay with</span><b>FPX · Maybank2u</b></div>
        <span className="btn primary block">Pay RM 500.00</span>
      </div>
    </div>
  )
  if (k === 'state') return (
    <div className="frag" data-ui>
      <div className="fh"><Logo light width={92} /><span>Kerajaan Negeri Sabah</span></div>
      <div className="fb">
        <span style={{ color: 'var(--muted)' }}>Collected in June 2027</span>
        <span className="big num">{rm(collectedThisMonth)}</span>
        <div className="split"><span style={{ width: '70%', background: 'var(--navy)' }} /><span style={{ width: '30%', background: 'var(--sky)' }} /></div>
        <div className="ln"><span>State share, year to date</span><b className="num">{rm(stateYtd)}</b></div>
        <div className="ln"><span>Paid this month</span><b className="num">{num(paidThisMonth)} of {num(REGISTERED)}</b></div>
      </div>
    </div>
  )
  if (k === 'merchant') return (
    <div className="frag" data-ui>
      <div className="fh"><Logo light width={92} /><span>7-Eleven Sabah</span></div>
      <div className="fb">
        <span style={{ color: 'var(--muted)' }}>RM3 off a RM30 prepaid reload</span>
        <span className="big num">4,120</span>
        <span style={{ color: 'var(--muted)' }}>uses this month</span>
        <div className="ln"><span>Fajar Centre, Lahad Datu</span><b>921</b></div>
        <div className="ln"><span>Jalan Dunlop, Tawau</span><b>812</b></div>
      </div>
    </div>
  )
  return (
    <div className="frag" data-ui>
      <div className="fh"><Logo light width={92} /><span>Microtek operations</span></div>
      <div className="fb">
        <div className="ln"><span>Employer sign-up · Lahad Datu Oil Palm Mill</span><span className="status warn">Review</span></div>
        <div className="ln"><span>Record mismatch · Rina Wulandari</span><span className="status warn">Review</span></div>
        <div className="ln"><span>Daily reconciliation · 16 Jun</span><span className="status ok">0 breaks</span></div>
        <div className="ln"><span>KDN identity checks today</span><b>1,204</b></div>
      </div>
    </div>
  )
}

const faqs = [
  ['Who has to pay the contribution?', 'Foreign workers registered in Sabah, in the categories the State sets in law. The proposed amount is RM100 a month, which you can also pay as RM300 a quarter or RM1,200 a year. Collection only starts once the State has passed the legal instrument.'],
  ['What happens if I cannot pay on time?', 'You get reminders and the amount shows as owed. Late payment never cancels your permit, never stops you from travelling and never leads to your passport being held. SCANS has no power over your permit.'],
  ['Can my employer take it from my salary?', 'Only with a written deduction permit from Jabatan Tenaga Kerja Sabah under section 113(4) of the Labour Ordinance. Without that permit, the employer portal will not let them pay through payroll.'],
  ['How do I pay if I do not have a bank account?', 'Pay in cash at any 7-Eleven in Sabah with your SCANS ID, or use Touch ’n Go, DuitNow QR, Boost, GrabPay or ShopeePay. Every payment gives you a receipt in the app and by SMS.'],
  ['Which languages does the app use?', 'Bahasa Melayu, English, Bahasa Indonesia, Filipino, Bengali and Nepali. Official notices from the State are sent in the language you choose.'],
  ['Where does the money go?', 'Into an FWECF account held by Jabatan Kewangan Negeri Sabah. 70% stays with the State. 30% pays the operator to build and run the platform, so the State carries no build or running cost.'],
  ['Who can see my information?', 'Only people whose job needs it, and every view is logged for the State’s auditors. Your record is never used for advertising or sold. It is protected under the Personal Data Protection Act.'],
  ['Is SCANS the same as an immigration check?', 'No. Signing up to SCANS is not an immigration check and the app does not decide anyone’s status. That stays with the agencies that hold that power in law.'],
]

export default function Landing() {
  const ref = useReveal()
  const [active, setActive] = useState('worker')
  const cur = portals.find((p) => p.key === active)
  return (
    <div className="lp" ref={ref}>
      <section className="lp-hero">
        <div className="lp-top">
          <span className="left" aria-hidden="true" />
          <Link to="/" className="brand" aria-label="SCANS home"><Logo light width={150} /></Link>
          <nav className="right" aria-label="Site"><a href="#questions">Questions</a><Link to="/login">Sign in</Link></nav>
        </div>
        <div className="lp-head">
          <h1 className="rv">RM100 a month</h1>
          <p className="rv d1">For Kerajaan Negeri Sabah, SCANS keeps one record for each of Sabah’s {num(REGISTERED)} registered foreign workers: what they pay, the receipts they keep, and the notices the State sends them in their own language.</p>
        </div>
        <div className="folders" role="list">
          <Link role="listitem" to="/login?portal=admin" className="folder f1"><span className="tab">Microtek</span><span className="sheet" /></Link>
          <Link role="listitem" to="/login?portal=merchant" className="folder f2"><span className="tab">Merchants</span><span className="sheet" /></Link>
          <Link role="listitem" to="/login?portal=state" className="folder f3"><span className="tab">State Government</span><span className="sheet" /></Link>
          <Link role="listitem" to="/login?portal=employer" className="folder f4"><span className="tab">Employers</span><span className="sheet" /></Link>
          <div role="listitem" className="folder f5 front">
            <span className="tab">Workers</span>
            <div className="sheet">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p>Download the app, scan your passport once, and pay the way that suits you: Touch ’n Go, DuitNow, cash at 7-Eleven, or through your employer.</p>
                <Link to="/worker/start" className="btn ink tabbed">Open the worker app</Link>
              </div>
              <div className="rcpt-live" style={{ marginLeft: 'auto' }}><Receipt stage={2} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="fields" aria-labelledby="how">
        {[
          'First the worker is matched to the State’s record.',
          'Then the month falls due, with a reminder.',
          'The worker pays, any way they like.',
          'The State sees it the same day.',
        ].map((c, i) => (
          <div key={i} className={'field-col fc' + (i + 1)}>
            {i === 0 && <h2 id="how" className="rv">One payment, four hands</h2>}
            <div className={'card-slot rv d' + (i % 3 + 1)}><Receipt stage={i} /></div>
            <p className="clause rv d2">{c}</p>
          </div>
        ))}
      </section>

      <section className="stats">
        <div className="lp-wrap">
          <div className="tiles">
            <div className="tile t1 rv"><span className="fig num">{num(REGISTERED)}</span><span className="cap">foreign workers registered in Sabah on 31 December 2025. Plantation and agriculture employ 79% of them.</span></div>
            <h2 className="stats-head rv d1">The figures it runs on</h2>
            <div className="tile t2 rv d1"><span className="fig">RM100</span><span className="cap">a month per worker, or RM300 a quarter, or RM1,200 a year.</span></div>
            <div className="tile t3 rv d2"><span className="fig">70%</span><span className="cap">of every ringgit stays with the State. 30% runs the platform.</span></div>
          </div>
          <p className="stats-note rv">At the proposal’s Year 1 rate of 60% paying, that is about {rm(collectedThisMonth)} a month. This demo shows {pct(complianceRate)} paying in June 2027 and {rm(ytd)} collected since January.</p>
        </div>
      </section>

      <section className="show" aria-labelledby="portals">
        <div className="plate"><div className="stage prev" key={active}><Fragment k={active} /></div></div>
        <div className="side-col">
          <div>
            <h2 id="portals" className="rv">Five portals, one record</h2>
            <ul className="idx">
              {portals.map((p) => (
                <li key={p.key}>
                  <button aria-current={active === p.key} onMouseEnter={() => setActive(p.key)} onFocus={() => setActive(p.key)} onClick={() => setActive(p.key)}>
                    <span className="n">{p.name}</span><span className="w">{p.who}</span>
                  </button>
                  {active === p.key && <div className="inline"><Fragment k={p.key} /></div>}
                </li>
              ))}
            </ul>
          </div>
          <p className="desc">{cur.desc}</p>
          <div className="cells">
            <Link to={cur.to}>Open the {cur.name.toLowerCase()} demo</Link>
            <a href="#questions">Read the rules</a>
          </div>
        </div>
      </section>

      <section className="faq" id="questions">
        <div className="lp-wrap faq-grid">
          <h2 className="rv">Questions people ask</h2>
          <div className="list">
            {faqs.map(([q, a], i) => (
              <details key={q} name="faq" open={i === 1} className="rv">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="blocks" aria-label="SCANS">
            {'SCANS'.split('').map((l, i) => <span key={i} aria-hidden="true">{l}</span>)}
          </div>
          <div className="foot-cols">
            <div><b>Portals</b><Link to="/worker/start">Workers</Link><Link to="/employer">Employers</Link><Link to="/state">State Government</Link></div>
            <div><b>&nbsp;</b><Link to="/merchant">Merchants</Link><Link to="/admin">Microtek</Link><Link to="/login">Sign in</Link></div>
            <div><b>Rules</b><a href="#questions">Questions</a><a href="#questions">Your rights</a><a href="#questions">Privacy</a></div>
            <div><b>Help</b><a href="mailto:bantuan@scans.sabah.gov.my?subject=SCANS%20help">Email support</a><a href="#questions">Complaints</a></div>
            <div className="addr"><b>Kerajaan Negeri Sabah</b><span>Sabah Contribution Administration Network System</span><span>Operated by Microtek Solutions Sdn. Bhd. under a Private Finance Initiative agreement.</span></div>
          </div>
          <div className="foot-last">
            <span>Prototype with demo data. Figures follow the SCANS proposal paper; names and records are samples.</span>
            <Link to="/login" className="btn paper sm tabbed">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
