const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, createStripePaymentIntent, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Stripe webhook must receive raw body
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.use(protect);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.post('/stripe/create-intent', createStripePaymentIntent);

module.exports = router;
