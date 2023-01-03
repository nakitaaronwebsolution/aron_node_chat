const express = require("express");
const router = express.Router()
const userController = require("../controller/user")


const path = require("path")
const multer = require("multer")


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
router.post("/userRegister",upload.single('image'),userController.userRegister)
router.post("/userLogin",userController.UserLogin)
router.post("/uploadImage",upload.single('image'),userController.uploadImage)

module.exports = router