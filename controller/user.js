const userModel = require("../model/user")
const chatModel = require("../model/chat")
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
      const image = 'localhost:6000/images/' + req.file.filename
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
      const { email, password, username } = req.body
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

          console.log(compassword)
          if (!compassword) {
            return res.send(faildResponse("password is wrong"))
          }
          else {
            console.log("process env ", process.env.TOKEN_SECRET)
            const token = jwt.sign({
              id: result._id,
              email: email
            }, process.env.TOKEN_SECRET, { expiresIn: "7d" })

            console.log(token, "token______________")

            let newUser = await userModel.findOneAndUpdate({ email: email }, { token: token }, { new: true })

            return res.send(successResponse(username + " " + "login successfully", { token: token, user: newUser }))
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
      const token = req.headers.token
      const image = 'localhost:6000/images/' + req.file.filename
      if (!token) {
        return res.send(faildResponse("token is Not exist"));
      }
      let result = await userModel.findOneAndUpdate({ token: token }, { image: image }, { new: true })
      if (!result) {
        return res.send(faildResponse("this User is Not exist"));
      } else {
        return res.send(successResponse("image updated successfully", result));
      }

    } catch (error) {
      return res.send(faildResponse(error))
    }
  },

  async createChat(req, res, next) {
    try {
      const tokenUser = req.decode
      const { users, type, discription, name,chat_type } = req.body
      let validate = validateRequest(req.body, ['type'])
      if (validate && !validate.status && validate.msg) {
        return res.send(faildResponse(validate.msg))
      }

      if (type == "one_to_one") {
        let validate = validateRequest(req.body, ['users'])
        if (validate && !validate.status && validate.msg) {
          return res.send(faildResponse(validate.msg))
        }
        const userExist = await userModel.findOne({ _id: Objectid(users) })
        if (!userExist) {
          return res.send(faildResponse("user not exist"))
        }
        const ChatExist = await chatModel.findOne({ type: "one_to_one", users: { $all: [userExist._id, tokenUser._id] } })
        if (ChatExist) {
          return res.send(successResponse("Chat Already Exist", ChatExist))
        }
        const result = await chatModel.create({
          type: type,
          users: [userExist._id, tokenUser._id],
          created_by: tokenUser._id
        })
        if (!result) {
          return res.send(faildResponse("something went wrong"))
        }
        else {
          return res.send(successResponse("chat create Successfully", result))
        }
      }
      if (type == "group") {
        let validate = validateRequest(req.body, ['name', 'description','chat_type'])
        if (validate && !validate.status && validate.msg) {
          return res.send(faildResponse(validate.msg))
        }
        const ChatExist = await chatModel.findOne({ type: "group", name: name  })
        if (ChatExist) {
          return res.send(successResponse("group name  Already Exist", ChatExist))
        }
        const result = await chatModel.create({
          users: [tokenUser._id],
          chat_type:chat_type,
          type: type,
          discription: discription,
          name: name,
          created_by: tokenUser._id
        })
        if (!result) {
          return res.send(faildResponse("something went wrong"))
        } else {
          return res.send(successResponse("Group create Successfully", result))
        }
      }
    } catch (error) {
      console.log("error ====> ", error)
      return res.send(faildResponse(error))
    }
  },

  async getAllChat(req, res, next){
    try{
      
    const tokenUser = req.decode

    const result = await chatModel.find({$and:[{type :"group"},{chat_type:"public"}],$and :[{}]})
    if (!result){
      return res.send(faildResponse("something went wrong"))
    }else{
      return res.send(successResponse("get  all chat successfully",result))
    }
  }catch(error){
console.log(error)
next(error)
  } 
}
}