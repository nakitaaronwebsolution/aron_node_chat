const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
 username :{
    type : String,
    required : true,
 },
 
 gender: {
   type : String,
   enum : ["Female","Male"],
   required: true,
},
DOB : {
    type : String,
   required: true,   
},
phoneNumber :{
   type : String,
   required : true,
},
email:{
   type : String,
   unique : true,
   required:true,
},
 password :{
    type : String,
    required:true,
 },

 image :{
   type : String, 
   required:true,
 },
status :{
    type :Boolean,
    required : true
},
 token :{
    type : String
 }
});

const user = mongoose.model("user", userSchema);

module.exports = user;