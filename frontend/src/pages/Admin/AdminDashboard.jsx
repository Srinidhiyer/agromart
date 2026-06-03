import { useEffect, useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { adminAPI } from '../../api/cartAPI'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/products', label: 'Products', icon: '🌿' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
]

function AdminSidebar() {
  const location = useLocation()
  return (
    <aside className="w-60 min-h-screen bg-gray-900 dark:bg-dark-card/80 flex flex-col py-6 px-3">
      <Link to="/" className="flex items-center gap-2 px-3 mb-8">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white">🌿</div>
        <span className="font-heading font-bold text-white">AgroMart <span className="text-primary-400 text-xs font-normal">Admin</span></span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-green'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white text-sm">
          ← Back to Store
        </Link>
      </div>
    </aside>
  )
}

function StatCard({ label, value, icon, change, color }) {
  return (
    <div className={`card p-6 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          <p className="font-heading text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats()
      setStats(data.stats)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  return (
    <>
      <Helmet><title>Admin Dashboard — AgroMart</title></Helmet>
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Admin Dashboard
            </h1>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="border-green-500" change={12} />
                <StatCard label="Total Orders" value={stats?.totalOrders || 0} icon="📦" color="border-blue-500" change={8} />
                <StatCard label="Total Products" value={stats?.totalProducts || 0} icon="🌿" color="border-purple-500" />
                <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="👥" color="border-amber-500" change={5} />
              </div>
            )}

            {/* Quick Nav Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Manage Products', desc: 'Add, edit, delete products and stock', to: '/admin/products', icon: '🌿', color: 'from-green-500 to-emerald-600' },
                { label: 'Manage Orders', desc: 'View and update order statuses', to: '/admin/orders', icon: '📦', color: 'from-blue-500 to-blue-700' },
                { label: 'Manage Users', desc: 'View customers and manage roles', to: '/admin/users', icon: '👥', color: 'from-purple-500 to-violet-700' },
              ].map((card) => (
                <Link
                  key={card.to}
                  to={card.to}
                  className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white hover:-translate-y-1 transition-transform shadow-lg`}
                >
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <p className="font-heading font-bold text-lg">{card.label}</p>
                  <p className="text-white/80 text-sm mt-1">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
