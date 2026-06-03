import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { orderAPI } from '../../api/cartAPI'
import { KARNATAKA_ZONES } from '../../context/LocationContext'

// ─── Icons ────────────────────────────────────────────────────────────────────
const storeIcon = L.divIcon({
  html: `<div style="background:#16a34a;color:white;border-radius:12px;width:46px;height:46px;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 16px rgba(22,163,74,0.6);border:3px solid white">🏪</div>`,
  className: '', iconSize: [46, 46], iconAnchor: [23, 23],
})
const homeIcon = L.divIcon({
  html: `<div style="background:#f59e0b;color:white;border-radius:12px;width:46px;height:46px;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 16px rgba(245,158,11,0.6);border:3px solid white">🏠</div>`,
  className: '', iconSize: [46, 46], iconAnchor: [23, 46],
})
const scooterIcon = L.divIcon({
  html: `<div style="background:white;border-radius:50%;width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 6px 24px rgba(22,163,74,0.5);border:3px solid #16a34a">🛵</div>`,
  className: '', iconSize: [52, 52], iconAnchor: [26, 26],
})

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions?.length >= 2) {
      map.fitBounds(L.latLngBounds(positions), { padding: [80, 80], maxZoom: 15 })
    }
  }, [map, JSON.stringify(positions)])
  return null
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

