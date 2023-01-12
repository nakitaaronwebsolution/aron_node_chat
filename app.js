require('dotenv').config()
var http = require('http');
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')

const connection = require("./connection/connection")
var path = require('path');

app.use(express.json())
app.use(morgan())
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use('/images', express.static(__dirname + '/uploads'));
const router = require("./router/index")
app.use("/v1",router);
app.use('/',require("./router/index"))
// const userModel = require("./model/user")
// const messageModel = require("./model/message")

// app.use(express.static(path.join(__dirname)));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });


// var server = http.createServer(app);
// var io = require('socket.io')(server,{cors:{origin:"*"}});
// var path = require('path');
// io.on('connection', (socket) => {
//   console.log(err,"err================")
//   console.log('new user connected',socket.id);
// })

app.listen(4000,async (err)=>{
    if(err){
        return console.log(err);
    }
    console.log('Server is up and running on port 4000')
    connection.connection()
})