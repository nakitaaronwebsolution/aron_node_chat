const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name:{ type: String, require: true, default: "" },
    image:{ type: String, default: "" },
    email: { type: String, require: true , default: "" },
    password: { type: String, require: true , default: "" },
    phone: { type: String, require: true, default: ""  },
    permission: { type: String },
    employeId: { type: String ,/*require: true*/},
    teamId:{ type: mongoose.Schema.ObjectId, ref: 'team' },
    role: { type: String, default: "user", enum: ["hr","user","admin","sumAdmin","manager", "teamLead"] },
    token: { type: String },
    is_active:  { type: Boolean, default: false },
    is_deleted:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);