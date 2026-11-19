import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Repeat, ArrowRight, CheckCircle2, Lock, Upload, FileText, ShieldCheck, Landmark, Users, CalendarDays, AlertTriangle, Circle, Info } from 'lucide-react'
import { PageHead, Card, Status, Callout, Stepper, Table, Mono, Switch, Modal, SearchInput, Seg, Empty, useToast } from '../../components/ui.jsx'
import { RATE, rm, num } from '../../data/demo.js'
import { EmpShell, Who, WStatus } from './shell.jsx'
import { COMPANY, DEMO_TODAY, useRoster, useEmp, setEmp, banks } from './data.js'

const DAYS = [
  { d: 1, label: '1st of the month', note: 'First debit 1 Jan 2028' },
  { d: 3, label: '3rd of the month', note: 'First debit 3 Jan 2028' },
  { d: 5, label: '5th of the month', note: 'The due date. First debit 5 Jan 2028' },
]
const ord = (d) => (d === 1 ? '1st' : d === 3 ? '3rd' : d + 'th')

function Wizard({ initial, onDone, onCancel }) {
  const roster = useRoster()
  const consenting = roster.filter((w) => w.consent)
  const [step, setStep] = useState(initial ? 2 : 0)
  const [bank, setBank] = useState(initial ? initial.bank : null)
  const [auth, setAuth] = useState(initial ? 'ok' : 'none') // none | waiting | ok
  const [sel, setSel] = useState(() => new Set(initial ? initial.workers : consenting.map((w) => w.id)))
  const [autoAdd, setAutoAdd] = useState(initial ? initial.autoAdd : true)
  const [day, setDay] = useState(initial ? initial.day : 0)
  const [agree, setAgree] = useState(!!initial)
  useEffect(() => {
    if (auth !== 'waiting') return
    const t = setTimeout(() => setAuth('ok'), 1500)
    return () => clearTimeout(t)
  }, [auth])
  const monthly = sel.size * RATE
  return (
    <Card title={initial ? 'Change auto-pay' : 'Set up auto-pay'} sub="Four short steps. Nothing is debited until you turn it on."
      action={<button className="btn ghost sm" onClick={onCancel}>Cancel</button>}>
      <div style={{ marginBottom: 20 }}><Stepper steps={['Bank', 'Authorise', 'Workers', 'Payment day']} current={step} /></div>

      {step === 0 && (
        <div className="stack">
          <p className="ink2">Choose the company bank account the monthly amount will be debited from.</p>
          <div className="emp-banks" role="radiogroup" aria-label="Bank">
            {banks.map((b) => (
              <button key={b.name} className="option" role="radio" aria-checked={bank === b.name} onClick={() => { setBank(b.name); setAuth('none') }}>
                <Mono name={b.name} color={b.color} /><b>{b.name}</b>
                {bank === b.name && <CheckCircle2 size={18} className="tickmark" />}
              </button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn primary" disabled={!bank} onClick={() => setStep(1)}>Next <ArrowRight /></button></div>
        </div>
      )}

      {step === 1 && (
        <div className="stack">
          <div className="emp-mandate">
            <div className="row between wrap" style={{ marginBottom: 12 }}>
              <b>FPX direct debit mandate</b>
              <img src="/img/pay/fpx.png" alt="FPX" className="emp-fpx" />
            </div>
            <dl className="kv">
              <div><dt>Account holder</dt><dd>{COMPANY.name}</dd></div>
              <div><dt>Bank</dt><dd>{bank}</dd></div>
              <div><dt>Paid to</dt><dd>FWECF account, Jabatan Kewangan Negeri Sabah</dd></div>
              <div><dt>Most it can take each month</dt><dd className="num">{rm(COMPANY.workers * RATE)} ({num(COMPANY.workers)} workers)</dd></div>
              <div><dt>How often</dt><dd>Monthly</dd></div>
              <div><dt>Ends</dt><dd>When you stop it here or in your bank</dd></div>
            </dl>
          </div>
          {auth === 'none' && <Callout icon={Landmark}>You will be sent to {bank} to approve the mandate. You can stop it at any time.</Callout>}
          {auth === 'waiting' && <Callout icon={Repeat}>Waiting for {bank} to approve the mandate. Please do not close this page.</Callout>}
          {auth === 'ok' && <Callout tone="ok" icon={CheckCircle2}>Mandate approved by {bank} on {DEMO_TODAY}. Reference MDT-2712-04417.</Callout>}
          <div className="row between wrap">
            <button className="btn ghost" onClick={() => setStep(0)}>Back</button>
            {auth === 'ok'
              ? <button className="btn primary" onClick={() => setStep(2)}>Next <ArrowRight /></button>
              : <button className="btn primary" disabled={auth === 'waiting'} onClick={() => setAuth('waiting')}><Lock /> {auth === 'waiting' ? 'Waiting for bank…' : `Authorise with ${bank}`}</button>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          <p className="ink2">Only workers who agreed in the app can be included. Workers who have not agreed are never included.</p>
          <Table rows={roster} selectable selected={sel} onSelect={setSel} isSelectable={(w) => w.consent} pageSize={8} columns={[
            { key: 'name', label: 'Worker', render: (w) => <Who w={w} /> },
            { key: 'status', label: 'December 2027', render: (w) => <WStatus w={w} /> },
            { key: 'consent', label: 'Consent', render: (w) => (w.consent ? <Status tone="ok">Given</Status> : <span className="small muted">Not given, cannot be included</span>) },
          ]} />
          <label className="row" style={{ gap: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--surface2)' }}>
            <Switch checked={autoAdd} onChange={setAutoAdd} label="Add workers automatically when they give consent" />
            <span className="small"><b>Add workers automatically when they give consent</b><br /><span className="muted">They are told in the app before the first debit.</span></span>
          </label>
          <div className="row between wrap">
            <button className="btn ghost" onClick={() => setStep(initial ? 2 : 1)} disabled={!!initial}>Back</button>
            <div className="row wrap"><span className="small muted num">{num(sel.size)} workers · {rm(monthly)} a month</span>
              <button className="btn primary" disabled={sel.size === 0} onClick={() => setStep(3)}>Next <ArrowRight /></button></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="stack">
          <div className="emp-days" role="radiogroup" aria-label="Payment day">
            {DAYS.map((d) => (
              <button key={d.d} className="option" role="radio" aria-checked={day === d.d} onClick={() => setDay(d.d)}>
                <span className="row" style={{ gap: 10 }}><span className="radio" /><b>{d.label}</b></span>
                <small className="muted" style={{ paddingLeft: 30 }}>{d.note}</small>
              </button>
            ))}
          </div>
          <div className="emp-mandate">
            <dl className="kv three">
              <div><dt>Workers</dt><dd className="num">{num(sel.size)}</dd></div>
              <div><dt>Each month</dt><dd className="num">{num(sel.size)} × {rm(RATE)} = {rm(monthly)}</dd></div>
              <div><dt>From</dt><dd>FPX · {bank}</dd></div>
            </dl>
          </div>
          <label className="check">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>Auto-pay is a company cost. It is not taken from wages. Deducting from wages needs a JTK Sabah permit under section 113(4) of the Labour Ordinance (see below).</span>
          </label>
          <div className="row between wrap">
            <button className="btn ghost" onClick={() => setStep(2)}>Back</button>
            <button className="btn primary" disabled={!day || !agree || monthly <= 0}
              onClick={() => onDone({ bank, workers: [...sel], autoAdd, day, ref: 'MDT-2712-04417', since: DEMO_TODAY })}>
              <CheckCircle2 /> Turn on auto-pay
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

/* Figma "Auto-Debit Management" (636:147163): who is on auto-pay, and adding or removing workers. */
function Enrolment({ m }) {
  const roster = useRoster()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [view, setView] = useState('all')
  const [sel, setSel] = useState(() => new Set())
  const [remove, setRemove] = useState(null)
  const on = useMemo(() => new Set(m.workers), [m.workers])
  const since = (id) => (m.added && m.added[id]) || m.since
  const rows = roster
    .filter((w) => view === 'all' || (view === 'on' ? on.has(w.id) : !on.has(w.id)))
    .filter((w) => !q || (w.name + ' ' + w.id).toLowerCase().includes(q.toLowerCase()))
  const canAdd = (w) => w.consent && !on.has(w.id)
  const notOn = roster.filter(canAdd)
  const add = () => {
    const ids = [...sel].filter((id) => !on.has(id))
    setEmp((st) => ({ mandate: { ...st.mandate, workers: [...st.mandate.workers, ...ids], added: { ...(st.mandate.added || {}), ...Object.fromEntries(ids.map((id) => [id, DEMO_TODAY])) } } }))
    setSel(new Set())
    toast(`${ids.length} ${ids.length === 1 ? 'worker' : 'workers'} added to auto-pay from ${m.day} Jan 2028. They are told in the app first.`)
  }
  return (
    <Card title="Workers on auto-pay" sub={`${num(m.workers.length)} of the ${num(roster.filter((w) => w.consent).length)} workers in this list who agreed in the app`}>
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <SearchInput value={q} onChange={setQ} placeholder="Search name or SCANS ID" />
        <Seg label="Show" value={view} onChange={setView} items={[{ value: 'all', label: 'All' }, { value: 'on', label: 'On auto-pay' }, { value: 'off', label: 'Not on it' }]} />
        <button className="btn outline sm" disabled={notOn.length === 0} onClick={() => setSel(new Set(notOn.map((w) => w.id)))}>Select all not on auto-pay</button>
        {sel.size > 0 && <button className="btn primary sm" onClick={add}><CheckCircle2 /> Add {num(sel.size)} to auto-pay</button>}
      </div>
      <Table rows={rows} selectable selected={sel} onSelect={setSel} isSelectable={canAdd} pageSize={8}
        empty={<Empty icon={Users} title="No worker matches">Try another search or show all workers.</Empty>}
        columns={[
          { key: 'name', label: 'Worker', render: (w) => <Who w={w} /> },
          { key: 'status', label: 'December 2027', render: (w) => <WStatus w={w} /> },
          { key: 'owing', label: 'Owing', align: 'r', render: (w) => <span className="num">{rm(w.owing)}</span> },
          { key: 'auto', label: 'Auto-pay', render: (w) => (on.has(w.id) ? <span className="pill ok dot">On</span> : w.consent ? <span className="pill grey">Not on it</span> : <span className="small muted"><Lock size={13} style={{ verticalAlign: -2 }} /> No consent</span>) },
          { key: 'since', label: 'Added on', render: (w) => (on.has(w.id) ? since(w.id) : <span className="muted">-</span>) },
          { key: 'act', label: '', align: 'r', render: (w) => (on.has(w.id) ? <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); setRemove(w) }}>Remove</button> : null) },
        ]} />
      <Callout icon={Info} style={{ marginTop: 12 }}>Auto-pay covers the month due. Months a worker already owes are not taken automatically. Pay those from <Link to="/employer/pay">Pay for workers</Link>.</Callout>
      {remove && (
        <Modal title={`Remove ${remove.name} from auto-pay?`} onClose={() => setRemove(null)} actions={<>
          <button className="btn outline" onClick={() => setRemove(null)}>Keep</button>
          <button className="btn danger" onClick={() => {
            setEmp((st) => ({ mandate: { ...st.mandate, workers: st.mandate.workers.filter((id) => id !== remove.id) } }))
            toast(`${remove.name} removed from auto-pay`); setRemove(null)
          }}>Remove</button>
        </>}>
          <p className="ink2">The company stops paying for {remove.name} from January 2028. They stay responsible for their own contribution and are told in the app.</p>
        </Modal>
      )}
    </Card>
  )
}

function Deduction() {
  const { permit } = useEmp()
  const toast = useToast()
  return (
    <Card title="Deduct from wages" sub="Optional. Only allowed with a written permit from JTK Sabah."
      action={<Status tone={permit ? 'info' : 'grey'}>{permit ? 'In review' : 'Locked'}</Status>}>
      <div className="stack">
        <div className="emp-locked">
          <span className="ic"><Lock size={18} /></span>
          <div className="grow">
            <b>{permit ? 'Locked until JTK Sabah confirms your permit' : 'Locked: no JTK Sabah permit on file'}</b>
            <p className="small ink2" style={{ marginTop: 4 }}>
              The worker is responsible for their own contribution. Under section 113(4) of the Labour Ordinance, an employer may take money from wages only with written permission from JTK Sabah. SCANS blocks wage deduction until that permit is on file and checked. Without it you can still pay for workers who agreed, as a company cost.
            </p>
          </div>
          <button type="button" className="switch" role="switch" aria-checked={false} aria-label="Deduct the contribution from wages" disabled style={{ opacity: .5, cursor: 'not-allowed' }} />
        </div>
        {!permit ? (
          <button type="button" className="dropzone emp-drop" onClick={() => { setEmp({ permit: { file: 'JTK-Sabah-s113-4-permit-BPP.pdf', size: '284 KB', at: DEMO_TODAY } }); toast('Permit uploaded. It is now in review.') }}>
            <span className="ic"><Upload size={20} /></span>
            <b>Upload your JTK Sabah s.113(4) permit</b>
            <small>PDF or photo, up to 10 MB. Click to choose a file.</small>
          </button>
        ) : (
          <>
            <div className="emp-file">
              <span className="ic"><FileText size={18} /></span>
              <div className="grow"><b>{permit.file}</b><small>{permit.size} · uploaded {permit.at} by Jennifer Liew</small></div>
              <Status>In review</Status>
            </div>
            <Callout icon={ShieldCheck}>Microtek checks the permit with JTK Sabah, usually within 5 working days. Deduction stays off until it is confirmed, and each worker is told in the app before any deduction starts.</Callout>
            <div><button className="btn ghost sm" onClick={() => setEmp({ permit: null })}>Remove and upload again</button></div>
          </>
        )}
      </div>
    </Card>
  )
}

export default function AutoPay() {
  const st = useEmp()
  const roster = useRoster()
  const toast = useToast()
  const [wizard, setWizard] = useState(false)
  const [stop, setStop] = useState(false)
  const m = st.mandate
  const consenting = roster.filter((w) => w.consent).length
  return (
    <EmpShell title="Monthly auto-pay">
      <PageHead title="Monthly auto-pay" crumbs={[{ label: 'Payments' }, { label: 'Monthly auto-pay' }]}
        sub="Pay RM100 a month for chosen workers by FPX direct debit, without doing it by hand. Only for workers who agreed in the app." />

      <div className="grid g-main" style={{ alignItems: 'start' }}>
        <div className="stack">
          {m ? (
            <Card className="hero">
              <div className="row between wrap" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="row" style={{ gap: 10 }}><Repeat size={20} /><b style={{ fontSize: 17 }}>Auto-pay is on</b><span className="pill white">Active</span></div>
                  <div className="num" style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.03em', marginTop: 10 }}>{rm(m.workers.length * RATE)}<span style={{ fontSize: 15, fontWeight: 500, opacity: .85 }}> a month</span></div>
                  <p style={{ opacity: .85, marginTop: 4 }}>For {num(m.workers.length)} workers on the {ord(m.day)} of each month from {m.bank}. Next debit {m.day} Jan 2028.</p>
                </div>
                <div className="row wrap">
                  <button className="btn white sm" onClick={() => setWizard(true)}>Change workers</button>
                  <button className="btn sm" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }} onClick={() => setStop(true)}>Stop auto-pay</button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="row wrap" style={{ gap: 16 }}>
                <span className="emp-badge info" style={{ width: 56, height: 56 }}><Repeat /></span>
                <div className="grow" style={{ minWidth: 220 }}>
                  <div className="row" style={{ gap: 8 }}><b style={{ fontSize: 17 }}>Auto-pay is off</b><Status tone="grey">Off</Status></div>
                  <p className="ink2" style={{ marginTop: 4 }}>{num(consenting)} workers in this list have agreed to let the company pay. Set up auto-pay once and their contribution is paid each month.</p>
                </div>
                {!wizard && <button className="btn primary" onClick={() => setWizard(true)}>Set up auto-pay <ArrowRight /></button>}
              </div>
            </Card>
          )}
          {wizard && (
            <Wizard initial={m} onCancel={() => setWizard(false)}
              onDone={(mandate) => { setEmp({ mandate }); setWizard(false); toast(`Auto-pay is on for ${mandate.workers.length} workers from ${mandate.day} Jan 2028`) }} />
          )}
        </div>
        <Card title="What auto-pay needs">
          <div className="emp-rows">
            {[
              [!!m, Landmark, 'FPX direct debit mandate', m ? `${m.bank}, approved ${m.since}` : 'Approve it once in your bank'],
              [true, Users, 'Worker consent', `${num(consenting)} workers in this list agreed in the app`],
              [!!m, CalendarDays, 'A payment day', m ? `The ${ord(m.day)} of each month` : '1st, 3rd or 5th of the month'],
              [false, AlertTriangle, 'JTK Sabah s.113(4) permit', st.permit ? 'Uploaded, in review. Needed only to deduct from wages' : 'Needed only if the money comes from wages'],
            ].map(([ok, Icon, t, d]) => (
              <div key={t}>
                <span className="k-ic" style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: ok ? 'var(--okBg)' : 'var(--surface2)', color: ok ? 'var(--ok)' : 'var(--ink3)', flex: 'none' }}>{ok ? <CheckCircle2 size={18} /> : <Icon size={18} />}</span>
                <div className="grow"><b>{t}</b><small>{d}</small></div>
                {!ok && <Circle size={14} color="var(--line)" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {m && !wizard && <Enrolment m={m} />}

      <Deduction />

      {stop && (
        <Modal title="Stop auto-pay?" onClose={() => setStop(false)} actions={<>
          <button className="btn outline" onClick={() => setStop(false)}>Keep auto-pay</button>
          <button className="btn danger" onClick={() => { setEmp({ mandate: null }); setStop(false); toast('Auto-pay stopped. No further debits will be made.') }}>Stop auto-pay</button>
        </>}>
          <p className="ink2">No more debits will be made from {m && m.bank}. Workers stay responsible for their own contribution and will be reminded in the app to pay from January.</p>
        </Modal>
      )}
    </EmpShell>
  )
}
