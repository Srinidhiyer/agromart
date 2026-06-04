import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { useAuth } from './context/AuthContext'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageLoader from './components/ui/PageLoader'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'
import CallButton from './components/ui/CallButton'
import ErrorBoundary from './components/common/ErrorBoundary'

// Eagerly loaded pages
import Home from './pages/Home/Home'

// Lazily loaded pages
const Products = lazy(() => import('./pages/Products/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart/Cart'))
const Checkout = lazy(() => import('./pages/Checkout/Checkout'))
const OrdersList = lazy(() => import('./pages/Orders/OrdersList'))
const OrderTracking = lazy(() => import('./pages/Orders/OrderTracking'))
const UserDashboard = lazy(() => import('./pages/Dashboard/UserDashboard'))
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/Admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/Admin/AdminOrders'))
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar always visible — login modal lives inside Navbar */}
      {!isAdminPage && <Navbar />}

      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>

              {/* ── PUBLIC ROUTES — no login needed ── */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:identifier" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ── PROTECTED ROUTES — need login to buy ── */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrdersList />} />
                <Route path="/orders/:id" element={<OrderTracking />} />
                <Route path="/dashboard" element={<UserDashboard />} />
              </Route>

              {/* ── ADMIN ROUTES ── */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>

      {!isAdminPage && <Footer />}
      {!isAdminPage && <CallButton />}
    </div>
  )
}
