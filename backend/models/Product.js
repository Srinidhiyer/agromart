const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  public_id: { type: String, default: '' },
  url: { type: String, required: true },
}, { _id: false });

const specsSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative'],
    default: null,
  },
  discountPercentage: {
    type: Number,
    min: [0],
    max: [100],
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required'],
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  images: {
    type: [imageSchema],
    validate: [(v) => v.length <= 10, 'Cannot have more than 10 images'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'liter', 'ml', 'bag', 'bottle', 'pack', 'piece'],
    default: 'kg',
  },
  weight: { type: Number }, // in kg
  brand: { type: String, trim: true },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  tags: [String],
  specifications: [specsSchema],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isOrganic: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  deliveryTime: {
    type: String,
    default: '2-3 hours',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // SEO
  metaTitle: String,
  metaDescription: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Auto-generate slug ───────────────────────────────────────────────────────
productSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();
  const baseSlug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Ensure uniqueness
  let slug = baseSlug;
  let counter = 1;
  while (await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  this.slug = slug;

  // Auto-calculate discount percentage
  if (this.discountedPrice && this.price > 0) {
    this.discountPercentage = Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }

  // Auto-generate SKU if missing
  if (!this.sku) {
    this.sku = `AGM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  next();
});

// ─── Virtual: effective price ─────────────────────────────────────────────────
productSchema.virtual('effectivePrice').get(function () {
  return this.discountedPrice || this.price;
});

productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
