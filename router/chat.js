const express = require("express");
const router = express.Router()
const chatController = require("../controller/chat")
const middleware = require("../helper/middleware")
router.post("/createChat",middleware.validateUser,chatController.createChat)
router.get("/getAllChat",middleware.validateUser,chatController.getAllChat)
router.post("/update_Chat",middleware.validateUser,chatController.update_Chat)
router.post("/add_user",middleware.validateUser,chatController.add_user)
router.post("/delete_Chat",middleware.validateUser,chatController.delete_Chat)

router.post("/createMessage",middleware.validateUser,chatController.createMessage)
router.post("/getMessage",middleware.validateUser,chatController.getMessage)
router.post("/update_message",middleware.validateUser,chatController.update_message)
router.post("/delete_message",middleware.validateUser,chatController.delete_message)

router.post("/search",middleware.validateUser,chatController.search)
router.post("/reply_to_thread",middleware.validateUser,chatController.reply_to_thread)
router.post("/get_thread",middleware.validateUser,chatController.get_thread)
router.post("/update_thread",middleware.validateUser,chatController.update_thread)
router.post("/delete_thread",middleware.validateUser,chatController.delete_thread)
module.exports = router