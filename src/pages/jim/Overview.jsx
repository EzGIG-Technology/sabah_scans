// JIM overview (/jim). Record matching between SCANS and JIM permit data, permits ending (information
// only), status checks by JIM officers and the health of the JIM data link.
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Link2, GitCompareArrows, CalendarClock, ScanLine, RefreshCw, Pause, Play, Download } from 'lucide-react'
import { PageHead, Card, Kpi, Callout, BarChart, HBarChart, Donut, MeterRows, useLiveFeed, useToast } from '../../components/ui.jsx'
import { REGISTERED, workers, num, pct } from '../../data/demo.js'
import { logEvent } from '../shared/store.js'
import {
  BASE, SWIMS_RECORDS, contrib, matchByDistrict, JIM_MATCHED, JIM_WAITING, JIM_NOT_FOUND, permitsWithin, expiryByMonth,
  OFFICES, CHECKS_TODAY, useJim,
} from './data.js'

const OFFICERS_SHORT = ['Officer Nur Syafiqah', 'Officer Jeffrey', 'Officer Siti Aminah', 'Officer Rosnah', 'Officer Azman', 'Officer Hafiz', 'Officer Hamdan']
const HOW = ['SCANS ID', 'Passport', 'PLKS number', 'SCANS card QR']
const makeCheck = (n) => {
  const w = workers[(n * 13 + 5) % workers.length]
  return { id: 'chk-' + n + '-' + Date.now(), n, w, office: OFFICES[n % OFFICES.length], officer: OFFICERS_SHORT[(n * 3) % OFFICERS_SHORT.length], how: HOW[n % HOW.length], born: Date.now() }
}
const maxWaiting = Math.max(...matchByDistrict.map((d) => d.waiting))
const SEED = [0, 1, 2, 3, 4].map((i) => ({ ...makeCheck(101 + i * 3), n: 0, ago: `${(i + 1) * 3} min ago`, born: null }))
const ago = (t) => { if (!t.born) return t.ago; const s = Math.max(1, Math.round((Date.now() - t.born) / 1000)); return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago` }

export default function Overview() {
  const go = useNavigate()
  const toast = useToast()
  const [paused, setPaused] = useState(false)
  const feed = useLiveFeed(SEED, makeCheck, paused ? 1e9 : 4000, 5)
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(id) }, [])
  const matches = useJim((s) => s.matches)
  const decided = matches.filter((m) => m.status !== 'Waiting').length
  // Records already decided come off their district too, so the districts add up to the total.
  const waitingIn = (d) => d.waiting - matches.filter((m) => m.status !== 'Waiting' && m.district === d.name).length
  const lastRun = useJim((s) => s.runs[0])
  const made = Math.max(0, ...feed.map((f) => f.n))
  const checksNow = CHECKS_TODAY + made
  // Live checks are spread over the offices in turn (check n goes to office n mod 7).
  const officeRows = OFFICES.map((o, i) => ({ label: o.name, value: o.checks + (made >= (i || 7) ? Math.floor((made - (i || 7)) / OFFICES.length) + 1 : 0) }))
    .sort((a, b) => b.value - a.value)
  const soon60 = permitsWithin(60)

  const open = (w) => go(`${BASE}/workers/${w.id}`)
  const exportOverview = () => { logEvent('Exported JIM overview', 'Record matching and permits · 17 Jun 2027 · PDF'); toast('Overview downloaded as PDF. The download is in the audit log.') }

  return (
    <>
      <PageHead title="Overview" sub="Thursday 17 June 2027. How SCANS records line up with JIM permit data, and what officers checked today.">
        <button className="btn outline" onClick={exportOverview}><Download /> Download</button>
      </PageHead>

      <Callout icon={ShieldCheck}>
        <b>Immigration sees contribution status only, for information.</b> SCANS does not decide anyone’s immigration status and has no function to issue, hold, suspend or cancel a permit. Contribution status must not be used to refuse, delay or cancel a permit. Every lookup and export is written to the audit log.
      </Callout>

      <div className="jim-kpis">
        <Kpi hero icon={Link2} label="Matched to a JIM permit record" value={num(JIM_MATCHED)} note={`${pct(JIM_MATCHED / REGISTERED, 1)} of ${num(REGISTERED)} workers registered on SCANS`} />
        <Kpi icon={GitCompareArrows} tone="warn" label="Waiting for JIM to confirm" value={num(JIM_WAITING - decided)} note="SCANS and JIM disagree on a detail" />
        <Kpi icon={CalendarClock} tone="purple" label="Permits ending within 60 days" value={num(soon60)} note="Information only" />
        <Kpi icon={ScanLine} label="Status checks today" value={num(checksNow)} note={`By officers at ${OFFICES.length} JIM offices`} />
        <Kpi icon={RefreshCw} tone="ok" label="JIM data link" value="99.8%" note={`Runs that finished in 30 days. Last ${lastRun.at.slice(-5)}, ${num(lastRun.failed)} failed`} />
      </div>

      <div className="grid g-main">
        <Card title="Waiting for JIM, by district" sub="Records where SCANS and JIM permit data disagree, with the share of each district matched"
          action={<Link className="btn sm outline" to={`${BASE}/records`}><GitCompareArrows /> Record matching</Link>}>
          <MeterRows items={matchByDistrict.map((d) => ({ ...d, waiting: waitingIn(d) })).sort((a, b) => b.waiting - a.waiting).map((d) => ({
            label: d.name, share: d.waiting / maxWaiting,
            text: `${num(d.waiting)} waiting · ${pct(d.matched / d.workers, 1)} matched`,
            color: d.waiting / d.workers > 0.0095 ? 'var(--warnFill)' : undefined,
          }))} />
          <p className="small muted" style={{ marginTop: 14 }}>Orange: more than 0.95% of the district’s records are waiting. A record waits when the name spelling, passport number, date of birth or employer differs between SCANS and JIM.</p>
        </Card>
        <Card title="Record match" sub={`All ${num(REGISTERED)} registered workers`}>
          <Donut size={170} center={pct(JIM_MATCHED / REGISTERED, 1)} centerSub="matched" format={(v) => num(v)} data={[
            { label: 'Matched', value: JIM_MATCHED, color: '#1D66B8' },
            { label: 'Waiting for JIM', value: JIM_WAITING - decided, color: '#FF8A1F' },
            { label: 'Confirmed by JIM this week', value: decided, color: '#14B8A6' },
            { label: 'Not yet in JIM data', value: JIM_NOT_FOUND, color: '#B7C2D8' },
          ]} />
          <dl className="kv one jim-src">
            <div><dt>SWIMS records (State)</dt><dd className="num">{num(SWIMS_RECORDS)}</dd></div>
            <div><dt>Registered on SCANS</dt><dd className="num">{num(REGISTERED)}</dd></div>
          </dl>
          <p className="small muted" style={{ marginTop: 12 }}>Records not yet in JIM data are mostly new arrivals whose permit is still being issued.</p>
        </Card>
      </div>

      <div className="grid g-main">
        <Card title={<span className="row" style={{ gap: 8 }}>Latest status checks <span className={'pill ' + (paused ? 'grey' : 'ok') + ' dot st-live'}>{paused ? 'Paused' : 'Live'}</span></span>}
          sub={`${num(checksNow)} checks by JIM officers today`}
          action={<button className="btn sm ghost" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? <><Play /> Resume</> : <><Pause /> Pause</>}</button>}>
          <div className={'feed st-feed' + (paused ? '' : ' fresh')} aria-live={paused ? 'off' : 'polite'}>
            {feed.map((t) => {
              const c = contrib(t.w)
              return (
                <div key={t.id} className="it gv-feed-it" role="link" tabIndex={0} aria-label={`${t.w.id}, ${c.label}. Open record`}
                  onClick={() => open(t.w)} onKeyDown={(e) => e.key === 'Enter' && open(t.w)}>
                  <span className="ic"><ScanLine aria-hidden="true" /></span>
                  <div style={{ minWidth: 0 }}>
                    <b>{t.w.id}</b>
                    <div className="gv-tags"><span className="pill grey">{t.w.nationality}</span><span className={'pill ' + c.tone}>{c.label}</span></div>
                    <span className="st-feed-sub">{t.officer} · {t.office.name} office · by {t.how}</span>
                  </div>
                  <div className="amt"><span>{ago(t)}</span></div>
                </div>
              )
            })}
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>Choose a check to open the record. Opening a record is written to the audit log.</p>
        </Card>
        <Card title="Checks per JIM office" sub="Status checks today">
          <HBarChart data={officeRows} />
          <Link className="btn sm primary" to={`${BASE}/check`} style={{ marginTop: 18 }}><ScanLine /> Check a worker</Link>
        </Card>
      </div>

      <Card title="Permits ending by month" sub="PLKS end dates from JIM permit data, July 2027 to June 2028. For planning office work only"
        action={<Link className="btn sm outline" to={`${BASE}/permits`}><CalendarClock /> Permits ending soon</Link>}>
        <BarChart data={expiryByMonth} height={230} colors={['#4D9AD3']} />
        <p className="small muted" style={{ marginTop: 10 }}>Scaled from the 160-record sample to all registered workers. Permit dates are shown as JIM sends them; they are not linked to contributions.</p>
      </Card>
    </>
  )
}
