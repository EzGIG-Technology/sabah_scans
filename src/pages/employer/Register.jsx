import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowRight, ArrowLeft, Search, Upload, FileText, X, Info, ShieldCheck, Smartphone, KeyRound, AlertTriangle, Send, Database } from 'lucide-react'
import { Logo, Card, Callout, Stepper, Field, useToast } from '../../components/ui.jsx'
import { num, sectors } from '../../data/demo.js'
import './employer.css'

const STEPS = ['Verify', 'Person in charge', 'Documents', 'Review']
const SSM = {
  '202101028845': { kind: 'found', name: 'Tungku Agro Plantation Sdn Bhd', sector: 'Plantation', district: 'Lahad Datu', workers: 186, enores: 'SBH-E-024417', address: 'Lot 18, Jalan Tungku, 91100 Lahad Datu, Sabah' },
  '201401023318': { kind: 'exists', name: 'Borneo Palm Plantations Sdn Bhd' },
  '202301099120': { kind: 'no-enores', name: 'Kunak Fresh Produce Sdn Bhd' },
}
const DOCS = [
  { key: 'ssm', title: 'SSM company certificate', note: 'Form 9 or the SSM e-Info company profile, PDF', required: true, file: (n) => `SSM-certificate-${n}.pdf`, size: '412 KB' },
  { key: 'auth', title: 'Letter of authorisation', note: 'Signed by a director, naming the person in charge', required: true, file: () => 'Authorisation-letter-signed.pdf', size: '188 KB' },
  { key: 'permit', title: 'JTK Sabah deduction permit, section 113(4)', note: 'Optional. Only if you want to deduct contributions from wages. You can add it later.', required: false, file: () => 'JTK-Sabah-s113-4-permit.pdf', size: '264 KB' },
]
const SAMPLE = { name: 'Lim Siew Ling', ic: '850412-12-5521', role: 'HR manager', email: 'siewling.lim@tungkuagro.example.my', phone: '012-845 3310', twofa: 'app' }

