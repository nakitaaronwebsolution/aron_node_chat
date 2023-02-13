const { userModel, projectModel, leaveModel, projectUpdateModel } = require('../model/index');
const jwt = require("jsonwebtoken")
const { successResponse, faildResponse, validateRequest, securePassword, comparePassword, successResponseWithCount } = require("../helper/helper");
const mongoose = require("mongoose")
module.exports = {
  async create_project(req, res) {
    try {
      const tokenUser = req.decode
      const { name, title, discription, deadLine, text } = req.body
      let validate = validateRequest(req.body, ['name','title', 'discription','deadLine'])
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
      console.log("errr=====", err)
      return res.send(faildResponse(err))
    }
  },
  async getUserProjects(req, res) {
    try {
      let data = req.body

      let validate = validateRequest(req.body, ['shortBy','page', 'size','order'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)

      let userCount = await projectModel.aggregate([
        { $group: { _id: null, myCount: { $sum: 1 } } }
      ])
      const result = await projectModel.aggregate([
        { $skip: ((Number(data.page) - 1) * Number(data.size)) },
        { $sort: { [`${data.shortBy}`]: Number(data.order) } }
      ])
      if (!result) {
        res.send(faildResponse("somethine went wrong"))
      } else {
        return res.send(successResponseWithCount("all project get success", result, userCount[0].myCount))
      }
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async addTaskUpdate(req, res) {
    try {
      let { message, hours, minutes, projectId } = req.body
      if (req.decode.role != "user") {
        return res.send(faildResponse("Invalid Api."))
      }
     
      let validate = validateRequest(req.body, ['message','hours', 'minutes','projectId'])
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
      // Create a new User
      await projectUpdateModel.create({
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
  async getProject(req, res) {
    try {
      let { projectId, shortBy, page, size, order } = req.body
    
      let validate = validateRequest(req.body, ['message','size', 'page','projectId','order','shortBy'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)

      projectModel.findOne({ _id: projectId }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          let allComment = await projectModel.aggregate([
            { $match: { projectId: result._id } },
            { $skip: ((Number(page) - 1) * Number(size)) },
            { $limit: Number(size) },
            { $sort: { [`${shortBy}`]: Number(order) } }
          ])
          let userCount = await projectModel.aggregate([
            { $match: { projectId: result._id } },
            { $group: { _id: null, myCount: { $sum: 1 } } }
          ])
          let allData = {
            projectDetail: result,
            projectUpdates: allComment,
            projectUpdatesCount: userCount[0] && userCount[0].myCount || 0
          }
          return res.send(successResponse("Project Find Success", allData))
        }
      })
    } catch (err) {
      console.log("err===", err)
      return res.send(faildResponse(err))
    }
  },
  async approveLeaved(req, res) {
    try {
      let validate = validateRequest(req.body, ['leaveId','status'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validLeave = mongoose.Types.ObjectId.isValid(req.body.leaveId );
      if(validLeave==false){
        return res.send(faildResponse("invalid leave"))
      }
      const leveExist = await leaveModel.findOne({ _id:req.body.leaveId  })
      if (!leveExist) {
        return res.send(faildResponse("leave not exist"))
      }
      let newUpdate = await leaveModel.findOneAndUpdate({ _id: req.body.leaveId },{ approvedBy: req.body._id, status: req.body.status },{ new: true })
      if (!newUpdate) {
        return res.send(faildResponse("Something went wrong while getting list of Leave."))
      } else {
        return res.send(successResponse(`Leave ${req.body.status} Success`, newUpdate))
      }
    } catch (err) {
      console.log("err========", err)
      return res.send(faildResponse(err))
    }
  }
}