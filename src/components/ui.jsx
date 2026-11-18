import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, LogOut } from 'lucide-react'
import { DEMO_MONTH, num, pct, rm } from '../data/demo.js'

export function Logo({ light = false, width = 160 }) {
  return (
    <img
      src={light ? '/scans-logo-light.png' : '/scans-logo.png'}
      alt="SCANS, Sabah Contribution Administration Network System"
      width={width}
      height={Math.round(width * 0.312)}
      style={{ width, height: 'auto' }}
    />
  )
}

/* ---------------- Toast ---------------- */
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
      {msg && <div className="toast" role="status">{msg}</div>}
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

/* ---------------- App shell ---------------- */
export function AppShell({ nav, org, user, children }) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => window.scrollTo(0, 0), [loc.pathname])
  return (
    <div className="shell">
      <aside className={'side' + (open ? ' open' : '')} aria-label="Main navigation">
        <div className="brand"><Link to="/" aria-label="SCANS home"><Logo light width={176} /></Link></div>
        <div className="org"><strong>{org.name}</strong>{org.detail}</div>
        <nav>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="foot">
          <div className="me">
            <span className="avatar" aria-hidden="true">{user.initials}</span>
            <div><div style={{ color: '#fff', fontWeight: 600 }}>{user.name}</div>{user.role}</div>
          </div>
          <p style={{ marginTop: 12 }}><Link to="/login"><LogOut size={14} style={{ verticalAlign: -2 }} /> Switch portal</Link></p>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className="main">
        <header className="topbar">
          <button className="btn quiet menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <label className="search">
            <Search size={18} aria-hidden="true" color="#475b6f" />
            <span className="vh">Search</span>
            <input placeholder="Search by name, SCANS ID or passport number" />
          </label>
          <span className="spacer" />
          <span className="demo-note">Demo data · {DEMO_MONTH}</span>
        </header>
        <main className="content" id="main">{children}</main>
      </div>
    </div>
  )
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

/* ---------------- Status ---------------- */
const tone = {
  Paid: 'ok', 'All paid': 'ok', Live: 'ok', Active: 'ok', Connected: 'ok', Resolved: 'ok', Sent: 'ok', Compliant: 'ok',
  Due: 'info', New: 'info', 'Read only': 'info', 'With agency': 'info', 'Partly paid': 'warn',
  '1 month overdue': 'warn', 'Waiting for approval': 'warn', 'Waiting for State approval': 'warn', Paused: 'warn', Degraded: 'warn',
  '3+ months overdue': 'bad', Behind: 'bad', Failed: 'bad',
}
export function Status({ children }) {
  return <span className={'status ' + (tone[children] || '')}>{children}</span>
}

export function Figure({ label, value, note, size }) {
  return (
    <div className="figure">
      <div className="label">{label}</div>
      <div className={'value' + (size === 'md' ? ' md' : '')}>{value}</div>
      {note && <div className="note">{note}</div>}
    </div>
  )
}

export function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((it) => (
        <button key={it} role="tab" aria-selected={value === it} onClick={() => onChange(it)}>{it}</button>
      ))}
    </div>
  )
}

export function Drawer({ title, sub, onClose, children, footer }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <section className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <div><h2 style={{ fontSize: 'var(--s-20)' }}>{title}</h2>{sub && <p className="sub" style={{ color: 'var(--muted)', marginTop: 4 }}>{sub}</p>}</div>
          <button className="btn quiet" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>
        <div className="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </>
  )
}

