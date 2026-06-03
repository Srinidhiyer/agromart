const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// ─── Helper: build query filters ──────────────────────────────────────────────
const buildProductQuery = (queryParams) => {
  const {
    keyword, categoryId, minPrice, maxPrice,
    rating, isOrganic, isFeatured, inStock,
  } = queryParams;

  const query = { isActive: { $ne: false } };

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (categoryId) {
    query.category = categoryId;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) {
    query['ratings.average'] = { $gte: Number(rating) };
  }
  if (isOrganic === 'true') query.isOrganic = true;
  if (isFeatured === 'true') query.isFeatured = true;
  if (inStock === 'true') query.stock = { $gt: 0 };

  return query;
};

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);
  const skip = (page - 1) * limit;

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { 'ratings.average': -1 },
    popular: { numReviews: -1 },
  };
  const sort = sortMap[req.query.sort] || { createdAt: -1 };

  // Resolve category slug → ObjectId
  let categoryId = null;
  if (req.query.category) {
    const cat = await Category.findOne({ slug: req.query.category }).select('_id').lean();
    if (cat) categoryId = cat._id;
  }

  const query = buildProductQuery({ ...req.query, categoryId });

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    products,
  });
});


// @desc    Get single product by slug or ID
// @route   GET /api/products/:identifier
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

  const product = await Product.findOne(
    isObjectId ? { _id: identifier } : { slug: identifier }
  )
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug');

  if (!product || product.isActive === false) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get related products
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: { $ne: false },
  })
    .limit(6)
    .select('name price discountedPrice images ratings slug unit')
    .lean();

  res.status(200).json({ success: true, product, relatedProducts });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: { $ne: false } })
    .populate('category', 'name slug')
    .limit(12)
    .lean();

  res.status(200).json({ success: true, products });
});

// @desc    Get search suggestions (autocomplete)
// @route   GET /api/products/suggestions?q=keyword
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ],
  })
    .select('name slug images price unit')
    .limit(8)
    .lean();

  res.status(200).json({ success: true, suggestions: products });
});

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };

  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    const imageUploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path, 'agromart/products'))
    );
    productData.images = imageUploads.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  }

  const product = await Product.create(productData);
  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updates = { ...req.body };

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const imageUploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path, 'agromart/products'))
    );
    const newImages = imageUploads.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    updates.images = [...(product.images || []), ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Product updated successfully', product });
});

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    await Promise.all(
      product.images
        .filter((img) => img.public_id)
        .map((img) => deleteFromCloudinary(img.public_id))
    );
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Update product stock (admin)
// @route   PATCH /api/products/:id/stock
// @access  Admin
const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({ success: true, message: 'Stock updated', product });
});

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getSearchSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
