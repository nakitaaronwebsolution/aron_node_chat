const { userModel, leaveModel, attendanceModel, teamModel, projectModel } = require('../model/index');
const jwt = require("jsonwebtoken")
const { successResponse, faildResponse, validateRequest, securePassword, comparePassword, successResponseWithCount } = require("../helper/helper");
const mongoose = require("mongoose")
module.exports = {
  async register(req, res) {
    try {

      let validate = validateRequest(req.body, ['name', 'password', 'email', 'phone', 'role'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const { name,/* employeId,*/ role, password, phone, email } = req.body
      let image = null;
      if (req.file) image = 'http://localhost:4003/images/' + req.file.filename
      const hash = await securePassword(password)
      const Email = await userModel.findOne({ email: email })
      if (Email) {
        return res.send(faildResponse("Email Already Exist!"))
      }
      // let employeIdExist = await User.findOne({ employeId: req.body.employeId })
      // if (employeIdExist) {
      //     return (errorResponse(res, "Employe Id Already exist."))
      // }

      // Create a new User
      const result = await userModel.create({
        // employeId: req.body.employeId,
        name: name,
        password: hash,
        email: email,
        image: image,
        phone: phone,
        role: role,
        is_active: true,
        is_verified: true,
        is_deleted: false
      })// Save user in the database
      if (!result) {
        return res.send(faildResponse("something went wrong"))
      } else {
        return res.send(successResponse(".......userRegister Successfully", result))
      }
    } catch (error) {
      console.log("err====", error)
      return res.send(faildResponse(error))
    }
  },
  async login(req, res) {
    try {
      const { password, email } = req.body
      let validate = validateRequest(req.body, ['password', 'email'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const result = await userModel.findOne({ email: email })
      if (!result) {
        return res.send(faildResponse("something went wrong"))
      } else {
        if (result) {
          console.log(result)
          const compassword = await comparePassword(password, result.password);
          if (!compassword) {
            return res.send(faildResponse("password is wrong"))
          }
          else {
            const token = jwt.sign({
              id: result._id,
              email: email
            }, process.env.TOKEN_SECRET, { expiresIn: "7d" })
            console.log(token, "token______________")
            let newUser = await userModel.findOneAndUpdate({ email: email }, { token: token }, { new: true })
            return res.send(successResponse("login successfully", { token: token, user: newUser }))
          }
        } else {
          return res.send(faildResponse("Invalid Cred"))
        }
      }
    } catch (error) {
      console.log("err=====", error)
      return res.send(faildResponse(error))
    }
  },
  async uploadImage(req, res) {
    try {
      const tokenUser = req.decode
      let image = null;
      if (req.file) image = 'http://localhost:4003/images/' + req.file.filename
      let result = await userModel.findOneAndUpdate({ _id: tokenUser._id }, { image: image }, { new: true })
      if (!result) {
        return res.send(faildResponse("this User is Not exist"));
      } else {
        return res.send(successResponse("image updated successfully", result));
      }
    } catch (error) {
      console.log("err=====", error)
      return res.send(faildResponse(error))
    }
  },
  async update_user(req, res) {
    try {
      const tokenUser = req.decode
      const { name, password, phone, email, role } = req.body
      userModel.findOneAndUpdate({ _id: tokenUser._id }, {
        name: name,
        password: password,
        phone: phone,
        email: email,
        role: role,
      }, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse(" update user Successfully", result))
        }
      })
    } catch (error) {
      return res.send(faildResponse(error))
    }
  },
  async changePassword(req, res) {
    try {
      const tokenUser = req.decode
      const { newPassword, confirmPassword } = req.body
      let validate = validateRequest(req.body, ['newPassword', 'confirmPassword'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      if (newPassword !== confirmPassword) {
        return res.send(faildResponse("password not same"))
      }
      const hash = await securePassword(confirmPassword)

      userModel.findOneAndUpdate({ _id: tokenUser._id }, { password: hash }, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse("change password  Successfully", result))
        }
      })
    } catch (error) {
      console.log("err======", error)
      return res.send(faildResponse(error))
    }
  },
  async findOne(req, res) {
    try {
      const tokenUser = req.decode
      userModel.findOne({ _id: tokenUser._id }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse("User  found ", result))
        }
      })
    } catch (error) {
      console.log("err====", error)
      return res.send(faildResponse(error))
    }
  },
  async delete(req, res) {
    try {
      const tokenUser = req.decode
      const result = await userModel.findOneAndRemove({ _id: tokenUser._id })
      if (!result) {
        return res.send(faildResponse(`user not found with id ${tokenUser._id}`))
      }
      else {
        return res.send(successResponse("User Deleted Successfully", {}))
      }
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async requestLeave(req, res) {
    try {
      const tokenUser = req.decode
      const { leaveType, fromDate, toDate, numberOfDays, reason } = req.body
      let validate = validateRequest(req.body, ['leaveType', 'fromDate', 'toDate', 'numberOfDays', 'reason'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const leave = await leaveModel.create({
        employeName: tokenUser.name,
        employeId: tokenUser._id,
        leaveType: leaveType,
        fromDate: fromDate,
        toDate: toDate,
        numberOfDays: Number(numberOfDays || 1),
        reason: reason,
        userId: tokenUser._id,
        status: 'Pending'
      });
      if (!leave) {
        return res.send(faildResponse("something went wrong"))
      } else {
        return res.send(successResponse("Leave Create Success", leave))
      }
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async checkInAttendance(req, res) {
    try {
      let data = req.body
      let validate = validateRequest(req.body, ['userId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validUser = mongoose.Types.ObjectId.isValid(req.body.userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId"))
      }
      const userExist = await userModel.findOne({ _id: req.body.userId })
      if (!userExist) {
        return res.send(faildResponse("user not exist "))
      }
      let todatyData = new Date()
      const getDate = todatyData.getDate()
      const getMonth = todatyData.getMonth()
      const getFullYear = todatyData.getFullYear()
      const toDay = `${getDate}/${getMonth}/${getFullYear}`
      let findQuerry = {
        user: data.userId,
        date: toDay
      }
      let updateQuerry = {
        cretatedBy: req.decode._id,
        user: data.userId,
        checkInTime: todatyData,
        date: toDay,
        status: true
      }
      attendanceModel.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Check In Success", result))
        }
      })
    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
    }
  },
  async checkOutAttendance(req, res) {
    try {
      let data = req.body
      let validate = validateRequest(req.body, ['userId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validUser = mongoose.Types.ObjectId.isValid(req.body.userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId."))
      }
      const userExist = await userModel.findOne({ _id: req.body.userId })
      if (!userExist) {
        return res.send(faildResponse("user not exist "))
      }
      let todatyData = new Date()
      const getDate = todatyData.getDate()
      const getMonth = todatyData.getMonth()
      const getFullYear = todatyData.getFullYear()
      const toDay = `${getDate}/${getMonth}/${getFullYear}`
      let findQuerry = {
        user: data.userId,
      }
      let attendanceExist = await attendanceModel.findOne({user:data.userId})
      console.log(attendanceExist)
      if (!attendanceExist) {
        return res.send(faildResponse("attendance not exist."))
      }
      const seconds = Math.floor((new Date(todatyData).getTime() - new Date(attendanceExist.checkInTime).getTime()) / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = minutes / 60;
      let minutesOnly = 0
      let hourlyOnly = 0
      if (minutes > 0) {
        let alldata = hours.toString().split(".")
        hourlyOnly = alldata[0]
        minutesOnly = Math.floor(alldata[1] * 60)
      }
      let updateQuerry = {
        cretatedBy: req.decode._id,
        user: data.userId,
        checkOutTime: todatyData,
        date: toDay,
        totalHr: hourlyOnly,
        totalMin: minutesOnly.toString().slice(0, 2),
        status: data.status || true
      }
      if (req.body.extraLeave) {
        updateQuerry.extraLeave = req.body.extraLeave
      }
      attendanceModel.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Check In Success", result))
        }
      })
    } catch (err) {
      console.log("err====", err)
      return res.send(faildResponse(err))
    }
  },
  async getAttendances(req, res) {
    try {
      let { userId } = req.body
      let validate = validateRequest(req.body, ['userId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validUser = mongoose.Types.ObjectId.isValid(userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId."))
      }
      const userExist = await userModel.findOne({ _id: userId })
      if (!userExist) {
        return res.send(faildResponse("user not exist"))
      }
      let findQuerry = {
        user: userId
      }
      attendanceModel.find(findQuerry, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Attendances In Success", result))
        }
      })
    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
    }
  },
  async checkLeaveStatus(req, res) {
    try {
      let data = req.body
      let validate = validateRequest(req.body, ['shortBy', 'page', 'size', 'order'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      let userCount = await leaveModel.aggregate([
        { $group: { _id: null, myCount: { $sum: 1 } } }
      ])
      const result = await leaveModel.aggregate([
        { $skip: ((Number(data.page) - 1) * Number(data.size)) },
        { $sort: { [`${data.shortBy}`]: Number(data.order) } }
      ])
      if (!result) {
        console.log("err ====> ", err)
        return res.send(faildResponse("Something went wrong while getting list of Leave."))
      } else {
        return res.send(successResponseWithCount("Leave All Data", result, userCount[0].myCount))
      }
    } catch (err) {
      console.log("err========", err)
      return res.send(faildResponse(err))
    }
  },
  async checkproject(req, res) {
    try {
      const tokenUser = req.decode
      const result = await projectModel.find({ team: { $all: [tokenUser._id] } })
      if (!result) {
        return res.send(faildResponse("not found"))
      } else {
        return res.send(successResponse("get project history success", result))
      }
    } catch (err) {
      console.log("err========", err)
      return res.send(faildResponse(err))
    }
  },
  async update_Leave(req, res) {
    try {
      const tokenUser = req.decode
      const { leaveId, leaveType, fromDate, toDate, numberOfDays, reason } = req.body
      let validate = validateRequest(req.body, ['leaveId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)

      leaveModel.findOneAndUpdate({ _id: leaveId, employeId: tokenUser._id }, {
        leaveType: leaveType,
        fromDate: fromDate,
        toDate: toDate,
        numberOfDays: numberOfDays,
        reason: reason
      }, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          console.log("result======",res)
          return res.send(successResponse(" update leave Successfully", result))
        }
      })
    } catch (err) {
      console.log("err=======", err)
      return res.send(faildResponse(err))
    }
  },
  async delete_Leave(req,res){
    try{
      const {leaveId} = req.body
      let validate = validateRequest(req.body, ['leaveId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      leaveModel.findOneAndDelete({ _id: leaveId }, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse("delete leave Successfully", {}))
        }
      })
    }catch(err){
      console.log("err=====",err)
      return res.send(faildResponse(err))
    }
  }
}