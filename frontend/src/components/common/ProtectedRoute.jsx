import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PageLoader from '../ui/PageLoader'
import MobileLoginModal from '../auth/MobileLoginModal'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(true) // auto-open modal when hitting protected page

  if (loading) return <PageLoader />

  if (!isAuthenticated) {
    return (
      <>
        <MobileLoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
            Sign in to continue
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
            Please sign in with your mobile number to access this page.
          </p>
          <button
            className="btn btn-primary px-8 py-3 text-base rounded-xl flex items-center gap-2"
            onClick={() => setLoginOpen(true)}
          >
            📱 Sign In with Mobile Number
          </button>
        </div>
      </>
    )
  }

  return <Outlet />
}
