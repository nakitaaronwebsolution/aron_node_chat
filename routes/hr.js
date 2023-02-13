const express = require("express")
const router = express.Router()
const hrController = require("../controller/hr")
const userController = require("../controller/user")
const middleWare = require("../helper/middleware")
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
router.post('/register',upload.single("image"), userController.register)
router.post('/login', userController.login);
router.post('/getUserProjects',middleWare.validateUser, hrController.getUserProjects);
router.post('/addTaskUpdate', middleWare.validateUser, hrController.addTaskUpdate);
router.post("/getProject",middleWare.validateHr,hrController.getProject)
router.post('/approveLeaved',middleWare.validateHr, hrController.approveLeaved);
module.exports = router