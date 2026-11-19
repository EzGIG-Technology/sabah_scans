import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Camera, ScanLine, User, Wallet, CalendarDays, ShieldCheck, HandCoins, Landmark, MessageCircle, RotateCcw, AlertTriangle, UserCheck, Clock, Info, Sun, Glasses, Maximize } from 'lucide-react'
import { Logo } from '../../components/ui.jsx'
import { demoWorker as w, languages } from '../../data/demo.js'
import { useWk } from './shell.jsx'
import { Busy } from './kit.jsx'
import { langNote } from './i18n.js'

const STEPS = ['Language', 'Rules', 'Passport', 'Face', 'Your record']

const RULES = [
  { icon: Wallet, c: 'c-blue', t: 'RM100 a month', d: 'You can also pay RM300 for three months or RM1,200 for a year.' },
  { icon: CalendarDays, c: 'c-teal', t: 'Pay by the 5th', d: 'Use the app, cash at any 7-Eleven, or your employer if you agree to it.' },
  { icon: ShieldCheck, c: 'c-green', t: 'Paying late never touches your permit', d: 'SCANS cannot cancel permits, keep passports or stop you from travelling.' },
  { icon: HandCoins, c: 'c-orange', t: 'Your employer cannot cut your wages for this', d: 'Only if JTK Sabah has given them a written permit, and only with your consent.' },
  { icon: Landmark, c: 'c-navy', t: 'The money goes to the State', d: '70% stays with Kerajaan Negeri Sabah, 30% runs this service.' },
  { icon: MessageCircle, c: 'c-purple', t: 'You can complain', d: 'Use Help in the app, in your own language. We send it to the agency that can act on it.' },
]

const WRONG = ['Name', 'Passport number', 'Date of birth', 'Employer', 'Workplace', 'Permit details']

