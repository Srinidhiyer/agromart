import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { authAPI } from '../../api/authAPI'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link expired. Please request a new one.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Helmet><title>Reset Password — AgroMart</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔐</div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
          </div>
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <input id="reset-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <input id="reset-confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className="input" />
              </div>
              <button id="reset-submit" type="submit" disabled={loading} className="w-full btn btn-primary btn-lg shadow-green">
                {loading ? 'Resetting...' : '✅ Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
