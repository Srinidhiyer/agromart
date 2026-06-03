const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const Stripe = require('stripe');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize payment gateways (use dummy keys as fallback to prevent crash on startup if not configured)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// ─── RAZORPAY ─────────────────────────────────────────────────────────────────

// @desc    Create Razorpay order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderId } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  const options = {
    amount: Math.round(amount * 100), // convert to paise
    currency,
    receipt: `agm_receipt_${orderId || Date.now()}`,
    notes: { orderId, userId: req.user._id.toString() },
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    // If Razorpay keys not configured, return mock response for development
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        order: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency,
          receipt: `agm_receipt_${Date.now()}`,
        },
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
        _mock: true,
      });
    } else {
      res.status(500);
      throw new Error(`Payment gateway error: ${err.message}`);
    }
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  // In mock mode, skip signature verification
  if (razorpay_order_id?.startsWith('order_mock_')) {
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'payment.status': 'completed',
        'payment.transactionId': razorpay_payment_id || 'mock_payment',
        'payment.razorpayOrderId': razorpay_order_id,
        'payment.paidAt': new Date(),
      });
    }
    return res.status(200).json({ success: true, message: 'Payment verified (mock)' });
  }

  // Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed — invalid signature');
  }

  // Update order payment status
  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'completed',
      'payment.razorpayOrderId': razorpay_order_id,
      'payment.razorpayPaymentId': razorpay_payment_id,
      'payment.razorpaySignature': razorpay_signature,
      'payment.paidAt': new Date(),
    });
  }

  res.status(200).json({ success: true, message: 'Payment verified successfully' });
});

// ─── STRIPE ───────────────────────────────────────────────────────────────────

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private
const createStripePaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'inr', orderId } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId: orderId || '', userId: req.user._id.toString() },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        clientSecret: `pi_mock_${Date.now()}_secret_mock`,
        paymentIntentId: `pi_mock_${Date.now()}`,
        _mock: true,
      });
    } else {
      res.status(500);
      throw new Error(`Stripe error: ${err.message}`);
    }
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/stripe/webhook
// @access  Public (Stripe signed)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400);
    throw new Error(`Stripe webhook error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { orderId } = paymentIntent.metadata;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'payment.status': 'completed',
        'payment.stripePaymentIntentId': paymentIntent.id,
        'payment.paidAt': new Date(),
      });
    }
  }

  res.status(200).json({ received: true });
});

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripePaymentIntent,
  stripeWebhook,
};
