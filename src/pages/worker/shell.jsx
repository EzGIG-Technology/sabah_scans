import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Gift, Bell, User, Wallet, ArrowLeft, WifiOff, CheckCircle2, X } from 'lucide-react'
import { Logo } from '../../components/ui.jsx'
import { demoWorker as w, languages } from '../../data/demo.js'
import { dict, fill } from './i18n.js'

/* =====================================================================
   App state: language, offline mode, in-app toast, status bar tone
   ===================================================================== */
const Ctx = createContext(null)
export const useWk = () => useContext(Ctx)

const read = (k, d) => { try { return localStorage.getItem(k) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } }

// Bengali and Nepali need a font with those scripts; load it only when chosen.
const SCRIPT_FONT = {
  bn: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap',
  ne: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap',
}
function useScriptFont(lang) {
  useEffect(() => {
    const href = SCRIPT_FONT[lang]
    if (!href || document.querySelector(`link[href="${href}"]`)) return
    const l = document.createElement('link')
    l.rel = 'stylesheet'; l.href = href
    document.head.appendChild(l)
  }, [lang])
}

export function WorkerProvider({ children }) {
  const [lang, setLangState] = useState(() => read('scans-lang', 'id'))
  const [offline, setOfflineState] = useState(() => read('scans-offline', '0') === '1')
  const [toastMsg, setToastMsg] = useState(null)
  const [tone, setTone] = useState('dark')
  const timer = useRef(0)
  useScriptFont(lang)
  const setLang = (l) => { setLangState(l); write('scans-lang', l) }
  const setOffline = (v) => { setOfflineState(v); write('scans-offline', v ? '1' : '0') }
  const toast = useCallback((m) => {
    setToastMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToastMsg(null), 3000)
  }, [])
  const t = dict[lang] || dict.en
  const tf = (key, vars) => fill(t[key], vars)
  return (
    <Ctx.Provider value={{ lang, setLang, t, tf, offline, setOffline, toast, toastMsg, tone, setTone }}>
      {children}
    </Ctx.Provider>
  )
}

/* Screens with a gradient top set the status bar to white text. */
export function useTone(v) {
  const { setTone } = useWk()
  useEffect(() => { setTone(v); return () => setTone('dark') }, [v, setTone])
}

/* =====================================================================
   Stage: phone frame centred on desktop with a side panel of quick links
   ===================================================================== */
const quick = [
  { group: 'First open', items: [
    ['Splash and intro', '/worker/welcome'],
    ['Sign in', '/worker/signin'],
    ['Create account', '/worker/signin?tab=up'],
  ] },
  { group: 'Sign-up', items: [
    ['Start sign-up', '/worker/start'],
    ['Passport scan fails', '/worker/start?step=3&demo=scanfail'],
    ['Face does not match', '/worker/start?step=4&demo=facefail'],
    ['Record is wrong', '/worker/start?step=5&demo=review'],
  ] },
  { group: 'Everyday', items: [
    ['Home', '/worker'],
    ['Pay', '/worker/pay'],
    ['Payment fails', '/worker/pay?demo=fail'],
    ['Receipt', '/worker/receipt/RCP-2705-118204'],
    ['Receipts', '/worker/history'],
    ['Perks', '/worker/perks'],
    ['Notices', '/worker/notices'],
    ['A notice', '/worker/notices/n2'],
    ['Help', '/worker/help'],
    ['Me', '/worker/me'],
    ['SCANS card', '/worker/card'],
    ['My details', '/worker/details'],
    ['Questions', '/worker/faq'],
    ['Assistant (preview)', '/worker/assistant'],
    ['Privacy', '/worker/privacy'],
  ] },
]

