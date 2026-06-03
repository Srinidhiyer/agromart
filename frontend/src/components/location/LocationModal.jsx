import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeliveryLocation, KARNATAKA_ZONES } from '../../context/LocationContext'

// Calculate distance in km between two lat/lng points
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function LocationModal() {
  const { showModal, setShowModal, saveLocation, detecting, userLocation } = useDeliveryLocation()
  const [gpsCoords, setGpsCoords] = useState(null)
  const [gpsError, setGpsError] = useState(false)
  const [nearbyStores, setNearbyStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [detecting2, setDetecting2] = useState(false)

  // When modal opens, detect GPS and find nearby stores
  useEffect(() => {
    if (!showModal) return
    setDetecting2(true)
    setGpsError(false)

    if (!navigator.geolocation) {
      setGpsError(true)
      setDetecting2(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setGpsCoords([latitude, longitude])

        // Build sorted list of all stores with distance
        const allStores = []
        KARNATAKA_ZONES.filter(z => z.available).forEach(zone => {
          zone.stores.forEach(store => {
            const dist = distanceKm(latitude, longitude, store.lat, store.lng)
            allStores.push({ ...store, district: zone.district, zone, dist })
          })
        })
        allStores.sort((a, b) => a.dist - b.dist)
        setNearbyStores(allStores.slice(0, 8)) // Show 8 nearest stores
        setSelectedStore(allStores[0]) // Pre-select closest
        setDetecting2(false)
      },
      () => {
        setGpsError(true)
        setDetecting2(false)
        // Show all stores if GPS fails
        const allStores = []
        KARNATAKA_ZONES.filter(z => z.available).forEach(zone => {
          zone.stores.forEach(store => {
            allStores.push({ ...store, district: zone.district, zone })
          })
        })
        setNearbyStores(allStores)
      },
      { timeout: 8000 }
    )
  }, [showModal])

  if (!showModal) return null

  const handleConfirm = () => {
    if (!selectedStore) return
    saveLocation({
      district: selectedStore.district,
      taluk: selectedStore.name.replace('AgroMart ', ''),
      store: selectedStore,
      gps: gpsCoords,
      coordinates: selectedStore.zone.coordinates,
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 p-5 text-white">
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl flex-shrink-0">🏪</div>
              <div>
                <h2 className="font-heading font-bold text-lg">Select Your Nearest Store</h2>
                <p className="text-green-200 text-xs mt-0.5">Products will be delivered from this store to you</p>
              </div>
            </div>

            {/* GPS status bar */}
            <div className={`mt-3 flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
              gpsError ? 'bg-red-500/20 text-red-200' : 'bg-white/10 text-green-200'
            }`}>
              {detecting2 ? (
                <><div className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />Detecting your location...</>
              ) : gpsError ? (
                <><span>⚠️</span> Could not detect GPS — showing all stores</>
              ) : gpsCoords ? (
                <><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" /><span>📍 Your location detected — stores sorted by distance</span></>
              ) : null}
            </div>
          </div>

          {/* Store list */}
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {gpsCoords ? '🎯 Nearest Stores to You' : '📍 All Available Stores'}
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {detecting2 ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-dark-border animate-pulse rounded-xl" />
                ))
              ) : nearbyStores.map((store, i) => (
                <button
                  key={store.name}
                  onClick={() => setSelectedStore(store)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selectedStore?.name === store.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-dark-border hover:border-primary-300'
                  }`}
                >
                  {/* Position badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 && gpsCoords ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-gray-300'
                  }`}>
                    {i === 0 && gpsCoords ? '⭐' : i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{store.name}</p>
                    <p className="text-xs text-gray-500 truncate">📍 {store.address}</p>
                    {store.dist !== undefined && (
                      <p className={`text-xs font-medium mt-0.5 ${i === 0 ? 'text-green-600' : 'text-primary-600 dark:text-primary-400'}`}>
                        {store.dist < 1 ? `${Math.round(store.dist * 1000)}m away` : `${store.dist.toFixed(1)} km away`}
                        {i === 0 && ' · Closest'}
                      </p>
                    )}
                  </div>

                  {selectedStore?.name === store.name && (
                    <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3">
                        <path d="m5 13 4 4L19 7"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!selectedStore}
              className="w-full btn btn-primary btn-md mt-4 disabled:opacity-40"
            >
              ✅ Deliver from {selectedStore?.name || '...'}
            </button>

            {/* Skip */}
            <button
              onClick={() => {
                localStorage.setItem('agromart_delivery_location', JSON.stringify({ district: 'Karnataka', taluk: 'All Areas', coordinates: [14.5204, 75.7224] }))
                setShowModal(false)
              }}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2 py-1"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
