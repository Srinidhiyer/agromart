import { createContext, useContext, useState, useEffect } from 'react'

// ─── Karnataka Delivery Zones Data ────────────────────────────────────────────
export const KARNATAKA_ZONES = [
  {
    district: 'Bengaluru Urban',
    coordinates: [12.9716, 77.5946],
    available: true,
    taluks: ['Bengaluru North', 'Bengaluru South', 'Yelahanka', 'Anekal', 'Kanakapura', 'Ramanagara'],
    stores: [
      { name: 'AgroMart BTM Hub', lat: 12.9165, lng: 77.6101, address: 'BTM Layout, Bengaluru', phone: '080-4545-1100' },
      { name: 'AgroMart Whitefield', lat: 12.9698, lng: 77.7499, address: 'Whitefield Main Rd, Bengaluru', phone: '080-4545-1101' },
      { name: 'AgroMart Jayanagar', lat: 12.9250, lng: 77.5938, address: '4th Block Jayanagar, Bengaluru', phone: '080-4545-1102' },
    ],
  },
  {
    district: 'Mysuru',
    coordinates: [12.2958, 76.6394],
    available: true,
    taluks: ['Mysuru', 'Nanjangud', 'T. Narasipur', 'Hunsur', 'H.D. Kote', 'Periyapatna', 'K.R. Nagar'],
    stores: [
      { name: 'AgroMart Mysuru Central', lat: 12.2958, lng: 76.6394, address: 'Sayyaji Rao Road, Mysuru', phone: '0821-4001-200' },
      { name: 'AgroMart Nanjangud', lat: 12.1181, lng: 76.6835, address: 'Main Bazaar, Nanjangud', phone: '0821-4001-201' },
    ],
  },
  {
    district: 'Mandya',
    coordinates: [12.5218, 76.8951],
    available: true,
    taluks: ['Mandya', 'Srirangapatna', 'Nagamangala', 'Maddur', 'Malavalli', 'Krishnarajapete', 'Pandavapura'],
    stores: [
      { name: 'AgroMart Mandya', lat: 12.5218, lng: 76.8951, address: 'Ashoka Road, Mandya', phone: '08232-401200' },
    ],
  },
  {
    district: 'Hassan',
    coordinates: [13.0033, 76.1004],
    available: true,
    taluks: ['Hassan', 'Belur', 'Sakleshpur', 'Alur', 'Arakalagudu', 'Channarayapatna', 'Holenarasipur'],
    stores: [
      { name: 'AgroMart Hassan', lat: 13.0033, lng: 76.1004, address: 'B.M. Road, Hassan', phone: '08172-401300' },
    ],
  },
  {
    district: 'Tumkur',
    coordinates: [13.3409, 77.1000],
    available: true,
    taluks: ['Tumkur', 'Gubbi', 'Tiptur', 'Madhugiri', 'Koratagere', 'Kunigal', 'Pavagada', 'Sira', 'Chiknayakanhalli'],
    stores: [
      { name: 'AgroMart Tumkur', lat: 13.3409, lng: 77.1000, address: 'S.S. Puram, Tumkur', phone: '0816-4001-400' },
    ],
  },
  {
    district: 'Kolar',
    coordinates: [13.1333, 78.1333],
    available: true,
    taluks: ['Kolar', 'Chikkaballapur', 'Mulbagal', 'Srinivaspur', 'Malur', 'Bangarpet'],
    stores: [
      { name: 'AgroMart Kolar', lat: 13.1333, lng: 78.1333, address: 'Gandhi Nagar, Kolar', phone: '08152-401500' },
      { name: 'AgroMart Chikkaballapur', lat: 13.4355, lng: 77.7315, address: 'Doddaballapur Rd, Chikkaballapur', phone: '08156-401501' },
    ],
  },
  {
    district: 'Shivamogga',
    coordinates: [13.9299, 75.5681],
    available: true,
    taluks: ['Shivamogga', 'Bhadravati', 'Sagar', 'Thirthahalli', 'Hosanagara', 'Shikaripura', 'Sorab'],
    stores: [
      { name: 'AgroMart Shivamogga', lat: 13.9299, lng: 75.5681, address: 'Jawaharlal Nehru Rd, Shivamogga', phone: '08182-401600' },
    ],
  },
  {
    district: 'Davangere',
    coordinates: [14.4644, 75.9218],
    available: true,
    taluks: ['Davangere', 'Harihar', 'Harpanahalli', 'Jagalur', 'Channagiri', 'Harapanahalli'],
    stores: [
      { name: 'AgroMart Davangere', lat: 14.4644, lng: 75.9218, address: '8th Main, PJ Extension, Davangere', phone: '08192-401700' },
    ],
  },
  {
    district: 'Dharwad',
    coordinates: [15.4589, 75.0078],
    available: true,
    taluks: ['Dharwad', 'Hubballi', 'Kalghatgi', 'Kundgol', 'Navalgund', 'Annigeri'],
    stores: [
      { name: 'AgroMart Hubballi', lat: 15.3647, lng: 75.1240, address: 'Lamington Road, Hubballi', phone: '0836-4001-800' },
      { name: 'AgroMart Dharwad', lat: 15.4589, lng: 75.0078, address: 'Station Road, Dharwad', phone: '0836-4001-801' },
    ],
  },
  {
    district: 'Belagavi',
    coordinates: [15.8497, 74.4977],
    available: true,
    taluks: ['Belagavi', 'Chikkodi', 'Gokak', 'Hukkeri', 'Raibag', 'Ramdurg', 'Saundatti', 'Bailhongal', 'Khanapur'],
    stores: [
      { name: 'AgroMart Belagavi', lat: 15.8497, lng: 74.4977, address: 'Khade Bazaar, Belagavi', phone: '0831-4001-900' },
    ],
  },
  {
    district: 'Vijayapura',
    coordinates: [16.8302, 75.7100],
    available: true,
    taluks: ['Vijayapura', 'Indi', 'Muddebihal', 'Sindagi', 'Basavana Bagewadi'],
    stores: [
      { name: 'AgroMart Vijayapura', lat: 16.8302, lng: 75.7100, address: 'Station Road, Vijayapura', phone: '08352-401001' },
    ],
  },
  {
    district: 'Kalaburagi',
    coordinates: [17.3297, 76.8343],
    available: true,
    taluks: ['Kalaburagi', 'Afzalpur', 'Aland', 'Chincholi', 'Chittapur', 'Jewargi', 'Sedam', 'Yadgir'],
    stores: [
      { name: 'AgroMart Kalaburagi', lat: 17.3297, lng: 76.8343, address: 'Super Market, Kalaburagi', phone: '08472-401002' },
    ],
  },
  {
    district: 'Raichur',
    coordinates: [16.2120, 77.3439],
    available: false,
    taluks: ['Raichur', 'Manvi', 'Devadurga', 'Sindhanur', 'Lingasugur'],
    stores: [],
  },
  {
    district: 'Bidar',
    coordinates: [17.9104, 77.5199],
    available: false,
    taluks: ['Bidar', 'Basavakalyan', 'Bhalki', 'Humnabad', 'Aurad'],
    stores: [],
  },
]

