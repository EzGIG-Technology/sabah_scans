import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/* The living backdrop behind every page, plus two small motion helpers:
   replays the page entrance on each route change, and lets a soft light
   follow the pointer across glass cards. Styles are in styles/glass.css. */
export default function Ambient() {
  const { pathname } = useLocation()

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const c = document.querySelector('.shell .content')
      if (!c) return
      c.classList.remove('enter'); void c.offsetWidth; c.classList.add('enter')
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return
    let raf = 0, ev = null
    const move = (e) => {
      ev = e
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const el = ev.target.closest && ev.target.closest('.card')
        if (!el) return
        const b = el.getBoundingClientRect()
        el.style.setProperty('--mx', ev.clientX - b.left + 'px')
        el.style.setProperty('--my', ev.clientY - b.top + 'px')
      })
    }
    const out = (e) => {
      const el = e.target.closest && e.target.closest('.card')
      if (el && !el.contains(e.relatedTarget)) { el.style.removeProperty('--mx'); el.style.removeProperty('--my') }
    }
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerout', out, { passive: true })
    return () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerout', out); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="ambient" aria-hidden="true">
      <i /><i /><i /><i />
      <svg viewBox="0 0 1920 600" preserveAspectRatio="none">
        <path className="s2" d="M-100 470 C 300 360 640 520 980 430 S 1600 300 2020 400" />
        <path className="s1" d="M-100 520 C 380 380 760 300 1180 340 S 1700 420 2020 280" />
      </svg>
    </div>
  )
}
