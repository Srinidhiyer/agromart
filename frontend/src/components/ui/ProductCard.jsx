import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '../../store/wishlistSlice'
import toast from 'react-hot-toast'

const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600 fill-current'}`}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
    {count > 0 && <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>}
  </div>
)

// Beautiful gradient fallback based on product category/name
const getCategoryStyle = (product) => {
  const name = (product.name || '').toLowerCase()
  if (name.includes('vermi') || name.includes('compost') || name.includes('fym'))
    return { bg: 'from-amber-800 to-yellow-700', emoji: '🪱', label: 'Organic Compost' }
  if (name.includes('jeevamrutha') || name.includes('panchagavya'))
    return { bg: 'from-yellow-600 to-amber-500', emoji: '🐄', label: 'Natural Input' }
  if (name.includes('neem cake'))
    return { bg: 'from-green-800 to-green-600', emoji: '🌿', label: 'Neem Cake' }
  if (name.includes('neem oil'))
    return { bg: 'from-lime-600 to-green-500', emoji: '🫙', label: 'Neem Oil' }
  if (name.includes('azospirillum') || name.includes('psb') || name.includes('rhizobium') || name.includes('phospho'))
    return { bg: 'from-teal-700 to-cyan-600', emoji: '🦠', label: 'Bio-Fertilizer' }
  if (name.includes('trichoderma') || name.includes('beauveria') || name.includes('pseudomonas') || name.includes('bacillus'))
    return { bg: 'from-emerald-700 to-teal-600', emoji: '🌺', label: 'Bio-Pesticide' }
  if (name.includes('npk') || name.includes('humic') || name.includes('fulvic'))
    return { bg: 'from-blue-700 to-indigo-600', emoji: '💎', label: 'Soil Nutrient' }
  if (name.includes('urea'))
    return { bg: 'from-gray-600 to-slate-500', emoji: '🎒', label: 'Urea Fertilizer' }
  if (name.includes('dap') || name.includes('diammonium'))
    return { bg: 'from-stone-600 to-amber-700', emoji: '🎒', label: 'DAP Fertilizer' }
  if (name.includes('chlorpyrifos') || name.includes('imidacloprid') || name.includes('thiamethoxam') ||
      name.includes('emamectin') || name.includes('profenofos') || name.includes('lambda') ||
      name.includes('spinosad') || name.includes('acetamiprid') || name.includes('insecticide'))
    return { bg: 'from-orange-700 to-red-600', emoji: '🧪', label: 'Insecticide' }
  if (name.includes('carbendazim') || name.includes('mancozeb') || name.includes('tricyclazole') ||
      name.includes('copper') || name.includes('propiconazole') || name.includes('hexaconazole') ||
      name.includes('ridomil') || name.includes('metalaxyl') || name.includes('fungicide'))
    return { bg: 'from-blue-800 to-purple-700', emoji: '🍄', label: 'Fungicide' }
  if (name.includes('glyphosate') || name.includes('butachlor') || name.includes('atrazine') ||
      name.includes('pendimethalin') || name.includes('herbicide') || name.includes('2,4-d'))
    return { bg: 'from-red-700 to-orange-600', emoji: '🌾', label: 'Herbicide' }
  if (name.includes('rkvy') || name.includes('pmfby') || name.includes('soil health') || name.includes('raita'))
    return { bg: 'from-indigo-700 to-blue-600', emoji: '🏛️', label: 'Govt Scheme' }
  return { bg: 'from-green-700 to-emerald-600', emoji: '🌱', label: 'Agri Product' }
}

const ProductImageFallback = ({ product }) => {
  const style = getCategoryStyle(product)
  const shortName = product.name?.replace(/\(.*?\)/g, '').trim().slice(0, 40) || 'Product'
  return (
    <div className={`w-full h-full bg-gradient-to-br ${style.bg} flex flex-col items-center justify-center gap-2 p-4`}>
      <div className="text-5xl drop-shadow-lg">{style.emoji}</div>
      <div className="text-center">
        <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">{style.label}</div>
        <div className="text-white font-bold text-sm leading-tight text-center line-clamp-3 drop-shadow">{shortName}</div>
      </div>
    </div>
  )
}

export default function ProductCard({ product, index = 0 }) {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wishlistItems = useSelector((s) => s.wishlist.items)
  const [addingToCart, setAddingToCart] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item) === product._id
  )

  const effectivePrice = product.discountedPrice || product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0

  const imageUrl = product.images?.[0]?.url || ''
  const showFallback = imgError || !imageUrl

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart', { duration: 3000, icon: '🔐' })
      window.dispatchEvent(new CustomEvent('agromart:unauthorized'))
      return
    }
    if (product.stock <= 0) {
      toast.error('Out of stock')
      return
    }

    setAddingToCart(true)
    const success = await addToCart(product._id, 1)
    setAddingToCart(false)

    if (success !== false) {
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>✅ Added to cart!</span>
            <button
              onClick={() => { toast.dismiss(t.id); navigate('/cart') }}
              className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg font-semibold"
            >
              View Cart →
            </button>
          </div>
        ),
        { duration: 4000 }
      )
    }
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    dispatch(toggleWishlist(product._id))
    toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/products/${product.slug || product._id}`} className="block">
        <div className="card-hover group cursor-pointer">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Image or beautiful gradient fallback */}
            {showFallback ? (
              <ProductImageFallback product={product} />
            ) : (
              <img
                src={imageUrl}
                alt={product.name}
                className="product-img"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            )}

            {/* Overlay badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {hasDiscount && (
                <span className="badge bg-red-500 text-white font-bold text-xs px-2 py-0.5 rounded-lg shadow">
                  -{discountPct}%
                </span>
              )}
              {product.isOrganic && (
                <span className="badge badge-green text-xs px-2 py-0.5 rounded-lg">
                  🌿 Organic
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="badge badge-amber text-xs px-2 py-0.5 rounded-lg">
                  Only {product.stock} left
                </span>
              )}
              {product.stock === 0 && (
                <span className="badge badge-red text-xs px-2 py-0.5 rounded-lg">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              id={`wishlist-${product._id}`}
              onClick={handleWishlist}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 dark:bg-dark-card/90 text-gray-400 hover:text-red-500'
              }`}
              aria-label="Toggle wishlist"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Quick add overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                id={`quick-add-${product._id}`}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="w-full btn btn-primary btn-sm py-2 text-xs shadow-green"
              >
                {addingToCart ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1 uppercase tracking-wide">
              {product.brand || 'AgroMart'}
            </p>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>

            <StarRating rating={product.ratings?.average || 0} count={product.ratings?.count || 0} />

            {/* Price */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{effectivePrice}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">/{product.unit}</span>
            </div>

            {/* Delivery tag */}
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-500 text-xs">⚡</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.deliveryTime || '2-3 hrs'} delivery
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
