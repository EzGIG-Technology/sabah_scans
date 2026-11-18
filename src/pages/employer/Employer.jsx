// Employer portal (/employer/*): Borneo Palm Plantations Sdn Bhd, signed in as Jennifer Liew (HR manager).
// Rules from SCANS_HANDOFF.md section 4: the worker is liable for the contribution; the company may pay only for
// workers who consented in the app; wage deduction is blocked without a JTK Sabah s.113(4) permit; employers see
// contribution status only; arrears never lead to permit action.
import { Routes, Route, Navigate } from 'react-router-dom'
import Overview from './Overview.jsx'
import { WorkersList, WorkerProfile } from './Workers.jsx'
import Pay from './Pay.jsx'
import AutoPay from './AutoPay.jsx'
import Statements from './Statements.jsx'
import Settings from './Settings.jsx'
import Reports from './Reports.jsx'
import Register from './Register.jsx'

export default function EmployerApp() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="register" element={<Register />} />
      <Route path="workers" element={<WorkersList />} />
      <Route path="workers/:id" element={<WorkerProfile />} />
      <Route path="pay" element={<Pay />} />
      <Route path="auto-debit" element={<AutoPay />} />
      <Route path="statements" element={<Statements />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/employer" replace />} />
    </Routes>
  )
}