function SidePanel() {
  const { offline, setOffline, lang, setLang } = useWk()
  const nav = useNavigate()
  const loc = useLocation()
  const here = loc.pathname + loc.search
  return (
    <aside className="wk-side" aria-label="About this prototype">
      <Link to="/" className="wk-side-logo" aria-label="SCANS home"><Logo width={170} /></Link>
      <h1>The worker app</h1>
      <p className="wk-side-lead">Pay RM100 a month, keep every receipt and read notices from the State in your own language. Nothing in the app can touch a permit or a passport.</p>
      {quick.map((g) => (
        <div key={g.group} className="wk-side-group">
          <h2>{g.group}</h2>
          <div className="wk-side-links">
            {g.items.map(([label, to]) => (
              <button key={to} type="button" aria-current={here === to ? 'page' : undefined} onClick={() => nav(to)}>{label}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="wk-side-group">
        <h2>Try a state</h2>
        <label className="wk-side-toggle">
          <span><b>No connection</b><small>Status, card and receipts still show</small></span>
          <button type="button" className="switch" role="switch" aria-checked={offline} aria-label="No connection" onClick={() => setOffline(!offline)} />
        </label>
        <label className="wk-side-select">
          <span>App language</span>
          <select className="select" value={lang} onChange={(e) => setLang(e.target.value)}>
            {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </label>
      </div>
      <Link to="/" className="wk-side-back"><ArrowLeft size={16} aria-hidden="true" /> Back to the main site</Link>
      <p className="wk-side-note">Sample data. The demo worker is {w.name}, {w.role.toLowerCase()} at {w.site}.</p>
    </aside>
  )
}

function StatusBar({ tone }) {
  return (
    <div className={'wk-sb ' + tone} aria-hidden="true">
      <span>9:41</span>
      <i className="island" />
      <span className="wk-sb-ic">
        <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg viewBox="0 0 16 12"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.4A10.6 10.6 0 0 0 8 .6C5.2.6 2.6 1.7.7 3.6L2 5c1.6-1.5 3.7-2.4 6-2.4Zm0 3.8c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.7 6.7 0 0 0 8 4.4c-1.8 0-3.5.7-4.7 1.9l1.3 1.4c.9-.8 2.1-1.3 3.4-1.3Zm0 3.7L9.9 8a2.8 2.8 0 0 0-3.8 0L8 10.1Z" /></svg>
        <span className="batt"><i /></span>
      </span>
    </div>
  )
}

function BottomNav() {
  const { t } = useWk()
  const items = [
    { to: '/worker', label: t.home, icon: Home, end: true },
    { to: '/worker/perks', label: t.perks, icon: Gift },
    { to: '/worker/pay', label: t.pay, icon: Wallet, center: true },
    { to: '/worker/notices', label: t.notices, icon: Bell },
    { to: '/worker/me', label: t.me, icon: User },
  ]
  return (
    <nav className="wk-nav" aria-label="App">
      {items.map(({ to, label, icon: Icon, end, center }) => (
        <NavLink key={to} to={to} end={end} className={center ? 'center' : undefined}>
          {center ? <span className="ring"><Icon aria-hidden="true" /></span> : <Icon aria-hidden="true" />}
          <span className="lbl">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function Stage({ children }) {
  const loc = useLocation()
  const { tone, offline, t, toastMsg, lang } = useWk()
  const scroller = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const p = loc.pathname.replace(/\/$/, '')
  const flow = ['/worker/start', '/worker/welcome', '/worker/signin', '/worker/card', '/worker/assistant'].includes(p) || p.startsWith('/worker/pay') || p.startsWith('/worker/receipt')
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0
    window.scrollTo(0, 0)
    setScrolled(false)
  }, [loc.pathname, loc.search])
  const onScroll = (e) => setScrolled(e.currentTarget.scrollTop > 12)
  return (
    <div className="wk-stage">
      <SidePanel />
      <div className="wk-device">
        <div className={'wk-phone' + (flow ? ' no-nav' : '')} lang={lang === 'fil' ? 'fil' : lang}>
          <StatusBar tone={scrolled ? 'dark solid' : tone} />
          <div className="wk-scroll" ref={scroller} onScroll={onScroll}>
            {children}
          </div>
          {offline && (
            <div className="wk-offline" role="status"><WifiOff aria-hidden="true" /><span>{t.offline}</span></div>
          )}
          {!flow && <BottomNav />}
          {toastMsg && <div className="wk-toast" role="status"><CheckCircle2 aria-hidden="true" />{toastMsg}</div>}
          <i className="wk-homebar" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   Pieces used on many screens
   ===================================================================== */
export function TopBar({ title, sub, back = '/worker', right, onBack }) {
  const nav = useNavigate()
  return (
    <header className="wk-top">
      {back !== false
        ? <button type="button" className="wk-ib" aria-label="Back" onClick={onBack || (() => (typeof back === 'string' ? nav(back) : nav(-1)))}><ArrowLeft aria-hidden="true" /></button>
        : <span className="wk-ib-sp" />}
      <div className="wk-top-t"><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {right || <span className="wk-ib-sp" />}
    </header>
  )
}

export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="wk-sheet-wrap" onClick={onClose}>
      <section className="wk-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <i className="grab" aria-hidden="true" />
        <button type="button" className="wk-sheet-x" aria-label="Close" onClick={onClose}><X aria-hidden="true" /></button>
        {children}
      </section>
    </div>
  )
}

/* A drawn stand-in for the real QR code, which the backend signs per worker. */
export function QR({ seed = 'scans', size = 200, label = 'Your SCANS code' }) {
  let h = 0
  for (const c of seed + w.scansId) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const n = 25
  const cells = []
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)
    if (finder) continue
    h = (h * 1103515245 + 12345) >>> 0
    if (h % 100 < 47) cells.push([x, y])
  }
  const F = ({ x, y }) => <g><rect x={x} y={y} width="7" height="7" rx="1.6" fill="#0A2463" /><rect x={x + 1} y={y + 1} width="5" height="5" rx="1" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" rx=".8" fill="#1460E0" /></g>
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} className="wk-qr" role="img" aria-label={label}>
      {cells.map(([x, y]) => <rect key={x + '-' + y} x={x} y={y} width="1" height="1" rx=".25" fill="#0A2463" />)}
      <F x={0} y={0} /><F x={n - 7} y={0} /><F x={0} y={n - 7} />
    </svg>
  )
}
