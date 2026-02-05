const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const User = require('../models/User');

// @desc    Get all staff members
// @route   GET /api/users/staff
// @access  Private/Manager
router.get('/staff', protect, authorize('MANAGER'), async (req, res) => {
    try {
        const staff = await User.find({ role: 'STAFF' }).select('-password');
        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
