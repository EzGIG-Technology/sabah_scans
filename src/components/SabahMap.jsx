/* =====================================================================
   Sabah workforce map.
   Real district boundaries (src/data/sabahMap.js), coloured by the share
   of each reporting area not yet paid (PRD thresholds), with a glowing
   hotspot at every town where registered workers are and a ripple with
   "+RM100" wherever a live payment arrives. Live payments follow the
   shared ticker, so the map stops with "Freeze for recording" and with
   reduced motion.
   ===================================================================== */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { zoneTone, DistrictDetail, useLivePayments, useFrozen } from './ui.jsx'
import { num, pct, rm, RATE } from '../data/demo.js'
import { MAP_W, MAP_H, project, SABAH_DISTRICTS, NEIGHBOURS, TOWNS, KINABALU, MAP_LABELS } from '../data/sabahMap.js'

const TONES = [['#17B26A', 'Under 15%'], ['#FF8A1F', '15% to 40%'], ['#F0436A', 'Over 40%']]
const HIDE_LABEL = new Set(['Penampang', 'Putatan', 'Membakut'])
// Labels that would overlap a neighbour sit beside their dot instead of above it.
const SIDE = { Beaufort: 'end', Keningau: 'start' }
const PULSE_MS = 2600

// Split each reporting area's workers over its towns so the towns add up exactly.
function townsFor(districts) {
  const byId = Object.fromEntries(districts.map((d) => [d.id, d]))
  const out = []
  for (const d of districts) {
    const list = TOWNS.filter((t) => t.region === d.id)
    let left = d.workers
    list.forEach((t, i) => {
      const n = i === list.length - 1 ? left : Math.round(d.workers * t.share)
      left -= n
      out.push({ ...t, workers: n })
    })
  }
  return out.filter((t) => byId[t.region])
}

// Number that glides to its new value (for SVG text, where AnimatedValue's <span> cannot go).
function useTween(value, ms = 700) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = from.current
    if (start === value) return undefined
    let raf, t0
    const step = (t) => {
      if (!t0) t0 = t
      const k = Math.min(1, (t - t0) / ms)
      const cur = start + (value - start) * (1 - Math.pow(1 - k, 3))
      from.current = cur
      setV(cur)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return v
}

function TownLabel({ t, d, compact }) {
  const unpaid = 1 - d.rate
  const main = t.main
  const side = SIDE[t.name]
  const anchor = side || 'middle'
  const dx = side === 'end' ? -10 : side === 'start' ? 10 : 0
  const dy = side ? -1 : main ? -16 : -10
  if (compact) return main ? <text className="smap-town main" x={t.x} y={t.y - 16} textAnchor="middle">{t.name}</text> : null
  return (
    <g className={'smap-label' + (main ? ' main' : '')} transform={`translate(${t.x + dx} ${t.y + dy})`}>
      <text className={'smap-town' + (main ? ' main' : '')} textAnchor={anchor}>{t.name}</text>
      {main && <text className="smap-sub" textAnchor={anchor} y={15}>{pct(unpaid)} not yet paid</text>}
    </g>
  )
}

