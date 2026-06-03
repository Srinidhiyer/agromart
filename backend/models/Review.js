const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  images: [{
    public_id: String,
    url: String,
  }],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// One review per product per user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ─── Static: update product ratings after save/remove ────────────────────────
reviewSchema.statics.updateProductRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const Product = mongoose.model('Product');
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(result[0].avgRating * 10) / 10,
      'ratings.count': result[0].count,
      numReviews: result[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
      numReviews: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.updateProductRating(this.product);
});

reviewSchema.post('remove', async function () {
  await this.constructor.updateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
