import { Routes, Route, Link } from 'react-router-dom'
import { ToastProvider } from './components/ui.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import WorkerApp from './pages/worker/Worker.jsx'
import EmployerApp from './pages/employer/Employer.jsx'
import StateApp from './pages/state/State.jsx'
import JimApp from './pages/jim/Jim.jsx'
import AdminApp from './pages/admin/Admin.jsx'
import MerchantApp from './pages/merchant/Merchant.jsx'
import Ambient from './components/motion.jsx'
// Glass and motion layer loads last so it sits over every portal's own styles.
import './styles/glass.css'
import './styles/brand.css'

function NotFound() {
  return (
    <main style={{ padding: '15vh 24px', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-.03em' }}>This page does not exist</h1>
      <p style={{ color: 'var(--ink2)', margin: '12px 0 24px', fontSize: 18 }}>The link may be old. Start again from the home page or sign in to your portal.</p>
      <div style={{ display: 'flex', gap: 8 }}><Link to="/" className="btn primary">Home page</Link><Link to="/login" className="btn">Sign in</Link></div>
    </main>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Ambient />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker/*" element={<WorkerApp />} />
        <Route path="/employer/*" element={<EmployerApp />} />
        <Route path="/state/*" element={<StateApp />} />
        <Route path="/jim/*" element={<JimApp />} />
        <Route path="/merchant/*" element={<MerchantApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  )
}
