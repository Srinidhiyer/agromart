import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, loading } = useCart()

  const shippingFee = cartTotal >= 499 ? 0 : 49
  const total = cartTotal + shippingFee

  if (!cart.items?.length) {
    return (
      <>
        <Helmet><title>Cart — AgroMart</title></Helmet>
        <div className="min-h-screen bg-gray-50 dark:bg-dark pt-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started!</p>
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet><title>Cart ({cartCount}) — AgroMart</title></Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Shopping Cart <span className="text-gray-400 text-xl">({cartCount} items)</span>
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.items?.map((item) => (
                  <motion.div
                    key={item._id || item.product?._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="card p-4"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link to={`/products/${item.product?.slug || item.product?._id}`}>
                        <img
                          src={item.product?.images?.[0]?.url || 'https://placehold.co/80x80/16a34a/fff?text=Agro'}
                          alt={item.product?.name}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product?.slug || item.product?._id}`}
                          className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 line-clamp-2 text-sm"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">
                          ₹{item.price}/{item.product?.unit}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-2 border border-gray-300 dark:border-dark-border rounded-lg p-0.5">
                            <button
                              onClick={() => {
                                if (item.quantity <= 1) removeFromCart(item.product?._id)
                                else updateQuantity(item.product?._id, item.quantity - 1)
                              }}
                              className="qty-btn"
                            >−</button>
                            <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                              disabled={item.quantity >= item.product?.stock}
                              className="qty-btn"
                            >+</button>
                          </div>

                          {/* Line total */}
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.product?._id)}
                              className="text-xs text-red-500 hover:text-red-700 mt-0.5"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24 space-y-4">
                <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-lg">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-xs text-primary-600">
                      Add ₹{499 - cartTotal} more for free delivery!
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-dark-border pt-3">
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  id="checkout-btn"
                  onClick={() => navigate('/checkout')}
                  className="w-full btn btn-primary btn-lg shadow-green"
                >
                  Proceed to Checkout →
                </button>

                <Link to="/products" className="block text-center text-sm text-primary-600 hover:text-primary-700">
                  ← Continue Shopping
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100 dark:border-dark-border">
                  {['🔒 Secure', '📦 Fast Delivery', '↩️ Easy Returns'].map((b) => (
                    <span key={b} className="text-xs text-gray-400">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
