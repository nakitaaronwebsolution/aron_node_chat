const express = require("express")
const router = express.Router()
const hrController = require('../controller/hr');
const middleWare = require('../helper/middleware');
const projectManagerController = require("../controller/projectManager")
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
router.post('/getUserProjects',middleWare.validateUser, hrController.getUserProjects);
router.post('/addTaskUpdate', middleWare.validateUser, hrController.addTaskUpdate);
router.post('/projectdetails',middleWare.validateUser, hrController.getProject);
router.post('/create_project', middleWare.validateUser,upload.any("attachement"),hrController.create_project);
router.post('/checkproject',middleWare.validateUser,userController.checkproject);
 module.exports = router