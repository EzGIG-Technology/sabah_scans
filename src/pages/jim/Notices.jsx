// Notices (/jim/notices). JIM drafts a notice to workers or employers (office closures, counter hours).
// Every JIM notice goes to the State for approval through the shared notices store, so it shows on
// /state/notices as waiting for State approval. JIM cannot send a notice itself.
import { useState } from 'react'
import { Plus, Send, Inbox, CheckCircle2, Undo2, Eye, Megaphone, Languages, CalendarClock } from 'lucide-react'
import { PageHead, Card, Kpi, Callout, Tabs, Empty, Drawer, Field, Status, useToast } from '../../components/ui.jsx'
import { REGISTERED, districts, num } from '../../data/demo.js'
import { useStore, addNotice, logEvent } from '../shared/store.js'
import { NoticeView, ChannelIcons, AudiencePill, CHANNELS } from '../shared/Notices.jsx'
import { AUDIENCE_SIZE } from '../shared/data.js'

const TEMPLATES = [
  { key: 'closure', name: 'Office closed for a day', title: 'JIM Sandakan office closed on 24 June', message: 'The Jabatan Imigresen office in Sandakan is closed on Thursday 24 June 2027 for building work. Appointments for that day move to Friday 25 June at the same time.' },
  { key: 'hours', name: 'New counter hours', title: 'New counter hours at JIM Tawau', message: 'From 1 July 2027 the counter at JIM Tawau is open 8:00 to 16:00, Monday to Friday. Bring your passport and appointment slip.' },
  { key: 'moved', name: 'Counter has moved', title: 'JIM Lahad Datu counter has moved', message: 'The JIM counter in Lahad Datu has moved to the ground floor of Wisma Persekutuan. Opening hours stay the same.' },
]

