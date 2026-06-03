const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number },
  address: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const deliveryTrackingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deliveryPartnerName: { type: String, default: '' },
  deliveryPartnerPhone: { type: String, default: '' },
  deliveryPartnerAvatar: { type: String, default: '' },
  vehicleNumber: { type: String, default: '' },
  currentLocation: locationSchema,
  locationHistory: [locationSchema],
  estimatedArrival: { type: Date },
  actualDelivery: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  otp: { type: String, select: false }, // delivery confirmation OTP
  otpVerified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

deliveryTrackingSchema.index({ order: 1 });

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);
