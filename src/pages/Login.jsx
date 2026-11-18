import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Logo, Tabs } from '../components/ui.jsx'

const portals = {
  Workers: { to: '/worker/start', id: 'Phone number', ph: '+60 11-2847 3391', second: 'We send a 6-digit code by SMS', note: 'New here? You will scan your passport once after signing in.' },
  Employers: { to: '/employer', id: 'Work email', ph: 'hr@borneopalm.com.my', second: 'Password', note: 'Your company must be registered in eNORES with JTK Sabah.' },
  'State Government': { to: '/state', id: 'Government email', ph: 'nama@sabah.gov.my', second: 'Password', note: 'Or sign in with MyDigital ID.' },
  Merchants: { to: '/merchant', id: 'Work email', ph: 'manager@7eleven.com.my', second: 'Password', note: 'Merchant partners are approved by Microtek.' },
  Microtek: { to: '/admin', id: 'Microtek email', ph: 'nama@microtek.com.my', second: 'Password', note: 'Two-step sign-in is required for every operator account.' },
}
const keyFromQuery = { worker: 'Workers', employer: 'Employers', state: 'State Government', merchant: 'Merchants', admin: 'Microtek' }

export default function Login() {
  const q = new URLSearchParams(useLocation().search).get('portal')
  const [tab, setTab] = useState(keyFromQuery[q] || 'Workers')
  const nav = useNavigate()
  const p = portals[tab]
  return (
    <div className="login">
      <aside className="login-side">
        <Link to="/" aria-label="SCANS home"><Logo light width={200} /></Link>
        <div>
          <p className="login-big">One record for every worker, every payment and every notice.</p>
          <p className="login-small">Sabah Contribution Administration Network System, for Kerajaan Negeri Sabah.</p>
        </div>
        <p className="login-small">Prototype. Any details sign you in to demo data.</p>
      </aside>
      <main className="login-main">
        <h1>Sign in</h1>
        <p className="sub" style={{ color: 'var(--muted)', margin: '6px 0 24px' }}>Choose who you are signing in as.</p>
        <Tabs items={Object.keys(portals)} value={tab} onChange={setTab} label="Portal" />
        <form className="panel login-form" onSubmit={(e) => { e.preventDefault(); nav(p.to) }}>
          <div className="field"><label htmlFor="id">{p.id}</label><input id="id" className="input" placeholder={p.ph} autoComplete="username" /></div>
          {tab === 'Workers'
            ? <div className="field"><label htmlFor="otp">SMS code</label><input id="otp" className="input" inputMode="numeric" placeholder="6 digits" autoComplete="one-time-code" /><span className="hint">{p.second}</span></div>
            : <div className="field"><label htmlFor="pw">{p.second}</label><input id="pw" type="password" className="input" autoComplete="current-password" /></div>}
          <button className="btn primary block" style={{ minHeight: 52 }}>Sign in</button>
          {tab === 'State Government' && <button type="button" className="btn block" onClick={() => nav('/state')}>Sign in with MyDigital ID</button>}
          <p className="hint" style={{ color: 'var(--muted)', fontSize: 14 }}>{p.note}</p>
        </form>
      </main>
    </div>
  )
}
