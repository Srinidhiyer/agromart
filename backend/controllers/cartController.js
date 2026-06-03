const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name price discountedPrice images stock unit isActive slug',
    });

  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: { items: [], totalItems: 0, subtotal: 0, total: 0 },
    });
  }

  // Remove items for products that became inactive or out of stock
  const validItems = cart.items.filter(
    (item) => item.product && item.product.isActive && item.product.stock > 0
  );

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  res.status(200).json({ success: true, cart });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available`);
  }

  const effectivePrice = product.discountedPrice || product.price;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity, price: effectivePrice }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        res.status(400);
        throw new Error(`Cannot add more — only ${product.stock} units available`);
      }
      existingItem.quantity = newQty;
      existingItem.price = effectivePrice; // update price snapshot
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity, price: effectivePrice });
    }

    await cart.save();
  }

  await cart.populate({
    path: 'items.product',
    select: 'name price discountedPrice images stock unit slug',
  });

  res.status(200).json({ success: true, message: 'Item added to cart', cart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  item.quantity = quantity;
  item.price = product.discountedPrice || product.price;
  await cart.save();

  await cart.populate({ path: 'items.product', select: 'name price discountedPrice images stock unit slug' });
  res.status(200).json({ success: true, message: 'Cart updated', cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();

  await cart.populate({ path: 'items.product', select: 'name price discountedPrice images stock unit slug' });
  res.status(200).json({ success: true, message: 'Item removed from cart', cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], discount: 0, couponCode: null }
  );
  res.status(200).json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
