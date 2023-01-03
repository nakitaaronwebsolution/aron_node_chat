const express = require("express");
const router = express.Router()
const userController = require("../controller/user")
const middleware = require("../helper/middleware")

router.post("/createChat",middleware.validateUser,userController.createChat)
router.get("/getAllChat",middleware.validateUser,userController.getAllChat)
module.exports = router