import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productAPI, categoryAPI } from '../api/cartAPI'

// ─── Async Thunks ─────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await productAPI.getProducts(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products')
  }
})

export const fetchProduct = createAsyncThunk('products/fetchOne', async (identifier, { rejectWithValue }) => {
  try {
    const { data } = await productAPI.getProduct(identifier)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found')
  }
})

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await productAPI.getFeatured()
    return data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured products')
  }
})

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await categoryAPI.getCategoryTree()
    return data.categories
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────
const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    featuredProducts: [],
    currentProduct: null,
    relatedProducts: [],
    categories: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    productLoading: false,
    error: null,
    filters: {
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'newest',
      page: 1,
      limit: 12,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 }
    },
    setPage: (state, action) => {
      state.filters.page = action.payload
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
      state.relatedProducts = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all products
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.total = action.payload.total
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload })

    // Fetch single product
    builder
      .addCase(fetchProduct.pending, (state) => { state.productLoading = true; state.error = null })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.productLoading = false
        state.currentProduct = action.payload.product
        state.relatedProducts = action.payload.relatedProducts
      })
      .addCase(fetchProduct.rejected, (state, action) => { state.productLoading = false; state.error = action.payload })

    // Featured products
    builder
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featuredProducts = action.payload })

    // Categories
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload })
  },
})

export const { setFilters, setPage, clearCurrentProduct, clearError } = productSlice.actions
export default productSlice.reducer
