import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../api/cartAPI'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  // Load cart when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setCart({ items: [], totalItems: 0, subtotal: 0, total: 0 })
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCart = async () => {
    try {
      setLoading(true)
      const { data } = await cartAPI.getCart()
      setCart(data.cart)
    } catch (err) {
      console.error('Cart fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const { data } = await cartAPI.addToCart({ productId, quantity })
      setCart(data.cart)
      toast.success('Added to cart! 🛒')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }, [])

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const { data } = await cartAPI.updateCart({ productId, quantity })
      setCart(data.cart)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart')
    }
  }, [])

  const removeFromCart = useCallback(async (productId) => {
    try {
      const { data } = await cartAPI.removeFromCart(productId)
      setCart(data.cart)
      toast.success('Item removed from cart')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item')
    }
  }, [])

  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clearCart()
      setCart({ items: [], totalItems: 0, subtotal: 0, total: 0 })
    } catch (err) {
      console.error('Clear cart error:', err)
    }
  }, [])

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const cartTotal = cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0

  return (
    <CartContext.Provider value={{
      cart, loading, cartCount, cartTotal,
      fetchCart, addToCart, updateQuantity, removeFromCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
