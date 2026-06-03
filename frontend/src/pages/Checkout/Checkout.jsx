import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { orderAPI, paymentAPI } from '../../api/cartAPI'
import toast from 'react-hot-toast'

const steps = ['Delivery Address', 'Payment Method', 'Order Review']

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, cartTotal, clearCart } = useCart()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || null
  )
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '', phone: user?.phone || '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India',
  })
  const [useNewAddress, setUseNewAddress] = useState(!selectedAddress)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')

  const shippingFee = cartTotal >= 499 ? 0 : 49
  const taxPrice = Math.round(cartTotal * 0.05)
  const totalPrice = cartTotal + shippingFee + taxPrice

  const shippingAddress = useNewAddress ? newAddress : selectedAddress

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    try {
      // Build order items from cart
      const items = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url || '',
        price: item.price,
        quantity: item.quantity,
      }))

      // For Razorpay: create Razorpay order first
      if (paymentMethod === 'razorpay') {
        const { data: rpData } = await paymentAPI.createRazorpayOrder({ amount: totalPrice })

        if (rpData._mock) {
          // Mock mode — place order directly
          const { data: orderData } = await orderAPI.createOrder({
            items, shippingAddress, itemsPrice: cartTotal, taxPrice, shippingPrice: shippingFee, totalPrice,
            payment: { method: 'razorpay', status: 'completed', transactionId: `mock_${Date.now()}` },
          })
          toast.success('🎉 Order placed successfully!')
          navigate(`/orders/${orderData.order._id}`)
        } else {
          // Real Razorpay checkout
          const options = {
            key: rpData.key,
            amount: rpData.order.amount,
            currency: rpData.order.currency,
            order_id: rpData.order.id,
            name: 'AgroMart',
            description: 'Agriculture Supplies Order',
            handler: async (response) => {
              const { data: orderData } = await orderAPI.createOrder({
                items, shippingAddress, itemsPrice: cartTotal, taxPrice, shippingPrice: shippingFee, totalPrice,
                payment: { method: 'razorpay', status: 'completed', razorpayOrderId: rpData.order.id, razorpayPaymentId: response.razorpay_payment_id },
              })
              await paymentAPI.verifyRazorpayPayment({ ...response, orderId: orderData.order._id })
              toast.success('🎉 Payment successful!')
              navigate(`/orders/${orderData.order._id}`)
            },
            prefill: { name: user?.name, email: user?.email, contact: user?.phone },
            theme: { color: '#16a34a' },
          }
          const rzp = new window.Razorpay(options)
          rzp.open()
        }
      } else if (paymentMethod === 'cod') {
        const { data: orderData } = await orderAPI.createOrder({
          items, shippingAddress, itemsPrice: cartTotal, taxPrice, shippingPrice: shippingFee, totalPrice,
          payment: { method: 'cod', status: 'pending' },
        })
        toast.success('🎉 Order placed! Pay on delivery.')
        navigate(`/orders/${orderData.order._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet><title>Checkout — AgroMart</title></Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

          {/* Step Indicator */}
          <div className="flex items-center mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`ml-2 text-sm hidden sm:block ${i <= step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-border'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Step Content */}
            <div className="lg:col-span-2">
              {/* Step 0: Address */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 space-y-6">
                  <h2 className="font-heading font-semibold text-gray-900 dark:text-white text-xl">Delivery Address</h2>

                  {user?.addresses?.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved Addresses</p>
                      {user.addresses.map((addr) => (
                        <label key={addr._id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          !useNewAddress && selectedAddress?._id === addr._id
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-dark-border hover:border-primary-400'
                        }`}>
                          <input type="radio" name="addr" checked={!useNewAddress && selectedAddress?._id === addr._id}
                            onChange={() => { setSelectedAddress(addr); setUseNewAddress(false) }}
                            className="mt-1 accent-primary-600"
                          />
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{addr.fullName} · {addr.label}</p>
                            <p className="text-gray-600 dark:text-gray-400">{addr.addressLine1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                            <p className="text-gray-500">{addr.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* New address form */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input type="radio" name="addr" checked={useNewAddress} onChange={() => setUseNewAddress(true)} className="accent-primary-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add New Address</span>
                    </label>

                    {useNewAddress && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: 'fullName', label: 'Full Name', cols: 1 },
                          { name: 'phone', label: 'Phone', cols: 1 },
                          { name: 'addressLine1', label: 'Address Line 1', cols: 2 },
                          { name: 'addressLine2', label: 'Address Line 2 (optional)', cols: 2 },
                          { name: 'city', label: 'City', cols: 1 },
                          { name: 'state', label: 'State', cols: 1 },
                          { name: 'pincode', label: 'Pincode', cols: 1 },
                          { name: 'country', label: 'Country', cols: 1 },
                        ].map((field) => (
                          <div key={field.name} className={field.cols === 2 ? 'sm:col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                            <input
                              type="text"
                              value={newAddress[field.name]}
                              onChange={(e) => setNewAddress((prev) => ({ ...prev, [field.name]: e.target.value }))}
                              className="input"
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <button onClick={() => setStep(1)} className="btn btn-primary btn-lg w-full">Continue to Payment →</button>
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 space-y-6">
                  <h2 className="font-heading font-semibold text-gray-900 dark:text-white text-xl">Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { value: 'razorpay', label: '💳 Razorpay (Cards, UPI, Netbanking)', desc: 'Secure payment via Razorpay' },
                      { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                    ].map((method) => (
                      <label key={method.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-border hover:border-primary-400'
                      }`}>
                        <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value}
                          onChange={() => setPaymentMethod(method.value)} className="accent-primary-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="btn btn-ghost btn-lg flex-1">← Back</button>
                    <button onClick={() => setStep(2)} className="btn btn-primary btn-lg flex-1">Review Order →</button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 space-y-6">
                  <h2 className="font-heading font-semibold text-gray-900 dark:text-white text-xl">Review Your Order</h2>

                  {/* Delivery Address */}
                  <div className="bg-gray-50 dark:bg-dark-card/50 rounded-xl p-4">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">📍 Delivering to:</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{shippingAddress?.fullName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shippingAddress?.addressLine1}, {shippingAddress?.city}, {shippingAddress?.state} — {shippingAddress?.pincode}</p>
                    <p className="text-sm text-gray-500">{shippingAddress?.phone}</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {cart.items?.map((item) => (
                      <div key={item.product?._id} className="flex gap-3 items-center">
                        <img src={item.product?.images?.[0]?.url || 'https://placehold.co/50x50/16a34a/fff'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.product?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn btn-ghost btn-lg flex-1">← Back</button>
                    <button onClick={handlePlaceOrder} disabled={submitting} className="btn btn-primary btn-lg flex-1 shadow-green">
                      {submitting ? '⏳ Placing Order...' : '🎉 Place Order'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="card p-6 h-fit sticky top-24 space-y-4">
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between"><span>Items ({cart.items?.length})</span><span>₹{cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (5%)</span><span>₹{taxPrice}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span></div>
              </div>
              <div className="border-t border-gray-200 dark:border-dark-border pt-3">
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                  <span>Total</span><span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center">🔒 Secure Checkout</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
