const express = require("express");
const router = express.Router()

const userRouter = require("./user")
router.use("/user",  userRouter)


const chatRouter = require("./chat")
router.use("/chat", chatRouter)

module.exports = router