// ─── Context ───────────────────────────────────────────────────────────────────
const DeliveryLocationContext = createContext()

// Find nearest zone AND nearest store within zone to get exact taluk
function findNearestLocation(latitude, longitude) {
  let nearest = null
  let minDist = Infinity

  KARNATAKA_ZONES.filter(z => z.available).forEach(zone => {
    // Check district center
    const d = Math.sqrt(
      Math.pow(zone.coordinates[0] - latitude, 2) +
      Math.pow(zone.coordinates[1] - longitude, 2)
    )
    if (d < minDist) {
      minDist = d
      nearest = { zone, taluk: zone.taluks[0] }
    }

    // Also check individual store locations for better taluk match
    zone.stores.forEach(store => {
      const sd = Math.sqrt(
        Math.pow(store.lat - latitude, 2) +
        Math.pow(store.lng - longitude, 2)
      )
      if (sd < minDist) {
        minDist = sd
        // Extract taluk from store name (e.g. "AgroMart Nanjangud" → "Nanjangud")
        const storeTaluk = store.name.replace('AgroMart ', '').split(' ')[0]
        const matchedTaluk = zone.taluks.find(t => t.toLowerCase().startsWith(storeTaluk.toLowerCase())) || zone.taluks[0]
        nearest = { zone, taluk: matchedTaluk }
      }
    })
  })

  return nearest
}

export function DeliveryLocationProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    // Always try GPS first — silently auto-detect real location
    if (navigator.geolocation) {
      setDetecting(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const found = findNearestLocation(latitude, longitude)
          if (found) {
            const location = {
              district: found.zone.district,
              taluk: found.taluk,
              coordinates: found.zone.coordinates,
              gps: [latitude, longitude], // real GPS for the map marker
            }
            setUserLocation(location)
            localStorage.setItem('agromart_delivery_location', JSON.stringify(location))
          }
          setDetecting(false)
        },
        () => {
          // GPS failed — fall back to saved or show modal
          setDetecting(false)
          const saved = localStorage.getItem('agromart_delivery_location')
          if (saved) {
            try { setUserLocation(JSON.parse(saved)) } catch (_) {}
          } else {
            setTimeout(() => setShowModal(true), 800)
          }
        },
        { timeout: 8000, maximumAge: 60000 }
      )
    } else {
      // No geolocation support — use saved or modal
      const saved = localStorage.getItem('agromart_delivery_location')
      if (saved) {
        try { setUserLocation(JSON.parse(saved)) } catch (_) {}
      } else {
        setTimeout(() => setShowModal(true), 800)
      }
    }
  }, [])

  const saveLocation = (location) => {
    setUserLocation(location)
    localStorage.setItem('agromart_delivery_location', JSON.stringify(location))
    setShowModal(false)
  }

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const found = findNearestLocation(latitude, longitude)
        if (found) {
          saveLocation({
            district: found.zone.district,
            taluk: found.taluk,
            coordinates: found.zone.coordinates,
            gps: [latitude, longitude],
          })
        }
        setDetecting(false)
      },
      () => setDetecting(false),
      { timeout: 8000 }
    )
  }

  return (
    <DeliveryLocationContext.Provider value={{
      userLocation, showModal, setShowModal, saveLocation, detectLocation, detecting
    }}>
      {children}
    </DeliveryLocationContext.Provider>
  )
}

export const useDeliveryLocation = () => useContext(DeliveryLocationContext)
