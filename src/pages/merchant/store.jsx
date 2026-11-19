import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { recentRedemptions } from '../../data/demo.js'
import { initialOffers, initialOutlets, initialUsers, initialNotes, documents } from './data.js'

// Earlier confirmations the same evening, so the feeds have a full page.
const earlier = [
  { id: 'RDM-881169', worker: 'SCN26W•••6630', offer: 'RM5 off groceries above RM40', outlet: '7-Eleven Jalan Segama', at: '17 Dec 2027 18:22', status: 'Confirmed' },
  { id: 'RDM-881161', worker: 'SCN26W•••1947', offer: 'RM3 off a RM30 prepaid reload', outlet: '7-Eleven Sabindo', at: '17 Dec 2027 18:05', status: 'Confirmed' },
  { id: 'RDM-881158', worker: 'SCN26W•••4402', offer: '20% off mobile top-up above RM50', outlet: '7-Eleven Wisma Merdeka', at: '17 Dec 2027 17:51', status: 'Confirmed' },
]

// Session state for the merchant portal so changes made on one screen show on the others.
const Ctx = createContext(null)

export function MerchantProvider({ children }) {
  const [offers, setOffers] = useState(initialOffers)
  const [outlets, setOutlets] = useState(initialOutlets)
  const [users, setUsers] = useState(initialUsers)
  const [redemptions, setRedemptions] = useState([...recentRedemptions, ...earlier])
  const [seq, setSeq] = useState(1)
  const [notes, setNotes] = useState(initialNotes)
  const [docs, setDocs] = useState(documents)
  const markRead = useCallback((id) => setNotes((xs) => xs.map((n) => (id == null || n.id === id ? { ...n, read: true } : n))), [])
  const updateDoc = useCallback((k, patch) => setDocs((xs) => xs.map((d) => (d.k === k ? { ...d, ...patch } : d))), [])

  const updateOffer = useCallback((id, patch) => setOffers((xs) => xs.map((o) => (o.id === id ? { ...o, ...patch } : o))), [])
  const addOffer = useCallback((o) => {
    const id = 'n' + Date.now().toString(36)
    setOffers((xs) => [{ ...o, id }, ...xs])
    return id
  }, [])
  const updateOutlet = useCallback((id, patch) => setOutlets((xs) => xs.map((o) => (o.id === id ? { ...o, ...(typeof patch === 'function' ? patch(o) : patch) } : o))), [])
  const addOutlet = useCallback((o) => setOutlets((xs) => [...xs, { ...o, id: 'OUT-' + String(xs.length + 1).padStart(2, '0') }]), [])

  // A redemption counts only once the shop confirms it here.
  const confirmRedemption = useCallback(({ offer, worker, outlet }) => {
    const id = 'RDM-' + (881204 + seq)
    const at = '17 Dec 2027 19:' + String(45 + seq).padStart(2, '0')
    setSeq((n) => n + 1)
    setRedemptions((xs) => [{ id, worker, offer: offer.title, outlet, at, status: 'Confirmed', fresh: true }, ...xs])
    setOffers((xs) => xs.map((o) => (o.id === offer.id ? { ...o, redemptions: o.redemptions + 1, june: (o.june || 0) + 1 } : o)))
    setOutlets((xs) => xs.map((o) => (o.name === outlet ? { ...o, june: o.june + 1, allTime: o.allTime + 1 } : o)))
    return { id, at }
  }, [seq])

  const value = useMemo(() => ({ offers, updateOffer, addOffer, outlets, updateOutlet, addOutlet, setOutlets, users, setUsers, redemptions, confirmRedemption, notes, markRead, docs, updateDoc }),
    [offers, updateOffer, addOffer, outlets, updateOutlet, addOutlet, users, redemptions, confirmRedemption, notes, markRead, docs, updateDoc])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useMerchant = () => useContext(Ctx)
