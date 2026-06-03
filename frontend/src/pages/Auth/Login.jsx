import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  // Redirect to where user came from, or home
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please enter both email and password')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🌿')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Sign In — AgroMart</title></Helmet>
      <div className="min-h-screen flex bg-gray-50 dark:bg-dark">
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-1/2 overlay-green flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />
          <div className="relative z-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 backdrop-blur">
              🌿
            </div>
            <h1 className="font-heading text-4xl font-bold mb-4">Welcome to AgroMart</h1>
            <p className="text-green-100 text-lg mb-8 max-w-md">
              India's most trusted platform for premium agriculture supplies. Fast delivery, verified quality.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              {[['10K+', 'Happy Farmers'], ['500+', 'Products'], ['50+', 'Cities']].map(([v, l]) => (
                <div key={l}>
                  <p className="font-bold text-2xl">{v}</p>
                  <p className="text-green-200 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl">🌿</div>
                <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Agro<span className="text-primary-600">Mart</span></span>
              </Link>
              <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your account</p>
            </div>

            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="farmer@example.com"
                    className="input"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPw ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="input pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary btn-lg shadow-green"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : '🔐 Sign In'}
                </button>

                {/* Demo credentials */}
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 text-xs text-center text-primary-700 dark:text-primary-300">
                  <p className="font-semibold mb-1">Demo Credentials</p>
                  <p>Admin: admin@agromart.com / Admin@123</p>
                  <p>User: rajan@example.com / User@123</p>
                </div>
              </form>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">Create one free</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
