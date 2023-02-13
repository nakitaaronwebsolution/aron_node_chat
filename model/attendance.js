const mongoose = require('mongoose');

const AttendanceSchema = mongoose.Schema({
    cretatedBy:{ type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    date: { type: String },
    extraLeave: { type: String, enum: ["shortLeave","halfDay", "none"], default: "none" },
    totalHr: { type: Number, default: 0 },
    totalMin: { type: Number, default: 0 },
    status:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('attendance', AttendanceSchema);