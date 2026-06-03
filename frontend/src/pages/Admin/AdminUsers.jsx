import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { adminAPI } from '../../api/cartAPI'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '🌿' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
]

function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col py-6 px-3">
      <Link to="/" className="flex items-center gap-2 px-3 mb-8">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white">🌿</div>
        <span className="font-heading font-bold text-white">AgroMart <span className="text-primary-400 text-xs">Admin</span></span>
      </Link>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              window.location.pathname === item.to || (item.to !== '/admin' && window.location.pathname.startsWith(item.to))
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}>
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
      <Link to="/" className="px-3 py-2 text-gray-400 hover:text-white text-sm mt-4 border-t border-gray-800 pt-4">← Back to Store</Link>
    </aside>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => { loadUsers() }, [page, search])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data } = await adminAPI.getAllUsers({ page, limit: 15, keyword: search })
      setUsers(data.users)
      setTotal(data.total)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole })
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u))
      toast.success('User role updated')
    } catch { toast.error('Failed to update role') }
  }

  const handleToggleActive = async (userId, isActive) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !isActive })
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: !isActive } : u))
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed to update user') }
  }

  return (
    <>
      <Helmet><title>Admin — Users — AgroMart</title></Helmet>
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Users <span className="text-gray-400 text-lg">({total})</span></h1>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or email..."
                className="input max-w-sm"
              />
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-dark-card/50 text-left">
                      {['User', 'Phone', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                      ))
                    ) : users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-card/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.name}&background=16a34a&color=fff&size=36`}
                              alt={user.name}
                              className="w-9 h-9 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="text-xs border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={user.isActive !== false ? 'badge badge-green text-xs' : 'badge badge-red text-xs'}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(user._id, user.isActive !== false)}
                            className={`btn btn-sm text-xs px-2 py-1 ${user.isActive !== false ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                          >
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm">← Prev</button>
              <span className="btn btn-ghost btn-sm">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={users.length < 15} className="btn btn-ghost btn-sm">Next →</button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
