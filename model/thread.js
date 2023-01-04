const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
    message: {
        type: String,
    },
    send_date: {
        type: Date,
        default: new Date(),
        required: true
    },
    from_userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    messageId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message"
    },
    attachement: {
        type: String,
    },
    status: {
        type: Boolean,
        default : true
    },

});

const thread = mongoose.model("thread", threadSchema);

module.exports = thread;