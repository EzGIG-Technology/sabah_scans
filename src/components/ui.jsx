import { useEffect, useMemo, useRef, useState, createContext, useContext, useCallback } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, LogOut, Bell, ChevronLeft, ChevronRight, ArrowLeft, Info, CheckCircle2, AlertTriangle, Inbox, Repeat } from 'lucide-react'
import { DEMO_DATE, num, pct, rm } from '../data/demo.js'

/* =====================================================================
   Brand
   ===================================================================== */
export function Logo({ light = false, width = 140 }) {
  return (
    <img src={light ? '/scans-logo-light.png' : '/scans-logo.png'}
      alt="SCANS, Sabah Contribution Administration Network System"
      width={width} height={Math.round(width * 0.312)} style={{ width, height: 'auto' }} />
  )
}

export function initials(name = '') {
  return name.replace(/[^A-Za-z0-9 ]/g, ' ').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

/* Coloured monogram used for merchants and companies (no third-party logos in the prototype). */
const monoColours = ['#1D66B8', '#0E8F57', '#7B4DE3', '#D42253', '#B85407', '#13407A', '#14B8A6', '#4D9AD3']
export function Mono({ name, color, size }) {
  const c = color || monoColours[[...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % monoColours.length]
  return <span className={'mono' + (size === 'lg' ? ' lg' : '')} style={{ background: c }} aria-hidden="true">{initials(name)}</span>
}

export function Avatar({ name, size, grad }) {
  return <span className={'avatar' + (size ? ' ' + size : '') + (grad ? ' grad' : '')} aria-hidden="true">{initials(name)}</span>
}

/* =====================================================================
   Toast
   ===================================================================== */
const ToastCtx = createContext(() => {})
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const show = useCallback((m) => {
    setMsg(m)
    clearTimeout(window.__scansToast)
    window.__scansToast = setTimeout(() => setMsg(null), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" role="status"><CheckCircle2 size={18} aria-hidden="true" />{msg}</div>}
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

/* =====================================================================
   App shell: floating sidebar + sticky top bar
   nav: [{ group: 'Monitor', items: [{ to, label, icon, end, count }] }]
   portal: { name, sub, crest (img src) | mark (text) }
   ===================================================================== */
export function AppShell({ nav: navIn, portal: portalIn, org, user, title = '', kicker, notifications = [], notificationsHref, searchPlaceholder = 'Search name, SCANS ID or passport', topExtra, children }) {
  // Accept the older flat nav and org props too.
  const nav = navIn[0] && navIn[0].to ? [{ items: navIn }] : navIn
  const portal = portalIn || { name: org ? org.name : 'SCANS', sub: org ? org.detail : '' }
  const [open, setOpen] = useState(false)
  const [bell, setBell] = useState(false)
  const loc = useLocation()
  const go = useNavigate()
  useEffect(() => { setOpen(false); setBell(false) }, [loc.pathname])
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])
  const clock = useClock()
  const isFrozen = useFrozen()
  return (
    <div className="shell">
      <aside className={'side' + (open ? ' open' : '')} aria-label="Main navigation">
        <Link to="/" className="brand" aria-label="SCANS home"><Logo light width={190} /></Link>
        <div className="portal">
          <span className="crest">{portal.crest ? <img src={portal.crest} alt="" /> : portal.mark || initials(portal.name)}</span>
          <div style={{ minWidth: 0 }}><b>{portal.name}</b><small>{portal.sub}</small></div>
        </div>
        <nav>
          {nav.map((g) => (
            <div key={g.group || 'main'}>
              {g.group && <div className="group">{g.group}</div>}
              {g.items.map(({ to, label, icon: Icon, end, count }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Icon aria-hidden="true" strokeWidth={1.9} />
                  <span>{label}</span>
                  {count != null && <span className="count">{count}</span>}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="group">Elsewhere</div>
          <NavLink to="/login"><Repeat aria-hidden="true" strokeWidth={1.9} /><span>Switch portal</span></NavLink>
        </nav>
        <div className="me">
          <Avatar name={user.name} grad />
          <div style={{ minWidth: 0, flex: 1 }}><b>{user.name}</b><small>{user.role}</small></div>
          <button className="btn ghost sm icon" aria-label="Sign out" onClick={() => go('/login')}><LogOut /></button>
        </div>
        <div className="powered">Run by Microtek · Powered by MicroPay</div>
      </aside>
      {open && <div className="scrim" style={{ zIndex: 60 }} onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className="main">
        <header className="topbar">
          <button className="iconbtn menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="top-logo" aria-label="SCANS home"><Logo width={92} /></Link>
          <div className="title">
            {kicker && <small>{kicker}</small>}
            <b>{title}</b>
          </div>
          <span className="spacer" />
          {topExtra}
          <button type="button" className={'live' + (isFrozen ? ' frozen' : '')} aria-pressed={isFrozen} onClick={() => setFrozen(!isFrozen)}
            title={isFrozen ? 'Figures are held at their base values for recording. Choose to go live again.' : 'Choose to freeze every live figure for recording.'}>
            <span className="dot" aria-hidden="true" /><span><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{DEMO_DATE}</b><br />{isFrozen ? 'Frozen for recording' : `Live · ${clock} MYT`}</span>
          </button>
          <span className="sample" title="Illustration after full rollout: all seven sectors and all 130,391 registered workers. The pilot covers plantation and agriculture only.">Sample data · after full rollout (illustration)</span>
          <label className="search">
            <Search size={17} aria-hidden="true" />
            <span className="vh">Search</span>
            <input placeholder={searchPlaceholder} />
          </label>
          <div style={{ position: 'relative' }}>
            <button className="iconbtn" aria-label="Notifications" aria-expanded={bell} onClick={() => setBell(!bell)}>
              <Bell size={19} />{notifications.length > 0 && <span className="badge" />}
            </button>
            {bell && (
              <div className="popover" role="dialog" aria-label="Notifications">
                <div style={{ padding: '8px 10px 4px', fontWeight: 600 }}>Notifications</div>
                {notifications.length === 0 && <div className="empty" style={{ padding: 20 }}>Nothing new</div>}
                {notifications.map((n, i) => {
                  const inner = <><span className="k-ic" style={{ width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--sky)', color: 'var(--blue)', flex: 'none' }}><Bell size={15} /></span>
                    <div><b>{n.title}</b><span>{n.time}</span></div></>
                  const to = n.to || notificationsHref
                  return to
                    ? <button type="button" className="item" key={i} onClick={() => go(to)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}>{inner}</button>
                    : <div className="item" key={i}>{inner}</div>
                })}
                {notificationsHref && <button type="button" className="btn ghost sm" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => go(notificationsHref)}>See all</button>}
              </div>
            )}
          </div>
        </header>
        <main className="content" id="main">{children}</main>
      </div>
    </div>
  )
}

function useClock() {
  const [t, setT] = useState(() => fmtClock())
  useEffect(() => { const id = setInterval(() => setT(fmtClock()), 1000); return () => clearInterval(id) }, [])
  return t
}
function fmtClock() {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
}

export function PageHead({ title, sub, back, crumbs, children }) {
  const go = useNavigate()
  return (
    <div className="page-head">
      <div style={{ minWidth: 0 }}>
        {crumbs && (
          <div className="crumbs">
            {crumbs.map((c, i) => (
              <span key={i} className="row" style={{ gap: 6 }}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight size={13} />}
              </span>
            ))}
          </div>
        )}
        <div className="row" style={{ gap: 12 }}>
          {back && <button className="back" aria-label="Back" onClick={() => (typeof back === 'string' ? go(back) : go(-1))}><ArrowLeft size={18} /></button>}
          <h1>{title}</h1>
        </div>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

/* =====================================================================
   Cards and figures
   ===================================================================== */
export function Card({ title, sub, action, children, className = '', flush, style }) {
  return (
    <section className={'card ' + (flush ? 'flush ' : '') + className} style={style}>
      {(title || action) && (
        <div className="card-head">
          <div>{title && <h2>{title}</h2>}{sub && <p>{sub}</p>}</div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/* =====================================================================
   Live numbers
   AnimatedValue counts up to any number inside a string ("RM 7,845,500",
   "60.2%", "RM 28.46m") on first show and glides to new values after.
   useLivePayments() is one shared ticker for the whole app: the count of
   sample payments that arrived since the page opened, so every card that
   uses it moves in step.
   ===================================================================== */
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const NUM_RE = /-?\d[\d,]*(?:\.\d+)?/
export function AnimatedValue({ value, duration = 1100 }) {
  const str = String(value)
  const m = str.match(NUM_RE)
  const target = m ? parseFloat(m[0].replace(/,/g, '')) : null
  const dec = m && m[0].includes('.') ? m[0].split('.')[1].length : 0
  const grouped = m ? m[0].includes(',') || Math.abs(target) >= 10000 : false
  const [shown, setShown] = useState(() => (target == null || reduceMotion() ? target : 0))
  const [bump, setBump] = useState(false)
  const from = useRef(shown)
  const first = useRef(true)
  useEffect(() => {
    if (target == null) return
    if (reduceMotion()) { setShown(target); return }
    const start = from.current ?? 0
    if (start === target) return
    if (!first.current && target > start) { setBump(true); setTimeout(() => setBump(false), 900) }
    const len = first.current ? duration : 650
    first.current = false
    let raf, t0
    const step = (t) => {
      if (!t0) t0 = t
      const k = Math.min(1, (t - t0) / len)
      const e = 1 - Math.pow(1 - k, 3)
      const v = start + (target - start) * e
      from.current = v
      setShown(v)
      if (k < 1) raf = requestAnimationFrame(step)
      else from.current = target
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  if (target == null) return str
  const txt = Number(shown).toLocaleString('en-MY', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: grouped })
  return <span className={'live-num' + (bump ? ' bump' : '')}>{str.slice(0, m.index)}{txt}{str.slice(m.index + m[0].length)}</span>
}

let liveCount = 0
let liveTimer = null
const liveSubs = new Set()

/* Freeze for recording: holds every live counter and feed at its base value, so the same
   figure shows in every scene. Turn it on with ?freeze=1 (remembered in this browser, ?freeze=0
   turns it off) or with the Live button in the top bar. */
const readFreeze = () => {
  try {
    const q = new URLSearchParams(window.location.search).get('freeze')
    if (q != null) localStorage.setItem('scans-freeze', q === '0' ? '0' : '1')
    return localStorage.getItem('scans-freeze') === '1'
  } catch { return false }
}
let frozen = typeof window !== 'undefined' && readFreeze()
const freezeSubs = new Set()
export function setFrozen(v) {
  frozen = v
  try { localStorage.setItem('scans-freeze', v ? '1' : '0') } catch { /* private mode */ }
  if (v) { clearInterval(liveTimer); liveTimer = null; liveCount = 0; liveSubs.forEach((f) => f(0)) } else if (liveSubs.size) liveStart()
  freezeSubs.forEach((f) => f(v))
}
export function useFrozen() {
  const [v, setV] = useState(frozen)
  useEffect(() => { freezeSubs.add(setV); setV(frozen); return () => { freezeSubs.delete(setV) } }, [])
  return v
}

function liveStart() {
  if (liveTimer || reduceMotion() || frozen) return
  liveTimer = setInterval(() => {
    liveCount += 1 + Math.floor(Math.random() * 3)
    liveSubs.forEach((f) => f(liveCount))
  }, 3000)
}
export function useLivePayments() {
  const [n, setN] = useState(liveCount)
  const isFrozen = useFrozen()
  useEffect(() => {
    liveSubs.add(setN); liveStart()
    return () => { liveSubs.delete(setN); if (!liveSubs.size) { clearInterval(liveTimer); liveTimer = null } }
  }, [])
  return isFrozen ? 0 : n
}

export function Kpi({ icon: Icon, label, value, note, delta, down, tone, hero, children }) {
  return (
    <div className={'card' + (hero ? ' hero' : '')}>
      <div className="kpi">
        <div className="k-top">{Icon && <span className={'k-ic ' + (tone || '')}><Icon aria-hidden="true" /></span>}<span>{label}</span></div>
        <div className="k-val num">{typeof value === 'string' || typeof value === 'number' ? <AnimatedValue value={value} /> : value}</div>
        {(note || delta) && <div className="k-note">{delta && <span className={'delta' + (down ? ' down' : '')}>{delta}</span>}{note}</div>}
        {children}
      </div>
    </div>
  )
}

/* Status pill: maps status text to a tone. */
const tones = {
  Paid: 'ok', 'All paid': 'ok', Live: 'ok', Active: 'ok', Connected: 'ok', Resolved: 'ok', Sent: 'ok', Compliant: 'ok', Approved: 'ok',
  Settled: 'ok', Reconciled: 'ok', Open: 'warn', Returned: 'warn', Verified: 'ok', Valid: 'ok', Confirmed: 'ok', 'Good standing': 'ok', Delivered: 'ok', Ready: 'ok', Online: 'ok', Enabled: 'ok', Given: 'ok',
  Due: 'info', 'Due this month': 'info', New: 'info', 'Read only': 'info', 'With agency': 'info', Scheduled: 'info', 'In review': 'info', Processing: 'info', Invited: 'info',
  'Partly paid': 'warn', '1–2 months overdue': 'warn', Caution: 'warn', Pending: 'warn', 'Waiting for approval': 'warn', 'Waiting for State approval': 'warn',
  Paused: 'warn', Degraded: 'warn', 'Expiring soon': 'warn', 'Needs info': 'warn', 'Not given': 'warn', Draft: 'grey', Inactive: 'grey', Expired: 'grey', Closed: 'grey', Disabled: 'grey',
  '3+ months overdue': 'bad', Critical: 'bad', Behind: 'bad', Failed: 'bad', Rejected: 'bad', Suspended: 'bad', Down: 'bad',
}
export function Status({ children, tone }) {
  return <span className={'pill dot ' + (tone || tones[children] || 'grey')}>{children}</span>
}
export function Pill({ children, tone = 'info' }) { return <span className={'pill ' + tone}>{children}</span> }

export function Callout({ tone, icon: Icon = Info, children, style }) {
  return <div className={'callout ' + (tone || '')} style={style}><Icon aria-hidden="true" /><div>{children}</div></div>
}

export function Empty({ icon: Icon = Inbox, title = 'Nothing here yet', children }) {
  return <div className="empty"><div className="ic"><Icon size={24} /></div><b>{title}</b>{children}</div>
}

export function Skeleton({ h = 16, w = '100%', style }) {
  return <div className="skel" style={{ height: h, width: w, ...style }} aria-hidden="true" />
}

/* =====================================================================
   Controls
   ===================================================================== */
export function Seg({ items, value, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {items.map((it) => {
        const v = typeof it === 'string' ? it : it.value
        const l = typeof it === 'string' ? it : it.label
        return <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>
      })}
    </div>
  )
}

export function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((it) => {
        const v = typeof it === 'string' ? it : it.value
        const l = typeof it === 'string' ? it : it.label
        return (
          <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}>
            {l}{typeof it === 'object' && it.count != null && <span className="n">{it.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search', style }) {
  return (
    <label className="searchbox grow" style={style}>
      <Search aria-hidden="true" />
      <span className="vh">{placeholder}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  )
}

export function Select({ value, onChange, options, label, style }) {
  return (
    <label style={{ minWidth: 150, ...style }}>
      <span className="vh">{label}</span>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value
          const l = typeof o === 'string' ? o : o.label
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </label>
  )
}

export function Field({ label, hint, error, children, full }) {
  return (
    <label className={'field' + (full ? ' full' : '')}>
      <span>{label}</span>
      {children}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="error">{error}</small>}
    </label>
  )
}

export function Switch({ checked, onChange, label }) {
  return <button type="button" className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />
}

export function Stepper({ steps, current }) {
  return (
    <ol className="stepper" style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className={'st' + (i < current ? ' done' : i === current ? ' on' : '')} aria-current={i === current ? 'step' : undefined}>
          <span className="c">{i < current ? <CheckCircle2 size={16} /> : i + 1}</span>
          <span className="lbl">{s}</span>
        </li>
      ))}
    </ol>
  )
}

/* =====================================================================
   Table with pagination, empty state and stacked phone layout
   columns: [{ key, label, render?(row), align?: 'r', width? }]
   ===================================================================== */
export function Table({ columns, rows, onRowClick, pageSize = 10, empty, footer, rowKey = (r, i) => r.id || i, selectable, selected, onSelect, isSelectable = () => true }) {
  const [page, setPage] = useState(0)
  useEffect(() => setPage(0), [rows.length])
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const view = rows.slice(page * pageSize, page * pageSize + pageSize)
  const allOn = selectable && rows.filter(isSelectable).length > 0 && rows.filter(isSelectable).every((r) => selected.has(rowKey(r)))
  if (rows.length === 0) return empty || <Empty title="No results">Try another search or filter.</Empty>
  return (
    <div>
      <div className="table-wrap">
        <table className="data stack">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: 40 }}>
                  <input type="checkbox" aria-label="Select all" checked={allOn}
                    onChange={() => onSelect(allOn ? new Set() : new Set(rows.filter(isSelectable).map(rowKey)))} />
                </th>
              )}
              {columns.map((c) => <th key={c.key} className={c.align || ''} style={{ width: c.width }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {view.map((r, i) => {
              const k = rowKey(r, i)
              return (
                <tr key={k} className={onRowClick ? 'click' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                  {selectable && (
                    <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={'Select ' + (r.name || k)} disabled={!isSelectable(r)} checked={selected.has(k)}
                        onChange={() => { const s = new Set(selected); s.has(k) ? s.delete(k) : s.add(k); onSelect(s) }} />
                    </td>
                  )}
                  {columns.map((c) => <td key={c.key} data-label={c.label} className={c.align || ''}>{c.render ? c.render(r) : r[c.key]}</td>)}
                </tr>
              )
            })}
          </tbody>
          {footer}
        </table>
      </div>
      {rows.length > pageSize && <Pager page={page} pages={pages} total={rows.length} pageSize={pageSize} onPage={setPage} />}
    </div>
  )
}

export function Pager({ page, pages, total, pageSize, onPage }) {
  const from = page * pageSize + 1
  const to = Math.min(total, from + pageSize - 1)
  const list = []
  for (let i = 0; i < pages; i++) if (i < 2 || i > pages - 3 || Math.abs(i - page) <= 1) list.push(i)
  return (
    <div className="pager">
      <span>Showing {num(from)} to {num(to)} of {num(total)}</span>
      <div className="pages">
        <button aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /></button>
        {list.map((p, i) => (
          <span key={p} style={{ display: 'contents' }}>
            {i > 0 && p - list[i - 1] > 1 && <button disabled>…</button>}
            <button aria-current={p === page} onClick={() => onPage(p)}>{p + 1}</button>
          </span>
        ))}
        <button aria-label="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}><ChevronRight size={15} /></button>
      </div>
    </div>
  )
}

/* =====================================================================
   Overlays
   ===================================================================== */
function useEscape(onClose) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
}

export function Drawer({ title, sub, onClose, children, footer }) {
  useEscape(onClose)
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <section className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <div style={{ minWidth: 0 }}><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
          <button className="btn ghost sm icon" onClick={onClose} aria-label="Close"><X /></button>
        </header>
        <div className="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </>
  )
}

export function Modal({ title, onClose, children, actions }) {
  useEscape(onClose)
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div className="modal-wrap" onClick={onClose}>
        <section className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
            <h2>{title}</h2>
            <button className="btn ghost sm icon" onClick={onClose} aria-label="Close"><X /></button>
          </div>
          {children}
          {actions && <div className="m-actions">{actions}</div>}
        </section>
      </div>
    </>
  )
}

/* =====================================================================
   Charts (SVG, no chart library)
   ===================================================================== */
export const PAL = ['#1D66B8', '#4D9AD3', '#13407A', '#14B8A6', '#7B4DE3', '#FF8A1F', '#F0436A', '#FFC531']

function niceMax(v) {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return m * p
}
const shortNum = (v) => (v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'm' : v >= 1e3 ? (v / 1e3).toFixed(v >= 1e4 ? 0 : 1) + 'k' : String(Math.round(v)))

/* Vertical bars. data: [{ label, values: [n, ...] }] (stacked) or [{ label, value }] */
export function BarChart({ data, series, height = 240, format = shortNum, highlight, colors = PAL }) {
  const [hover, setHover] = useState(null)
  const W = 640, H = height, L = 44, B = 26, T = 10
  const vals = data.map((d) => (d.values ? d.values.reduce((a, b) => a + b, 0) : d.value))
  const max = niceMax(Math.max(...vals) * 1.05)
  const bw = (W - L) / data.length
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <div style={{ position: 'relative' }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} height={H} preserveAspectRatio="none" role="img"
        aria-label={data.map((d, i) => `${d.label}: ${format(vals[i])}`).join(', ')}>
        {ticks.map((t) => {
          const y = T + (H - B - T) * (1 - t)
          return <g key={t}><line className="grid-line" x1={L} x2={W} y1={y} y2={y} strokeDasharray={t ? '3 4' : ''} /><text x={L - 8} y={y + 4} textAnchor="end">{format(max * t)}</text></g>
        })}
        {data.map((d, i) => {
          const parts = d.values || [d.value]
          let acc = 0
          const x = L + i * bw + bw * 0.2
          const w = bw * 0.6
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={L + i * bw} y={T} width={bw} height={H - B - T} fill="transparent" />
              {parts.map((v, j) => {
                const h = ((H - B - T) * v) / max
                acc += h
                const top = j === parts.length - 1
                const fill = d.color || (highlight != null ? (i === highlight ? colors[0] : '#C9DCFB') : colors[j % colors.length])
                return <rect key={j} className="bar-rect" x={x} y={H - B - acc} width={w} height={Math.max(0, h)} rx={top ? Math.min(6, w / 2) : 0} fill={fill} />
              })}
              <text x={L + i * bw + bw / 2} y={H - 8} textAnchor="middle">{d.label}</text>
            </g>
          )
        })}
      </svg>
      {hover != null && (
        <div className="tip" style={{ left: `${((L + hover * bw + bw / 2) / W) * 100}%`, top: `${((H - B - ((H - B - T) * vals[hover]) / max) / H) * 100}%` }}>
          <b>{data[hover].label}</b> · {format(vals[hover])}
          {series && data[hover].values && <div>{series.map((s, j) => <div key={s}>{s}: {format(data[hover].values[j])}</div>)}</div>}
        </div>
      )}
      {series && <div className="legend" style={{ marginTop: 8 }}>{series.map((s, j) => <span key={s}><i style={{ background: colors[j % colors.length] }} />{s}</span>)}</div>}
    </div>
  )
}

/* Horizontal bars: [{ label, value, color? }] */
export function HBarChart({ data, format = num, max: mx }) {
  const max = mx || Math.max(...data.map((d) => d.value))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="row between" style={{ fontSize: 13, marginBottom: 5 }}><span>{d.label}</span><b className="num">{format(d.value)}</b></div>
          <div className="bar" style={{ height: 10 }}><span style={{ width: (d.value / max) * 100 + '%', background: d.color || (i === 0 ? 'var(--gradBtn)' : PAL[i % PAL.length]) }} /></div>
        </div>
      ))}
    </div>
  )
}

/* Line / area chart: points [{ label, value }] or multiple series [{ name, color, points }] */
export function LineChart({ data, series, height = 220, format = shortNum, area = true }) {
  const all = series || [{ name: 'v', color: '#1D66B8', points: data }]
  const labels = all[0].points.map((p) => p.label)
  const W = 640, H = height, L = 44, B = 26, T = 12, R = 10
  const max = niceMax(Math.max(...all.flatMap((s) => s.points.map((p) => p.value))) * 1.08)
  const x = (i) => L + ((W - L - R) * i) / Math.max(1, labels.length - 1)
  const y = (v) => T + (H - B - T) * (1 - v / max)
  const [hover, setHover] = useState(null)
  const gid = useMemo(() => 'g' + Math.random().toString(36).slice(2, 8), [])
  return (
    <div style={{ position: 'relative' }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} height={H} preserveAspectRatio="none" role="img"
        aria-label={all.map((s) => s.points.map((p) => `${p.label} ${format(p.value)}`).join(', ')).join('; ')}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; setHover(Math.max(0, Math.min(labels.length - 1, Math.round(((px - L) / (W - L - R)) * (labels.length - 1))))) }}>
        <defs>
          {all.map((s, j) => (
            <linearGradient key={j} id={gid + j} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity=".22" /><stop offset="1" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line className="grid-line" x1={L} x2={W - R} y1={y(max * t)} y2={y(max * t)} strokeDasharray={t ? '3 4' : ''} /><text x={L - 8} y={y(max * t) + 4} textAnchor="end">{format(max * t)}</text></g>)}
        {labels.map((l, i) => (labels.length <= 12 || i % Math.ceil(labels.length / 12) === 0) && <text key={i} x={x(i)} y={H - 8} textAnchor="middle">{l}</text>)}
        {all.map((s, j) => {
          const d = s.points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ')
          return (
            <g key={j}>
              {area && <path d={`${d} L${x(s.points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${gid + j})`} />}
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </g>
          )
        })}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="var(--blue)" strokeDasharray="3 3" />}
        {hover != null && all.map((s, j) => <circle key={j} cx={x(hover)} cy={y(s.points[hover].value)} r="4.5" fill="#fff" stroke={s.color} strokeWidth="2.5" />)}
      </svg>
      {hover != null && (
        <div className="tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(Math.max(...all.map((s) => s.points[hover].value))) / H) * 100}%` }}>
          <b>{labels[hover]}</b>{all.map((s) => <div key={s.name}>{series ? s.name + ': ' : ''}{format(s.points[hover].value)}</div>)}
        </div>
      )}
      {series && <div className="legend" style={{ marginTop: 8 }}>{series.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</div>}
    </div>
  )
}

export function Sparkline({ values, color = '#fff', height = 40 }) {
  const W = 200, H = height
  const mx = Math.max(...values), mn = Math.min(...values)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${(W * i) / (values.length - 1)},${H - 4 - ((H - 8) * (v - mn)) / (mx - mn || 1)}`).join(' ')
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden="true"><path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" /></svg>
}

/* Donut: [{ label, value, color? }] */
export function Donut({ data, center, centerSub, size = 180, format = (v, t) => pct(v / t, 1) }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 42, c = 2 * Math.PI * r
  let off = 0
  const [hover, setHover] = useState(null)
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={data.map((d, i) => `${d.label} ${format(d.value, total, i)}`).join(', ')} style={{ flex: 'none' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line2)" strokeWidth="12" />
        {data.map((d, i) => {
          const len = (d.value / total) * c
          const el = (
            <circle key={d.label} cx="50" cy="50" r={r} fill="none" stroke={d.color || PAL[i % PAL.length]} strokeWidth={hover === i ? 15 : 12}
              strokeDasharray={`${Math.max(0, len - 0.8)} ${c}`} strokeDashoffset={-off} transform="rotate(-90 50 50)"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ transition: 'stroke-width .15s', cursor: 'pointer' }} />
          )
          off += len
          return el
        })}
        <text x="50" y="49" textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink)', fontFamily: 'var(--font)' }}>{hover != null ? format(data[hover].value, total, hover) : center}</text>
        <text x="50" y="60" textAnchor="middle" style={{ fontSize: 5.5, fill: 'var(--ink3)', fontFamily: 'var(--font)' }}>{hover != null ? data[hover].label.slice(0, 22) : centerSub}</text>
      </svg>
      <div className="legend-list">
        {data.map((d, i) => (
          <div key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <i style={{ background: d.color || PAL[i % PAL.length] }} /><span>{d.label}</span><b className="num">{format(d.value, total, i)}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Labelled progress rows, e.g. paid / due this month / 1–2 months overdue / 3+ months overdue */
export function MeterRows({ items, big }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: big ? 14 : 10 }}>
      {items.map((it) => (
        <div key={it.label}>
          <div className="row between" style={{ fontSize: 13.5, marginBottom: 6 }}>
            <span>{it.label}</span><span className="num muted">{it.text}</span>
          </div>
          <div className={'bar' + (big ? ' lg' : '')}>
            <span style={{ width: Math.max(it.share * 100, big ? 8 : 1) + '%', background: it.color || 'var(--gradBtn)' }}>{big && it.share >= 0.12 && pct(it.share)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SplitBar({ parts }) {
  return (
    <div>
      <div className="split" role="img" aria-label={parts.map((p) => `${p.label} ${p.text}`).join(', ')}>
        {parts.map((p) => <span key={p.label} style={{ width: p.share * 100 + '%', background: p.color }} />)}
      </div>
      <div className="legend" style={{ marginTop: 10 }}>
        {parts.map((p) => <span key={p.label}><i style={{ background: p.color }} />{p.label} <b className="num" style={{ color: 'var(--ink)' }}>{p.text}</b></span>)}
      </div>
    </div>
  )
}

/* =====================================================================
   Sabah map: simplified coastline with one bubble per district.
   Bubble size = registered workers; label and colour = share not yet paid
   (PRD thresholds: green under 15%, orange 15 to 40%, red over 40%).
   ===================================================================== */
const SABAH = [
  [115.55, 4.95], [115.62, 5.25], [115.78, 5.5], [115.92, 5.75], [116.07, 5.98], [116.2, 6.2], [116.38, 6.48], [116.58, 6.74],
  [116.76, 6.98], [116.86, 6.96], [116.92, 6.78], [116.88, 6.6], [117.0, 6.48], [117.14, 6.62], [117.28, 6.86], [117.42, 6.66],
  [117.62, 6.48], [117.86, 6.18], [118.06, 5.88], [118.32, 5.8], [118.6, 5.6], [118.94, 5.46], [119.27, 5.2], [119.2, 5.05],
  [118.9, 5.0], [118.6, 5.04], [118.36, 5.02], [118.3, 4.86], [118.5, 4.7], [118.68, 4.5], [118.52, 4.36], [118.2, 4.4],
  [117.9, 4.26], [117.6, 4.18], [117.2, 4.32], [116.8, 4.36], [116.4, 4.34], [116.0, 4.36], [115.8, 4.5], [115.68, 4.75],
]
const COORD = {
  kudat: [116.84, 6.88], kk: [116.07, 5.98], sandakan: [118.07, 5.84], beaufort: [115.75, 5.35],
  keningau: [116.16, 5.34], lahaddatu: [118.33, 5.03], tawau: [117.89, 4.25], semporna: [118.61, 4.48],
}
const proj = ([lon, lat]) => [(lon - 115.3) * 100, (7.25 - lat) * 100]
export function zoneTone(rate) {
  const owing = 1 - rate
  return owing < 0.15 ? { c: '#17B26A', t: 'Low arrears' } : owing <= 0.4 ? { c: '#FF8A1F', t: 'Watch' } : { c: '#F0436A', t: 'High arrears' }
}
export function SabahMap({ districts, selected, onSelect, renderPanel, filter = 'all' }) {
  const path = SABAH.map((p, i) => (i ? 'L' : 'M') + proj(p).join(',')).join(' ') + 'Z'
  const maxW = Math.max(...districts.map((d) => d.workers))
  const shown = districts.filter((d) => {
    const z = zoneTone(d.rate).t
    return filter === 'all' || (filter === 'high' && z === 'High arrears') || (filter === 'low' && z === 'Low arrears')
  })
  const sel = districts.find((d) => d.id === selected)
  return (
    <div className="map-wrap">
      <div className="map">
        <svg viewBox="-10 -10 420 340" role="img" aria-label="Map of Sabah districts with workers and payment rate">
          <defs>
            <pattern id="sea" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#DCE8F8" strokeWidth="2" />
            </pattern>
          </defs>
          <rect x="-10" y="-10" width="420" height="340" fill="url(#sea)" />
          <path d={path} fill="#fff" stroke="#BFD3F2" strokeWidth="1.5" strokeLinejoin="round" />
          {shown.map((d) => {
            const [x, y] = proj(COORD[d.id] || [117, 5.5])
            const rad = 9 + 20 * Math.sqrt(d.workers / maxW)
            const z = zoneTone(d.rate)
            const on = d.id === selected
            return (
              <g key={d.id} className="bubble" role="button" tabIndex={0} aria-pressed={on} aria-label={`${d.name}: ${num(d.workers)} workers, ${pct(1 - d.rate)} not yet paid`}
                onClick={() => onSelect(on ? null : d.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(on ? null : d.id)}>
                <circle cx={x} cy={y} r={rad + 6} fill={z.c} opacity=".16" />
                <circle cx={x} cy={y} r={rad} fill={z.c} opacity=".9" stroke={on ? 'var(--navy)' : '#fff'} strokeWidth={on ? 3 : 2} />
                <text x={x} y={y + 3.5} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: '#fff', fontFamily: 'var(--font)' }}>{pct(1 - d.rate)}</text>
                <text x={x} y={y + rad + 13} textAnchor="middle" style={{ fontSize: 10, fontWeight: 600, fill: 'var(--ink)', fontFamily: 'var(--font)' }}>{d.name}</text>
              </g>
            )
          })}
          {!shown.length && <text x="200" y="165" textAnchor="middle" style={{ fontSize: 12, fill: 'var(--ink2)', fontFamily: 'var(--font)' }}>No district matches this filter</text>}
        </svg>
        <div className="map-legend">
          <b style={{ fontSize: 12 }}>Share not yet paid</b>
          <span><i style={{ background: '#17B26A' }} />Under 15%</span>
          <span><i style={{ background: '#FF8A1F' }} />15% to 40%</span>
          <span><i style={{ background: '#F0436A' }} />Over 40%</span>
        </div>
      </div>
      <div className="panel">
        {sel ? (renderPanel ? renderPanel(sel) : <DistrictDetail d={sel} />) : (
          <div className="empty" style={{ padding: '40px 8px' }}>
            <div className="ic"><Info size={22} /></div>
            <b>No district selected</b>
            Choose a district on the map to see its workers, payments and arrears.
          </div>
        )}
      </div>
    </div>
  )
}

export function DistrictDetail({ d }) {
  const z = zoneTone(d.rate)
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div>
        <div className="row between"><h3 style={{ fontSize: 17 }}>{d.name}</h3><span className="pill" style={{ background: z.c + '22', color: z.c }}>{z.t}</span></div>
        <p className="small muted">District office data, {DEMO_DATE}</p>
      </div>
      <dl className="kv one">
        <div><dt>Registered workers</dt><dd className="num">{num(d.workers)}</dd></div>
        <div><dt>Paid this month</dt><dd className="num">{num(d.paid)} ({pct(d.rate)})</dd></div>
        <div><dt>Not yet paid</dt><dd className="num">{num(d.overdue)}</dd></div>
        <div><dt>Collected this month</dt><dd className="num">{rm(d.collected)}</dd></div>
      </dl>
      <div className="bar"><span style={{ width: pct(d.rate) }} /></div>
    </div>
  )
}

/* Live ticker hook: returns a list that grows every few seconds from a generator. */
export function useLiveFeed(seed, make, every = 4000, keep = 8) {
  const [items, setItems] = useState(seed)
  const n = useRef(0)
  const isFrozen = useFrozen()
  useEffect(() => {
    if (isFrozen) { n.current = 0; setItems(seed); return undefined }
    const id = setInterval(() => { n.current += 1; setItems((xs) => [make(n.current), ...xs].slice(0, keep)) }, every)
    return () => clearInterval(id)
  }, [make, every, keep, isFrozen]) // eslint-disable-line react-hooks/exhaustive-deps
  return items
}

export { AlertTriangle }

/* ---------- Older names kept so earlier pages still build ---------- */
export function Figure({ label, value, note }) {
  return <div className="kpi"><div className="k-top">{label}</div><div className="k-val num">{value}</div>{note && <div className="k-note">{note}</div>}</div>
}
export function Columns({ data, format, height = 220 }) {
  return <BarChart data={data.map((d, i) => ({ label: d.m, value: d.v }))} format={format} height={height} highlight={data.length - 1} />
}
export function DistrictMap({ districts, selected, onSelect }) {
  return <SabahMap districts={districts} selected={selected} onSelect={onSelect} />
}