function Verify({ ssm, setSsm, company, setCompany }) {
  const [state, setState] = useState(company ? 'found' : 'idle') // idle | checking | found | error
  const [err, setErr] = useState(null)
  useEffect(() => {
    if (state !== 'checking') return
    const t = setTimeout(() => {
      const n = ssm.replace(/\D/g, '')
      const hit = SSM[n]
      if (hit && hit.kind === 'found') { setCompany({ ...hit, ssm: n }); setState('found'); return }
      setState('error')
      if (hit && hit.kind === 'exists') setErr({ title: `${hit.name} already has a SCANS account`, body: 'Ask your company’s SCANS admin to invite you from Settings, then sign in. If nobody at the company has access, contact SCANS support.', link: true })
      else if (hit && hit.kind === 'no-enores') setErr({ title: `${hit.name} is in SSM but not in eNORES`, body: 'SCANS only works with employers registered with JTK Sabah. Register your foreign workers in eNORES first, then come back. It can take up to 3 working days to reach SCANS.' })
      else setErr({ title: `We could not find SSM number ${n}`, body: 'Check the 12-digit number on your SSM certificate and try again. New companies can take up to 7 days to appear. If the number is right, contact SCANS support.' })
    }, 900)
    return () => clearTimeout(t)
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps
  const check = () => {
    const n = ssm.replace(/\D/g, '')
    if (n.length !== 12) { setState('error'); setErr({ title: 'This is not a 12-digit SSM number', body: 'Enter the new-format SSM registration number, for example 202101028845. Leave out the old number in brackets.' }); return }
    setCompany(null); setErr(null); setState('checking')
  }
  return (
    <div className="stack">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Company verification</h2>
        <p className="ink2" style={{ marginTop: 4 }}>We check your company with SSM and your foreign workers with eNORES (JTK Sabah). You do not need to type anything else about the company.</p>
      </div>
      <Field label="SSM registration number" hint="For the demo, try 202101028845. 201401023318 shows an existing account, and any other number is not found.">
        <div className="row" style={{ gap: 8 }}>
          <div className="emp-input-ok grow">
            <input className={'input num' + (state === 'found' ? ' ok' : state === 'error' ? ' err' : '')} inputMode="numeric" maxLength={14} value={ssm}
              onChange={(e) => { setSsm(e.target.value); if (state !== 'checking') { setState('idle'); setCompany(null) } }}
              onKeyDown={(e) => e.key === 'Enter' && check()} placeholder="12 digits" aria-invalid={state === 'error'} />
            {state === 'found' && <CheckCircle2 size={18} />}
          </div>
          {state !== 'found' && <button type="button" className="btn primary" onClick={check} disabled={state === 'checking' || !ssm.trim()}><Search /> {state === 'checking' ? 'Checking' : 'Check'}</button>}
        </div>
      </Field>
      {state === 'checking' && <Callout icon={Search}>Checking SSM and eNORES…</Callout>}
      {state === 'error' && err && (
        <Callout tone="bad" icon={AlertTriangle}><b style={{ display: 'block' }}>{err.title}</b>{err.body}{err.link && <> <Link to="/login">Go to sign in</Link>.</>}</Callout>
      )}
      {state === 'found' && company && (
        <>
          <div className="emp-found"><CheckCircle2 size={22} /><b>Company found in SSM and eNORES</b></div>
          <div className="form-grid">
            <Field label="Registered name" full><input className="input" readOnly value={company.name} /></Field>
            <Field label="Sector"><input className="input" readOnly value={company.sector} /></Field>
            <Field label="District"><input className="input" readOnly value={company.district} /></Field>
            <Field label="Foreign workers in eNORES"><input className="input num" readOnly value={`${num(company.workers)} workers`} /></Field>
            <Field label="eNORES employer code"><input className="input num" readOnly value={company.enores} /></Field>
          </div>
          <p className="small muted row" style={{ alignItems: 'flex-start', gap: 8 }}><Info size={15} style={{ flex: 'none', marginTop: 2 }} />These details come straight from SSM and eNORES and cannot be changed here. If something is wrong, fix it with SSM or JTK Sabah first.</p>
        </>
      )}
    </div>
  )
}

function Pic({ pic, setPic, errs }) {
  const set = (k) => (e) => setPic({ ...pic, [k]: e.target.value })
  return (
    <div className="stack">
      <div className="row between wrap">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Person in charge</h2>
          <p className="ink2" style={{ marginTop: 4 }}>This person becomes the company’s first SCANS admin and can invite colleagues later.</p>
        </div>
        <button className="btn ghost sm" onClick={() => setPic(SAMPLE)}>Fill with sample details</button>
      </div>
      <div className="form-grid">
        <Field label="Full name as in MyKad" error={errs.name} full><input className={'input' + (errs.name ? ' err' : '')} value={pic.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="MyKad number" error={errs.ic} hint="12 digits, for example 850412-12-5521"><input className={'input num' + (errs.ic ? ' err' : '')} value={pic.ic} onChange={set('ic')} inputMode="numeric" /></Field>
        <Field label="Role in the company" error={errs.role}>
          <select className="select" style={errs.role ? { borderColor: 'var(--badFill)' } : undefined} value={pic.role} onChange={set('role')}>
            <option value="">Choose a role</option>
            {['Director', 'HR manager', 'Finance manager', 'Estate manager', 'Company secretary', 'Other'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Work email" error={errs.email} hint="We send the sign-in link here"><input className={'input' + (errs.email ? ' err' : '')} type="email" value={pic.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Mobile number" error={errs.phone} hint="For sign-in codes and urgent messages"><input className={'input num' + (errs.phone ? ' err' : '')} type="tel" value={pic.phone} onChange={set('phone')} autoComplete="tel" placeholder="012-345 6789" /></Field>
      </div>
      <div className="field">
        <span>2-step sign-in</span>
        <div className="grid g-2" role="radiogroup" aria-label="2-step sign-in method">
          {[['app', KeyRound, 'Authenticator app', 'Google or Microsoft Authenticator. Recommended.'], ['sms', Smartphone, 'SMS code', 'A code sent to the mobile number above']].map(([v, Icon, t, d]) => (
            <button key={v} type="button" className="option" role="radio" aria-checked={pic.twofa === v} onClick={() => setPic({ ...pic, twofa: v })}>
              <span className="radio" /><span className="grow"><b style={{ display: 'block' }}>{t}</b><small className="muted">{d}</small></span><Icon size={20} color="var(--blue)" />
            </button>
          ))}
        </div>
        <small className="hint">Everyone who signs in to SCANS must use 2-step sign-in.</small>
      </div>
    </div>
  )
}

function Docs({ docs, setDocs, ssm, err }) {
  const toast = useToast()
  return (
    <div className="stack">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Documents</h2>
        <p className="ink2" style={{ marginTop: 4 }}>PDF or a clear photo, up to 10 MB each. <button className="btn ghost sm" style={{ height: 'auto', padding: 0 }} onClick={() => toast('Authorisation letter template downloaded')}>Get the authorisation letter template</button></p>
      </div>
      {DOCS.map((d) => (
        <div key={d.key} className="field">
          <span>{d.title}{!d.required && <span className="muted"> (optional)</span>}</span>
          {docs[d.key] ? (
            <div className="emp-file">
              <span className="ic"><FileText size={18} /></span>
              <div className="grow"><b>{docs[d.key]}</b><small>{d.size} · uploaded</small></div>
              <button className="btn ghost sm icon" aria-label={'Remove ' + d.title} onClick={() => setDocs({ ...docs, [d.key]: null })}><X /></button>
            </div>
          ) : (
            <button type="button" className={'dropzone emp-drop'} style={err && d.required ? { borderColor: 'var(--badFill)' } : undefined} onClick={() => setDocs({ ...docs, [d.key]: d.file(ssm) })}>
              <span className="ic"><Upload size={20} /></span>
              <b>Click to upload</b>
              <small>{d.note}</small>
            </button>
          )}
        </div>
      ))}
      {err && <Callout tone="bad" icon={AlertTriangle}>Upload the SSM certificate and the letter of authorisation to continue.</Callout>}
      <Callout icon={ShieldCheck}>Without the JTK Sabah permit you can still pay for workers who agree, as a company cost. SCANS blocks any deduction from wages until a permit is on file.</Callout>
    </div>
  )
}

function Review({ company, pic, docs, go, agree, setAgree }) {
  const sec = (title, step, rows) => (
    <div className="sec">
      <div className="row between" style={{ marginBottom: 10 }}><h3>{title}</h3><button className="btn ghost sm" onClick={() => go(step)}>Change</button></div>
      <dl className="kv">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </div>
  )
  return (
    <div className="stack emp-review" style={{ gap: 0 }}>
      <div style={{ marginBottom: 6 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Check and submit</h2>
        <p className="ink2" style={{ marginTop: 4 }}>Microtek checks every sign-up before the account opens.</p>
      </div>
      {sec('Company', 0, [['Registered name', company.name], ['SSM number', company.ssm], ['Sector', company.sector], ['District', company.district], ['Foreign workers in eNORES', `${num(company.workers)} workers`], ['eNORES employer code', company.enores]])}
      {sec('Person in charge', 1, [['Name', pic.name], ['MyKad number', pic.ic], ['Role', pic.role], ['Work email', pic.email], ['Mobile number', pic.phone], ['2-step sign-in', pic.twofa === 'app' ? 'Authenticator app' : 'SMS code']])}
      {sec('Documents', 2, DOCS.map((d) => [d.title, docs[d.key] || (d.required ? 'Missing' : 'Not added, you can add it later')]))}
      <label className="check" style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'var(--surface2)' }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>I declare that the information is true and that I am authorised to act for {company.name}. I understand that workers are responsible for their own contribution, that the company may pay only for workers who agree, and that wages may be deducted only with a JTK Sabah permit under section 113(4) of the Labour Ordinance.</span>
      </label>
    </div>
  )
}

export default function Register() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [ssm, setSsm] = useState('')
  const [company, setCompany] = useState(null)
  const [pic, setPic] = useState({ name: '', ic: '', role: '', email: '', phone: '', twofa: 'app' })
  const [errs, setErrs] = useState({})
  const [docs, setDocs] = useState({ ssm: null, auth: null, permit: null })
  const [docErr, setDocErr] = useState(false)
  const [agree, setAgree] = useState(false)
  const [phase, setPhase] = useState('intro') // intro | form | sending | done
  useEffect(() => { window.scrollTo(0, 0) }, [step, phase])
  useEffect(() => {
    if (phase !== 'sending') return
    const t = setTimeout(() => setPhase('done'), 1400)
    return () => clearTimeout(t)
  }, [phase])

  const next = () => {
    if (step === 1) {
      const e = {}
      if (pic.name.trim().length < 3) e.name = 'Enter the full name as it appears on the MyKad.'
      if (!/^\d{6}-?\d{2}-?\d{4}$/.test(pic.ic.trim())) e.ic = 'Enter the 12-digit MyKad number, for example 850412-12-5521.'
      if (!pic.role) e.role = 'Choose the person’s role.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pic.email.trim())) e.email = 'Enter a work email address, for example name@company.com.my.'
      const digits = pic.phone.replace(/\D/g, '')
      if (!/^(60)?0?1\d{8,9}$/.test(digits)) e.phone = 'Enter a Malaysian mobile number, for example 012-345 6789.'
      setErrs(e)
      if (Object.keys(e).length) return
    }
    if (step === 2) {
      if (!docs.ssm || !docs.auth) { setDocErr(true); return }
      setDocErr(false)
    }
    setStep(step + 1)
  }

  const canNext = step === 0 ? !!company : true

  return (
    <div className="solo emp-solo">
      <header className="solo-top">
        <Link to="/" aria-label="SCANS home"><Logo width={160} /></Link>
        <div className="row" style={{ gap: 14 }}>
          <span className="who">Employer sign-up</span>
          <Link to="/login" className="btn outline sm">Sign in</Link>
        </div>
      </header>
      <main className="solo-body">
        {phase === 'intro' ? (
          <div className="emp-intro">
            <span className="pill info">Employer portal</span>
            <h1>Register your company on SCANS</h1>
            <p>For employers of foreign workers in Sabah. See each worker’s contribution status and, with their consent, pay for them in one go. The worker stays responsible for their own contribution.</p>
            <div className="emp-benefits">
              {[
                [Database, 'Records from SSM and eNORES', 'Your company and your foreign workers are filled in for you. Nothing to type twice.'],
                [CheckCircle2, 'Contribution status for every worker', 'Paid, not paid yet or owing. Never wages, complaints or immigration details.'],
                [ShieldCheck, 'Pay safely with FPX', 'Batch payments and monthly auto-pay go straight to the State’s FWECF account.'],
              ].map(([Icon, t, d]) => (
                <Card key={t}><span className="emp-ic"><Icon size={20} /></span><b>{t}</b><p>{d}</p></Card>
              ))}
            </div>
            <Card style={{ width: '100%' }}>
              <div className="emp-need">
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>You will need</h2>
                <div className="emp-rows">
                  {[
                    [FileText, 'Your 12-digit SSM registration number', 'We check it with SSM and eNORES (JTK Sabah)'],
                    [Upload, 'SSM certificate and a signed letter of authorisation', 'PDF or a clear photo, up to 10 MB each'],
                    [Smartphone, 'The person in charge’s MyKad number and mobile phone', 'For 2-step sign-in. It takes about 5 minutes'],
                  ].map(([Icon, t, d]) => (
                    <div key={t}><span className="emp-ic"><Icon size={18} /></span><div className="grow"><b>{t}</b><small>{d}</small></div></div>
                  ))}
                </div>
              </div>
            </Card>
            <div className="row wrap" style={{ justifyContent: 'center' }}>
              <button className="btn primary lg" onClick={() => setPhase('form')}>Start registration <ArrowRight /></button>
            </div>
            <p className="small muted">Already registered? <Link to="/login">Sign in</Link></p>
            <div className="chips" style={{ justifyContent: 'center' }} aria-label="Sectors on SCANS">
              {sectors.map((x) => <span key={x.name} className="chip">{x.name}</span>)}
            </div>
            <p className="small muted">Every sign-up is checked by Microtek before the account opens.</p>
          </div>
        ) : phase === 'done' ? (
          <Card>
            <div className="emp-state">
              <span className="emp-badge"><CheckCircle2 /></span>
              <h2>Sign-up submitted</h2>
              <p>Submitted for review by Microtek, usually within 2 working days. We will email {pic.email || 'the person in charge'} when the account is ready.</p>
              <span className="pill info num">Reference AP-1183</span>
              <div className="emp-rows" style={{ textAlign: 'left', width: 'min(520px, 100%)', marginTop: 10 }}>
                {[
                  ['Microtek checks your documents', 'Against SSM and eNORES. We will email you if anything is missing.'],
                  ['You get a sign-in link', `${pic.name || 'The person in charge'} sets a password and 2-step sign-in.`],
                  ['Invite colleagues and start paying', 'Only for workers who agree in the SCANS app.'],
                ].map(([t, d], i) => (
                  <div key={t}><span className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{i + 1}</span><div className="grow"><b>{t}</b><small>{d}</small></div></div>
                ))}
              </div>
              <div className="row wrap" style={{ justifyContent: 'center', marginTop: 12 }}>
                <Link to="/" className="btn outline">Back to home</Link>
                <button className="btn primary" onClick={() => nav('/employer')}>Open the demo dashboard <ArrowRight /></button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-.025em' }}>Register your company</h1>
              <p className="ink2" style={{ marginTop: 4 }}>For employers of foreign workers in Sabah. It takes about 5 minutes. Have your SSM certificate and a signed letter of authorisation ready.</p>
            </div>
            <Card style={{ padding: '18px 20px' }}><Stepper steps={STEPS} current={step} /></Card>
            <Card>
              {phase === 'sending' ? (
                <div className="emp-state" role="status"><div className="emp-spin" aria-hidden="true" /><h2>Sending your sign-up</h2><p>Please wait a moment.</p></div>
              ) : (
                <>
                  {step === 0 && <Verify ssm={ssm} setSsm={setSsm} company={company} setCompany={setCompany} />}
                  {step === 1 && <Pic pic={pic} setPic={(p) => { setPic(p); setErrs({}) }} errs={errs} />}
                  {step === 2 && <Docs docs={docs} setDocs={(d) => { setDocs(d); setDocErr(false) }} ssm={company.ssm} err={docErr} />}
                  {step === 3 && <Review company={company} pic={pic} docs={docs} go={setStep} agree={agree} setAgree={setAgree} />}
                  <div className="row between" style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line2)' }}>
                    {step === 0 ? <button className="btn outline" onClick={() => setPhase('intro')}><ArrowLeft /> Back</button> : <button className="btn outline" onClick={() => setStep(step - 1)}><ArrowLeft /> Back</button>}
                    {step < 3
                      ? <button className="btn primary" disabled={!canNext} onClick={next}>Next <ArrowRight /></button>
                      : <button className="btn primary" disabled={!agree} onClick={() => setPhase('sending')}><Send /> Submit for review</button>}
                  </div>
                </>
              )}
            </Card>
            <p className="small muted" style={{ textAlign: 'center' }}>Your details are used only to run SCANS, under the Personal Data Protection Act 2010. The State owns the data.</p>
          </>
        )}
      </main>
    </div>
  )
}
