import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct, clearCurrentProduct } from '../../store/productSlice'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { toggleWishlist } from '../../store/wishlistSlice'
import { reviewAPI } from '../../api/cartAPI'
import ProductCard from '../../components/ui/ProductCard'
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton'
import toast from 'react-hot-toast'

function ImageGallery({ images, name }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const imgs = images?.length ? images : [{ url: 'https://placehold.co/600x400/16a34a/ffffff?text=AgroMart' }]

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-card">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={imgs[activeIdx]?.url}
            alt={name}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIdx
                  ? 'border-primary-600 shadow-green'
                  : 'border-gray-200 dark:border-dark-border hover:border-primary-400'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StarRating({ rating, count, interactive = false, onChange }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 transition-colors ${
                star <= (hover || rating) ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600 fill-current'
              }`}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">({count} reviews)</span>
      )}
    </div>
  )
}

function ReviewForm({ productId, onReviewAdded }) {
  const { isAuthenticated } = useAuth()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) { toast.error('Please write a comment'); return }
    setSubmitting(true)
    try {
      await reviewAPI.createReview({ product: productId, rating, title, comment })
      toast.success('Review submitted! 🌟')
      setRating(5); setTitle(''); setComment('')
      onReviewAdded()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Login to write a review</p>
        <Link to="/login" className="btn btn-primary btn-md">Login</Link>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Your Rating</label>
          <StarRating rating={rating} interactive onChange={setRating} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="input"
            maxLength={100}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience..."
            className="input min-h-24 resize-none"
            maxLength={500}
            required
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
        </div>
        <button type="submit" disabled={submitting} className="btn btn-primary btn-md w-full">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

export default function ProductDetail() {
  const { identifier } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentProduct: product, relatedProducts, productLoading } = useSelector((s) => s.products)
  const wishlistItems = useSelector((s) => s.wishlist.items)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [reviews, setReviews] = useState([])
  const [addingToCart, setAddingToCart] = useState(false)

  const isWishlisted = wishlistItems.some((item) => (item._id || item) === product?._id)

  useEffect(() => {
    dispatch(fetchProduct(identifier))
    return () => dispatch(clearCurrentProduct())
  }, [identifier, dispatch])

  useEffect(() => {
    if (product?._id) loadReviews()
  }, [product?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviews = async () => {
    try {
      const { data } = await reviewAPI.getProductReviews(product._id)
      setReviews(data.reviews)
    } catch { /* silent */ }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return }
    setAddingToCart(true)
    await addToCart(product._id, quantity)
    setAddingToCart(false)
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return }
    await addToCart(product._id, quantity)
    navigate('/checkout')
  }

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              {[80, 60, 40, 40, 60, 100].map((w, i) => (
                <div key={i} className={`skeleton h-4 rounded w-${w}/100`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl mb-4">🌾</p>
        <p className="text-gray-500">Product not found</p>
        <Link to="/products" className="btn btn-primary btn-md mt-4">Browse Products</Link>
      </div>
    </div>
  )

  const effectivePrice = product.discountedPrice || product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

  return (
    <>
      <Helmet>
        <title>{product.metaTitle || `${product.name} — AgroMart`}</title>
        <meta name="description" content={product.metaDescription || product.shortDescription} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span>›</span>
            <Link to="/products" className="hover:text-primary-600">Products</Link>
            <span>›</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Product Details */}
          <div className="grid lg:grid-cols-2 gap-10 mb-12">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <ImageGallery images={product.images} name={product.name} />
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.isOrganic && <span className="badge badge-green">🌿 Certified Organic</span>}
                {product.brand && <span className="badge badge-gray">{product.brand}</span>}
                {product.stock <= 5 && product.stock > 0 && <span className="badge badge-amber">⚡ Only {product.stock} left</span>}
                {product.stock === 0 && <span className="badge badge-red">Out of Stock</span>}
              </div>

              <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              <StarRating rating={product.ratings?.average || 0} count={product.ratings?.count || 0} />

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.shortDescription || product.description?.slice(0, 200)}
              </p>

              {/* Price */}
              <div className="flex items-end gap-3 py-2">
                <span className="font-heading text-4xl font-bold text-gray-900 dark:text-white">
                  ₹{effectivePrice}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                    <span className="badge bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
                <span className="text-gray-500">/{product.unit}</span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qty:</span>
                <div className="flex items-center gap-2 border border-gray-300 dark:border-dark-border rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="qty-btn"
                    disabled={quantity <= 1}
                  >−</button>
                  <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="qty-btn"
                    disabled={quantity >= product.stock}
                  >+</button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} available</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex-1 btn btn-outline btn-lg"
                >
                  {addingToCart ? '...' : '🛒 Add to Cart'}
                </button>
                <button
                  id="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 btn btn-primary btn-lg shadow-green"
                >
                  ⚡ Buy Now
                </button>
                <button
                  onClick={() => { if (!isAuthenticated) { toast.error('Login to wishlist'); return }; dispatch(toggleWishlist(product._id)); toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist') }}
                  className={`btn btn-sm p-3 border-2 rounded-xl ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-dark-border text-gray-500'}`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Delivery info */}
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 space-y-2">
                {[
                  { icon: '⚡', text: `${product.deliveryTime || '2-3 hours'} doorstep delivery` },
                  { icon: '🔒', text: 'Secure payment — Razorpay & Stripe' },
                  { icon: '↩️', text: '7-day easy return policy' },
                ].map((info) => (
                  <div key={info.icon} className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300">
                    <span>{info.icon}</span>
                    <span>{info.text}</span>
                  </div>
                ))}
              </div>

              {/* SKU */}
              <p className="text-xs text-gray-400">SKU: {product.sku}</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="card mb-10">
            <div className="flex border-b border-gray-200 dark:border-dark-border overflow-x-auto scrollbar-hide">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab} {tab === 'reviews' && `(${reviews.length})`}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose prose-green dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              )}
              {activeTab === 'specifications' && (
                <div>
                  {product.specifications?.length ? (
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                        {product.specifications.map((spec) => (
                          <tr key={spec.key}>
                            <td className="py-3 pr-6 font-medium text-gray-700 dark:text-gray-300 w-40">{spec.key}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No specifications available.</p>
                  )}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="flex items-start gap-8 p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-900 dark:text-white">{product.ratings?.average || 0}</p>
                      <StarRating rating={product.ratings?.average || 0} />
                      <p className="text-xs text-gray-500 mt-1">{product.ratings?.count || 0} reviews</p>
                    </div>
                  </div>

                  {/* Review Form */}
                  <ReviewForm productId={product._id} onReviewAdded={loadReviews} />

                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 dark:border-dark-border pb-4">
                          <div className="flex items-start gap-3">
                            <img src={review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${review.user?.name}&background=16a34a&color=fff`} alt="" className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{review.user?.name}</span>
                                {review.isVerifiedPurchase && <span className="badge badge-green text-xs">✓ Verified Purchase</span>}
                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              <StarRating rating={review.rating} />
                              {review.title && <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mt-1">{review.title}</p>}
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {relatedProducts.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
