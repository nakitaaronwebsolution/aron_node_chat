const express = require("express");
const router = express.Router()
const userController = require("../controller/user")
const middleware = require("../helper/middleware")
router.post("/userRegister",userController.userRegister)
router.post("/userLogin",userController.userLogin)
router.post("/uploadImage",middleware.validateUser,userController.uploadImage)
router.post("/update_user",middleware.validateUser,userController.update_user)
router.post("/delete_user",middleware.validateUser,userController.delete_user)
router.post("/changePassword",middleware.validateUser,userController.changePassword)
router.post("/forgotPassword",userController.forgotPassword)
router.post("/reset_password",middleware.validateUser,userController.reset_password)

module.exports = router