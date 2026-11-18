import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle2, Download, Printer, ShieldCheck, Info, XCircle, RotateCcw, Lock, Users } from 'lucide-react'
import { PageHead, Card, Status, Callout, Stepper, SearchInput, Seg, Table, Mono, Switch, useToast } from '../../components/ui.jsx'
import { RATE, rm, num } from '../../data/demo.js'
import { EmpShell, WStatus, Who } from './shell.jsx'
import { COMPANY, DEMO_TODAY, useRoster, useEmp, setEmp, getEmp, periodLabel, banks } from './data.js'

const STEPS = ['Select workers', 'Choose period', 'Checkout', 'Done']
const PERIODS = [
  { m: 1, label: '1 month', note: 'The next unpaid month for each worker' },
  { m: 3, label: '3 months', note: 'Same as RM300 a quarter' },
  { m: 6, label: '6 months', note: 'Half a year in one payment' },
  { m: 12, label: '12 months', note: 'Same as RM1,200 a year' },
]
const clock = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }

/* Selected workers in a stable order with what each payment covers. Used on every step. */
function lines(roster, sel, months) {
  return roster.filter((w) => sel.has(w.id)).map((w) => ({
    w, from: w.paidIdx + 1, period: months ? periodLabel(w.paidIdx + 1, months) : '', amount: months * RATE,
  }))
}

function Summary({ count, months, total, children }) {
  return (
    <Card className="emp-sum" title="Payment summary" sub={`${COMPANY.name}`}>
      <dl>
        <div><dt>Workers</dt><dd className="num">{num(count)}</dd></div>
        <div><dt>Contribution</dt><dd className="num">{rm(RATE)} a month each</dd></div>
        <div><dt>Period</dt><dd>{months ? `${months} ${months === 1 ? 'month' : 'months'}` : 'Not chosen yet'}</dd></div>
        <div><dt>Fees</dt><dd>None</dd></div>
      </dl>
      <div className="total">
        <div><div className="small muted">Total to pay</div><b className="num">{rm(total, 2)}</b></div>
        <div className="formula num">{num(count)} × {rm(RATE)} × {months || 0}<br />{months ? 'months' : 'choose a period'}</div>
      </div>
      {children}
    </Card>
  )
}

