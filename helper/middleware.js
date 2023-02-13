const jwt = require("jsonwebtoken");
const {faildResponse} = require("../helper/helper");
const {userModel} = require("../model/index")
module.exports = {
  validateUser: async function (req, res, next) {
    const token = req.headers.token
    if (!token) {
      return res.send(faildResponse("token is Not exist"));
    }
    let userExist = await userModel.findOne({ token: token })
    if (userExist) {
      if(userExist.role != 'user' ){
          return res.send(faildResponse("Invalid permission!"))
        }
      }
    req.decode = userExist
    next()
  },
  validateAdmin: async function (req, res, next) {
    const token = req.headers.token
    if (!token) {
      return res.send(faildResponse("token is Not exist"));
    }
    let adminExist = await userModel.findOne({ token: token })
    if (adminExist) {
      if(adminExist.role != 'admin'){
          return res.send(faildResponse("Invalid permission!"))
        }
      }
    req.decode = adminExist
    next()
  },
  validateHr: async function (req, res, next) {
    const token = req.headers.token
    if (!token) {
      return res.send(faildResponse("token is Not exist"));
    }
    let hrExist = await userModel.findOne({ token: token })
    if (hrExist) {
      if(hrExist.role != 'hr'){
          return res.send(faildResponse("Invalid permission!"))
        }
      }
    req.decode = hrExist
    next()
  },
 commanAuth :async function (req, res, next) {
    let token = req.headers.token
    let userExist = await userModel.findOne({ token: token })
    if (userExist) {
        req.decode = userExist
        next()
    } else {
        return res.status(500).send({
            success: false,
            message: "Invalid Credentials!"
        })
    }
  }
}