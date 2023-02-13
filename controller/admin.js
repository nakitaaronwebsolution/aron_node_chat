const { userModel, projectUpdateModel, projectModel, attendanceModel, teamModel } = require('../model/index');
const jwt = require("jsonwebtoken")
var Objectid = require('objectid')
const generator = require('generate-password');
const nodemailer = require('nodemailer');
const notifier = require('node-notifier');
const mongoose = require("mongoose")
const { successResponse, faildResponse, successResponseWithCount, validateRequest, securePassword, comparePassword } = require("../helper/helper");
module.exports = {
  async login(req, res) {
    try {
      const { password, email } = req.body
      console.log("email===", email)
      let validate = validateRequest(req.body, ['email', 'password'])
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
          return res.send(successResponse(" change password  Successfully", result))
        }
      })
    } catch (error) {
      return res.send(faildResponse(error))
    }
  },
  async forget_password(req, res) {
    try {
      const { email } = req.body
      let validate = validateRequest(req.body, ['email'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const userExist = await userModel.findOne({ email: email })
      if (!userExist) {
        return res.send(faildResponse("user not exist"))
      }
      var password = generator.generate({
        length: 10,
        numbers: true,
      });
      console.log(password);
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "nakitaaronwebsolutions@gmail.com",
          pass: "wslfwyqhiekvzpvj",
        }
      });

      var mailOptions = {
        from: "nakitaaronwebsolutions@gmail.com",
        to: email,
        password: password,
        subject: 'Sending  password to Email using Node.js',
        text: password
      };
      const hash = await securePassword(password)
      await userModel.findOneAndUpdate({ _id: userExist._id }, { password: hash })
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {

          console.log("Email error sent: " + JSON.stringify(error));
          return res.send(faildResponse(error));
        } else {
          console.log("Email result sent: " + JSON.stringify(result));

          return res.send(successResponse("send mail successfully ", result))
        }
      });

    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
    }
  },
  async findOne(req, res) {
    try {
      const tokenUser = req.decode
      const result = await userModel.findById({ _id: tokenUser._id })
      if (!result) {
        return res.send(faildResponse(`abmin not found with id ${tokenUser._id}`))
      }
      return res.send(successResponse("abmin Find By Id Success", result))
    } catch (error) {
      console.log("err===", error)
      return res.send(faildResponse(error))
    }
  },
  async update_admin(req, res) {
    try {
      const tokenUser = req.decode
      
      const { name, phone, email } = req.body
      if(tokenUser.role!=="admin"){
        return res.send(faildResponse("invalid token"))
      }
      userModel.findOneAndUpdate({ _id: tokenUser._id }, {
        name: name,
        phone: phone,
        email: email
      }, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse(" update admin Successfully", result))
        }
      })
    } catch (error) {
      return res.send(faildResponse(error))
    }
  },
  async delete(req, res) {
    try {
      try {
        const tokenUser = req.decode
        const result = await userModel.findOneAndRemove({ _id: tokenUser._id })
        if (!result) {
          return res.send(faildResponse(`admin not found with id ${tokenUser._id}`))
        }
        else {
          return res.send(successResponse("abmin Deleted Successfully", {}))
        }
      } catch (err) {
        console.log("err===", err)
        return res.send(faildResponse(err))
      }
    } catch (err) {
      return res.send(err)
    }
  },
  async get_users(req, res) {
    try {
      const { shortBy, page, size, order } = req.body
      let validate = validateRequest(req.body, ['shortBy', 'page', 'size', 'order'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)

      let userCount = await userModel.aggregate([
        { $group: { _id: null, myCount: { $sum: 1 } } }
      ])
      const result = await userModel.aggregate([
        { $skip: ((Number(page) - 1) * Number(size)) },
        { $sort: { [`${shortBy}`]: Number(order) } }
      ])
      if (!result) {
        return res.send("Something went wrong while getting list of users.")
      } else {
        return res.send(successResponseWithCount("User All Data", result, userCount[0].myCount))
      }

    } catch (err) {
      console.log("err====", err)
      return res.send(err)
    }
  },
  async createProject(req, res) {
    try {
      const tokenUser = req.decode
      const { name, title, discription, deadLine, text } = req.body
      let validate = validateRequest(req.body, ['name', 'title', 'discription', 'text'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      let image = null;
      if (req.file) image = 'http://localhost:4003/images/' + req.file.filename
      const result = await projectModel.create({
        name: name,
        title: title,
        attachement: image,
        discription: discription,
        text: text,
        cretatedBy: tokenUser._id,
        deadLine: deadLine,
        status: true

      })
      if (!result) {
        return res.send(faildResponse("something went wrongs"))
      } else {
        return res.send(successResponse("project created successfully", result))
      }
    } catch (err) {
      return res.send(err)
    }
  },
  async get_project(req, res) {
    try {
      let data = req.body
      let validate = validateRequest(req.body, ['shortBy', 'page', 'size', 'order'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      let projectCount = await projectModel.aggregate([
        { $group: { _id: null, myCount: { $sum: 1 } } }
      ])
      const result = await projectModel.aggregate([
        { $skip: ((Number(data.page) - 1) * Number(data.size)) },
        { $sort: { [`${data.shortBy}`]: Number(data.order) } }
      ])
      if (!result) {
        return res.send("Something went wrong while getting list of users.")
      } else {
        return res.send(successResponseWithCount("project All Data", result, projectCount[0].myCount))
      }
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async update_project(req, res) {
    try {
      const { projectId, name, discription, title, text, projectmanager, deadLine } = req.body
      let validate = validateRequest(req.body, ['projectId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      let image = null;
      if (req.file) image = 'http://localhost:4003/images/' + req.file.filename

      var validProject = mongoose.Types.ObjectId.isValid(projectId);
      const projectExist = projectModel.findOne({ _id: validProject })
      if (validProject == false) {
        return res.send(faildResponse("project Not exist."))
      }
      const result = await projectModel.findOneAndUpdate({ _id: projectExist._id }, {
        name: name,
        discription: discription,
        attachement: image,
        text: text,
        projectmanager: projectmanager,
        deadLine: deadLine,
        title: title,
        status: true
      }, { new: true })
      if (!result) {
        return res.send(faildResponse("something went wrong"))
      } else {
        return res.send(successResponse("project update successfully", result))
      }
    } catch (err) {
      console.log("err===", err)
      return res.send(err)
    }
  },
  async delete_project(req, res) {
    try {
      let { projectId } = req.body
      let validate = validateRequest(req.body, ['projectId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validProject = mongoose.Types.ObjectId.isValid(projectId);
      const projectExist = projectModel.findOne({ _id: validProject })
      if (validProject == false) {
        return res.send(faildResponse("project Not exist."))
      }
      console.log(projectExist)
      const result = await projectModel.findOneAndDelete({ _id: projectExist._id })
      if (!result) {
        return res.send(faildResponse(" something went wrong"))
      } else {
        return res.send(successResponse("project delete success", result))
      }

    } catch (err) {
      console.log("errr=========", err)
      return res.send(faildResponse(err))
    }
  },
  async adduser_team(req, res) {
    try {
      const { userId, teamId } = req.body
      let validate = validateRequest(req.body, ['userId', 'teamId', 'status'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))

      var validUser = mongoose.Types.ObjectId.isValid(userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId."))
      }
      const userExist = await userModel.findOne({ _id: userId })
      if (!userExist) {
        return res.send(faildResponse("user not exist "))
      }
      var validTeam = mongoose.Types.ObjectId.isValid(teamId);
      if (validTeam == false) {
        return res.send(faildResponse("invalid teamId"))
      }
      const teamExist = await teamModel.findOne({ _id: teamId })
      if (!teamExist) {
        return res.send(faildResponse("team Not exist."))
      }
      console.log(teamExist)
      const addExist = await teamModel.findOne({ users: [userId] })
      if (addExist) {
        return res.send(successResponse("user already add", addExist))
      }
      let updateQuerry = {}
      if (req.body.status === "add") {
        updateQuerry["$push"] = { users: userId }
      }
      if (req.body.status === "remove") {
        updateQuerry["$pull"] = { users: userId }
      }

      teamModel.findOneAndUpdate({ _id: teamExist._id }, updateQuerry, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Tream Update Success", result))
        }
      })
    } catch (err) {
      console.log("err====", err)
      return res.send(faildResponse(err))
    }
  },
  async createTeam(req, res) {
    try {
      const tokenUser = req.decode
      let { name, users } = req.body
      let validate = validateRequest(req.body, ['name'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      let findQuerry = {
        name: name
      }
      console.log(findQuerry)
      let updateQuerry = {
        users: users,
        name: name,
        cretatedBy: tokenUser._id,
        status: true
      }
      teamModel.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Team Create Success", result))
        }
      })
    } catch (err) {
      console.log("err===", err)
      return res.send(err)
    }
  },
  async getAllTeams(req, res) {
    try {
      teamModel.find({}, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Get Team Success", result))
        }
      })
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async update_team(req, res) {
    try {
      let { name, teamId } = req.body
      let validate = validateRequest(req.body, ['teamId', 'name'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validTeam = mongoose.Types.ObjectId.isValid(teamId);
      if (validTeam == false) {
        return res.send(faildResponse("invalid teamId"))
      }
      const teamExist = await teamModel.findOne({ _id: teamId })
      if (!teamExist) {
        return res.send(faildResponse("team Not exist."))
      }
      let findQuerry = {
        _id: teamExist._id
      }
      let updateQuerry = {
        name: name
      }
      teamModel.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Team update Success", result))
        }
      })
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async delete_team(req, res) {
    try {
      let { teamId } = req.body
      let validate = validateRequest(req.body, ['teamId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validTeam = mongoose.Types.ObjectId.isValid(teamId);
      if (validTeam == false) {
        return res.send(faildResponse("invalid teamId"))
      }
      const teamExist = await teamModel.findOne({ _id: validTeam })
      if (!teamExist) {
        return res.send(faildResponse("team Not exist."))
      }
      teamModel.remove({ _id: teamExist._id }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Team Delete Success", {}))
        }
      })
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async addtask_update(req, res) {
    try {
      let { message, hours, minutes, projectId } = req.body
      if (req.decode.role != "user") {
        return res.send(faildResponse("Invalid Api."))
      }
      let validate = validateRequest(req.body, ['message', 'hours', 'minutes', 'projectId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      let attachements = []
      console.log("req.files ===> ", req.files)
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          attachements.push('http://localhost:4003/images/' + req.file.filename)
        }
      }
      console.log("attachements ==> ", attachements)
      //  project create -----------
       projectUpdateModel.create({
        massage: message,
        hours: hours,
        minutes: minutes,
        attachement: attachements,
        status: true,
        cretatedBy: req.decode._id,
        projectId: projectId,
        createdAt: new Date()
      }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("something went wrong"))
        } else {
          return res.send(successResponse("addtask_update created successfully", result))
        }
      });
    } catch (err) {
      console.log("err====", err)
      return res.send(faildResponse(err))
    }
  },
  async getUserProjects(req, res) {
    try {
      let data = req.body
      if (req.decode.role != "user") {
        return res.send(faildResponse("Invalid Api."))
      }
      let validate = validateRequest(req.body, ['shortBy', 'page', 'size', 'order'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      let userCount = await projectModel.aggregate([
        { $match: { "team": { "$in": [req.decode._id] } } },
        { $group: { _id: null, myCount: { $sum: 1 } } }
      ])
      const result = await projectModel.aggregate([
        { $match: { team: { $in: [req.decode._id] } } },
        { $skip: ((Number(data.page) - 1) * Number(data.size)) },
        { $limit: Number(data.size) },
        { $sort: { [`${data.shortBy}`]: Number(data.order) } }
      ])
      if (!result) {
        return res.send(faildResponse("something wend wrong"))
      } else {
        return (successResponseWithCount("User All Data", result, userCount[0] && userCount[0].myCount || 0))
      }
    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
    }
  },
  async checkInAttendance(req, res) {
    try {
      let { userId } = req.body
      let validate = validateRequest(req.body, ['userId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validUser = mongoose.Types.ObjectId.isValid(userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId"))
      }
      const userExist = await userModel.findOne({ _id: userId })
      if (!userExist) {
        return res.send(faildResponse("user Not exist."))
      }
      let todatyData = new Date()
      const getDate = todatyData.getDate()
      const getMonth = todatyData.getMonth()
      const getFullYear = todatyData.getFullYear()
      const toDay = `${getDate}/${getMonth}/${getFullYear}`
      let findQuerry = {
        user: userId,
        date: toDay
      }
      console.log(toDay)
      let updateQuerry = {
        cretatedBy: req.decode._id,
        user: userExist._id,
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
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async checkOutAttendance(req, res) {
    try {
      let { userId, status } = req.body
      let validate = validateRequest(req.body, ['userId', 'status'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)

      var validUser = mongoose.Types.ObjectId.isValid(userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId"))
      }
      const userExist = await userModel.findOne({ _id: userId })
      if (!userExist) {
        return res.send(faildResponse("user Not exist."))
      }
      let todatyData = new Date()
      const getDate = todatyData.getDate()
      const getMonth = todatyData.getMonth()
      const getFullYear = todatyData.getFullYear()
      const toDay = `${getDate}/${getMonth}/${getFullYear}`
      let findQuerry = {
        user: userId,
        date: toDay
      }
      let attendanceExist = await attendanceModel.findOne(findQuerry)
      console.log("====================", attendanceExist)
      if (!attendanceExist) {
        return res.send(faildResponse("Chack In first."))
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
        user: userId,
        checkOutTime: todatyData,
        date: toDay,
        totalHr: hourlyOnly,
        totalMin: minutesOnly.toString().slice(0, 2),
        status: status || true
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
      console.log("err======", err)
      return res.send(err)
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
        return res.send(faildResponse("invalid userId"))
      }
      const userExist = await userModel.findOne({ _id:userId })
      if (!userExist) {
        return res.send(faildResponse("user Not exist."))
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
      console.log("err=======", err)
      return res.send(err)
    }
  },
  async getuser(req, res) {
    try {
      userModel.find({}, async function (err, result) {
        if (err) {
          console.log(err)
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Check In Success", result))
        }
      }).select(" image name  role").sort({ name: 1 })
    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
    }
  },
  async assign_project(req, res) {
    try {
      const { teamId, projectId } = req.body
      let validate = validateRequest(req.body, ['projectId', 'teamId', 'status'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validTeam = mongoose.Types.ObjectId.isValid(teamId);
      if (validTeam == false) {
        return res.send(faildResponse("invalid teamId"))
      }
      const teamExist = await teamModel.findOne({ _id:teamId })
      if (!teamExist) {
        return res.send(faildResponse("team Not exist."))
      }
      var validProject = mongoose.Types.ObjectId.isValid(projectId);
      if (validProject == false) {
        return res.send(faildResponse("invalid projectId"))
      }
      const projectExist = await projectModel.findOne({ _id:projectId })
      if (!projectExist) {
        return res.send(faildResponse("project mot exist"))
      }
      if (projectExist && projectExist.role === "user"){
        return res.send(faildResponse("Invalid User."))
      }
      let updateQuerry = {}
      if (req.body.status === "add") {
        updateQuerry["$push"] = {team:teamId}
      }
      if (req.body.status === "remove") {
        updateQuerry["$pull"] = {team:teamId}
      }
      const addExist = await projectModel.findOne({ team:[teamId]})
      if (addExist) {
        return res.send(successResponse("project already assign",addExist))
      }
      projectModel.findOneAndUpdate({ _id: projectExist._id }, updateQuerry,{ new: true}, function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          notifier.notify({
            title: 'new notification',
            message: "assign new project"
          });
          return res.send(successResponse("add Tream in project Success", result))
        }
      }).populate("team","name")
    } catch (err) {
      console.log("err====", err)
      return res.send(faildResponse(err))
    }
  },
 

}
