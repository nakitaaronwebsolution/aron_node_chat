const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    message: { type: String },
    send_date: { type: Date, default: new Date(), required: true },
    users: { type:Array },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
    thread_count: { type: Number, default: 0 },
    attachement: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    socketId: { type: String },
    status: { type: Boolean },

});

const message = mongoose.model("message", messageSchema);

module.exports = message;