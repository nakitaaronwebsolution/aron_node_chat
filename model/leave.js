const mongoose = require('mongoose');

const LeavesSchema = mongoose.Schema({
    employeName:{ type: String, require: true, default: "" },
    employeId: { type: String, require: true , default: "" },
    leaveType: { type: String, enum: ['HalfDay','FullDay','ShortLeave'], default: "FullDay" },
    fromDate:{ type: String, default: ""},
    toDate:{ type: String, default: ""},
    numberOfDays:{ type: Number, default: 1},
    reason: { type: String, require: true, default: ""  },
    userId:{ type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy:{ type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:  { type: String, enum: ['Approved','Pending','Rejected'], default: "Pending" }
}, {
    timestamps: true
});

module.exports = mongoose.model('leaves', LeavesSchema);