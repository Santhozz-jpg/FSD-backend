const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a shift title']
    },
    start_time: {
        type: Date,
        required: [true, 'Please add a start time'],
        index: true
    },
    end_time: {
        type: Date,
        required: [true, 'Please add an end time'],
        index: true
    },
    description: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Validation to ensure endTime is after startTime
ShiftSchema.pre('validate', function (next) {
    if (this.start_time && this.end_time && this.start_time >= this.end_time) {
        this.invalidate('end_time', 'End time must be after start time');
    }
    next();
});

module.exports = mongoose.model('Shift', ShiftSchema);
