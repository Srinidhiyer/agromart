const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },     // snapshot
  image: { type: String, required: true },    // snapshot
  price: { type: Number, required: true },    // snapshot
  quantity: { type: Number, required: true, min: 1 },
}, { _id: true });

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  coordinates: { lat: Number, lng: Number },
}, { _id: false });

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['razorpay', 'stripe', 'cod', 'wallet'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  stripePaymentIntentId: String,
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number,
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [(v) => v.length > 0, 'Order must have at least one item'],
  },
  shippingAddress: { type: shippingAddressSchema, required: true },
  payment: { type: paymentInfoSchema, required: true },
  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  couponCode: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  timeline: [timelineEventSchema],
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  notes: { type: String },
}, {
  timestamps: true,
});

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `AGM-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }

  // Auto-add initial timeline event
  if (this.isNew) {
    this.timeline = [{
      status: 'pending',
      message: 'Order placed successfully',
      timestamp: new Date(),
    }];
  }

  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
