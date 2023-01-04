const express = require("express");
const router = express.Router()
const chatController = require("../controller/chat")
const middleware = require("../helper/middleware")

const path = require("path")
const multer = require("multer");
const { route } = require("./user");


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
router.post("/createChat",middleware.validateUser,chatController.createChat)
router.get("/getAllChat",middleware.validateUser,chatController.getAllChat)
router.post("/createMessage",middleware.validateUser,upload.single('attachement'),chatController.createMessage)
router.post("/getMessage",middleware.validateUser,chatController.getMessage)
router.post("/search",middleware.validateUser,chatController.search)
router.post("/reply_to_thread",middleware.validateUser,upload.single('attachement'),chatController.reply_to_thread)
router.post("/get_thread",middleware.validateUser,chatController.get_thread)
module.exports = router