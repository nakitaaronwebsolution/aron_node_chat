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
const router = require("./routes/index")
app.use("/v1",router);
app.use('/',require("./routes/index"))





app.listen(4003,async (err)=>{
    if(err){
        return console.log(err);
    }
    console.log('Server is up and running on port 4003')
    connection.connection()
})