export default function Onboarding() {
  const loc = useLocation()
  const q = new URLSearchParams(loc.search)
  const demo = q.get('demo')
  const startStep = Math.min(4, Math.max(0, (parseInt(q.get('step'), 10) || 1) - 1))
  const nav = useNavigate()
  const { lang, setLang, t, toast } = useWk()

  const [step, setStep] = useState(startStep)
  const [agree, setAgree] = useState(false)
  const [scan, setScan] = useState('idle')
  const [face, setFace] = useState('idle')
  const [failScan, setFailScan] = useState(demo === 'scanfail')
  const [failFace, setFailFace] = useState(demo === 'facefail')
  const [review, setReview] = useState(demo === 'review' ? 'record' : null) // null | 'record' | 'face'
  const [sent, setSent] = useState(false)
  const [wrong, setWrong] = useState([])
  const [finding, setFinding] = useState(false)
  const [finished, setFinished] = useState(false)

  // A new quick link from the side panel resets the flow to that point.
  useEffect(() => {
    setStep(startStep); setScan('idle'); setFace('idle'); setSent(false); setWrong([])
    setFailScan(demo === 'scanfail'); setFailFace(demo === 'facefail'); setReview(demo === 'review' ? 'record' : null)
    if (startStep > 1) setAgree(true)
  }, [loc.search]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scan !== 'busy') return
    const id = setTimeout(() => { setScan(failScan ? 'failed' : 'done'); setFailScan(false) }, 1600)
    return () => clearTimeout(id)
  }, [scan, failScan])
  useEffect(() => {
    if (face !== 'busy') return
    const id = setTimeout(() => { setFace(failFace ? 'mismatch' : 'done'); setFailFace(false) }, 1800)
    return () => clearTimeout(id)
  }, [face, failFace])

  // Looking up the record in SWIMS and eNORES before step 5 shows it.
  useEffect(() => {
    if (step !== 4 || demo === 'review') return
    setFinding(true)
    const id = setTimeout(() => setFinding(false), 1500)
    return () => clearTimeout(id)
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!finished) return
    const id = setTimeout(() => { toast('Welcome to SCANS'); nav('/worker') }, 2200)
    return () => clearTimeout(id)
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) return (
    <div className="wk-onb">
      <section className="wk-onb-body wk-allset" role="status">
        <div className="wk-badge-mark"><Check aria-hidden="true" /></div>
        <h1 className="wk-h1 center">You are all set</h1>
        <p className="wk-lead center">Your SCANS account is ready. Taking you to your home screen…</p>
        <span className="wk-splash-bar" aria-hidden="true"><i /></span>
      </section>
    </div>
  )

  const back = () => {
    if (review) { setReview(null); setSent(false); return }
    if (step === 0) nav('/')
    else setStep(step - 1)
  }
  const next = () => setStep((s) => s + 1)

  if (review) return <Review kind={review} sent={sent} wrong={wrong} setWrong={setWrong} onBack={back} onSend={() => setSent(true)} onDone={() => { toast('Welcome to SCANS'); nav('/worker') }} />

  return (
    <div className="wk-onb">
      <header className="wk-onb-top">
        <button type="button" className="wk-ib" aria-label={step === 0 ? 'Back to the main site' : 'Back'} onClick={back}><ArrowLeft aria-hidden="true" /></button>
        <div className="wk-prog" aria-hidden="true">{STEPS.map((s, i) => <i key={s} className={i < step ? 'done' : i === step ? 'on' : ''} />)}</div>
        <span className="wk-onb-count">Step {step + 1} of {STEPS.length}</span>
      </header>

      {step === 0 && (
        <section className="wk-onb-body">
          <div className="wk-onb-logo"><Logo width={150} /></div>
          <h1 className="wk-h1 center">{t.chooseLang}</h1>
          <p className="wk-lead center">{t.langLead}</p>
          <div className="wk-opts" role="radiogroup" aria-label="Language">
            {languages.map((l) => (
              <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} className="wk-opt" onClick={() => setLang(l.code)}>
                <span className="grow"><b>{l.label}</b><small>{langNote[l.code]}</small></span>
                <span className="radio" aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="wk-foot"><button type="button" className="btn primary lg block" onClick={next}>{t.continue}</button></div>
        </section>
      )}

      {step === 1 && (
        <section className="wk-onb-body">
          <h1 className="wk-h1">Before you start</h1>
          <p className="wk-lead">These are the six rules of the contribution, in plain words.</p>
          <ol className="wk-rules">
            {RULES.map((r) => (
              <li key={r.t}>
                <span className={'wk-bub ' + r.c}><r.icon aria-hidden="true" /></span>
                <div><b>{r.t}</b><p>{r.d}</p></div>
              </li>
            ))}
          </ol>
          <p className="wk-note"><Info aria-hidden="true" />Signing up is not an immigration check. It does not decide your status in Malaysia.</p>
          <div className="wk-foot">
            <label className="wk-consent">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I have read the six rules and agree to them</span>
            </label>
            <button type="button" className="btn primary lg block" disabled={!agree} onClick={next}>I agree, continue</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="wk-onb-body">
          <h1 className="wk-h1">Scan your passport</h1>
          <p className="wk-lead">Open your passport at the photo page and hold it inside the frame. We read the two lines at the bottom.</p>
          <div className={'wk-cam ' + scan} aria-live="polite">
            <div className="wk-cam-frame">
              <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
              <div className="wk-pp">
                <div className="wk-pp-top"><span className="ph"><User aria-hidden="true" /></span><span className="ln"><i /><i /><i className="s" /><i /></span></div>
                <div className="wk-mrz" aria-hidden="true">
                  <span>P&lt;IDNSALIM&lt;&lt;AGUS&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</span>
                  <span>C5539120&lt;0IDN9108127M3011045&lt;&lt;&lt;&lt;&lt;&lt;06</span>
                </div>
              </div>
              {scan === 'busy' && <i className="wk-scanline" aria-hidden="true" />}
            </div>
            <p className="wk-cam-cap">
              {scan === 'idle' && <><ScanLine aria-hidden="true" /> Fit the photo page inside the corners</>}
              {scan === 'busy' && <>Reading the passport. Hold still…</>}
              {scan === 'done' && <><Check aria-hidden="true" /> Passport read</>}
              {scan === 'failed' && <><AlertTriangle aria-hidden="true" /> We could not read it</>}
            </p>
          </div>

          {scan === 'done' && (
            <div className="wk-card wk-kv">
              <div><span>Name</span><b>{w.name.toUpperCase()}</b></div>
              <div><span>Passport</span><b className="num">{w.passport}</b></div>
              <div><span>Nationality</span><b>{w.nationality}</b></div>
              <div><span>Date of birth</span><b>12 Feb 1991</b></div>
            </div>
          )}
          {scan === 'failed' && (
            <div className="wk-alert">
              <b>The scan did not work</b>
              <p>Nothing was saved. This happens often. Try again with these tips:</p>
              <ul>
                <li><Sun aria-hidden="true" />Find good light and avoid shine on the page</li>
                <li><Maximize aria-hidden="true" />Lay the passport flat and fill the frame</li>
                <li><ScanLine aria-hidden="true" />Keep the two lines at the bottom in view</li>
              </ul>
            </div>
          )}

          <div className="wk-foot">
            {scan === 'done' && <>
              <button type="button" className="btn primary lg block" onClick={next}>These details are right</button>
              <button type="button" className="btn ghost block" onClick={() => setScan('idle')}><RotateCcw aria-hidden="true" /> Scan again</button>
            </>}
            {scan === 'failed' && <button type="button" className="btn primary lg block" onClick={() => setScan('busy')}><RotateCcw aria-hidden="true" /> Try again</button>}
            {(scan === 'idle' || scan === 'busy') && <>
              <button type="button" className="btn primary lg block" onClick={() => setScan('busy')} disabled={scan === 'busy'}><Camera aria-hidden="true" /> {scan === 'busy' ? 'Scanning…' : 'Scan passport'}</button>
              {scan === 'idle' && <button type="button" className="wk-demo" aria-pressed={failScan} onClick={() => setFailScan(!failScan)}>Demo: {failScan ? 'the next scan will fail' : 'make the next scan fail'}</button>}
            </>}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="wk-onb-body">
          <h1 className="wk-h1">Check it is you</h1>
          <p className="wk-lead">Look at the camera and blink when asked. We compare your face with the passport photo through KDN, once.</p>
          <div className={'wk-face ' + face} aria-live="polite">
            <div className="ring">
              {face === 'done' ? <Check aria-hidden="true" /> : face === 'mismatch' ? <AlertTriangle aria-hidden="true" /> : <User aria-hidden="true" strokeWidth={1.2} />}
            </div>
            <b>
              {face === 'idle' && 'Put your face inside the circle'}
              {face === 'busy' && 'Blink now…'}
              {face === 'done' && 'Matched with your passport photo'}
              {face === 'mismatch' && 'We could not confirm it is you'}
            </b>
            {face === 'idle' && <span className="tips"><span><Glasses aria-hidden="true" /> No cap or glasses</span><span><Sun aria-hidden="true" /> Good light</span></span>}
          </div>
          {face === 'mismatch' && (
            <div className="wk-alert">
              <b>This does not mean anything is wrong with you</b>
              <p>Photos can differ because of light, age or the camera. Try once more, or ask a person to check. Nothing changes on your record and it is not a rejection.</p>
            </div>
          )}
          <div className="wk-foot">
            {face === 'done' && <button type="button" className="btn primary lg block" onClick={next}>Continue</button>}
            {face === 'mismatch' && <>
              <button type="button" className="btn primary lg block" onClick={() => setFace('busy')}><RotateCcw aria-hidden="true" /> Try again</button>
              <button type="button" className="btn ghost block" onClick={() => setReview('face')}><UserCheck aria-hidden="true" /> Ask a person to check</button>
            </>}
            {(face === 'idle' || face === 'busy') && <>
              <button type="button" className="btn primary lg block" onClick={() => setFace('busy')} disabled={face === 'busy'}>{face === 'busy' ? 'Checking…' : 'Start face check'}</button>
              {face === 'idle' && <button type="button" className="wk-demo" aria-pressed={failFace} onClick={() => setFailFace(!failFace)}>Demo: {failFace ? 'the next check will not match' : 'make the next check not match'}</button>}
            </>}
          </div>
        </section>
      )}

      {step === 4 && finding && <Busy label="Finding your record…" sub="Checking SWIMS (Sabah State) and eNORES (JTK Sabah)" />}
      {step === 4 && (
        <section className="wk-onb-body">
          <h1 className="wk-h1">We found your record</h1>
          <p className="wk-lead">This comes from the State’s records. Check it carefully. If something is wrong, a person will check it and you can still use the app.</p>
          <div className="wk-src"><span className="pill info">From SWIMS, Sabah State</span><span className="pill info">From eNORES, JTK Sabah</span></div>
          <div className="wk-card wk-kv">
            <div><span>Name</span><b>{w.name}</b></div>
            <div><span>SCANS ID</span><b className="num">{w.scansId}</b></div>
            <div><span>Work permit (PLKS)</span><b className="num">{w.plks}</b></div>
            <div><span>Permit valid until</span><b>{w.permitExpiry}</b></div>
            <div><span>Employer</span><b>{w.employer}</b></div>
            <div><span>Workplace</span><b>{w.site}</b></div>
          </div>
          <div className="wk-foot">
            <button type="button" className="btn primary lg block" onClick={() => setFinished(true)}>Everything is right</button>
            <button type="button" className="btn ghost block" onClick={() => setReview('record')}>Something is wrong</button>
          </div>
        </section>
      )}
    </div>
  )
}

function Review({ kind, sent, wrong, setWrong, onBack, onSend, onDone }) {
  const toggle = (x) => setWrong(wrong.includes(x) ? wrong.filter((y) => y !== x) : [...wrong, x])
  if (sent) return (
    <div className="wk-onb">
      <header className="wk-onb-top"><span className="wk-ib-sp" /><div className="grow" /><span className="wk-onb-count">Sent</span></header>
      <section className="wk-onb-body">
        <div className="wk-done-mark info"><UserCheck aria-hidden="true" /></div>
        <h1 className="wk-h1 center">A person will check it</h1>
        <p className="wk-lead center">This is a manual review, not a rejection. You can use the app while we check.</p>
        <div className="wk-card">
          <div className="wk-ref"><span>Reference</span><b className="num">REV-2712-0312</b></div>
          <ol className="wk-timeline">
            <li className="done"><b>Sent today</b><span>{kind === 'face' ? 'Your face check and passport photo' : 'What you said is wrong: ' + (wrong.length ? wrong.join(', ').toLowerCase() : 'your details')}</span></li>
            <li className="on"><b>Checked by a SCANS officer</b><span>{kind === 'face' ? 'Compared again with KDN by a person' : 'Compared with SWIMS and eNORES'}, within 3 working days</span></li>
            <li><b>We tell you by SMS</b><span>And in Notices in this app</span></li>
          </ol>
        </div>
        <p className="wk-note"><ShieldCheck aria-hidden="true" />Nothing about your permit or passport changes while we check.</p>
        <div className="wk-foot"><button type="button" className="btn primary lg block" onClick={onDone}>Go to my home screen</button></div>
      </section>
    </div>
  )
  return (
    <div className="wk-onb">
      <header className="wk-onb-top">
        <button type="button" className="wk-ib" aria-label="Back" onClick={onBack}><ArrowLeft aria-hidden="true" /></button>
        <div className="grow" />
        <span className="wk-onb-count">Manual review</span>
      </header>
      <section className="wk-onb-body">
        <h1 className="wk-h1">{kind === 'face' ? 'Ask a person to check' : 'Tell us what is wrong'}</h1>
        <p className="wk-lead">{kind === 'face'
          ? 'A SCANS officer will look at your passport photo and the face check by hand.'
          : 'Pick everything that is wrong. A SCANS officer checks it against the State’s records by hand.'}</p>
        {kind === 'record' && (
          <div className="wk-chips" role="group" aria-label="What is wrong">
            {WRONG.map((x) => <button key={x} type="button" className="chip" aria-pressed={wrong.includes(x)} onClick={() => toggle(x)}>{wrong.includes(x) && <Check aria-hidden="true" />}{x}</button>)}
          </div>
        )}
        <label className="wk-field">
          <span>Anything else we should know? (optional)</span>
          <textarea className="input" rows={4} placeholder="Write in any language" />
        </label>
        <p className="wk-note"><Clock aria-hidden="true" />We answer within 3 working days. This is never a rejection.</p>
        <div className="wk-foot"><button type="button" className="btn primary lg block" disabled={kind === 'record' && wrong.length === 0} onClick={onSend}>Send for checking</button></div>
      </section>
    </div>
  )
}
