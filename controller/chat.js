const userModel = require("../model/user")
const chatModel = require("../model/chat")
const messageModel = require("../model/message")
const threadModel = require("../model/thread")

const { faildResponse, successResponse, validateRequest } = require("../helper/helper");
var Objectid = require('objectid')
module.exports = {
    async createChat(req, res) {
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
                const ChatExist = await chatModel.findOne({ type: "one_to_one", users: { $all: [userExist._id] } })
                if (ChatExist) {
                    return res.send(successResponse("Chat Already Exist", ChatExist))
                }

                const result = await chatModel.create({
                    type: type,
                    users: userExist._id,
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
    async getChat(req, res) {
        try {
            const tokenUser = req.decode
            const userExist = await userModel.findOne({username:req.body.username})
            const groups = await chatModel.find({ type: "group", chat_type: "public" })
            const individules = await chatModel.find({ type: "one_to_one", users: { $in: [tokenUser._id] } }).populate('users', 'username image')
            const user = await userModel.findOne({_id:userExist._id}).select({_id :1,username:1,image:1})
            console.log(user)
            individules.push(user)
            let result = {
                groups: groups,
                individules: individules
            }
            return res.send(successResponse("Chat Get Successfully", result))
        } catch (error) {
            console.log(error)
            return res.send(faildResponse(error))
        }
    },
    async getAllChat(req, res) {
        try {
            const tokenUser = req.decode
            const groups = await chatModel.find({ type: "group", chat_type: "public" })
            const individules = await (await chatModel.find({ type: "one_to_one", users: { $in: [tokenUser._id] } })).populate('users', 'username image')
            let result = {
                groups: groups,
                individules: individules
            }
            return res.send(successResponse("Chat Lists Get Successfully", result))
        } catch (error) {
            console.log(error)
            return res.send(faildResponse(error))
        }
    },
    async update_Chat(req, res) {
        try {

            const { chatId, discription, name, chat_type } = req.body
            let validate = validateRequest(req.body, ['chatId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const chatExist = await chatModel.findOne({ _id: chatId })
            if (!chatExist) {
                return res.send(faildResponse("chat not exist"))
            }
            if (name == "" || chat_type == "") {
                return res.send(faildResponse("please required the filed"))
            }
            chatModel.findOneAndUpdate({ type: "group" }, {
                discription: discription,
                name: name,
                chat_type: chat_type
            }, { new: true }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("update chat Successfully", result))
                }
            })

        } catch (error) {
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async add_user(req, res) {
        try {
            const tokenUser = req.decode
            const { chatId, users } = req.body
            let validate = validateRequest(req.body, ['chatId', 'users'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const chatExist = await chatModel.findOne({ _id: chatId })
            if (!chatExist) {
                return res.send(faildResponse("chat not exist"))
            }
            const type = chatExist.type
            let updateQuerry = {}
            if (type === "group") {
                updateQuerry["$push"] = { users: users }
            } else {
                updateQuerry["$pull"] = { users: users }
            }
            console.log("updateQuerry ===> ", updateQuerry)
            chatModel.findOneAndUpdate({ type: "group" }, updateQuerry, { new: true }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("add user Successfully", result))
                }
            })


        } catch (error) {
            console.log(error)
            return res.send(faildResponse(error))
        }
    },
    async delete_Chat(req, res, next) {
        try {
            const { chatId } = req.body
            let validate = validateRequest(req.body, ['chatId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const chatExist = await chatModel.findOne({ _id: chatId })
            if (!chatExist) {
                return res.send(faildResponse("chat not exist"))
            }
            const result = await chatModel.findOneAndDelete({ _id: chatExist._id })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("chat delete Successfully", result))
            }

        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    async createMessage(req, res) {
        try {
            const tokenUser = req.decode
            const { sender, reciever, message } = req.body
            let validate = validateRequest(req.body, ['message', 'sender','reciever'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            let image = null;
            if (req.file) image = 'http://localhost:4000/images/' + req.file.filename
            const userExist = await userModel.findOne({ _id: sender, _id: reciever })
            if (!userExist) {
                return res.send(faildResponse("user not Exist"))
            }
            messageModel.create({
                message: message,
                users:[ sender,reciever],
                attachement: image,
                created_by:tokenUser._id,
                status: true
            },function (err, result) {
                if (err) {
                    return res.send(faildResponse(err,404))
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
    async getMessage(req, res) {
        try {
            const {sender,reciever, page } = req.body
            const tokenUser = req.decode
            let validate = validateRequest(req.body, ['sender','reciever', 'page'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            messageModel.find({
                users: {
                    $all: [sender, reciever],
                  },
              }, function (err, result) { 
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("message get Successfully", result))
                }
            }).skip(Number(page - 1) * 5).limit(5).sort({ send_date: -1 })

        } catch (error) {
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async update_message(req, res) {
        try {
            const { messageId } = req.body
            let validate = validateRequest(req.body, ['messageId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const messageExist = await messageModel.findOne({ _id: messageId })
            if (!messageExist) {
                return res.send(faildResponse("message not Exist"))
            }
            messageModel.findOneAndUpdate({ _id: messageExist._id }, req.body, { new: true }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("message update Successfully", result))
                }
            })
        } catch (error) {
            console.log("errr=========", error)
            return res.send(faildResponse(error))
        }
    },
    async delete_message(req, res, next) {
        try {
            const { messageId } = req.body
            let validate = validateRequest(req.body, ['messageId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const messageExist = await messageModel.findOne({ _id: messageId })
            if (!messageExist) {
                return res.send(faildResponse("chat not exist"))
            }
            const result = await messageModel.findOneAndDelete({ _id: messageExist._id })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("message delete Successfully", result))
            }

        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    async search(req, res) {
        try {
            const { username } = req.body
            let validate = validateRequest(req.body, ['username'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            userModel.find({ username: { $regex: username } }, { username: 1, image: 1 }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("user search  Successfully", result))
                }
            })
        } catch (error) {
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async reply_to_thread(req, res) {
        try {
            const tokenUser = req.decode
            const { message, messageId } = req.body
            let validate = validateRequest(req.body, ['message', 'messageId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            let image = null;
            if (req.file) image = 'http://localhost:4000/images/' + req.file.filename

            const messageExist = await messageModel.findOne({ _id: messageId })
            if (!messageExist) {
                return res.send(faildResponse("message Id not Exist"))
            }
            await messageModel.findOneAndUpdate({ _id: messageId }, { thread_count: Number(messageExist.thread_count || 0) + 1 })
            threadModel.create({
                message: message,
                from_userId: tokenUser._id,
                attachement: image,
                messageId: messageExist._id,

            }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("thread message create Successfully", result))
                }
            })
        } catch (error) {
            console.log("error ====> ", error)
            return res.send(faildResponse(error))
        }
    },
    async get_thread(req, res) {
        try {
            const { messageId } = req.body
            let validate = validateRequest(req.body, ['messageId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const messageExist = await messageModel.findOne({ _id: messageId })
            if (!messageExist) {
                return res.send(faildResponse("message Id not Exist"))
            }
            threadModel.findOne({
                messageId: messageExist._id
            }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse(" get thread message  Successfully", result))
                }
            }).populate('messageId', 'message thread_count')
        } catch (error) {
            return res.send(faildResponse(error))
        }
    },
    async update_thread(req, res) {
        try {
            const { threadId } = req.body
            let validate = validateRequest(req.body, ['threadId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const threadExist = await threadModel.findOne({ _id: threadId })
            if (!threadExist) {
                return res.send(faildResponse("thread message Id not Exist"))
            }
            threadModel.findOneAndUpdate({ _id: threadExist._id }, req.body, { new: true }, function (err, result) {
                if (err) {
                    return res.send(faildResponse(err))
                }
                else {
                    return res.send(successResponse("thread message update Successfully", result))
                }
            })
        } catch (error) {
            console.log("errr==========", error);
            return res.send(faildResponse(error))
        }
    },
    async delete_thread(req, res, next) {
        try {
            const { threadId } = req.body
            let validate = validateRequest(req.body, ['threadId'])
            if (validate && !validate.status && validate.msg) {
                return res.send(faildResponse(validate.msg))
            }
            const threadExist = await threadModel.findOne({ _id: threadId })
            if (!threadExist) {
                return res.send(faildResponse("chat not exist"))
            }
            const result = await threadModel.findOneAndDelete({ _id: threadExist._id })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("thread delete Successfully", result))
            }

        } catch (error) {
            console.log(error)
            next(error)
        }
    },
}