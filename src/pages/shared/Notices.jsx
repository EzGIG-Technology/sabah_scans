// Notice composer and viewer, shared by Microtek global announcements and State notices.
import { useState } from 'react'
import { Smartphone, MessageSquare, MessageCircle, Mail, BellRing, Languages, CalendarClock, Send } from 'lucide-react'
import { Drawer, Field, Callout, Seg, Tabs, Pill, Status } from '../../components/ui.jsx'
import { REGISTERED, districts, sectors, overdue1, overdue3, num, pct } from '../../data/demo.js'
import { LANGS, TEMPLATES, AUDIENCE_SIZE } from './data.js'
import './shared.css'

export const CHANNELS = [
  { key: 'App', icon: Smartphone },
  { key: 'SMS', icon: MessageSquare },
  { key: 'WhatsApp', icon: MessageCircle },
  { key: 'Email', icon: Mail },
  { key: 'Push', icon: BellRing },
]

export function ChannelIcons({ list }) {
  return (
    <span className="gv-ch">
      {CHANNELS.filter((c) => list.includes(c.key)).map(({ key, icon: I }) => <span key={key} title={key} aria-label={key}><I aria-hidden="true" /></span>)}
    </span>
  )
}

const AUD_TONE = { Workers: 'info', Employers: 'warn', Merchants: 'purple', All: 'grey' }
export function AudiencePill({ a }) {
  const base = a.split(' · ')[0]
  return <Pill tone={AUD_TONE[base] || 'info'}>{a}</Pill>
}

