import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWishlist } from '../../store/wishlistSlice'
import { orderAPI, userAPI } from '../../api/cartAPI'
import toast from 'react-hot-toast'

export default function UserDashboard() {
  const { user, updateUser } = useAuth()
  const dispatch = useDispatch()
  const { items: wishlist } = useSelector((s) => s.wishlist)
  const [activeTab, setActiveTab] = useState('overview')
  const [recentOrders, setRecentOrders] = useState([])
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchWishlist())
    loadOrders()
  }, [dispatch])

  const loadOrders = async () => {
    try {
      const { data } = await orderAPI.getMyOrders({ limit: 5 })
      setRecentOrders(data.orders)
    } catch { /* silent */ }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', profile.name)
      formData.append('phone', profile.phone)
      const { data } = await userAPI.updateProfile(formData)
      updateUser(data.user)
      toast.success('Profile updated! 🌿')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const totalOrders = recentOrders.length
  const totalSpent = recentOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

  const tabs = [
    { key: 'overview', label: '🏠 Overview' },
    { key: 'profile', label: '👤 Profile' },
    { key: 'orders', label: '📦 Orders' },
    { key: 'wishlist', label: '❤️ Wishlist' },
  ]

  return (
    <>
      <Helmet><title>My Dashboard — AgroMart</title></Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=16a34a&color=fff&size=80`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-500"
            />
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                Hello, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-8 flex-col lg:flex-row">
            {/* Sidebar Tabs */}
            <aside className="lg:w-56 flex-shrink-0">
              <div className="card p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                      activeTab === tab.key
                        ? 'bg-primary-600 text-white shadow-green'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Orders', value: totalOrders, icon: '📦', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                      { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: '💰', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
                      { label: 'Wishlist Items', value: wishlist.length, icon: '❤️', color: 'bg-red-50 dark:bg-red-900/20 text-red-500' },
                      { label: 'Saved Addresses', value: user?.addresses?.length || 0, icon: '📍', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
                    ].map((stat) => (
                      <div key={stat.label} className={`card p-4 text-center`}>
                        <div className={`text-2xl mb-1 ${stat.color}`}>{stat.icon}</div>
                        <p className="font-bold text-xl text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Orders */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                      <Link to="/orders" className="text-sm text-primary-600 hover:underline">View All →</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No orders yet. <Link to="/products" className="text-primary-600">Start Shopping!</Link></p>
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.slice(0, 3).map((order) => (
                          <Link
                            key={order._id}
                            to={`/orders/${order._id}`}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">#{order.orderNumber}</p>
                              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-gray-900 dark:text-white">₹{order.totalPrice}</p>
                              <span className={`status-${order.status} text-xs`}>{order.status}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Browse Products', to: '/products', icon: '🛍️' },
                      { label: 'View Cart', to: '/cart', icon: '🛒' },
                      { label: 'Track Order', to: '/orders', icon: '🗺️' },
                      { label: 'My Wishlist', icon: '❤️', onClick: () => setActiveTab('wishlist') },
                    ].map((action) => (
                      action.to ? (
                        <Link key={action.label} to={action.to} className="card p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                          <div className="text-2xl mb-2">{action.icon}</div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</p>
                        </Link>
                      ) : (
                        <div key={action.label} onClick={action.onClick} className="card p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                          <div className="text-2xl mb-2">{action.icon}</div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</p>
                        </div>
                      )
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-xl">My Profile</h3>
                    {!editing ? (
                      <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">✏️ Edit</button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
                        <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary btn-sm">
                          {saving ? 'Saving...' : '✓ Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <img
                      src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=16a34a&color=fff&size=80`}
                      alt={user?.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    {editing && (
                      <label className="btn btn-outline btn-sm cursor-pointer">
                        📸 Change Photo
                        <input type="file" accept="image/*" className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', key: 'name', editable: true },
                      { label: 'Email', key: 'email', editable: false, value: user?.email },
                      { label: 'Phone', key: 'phone', editable: true },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{field.label}</label>
                        {editing && field.editable ? (
                          <input
                            type="text"
                            value={profile[field.key] || ''}
                            onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                            className="input"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{field.value || user?.[field.key] || '—'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="space-y-3">
                    {recentOrders.length === 0 ? (
                      <div className="card p-10 text-center">
                        <p className="text-5xl mb-4">📦</p>
                        <p className="text-gray-500">No orders yet</p>
                        <Link to="/products" className="btn btn-primary btn-md mt-4">Shop Now</Link>
                      </div>
                    ) : (
                      recentOrders.map((order) => (
                        <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow block">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">Order #{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length} items</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">₹{order.totalPrice}</p>
                            <span className={`status-${order.status} text-xs`}>{order.status}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {wishlist.length === 0 ? (
                    <div className="card p-10 text-center">
                      <p className="text-5xl mb-4">❤️</p>
                      <p className="text-gray-500">Your wishlist is empty</p>
                      <Link to="/products" className="btn btn-primary btn-md mt-4">Browse Products</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((product) => (
                        <Link
                          key={product._id || product}
                          to={`/products/${product.slug || product._id || product}`}
                          className="card p-4 hover:shadow-md transition-shadow"
                        >
                          <img
                            src={product.images?.[0]?.url || 'https://placehold.co/200x150/16a34a/fff'}
                            alt={product.name || 'Product'}
                            className="w-full h-32 object-cover rounded-xl mb-3"
                          />
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{product.name}</p>
                          {product.price && <p className="text-primary-600 font-bold mt-1">₹{product.discountedPrice || product.price}</p>}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
