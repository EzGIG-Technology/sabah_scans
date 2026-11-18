import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, Search, Plus, Trash2, Store, FileUp, FileCheck2, AlertTriangle, Info, Send, ShieldCheck, Mail, KeyRound, Tag, Building2, Gift, Lock, X } from 'lucide-react'
import { Logo, Stepper, Field, Callout, Empty } from '../../components/ui.jsx'
import { districtOptions, districtName, categories } from './data.js'

const STEPS = ['Company', 'Person in charge', 'Outlets', 'Documents', 'Review']
const SSM = {
  '202301045512': { name: 'Borneo Mart Sdn Bhd', category: 'Convenience store', registered: '14 Nov 2023', brand: 'Borneo Mart' },
  '201801029934': { name: 'Klinik Gigi Sentosa Sdn Bhd', category: 'Clinic', registered: '9 Aug 2018', brand: 'Klinik Gigi Sentosa' },
  '198401015607': { name: '7-Eleven Malaysia Sdn Bhd', category: 'Convenience store', registered: '1984', partner: '7-Eleven Sabah' },
}
const DOCS = [
  { k: 'ssm', t: 'SSM certificate', s: 'Form 9, Section 17 or the e-Info company profile', file: 'SSM_certificate.pdf', size: '412 KB' },
  { k: 'licence', t: 'Business licence', s: 'Premises licence from your local council (PBT)', file: 'Lesen_perniagaan_2027.pdf', size: '286 KB' },
  { k: 'auth', t: 'Authorisation letter', s: 'Letter from a director naming the person in charge', file: 'Authorisation_letter.pdf', size: '138 KB' },
]

