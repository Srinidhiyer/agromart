const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;

  // Handle avatar upload
  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user.avatar.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }
    const result = await uploadToCloudinary(req.file.path, 'agromart/avatars');
    updates.avatar = { public_id: result.public_id, url: result.secure_url };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Profile updated', user });
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.addresses.length >= 5) {
    res.status(400);
    throw new Error('Maximum 5 addresses allowed');
  }

  // If new address is default, remove default from others
  if (req.body.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  // If first address, make it default
  if (user.addresses.length === 0) req.body.isDefault = true;

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({ success: true, message: 'Address updated', addresses: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );

  // Set first address as default if deleted address was default
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.status(200).json({ success: true, message: 'Address deleted', addresses: user.addresses });
});

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress };
