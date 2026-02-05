const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
    createShift,
    getShifts
} = require('../controllers/shift.controller');

router.use(protect); // All routes are protected

router.route('/')
    .get(authorize('MANAGER'), getShifts) // PRD says Manager only for Get All Shifts
    // Actually PRD 4.2.2: View All Shifts (MANAGER only).
    .post(authorize('MANAGER'), createShift);

module.exports = router;
