import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Required = () => <span className="text-red-500 ml-0.5">*</span>

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showCPw, setShowCPw] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Mobile number is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit number'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      toast.success('🌿 Welcome to AgroMart!')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: 'This email is already registered. Please sign in.' })
        toast.error('Email already registered!')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Srini Iyer', key: 'name', required: true },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. srini@gmail.com', key: 'email', required: true },
    { id: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '10-digit number', key: 'phone', required: true },
  ]

  return (
    <>
      <Helmet><title>Create Account — AgroMart</title></Helmet>
      <div className="min-h-screen flex bg-gray-50 dark:bg-dark">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 overlay-green flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />
          <div className="relative z-10 text-white text-center">
            <div className="text-6xl mb-6">🌾</div>
            <h2 className="font-heading text-4xl font-bold mb-4">Join 10,000+ Farmers</h2>
            <p className="text-green-100 text-lg mb-8 max-w-md">
              Get access to premium organic manures, pesticides, and farming supplies with 2-3 hour delivery.
            </p>
            <div className="space-y-3 text-left max-w-sm">
              {['✅ Certified organic products', '⚡ 2-3 hour doorstep delivery', '🔬 Lab-tested quality guaranteed', '💰 Best prices, no hidden costs', '🏛️ Govt scheme products available'].map((b) => (
                <div key={b} className="flex items-center gap-2 text-green-100 text-sm">{b}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
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
              <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
              <p className="text-gray-500 text-sm mt-1">Fields marked <span className="text-red-500 font-bold">*</span> are required</p>
            </div>

            <div className="card p-8">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* Text fields */}
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {field.label}{field.required && <Required />}
                    </label>
                    <input
                      id={`register-${field.id}`}
                      type={field.type}
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`input ${errors[field.key] ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    {errors[field.key] && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {errors[field.key]}
                      </p>
                    )}
                  </div>
                ))}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password<Required />
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Min 6 characters"
                      className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">⚠️ {errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm Password<Required />
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      type={showCPw ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Repeat password"
                      className={`input pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    />
                    <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">⚠️ {errors.confirmPassword}</p>}
                </div>

                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-primary-600">Terms of Service</a> and{' '}
                  <a href="#" className="text-primary-600">Privacy Policy</a>.
                </p>

                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary btn-lg shadow-green"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : '🌿 Create Account'}
                </button>
              </form>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign In</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
