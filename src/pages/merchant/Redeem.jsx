import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScanLine, QrCode, CheckCircle2, Clock, AlertTriangle, Ban, SearchX, RotateCcw, ShieldCheck, Smartphone, HandCoins, MousePointerClick, Camera, Timer } from 'lucide-react'
import { PageHead, Card, Status, Modal, Callout, useToast } from '../../components/ui.jsx'
import { num } from '../../data/demo.js'
import { MShell } from './shell.jsx'
import { useMerchant } from './store.jsx'
import { demoCodes } from './data.js'
import { OfferThumb } from './parts.jsx'

const ERRORS = {
  expired: { icon: Clock, tone: 'warn', title: 'This code has expired', body: 'Codes last 5 minutes. Ask the worker to open the perk again in the SCANS app and show you the new code.' },
  used: { icon: Ban, tone: 'warn', title: 'Already used this month', body: 'This worker has already used this offer as many times as it allows this month. Do not give the discount.' },
  unavailable: { icon: AlertTriangle, tone: 'bad', title: 'This perk is not available', body: 'The perk cannot be used with this code. Do not give the discount. The worker can check the SCANS app for help.' },
  notfound: { icon: SearchX, tone: 'bad', title: 'We could not find this code', body: 'Check the 6 digits with the worker and type them again.' },
}
const LIFETIME = 287
const TODAY_BEFORE = 182 // confirmed earlier today, before the latest feed

const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')

