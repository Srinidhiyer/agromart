import { configureStore } from '@reduxjs/toolkit'
import productReducer from './productSlice'
import wishlistReducer from './wishlistSlice'

export const store = configureStore({
  reducer: {
    products: productReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
