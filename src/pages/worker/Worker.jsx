import { Routes, Route, Navigate } from 'react-router-dom'
import { WorkerProvider, Stage } from './shell.jsx'
import Onboarding from './Onboarding.jsx'
import WorkerHome from './Home.jsx'
import Pay, { Receipt, History } from './Pay.jsx'
import { Perks, Notices, Notice, Help, Me, Privacy } from './Screens.jsx'
import { Welcome, SignIn } from './Welcome.jsx'
import { CardPass, Details, Faq, Assistant } from './More.jsx'
import './worker.css'
import './worker-more.css'

/* Worker app (/worker/*). Mobile first: full screen on phones, a phone frame
   with a side panel of quick links on wide screens. See SCANS_HANDOFF.md §3–4. */
export default function WorkerApp() {
  return (
    <WorkerProvider>
      <Stage>
        <Routes>
          <Route path="welcome" element={<Welcome />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="start" element={<Onboarding />} />
          <Route index element={<WorkerHome />} />
          <Route path="pay" element={<Pay />} />
          <Route path="receipt/:id" element={<Receipt />} />
          <Route path="history" element={<History />} />
          <Route path="perks" element={<Perks />} />
          <Route path="notices" element={<Notices />} />
          <Route path="notices/:id" element={<Notice />} />
          <Route path="help" element={<Help />} />
          <Route path="me" element={<Me />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="card" element={<CardPass />} />
          <Route path="details" element={<Details />} />
          <Route path="faq" element={<Faq />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="*" element={<Navigate to="/worker" replace />} />
        </Routes>
      </Stage>
    </WorkerProvider>
  )
}
