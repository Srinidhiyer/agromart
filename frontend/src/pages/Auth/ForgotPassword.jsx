import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { authAPI } from '../../api/authAPI'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Forgot Password — AgroMart</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl">🌿</div>
              <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Agro<span className="text-primary-600">Mart</span></span>
            </Link>
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
          </div>

          <div className="card p-8">
            {sent ? (
              <div className="text-center">
                <div className="text-5xl mb-4">📧</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Check your inbox</h3>
                <p className="text-gray-500 text-sm mb-6">
                  If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
                </p>
                <Link to="/login" className="btn btn-primary btn-md w-full">← Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input"
                  />
                </div>
                <button id="forgot-submit" type="submit" disabled={loading} className="w-full btn btn-primary btn-lg shadow-green">
                  {loading ? 'Sending...' : '📨 Send Reset Link'}
                </button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">← Back to Sign In</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
