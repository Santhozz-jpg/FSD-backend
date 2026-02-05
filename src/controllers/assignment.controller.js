const Assignment = require('../models/Assignment');
const Shift = require('../models/Shift');
const User = require('../models/User');

// @desc    Assign shift to staff
// @route   POST /api/assignments
// @access  Private (Manager)
exports.assignShift = async (req, res, next) => {
    try {
        const { shift_id, staff_id } = req.body;

        // 1. Check if shift exists
        const shift = await Shift.findById(shift_id);
        if (!shift) {
            return res.status(404).json({ success: false, message: 'Shift not found' });
        }

        // 2. Check if staff exists
        const staff = await User.findById(staff_id);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        // 3. Check for overlapping shifts for this staff
        // Find all assignments for this staff
        // Note: In Mongoose, we can't easily JOIN and filter in one query for this efficiently without aggregation.
        // We will fetch staff's assignments and filter in code (dataset is small).
        // Or better, find assignments where staff_id matches, populate shift, and check.

        const existingAssignments = await Assignment.find({ staff_id }).populate('shift_id');

        for (const assignment of existingAssignments) {
            const assignedShift = assignment.shift_id;
            if (assignedShift) {
                // Check overlap: (StartA < EndB) and (EndA > StartB)
                // assignedShift (A), newShift (B)
                const startA = new Date(assignedShift.start_time).getTime();
                const endA = new Date(assignedShift.end_time).getTime();
                const startB = new Date(shift.start_time).getTime();
                const endB = new Date(shift.end_time).getTime();

                if (startA < endB && endA > startB) {
                    return res.status(400).json({
                        success: false,
                        message: 'Staff member is already assigned to a shift during this time',
                        conflicting_shift: assignedShift
                    });
                }
            }
        }

        // 4. Create Assignment
        const assignment = await Assignment.create({
            shift_id,
            staff_id,
            assigned_by: req.user.id
        });

        res.status(201).json({
            success: true,
            assignment
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private (Manager)
exports.getAllAssignments = async (req, res, next) => {
    try {
        const assignments = await Assignment.find()
            .populate('shift_id')
            .populate('staff_id', 'full_name email')
            .populate('assigned_by', 'full_name');

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my assigned shifts (Staff)
// @route   GET /api/staff/shifts
// @access  Private (Staff)
exports.getMyShifts = async (req, res, next) => {
    try {
        const assignments = await Assignment.find({ staff_id: req.user.id })
            .populate('shift_id');

        const shifts = assignments
            .map(a => a.shift_id)
            .filter(s => s != null) // Filter out deleted shifts
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        res.status(200).json({
            success: true,
            count: shifts.length,
            shifts
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all staff (helper for frontend)
// @route   GET /api/staff
exports.getStaff = async (req, res, next) => {
    try {
        const staff = await User.find({ role: 'STAFF' }).select('full_name email');

        // Mongoose _id to id mapping is automatic usually in JSON, but explicit map is safe
        const formattedStaff = staff.map(s => ({
            id: s._id,
            full_name: s.full_name,
            email: s.email
        }));

        res.status(200).json({
            success: true,
            count: staff.length,
            staff: formattedStaff
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteAssignment = async (req, res, next) => {
    res.status(501).json({ message: 'Not Implemented' });
};
