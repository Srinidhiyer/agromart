import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import L from 'leaflet'
import { useDeliveryLocation, KARNATAKA_ZONES } from '../../context/LocationContext'

export default function StoreMapSection() {
  const { userLocation, setShowModal } = useDeliveryLocation()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [activeDistrict, setActiveDistrict] = useState(null)

  const center = userLocation?.coordinates || [14.5204, 75.7224]

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom: userLocation ? 10 : 7,
      zoomControl: true,
      scrollWheelZoom: false,
    })
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    // District markers
    KARNATAKA_ZONES.forEach(zone => {
      const color = zone.available ? '#16a34a' : '#6b7280'
      const emoji = zone.available ? '🏪' : '🔜'
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${color};color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff;cursor:pointer">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const marker = L.marker(zone.coordinates, { icon }).addTo(map)
      marker.bindTooltip(`<b>${zone.district}</b><br/>${zone.available ? `${zone.stores.length} stores` : 'Coming soon'}`, {
        permanent: false, direction: 'top'
      })
      marker.on('click', () => {
        setActiveDistrict(zone.district)
        if (zone.available) map.flyTo(zone.coordinates, 11, { duration: 1 })
      })
    })

    // Individual store markers
    KARNATAKA_ZONES.filter(z => z.available).forEach(zone => {
      zone.stores.forEach(store => {
        const storeIcon = L.divIcon({
          className: '',
          html: `<div style="background:#15803d;color:#fff;border-radius:6px;padding:2px 5px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:1px solid #fff">🏪</div>`,
          iconSize: [28, 20],
          iconAnchor: [14, 10],
        })
        L.marker([store.lat, store.lng], { icon: storeIcon }).addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui;min-width:180px;padding:4px">
              <p style="font-weight:700;color:#15803d;margin:0 0 4px;font-size:13px">${store.name}</p>
              <p style="color:#555;font-size:12px;margin:0 0 3px">📍 ${store.address}</p>
              <p style="color:#555;font-size:12px;margin:0">📞 ${store.phone}</p>
            </div>
          `)
      })
    })

    // User location marker — use real GPS if available, else district center
    const userCoords = userLocation?.gps || userLocation?.coordinates
    if (userCoords) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="background:#2563eb;color:#fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 12px rgba(37,99,235,0.5);border:3px solid #fff">📍</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      })
      L.marker(userCoords, { icon: userIcon }).addTo(map)
        .bindPopup(`<b>Your Location:</b><br/>${userLocation.taluk}, ${userLocation.district}`)
        .openPopup()
    }

    setMapReady(true)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line

  const districtData = KARNATAKA_ZONES.find(z => z.district === activeDistrict)

  return (
    <section className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-widest text-sm mb-2">
            📍 Delivery Network
          </p>
          <h2 className="section-title">Stores Near You</h2>
          <p className="section-subtitle mx-auto">
            We deliver across Karnataka — find your nearest AgroMart distribution store
          </p>

          {userLocation ? (
            <div className="inline-flex items-center gap-2 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-5 py-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                Delivering to: <strong>{userLocation.taluk}, {userLocation.district}</strong>
              </span>
              <button onClick={() => setShowModal(true)} className="text-xs text-primary-600 hover:underline ml-1">Change</button>
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} className="mt-4 btn btn-outline btn-sm">
              📍 Select your delivery area
            </button>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-dark-border" style={{ height: '480px' }}>
              <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
              {!mapReady && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-dark-card flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading map...</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-dark-card rounded-xl shadow-lg p-3 text-xs space-y-1.5 border border-gray-200 dark:border-dark-border z-[1000]">
                <div className="flex items-center gap-2"><span>🏪</span><span className="text-gray-700 dark:text-gray-300">Available</span></div>
                <div className="flex items-center gap-2"><span>🔜</span><span className="text-gray-500">Coming Soon</span></div>
                <div className="flex items-center gap-2"><span>📍</span><span className="text-blue-600">Your Area</span></div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Click any district marker to see stores & taluks</p>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {/* Active district */}
            {activeDistrict && districtData ? (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{activeDistrict}</h3>
                    <p className="text-xs text-primary-600 dark:text-primary-400">{districtData.taluks.length} taluks · {districtData.stores.length} stores</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {districtData.taluks.map(t => (
                    <span key={t} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                {districtData.stores.length > 0 ? (
                  <div className="space-y-2">
                    {districtData.stores.map(store => (
                      <div key={store.name} className="bg-gray-50 dark:bg-dark-border/30 rounded-xl p-3">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{store.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">📍 {store.address}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">📞 {store.phone}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">🔜 Stores opening soon</p>
                )}
              </div>
            ) : (
              <div className="card p-5 text-center">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click any district on the map to view its stores and taluks</p>
              </div>
            )}

            {/* Districts list */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Active Districts ({KARNATAKA_ZONES.filter(z => z.available).length})
              </p>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {KARNATAKA_ZONES.filter(z => z.available).map(zone => (
                  <button
                    key={zone.district}
                    onClick={() => setActiveDistrict(zone.district)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${
                      activeDistrict === zone.district
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-border/30 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>📍 {zone.district}</span>
                    <span className="text-xs text-gray-400">{zone.stores.length} stores</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-md w-full">
              🛒 Shop for {userLocation?.taluk || 'My Area'}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
