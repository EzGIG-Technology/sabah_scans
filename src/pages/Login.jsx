import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, ShieldCheck, Smartphone, KeyRound, Check, ChevronRight, MessageSquareText } from 'lucide-react'
import '../styles/landing.css'
import { Logo } from '../components/ui.jsx'
import { demoWorker } from '../data/demo.js'
import { PORTALS, Crest } from './Landing.jsx'

/* How each portal signs in. The sample account is filled in for the prototype. */
const HOW = {
  worker: { idLabel: 'Phone number', id: demoWorker.phone, type: 'tel', user: demoWorker.name + ', worker',
    codeTo: 'We sent a 6-digit code by SMS to +60 11-•••• 3391.', first: 'Send SMS code', note: 'Workers never need a password. New to SCANS? You scan your passport once.' },
  employer: { idLabel: 'Work email', id: 'jennifer.liew@bpp.example.my', user: 'Jennifer Liew, Borneo Palm Plantations',
    codeTo: 'Enter the 6-digit code from your authenticator app.', note: 'Your company must be registered with JTK Sabah in eNORES.' },
  state: { idLabel: 'Government email', id: 'nurul.ain@sabah.gov.my', user: 'Nurul Ain, Jabatan Kewangan Negeri',
    codeTo: 'Enter the 6-digit code from your authenticator app.', note: 'Every view and export is written to the audit log.' },
  merchant: { idLabel: 'Work email', id: 'partners@7eleven.example.my', user: 'Tan Mei Ling, 7-Eleven Sabah',
    codeTo: 'We sent a 6-digit code by SMS to +60 12-•••• 8810.', note: 'Merchant partners are approved by Microtek before they can sign in.' },
  admin: { idLabel: 'Microtek email', id: 'faizal@microtek.example.my', user: 'Faizal Rahman, Microtek operations',
    codeTo: 'Two-step sign-in is required for every operator account. Enter the code from your security key app.', note: 'Operator accounts can only sign in from approved devices.' },
}

