const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    users:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: { type: String, require: true },
    cretatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('team', teamSchema);