/* mode: 'admin' (Microtek) or 'state' */
export function NoticeComposer({ mode, onClose, onSubmit }) {
  const [tpl, setTpl] = useState('due')
  const t0 = TEMPLATES[0]
  const [title, setTitle] = useState(t0.en[0])
  const [message, setMessage] = useState(t0.en[1])
  const [aud, setAud] = useState('all')
  const [district, setDistrict] = useState(districts[0].name)
  const [sector, setSector] = useState(sectors[0].name)
  const [arrears, setArrears] = useState('1 month overdue')
  const [ch, setCh] = useState(['App', 'SMS', 'WhatsApp'])
  const [lang, setLang] = useState('ms')
  const [when, setWhen] = useState('now')
  const [at, setAt] = useState('2027-06-20T09:00')
  const [tried, setTried] = useState(false)

  const template = TEMPLATES.find((x) => x.key === tpl)
  const edited = !template || title !== template.en[0] || message !== template.en[1]
  const chooseTpl = (id) => {
    setTpl(id)
    const t = TEMPLATES.find((x) => x.key === id)
    if (t) { setTitle(t.en[0]); setMessage(t.en[1]) }
  }

  const audiences = mode === 'state'
    ? [['all', 'All workers'], ['district', 'Workers in a district'], ['sector', 'Workers in a sector'], ['arrears', 'Workers with arrears'], ['employers', 'Employers']]
    : [['all', 'All workers'], ['district', 'Workers in a district'], ['sector', 'Workers in a sector'], ['employers', 'Employers'], ['merchants', 'Merchants']]
  const reach = {
    all: REGISTERED,
    district: (districts.find((d) => d.name === district) || {}).workers,
    sector: (sectors.find((s) => s.name === sector) || {}).workers,
    arrears: arrears === '1 month overdue' ? overdue1 : overdue3,
    employers: AUDIENCE_SIZE.employers,
    merchants: AUDIENCE_SIZE.merchants,
  }[aud]
  const label = {
    all: 'Workers', district: 'Workers · ' + district, sector: 'Workers · ' + sector, arrears: 'Workers · ' + arrears,
    employers: 'Employers', merchants: 'Merchants',
  }[aud]
  const toWorkers = !['employers', 'merchants'].includes(aud)
  const needsState = mode === 'admin' && toWorkers
  const ok = title.trim() && message.trim() && ch.length > 0
  const toggle = (c) => setCh(ch.includes(c) ? ch.filter((x) => x !== c) : [...ch, c])
  const when2 = when === 'now' ? '17 Jun 2027' : new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const submit = () => {
    setTried(true)
    if (!ok) return
    onSubmit({
      title: title.trim(), message: message.trim(), sub: mode === 'state' ? 'Notice from the State' : 'Microtek announcement',
      audience: label, channels: ch, recipients: reach, date: when2, origin: mode === 'state' ? 'State' : 'Microtek',
      status: needsState ? 'Waiting for State approval' : when === 'now' ? 'Sent' : 'Scheduled',
      reached: !needsState && when === 'now' ? 0.02 : 0,
    })
  }

  const preview = edited
    ? null
    : template[lang]

  return (
    <Drawer title={mode === 'state' ? 'Write a notice' : 'New announcement'} sub={mode === 'state' ? 'From Kerajaan Negeri Sabah, in six languages' : 'Global announcement from SCANS'} onClose={onClose}
      footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={submit}><Send /> {needsState ? 'Send to State for approval' : when === 'now' ? 'Send now' : 'Schedule'}</button></>}>
      {needsState && <Callout>Notices to workers need State approval before they are sent. After you submit, this shows as “Waiting for State approval”. Microtek cannot approve it.</Callout>}
      {mode === 'state' && <Callout>You are approving this notice as you send it. It is written to the audit log with your name.</Callout>}
      <Field label="Start from">
        <select className="select" value={tpl} onChange={(e) => chooseTpl(e.target.value)}>
          {TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}
          <option value="own">Write my own</option>
        </select>
      </Field>
      <Field label="Title" error={tried && !title.trim() ? 'Enter a title.' : null}>
        <input className={'input' + (tried && !title.trim() ? ' err' : '')} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
      </Field>
      <Field label="Message" hint={`${message.length} of 320 characters. Plain words work best in every language.`} error={tried && !message.trim() ? 'Enter the message.' : null}>
        <textarea className={'input' + (tried && !message.trim() ? ' err' : '')} value={message} onChange={(e) => setMessage(e.target.value.slice(0, 320))} />
      </Field>
      <div className="field">
        <span>Audience</span>
        <div className="gv-opts" role="radiogroup" aria-label="Audience">
          {audiences.map(([k, l]) => <button key={k} type="button" className="option" role="radio" aria-checked={aud === k} onClick={() => setAud(k)}><span className="radio" />{l}</button>)}
        </div>
      </div>
      {aud === 'district' && <Field label="District"><select className="select" value={district} onChange={(e) => setDistrict(e.target.value)}>{districts.map((d) => <option key={d.id}>{d.name}</option>)}</select></Field>}
      {aud === 'sector' && <Field label="Sector"><select className="select" value={sector} onChange={(e) => setSector(e.target.value)}>{sectors.map((s) => <option key={s.name}>{s.name}</option>)}</select></Field>}
      {aud === 'arrears' && <Field label="Arrears" hint="A reminder only. Arrears never lead to permit action."><select className="select" value={arrears} onChange={(e) => setArrears(e.target.value)}><option>1 month overdue</option><option>3+ months overdue</option></select></Field>}
      <div className="gv-kv-card row between"><span className="ink2">Reaches</span><b className="num">{num(reach)} {toWorkers ? 'workers' : aud}</b></div>
      <div className="field">
        <span>Channels</span>
        <div className="chips">
          {CHANNELS.map(({ key, icon: I }) => <button key={key} type="button" className="chip" aria-pressed={ch.includes(key)} onClick={() => toggle(key)}><I size={15} aria-hidden="true" />{key}</button>)}
        </div>
        {tried && !ch.length && <small className="error">Choose at least one channel.</small>}
      </div>
      <div className="field">
        <span><Languages size={15} style={{ display: 'inline', verticalAlign: -3, marginRight: 4 }} />Translated into six languages</span>
        <Tabs items={LANGS.map((l) => ({ value: l.code, label: l.label }))} value={lang} onChange={setLang} label="Language preview" />
        <div className="gv-lang" style={{ marginTop: 8 }}>
          {preview ? (<><b>{preview[0]}</b><p>{preview[1]}</p><span><Pill tone="ok">Checked translation</Pill></span></>) : (
            <><b>{title || 'Title'}</b><p>{message || 'Message'}</p><span><Pill tone="warn">Machine translation is made when you submit</Pill></span></>
          )}
        </div>
        <small className="hint">Workers get the notice in the language they chose in the app. {mode === 'admin' ? 'The State checks every translation before approving.' : ''}</small>
      </div>
      <div className="field">
        <span><CalendarClock size={15} style={{ display: 'inline', verticalAlign: -3, marginRight: 4 }} />When</span>
        <Seg items={[{ value: 'now', label: needsState ? 'As soon as approved' : 'Now' }, { value: 'later', label: 'Schedule for later' }]} value={when} onChange={setWhen} label="When to send" />
        {when === 'later' && <input type="datetime-local" className="input" style={{ marginTop: 8 }} value={at} onChange={(e) => setAt(e.target.value)} min="2027-06-17T00:00" />}
      </div>
    </Drawer>
  )
}

