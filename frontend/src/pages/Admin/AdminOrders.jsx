import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { orderAPI } from '../../api/cartAPI'
import toast from 'react-hot-toast'

const statusOptions = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']
const statusColors = {
  pending: 'status-pending', confirmed: 'status-confirmed', packed: 'status-packed',
  out_for_delivery: 'status-out_for_delivery', delivered: 'status-delivered', cancelled: 'status-cancelled',
}

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => { loadOrders() }, [page, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.getAllOrders({ page, limit: 15, status: statusFilter })
      setOrders(data.orders)
      setTotal(data.total)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await orderAPI.updateOrderStatus(orderId, { status: newStatus })
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order status updated to ${newStatus}`)
    } catch { toast.error('Failed to update status') }
    finally { setUpdatingId(null) }
  }

  return (
    <>
      <Helmet><title>Admin — Orders — AgroMart</title></Helmet>
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Orders <span className="text-gray-400 text-lg">({total})</span></h1>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="input w-auto text-sm"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
              </select>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-dark-card/50 text-left">
                      {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                      ))
                    ) : orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-dark-card/30">
                        <td className="px-4 py-3">
                          <Link to={`/orders/${order._id}`} className="font-medium text-primary-600 hover:underline">#{order.orderNumber}</Link>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{order.user?.name}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.items?.length} items</td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">₹{order.totalPrice}</td>
                        <td className="px-4 py-3">
                          <span className={order.payment?.status === 'completed' ? 'badge badge-green text-xs' : 'badge badge-amber text-xs'}>
                            {order.payment?.method?.toUpperCase()} · {order.payment?.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={updatingId === order._id || order.status === 'delivered' || order.status === 'cancelled'}
                            className="text-xs border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100"
                          >
                            {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm text-xs px-2 py-1">View →</Link>
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
              <button onClick={() => setPage((p) => p + 1)} disabled={orders.length < 15} className="btn btn-ghost btn-sm">Next →</button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
