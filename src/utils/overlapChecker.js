const Assignment = require('../models/Assignment');

// Check for overlapping shifts
// Overlap condition: (newStart < existingEnd) && (newEnd > existingStart)
const checkOverlap = async (staffId, newStartTime, newEndTime, excludeShiftId = null) => {
    const existingAssignments = await Assignment.find({ staffId })
        .populate('shiftId'); // Populate to get shift times

    for (const assignment of existingAssignments) {
        if (!assignment.shiftId) continue; // Skip if shift was deleted potentially

        // If we want to exclude a specific shift (e.g. update scenario), though not strictly in PRD for create
        if (excludeShiftId && assignment.shiftId._id.equals(excludeShiftId)) {
            continue;
        }

        const existingStart = new Date(assignment.shiftId.startTime).getTime();
        const existingEnd = new Date(assignment.shiftId.endTime).getTime();
        const newStart = new Date(newStartTime).getTime();
        const newEnd = new Date(newEndTime).getTime();

        if (newStart < existingEnd && newEnd > existingStart) {
            return {
                hasOverlap: true,
                conflictingShift: assignment.shiftId
            };
        }
    }

    return { hasOverlap: false };
};

module.exports = checkOverlap;
