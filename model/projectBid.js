const mongoose = require('mongoose');

const ProjectBidSchema = mongoose.Schema({
    name:{ type: String, require: true, default: "" },
    title: { type: String, require: true , default: "" },
    discription: { type: String, require: true , default: "" },
    attachement:[{ type: String, default: [] }],
    text: { type: String, require: true, default: ""  },
    price: { type: String },
    cretatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    projectmanager:{ type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadLine: { type: String },
    status:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('projectBid', ProjectBidSchema);