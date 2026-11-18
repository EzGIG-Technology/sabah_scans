// Support queue: help requests from workers, employers and merchants that reach Microtek.
// Summaries and suggested replies help the agent; a person decides and replies.
// Complaints about employers are routed to the agency that handles them (JTK Sabah and others).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessagesSquare, CircleCheck, Users, Clock, Send, Route as RouteIcon, ArrowUpRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { PageHead, Card, Kpi, Status, Pill, Callout, Empty, Tabs, Field, Table, Drawer, HBarChart, Donut, useToast } from '../../components/ui.jsx'
import { num, pct } from '../../data/demo.js'
import { logEvent } from '../shared/store.js'
import { BASE, fmtAge, fmtTarget, helpTopics, helpLangs, helpTotal, SUPPORT_AGENCIES } from './data.js'
import { useAdmin, updateTicket } from './store.js'

const PRIORITY_TONE = { High: 'bad', Medium: 'warn', Low: 'grey' }

export default function Support() {
  const toast = useToast()
  const go = useNavigate()
  const tickets = useAdmin((s) => s.tickets)
  const [tab, setTab] = useState('open')
  const [openId, setOpenId] = useState(null)
  const [reply, setReply] = useState('')
  const [agency, setAgency] = useState(SUPPORT_AGENCIES[0])
  const [tried, setTried] = useState(false)
  const open = tickets.filter((t) => t.status !== 'Resolved')
  const late = open.filter((t) => t.age > t.target)
  const rows = tickets.filter((t) => (tab === 'open' ? t.status !== 'Resolved' : tab === 'late' ? t.status !== 'Resolved' && t.age > t.target : t.status === 'Resolved'))
  const t = tickets.find((x) => x.id === openId)
  const done = t && t.status === 'Resolved'

  const openTicket = (x) => { setOpenId(x.id); setReply(''); setTried(false); logEvent('Viewed support request', x.id) }
  const close = () => setOpenId(null)
  const send = () => {
    setTried(true)
    if (reply.trim().length < 5) return
    updateTicket(t.id, { status: 'Resolved', reply: reply.trim() })
    logEvent('Replied to support request', `${t.id} · ${t.subject}`)
    toast(`Reply sent${t.lang !== 'English' ? ` in ${t.lang}` : ''}. Request resolved.`)
    close()
  }
  const route = () => {
    updateTicket(t.id, { status: 'With agency', agency })
    logEvent('Routed support request to agency', `${t.id} · ${agency}`)
    toast(`${t.id} sent to ${agency}.${t.hidden ? ' The worker’s name stays hidden from the employer.' : ''}`)
    close()
  }
  const escalate = () => {
    updateTicket(t.id, { status: 'Escalated' })
    logEvent('Escalated support request', `${t.id} · payments team`)
    toast(`${t.id} escalated to the payments team`)
    close()
  }

  return (
    <>
      <PageHead title="Support queue" sub="Help requests from workers, employers and merchants. Workers write in their own language; replies are translated back." />
      <div className="grid g-4 keep2">
        <Kpi hero icon={MessagesSquare} label="Help conversations today" value={num(helpTotal)} note="App, WhatsApp and phone, to 15:00" />
        <Kpi icon={CircleCheck} tone="ok" label="Answered without an agent" value={pct((helpTotal - 64) / helpTotal)} note="From help articles in six languages" />
        <Kpi icon={Users} label="Open requests" value={num(open.length)} note="Waiting for an agent or an agency" />
        <Kpi icon={Clock} tone={late.length ? 'bad' : 'ok'} label="Past response target" value={num(late.length)} note={`of ${open.length} open`} />
      </div>
      <div className="ad-two">
        <Card title="What people ask about" sub="Today, by topic"><HBarChart data={helpTopics} /></Card>
        <Card title="Language" sub="Today, from the language each person uses"><Donut data={helpLangs} center={num(helpTotal)} centerSub="today" size={160} format={(v) => num(v)} /></Card>
      </div>
      <Card title="Agent queue" sub="Open a request to read it, reply, or route it to the agency that handles it">
        <Tabs items={[{ value: 'open', label: 'Open', count: open.length }, { value: 'late', label: 'Past target', count: late.length }, { value: 'done', label: 'Resolved', count: tickets.length - open.length }]} value={tab} onChange={setTab} label="Requests" />
        <div style={{ paddingTop: 12 }}>
          <Table rows={rows} onRowClick={openTicket} empty={<Empty title="Nothing here" icon={CircleCheck}>No requests in this list.</Empty>} columns={[
            { key: 'id', label: 'Request', render: (x) => <b className="mono-id gv-nowrap">{x.id}</b> },
            { key: 'subject', label: 'Subject', render: (x) => <span><b>{x.subject}</b><small className="muted" style={{ display: 'block', fontSize: 12 }}>{x.from} · {x.who}</small></span> },
            { key: 'channel', label: 'Channel' },
            { key: 'lang', label: 'Language' },
            { key: 'priority', label: 'Priority', render: (x) => <Pill tone={PRIORITY_TONE[x.priority]}>{x.priority}</Pill> },
            { key: 'age', label: 'Waiting / target', align: 'r', render: (x) => <span className="gv-nowrap"><span className={x.status !== 'Resolved' && x.age > x.target ? 'ad-late' : ''}>{fmtAge(x.age)}</span> <small className="muted">of {fmtTarget(x.target)}</small></span> },
            { key: 'status', label: 'Status', render: (x) => <Status tone={x.status === 'Escalated' ? 'purple' : x.status === 'With agency' ? 'info' : undefined}>{x.status}</Status> },
          ]} />
        </div>
      </Card>

      {t && (
        <Drawer title={t.subject} sub={`${t.id} · ${t.from} · ${t.channel} · ${t.lang}`} onClose={close}
          footer={done || t.status === 'With agency' ? <button className="btn primary" onClick={close}>Close</button> : (
            <>
              {t.from === 'Worker' && <button className="btn outline" onClick={escalate}><ArrowUpRight /> Escalate</button>}
              <button className="btn primary" onClick={send}><Send /> Send and resolve</button>
            </>
          )}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Status tone={t.status === 'Escalated' ? 'purple' : t.status === 'With agency' ? 'info' : undefined}>{t.status}</Status>
            <Pill tone={PRIORITY_TONE[t.priority]}>{t.priority} priority</Pill>
            {t.from === 'Worker' && (t.hidden ? <Pill tone="purple"><EyeOff size={12} /> Name hidden from employer</Pill> : null)}
          </div>
          <dl className="kv">
            <div><dt>From</dt><dd>{t.who}</dd></div>
            {t.scansId && <div><dt>SCANS ID</dt><dd className="num">{t.scansId}</dd></div>}
            <div><dt>Waiting</dt><dd>{fmtAge(t.age)} <span className="muted" style={{ fontWeight: 500 }}>of {fmtTarget(t.target)} target</span></dd></div>
            {t.agency && <div><dt>Sent to</dt><dd>{t.agency}</dd></div>}
          </dl>
          <div className="ad-chat">
            <div className="b in"><small>{t.who.split(' ')[0]} · {t.lang}</small>{t.original}</div>
            {t.lang !== 'English' && <div className="b tr"><small>Translation</small>{t.english}</div>}
            {t.reply && <div className="b out"><small>SCANS support</small>{t.reply}</div>}
          </div>
          <Callout icon={Sparkles}><b>Summary.</b> {t.summary}<br /><b>Suggested next step.</b> {t.suggest}<br /><span className="small muted">Written by the assistant to help you. You decide what to send. It cannot change a worker’s status, permit or payment.</span></Callout>
          {t.scansId && <button className="btn sm outline" onClick={() => go(`${BASE}/workers/${t.scansId}`)}><Eye /> Open worker record (logged)</button>}
          {!done && t.status !== 'With agency' && (
            <>
              <Field label="Reply" hint={t.lang !== 'English' ? `Write in English. The worker gets it in ${t.lang}.` : 'Sent by email or in the portal.'} error={tried && reply.trim().length < 5 ? 'Write a reply first.' : null}>
                <textarea className="input" rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t.suggest} />
              </Field>
              {t.from === 'Worker' && (
                <div className="stack" style={{ gap: 8 }}>
                  <div className="gv-sub" style={{ margin: 0 }}>Or route to an agency</div>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <label className="grow"><span className="vh">Agency</span><select className="select" value={agency} onChange={(e) => setAgency(e.target.value)} aria-label="Agency">{SUPPORT_AGENCIES.map((a) => <option key={a}>{a}</option>)}</select></label>
                    <button className="btn outline" onClick={route}><RouteIcon /> Send to agency</button>
                  </div>
                  <small className="muted">For wages, housing, passports and safety. {t.hidden ? 'The worker asked that their employer is not told their name; the agency sees it, the employer does not.' : ''}</small>
                </div>
              )}
            </>
          )}
        </Drawer>
      )}
    </>
  )
}
