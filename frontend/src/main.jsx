import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/store.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { DeliveryLocationProvider } from './context/LocationContext.jsx'
import LocationModal from './components/location/LocationModal.jsx'
import 'leaflet/dist/leaflet.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <DeliveryLocationProvider>
                  <App />
                  <LocationModal />
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    duration: 3500,
                    style: {
                      background: 'var(--toast-bg, #fff)',
                      color: 'var(--toast-color, #1f2937)',
                      borderRadius: '12px',
                      border: '1px solid rgba(22,163,74,0.2)',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    },
                    success: {
                      iconTheme: { primary: '#16a34a', secondary: '#fff' },
                    },
                    error: {
                      iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    },
                  }}
                />
                </DeliveryLocationProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
)