export function SabahMap({ districts, selected, onSelect, renderPanel, filter = 'all', compact = false }) {
  const frozen = useFrozen()
  const live = useLivePayments()
  const [hover, setHover] = useState(null) // { id, x, y } in px inside the map box
  const [pulses, setPulses] = useState([])
  const [liveBy, setLiveBy] = useState({}) // live payments per reporting area since the page opened
  const [last, setLast] = useState(null)
  const seen = useRef(live)
  const seq = useRef(0)
  const box = useRef(null)
  const towns = useMemo(() => townsFor(districts), [districts])
  const maxTown = Math.max(...towns.map((t) => t.workers))

  // Each new live payment lands at a town, weighted by where the workers are.
  useEffect(() => {
    if (compact) return
    if (live < seen.current || frozen) { seen.current = live; setLiveBy({}); setPulses([]); setLast(null); return }
    const n = live - seen.current
    seen.current = live
    if (n <= 0) return
    const total = towns.reduce((s, t) => s + t.workers, 0)
    const born = Date.now()
    const fresh = []
    for (let i = 0; i < n; i++) {
      let r = Math.random() * total
      const t = towns.find((x) => (r -= x.workers) < 0) || towns[0]
      fresh.push({ id: ++seq.current, town: t, born, delay: i * 260 })
    }
    setPulses((ps) => [...ps.filter((p) => born - p.born < PULSE_MS + 1200), ...fresh].slice(-24))
    setLiveBy((m) => fresh.reduce((acc, p) => ({ ...acc, [p.town.region]: (acc[p.town.region] || 0) + 1 }), { ...m }))
    setLast(fresh[fresh.length - 1].town.name)
  }, [live, frozen, towns, compact])

  // Clear finished ripples.
  useEffect(() => {
    if (!pulses.length) return undefined
    const id = setTimeout(() => setPulses((ps) => ps.filter((p) => Date.now() - p.born < PULSE_MS + 1200)), PULSE_MS + 1300)
    return () => clearTimeout(id)
  }, [pulses])

  // Reporting areas with today's live payments added, so the panel and tooltip match the dashboard totals.
  const areas = useMemo(() => Object.fromEntries(districts.map((d) => {
    const extra = Math.min(liveBy[d.id] || 0, d.overdue)
    const paid = d.paid + extra
    return [d.id, { ...d, paid, overdue: d.workers - paid, collected: d.collected + extra * RATE, rate: paid / d.workers, live: extra }]
  })), [districts, liveBy])

  const shows = (id) => {
    if (filter === 'all') return true
    const t = zoneTone(areas[id].rate).t
    return (filter === 'high' && t === 'High arrears') || (filter === 'low' && t === 'Low arrears')
  }
  const anyShown = districts.some((d) => shows(d.id))
  const sel = selected ? areas[selected] : null
  const hov = hover ? areas[hover.id] : null
  const liveTotal = Object.values(liveBy).reduce((s, x) => s + x, 0)
  const liveRm = useTween(liveTotal * RATE)

  const pick = (id) => onSelect && onSelect(id === selected ? null : id)
  const move = (id) => (e) => {
    const r = box.current.getBoundingClientRect()
    setHover({ id, x: e.clientX - r.left, y: e.clientY - r.top })
  }
  const byRegion = useMemo(() => {
    const m = {}
    SABAH_DISTRICTS.forEach((p) => { (m[p.region] = m[p.region] || []).push(p) })
    return m
  }, [])

  return (
    <div className={'map-wrap smap' + (compact ? ' compact' : '')}>
      <div className="map" ref={box} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="Map of Sabah: registered workers by town, coloured by the share not yet paid in each area">
          <defs>
            <linearGradient id="smap-sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#EAF3FC" />
              <stop offset="1" stopColor="#DCEAF8" />
            </linearGradient>
            {TONES.map(([c], i) => (
              <radialGradient key={c} id={`smap-heat-${i}`}>
                <stop offset="0" stopColor={c} stopOpacity=".85" />
                <stop offset=".4" stopColor={c} stopOpacity=".4" />
                <stop offset="1" stopColor={c} stopOpacity="0" />
              </radialGradient>
            ))}
            <clipPath id="smap-land">{SABAH_DISTRICTS.map((p, i) => <path key={i} d={p.d} />)}</clipPath>
            <filter id="smap-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#0B2545" floodOpacity=".16" />
            </filter>
          </defs>

          <rect width={MAP_W} height={MAP_H} fill="url(#smap-sea)" />
          {!compact && [4, 5, 6, 7].map((lat) => { const y = project(115, lat)[1]; return <g key={'la' + lat}><line className="smap-grid" x1="0" x2={MAP_W} y1={y} y2={y} /><text className="smap-grid-t" x="6" y={y - 4}>{lat}°N</text></g> })}
          {!compact && [115, 116, 117, 118, 119].map((lon) => { const x = project(lon, 5)[0]; return <g key={'lo' + lon}><line className="smap-grid" y1="0" y2={MAP_H} x1={x} x2={x} /><text className="smap-grid-t" x={x + 4} y={MAP_H - 6}>{lon}°E</text></g> })}

          <path d={NEIGHBOURS} className="smap-neighbour" />
          {!compact && MAP_LABELS.map((l) => <text key={l.t} x={l.x} y={l.y} className={l.sea ? 'smap-sea-t' : 'smap-land-t'} textAnchor="middle">{l.t}</text>)}

          {/* Sabah: coastline glow, then one clickable group per reporting area */}
          <g filter="url(#smap-shadow)">{SABAH_DISTRICTS.map((p, i) => <path key={i} d={p.d} fill="#fff" />)}</g>
          {districts.map((d) => {
            const a = areas[d.id]
            const z = zoneTone(a.rate)
            const on = d.id === selected
            const dim = !shows(d.id)
            return (
              <g key={d.id} className={'smap-area' + (on ? ' on' : '') + (dim ? ' dim' : '') + (hover && hover.id === d.id ? ' hot' : '')}
                role={compact ? undefined : 'button'} tabIndex={compact || dim ? -1 : 0} aria-pressed={compact ? undefined : on}
                aria-label={`${d.name}: ${num(d.workers)} registered workers, ${pct(1 - a.rate)} not yet paid`}
                onClick={() => !dim && pick(d.id)} onMouseMove={compact ? undefined : move(d.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!dim) pick(d.id) } }}
                style={{ '--tone': z.c }}>
                {(byRegion[d.id] || []).map((p, i) => <path key={i} d={p.d} />)}
              </g>
            )
          })}

          {/* Where people are: one glowing hotspot per town, clipped to the land */}
          <g clipPath="url(#smap-land)" className="smap-heat">
            {towns.map((t, i) => {
              const a = areas[t.region]
              if (!shows(t.region)) return null
              const tone = TONES.findIndex(([c]) => c === zoneTone(a.rate).c)
              const r = (compact ? 10 : 18) + 64 * Math.sqrt(t.workers / maxTown)
              return <circle key={t.name} cx={t.x} cy={t.y} r={r} fill={`url(#smap-heat-${tone})`} style={{ animationDelay: `${(i % 7) * -0.6}s` }} />
            })}
          </g>

          {!compact && (
            <g className="smap-kinabalu" transform={`translate(${KINABALU.x} ${KINABALU.y})`}>
              <path d="M0,-7 L6,4 L-6,4 Z" />
              <text x="9" y="3">Mount Kinabalu</text>
            </g>
          )}

          {/* Payments arriving now */}
          {pulses.map((p) => (
            <g key={p.id} className="smap-pulse" transform={`translate(${p.town.x} ${p.town.y})`} style={{ animationDelay: `${p.delay}ms` }}>
              <circle r="4" />
              <circle r="4" className="r2" />
              <text y="-10" textAnchor="middle">+{rm(RATE)}</text>
            </g>
          ))}

          {/* Town dots and labels */}
          {towns.map((t) => {
            if (!shows(t.region)) return null
            const on = t.region === selected
            return (
              <g key={t.name} className={'smap-dot' + (t.main ? ' main' : '') + (on ? ' on' : '')}>
                <circle cx={t.x} cy={t.y} r={t.main ? 5 : 3} />
                {(!HIDE_LABEL.has(t.name) || on) && <TownLabel t={t} d={areas[t.region]} compact={compact && !(on && t.main)} />}
              </g>
            )
          })}
          {!anyShown && <text x={MAP_W / 2} y={MAP_H / 2} textAnchor="middle" className="smap-empty">No area matches this filter</text>}
          {!compact && <text x={MAP_W - 10} y={MAP_H - 24} textAnchor="end" className="smap-credit">Boundaries: geoBoundaries (CC BY 4.0), Natural Earth</text>}
        </svg>

        {!compact && (
          <div className={'smap-live' + (frozen ? ' frozen' : '')} aria-live="polite">
            <span className="dot" aria-hidden="true" />
            {frozen ? 'Frozen for recording' : liveTotal
              ? <span><b className="num">{num(liveTotal)}</b> payments since you opened this page · <b className="num">{rm(Math.round(liveRm))}</b>{last && <> · latest in {last}</>}</span>
              : 'Waiting for the next payment'}
          </div>
        )}

        {!compact && hov && (
          <div className="smap-tip" style={{ left: Math.min(hover.x + 14, (box.current ? box.current.clientWidth : 600) - 210), top: hover.y + 14 }}>
            <b>{hov.name}</b>
            <span>{num(hov.workers)} registered workers</span>
            <span>{num(hov.paid)} paid{hov.live ? ` (${num(hov.live)} just now)` : ''}</span>
            <span><i style={{ background: zoneTone(hov.rate).c }} />{pct(1 - hov.rate)} not yet paid</span>
          </div>
        )}

        {!compact && (
          <div className="map-legend">
            <b style={{ fontSize: 12 }}>Share not yet paid</b>
            {TONES.map(([c, t]) => <span key={c}><i style={{ background: c }} />{t}</span>)}
            <span className="smap-key"><i className="glow" />Glow: where registered workers are</span>
            <span className="smap-key"><i className="ring" />Ripple: a payment arriving</span>
          </div>
        )}
      </div>
      <div className="panel">
        {sel ? (
          <>
            {renderPanel ? renderPanel(sel) : <DistrictDetail d={sel} />}
            <TownList towns={towns.filter((t) => t.region === sel.id)} />
          </>
        ) : (
          <div className="empty" style={{ padding: '40px 8px' }}>
            <div className="ic"><Info size={22} /></div>
            <b>No area selected</b>
            Choose an area on the map to see its towns, workers, payments and arrears.
          </div>
        )}
      </div>
    </div>
  )
}

function TownList({ towns }) {
  if (towns.length < 2) return null
  const max = Math.max(...towns.map((t) => t.workers))
  return (
    <div className="smap-towns">
      <div className="gv-sub" style={{ margin: '16px 0 8px' }}>Where the workers are</div>
      {[...towns].sort((a, b) => b.workers - a.workers).map((t) => (
        <div key={t.name} className="row">
          <span className="nm">{t.name}</span>
          <span className="bar"><span style={{ width: (t.workers / max) * 100 + '%' }} /></span>
          <b className="num">{num(t.workers)}</b>
        </div>
      ))}
      <p className="small muted" style={{ marginTop: 8 }}>Registered workers by work site on eNORES. Sample split for the prototype.</p>
    </div>
  )
}
