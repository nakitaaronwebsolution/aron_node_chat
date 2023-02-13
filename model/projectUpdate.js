const mongoose = require('mongoose');

const ProjectUpdateSchema = mongoose.Schema({
    massage:{ type: String, require: true, default: "" },
    attachement:[{ type: String, default: [] }],
    hours: { type: String, require: true, default: "" },
    minutes: { type: String, require: true , default: "" },
    status: { type: Boolean, default: false },
    cretatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    projectId: { type:mongoose.Schema.Types.ObjectId, ref: 'project' },
    createdAt:  { type: Date, default: new Date() }
});

module.exports = mongoose.model('projectUpdate', ProjectUpdateSchema);