export default function Register() {
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const [tried, setTried] = useState(false)
  // Company
  const [ssm, setSsm] = useState('')
  const [lookup, setLookup] = useState({ state: 'idle' }) // idle | checking | found | notfound | partner | format
  const [brand, setBrand] = useState('')
  const [cat, setCat] = useState('Groceries')
  // Person in charge
  const [pic, setPic] = useState({ name: '', title: '', email: '', phone: '' })
  // Outlets
  const [outlets, setOutlets] = useState([])
  const [draft, setDraft] = useState({ name: '', district: 'kk', address: '' })
  const [outletTried, setOutletTried] = useState(false)
  // Documents
  const [docs, setDocs] = useState({})
  // Review
  const [decl, setDecl] = useState([false, false, false])

  const check = () => {
    const n = ssm.replace(/\D/g, '')
    if (n.length !== 12) { setLookup({ state: 'format' }); return }
    setLookup({ state: 'checking' })
    setTimeout(() => {
      const hit = SSM[n]
      if (!hit) setLookup({ state: 'notfound' })
      else if (hit.partner) setLookup({ state: 'partner', ...hit })
      else { setLookup({ state: 'found', ...hit }); setBrand(hit.brand); setCat(hit.category === 'Clinic' ? 'Health' : 'Groceries') }
    }, 800)
  }

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(pic.email)
  const phoneOk = pic.phone.replace(/\D/g, '').length >= 9
  const valid = [
    lookup.state === 'found' && brand.trim(),
    pic.name.trim() && pic.title.trim() && emailOk && phoneOk,
    outlets.length > 0,
    DOCS.every((d) => docs[d.k] === 'done'),
    decl.every(Boolean),
  ]
  const next = () => {
    setTried(true)
    if (!valid[step]) return
    setTried(false)
    setStep(step + 1)
    window.scrollTo(0, 0)
  }
  const submit = () => {
    setTried(true)
    if (!valid.every(Boolean)) return
    setSent(true)
    window.scrollTo(0, 0)
  }
  const addOutlet = () => {
    setOutletTried(true)
    if (!draft.name.trim() || !draft.address.trim()) return
    setOutlets([...outlets, { ...draft, id: Date.now() }])
    setDraft({ name: '', district: draft.district, address: '' })
    setOutletTried(false)
  }
  const upload = (k) => {
    setDocs((d) => ({ ...d, [k]: 'loading' }))
    setTimeout(() => setDocs((d) => ({ ...d, [k]: 'done' })), 700)
  }

  return (
    <div className="solo mx-solo">
      <header className="solo-top">
        <Link to="/" aria-label="SCANS home"><Logo width={160} /></Link>
        <span className="mx-solo-tag">Merchant partner sign-up</span>
        <Link to="/login?portal=merchant" className="btn ghost sm">Sign in</Link>
      </header>
      <main className="solo-body">
        {sent ? (
          <Success brand={brand} email={pic.email} outlets={outlets.length} />
        ) : (
          <>
            {step === 0 && <section className="card hero mx-reg-hero">
              <div className="grow">
                <h1>Give perks to workers who are up to date</h1>
                <p>Partner shops offer small savings to foreign workers whose SCANS contribution is paid. It takes about 10 minutes. Have your SSM number, business licence and an authorisation letter ready.</p>
              </div>
              <span className="mx-reg-ic"><Gift aria-hidden="true" /></span>
            </section>}

            <Stepper steps={STEPS} current={step} />

            <section className="card mx-reg-card">
              {step === 0 && (
                <div className="stack">
                  <div><h2>Company verification</h2><p className="muted small">We check your company against the SSM register.</p></div>
                  <Field label="SSM registration number" hint="12 digits, as on your SSM certificate" error={lookup.state === 'format' ? 'SSM numbers have 12 digits. Check the number on your certificate.' : undefined}>
                    <div className="mx-inline">
                      <input className={'input' + (lookup.state === 'found' ? ' ok' : lookup.state === 'notfound' || lookup.state === 'format' ? ' err' : '')} inputMode="numeric" value={ssm} placeholder="202301045512"
                        onChange={(e) => { setSsm(e.target.value.replace(/[^\d-]/g, '').slice(0, 14)); setLookup({ state: 'idle' }) }} onKeyDown={(e) => e.key === 'Enter' && check()} />
                      <button className="btn primary" onClick={check} disabled={!ssm || lookup.state === 'checking'}>{lookup.state === 'checking' ? <><span className="mx-spin" /> Checking</> : <><Search /> Check</>}</button>
                    </div>
                  </Field>
                  {lookup.state === 'idle' && <Callout icon={Info}>For this demo, try <button className="mx-linkbtn" onClick={() => setSsm('202301045512')}>202301045512</button>. Any other 12-digit number shows what happens when a company is not found.</Callout>}
                  {lookup.state === 'notfound' && (
                    <div className="mx-verify bad">
                      <AlertTriangle aria-hidden="true" />
                      <div><b>We could not find this SSM number</b><p>Check the 12 digits on your SSM certificate and try again. If the number is right, your company may be newly registered. Email partners@scans.sabah.gov.my and we will check it by hand.</p></div>
                    </div>
                  )}
                  {lookup.state === 'partner' && (
                    <div className="mx-verify warn">
                      <Info aria-hidden="true" />
                      <div><b>{lookup.name} is already a SCANS partner</b><p>It signed up as {lookup.partner}. Ask your company admin to invite you, or <Link to="/login?portal=merchant">sign in</Link>.</p></div>
                    </div>
                  )}
                  {lookup.state === 'found' && (
                    <>
                      <div className="mx-verify ok"><CheckCircle2 aria-hidden="true" /><div><b>Company found in the SSM register</b><p>Registered {lookup.registered} · Active</p></div></div>
                      <div className="form-grid">
                        <Field label="Registered name" full><input className="input" readOnly value={lookup.name} /></Field>
                        <Field label="Business type (SSM)"><input className="input" readOnly value={lookup.category} /></Field>
                        <Field label="Perk category"><select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
                        <Field label="Name shown to workers" full hint="Your shop name as workers know it" error={tried && !brand.trim() ? 'Enter the name workers know you by.' : undefined}>
                          <input className="input" value={brand} onChange={(e) => setBrand(e.target.value)} />
                        </Field>
                      </div>
                      <p className="small muted row" style={{ alignItems: 'flex-start' }}><Info size={15} style={{ flex: 'none', marginTop: 2 }} />Registered details come from SSM and cannot be changed here. If they are wrong, contact SSM first.</p>
                    </>
                  )}
                  {tried && lookup.state !== 'found' && lookup.state !== 'notfound' && lookup.state !== 'partner' && <Callout tone="bad">Check your SSM number before you continue.</Callout>}
                </div>
              )}

              {step === 1 && (
                <div className="stack">
                  <div><h2>Person in charge</h2><p className="muted small">This person manages offers and outlets, and is who Microtek contacts. They become the first admin.</p></div>
                  <div className="form-grid">
                    <Field label="Full name" error={tried && !pic.name.trim() ? 'Enter their full name.' : undefined}><input className="input" value={pic.name} onChange={(e) => setPic({ ...pic, name: e.target.value })} placeholder="As on their IC" /></Field>
                    <Field label="Job title" error={tried && !pic.title.trim() ? 'Enter their job title.' : undefined}><input className="input" value={pic.title} onChange={(e) => setPic({ ...pic, title: e.target.value })} placeholder="Operations manager" /></Field>
                    <Field label="Work email" hint="We send the sign-in link here" error={tried && !emailOk ? 'Enter a work email, for example name@company.com.my' : undefined}><input className="input" type="email" value={pic.email} onChange={(e) => setPic({ ...pic, email: e.target.value })} placeholder="name@company.com.my" /></Field>
                    <Field label="Mobile number" hint="For two-step sign-in codes" error={tried && !phoneOk ? 'Enter a Malaysian mobile number.' : undefined}>
                      <div className="mx-affix"><span>+60</span><input className="input" inputMode="tel" value={pic.phone} onChange={(e) => setPic({ ...pic, phone: e.target.value })} placeholder="12 345 6789" /></div>
                    </Field>
                  </div>
                  <Callout icon={KeyRound}>Every SCANS web user signs in with a password and a code sent to their phone.</Callout>
                </div>
              )}

              {step === 2 && (
                <div className="stack">
                  <div><h2>Outlets</h2><p className="muted small">Where workers can use your perks. Add the main ones now and the rest after you are approved.</p></div>
                  {outlets.length === 0 ? (
                    <Empty icon={Store} title="No outlets yet">Add at least one outlet below.</Empty>
                  ) : (
                    <div className="mx-reg-outlets">
                      {outlets.map((o) => (
                        <div key={o.id}>
                          <span className="mx-outlet-ic"><Store size={16} /></span>
                          <div className="grow"><b>{o.name}</b><small>{districtName(o.district)} · {o.address}</small></div>
                          <button className="btn ghost sm icon" aria-label={'Remove ' + o.name} onClick={() => setOutlets(outlets.filter((x) => x.id !== o.id))}><Trash2 /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mx-addbox">
                    <b>Add an outlet</b>
                    <div className="form-grid">
                      <Field label="Outlet name" error={outletTried && !draft.name.trim() ? 'Enter the outlet name.' : undefined}><input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={(brand || 'Shop') + ' Tanjung Aru'} /></Field>
                      <Field label="District"><select className="select" value={draft.district} onChange={(e) => setDraft({ ...draft, district: e.target.value })}>{districtOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</select></Field>
                      <Field label="Address" full error={outletTried && !draft.address.trim() ? 'Enter the street address.' : undefined}><input className="input" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Lot 5, Jalan Mat Salleh, 88100 Kota Kinabalu" /></Field>
                    </div>
                    <div><button className="btn" onClick={addOutlet}><Plus /> Add outlet</button></div>
                  </div>
                  {tried && outlets.length === 0 && <Callout tone="bad">Add at least one outlet to continue.</Callout>}
                </div>
              )}

              {step === 3 && (
                <div className="stack">
                  <div><h2>Documents</h2><p className="muted small">PDF or photo, up to 10 MB each. Microtek checks them by hand.</p></div>
                  {DOCS.map((d) => {
                    const st = docs[d.k]
                    return (
                      <div key={d.k} className={'dropzone mx-drop' + (st === 'done' ? ' done' : '') + (tried && st !== 'done' ? ' missing' : '')}>
                        <span className="mx-drop-ic">{st === 'done' ? <FileCheck2 /> : <FileUp />}</span>
                        <div className="grow">
                          <b>{d.t}</b>
                          <small>{st === 'done' ? `${d.file} · ${d.size}` : st === 'loading' ? 'Uploading…' : d.s}</small>
                        </div>
                        {st === 'done'
                          ? <button className="btn sm outline" onClick={() => setDocs({ ...docs, [d.k]: undefined })}><X /> Remove</button>
                          : <button className="btn sm" disabled={st === 'loading'} onClick={() => upload(d.k)}>{st === 'loading' ? <span className="mx-spin dark" /> : <FileUp />} Choose file</button>}
                      </div>
                    )
                  })}
                  {tried && !valid[3] && <Callout tone="bad">Upload all three documents to continue.</Callout>}
                  <Callout icon={Info}>No bank details are needed. SCANS does not pay merchants for perks.</Callout>
                </div>
              )}

              {step === 4 && (
                <div className="stack">
                  <div><h2>Check and send</h2><p className="muted small">Microtek reviews your sign-up before you can create offers.</p></div>
                  <ReviewBlock icon={Building2} title="Company" onEdit={() => setStep(0)} rows={[['Registered name', lookup.name], ['SSM number', ssm], ['Name shown to workers', brand], ['Perk category', cat]]} />
                  <ReviewBlock icon={Mail} title="Person in charge" onEdit={() => setStep(1)} rows={[['Name', pic.name], ['Job title', pic.title], ['Email', pic.email], ['Mobile', '+60 ' + pic.phone]]} />
                  <ReviewBlock icon={Store} title={`Outlets (${outlets.length})`} onEdit={() => setStep(2)} rows={outlets.map((o) => [o.name, districtName(o.district)])} />
                  <ReviewBlock icon={FileCheck2} title="Documents" onEdit={() => setStep(3)} rows={DOCS.map((d) => [d.t, d.file])} />
                  <div className="stack" style={{ gap: 12 }}>
                    {[
                      'I am authorised to sign up this company as a SCANS merchant partner.',
                      'We will not ask workers for personal details and will not use SCANS or worker data for advertising.',
                      'We understand that every offer is checked by Microtek before it goes live, and a perk counts as used only after our staff confirm it.',
                    ].map((t, i) => (
                      <label className="check" key={i}><input type="checkbox" checked={decl[i]} onChange={(e) => setDecl(decl.map((v, j) => (j === i ? e.target.checked : v)))} /><span>{t}</span></label>
                    ))}
                  </div>
                  {tried && !valid[4] && <Callout tone="bad">Tick all three boxes to send your sign-up.</Callout>}
                </div>
              )}

              <div className="mx-form-foot">
                {step > 0 ? <button className="btn outline" onClick={() => { setTried(false); setStep(step - 1) }}><ChevronLeft /> Back</button> : <Link className="btn outline" to="/">Cancel</Link>}
                <span className="grow" />
                <span className="small muted mx-stepcount">Step {step + 1} of {STEPS.length}</span>
                {step < 4 ? <button className="btn primary" onClick={next}>Next <ChevronRight /></button> : <button className="btn primary" onClick={submit}><Send /> Send to Microtek</button>}
              </div>
            </section>
            <p className="small muted" style={{ textAlign: 'center' }}><Lock size={12} style={{ verticalAlign: -1 }} /> Your details are kept in Malaysia under the PDPA and used only to run SCANS.</p>
          </>
        )}
      </main>
    </div>
  )
}

function ReviewBlock({ icon: Icon, title, rows, onEdit }) {
  return (
    <div className="mx-review">
      <div className="row between"><b className="row" style={{ gap: 8 }}><Icon size={16} aria-hidden="true" />{title}</b><button className="btn ghost sm" onClick={onEdit}>Change</button></div>
      <dl className="kv">{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </div>
  )
}

function Success({ brand, email, outlets }) {
  return (
    <section className="card mx-success">
      <span className="mx-big-ic ok big"><CheckCircle2 aria-hidden="true" /></span>
      <h1>Sent to Microtek for review</h1>
      <p className="muted">Thank you. {brand} and {outlets} {outlets === 1 ? 'outlet are' : 'outlets are'} now waiting for review. Your reference is <b className="ink2" style={{ whiteSpace: 'nowrap' }}>MA-2706-015</b>.</p>
      <div className="mx-timeline wide" style={{ textAlign: 'left' }}>
        <div className="on"><span><Send size={14} /></span><div><b>Sign-up sent</b><small>Today</small></div></div>
        <div className="now"><span><ShieldCheck size={14} /></span><div><b>Microtek checks documents</b><small>Within 3 working days</small></div></div>
        <div><span><Mail size={14} /></span><div><b>Sign-in link by email</b><small>To {email}</small></div></div>
        <div><span><Tag size={14} /></span><div><b>Create your first offer</b><small>Checked before it goes live</small></div></div>
      </div>
      <div className="row wrap" style={{ justifyContent: 'center', marginTop: 8 }}>
        <Link className="btn outline" to="/">Back to home page</Link>
        <Link className="btn primary" to="/merchant">See a sample partner portal</Link>
      </div>
    </section>
  )
}
