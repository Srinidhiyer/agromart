const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Create product review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment } = req.body;

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ product, user: req.user._id });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  // Check if user has purchased this product (verified purchase)
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.product': product,
    status: 'delivered',
  });

  const review = await Review.create({
    product,
    user: req.user._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, message: 'Review submitted', review });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { product: req.params.productId, isApproved: true };
  if (req.query.rating) query.rating = parseInt(req.query.rating);

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(query),
  ]);

  // Calculate rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    reviews,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    distribution,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (owner only)
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;

  await review.save();
  res.status(200).json({ success: true, message: 'Review updated', review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (owner or admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();

  // Trigger rating recalculation
  await Review.updateProductRating(productId);

  res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = { createReview, getProductReviews, updateReview, deleteReview };
