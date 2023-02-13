const express = require("express")
const router = express.Router()
const adminController = require("../controller/admin")
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
router.post('/createProject',middleWare.validateUser,upload.any("attachement"), adminController.createProject)
router.post('/add_Team',middleWare.validateUser, adminController.add_team);
router.post('/get_project',middleWare.validateUser, adminController.get_project);
router.post('/addtask_update', middleWare.validateUser,upload.any("attachement"), adminController.addtask_update);
router.post('/projectdetails',middleWare.validateUser, adminController.get_project);
router.post('/getUserProjects',middleWare.validateUser, adminController.getUserProjects);

 module.exports = router