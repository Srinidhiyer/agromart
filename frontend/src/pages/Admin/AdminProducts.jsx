import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { productAPI, categoryAPI } from '../../api/cartAPI'
import toast from 'react-hot-toast'

const emptyForm = {
  name: '', description: '', shortDescription: '', price: '', discountedPrice: '',
  category: '', brand: '', stock: '', unit: 'kg', isOrganic: false, isFeatured: false, sku: '',
}

function AdminSidebarLink({ to, label, icon }) {
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/products', label: 'Products', icon: '🌿' },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
  ]
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
              window.location.pathname.includes(item.to) && (item.to !== '/admin' || window.location.pathname === '/admin')
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

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => { loadProducts(); loadCategories() }, [page, search])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data } = await productAPI.getProducts({ page, limit: 15, keyword: search })
      setProducts(data.products)
      setTotal(data.total)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const loadCategories = async () => {
    try {
      const { data } = await categoryAPI.getCategories()
      setCategories(data.categories)
    } catch { /* silent */ }
  }

  const openAdd = () => { setEditProduct(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name, description: product.description, shortDescription: product.shortDescription || '',
      price: product.price, discountedPrice: product.discountedPrice || '',
      category: product.category?._id || product.category || '',
      brand: product.brand || '', stock: product.stock, unit: product.unit || 'kg',
      isOrganic: product.isOrganic || false, isFeatured: product.isFeatured || false, sku: product.sku || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (imageFile) formData.append('images', imageFile)

      if (editProduct) {
        await productAPI.updateProduct(editProduct._id, formData)
        toast.success('Product updated!')
      } else {
        await productAPI.createProduct(formData)
        toast.success('Product created!')
      }
      setShowForm(false)
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productAPI.deleteProduct(id)
      toast.success('Product deleted')
      loadProducts()
    } catch { toast.error('Failed to delete') }
  }

  const handleStockUpdate = async (id, newStock) => {
    try {
      await productAPI.updateStock(id, newStock)
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, stock: newStock } : p))
      toast.success('Stock updated')
    } catch { toast.error('Failed to update stock') }
  }

  return (
    <>
      <Helmet><title>Admin — Products — AgroMart</title></Helmet>
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark">
        <AdminSidebarLink />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Products <span className="text-gray-400 text-lg">({total})</span></h1>
              <button id="add-product-btn" onClick={openAdd} className="btn btn-primary btn-md">+ Add Product</button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search products..."
                className="input max-w-sm"
              />
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-dark-card/50 text-left">
                      {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                      ))
                    ) : products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-dark-card/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={product.images?.[0]?.url || 'https://placehold.co/40x40/16a34a/fff'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.category?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">₹{product.discountedPrice || product.price}</p>
                          {product.discountedPrice && <p className="text-xs text-gray-400 line-through">₹{product.price}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            defaultValue={product.stock}
                            onBlur={(e) => handleStockUpdate(product._id, parseInt(e.target.value))}
                            className="w-16 text-center border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm bg-white dark:bg-dark-card"
                            min={0}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {product.isFeatured && <span className="badge badge-amber">Featured</span>}
                            {product.isOrganic && <span className="badge badge-green">Organic</span>}
                            {product.stock === 0 && <span className="badge badge-red">OOS</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(product)} className="btn btn-ghost btn-sm text-xs px-2 py-1">✏️ Edit</button>
                            <button onClick={() => handleDelete(product._id)} className="btn btn-sm text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm">← Prev</button>
              <span className="btn btn-ghost btn-sm">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={products.length < 15} className="btn btn-ghost btn-sm">Next →</button>
            </div>
          </div>
        </main>

        {/* Product Form Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] bg-white dark:bg-dark-card z-50 overflow-y-auto p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                    {editProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="btn btn-ghost p-2">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: 'Product Name', key: 'name', required: true },
                    { label: 'Short Description', key: 'shortDescription' },
                    { label: 'Brand', key: 'brand' },
                    { label: 'SKU', key: 'sku' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                      <input type="text" required={f.required} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-24 resize-none" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                      <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" min={0} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discounted Price (₹)</label>
                      <input type="number" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} className="input" min={0} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                      <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" min={0} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                      <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input">
                        {['kg', 'g', 'L', 'ml', 'bag', 'pack', 'bottle', 'piece'].map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" required>
                      <option value="">Select category</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Images</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => setImageFile(e.target.files[0])} className="input text-xs" />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isOrganic} onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })} className="accent-primary-600 w-4 h-4" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">🌿 Organic</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-primary-600 w-4 h-4" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">⭐ Featured</span>
                    </label>
                  </div>

                  <button type="submit" disabled={saving} className="w-full btn btn-primary btn-lg shadow-green">
                    {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
