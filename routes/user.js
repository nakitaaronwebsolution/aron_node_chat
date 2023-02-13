const express = require("express")
const router = express.Router()
const middleware = require("../helper/middleware")
const userController = require("../controller/user")
const adminController = require("../controller/admin")
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
router.post('/register',upload.single("image"),userController.register)
router.post("/login",userController.login)
router.post("/forget_password",adminController.forget_password)
router.post('/findOne', middleware.validateUser,userController.findOne);
router.post("/update_user",middleware.validateUser,userController.update_user)
router.post("/uploadImage",middleware.validateUser,upload.single("image"),userController.uploadImage)
router.post('/changePassword',middleware.validateUser, userController.changePassword);
router.post("/delete",middleware.validateUser,userController.delete)


router.post('/checkInAttendance',middleware.validateUser,userController.checkInAttendance);
router.post('/checkOutAttendance',middleware.validateUser, userController.checkOutAttendance);
router.post('/getAttendances',middleware.validateUser, userController.getAttendances);

router.post('/checkproject',middleware.validateUser,userController.checkproject);
router.get('/get_project',middleware.validateUser,adminController.get_project);

router.post('/requestLeave',middleware.commanAuth,userController.requestLeave);
router.post('/update_Leave',middleware.commanAuth,userController.update_Leave);
router.post('/checkLeave',middleware.commanAuth,userController.checkLeaveStatus);
router.post('/delete_Leave',middleware.commanAuth,userController.delete_Leave);


 module.exports = router