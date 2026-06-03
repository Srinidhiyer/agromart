import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { wishlistAPI } from '../api/cartAPI'

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await wishlistAPI.getWishlist()
    return data.wishlist?.products || []
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { getState, rejectWithValue }) => {
  try {
    const { wishlist } = getState()
    const isWishlisted = wishlist.items.some((p) => p._id === productId || p === productId)

    if (isWishlisted) {
      await wishlistAPI.removeFromWishlist(productId)
      return { productId, action: 'remove' }
    } else {
      await wishlistAPI.addToWishlist(productId)
      return { productId, action: 'add' }
    }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => { state.items = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, action: act } = action.payload
        if (act === 'remove') {
          state.items = state.items.filter((p) => (p._id || p) !== productId)
        } else {
          state.items = [...state.items, productId]
        }
      })
  },
})

export const { clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
