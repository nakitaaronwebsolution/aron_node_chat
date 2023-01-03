require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const connection = require("./connection/connection")
app.use(express.json())
app.use(morgan())
app.use(cors())
const router = require("./router/index")
app.use("/v1",router);
app.use('/',require("./router/index"))




app.listen(6000,async (err)=>{
    if(err){
        return console.log(err);
    }
    console.log('Server is up and running on port 6000')
    connection.connection()
})