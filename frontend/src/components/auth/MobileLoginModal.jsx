import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

/**
 * MobileLoginModal
 * Simple mobile-number based login/register modal.
 * No email. No password page. Just phone → name (if new user).
 */
export default function MobileLoginModal({ isOpen, onClose }) {
  const { login, register } = useAuth()
  const [step, setStep] = useState('phone') // 'phone' | 'name'
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('phone')
      setPhone('')
      setName('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Attempt login with phone number as both identifier and "password"
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    try {
      // Try login: email = phone@agromart.local, password = phone number
      await login(`${cleaned}@agromart.local`, cleaned)
      toast.success('Welcome back! 🌿')
      onClose()
    } catch {
      // User not found → go to name step (new user)
      setStep('name')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Enter your name (min 2 characters)')
      return
    }
    const cleaned = phone.replace(/\D/g, '')
    setLoading(true)
    try {
      await register({
        name: name.trim(),
        email: `${cleaned}@agromart.local`,
        password: cleaned,
        phone: cleaned,
      })
      toast.success(`Welcome to AgroMart, ${name.trim()}! 🌱`)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal — slides down from top */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-50 flex justify-center"
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            <div className="login-modal-card">

              {/* Header */}
              <div className="login-modal-header">
                <span className="login-modal-logo">🌿 AgroMart</span>
                <button className="login-modal-close" onClick={onClose}>✕</button>
              </div>

              {step === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="login-modal-body">
                  <p className="login-modal-label">Enter your mobile number to continue</p>
                  <div className="login-phone-row">
                    <span className="login-phone-flag">🇮🇳 +91</span>
                    <input
                      ref={inputRef}
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="login-phone-input"
                      autoComplete="tel"
                    />
                  </div>
                  <button type="submit" className="login-modal-btn" disabled={loading}>
                    {loading ? '⏳ Checking...' : 'Continue →'}
                  </button>
                  <p className="login-modal-hint">No password needed. Just your phone number.</p>
                </form>
              )}

              {step === 'name' && (
                <form onSubmit={handleRegisterSubmit} className="login-modal-body">
                  <p className="login-modal-label">
                    New here! What's your name, farmer? 👨‍🌾
                  </p>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. Raju Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="login-phone-input"
                    autoComplete="name"
                  />
                  <button type="submit" className="login-modal-btn" disabled={loading}>
                    {loading ? '⏳ Creating account...' : '🌱 Start Shopping'}
                  </button>
                  <button
                    type="button"
                    className="login-modal-back"
                    onClick={() => setStep('phone')}
                  >
                    ← Change number
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
