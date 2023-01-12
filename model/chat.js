const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
   users :[{type: mongoose.Schema.Types.ObjectId, ref: "user"}],
   type: { type : String,enum : ["one_to_one","group"],required: true},
   description : { type : String,},
   chat_type :{type : String,enum : ["public","private"],default : "public"},
   name :{type : String,},
   status : {type : Boolean},
   created_by:{type: mongoose.Schema.Types.ObjectId,ref: "user"},
});

const chat = mongoose.model("chat", chatSchema);

module.exports = chat;