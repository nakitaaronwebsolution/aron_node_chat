const express = require("express")
const router = express.Router()
const adminController = require("../controller/admin")
const middleWare = require('../helper/middleware');
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
router.post('/login', adminController.login);
router.post('/changePassword',middleWare.validateAdmin, adminController.changePassword);
router.post("/forget_password",adminController.forget_password)
router.post('/findOne',middleWare.validateAdmin,adminController.findOne);
router.post('/delete',middleWare.validateAdmin ,adminController.delete);
router.post('/update_admin',middleWare.validateAdmin ,adminController.update_admin);
router.post("/get_users",middleWare.validateAdmin,adminController.get_users)

router.post('/createProject',middleWare.validateAdmin,upload.any("attachement"), adminController.createProject);
router.post("/get_project",middleWare.validateAdmin,adminController.get_project)
router.post("/update_project",middleWare.validateAdmin,upload.any("attachement"),adminController.update_project)
router.post("/getUserProjects",middleWare.validateAdmin,adminController.getUserProjects)
router.post('/delete_project',middleWare.validateAdmin, adminController.delete_project);


router.post('/createTeam',middleWare.validateAdmin, adminController.createTeam);
router.get('/getAllTeams',middleWare.validateAdmin, adminController.getAllTeams);
router.post("/adduser_team",middleWare.validateAdmin,adminController.adduser_team)
router.post("/assign_project",middleWare.validateAdmin,adminController.assign_project)
router.post("/update_team",middleWare.validateAdmin,adminController.update_team)
router.post('/delete_team',middleWare.validateAdmin, adminController.delete_team);

router.post("/addtask_update",middleWare.validateUser,upload.any("attachement"),adminController.addtask_update)
router.post("/checkInAttendance",middleWare.validateAdmin,adminController.checkInAttendance)
router.post("/checkOutAttendance",middleWare.validateAdmin,adminController.checkOutAttendance)
router.post('/getAttendances',middleWare.validateAdmin, adminController.getAttendances);

router.get("/getuser",middleWare.validateAdmin,adminController.getuser)
module.exports = router
