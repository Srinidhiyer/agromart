const asyncHandler = require('express-async-handler');
const DeliveryTracking = require('../models/DeliveryTracking');
const Order = require('../models/Order');

// @desc    Get delivery tracking for an order
// @route   GET /api/delivery/:orderId
// @access  Private
const getDeliveryTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify ownership
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this tracking');
  }

  const tracking = await DeliveryTracking.findOne({ order: orderId })
    .populate('deliveryPartner', 'name phone avatar');

  if (!tracking) {
    res.status(404);
    throw new Error('Tracking information not found');
  }

  res.status(200).json({ success: true, tracking, order: { status: order.status, timeline: order.timeline, estimatedDelivery: order.estimatedDelivery } });
});

// @desc    Update delivery partner location (delivery partner app)
// @route   PUT /api/delivery/:orderId/location
// @access  Private (delivery partner)
const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng, address } = req.body;
  const { orderId } = req.params;

  const locationUpdate = { lat, lng, address, timestamp: new Date() };

  const tracking = await DeliveryTracking.findOneAndUpdate(
    { order: orderId },
    {
      currentLocation: locationUpdate,
      $push: { locationHistory: locationUpdate },
    },
    { new: true }
  );

  if (!tracking) {
    res.status(404);
    throw new Error('Tracking record not found');
  }

  res.status(200).json({ success: true, tracking });
});

// @desc    Assign delivery partner (admin)
// @route   PUT /api/delivery/:orderId/assign
// @access  Admin
const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { deliveryPartnerId, deliveryPartnerName, deliveryPartnerPhone, vehicleNumber } = req.body;

  const tracking = await DeliveryTracking.findOneAndUpdate(
    { order: req.params.orderId },
    {
      deliveryPartner: deliveryPartnerId,
      deliveryPartnerName,
      deliveryPartnerPhone,
      vehicleNumber,
      status: 'out_for_delivery',
    },
    { new: true }
  );

  if (!tracking) {
    res.status(404);
    throw new Error('Tracking record not found');
  }

  // Update order status
  await Order.findByIdAndUpdate(req.params.orderId, {
    status: 'out_for_delivery',
    $push: {
      timeline: {
        status: 'out_for_delivery',
        message: `Your order is out for delivery with ${deliveryPartnerName}`,
        timestamp: new Date(),
      },
    },
  });

  res.status(200).json({ success: true, message: 'Delivery partner assigned', tracking });
});

// @desc    Simulate delivery tracking animation (mock GPS for demo)
// @route   GET /api/delivery/:orderId/simulate
// @access  Private
const simulateTracking = asyncHandler(async (req, res) => {
  // Returns mock GPS waypoints for map animation demo
  const mockRoute = [
    { lat: 28.6139, lng: 77.2090, address: 'Warehouse — New Delhi', time: 0 },
    { lat: 28.6200, lng: 77.2200, address: 'On the way', time: 300 },
    { lat: 28.6280, lng: 77.2350, address: 'Near destination', time: 600 },
    { lat: 28.6350, lng: 77.2500, address: 'Arriving soon', time: 900 },
  ];

  res.status(200).json({ success: true, route: mockRoute });
});

module.exports = { getDeliveryTracking, updateLocation, assignDeliveryPartner, simulateTracking };