export default function Redeem() {
  const { offers, outlets, redemptions, confirmRedemption } = useMerchant()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('enter') // enter | checking | result | error | done
  const [hit, setHit] = useState(null)
  const [outlet, setOutlet] = useState('7-Eleven Fajar Centre')
  const [left, setLeft] = useState(LIFETIME)
  const [scan, setScan] = useState(false)
  const [done, setDone] = useState(null)
  const [focus, setFocus] = useState(false)
  const inputRef = useRef(null)

  const active = outlets.filter((o) => o.status === 'Active')
  const today = redemptions.filter((r) => r.status === 'Confirmed' && r.at.startsWith('17 Dec 2027'))

  const check = (c = code) => {
    setStage('checking')
    setTimeout(() => {
      const d = demoCodes[c]
      if (!d) { setHit({ kind: 'notfound' }); setStage('error'); return }
      const offer = d.offerId && offers.find((o) => o.id === d.offerId)
      if (d.kind === 'ok' && offer && offer.status !== 'Live') { setHit({ kind: 'unavailable' }); setStage('error'); return }
      // Respect the offer's limit per worker, counting confirmations already made.
      if (d.kind === 'ok') {
        const used = redemptions.filter((r) => r.status === 'Confirmed' && r.worker === d.worker && r.offer === offer.title).length
        const allowed = offer.limit.startsWith('Two') ? 2 : 1
        if (used >= allowed) { setHit({ ...d, offer, kind: 'used' }); setStage('error'); return }
      }
      setHit({ ...d, offer })
      setLeft(LIFETIME)
      setStage(d.kind === 'ok' ? 'result' : 'error')
    }, 650)
  }
  useEffect(() => {
    if (stage !== 'result') return
    const id = setInterval(() => setLeft((s) => {
      if (s <= 1) { setHit((h) => ({ ...h, kind: 'expired' })); setStage('error'); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(id)
  }, [stage])

  const reset = () => { setCode(''); setHit(null); setStage('enter'); setTimeout(() => inputRef.current && inputRef.current.focus(), 50) }
  const confirm = () => {
    const r = confirmRedemption({ offer: hit.offer, worker: hit.worker, outlet })
    setDone({ ...r, offer: hit.offer, worker: hit.worker, outlet })
    setStage('done')
    toast('Counted as used')
  }
  const fill = (c) => { setCode(c); check(c) }

  return (
    <MShell title="Confirm a redemption">
      <PageHead title="Confirm a redemption" sub="Use this at the counter. A perk counts as used only after you confirm it here." />

      <div className="grid g-main" style={{ alignItems: 'start' }}>
        <Card className="mx-counter">
          {(stage === 'enter' || stage === 'checking') && (
            <div className="mx-enter">
              <span className="mx-big-ic"><ScanLine aria-hidden="true" /></span>
              <h2>Type the code the worker shows</h2>
              <p className="muted">It is the 6-digit code under the QR code on the perk in the SCANS app.</p>
              <div className={'mx-code' + (focus ? ' focus' : '')} onClick={() => inputRef.current && inputRef.current.focus()}>
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className={'d' + (i === code.length && focus ? ' on' : '') + (code[i] ? ' full' : '')}>{code[i] || ''}</span>
                ))}
                <input ref={inputRef} aria-label="6-digit code" inputMode="numeric" autoComplete="one-time-code" autoFocus value={code} maxLength={6}
                  onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && check()} />
              </div>
              <div className="mx-enter-actions">
                <button className="btn primary lg" disabled={code.length !== 6 || stage === 'checking'} onClick={() => check()}>
                  {stage === 'checking' ? <><span className="mx-spin" aria-hidden="true" /> Checking</> : <><CheckCircle2 /> Check code</>}
                </button>
                <button className="btn outline lg" onClick={() => setScan(true)}><QrCode /> Scan QR code</button>
              </div>
            </div>
          )}

          {stage === 'result' && hit && (
            <div className="stack">
              <div className="mx-result-head ok">
                <span className="mx-big-ic ok"><CheckCircle2 aria-hidden="true" /></span>
                <div className="grow"><h2>Code is valid</h2><p>Check the offer, give the discount, then confirm.</p></div>
                <span className={'mx-timer' + (left < 60 ? ' low' : '')}><Timer size={15} aria-hidden="true" /> {mmss(left)}</span>
              </div>
              <div className="mx-result-offer">
                <OfferThumb offer={hit.offer} />
                <div className="grow"><b>{hit.offer.title}</b><small>{hit.offer.limit} · {hit.offer.terms}</small></div>
              </div>
              <dl className="kv">
                <div><dt>SCANS ID</dt><dd className="mx-mask">{hit.worker}</dd></div>
                <div><dt>Contribution status</dt><dd><Status tone="ok">Paid</Status></dd></div>
              </dl>
              <label className="field">
                <span>Confirming at</span>
                <select className="select" value={outlet} onChange={(e) => setOutlet(e.target.value)}>
                  {active.map((o) => <option key={o.id} value={o.name}>{o.name} · {o.district}</option>)}
                </select>
              </label>
              <Callout icon={ShieldCheck}>You see the end of the SCANS ID and that the contribution is up to date. Nothing else about the worker is shared with your shop.</Callout>
              <div className="mx-form-foot">
                <button className="btn outline" onClick={() => { reset(); toast('Not counted. The worker can still use the code.') }}>Cancel</button>
                <span className="grow" />
                <button className="btn success lg" onClick={confirm}><CheckCircle2 /> Confirm, count as used</button>
              </div>
            </div>
          )}

          {stage === 'error' && hit && (() => {
            const e = ERRORS[hit.kind]
            const Icon = e.icon
            return (
              <div className="mx-enter">
                <span className={'mx-big-ic ' + e.tone}><Icon aria-hidden="true" /></span>
                <h2>{e.title}</h2>
                <p className="muted" style={{ maxWidth: 440 }}>{e.body}</p>
                {hit.kind === 'used' && <p className="small muted">SCANS ID <span className="mx-mask">{hit.worker}</span> · {hit.offer.title}</p>}
                <div className="mx-enter-actions"><button className="btn primary lg" onClick={reset}><RotateCcw /> Try another code</button></div>
              </div>
            )
          })()}

          {stage === 'done' && done && (
            <div className="mx-enter">
              <span className="mx-big-ic ok big"><CheckCircle2 aria-hidden="true" /></span>
              <h2>Counted as used</h2>
              <p className="muted">The worker sees it as used in the app straight away.</p>
              <dl className="kv mx-done-kv">
                <div><dt>Redemption</dt><dd>{done.id}</dd></div>
                <div><dt>Time</dt><dd>{done.at}</dd></div>
                <div><dt>Offer</dt><dd>{done.offer.title}</dd></div>
                <div><dt>SCANS ID</dt><dd className="mx-mask">{done.worker}</dd></div>
                <div><dt>Outlet</dt><dd>{done.outlet}</dd></div>
                <div><dt>Contribution status</dt><dd>Paid</dd></div>
              </dl>
              <div className="mx-enter-actions">
                <button className="btn primary lg" onClick={reset}><ScanLine /> Confirm another code</button>
                <Link className="btn outline lg" to="/merchant">Back to dashboard</Link>
              </div>
            </div>
          )}
        </Card>

        <div className="stack">
          <Card title="How it works">
            <ol className="mx-steps">
              <li><span><Smartphone /></span><div><b>Worker opens the perk</b><small>The SCANS app shows a QR code and a 6-digit code for 5 minutes.</small></div></li>
              <li><span><MousePointerClick /></span><div><b>You check the code</b><small>You see the offer, the end of the SCANS ID and "up to date".</small></div></li>
              <li><span><HandCoins /></span><div><b>Give the discount, then confirm</b><small>Only now does it count as used.</small></div></li>
            </ol>
          </Card>
          <Card title="Codes for this demo" sub="Tap one to try it">
            <div className="mx-democodes">
              {[['482913', 'Valid code'], ['731406', 'Valid code, groceries'], ['115820', 'Expired code'], ['904417', 'Already used this month'], ['260071', 'Perk not available']].map(([c, l]) => (
                <button key={c} type="button" onClick={() => { reset(); fill(c) }}><b>{c}</b><span>{l}</span></button>
              ))}
            </div>
          </Card>
          <Card title="Confirmed today" sub="All your outlets, 17 December 2027">
            <div className="mx-today"><b>{num(TODAY_BEFORE + today.length)}</b><span>codes confirmed so far today, latest below</span></div>
            <div className="feed">
              {today.slice(0, 3).map((r) => (
                <div className="it" key={r.id}>
                  <span className="ic ok"><CheckCircle2 /></span>
                  <div className="grow"><b>{r.offer}</b><span><span className="mx-mask">{r.worker}</span> · {r.at.slice(-5)}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {scan && <ScanModal onClose={() => setScan(false)} onRead={(c) => { setScan(false); setCode(c); check(c) }} />}
    </MShell>
  )
}

function ScanModal({ onClose, onRead }) {
  const [found, setFound] = useState(false)
  const read = useRef(onRead)
  read.current = onRead
  useEffect(() => {
    const a = setTimeout(() => setFound(true), 1400)
    const b = setTimeout(() => read.current('482913'), 2100)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])
  return (
    <Modal title="Scan the QR code" onClose={onClose} actions={<button className="btn outline" onClick={onClose}>Type the code instead</button>}>
      <div className={'mx-camera' + (found ? ' found' : '')}>
        <div className="mx-cam-frame"><span /><span /><span /><span /></div>
        <div className="mx-cam-line" />
        <div className="mx-cam-label">{found ? <><CheckCircle2 size={16} /> Code read</> : <><Camera size={16} /> Point the camera at the worker's phone</>}</div>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>The camera only reads the code. No photo is kept.</p>
    </Modal>
  )
}
