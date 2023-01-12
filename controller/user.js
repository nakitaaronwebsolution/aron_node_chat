const userModel = require("../model/user")
var Objectid = require('objectid')
const { faildResponse, successResponse, validateRequest, securePassword, comparePassword } = require("../helper/helper");
const multer = require("multer")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const user = require("../model/user");
//=====================(****=UserRegister=*****)======================
module.exports = {
  async userRegister(req, res, next) {
    try {

      let validate = validateRequest(req.body, ['username', 'DOB', 'phoneNumber', 'email', 'password', 'gender'])
      if (validate && !validate.status && validate.msg) {
        return res.send(faildResponse(validate.msg))
      }

      const { username, gender, DOB, password, phoneNumber, email } = req.body

      const hash = await securePassword(password)
      let image = null;
      if (req.file) image = 'http://localhost:4000/images/' + req.file.filename
      const Email = await userModel.findOne({ email: email })
      if (Email) {
        return res.send(faildResponse("Email Already Exist!"))
      }
      const result = await userModel.create({
        username: username,
        gender: gender,
        DOB: DOB,
        phoneNumber: phoneNumber,
        email: email,
        password: hash,
        image: image,
        status: true
      })
      if (!result) {
        return res.send(faildResponse("something went wrong"))
      } else {
        return res.send(successResponse(".......userRegister Successfully", result))
      }
    } catch (error) {
      return res.send(faildResponse(error))
    }
  },
  
  async UserLogin(req, res, next) {
    try {
      const { email, password } = req.body
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
            console.log("process env ", process.env.TOKEN_SECRET)
            const token = jwt.sign({
              id: result._id,
              email: email
            },process.env.TOKEN_SECRET, { expiresIn: "7d" })

            console.log(token, "token______________")

            let newUser = await userModel.findOneAndUpdate({ email: email }, { token: token }, { new: true })

            return res.send(successResponse("login successfully", { token: token, user: newUser }))
          }
        } else {
          return res.send(faildResponse("Invalid Cred"))
        }
      }

    } catch (error) {
      return res.send(faildResponse(error))
    }

  },

  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.send(faildResponse("File Not exist"));
      }
      const image = 'http://localhost:4000/images/' + req.file.filename
      let result = await userModel.updateOne({ image: image }, { new: true })
      if (!result) {
        return res.send(faildResponse("this User is Not exist"));
      } else {
        return res.send(successResponse("image updated successfully", result));
      }

    } catch (error) {
      return res.send(faildResponse(error))
    }
  },

}