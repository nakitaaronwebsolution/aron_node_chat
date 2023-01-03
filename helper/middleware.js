
const jwt = require("jsonwebtoken");
const {faildResponse} = require("../helper/helper")
const user = require("../model/user");
module.exports = {
  validateUser: async function (req, res, next) {
    const token = req.headers.token
    if (!token) {
      return res.send(faildResponse("token is Not exist"));
    }
    let userExist = await user.findOne({ token: token })
    if (!userExist) {
      return res.send(faildResponse("this token is Not exist"));
    }
    req.decode = userExist
    next()
  }
}