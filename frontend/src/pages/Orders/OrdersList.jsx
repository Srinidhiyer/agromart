import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { orderAPI } from '../../api/cartAPI'
import toast from 'react-hot-toast'

const statusColors = {
  pending: 'status-pending', confirmed: 'status-confirmed', packed: 'status-packed',
  out_for_delivery: 'status-out_for_delivery', delivered: 'status-delivered',
  cancelled: 'status-cancelled', returned: 'status-cancelled',
}

const statusLabels = {
  pending: '📋 Pending', confirmed: '✅ Confirmed', packed: '📦 Packed',
  out_for_delivery: '🛵 Out for Delivery', delivered: '🏠 Delivered', cancelled: '❌ Cancelled',
}

const cancellableStatuses = ['pending', 'confirmed', 'packed']

export default function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cancellingId, setCancellingId] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(null) // orderId to confirm

  useEffect(() => {
    loadOrders()
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.getMyOrders({ page, limit: 10 })
      setOrders(data.orders)
      setTotalPages(data.totalPages)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handleCancel = async (orderId) => {
    setCancellingId(orderId)
    try {
      await orderAPI.cancelOrder(orderId, 'Cancelled by customer')
      toast.success('✅ Order cancelled successfully!')
      setConfirmCancel(null)
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status: 'cancelled' } : o)
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <>
      <Helmet><title>My Orders — AgroMart</title></Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="skeleton w-16 h-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-1/3 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton h-3 w-1/4 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="text-8xl mb-6">📦</div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
              <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Items preview */}
                    <div className="flex gap-2 flex-shrink-0">
                      {order.items?.slice(0, 2).map((item) => (
                        <img
                          key={item._id}
                          src={item.image || 'https://placehold.co/60x60/16a34a/fff'}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ))}
                      {order.items?.length > 2 && (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-dark-border flex items-center justify-center text-sm text-gray-500">
                          +{order.items.length - 2}
                        </div>
                      )}
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            · {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className={statusColors[order.status] || 'badge badge-gray'}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <p className="font-bold text-gray-900 dark:text-white">₹{order.totalPrice}</p>
                        <div className="flex gap-2 flex-wrap">

                          {/* Track / View button */}
                          <Link
                            to={`/orders/${order._id}`}
                            className="btn btn-primary btn-sm px-4 py-1.5 text-xs"
                          >
                            {order.status === 'out_for_delivery' ? '🗺️ Track Live' : 'View Details →'}
                          </Link>

                          {/* Cancel button - only for cancellable statuses */}
                          {cancellableStatuses.includes(order.status) && (
                            <button
                              onClick={() => setConfirmCancel(order._id)}
                              className="btn btn-sm px-4 py-1.5 text-xs border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                            >
                              ✕ Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Confirmation Dialog */}
                  <AnimatePresence>
                    {confirmCancel === order._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30"
                      >
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Cancel this order?</p>
                            <p className="text-xs text-red-500 mt-0.5">This action cannot be undone. Stock will be restored.</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmCancel(null)}
                              className="btn btn-sm px-4 py-1.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl"
                            >
                              Keep Order
                            </button>
                            <button
                              onClick={() => handleCancel(order._id)}
                              disabled={cancellingId === order._id}
                              className="btn btn-sm px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded-xl disabled:opacity-60"
                            >
                              {cancellingId === order._id ? '⏳ Cancelling...' : '✕ Yes, Cancel'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm">← Prev</button>
                  <span className="btn btn-ghost btn-sm">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost btn-sm">Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
