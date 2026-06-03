import api from './axiosInstance'

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (identifier) => api.get(`/products/${identifier}`),
  getFeatured: () => api.get('/products/featured'),
  getSuggestions: (q) => api.get('/products/suggestions', { params: { q } }),
  // Admin
  createProduct: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
}

export const categoryAPI = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategoryTree: () => api.get('/categories/tree'),
  getCategory: (identifier) => api.get(`/categories/${identifier}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCart: (data) => api.put('/cart/update', data),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
}

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  // Admin
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
}

export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
}

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  checkWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
  addToWishlist: (productId) => api.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
}

export const deliveryAPI = {
  getTracking: (orderId) => api.get(`/delivery/${orderId}`),
  simulateTracking: (orderId) => api.get(`/delivery/${orderId}/simulate`),
}

export const paymentAPI = {
  createRazorpayOrder: (data) => api.post('/payments/razorpay/create-order', data),
  verifyRazorpayPayment: (data) => api.post('/payments/razorpay/verify', data),
  createStripeIntent: (data) => api.post('/payments/stripe/create-intent', data),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
}
