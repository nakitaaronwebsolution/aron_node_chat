const mongoose =require("mongoose");
let connection = () => {
    mongoose.set("strictQuery", false);
    mongoose.connect("mongodb://0.0.0.0:27017/node_ERP", {useNewUrlParser: true}).then(function (abc) {
        console.log("===============Connection created=================")
    }).catch(function (err) {
        console.log("err=",err);
    })
}
module.exports = {
    connection
};
