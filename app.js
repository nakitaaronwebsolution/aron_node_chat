var express = require('express');
var http = require('http');
require('dotenv').config()

var app = express();
const cors = require('cors')
const morgan = require('morgan')

app.use(express.json())
app.use(morgan())
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use('/images', express.static(__dirname + '/uploads'));
const router = require("./router/index")
app.use("/v1", router);
app.use('/', require("./router/index"))
var server = http.createServer(app);
const connection = require("./connection/connection")
const UserSchema = require("./model/user")
const MessageSchema = require("./model/message")
var io = require('socket.io')(server);
var path = require('path');
const notifier = require('node-notifier');
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
var name;
io.on('connection', (socket) => {
  console.log('new user connected', socket.id);
  socket.on('joining msg', async (username) => {
    let userExist = await UserSchema.findOneAndUpdate({ username: username }, { socketId: socket.id })
    if (!userExist) {
      console.log("user not found")
    } else {
      console.log("user name exist")
    }
    name = username;
    // const username = userExist.username
    io.emit('chat message', `---${name} joined the chat---`);
  });
  socket.on('chat message', async (msg) => {
    console.log("send msg socket id", socket.id)
    let userExist = await UserSchema.findOne({ socketId: socket.id });
    console.log(userExist)
    socket.broadcast.emit('chat message', `---${msg}`);
    // notifier.notify('Message');
    notifier.notify({
      title: 'My notification',
      message: msg
    });
  });
});

server.listen(4000, async (err) => {
  if (err) {
    console.log(err)
  }
  console.log("server is run  4000")
  connection.connection()
})






