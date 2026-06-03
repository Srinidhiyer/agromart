const express = require('express');
const router = express.Router();
const { getDeliveryTracking, updateLocation, assignDeliveryPartner, simulateTracking } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:orderId', getDeliveryTracking);
router.get('/:orderId/simulate', simulateTracking);
router.put('/:orderId/location', authorize('delivery', 'admin'), updateLocation);
router.put('/:orderId/assign', authorize('admin'), assignDeliveryPartner);

module.exports = router;
