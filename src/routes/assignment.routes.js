const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
    assignShift,
    getAllAssignments
} = require('../controllers/assignment.controller');

router.use(protect);

router.post('/', authorize('MANAGER'), assignShift);
router.get('/', authorize('MANAGER'), getAllAssignments);

module.exports = router;
