import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { useDeliveryLocation } from '../../context/LocationContext'
import { productAPI } from '../../api/cartAPI'
import MobileLoginModal from '../auth/MobileLoginModal'

// ── Icons ──────────────────────────────────────────────────────────────────────
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C7.76 17.11 10.34 13.5 17 12V17L22 12L17 7V8Z"/>
  </svg>
)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: '🌱 Organic', to: '/products?category=organic-manure' },
  { label: '🌾 Pesticides', to: '/products?category=agricultural-pesticides' },
  { label: '🏛️ Govt Schemes', to: '/products?category=govt-schemes' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const { isDark, toggleTheme } = useTheme()
  const { userLocation, setShowModal } = useDeliveryLocation()

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const searchRef = useRef(null)
  const userMenuRef = useRef(null)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const { data } = await productAPI.getSuggestions(searchQuery)
          setSuggestions(data.suggestions || [])
        } catch { setSuggestions([]) }
      } else {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Show login modal. If already logged in trying to go to protected page, modal won't show.
  const openLogin = () => setLoginModalOpen(true)

  return (
    <>
      {/* ── Mobile Login Modal ── */}
      <MobileLoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4'
        }`}
        style={{ backdropFilter: isScrolled ? 'blur(12px)' : 'none' }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-green group-hover:scale-110 transition-transform">
                <LeafIcon />
              </div>
              <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                Agro<span className="text-primary-600">Mart</span>
              </span>
            </Link>

            {/* Delivery store pill */}
            <button
              onClick={() => setShowModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1 text-xs text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all max-w-[180px]"
            >
              <span className="text-sm">🏪</span>
              <span className="font-medium truncate">
                {userLocation?.store?.name
                  ? userLocation.store.name.replace('AgroMart ', '')
                  : userLocation?.taluk || 'Select Store'}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 opacity-60 flex-shrink-0"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                    location.pathname === link.to ? 'nav-link-active' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">

              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  id="search-btn"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="btn-ghost btn-sm p-2 rounded-xl"
                  aria-label="Search"
                >
                  <SearchIcon />
                </button>

                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 sm:w-96 card p-3 z-50"
                    >
                      <form onSubmit={handleSearch}>
                        <div className="flex gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="input flex-1"
                            id="search-input"
                          />
                          <button type="submit" className="btn-primary btn-sm px-4">
                            <SearchIcon />
                          </button>
                        </div>
                      </form>

                      {suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {suggestions.map((s) => (
                            <button
                              key={s._id}
                              onClick={() => { navigate(`/products/${s.slug}`); setSearchOpen(false) }}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card/50 text-left transition-colors"
                            >
                              <img
                                src={s.images?.[0]?.url}
                                alt={s.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{s.name}</p>
                                <p className="text-xs text-primary-600 font-semibold">
                                  ₹{s.discountedPrice || s.price}/{s.unit}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme toggle */}
              <button
                id="theme-toggle"
                onClick={toggleTheme}
                className="btn-ghost btn-sm p-2 rounded-xl"
                aria-label="Toggle theme"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                id="cart-link"
                className="relative btn-ghost btn-sm p-2 rounded-xl"
                aria-label="Cart"
              >
                <CartIcon />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-green"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* ── User Section ── */}
              {isAuthenticated ? (
                /* Logged-in user dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    id="user-menu-btn"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
                  >
                    <img
                      src={user?.avatar?.url}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                    />
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-24 truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 card py-2 z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <PhoneIcon />
                            {user?.phone || user?.email?.replace('@agromart.local', '')}
                          </p>
                        </div>

                        {[
                          { label: '🏠 My Dashboard', to: '/dashboard' },
                          { label: '📦 My Orders', to: '/orders' },
                          { label: '🛒 Cart', to: '/cart' },
                          ...(isAdmin ? [{ label: '⚙️ Admin Panel', to: '/admin' }] : []),
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}

                        <div className="border-t border-gray-100 dark:border-dark-border mt-1 pt-1">
                          <button
                            id="logout-btn"
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            🚪 Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ── Sign In button — opens mobile login modal ── */
                <button
                  id="signin-btn"
                  onClick={openLogin}
                  className="flex items-center gap-2 btn-primary btn-sm px-4 py-2 rounded-xl font-semibold"
                >
                  <PhoneIcon />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                id="mobile-menu-btn"
                className="lg:hidden btn-ghost btn-sm p-2 rounded-xl"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-1 border-t border-gray-200 dark:border-dark-border mt-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-xl transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  {!isAuthenticated && (
                    <div className="px-4 pt-3">
                      <button
                        onClick={openLogin}
                        className="w-full btn btn-primary btn-sm text-center flex items-center justify-center gap-2"
                      >
                        <PhoneIcon />
                        Sign In with Mobile Number
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  )
}
