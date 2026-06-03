const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

module.exports = router;
