const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products', 'name price discountedPrice images stock unit slug ratings');

  if (!wishlist) {
    return res.status(200).json({ success: true, wishlist: { products: [] } });
  }

  res.status(200).json({ success: true, wishlist });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
  } else {
    if (wishlist.products.includes(productId)) {
      return res.status(200).json({ success: true, message: 'Product already in wishlist', wishlist });
    }
    wishlist.products.push(productId);
    await wishlist.save();
  }

  await wishlist.populate('products', 'name price discountedPrice images stock unit slug ratings');
  res.status(200).json({ success: true, message: 'Added to wishlist', wishlist });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== req.params.productId
  );
  await wishlist.save();

  await wishlist.populate('products', 'name price discountedPrice images stock unit slug ratings');
  res.status(200).json({ success: true, message: 'Removed from wishlist', wishlist });
});

// @desc    Check if a product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  const isWishlisted = wishlist
    ? wishlist.products.some((id) => id.toString() === req.params.productId)
    : false;

  res.status(200).json({ success: true, isWishlisted });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