const STATUS_STEPS = [
  { key: 'pending',          label: 'Order Placed',     icon: '📋', color: '#6b7280' },
  { key: 'confirmed',        label: 'Confirmed',        icon: '✅', color: '#3b82f6' },
  { key: 'packed',           label: 'Packed',           icon: '📦', color: '#8b5cf6' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', color: '#16a34a' },
  { key: 'delivered',        label: 'Delivered',        icon: '🏠', color: '#10b981' },
]
const STATUS_ORDER = STATUS_STEPS.map((s) => s.key)

// ─── Find nearest store to coordinates ───────────────────────────────────────
function findNearestStore(lat, lng) {
  let nearest = null
  let minDist = Infinity
  KARNATAKA_ZONES.filter(z => z.available).forEach(zone => {
    zone.stores.forEach(store => {
      const d = Math.sqrt(Math.pow(store.lat - lat, 2) + Math.pow(store.lng - lng, 2))
      if (d < minDist) { minDist = d; nearest = { ...store, zone } }
    })
  })
  return nearest
}

// Default to Karnataka center until GPS resolves
const KARNATAKA_CENTER = [14.5204, 75.7224]

export default function OrderTracking() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(true)
  const [storePos, setStorePos] = useState(null)         // nearest store coords
  const [storeName, setStoreName] = useState('AgroMart') // nearest store name
  const [bikePos, setBikePos] = useState(KARNATAKA_CENTER)
  const [destination, setDestination] = useState(null)
  const [etaSecs, setEtaSecs] = useState(180)
  const [demoStatus, setDemoStatus] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const animRef = useRef(null)
  const startRef = useRef(null)
  const DURATION = 180000

  useEffect(() => {
    loadOrder()
    const poll = setInterval(loadOrder, 10000) // poll every 10s to catch auto-status updates
    return () => { clearInterval(poll); cancelAnimationFrame(animRef.current) }
  }, [id])

  // Get user's GPS → set destination + find nearest store
  useEffect(() => {
    // First try saved location from localStorage
    const saved = localStorage.getItem('agromart_delivery_location')
    if (saved) {
      try {
        const loc = JSON.parse(saved)
        if (loc.store) {
          setStorePos([loc.store.lat, loc.store.lng])
          setStoreName(loc.store.name)
          setBikePos([loc.store.lat, loc.store.lng])
        }
        if (loc.gps) setDestination(loc.gps)
      } catch (_) {}
    }

    // Always try live GPS to get the most accurate positions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setDestination([latitude, longitude])
          const nearest = findNearestStore(latitude, longitude)
          if (nearest) {
            setStorePos([nearest.lat, nearest.lng])
            setStoreName(nearest.name)
            setBikePos([nearest.lat, nearest.lng])
          }
        },
        () => {
          // GPS failed — if nothing saved, use Karnataka center
          if (!destination) setDestination(KARNATAKA_CENTER)
          if (!storePos) {
            setStorePos([KARNATAKA_ZONES[0].stores[0].lat, KARNATAKA_ZONES[0].stores[0].lng])
          }
        },
        { timeout: 8000, maximumAge: 60000 }
      )
    }
  }, []) // eslint-disable-line

  // Start demo: simulate full delivery progression
  const startDemo = () => {
    if (storePos) setBikePos(storePos)
    startRef.current = null
    setDemoStatus('out_for_delivery')
    setEtaSecs(180)
  }

  // Animate scooter whenever order is out for delivery (real or demo)
  const activeStatus = demoStatus || order?.status
  useEffect(() => {
    cancelAnimationFrame(animRef.current)
    if (activeStatus !== 'out_for_delivery') return

    startRef.current = null
    const from = storePos || KARNATAKA_CENTER
    const to = destination || KARNATAKA_CENTER
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(elapsed / DURATION, 1)
      setBikePos(lerp(from, to, t))
      setEtaSecs(Math.ceil((1 - t) * 180))
      if (t < 1) animRef.current = requestAnimationFrame(animate)
      else { setEtaSecs(0); setDemoStatus('delivered') }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [activeStatus, destination])

  // ── Countdown timer to next status ──────────────────────────────
  // Auto-progress delays (must match backend orderController.js)
  const NEXT_STATUS = {
    pending:          { label: 'Confirming order',   delaySecs: 10 },
    confirmed:        { label: 'Packing your order', delaySecs: 25 },
    packed:           { label: 'Out for delivery',   delaySecs: 40 },
    out_for_delivery: { label: 'Delivered',          delaySecs: 60 },
  }

  useEffect(() => {
    if (!order) return
    const currentStatus = demoStatus || order.status
    const next = NEXT_STATUS[currentStatus]
    if (!next || currentStatus === 'delivered' || currentStatus === 'cancelled') {
      setCountdown(null)
      return
    }
    const createdAt = new Date(order.createdAt).getTime()
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((createdAt + next.delaySecs * 1000 - Date.now()) / 1000))
      setCountdown({ secs: remaining, label: next.label })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [order, demoStatus])
  // ─────────────────────────────────────────────────────────────────

  const loadOrder = async () => {
    try {
      const { data } = await orderAPI.getOrder(id)
      setOrder(data.order)
    } catch { }
    finally { setLoading(false) }
  }

  const formatEta = () => {
    if (etaSecs <= 0) return '🎉 Arriving now!'
    const m = Math.ceil(etaSecs / 60)
    return `${m} min${m > 1 ? 's' : ''} away`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Finding your order...</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <p className="text-6xl mb-4">📦</p>
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link to="/orders" className="btn btn-primary btn-md">← My Orders</Link>
      </div>
    </div>
  )

  const currentIdx = STATUS_ORDER.indexOf(demoStatus || order.status)
  const isOutForDelivery = activeStatus === 'out_for_delivery'
  const isDelivered = activeStatus === 'delivered'

  const statusBg = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    packed: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-green-100 text-green-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <>
      <Helmet><title>Track Order #{order.orderNumber} — AgroMart</title></Helmet>

      {/* ── Full-screen map ── */}
      <div className="fixed inset-0 z-0">
        <MapContainer
          center={storePos || KARNATAKA_CENTER}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {storePos && destination && <FitBounds positions={[storePos, destination]} />}

          {/* Store — nearest to user */}
          {storePos && (
            <Marker position={storePos} icon={storeIcon}>
              <Popup><strong>🏪 {storeName}</strong><br />Delivering from here to you</Popup>
            </Marker>
          )}

          {/* Customer Home */}
          {destination && (
            <Marker position={destination} icon={homeIcon}>
              <Popup><strong>🏠 Your Location</strong><br />{order.shippingAddress?.addressLine1 || 'Your delivery address'}</Popup>
            </Marker>
          )}

          {/* Route lines */}
          {storePos && destination && (
            <Polyline positions={[storePos, destination]} pathOptions={{ color: '#d1d5db', weight: 5, dashArray: '10 6' }} />
          )}

          {isOutForDelivery && storePos && (
            <>
              <Polyline positions={[storePos, bikePos]} pathOptions={{ color: '#16a34a', weight: 6 }} />
              <Marker position={bikePos} icon={scooterIcon}>
                <Popup><strong>🛵 Delivery Partner</strong><br />On the way to you!</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>

      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center gap-3 pointer-events-none">
        <Link to="/orders" className="pointer-events-auto w-10 h-10 bg-white dark:bg-dark-card rounded-full shadow-lg flex items-center justify-center text-gray-700 text-lg font-bold hover:bg-gray-50">
          ←
        </Link>
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg px-4 py-2 pointer-events-auto">
          <p className="text-xs text-gray-400">Tracking</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">#{order.orderNumber}</p>
        </div>

        {/* Demo simulate button — shown when NOT already out for delivery */}
        {!isOutForDelivery && !isDelivered && (
          <button
            onClick={startDemo}
            className="pointer-events-auto ml-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            🎬 Simulate
          </button>
        )}

        <span className={`ml-auto pointer-events-auto text-xs font-bold px-3 py-1.5 rounded-full ${statusBg[demoStatus || order.status] || 'bg-gray-100 text-gray-700'}`}>
          {STATUS_STEPS.find((s) => s.key === (demoStatus || order.status))?.icon} {(demoStatus || order.status)?.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      {/* ── ETA pill (only when out for delivery) ── */}
      {isOutForDelivery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white rounded-2xl shadow-2xl px-6 py-3 text-center pointer-events-none"
        >
          <p className="text-xs text-green-200 font-medium">🛵 Estimated Arrival</p>
          <p className="text-2xl font-black">{formatEta()}</p>
        </motion.div>
      )}

      {/* ── Blinkit Bottom Sheet ── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50"
        animate={{ y: sheetOpen ? 0 : 'calc(100% - 80px)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      >
        {/* Handle bar */}
        <div className="bg-white dark:bg-dark-card rounded-t-3xl shadow-2xl" onClick={() => setSheetOpen(!sheetOpen)}>
          <div className="flex justify-center pt-3 pb-2 cursor-pointer">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Status bar */}
          <div className="px-5 pb-4">
            {/* Progress dots */}
            <div className="flex items-center mb-3">
              {STATUS_STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all duration-500 ${i <= currentIdx ? 'shadow-lg' : 'bg-gray-100 dark:bg-dark-border'}`}
                    style={i <= currentIdx ? { background: step.color } : {}}>
                    {step.icon}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className="flex-1 h-1.5 mx-1 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-border">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                        style={{ width: i < currentIdx ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {STATUS_STEPS.map((step, i) => (
                <p key={step.key} className={`text-[10px] text-center font-medium ${i <= currentIdx ? 'text-green-700 dark:text-green-400' : 'text-gray-400'}`} style={{ flex: 1 }}>
                  {step.label.split(' ')[0]}
                </p>
              ))}
            </div>
          </div>

          {/* ── Next-step countdown timer ── */}
          {countdown && !isOutForDelivery && !isDelivered && (
            <motion.div
              key={countdown.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mb-3 bg-gray-50 dark:bg-dark-border/40 rounded-2xl px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">⏳ Next step</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{countdown.label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums mt-0.5">
                  {countdown.secs > 0
                    ? countdown.secs >= 60
                      ? `${Math.floor(countdown.secs / 60)}m ${String(countdown.secs % 60).padStart(2,'0')}s`
                      : `${countdown.secs}s`
                    : '🔄 Updating...'}
                </p>
              </div>
              {/* Circular countdown ring */}
              <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0">
                <svg width="64" height="64" viewBox="0 0 64 64" className="absolute">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="27" fill="none" stroke="#16a34a" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 27}`}
                    strokeDashoffset={`${2 * Math.PI * 27 * (1 - Math.max(0, countdown.secs) / (NEXT_STATUS[demoStatus || order?.status]?.delaySecs || 1))}`}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="text-2xl">⏱️</span>
              </div>
            </motion.div>
          )}

          {isOutForDelivery && (
            <div className="mx-4 mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-semibold">🛵 Your order is on the way!</p>
                <p className="text-xl font-black text-green-700 dark:text-green-400">{formatEta()}</p>
              </div>
              <div className="text-4xl animate-bounce">🛵</div>
            </div>
          )}
          {isDelivered && (
            <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-bold text-emerald-700 text-sm">Order Delivered Successfully!</p>
                <p className="text-xs text-emerald-500">Thank you for shopping with AgroMart 🌿</p>
              </div>
            </div>
          )}
        </div>

        {/* Sheet body */}
        {sheetOpen && (
          <div className="bg-white dark:bg-dark-card max-h-[55vh] overflow-y-auto">
            <div className="px-4 pb-8 space-y-4">

              {/* Delivery partner (when out for delivery) */}
              {isOutForDelivery && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-2xl">👨</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Ravi Kumar</p>
                    <p className="text-xs text-gray-500">⭐ 4.8 · Delivery Partner</p>
                    <p className="text-xs text-gray-400 font-mono">KA 04 AB 1234</p>
                  </div>
                  <a href="tel:+917019205772" className="w-11 h-11 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
                    📞
                  </a>
                </div>
              )}

              {/* Delivery address */}
              <div className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-dark-border/30 rounded-2xl">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{order.shippingAddress?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">📞 {order.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Order items */}
              <div className="rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-dark-border/30 border-b border-gray-100 dark:border-dark-border">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">🛒 Items ({order.items?.length})</p>
                </div>
                {order.items?.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center px-4 py-3 border-b border-gray-50 dark:border-dark-border last:border-0">
                    <img src={item.image || 'https://placehold.co/48x48/16a34a/fff?text=A'} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}

                {/* Bill */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-dark-border/30 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500"><span>Items</span><span>₹{order.itemsPrice}</span></div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span>
                    <span className={order.shippingPrice === 0 ? 'text-green-600 font-semibold' : ''}>
                      {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-dark-border">
                    <span>Total Paid</span><span>₹{order.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <a href="tel:+917019205772" className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-green-200 text-green-700 font-semibold rounded-2xl text-sm dark:border-green-800 dark:text-green-400">
                  📞 Call Support
                </a>
                <Link to="/orders" className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-semibold rounded-2xl text-sm">
                  ← All Orders
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}
