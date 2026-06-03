import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, setFilters, setPage } from '../../store/productSlice'
import ProductCard from '../../components/ui/ProductCard'
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
]

const categories = [
  { label: 'All Products', value: '' },
  { label: '🌱 Organic Manure', value: 'organic-manure' },
  { label: '🌾 Pesticides', value: 'agricultural-pesticides' },
  { label: '🪱 Vermicompost', value: 'vermicompost' },
  { label: '🦠 Bio-Fertilizers', value: 'bio-fertilizers' },
  { label: '🐛 Insecticides', value: 'insecticides' },
  { label: '🍄 Fungicides', value: 'fungicides' },
  { label: '🌿 Herbicides', value: 'herbicides' },
  { label: '🏛️ Govt Schemes', value: 'govt-schemes' },
]

function FilterSidebar({ filters, onFilterChange, onClear }) {
  return (
    <div className="card p-6 space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-gray-900 dark:text-white">Filters</h3>
        <button onClick={onClear} className="text-xs text-primary-600 hover:underline">Clear All</button>
      </div>

      {/* Category */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={filters.category === cat.value}
                onChange={() => onFilterChange({ category: cat.value })}
                className="accent-primary-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="input text-sm w-full"
            min={0}
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="input text-sm w-full"
            min={0}
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={r}
                checked={Number(filters.rating) === r}
                onChange={() => onFilterChange({ rating: r })}
                className="accent-primary-600"
              />
              <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" className={`w-3 h-3 fill-current ${i < r ? 'text-amber-400' : 'text-gray-300'}`}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
                <span className="text-xs text-gray-500">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Organic filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isOrganic === 'true'}
            onChange={(e) => onFilterChange({ isOrganic: e.target.checked ? 'true' : '' })}
            className="accent-primary-600 w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">🌿 Organic Only</span>
        </label>
      </div>

      {/* In stock filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => onFilterChange({ inStock: e.target.checked ? 'true' : '' })}
            className="accent-primary-600 w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">✅ In Stock Only</span>
        </label>
      </div>
    </div>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const range = 2
  for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-ghost btn-sm disabled:opacity-30"
      >← Prev</button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="btn btn-ghost btn-sm w-9 h-9">1</button>
          {pages[0] > 2 && <span className="text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
            p === currentPage
              ? 'bg-primary-600 text-white shadow-green'
              : 'btn btn-ghost btn-sm'
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-400">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="btn btn-ghost btn-sm w-9 h-9">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-ghost btn-sm disabled:opacity-30"
      >Next →</button>
    </div>
  )
}

export default function Products() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { products, loading, total, totalPages, currentPage, filters } = useSelector((s) => s.products)
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sync URL params → filters whenever URL search string changes (e.g. navbar clicks)
  useEffect(() => {
    const params = {
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page')) || 1,
    }
    // Only dispatch if something actually changed to avoid infinite loop
    if (
      params.keyword !== filters.keyword ||
      params.category !== filters.category ||
      params.sort !== filters.sort ||
      params.page !== filters.page
    ) {
      dispatch(setFilters(params))
    }
  }, [location.search]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch when filters change
  useEffect(() => {
    dispatch(fetchProducts(filters))
    // Update URL
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    setSearchParams(params, { replace: true })
  }, [filters, dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = useCallback((updates) => {
    dispatch(setFilters({ ...filters, ...updates, page: 1 }))
  }, [filters, dispatch])

  const handlePageChange = (page) => {
    dispatch(setPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClear = () => {
    dispatch(setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', isOrganic: '', inStock: '', page: 1 }))
  }

  return (
    <>
      <Helmet>
        <title>Products — AgroMart</title>
        <meta name="description" content="Browse our complete range of organic manures, pesticides, and bio-fertilizers." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        {/* Page Header */}
        <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {filters.category
                ? categories.find((c) => c.value === filters.category)?.label || 'Products'
                : filters.keyword
                  ? `Search: "${filters.keyword}"`
                  : 'All Products'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {loading ? 'Loading...' : `${total} products found`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar — Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onClear={handleClear} />
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <button
                  className="lg:hidden btn btn-outline btn-sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  ⚙️ Filters
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Sort:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange({ sort: e.target.value })}
                    className="input w-auto text-sm cursor-pointer"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24"
                >
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                  <button onClick={handleClear} className="btn btn-primary btn-md">Clear Filters</button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, i) => (
                      <ProductCard key={product._id} product={product} index={i} />
                    ))}
                  </div>
                </AnimatePresence>
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-dark-card z-50 overflow-y-auto p-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-500">✕</button>
                </div>
                <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onClear={handleClear} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
