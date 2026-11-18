import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Globe, Wallet, QrCode, Languages, Fingerprint, MessageSquare, ShieldCheck } from 'lucide-react'
import { Logo } from '../../components/ui.jsx'
import { demoWorker as w, languages } from '../../data/demo.js'
import { useWk, useTone } from './shell.jsx'
import { Busy, LangSheet } from './kit.jsx'

/* =====================================================================
   /worker/welcome  Splash, then a three-step carousel (Sabah GO pattern)
   ===================================================================== */
const SLIDES = [
  { img: '/img/portal-worker.jpg', icon: Wallet, k: 's1' },
  { img: '/img/hero.jpg', icon: QrCode, k: 's2' },
  { img: '/img/helpdesk.jpg', icon: Languages, k: 's3' },
]

export function Welcome() {
  const loc = useLocation()
  const nav = useNavigate()
  const { t, lang } = useWk()
  const skipSplash = new URLSearchParams(loc.search).get('slide') !== null
  const [phase, setPhase] = useState(skipSplash ? 'slides' : 'splash')
  const [i, setI] = useState(Math.min(2, parseInt(new URLSearchParams(loc.search).get('slide'), 10) || 0))
  const [langOpen, setLangOpen] = useState(false)
  const touch = useRef(null)
  useTone(phase === 'splash' ? 'dark' : 'light')

  useEffect(() => {
    if (phase !== 'splash') return
    const id = setTimeout(() => setPhase('slides'), 1900)
    return () => clearTimeout(id)
  }, [phase])

  if (phase === 'splash') return (
    <div className="wk-splash" role="status" aria-label={t.loading}>
      <div className="wk-splash-mid">
        <Logo width={200} />
        <p>{t.tagline}</p>
        <span className="wk-splash-bar" aria-hidden="true"><i /></span>
      </div>
      <p className="wk-splash-foot">For Kerajaan Negeri Sabah</p>
    </div>
  )

  const s = SLIDES[i]
  const last = i === SLIDES.length - 1
  const go = (n) => setI(Math.max(0, Math.min(SLIDES.length - 1, n)))
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touch.current == null) return
    const dx = e.changedTouches[0].clientX - touch.current
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1))
    touch.current = null
  }
  return (
    <div className="wk-car" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="wk-car-photo" style={{ backgroundImage: `url(${s.img})` }} key={s.img}>
        <div className="wk-car-top">
          <button type="button" className="wk-chip-glass" onClick={() => setLangOpen(true)} aria-label={t.changeLang + ': ' + languages.find((l) => l.code === lang)?.label}>
            <Globe aria-hidden="true" /> {languages.find((l) => l.code === lang)?.label.split(' (')[0]}
          </button>
          {!last && <button type="button" className="wk-chip-glass" onClick={() => go(SLIDES.length - 1)}>{t.skip}</button>}
        </div>
      </div>
      <section className="wk-car-body" aria-roledescription="carousel" aria-label="About SCANS">
        <div className="wk-car-slide" key={i} aria-live="polite">
          <span className="wk-eyebrow"><span className="ic"><s.icon aria-hidden="true" /></span>{t[s.k + 'e']}</span>
          <h1 className="wk-two-tone">{t[s.k + 'a']} <em>{t[s.k + 'b']}</em></h1>
          <p>{t[s.k + 'd']}</p>
        </div>
        <div className="wk-car-foot">
          <div className="wk-dots" role="tablist" aria-label="Slides">
            {SLIDES.map((x, n) => (
              <button key={x.k} type="button" role="tab" aria-selected={n === i} aria-label={'Slide ' + (n + 1) + ' of 3'} onClick={() => go(n)}><i /></button>
            ))}
          </div>
          {last
            ? <button type="button" className="btn primary lg" onClick={() => nav('/worker/signin?tab=up')}>{t.getStarted} <ArrowRight aria-hidden="true" /></button>
            : <button type="button" className="btn primary lg" onClick={() => go(i + 1)}>{t.next} <ArrowRight aria-hidden="true" /></button>}
        </div>
        {last && <button type="button" className="btn ghost block" onClick={() => nav('/worker/signin')}>{t.signIn}</button>}
      </section>
      {langOpen && <LangSheet onClose={() => setLangOpen(false)} />}
    </div>
  )
}

/* =====================================================================
   /worker/signin  Sign up or sign in with phone and SMS code
   ===================================================================== */
const PHONE = w.phone.replace('+60 ', '')

