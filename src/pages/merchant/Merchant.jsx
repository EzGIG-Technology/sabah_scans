import { Routes, Route, Navigate } from 'react-router-dom'
import { MerchantProvider } from './store.jsx'
import Overview from './Overview.jsx'
import { OffersList, OfferNew, OfferDetail, OfferEdit } from './Offers.jsx'
import Redeem from './Redeem.jsx'
import Outlets from './Outlets.jsx'
import Reports from './Reports.jsx'
import Settings from './Settings.jsx'
import Register from './Register.jsx'
import Notifications from './Notifications.jsx'
import './merchant.css'

export default function MerchantApp() {
  return (
    <MerchantProvider>
      <Routes>
        <Route path="register" element={<Register />} />
        <Route index element={<Overview />} />
        <Route path="offers" element={<OffersList />} />
        <Route path="offers/new" element={<OfferNew />} />
        <Route path="offers/:id" element={<OfferDetail />} />
        <Route path="offers/:id/edit" element={<OfferEdit />} />
        <Route path="redeem" element={<Redeem />} />
        <Route path="outlets" element={<Outlets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/merchant" replace />} />
      </Routes>
    </MerchantProvider>
  )
}
