const Shift = require('../models/Shift');
const User = require('../models/User');

// @desc    Create new shift
// @route   POST /api/shifts
// @access  Private (Manager)
exports.createShift = async (req, res, next) => {
    try {
        const { title, start_time, end_time, description } = req.body;

        const shift = await Shift.create({
            title,
            start_time,
            end_time,
            description,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            shift
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private (Manager)
exports.getShifts = async (req, res, next) => {
    try {
        const shifts = await Shift.find()
            .populate('created_by', 'full_name email')
            .sort({ start_time: 1 });

        res.status(200).json({
            success: true,
            count: shifts.length,
            shifts
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single shift
// @route   GET /api/shifts/:id
// @access  Private
exports.getShiftById = async (req, res, next) => {
    try {
        const shift = await Shift.findById(req.params.id);

        if (!shift) {
            return res.status(404).json({ success: false, message: 'Shift not found' });
        }

        res.status(200).json({
            success: true,
            shift
        });
    } catch (err) {
        next(err);
    }
};
