const express = require("express");
const router = express.Router()
const userController = require("../controller/user")
const middleware = require("../helper/middleware")
const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
  })
  const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
      },
  })

router.post("/userRegister",upload.single("image"),userController.userRegister)
router.post("/userLogin",userController.userLogin)
router.post("/uploadImage",middleware.validateUser,upload.single("image"),userController.uploadImage)
router.post("/update_user",middleware.validateUser,userController.update_user)
router.post("/delete_user",middleware.validateUser,userController.delete_user)
router.post("/changePassword",middleware.validateUser,userController.changePassword)
router.post("/forgotPassword",userController.forgotPassword)
router.post("/reset_password",middleware.validateUser,userController.reset_password)

module.exports = router