const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { getMyShifts, getStaff } = require('../controllers/assignment.controller');

router.use(protect);

// @route   GET /api/staff/shifts
// @desc    Get own assigned shifts
// @access  Private (Staff)
router.get('/shifts', getMyShifts);

// @route   GET /api/staff
// @desc    Get all staff members
// @access  Private (Manager)
router.get('/', authorize('MANAGER'), getStaff);

module.exports = router;