export default function Pay() {
  const roster = useRoster()
  const st = useEmp()
  const toast = useToast()
  const go = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('w')
  const presetW = roster.find((w) => w.id === preset && w.consent)
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState('form') // form | processing | failed | done
  const [sel, setSel] = useState(() => new Set(presetW ? [presetW.id] : []))
  const [view, setView] = useState(presetW && presetW.owing === 0 ? 'all' : 'owing')
  const [q, setQ] = useState('')
  const [months, setMonths] = useState(0)
  const [other, setOther] = useState('')
  const [bank, setBank] = useState(null)
  const [agree, setAgree] = useState(false)
  const [fail, setFail] = useState(false)
  const [batch, setBatch] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const chosen = useMemo(() => lines(roster, sel, months), [roster, sel, months])
  const total = chosen.length * RATE * months
  const owedBySel = chosen.reduce((s, l) => s + l.w.owing, 0)
  const consenting = roster.filter((w) => w.consent)
  const list = roster
    .filter((w) => view === 'all' || w.bucket !== 'paid')
    .filter((w) => !q || (w.name + ' ' + w.id).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.owing - a.owing)

  useEffect(() => { window.scrollTo(0, 0) }, [step, phase])

  useEffect(() => {
    if (phase !== 'processing') return
    const t = setTimeout(() => {
      if (fail) { setPhase('failed'); return }
      const seq = getEmp().seq + 1
      const id = `BAT-2706-${String(418 + seq).padStart(5, '0')}`
      const receipts = chosen.map((l, i) => ({
        id: `RCP-2706-${String(310000 + seq * 1000 + i + 1)}`, workerId: l.w.id, name: l.w.name, period: l.period, amount: l.amount,
      }))
      const b = { id, date: DEMO_TODAY, time: clock(), workers: chosen.length, months, amount: total, method: 'FPX · ' + bank, status: 'Processing', receipts }
      setEmp((s) => {
        const paidAdd = { ...s.paidAdd }
        chosen.forEach((l) => { paidAdd[l.w.id] = (paidAdd[l.w.id] || 0) + months })
        return { seq, batches: [b, ...s.batches], paidAdd }
      })
      setBatch(b)
      setPhase('done')
      setStep(3)
    }, 1800)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Quick selects from Figma ("Select all red", "Select all yellow + red"). Workers without consent are never added. */
  const pick = (test) => {
    const match = roster.filter(test)
    const ok = match.filter((w) => w.consent)
    setSel(new Set(ok.map((w) => w.id)))
    const left = match.length - ok.length
    toast(`${ok.length} ${ok.length === 1 ? 'worker' : 'workers'} selected.${left ? ` ${left} without consent ${left === 1 ? 'was' : 'were'} left out.` : ''}`)
  }

  const restart = () => { setSel(new Set()); setMonths(0); setOther(''); setBank(null); setAgree(false); setBatch(null); setPhase('form'); setStep(0) }

  const head = (
    <PageHead title="Pay for workers"
      crumbs={[{ label: 'Payments' }, { label: 'Pay for workers' }]}
      sub="Pay for several workers at once. Each worker gets their own receipt in the app, and the money goes straight to the State’s FWECF account." />
  )

  return (
    <EmpShell title="Pay for workers">
      {head}
      <Card style={{ padding: '18px 20px' }}><Stepper steps={STEPS} current={phase === 'done' ? STEPS.length : step} /></Card>

      {/* ---------- Step 1: select workers ---------- */}
      {step === 0 && (
        <>
          <Card title="Select workers" sub="Only workers who agreed in the app to let the company pay can be selected. The others are shown so you can see who still owes.">
            {presetW && <Callout tone="ok" icon={CheckCircle2} style={{ marginBottom: 12 }}>{presetW.name} is selected. Add more workers or continue.</Callout>}
            <div className="toolbar" style={{ marginBottom: 12 }}>
              <SearchInput value={q} onChange={setQ} placeholder="Search name or SCANS ID" />
              <Seg label="Show" value={view} onChange={setView} items={[{ value: 'owing', label: 'Owing' }, { value: 'all', label: 'All workers' }]} />
              <button className="btn outline sm" onClick={() => pick((w) => w.bucket === 'risk')}><span className="emp-dot bad" aria-hidden="true" />Owing 3+ months</button>
              <button className="btn outline sm" onClick={() => pick((w) => w.bucket === 'risk' || w.bucket === 'late')}><span className="emp-dot warn" aria-hidden="true" /><span className="emp-dot bad" aria-hidden="true" style={{ marginLeft: -8 }} />Owing earlier months</button>
              <button className="btn outline sm" onClick={() => pick((w) => w.bucket !== 'paid')}>Everyone who owes</button>
              {sel.size > 0 && <button className="btn ghost sm" onClick={() => setSel(new Set())}>Clear</button>}
            </div>
            <Table rows={list} selectable selected={sel} onSelect={setSel} isSelectable={(w) => w.consent} pageSize={10} columns={[
              { key: 'name', label: 'Worker', render: (w) => <Who w={w} /> },
              { key: 'status', label: 'June 2027', render: (w) => <WStatus w={w} /> },
              { key: 'paidThrough', label: 'Paid up to' },
              { key: 'owing', label: 'Owing', align: 'r', render: (w) => <b className="num">{rm(w.owing)}</b> },
              { key: 'auto', label: 'Auto-pay', render: (w) => (st.mandate && st.mandate.workers.includes(w.id) ? <span className="pill ok dot">On</span> : <span className="pill grey">Off</span>) },
              { key: 'consent', label: 'Consent', render: (w) => (w.consent ? <Status tone="ok">Given</Status>
                : <span className="row" style={{ gap: 6, justifyContent: 'flex-end' }}><Lock size={14} color="var(--ink3)" /><span className="small muted">Not given, so you cannot pay for them</span></span>) },
            ]} />
          </Card>
          <div className="emp-sumbar">
            <div className="figs">
              <div><small>Selected</small><b className="num">{num(sel.size)} of {num(consenting.length)} who agreed</b></div>
              <div><small>They owe now</small><b className="num">{rm(owedBySel)}</b></div>
              <div><small>Each month</small><b className="num">{rm(sel.size * RATE)}</b></div>
            </div>
            <button className="btn primary" disabled={sel.size === 0} onClick={() => setStep(1)}>Choose period <ArrowRight /></button>
          </div>
        </>
      )}

      {/* ---------- Step 2: choose period ---------- */}
      {step === 1 && (
        <div className="emp-pay">
          <Card title="How many months?" sub={`For each of the ${num(chosen.length)} selected workers. Payments clear the oldest unpaid month first.`}>
            <div className="emp-periods" role="radiogroup" aria-label="Period">
              {PERIODS.map((p) => (
                <button key={p.m} className="option" role="radio" aria-checked={months === p.m && other === ''} onClick={() => { setMonths(p.m); setOther('') }}>
                  <span className="radio" />
                  <span className="grow"><b>{p.label}</b><small>{p.note}</small></span>
                  <span className="price num">{rm(p.m * RATE, 2)}<small>per worker</small></span>
                </button>
              ))}
              <div className={'option emp-other' + (other !== '' ? ' on' : '')}>
                <span className="radio" />
                <span className="grow"><b>Another number of months</b><small>From 1 to 24 months</small></span>
                <label className="emp-otherin">
                  <span className="vh">Number of months</span>
                  <input className="input num" type="number" min="1" max="24" inputMode="numeric" placeholder="e.g. 2" value={other}
                    onChange={(e) => { const v = e.target.value; setOther(v); const n = Number(v); setMonths(Number.isInteger(n) && n >= 1 && n <= 24 ? n : 0) }} />
                  <span className="small muted">months</span>
                </label>
              </div>
              {other !== '' && months === 0 && <small className="emp-small-err" role="alert">Enter a whole number of months from 1 to 24.</small>}
            </div>
            {months > 0 && (
              <div style={{ marginTop: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>What this covers</h3>
                <div className="emp-lines emp-scroll">
                  {chosen.map((l) => (
                    <div key={l.w.id}><div className="grow"><b>{l.w.name}</b><small>{l.period}</small></div><span className="amt num">{rm(l.amount)}</span></div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          <div className="sticky">
            <Summary count={chosen.length} months={months} total={total}>
              <Callout icon={Info} style={{ marginTop: 14 }}>Selected workers are covered as soon as the bank confirms the payment.</Callout>
              <button className="btn primary block lg" style={{ marginTop: 14 }} disabled={total <= 0} onClick={() => setStep(2)}>Continue to checkout <ArrowRight /></button>
              {total <= 0 && <p className="small muted" style={{ textAlign: 'center', marginTop: 8 }}>Choose a period to see the total.</p>}
              <button className="btn ghost block" style={{ marginTop: 6 }} onClick={() => setStep(0)}>Back to selection</button>
            </Summary>
          </div>
        </div>
      )}

      {/* ---------- Step 3: checkout ---------- */}
      {step === 2 && phase === 'form' && (
        <div className="emp-pay">
          <div className="stack">
            <Card title="Pay with FPX online banking" sub="You will approve the payment in your bank. No fee is added."
              action={<img src="/img/pay/fpx.png" alt="FPX" className="emp-fpx" />}>
              <div className="emp-banks" role="radiogroup" aria-label="Bank">
                {banks.map((b) => (
                  <button key={b.name} className="option" role="radio" aria-checked={bank === b.name} onClick={() => setBank(b.name)}>
                    <Mono name={b.name} color={b.color} />
                    <b>{b.name}</b>
                    {bank === b.name && <CheckCircle2 size={18} className="tickmark" />}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <label className="check">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>I confirm that each of these {num(chosen.length)} workers agreed in the app to let the company pay for them. This payment is a company cost and will not be taken from their wages unless we hold a JTK Sabah written permit under section 113(4) of the Labour Ordinance.</span>
              </label>
              <div className="emp-demo" style={{ marginTop: 16 }}>
                <Switch checked={fail} onChange={setFail} label="Simulate a failed payment" />
                <div><b>Simulate a failed payment</b><span>Demo only. The bank will decline so you can see the failure screen.</span></div>
              </div>
            </Card>
          </div>
          <div className="sticky">
            <Summary count={chosen.length} months={months} total={total}>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, margin: '16px 0 4px' }}>Workers in this payment</h3>
              <div className="emp-lines emp-scroll" style={{ maxHeight: 220 }}>
                {chosen.map((l) => (
                  <div key={l.w.id}><div className="grow"><b>{l.w.name}</b><small>{l.w.id} · {l.period}</small></div><span className="amt num">{rm(l.amount)}</span></div>
                ))}
              </div>
              <button className="btn primary block lg" style={{ marginTop: 14 }} disabled={!bank || !agree || total <= 0}
                onClick={() => { setAttempt((a) => a + 1); setPhase('processing') }}>
                <Lock /> Pay {rm(total, 2)}
              </button>
              {(!bank || !agree) && <p className="small muted" style={{ textAlign: 'center', marginTop: 8 }}>{!bank ? 'Choose your bank' : 'Tick the confirmation'} to continue.</p>}
              <button className="btn ghost block" style={{ marginTop: 6 }} onClick={() => setStep(1)}>Back to period</button>
            </Summary>
          </div>
        </div>
      )}

      {step === 2 && phase === 'processing' && (
        <Card>
          <div className="emp-state" role="status" aria-live="polite">
            <div className="emp-spin" aria-hidden="true" />
            <h2>Waiting for {bank} to confirm</h2>
            <p>Paying {rm(total, 2)} for {num(chosen.length)} workers. This usually takes a few seconds. Please do not close this page.</p>
          </div>
        </Card>
      )}

      {step === 2 && phase === 'failed' && (
        <Card>
          <div className="emp-state" role="alert">
            <span className="emp-badge bad"><XCircle /></span>
            <h2>Payment not approved</h2>
            <p>Your bank did not approve the payment. No money was taken. Try again or choose another bank.</p>
            <dl className="kv" style={{ textAlign: 'left', marginTop: 8, width: 'min(460px, 100%)' }}>
              <div><dt>Amount</dt><dd className="num">{rm(total, 2)}</dd></div>
              <div><dt>Bank</dt><dd>FPX · {bank}</dd></div>
              <div><dt>Workers</dt><dd className="num">{num(chosen.length)}</dd></div>
              <div><dt>Reference</dt><dd className="num">FPX-2706-{String(77310 + attempt)}</dd></div>
            </dl>
            <div className="row wrap" style={{ justifyContent: 'center', marginTop: 10 }}>
              <button className="btn primary" onClick={() => { setFail(false); setPhase('form') }}><RotateCcw /> Try again</button>
              <button className="btn outline" onClick={() => { setBank(null); setPhase('form') }}>Choose another bank</button>
            </div>
            <p className="small muted">Your selection of workers and the total are kept.</p>
          </div>
        </Card>
      )}

      {/* ---------- Step 4: done ---------- */}
      {step === 3 && batch && (
        <>
          <Card className="hero">
            <div className="emp-receipt-hero">
              <span className="emp-badge" style={{ width: 60, height: 60 }}><Check /></span>
              <div>
                <div style={{ opacity: .85, fontSize: 13.5 }}>Payment received</div>
                <div className="amt num">{rm(batch.amount, 2)}</div>
              </div>
              <dl>
                <div><dt>Batch</dt><dd className="num">{batch.id}</dd></div>
                <div><dt>Paid with</dt><dd>{batch.method}</dd></div>
                <div><dt>Date</dt><dd>{batch.date}, {batch.time}</dd></div>
                <div><dt>Workers</dt><dd className="num">{num(batch.workers)} × {batch.months} {batch.months === 1 ? 'month' : 'months'}</dd></div>
              </dl>
            </div>
          </Card>
          <Card title="One receipt per worker" sub="Each worker also sees their receipt in the app, marked as paid by your company."
            action={<div className="row wrap emp-noprint">
              <button className="btn outline sm" onClick={() => toast(`Batch receipt ${batch.id} downloaded`)}><Download /> Download batch receipt</button>
              <button className="btn outline sm" onClick={() => window.print()}><Printer /> Print</button>
            </div>}>
            <Table rows={batch.receipts} pageSize={10} columns={[
              { key: 'id', label: 'Receipt', render: (r) => <b className="num">{r.id}</b> },
              { key: 'name', label: 'Worker', render: (r) => <span>{r.name}<div className="small muted num">{r.workerId}</div></span> },
              { key: 'period', label: 'Covers' },
              { key: 'amount', label: 'Amount', align: 'r', render: (r) => <b className="num">{rm(r.amount, 2)}</b> },
            ]} footer={<tfoot><tr><td colSpan={3}>{num(batch.workers)} workers</td><td className="r num">{rm(batch.amount, 2)}</td></tr></tfoot>} />
            <Callout icon={ShieldCheck} style={{ marginTop: 14 }}>Settles into the FWECF account held by Jabatan Kewangan Negeri Sabah tonight at 23:00. SCANS never holds the money.</Callout>
          </Card>
          <div className="row wrap emp-noprint">
            <Link to="/employer/statements" className="btn outline">See statements</Link>
            <Link to="/employer" className="btn outline">Back to overview</Link>
            <button className="btn primary" onClick={restart}><Users /> Pay for more workers</button>
          </div>
        </>
      )}
    </EmpShell>
  )
}
