const userModel = require("../model/user")
const chatModel = require("../model/chat")
const messageModel = require("../model/message")
const threadModel = require("../model/thread")
var Objectid = require('objectid')
const { faildResponse, successResponse, validateRequest, securePassword, comparePassword } = require("../helper/helper");
const multer = require("multer")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const user = require("../model/user");
module.exports = {
    async createChat(req, res, next) {
        try {
            const tokenUser = req.decode
            const { users, type, discription, name, chat_type } = req.body
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
                let validate = validateRequest(req.body, ['name', 'description', 'chat_type'])
                if (validate && !validate.status && validate.msg) {
                    return res.send(faildResponse(validate.msg))
                }
                const ChatExist = await chatModel.findOne({ type: "group", name: name })
                if (ChatExist) {
                    return res.send(successResponse("group name  Already Exist", ChatExist))
                }
                const result = await chatModel.create({
                    users: [tokenUser._id],
                    chat_type: chat_type,
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
    async getAllChat(req, res, next) {
        try {
            const tokenUser = req.decode
            const groups = await chatModel.find({ type: "group", chat_type: "public" })
            const individules = await chatModel.find({ type: "one_to_one", users: { $in: [tokenUser._id] } })
            let result = {
                groups: groups,
                individules: individules
            }
            return res.send(successResponse("Chat Lists Get Successfully", result))
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    async createMessage(req, res, next) {
        try {
            const tokenUser = req.decode
            const { message, chatId } = req.body
            let image = null;
            if (req.file) image = 'http://localhost:4000/images/' + req.file.filename
            let validate = validateRequest(req.body, ['message', 'chatId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const ChatExist = await chatModel.findOne({ _id: chatId })
            if (!ChatExist) {
                return res.send(faildResponse("chat Id not Exist", ChatExist))
            }
            messageModel.create({
                message: message,
                from_userId: tokenUser._id,
                attachement: image,
                chatId: ChatExist._id,
                status: true
            }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("message create Successfully", result))
                }
            })
        } catch (error) {
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async getMessage(req, res, next) {
        try {
            const { chatId, page } = req.body
            let validate = validateRequest(req.body, ['chatId', 'page'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const ChatExist = await chatModel.findOne({ _id: chatId })
            if (!ChatExist) {
                return res.send(faildResponse("chat Id not Exist", ChatExist))
            }
            messageModel.find({ chatId: ChatExist._id }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("message get Successfully", result))
                }
            }).skip(Number(page - 1) * 5).limit(5).sort({ send_date: -1 }).populate('from_userId', 'username image')

        } catch (error) {
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async search(req, res, next) {
        try {
            const { username} = req.body
            let validate = validateRequest(req.body, ['username'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
           userModel.find({username:{$regex : username}},{username:1, image:1}, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse(" user search  Successfully", result))
                }
            })
        } catch (error) {
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async reply_to_thread(req,res,next){
        try{
            const tokenUser = req.decode
            const { message,messageId } = req.body
            let image = null;
            if (req.file) image = 'http://localhost:4000/images/' + req.file.filename
            let validate = validateRequest(req.body, ['message','messageId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const messageExist = await messageModel.findOne({ _id: messageId })
            if (!messageExist) {
                return res.send(faildResponse("message Id not Exist"))
            }
            await messageModel.findOneAndUpdate({ _id: messageId},{thread_count:Number(messageExist.thread_count||0)+1})
            threadModel.create({
                message: message,
                from_userId: tokenUser._id,
                attachement: image,
                messageId :messageExist._id,
             
            }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("thread message create Successfully", result))
                }
            })
        }catch(error){
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async get_thread(req,res,next){
        try{
            const {messageId} = req.body
            let validate = validateRequest(req.body, ['messageId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const messageExist = await messageModel.findOne({_id:messageId})
            if(!messageExist){
                return res.send(faildResponse("message Id not Exist")) 
            }
            console.log(messageExist.thread_count,"===========================")
     threadModel.findOne({
        messageId :messageExist._id
            }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse(" get thread message  Successfully", result))
                }
            }).populate('messageId','message thread_count')
        }catch(error){

        }
    }
}