export function NoticeView({ n, onClose, footer }) {
  const [lang, setLang] = useState('en')
  const tpl = TEMPLATES.find((t) => t.en[0] === n.title)
  return (
    <Drawer title={n.title} sub={`${n.id} · ${n.sub || ''}`} onClose={onClose} footer={footer || <button className="btn primary" onClick={onClose}>Close</button>}>
      <div className="row wrap" style={{ gap: 8 }}><Status tone={n.status === 'Returned' ? 'bad' : undefined}>{n.status}</Status><AudiencePill a={n.audience} /><ChannelIcons list={n.channels} /></div>
      <dl className="kv">
        <div><dt>Recipients</dt><dd className="num">{n.recipients ? num(n.recipients) : '—'}</dd></div>
        <div><dt>{n.status === 'Sent' ? 'Sent on' : 'Date'}</dt><dd>{n.date}</dd></div>
        <div><dt>From</dt><dd>{n.origin === 'State' ? 'Kerajaan Negeri Sabah' : 'Microtek for SCANS'}</dd></div>
        <div><dt>Reached</dt><dd>{n.status === 'Sent' ? `${pct(n.reached)} (${num(Math.round(n.recipients * n.reached))})` : 'Not sent yet'}</dd></div>
      </dl>
      {n.status === 'Sent' && (
        <div>
          <div className="gv-sub">Delivery</div>
          <div className="stack" style={{ gap: 10 }}>
            {n.channels.map((c, i) => {
              const share = Math.max(0.4, n.reached - i * 0.06)
              return <div key={c}><div className="row between small" style={{ marginBottom: 5 }}><span>{c}</span><span className="num muted">{pct(share)}</span></div><div className="bar"><span style={{ width: pct(share) }} /></div></div>
            })}
          </div>
        </div>
      )}
      {n.comment && <Callout tone="bad">Returned by the State: {n.comment}</Callout>}
      <div>
        <div className="gv-sub">Message</div>
        {tpl ? (
          <>
            <Tabs items={LANGS.map((l) => ({ value: l.code, label: l.label }))} value={lang} onChange={setLang} label="Language" />
            <div className="gv-lang" style={{ marginTop: 8 }}><b>{tpl[lang][0]}</b><p>{tpl[lang][1]}</p></div>
          </>
        ) : (
          <div className="gv-lang"><b>{n.title}</b><p>{n.message || `${n.sub}. Sent to ${n.audience.toLowerCase()} in the six worker languages.`}</p></div>
        )}
      </div>
    </Drawer>
  )
}