export default function Login() {
  const loc = useLocation()
  const nav = useNavigate()
  const q = new URLSearchParams(loc.search).get('portal')
  const [key, setKey] = useState(PORTALS.some((p) => p.key === q) ? q : 'worker')
  const [stage, setStage] = useState('id') // id | code
  const [code, setCode] = useState('482913')
  const [busy, setBusy] = useState(false)
  const p = PORTALS.find((x) => x.key === key)
  const h = HOW[key]
  useEffect(() => { setStage('id'); setBusy(false) }, [key])
  useEffect(() => { if (q && PORTALS.some((x) => x.key === q)) setKey(q) }, [q])

  const toCode = (e) => { e && e.preventDefault(); setStage('code') }
  const signIn = (e) => {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => nav(p.to), 500)
  }

  return (
    <div className="si">
      <header className="si-top">
        <div className="lp-photo" aria-hidden="true" />
        <div className="lp-scrim" aria-hidden="true" />
        <div className="lp-wrap">
          <nav className="lp-nav" aria-label="Site">
            <Link to="/" className="lp-chip" aria-label="SCANS home">
              <Logo width={118} />
              <span className="sep" aria-hidden="true" />
              <span className="txt"><b>Contribution system</b><small>Kerajaan Negeri Sabah</small></span>
            </Link>
            <Link to="/" className="si-back"><ArrowLeft aria-hidden="true" /> Home</Link>
          </nav>
          <div className="si-head">
            <h1>Sign in</h1>
            <p>Choose your portal. Each one shows only what that role needs.</p>
          </div>
        </div>
      </header>

      <main className="lp-wrap si-main">
        <section className="si-pick" aria-label="Portal">
          <div role="radiogroup" aria-label="Portal" className="si-list">
            {PORTALS.map((x) => (
              <button key={x.key} type="button" role="radio" aria-checked={key === x.key} className="si-opt" onClick={() => setKey(x.key)}>
                <span className="si-thumb" style={{ backgroundImage: `url(${x.img})` }} aria-hidden="true"><span className="si-crest"><Crest p={x} size={26} /></span></span>
                <span className="grow"><small>{x.who}</small><b>{x.name}</b></span>
                <span className="si-radio" aria-hidden="true">{key === x.key && <Check />}</span>
              </button>
            ))}
          </div>
          <div className="si-join">
            <Link to="/employer/register"><span><b>Register your company</b><small>For employers of foreign workers in Sabah</small></span><ChevronRight aria-hidden="true" /></Link>
            <Link to="/merchant/register"><span><b>Become a merchant partner</b><small>Offer perks to workers who are up to date</small></span><ChevronRight aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="si-card" aria-labelledby="si-title">
          <div className="si-card-head">
            <span className="si-crest lg"><Crest p={p} size={40} /></span>
            <div className="grow">
              <small>{p.who}</small>
              <h2 id="si-title">{p.name}</h2>
            </div>
            <span className="si-step">{stage === 'id' ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
          </div>
          <p className="si-as">Sample account: {h.user}</p>

          {stage === 'id' ? (
            <form className="si-form" onSubmit={toCode} key={key + '-id'}>
              <label className="si-field">
                <span>{h.idLabel}</span>
                <input className="input" type={h.type || 'email'} defaultValue={h.id} autoComplete={key === 'worker' ? 'tel' : 'username'} inputMode={key === 'worker' ? 'tel' : 'email'} />
              </label>
              {key !== 'worker' && (
                <label className="si-field">
                  <span className="row between"><span>Password</span><a href="#reset" onClick={(e) => e.preventDefault()}>Forgot password?</a></span>
                  <input className="input" type="password" defaultValue="sample-password" autoComplete="current-password" />
                </label>
              )}
              <button className="btn primary lg block">{key === 'worker' ? <><MessageSquareText aria-hidden="true" /> {h.first}</> : <><Lock aria-hidden="true" /> Continue</>}</button>
              {key === 'state' && <>
                <div className="si-or"><span>or</span></div>
                <button type="button" className="btn lg block si-mydid" onClick={toCode}><ShieldCheck aria-hidden="true" /> Sign in with MyDigital ID</button>
              </>}
              {key === 'worker' && <Link to="/worker/start" className="btn outline lg block"><Smartphone aria-hidden="true" /> New to SCANS? Set up the app</Link>}
              {key === 'employer' && <Link to="/employer/register" className="si-link">Not registered yet? Register your company <ChevronRight aria-hidden="true" /></Link>}
              {key === 'merchant' && <Link to="/merchant/register" className="si-link">Not a partner yet? Become a merchant partner <ChevronRight aria-hidden="true" /></Link>}
            </form>
          ) : (
            <form className="si-form" onSubmit={signIn} key={key + '-code'}>
              <div className="si-2fa"><KeyRound aria-hidden="true" /><p>{key === 'worker' ? h.codeTo : <><b>Two-step sign-in.</b> {h.codeTo}</>}</p></div>
              <label className="si-field">
                <span>{key === 'worker' ? 'SMS code' : '6-digit code'}</span>
                <input className="input si-otp num" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-describedby="si-otp-hint" />
                <small id="si-otp-hint" className="si-hint">{key === 'worker' ? 'You can ask for a new code in 0:42.' : 'Codes change every 30 seconds.'}</small>
              </label>
              <button className="btn primary lg block" disabled={code.length !== 6 || busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
              <button type="button" className="btn ghost block" onClick={() => setStage('id')}><ArrowLeft aria-hidden="true" /> Back</button>
            </form>
          )}
          <p className="si-note">{h.note}</p>
          <p className="si-demo">Prototype: the sample account is filled in and any 6-digit code works.</p>
        </section>
      </main>
      <footer className="si-foot lp-wrap">
        <span>SCANS for Kerajaan Negeri Sabah · Data hosted in Malaysia · PDPA 2010</span>
        <Link to="/worker/privacy">Privacy</Link>
      </footer>
    </div>
  )
}