export default function Notices() {
  const toast = useToast()
  const all = useStore((s) => s.notices)
  const mine = all.filter((n) => n.origin === 'JIM')
  const [tab, setTab] = useState('waiting')
  const [compose, setCompose] = useState(false)
  const [view, setView] = useState(null)
  const groups = {
    waiting: mine.filter((n) => n.status === 'Waiting for State approval'),
    sent: mine.filter((n) => n.status === 'Sent' || n.status === 'Scheduled'),
    returned: mine.filter((n) => n.status === 'Returned'),
  }
  const list = groups[tab]
  const v = all.find((n) => n.id === view)
  const submit = (n) => {
    const id = addNotice(n)
    logEvent('Sent notice to State for approval', `${id} · ${n.title}`)
    toast('Sent to the State. It shows as waiting for State approval and goes out only after the State approves it.')
    setCompose(false); setTab('waiting')
  }
  return (
    <>
      <PageHead title="Notices" sub="Tell workers or employers about JIM office closures, counter hours and moves. The State approves every notice before it is sent.">
        <button className="btn primary" onClick={() => setCompose(true)}><Plus /> Write a notice</button>
      </PageHead>
      <Callout icon={Megaphone}>JIM drafts the notice; Kerajaan Negeri Sabah approves it and SCANS sends it in the six worker languages. Notices are about office matters only and never about a worker’s contributions.</Callout>
      <div className="grid g-3 jim-keep3">
        <Kpi icon={Inbox} tone="warn" label="Waiting for the State" value={num(groups.waiting.length)} />
        <Kpi icon={CheckCircle2} tone="ok" label="Sent or scheduled" value={num(groups.sent.length)} />
        <Kpi icon={Undo2} tone="bad" label="Returned" value={num(groups.returned.length)} note="With the State’s comment" />
      </div>
      <Card>
        <Tabs items={[
          { value: 'waiting', label: 'Waiting for State approval', count: groups.waiting.length },
          { value: 'sent', label: 'Sent and scheduled', count: groups.sent.length },
          { value: 'returned', label: 'Returned', count: groups.returned.length },
        ]} value={tab} onChange={setTab} label="Notices" />
        <div style={{ paddingTop: 4 }}>
          {list.length === 0 && <Empty title={tab === 'waiting' ? 'Nothing waiting' : 'Nothing here'} icon={CheckCircle2}>{tab === 'waiting' ? 'Notices you write wait here until the State approves them.' : 'Notices appear here after the State sends or returns them.'}</Empty>}
          {list.map((n) => (
            <div className="gv-ap" key={n.id}>
              <span className="ic"><Megaphone aria-hidden="true" /></span>
              <div className="txt">
                <small>{n.id} · from JIM Sabah · {n.date}</small>
                <b>{n.title}</b>
                <div className="row wrap" style={{ gap: 8, marginTop: 4 }}><AudiencePill a={n.audience} /><ChannelIcons list={n.channels} /><span className="small muted num">{num(n.recipients)} recipients</span></div>
                {n.comment && <small style={{ color: 'var(--bad)', marginTop: 4 }}>State’s comment: {n.comment}</small>}
              </div>
              <div className="acts">
                <button className="btn sm ghost" onClick={() => setView(n.id)}><Eye /> View</button>
                <Status tone={n.status === 'Returned' ? 'bad' : undefined}>{n.status}</Status>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {compose && <Composer onClose={() => setCompose(false)} onSubmit={submit} />}
      {v && <NoticeView n={v} onClose={() => setView(null)} />}
    </>
  )
}

function Composer({ onClose, onSubmit }) {
  const [tpl, setTpl] = useState('closure')
  const [title, setTitle] = useState(TEMPLATES[0].title)
  const [message, setMessage] = useState(TEMPLATES[0].message)
  const [aud, setAud] = useState('district')
  const [district, setDistrict] = useState('Sandakan')
  const [ch, setCh] = useState(['App', 'SMS'])
  const [date, setDate] = useState('2027-06-21')
  const [tried, setTried] = useState(false)
  const choose = (k) => { setTpl(k); const t = TEMPLATES.find((x) => x.key === k); if (t) { setTitle(t.title); setMessage(t.message) } }
  const reach = { all: REGISTERED, district: (districts.find((d) => d.name === district) || {}).workers, employers: AUDIENCE_SIZE.employers }[aud]
  const label = { all: 'Workers', district: 'Workers · ' + district, employers: 'Employers' }[aud]
  const ok = title.trim() && message.trim() && ch.length
  const toggle = (c) => setCh(ch.includes(c) ? ch.filter((x) => x !== c) : [...ch, c])
  const submit = () => {
    setTried(true)
    if (!ok) return
    onSubmit({
      title: title.trim(), message: message.trim(), sub: 'Notice from JIM Sabah', audience: label, channels: ch, recipients: reach,
      date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), origin: 'JIM', status: 'Waiting for State approval', reached: 0,
    })
  }
  return (
    <Drawer title="Write a notice" sub="From JIM Sabah, sent by the State after approval" onClose={onClose}
      footer={<><button className="btn outline" onClick={onClose}>Cancel</button><button className="btn primary" onClick={submit}><Send /> Send to State for approval</button></>}>
      <Callout>After you submit, the notice shows as “Waiting for State approval”. It is sent only if the State approves it, and the State may return it with a comment.</Callout>
      <Field label="Start from">
        <select className="select" value={tpl} onChange={(e) => choose(e.target.value)}>
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
          {[['district', 'Workers in a district'], ['all', 'All workers'], ['employers', 'Employers']].map(([k, l]) => (
            <button key={k} type="button" className="option" role="radio" aria-checked={aud === k} onClick={() => setAud(k)}><span className="radio" />{l}</button>
          ))}
        </div>
      </div>
      {aud === 'district' && <Field label="District"><select className="select" value={district} onChange={(e) => setDistrict(e.target.value)}>{districts.map((d) => <option key={d.id}>{d.name}</option>)}</select></Field>}
      <div className="gv-kv-card row between"><span className="ink2">Reaches</span><b className="num">{num(reach)} {aud === 'employers' ? 'employers' : 'workers'}</b></div>
      <div className="field">
        <span>Channels</span>
        <div className="chips">
          {CHANNELS.map(({ key, icon: I }) => <button key={key} type="button" className="chip" aria-pressed={ch.includes(key)} onClick={() => toggle(key)}><I size={15} aria-hidden="true" />{key}</button>)}
        </div>
        {tried && !ch.length && <small className="error">Choose at least one channel.</small>}
      </div>
      <Field label={<><CalendarClock size={15} style={{ display: 'inline', verticalAlign: -3, marginRight: 4 }} />Send on</>} hint="If the State approves it later than this, it goes out as soon as it is approved.">
        <input type="date" className="input" value={date} min="2027-06-17" onChange={(e) => setDate(e.target.value || '2027-06-21')} />
      </Field>
      <p className="small muted"><Languages size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />Translated into Bahasa Melayu, English, Bahasa Indonesia, Filipino, Bengali and Nepali. The State checks the translations before approving.</p>
    </Drawer>
  )
}
