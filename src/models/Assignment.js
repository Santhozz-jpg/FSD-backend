const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    shift_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        required: true,
        index: true
    },
    staff_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    assigned_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assigned_at: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index to prevent duplicate assignments of same shift to same staff
AssignmentSchema.index({ shift_id: 1, staff_id: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