export function SignIn() {
  const loc = useLocation()
  const nav = useNavigate()
  const { t, tf, toast } = useWk()
  const q = new URLSearchParams(loc.search)
  const [tab, setTab] = useState(q.get('tab') === 'up' ? 'up' : 'in')
  const [step, setStep] = useState('phone') // phone | code | faster
  const [phone, setPhone] = useState(PHONE)
  const [agree, setAgree] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(null)
  const [wait, setWait] = useState(30)
  const [err, setErr] = useState('')
  const codeRef = useRef(null)
  useTone('dark')

  useEffect(() => { setTab(q.get('tab') === 'up' ? 'up' : 'in'); setStep('phone'); setCode(''); setErr('') }, [loc.search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step !== 'code' || wait <= 0) return
    const id = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(id)
  }, [step, wait])
  useEffect(() => { if (step === 'code') codeRef.current?.focus() }, [step])

  const digits = phone.replace(/\D/g, '')
  const phoneOk = digits.length >= 9 && digits.length <= 11
  const run = (label, then, ms = 1500) => { setBusy(label); setTimeout(() => { setBusy(null); then() }, ms) }

  const sendCode = (e) => {
    e.preventDefault()
    if (!phoneOk) { setErr('Enter a Malaysian mobile number, for example 11-2847 3391.'); return }
    setErr(''); setWait(30); setStep('code')
  }
  const verify = (e) => {
    e?.preventDefault()
    if (code.length !== 6) { setErr('Enter all 6 digits from the SMS.'); return }
    if (code === '000000') { setErr('That code is not right. Check the SMS and try again, or send a new code.'); return }
    setErr('')
    if (tab === 'up') run(t.creating, () => nav('/worker/start'), 1700)
    else run(t.checking, () => setStep('faster'))
  }

  if (step === 'faster') return (
    <div className="wk-onb">
      <section className="wk-onb-body wk-faster">
        <div className="wk-bigic"><Fingerprint aria-hidden="true" /></div>
        <h1 className="wk-h1 center">{t.faster}</h1>
        <p className="wk-lead center">{t.fasterLead}</p>
        <p className="wk-note"><ShieldCheck aria-hidden="true" />Your fingerprint and face stay on your phone. SCANS never receives them.</p>
        <div className="wk-foot">
          <button type="button" className="btn primary lg block" onClick={() => { try { const o = JSON.parse(localStorage.getItem('scans-notif') || '{}'); localStorage.setItem('scans-notif', JSON.stringify({ ...o, bio: true })) } catch { /* private mode */ } toast('Fingerprint sign-in is on'); nav('/worker') }}>{t.turnOn}</button>
          <button type="button" className="btn ghost block" onClick={() => nav('/worker')}>{t.notNow}</button>
        </div>
      </section>
    </div>
  )

  return (
    <div className="wk-onb">
      <header className="wk-onb-top">
        <button type="button" className="wk-ib" aria-label="Back" onClick={() => (step === 'code' ? (setStep('phone'), setCode(''), setErr('')) : nav('/worker/welcome?slide=2'))}><ArrowLeft aria-hidden="true" /></button>
        <div className="grow" />
      </header>
      <section className="wk-onb-body">
        <Logo width={120} />
        <h1 className="wk-h1">{step === 'code' ? t.enterCode : tab === 'up' ? t.createAcc : t.welcomeBack}</h1>
        <p className="wk-lead">{step === 'code' ? tf('sentTo', { p: '+60 ' + phone }) : tab === 'up' ? t.signUpLead : t.signInLead}</p>

        {step === 'phone' && (
          <>
            <div className="seg wk-seg" role="tablist" aria-label="Account">
              <button type="button" role="tab" aria-selected={tab === 'up'} onClick={() => { setTab('up'); setErr('') }}>{t.signUp}</button>
              <button type="button" role="tab" aria-selected={tab === 'in'} onClick={() => { setTab('in'); setErr('') }}>{t.signIn}</button>
            </div>
            <form className="wk-form" onSubmit={sendCode} noValidate>
              <label className="wk-field">
                <span>{t.phone}</span>
                <span className={'wk-phonein' + (err ? ' bad' : '')}>
                  <span className="cc">+60</span>
                  <input className="input" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!err} aria-describedby="ph-hint" />
                </span>
                <small id="ph-hint" className={err ? 'wk-err' : 'wk-hint'}>{err || t.phoneHint}</small>
              </label>
              {tab === 'up' && (
                <label className="wk-consent">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>{t.privacyAgree}</span>
                </label>
              )}
              <button type="submit" className="btn primary lg block" disabled={tab === 'up' && !agree}><MessageSquare aria-hidden="true" /> {t.sendCode}</button>
            </form>
            {tab === 'up' && <p className="wk-note">Next you choose your language, read the six rules, scan your passport and check your face. It takes about 5 minutes.</p>}
          </>
        )}

        {step === 'code' && (
          <form className="wk-form" onSubmit={verify} noValidate>
            <label className="wk-otp" onClick={() => codeRef.current?.focus()}>
              <span className="sr">6-digit code</span>
              <input ref={codeRef} className="wk-otp-in" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setCode(v); setErr('') }} aria-invalid={!!err} aria-describedby="otp-msg" />
              <span className="boxes" aria-hidden="true">
                {Array.from({ length: 6 }, (_, n) => <i key={n} className={(n === code.length ? 'on' : '') + (code[n] ? ' full' : '')}>{code[n] || ''}</i>)}
              </span>
            </label>
            <small id="otp-msg" className={err ? 'wk-err' : 'wk-hint'}>{err || 'Demo: type any 6 digits. 000000 shows the wrong-code message.'}</small>
            <button type="submit" className="btn primary lg block" disabled={code.length !== 6}>{tab === 'up' ? t.continue : t.signIn}</button>
            {wait > 0
              ? <p className="wk-hint center">{tf('resendIn', { n: wait })}</p>
              : <button type="button" className="btn ghost block" onClick={() => { setWait(30); toast('A new code is on its way') }}>{t.resend}</button>}
          </form>
        )}
      </section>
      {busy && <Busy label={busy} sub={tab === 'up' ? 'Then we check your passport and face with KDN' : undefined} />}
    </div>
  )
}
