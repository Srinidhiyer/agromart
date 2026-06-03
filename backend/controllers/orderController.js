const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const DeliveryTracking = require('../models/DeliveryTracking');
const { sendEmail } = require('../utils/emailService');
const { sendSMS } = require('../utils/smsService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    items, shippingAddress, payment,
    itemsPrice, taxPrice, shippingPrice, discountAmount, totalPrice, couponCode,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Validate stock for each item
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
  }

  // Create the order
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    payment,
    itemsPrice,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    discountAmount: discountAmount || 0,
    totalPrice,
    couponCode,
    estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
  });

  // Deduct stock
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    )
  );

  // Clear user cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], discount: 0 });

  // Create delivery tracking record
  await DeliveryTracking.create({
    order: order._id,
    status: 'pending',
    estimatedArrival: order.estimatedDelivery,
  });

  // Send confirmation email (async, non-blocking)
  sendEmail({
    to: req.user.email,
    subject: `AgroMart — Order Confirmed #${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#16a34a">Order Confirmed! 🌿</h2>
        <p>Hi ${req.user.name}, your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
        <p>Total: <strong>₹${totalPrice}</strong></p>
        <p>Estimated delivery: <strong>2-3 hours</strong></p>
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Track Order</a>
      </div>
    `,
  }).catch(console.error);

  // Send SMS (non-blocking)
  if (req.user.phone) {
    sendSMS(
      req.user.phone,
      `AgroMart: Your order #${order.orderNumber} is confirmed! Total: ₹${totalPrice}. Track at ${process.env.FRONTEND_URL}/orders/${order._id}`
    ).catch(console.error);
  }

  // ── Auto-progress order like Blinkit (completes in 60s) ──────────
  const autoProgress = async (orderId) => {
    const steps = [
      { status: 'confirmed',        delay: 10000 },  // 10s
      { status: 'packed',           delay: 25000 },  // 25s
      { status: 'out_for_delivery', delay: 40000 },  // 40s
      { status: 'delivered',        delay: 60000 },  // 60s ✅ Done!
    ];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, step.delay - (steps[steps.indexOf(step) - 1]?.delay || 0)));
      await Order.findByIdAndUpdate(orderId, { status: step.status });
      console.log(`🚀 Order ${orderId} → ${step.status}`);
    }
  };
  autoProgress(order._id).catch(console.error);
  // ─────────────────────────────────────────────────────────────────

  const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: populatedOrder,
  });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    orders,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('deliveryPartner', 'name phone avatar');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Users can only see their own orders (admins see all)
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  const tracking = await DeliveryTracking.findOne({ order: order._id })
    .populate('deliveryPartner', 'name phone avatar');

  res.status(200).json({ success: true, order, tracking });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (['delivered', 'cancelled'].includes(order.status)) {
    res.status(400);
    throw new Error(`Order cannot be cancelled — current status: ${order.status}`);
  }

  if (order.status === 'out_for_delivery') {
    res.status(400);
    throw new Error('Order is already out for delivery and cannot be cancelled');
  }

  // Restore stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    )
  );

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason || 'Cancelled by user';
  order.timeline.push({
    status: 'cancelled',
    message: `Order cancelled: ${order.cancellationReason}`,
    timestamp: new Date(),
  });

  await order.save();

  res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
});

// ─── Admin Order Controllers ──────────────────────────────────────────────────

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.paymentStatus) query['payment.status'] = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    orders,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['packed', 'cancelled'],
    packed: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    res.status(400);
    throw new Error(`Cannot transition from '${order.status}' to '${status}'`);
  }

  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared',
    packed: 'Your order has been packed and is ready for dispatch',
    out_for_delivery: 'Your order is out for delivery',
    delivered: 'Your order has been delivered successfully',
    cancelled: 'Your order has been cancelled',
  };

  order.status = status;
  order.timeline.push({
    status,
    message: message || statusMessages[status],
    timestamp: new Date(),
  });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.payment.status = 'completed';
  }

  await order.save();

  // Update delivery tracking status
  await DeliveryTracking.findOneAndUpdate(
    { order: order._id },
    { status },
    { new: true }
  );

  // Send notification (non-blocking)
  sendEmail({
    to: order.user.email,
    subject: `AgroMart — Order Update #${order.orderNumber}`,
    html: `<p>Hi ${order.user.name}, your order status has been updated to: <strong>${status.replace('_', ' ').toUpperCase()}</strong></p>`,
  }).catch(console.error);

  res.status(200).json({ success: true, message: 'Order status updated', order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