/* ---------------- Charts (flat SVG, no gradients) ---------------- */
export function Columns({ data, height = 220, format = (v) => v, highlightLast = true }) {
  const max = Math.max(...data.map((d) => d.v)) * 1.12
  const w = 100 / data.length
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 600 ${height}`} width="100%" height={height} role="img"
        aria-label={data.map((d) => `${d.m}: ${format(d.v)}`).join(', ')} preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = ((d.v / max) * (height - 34))
          const x = i * (600 / data.length) + 600 / data.length * 0.18
          const bw = (600 / data.length) * 0.64
          const last = highlightLast && i === data.length - 1
          return <rect key={d.m} x={x} y={height - 24 - h} width={bw} height={h} fill={last ? 'var(--navy)' : 'var(--sky)'} rx="2" />
        })}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, fontSize: 'clamp(11px, 2.6vw, 13px)', color: 'var(--muted)', marginTop: -18 }}>
        {data.map((d) => (
          <div key={d.m} style={{ textAlign: 'center' }}>
            <div>{d.m}</div>
            <div className="num" style={{ color: 'var(--ink)', fontWeight: 600, overflowWrap: 'anywhere' }}>{format(d.v)}</div>
          </div>
        ))}
      </div>
    </figure>
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

export function MeterRows({ items }) {
  return (
    <div className="rows">
      {items.map((it) => (
        <div key={it.label} style={{ padding: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15 }}>
            <span>{it.label}</span>
            <span className="num" style={{ fontWeight: 650 }}>{it.text}</span>
          </div>
          <div className="bar" style={{ marginTop: 6 }}><span style={{ width: it.share * 100 + '%', background: it.color || 'var(--navy)' }} /></div>
        </div>
      ))}
    </div>
  )
}

/* Sabah districts as a tile map: each tile sits roughly where the district lies, west to east. */
function rateColour(r) {
  if (r >= 0.65) return { bg: 'var(--navy)', fg: '#fff' }
  if (r >= 0.58) return { bg: 'var(--sky)', fg: '#fff' }
  if (r >= 0.52) return { bg: '#f0c46a', fg: 'var(--ink)' }
  return { bg: 'var(--red)', fg: '#fff' }
}
export function DistrictMap({ districts, selected, onSelect }) {
  return (
    <div>
      <div className="dmap">
        {districts.map((d) => {
          const c = rateColour(d.rate)
          const on = selected === d.id
          return (
            <button key={d.id} onClick={() => onSelect(on ? null : d.id)} aria-pressed={on}
              className="dtile"
              style={{
                '--c': d.col + 1, '--r': d.row + 1, background: c.bg, color: c.fg, border: 0, borderRadius: 4,
                textAlign: 'left', padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                outline: on ? '3px solid var(--navy-ink)' : 'none', outlineOffset: 2, transition: 'transform 120ms',
              }}>
              <span style={{ fontWeight: 650, fontSize: 15, lineHeight: 1.2 }}>{d.name}</span>
              <span>
                <span className="num" style={{ fontSize: 26, fontWeight: 800, fontVariationSettings: "'wdth' 78", display: 'block', lineHeight: 1 }}>{pct(d.rate)}</span>
                <span className="num" style={{ fontSize: 13, opacity: 0.9 }}>{num(d.workers)} workers</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="legend" style={{ marginTop: 12 }}>
        <span><i style={{ background: 'var(--navy)' }} />65% paid or more</span>
        <span><i style={{ background: 'var(--sky)' }} />58–64%</span>
        <span><i style={{ background: '#f0c46a' }} />52–57%</span>
        <span><i style={{ background: 'var(--red)' }} />Below 52%</span>
      </div>
    </div>
  )
}

export function DistrictDetail({ d }) {
  if (!d) return <p className="sub">Choose a district on the map to see its numbers.</p>
  return (
    <dl className="kv">
      <dt>Registered workers</dt><dd className="num">{num(d.workers)}</dd>
      <dt>Paid this month</dt><dd className="num">{num(d.paid)} ({pct(d.rate)})</dd>
      <dt>Not yet paid</dt><dd className="num">{num(d.overdue)}</dd>
      <dt>Collected this month</dt><dd className="num">{rm(d.collected)}</dd>
      <dt>State share (70%)</dt><dd className="num">{rm(d.collected * 0.7)}</dd>
    </dl>
  )
}

export function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('')
}
