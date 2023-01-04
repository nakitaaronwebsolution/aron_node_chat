const userModel = require("../model/user")
const { faildResponse, successResponse, validateRequest, securePassword, comparePassword } = require("../helper/helper");
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")

module.exports = {
  async userRegister(req, res, next) {
    try {

      let validate = validateRequest(req.body, ['username', 'DOB', 'phoneNumber', 'email', 'password', 'gender','country_code'])
      if (validate && !validate.status && validate.msg) {
        return res.send(faildResponse(validate.msg))
      }

      const { username, gender, DOB, password, phoneNumber, email,country_code } = req.body

      const hash = await securePassword(password)
      let image = null;
      if (req.file) image = 'localhost:4000/images/' + req.file.filename
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
        country_code:country_code,
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
  async changePassword(req, res, next) {
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
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body
      let validate = validateRequest(req.body, ['email'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const userExist = await userModel.findOne({ email: email })
      if (!userExist) {
        return res.send(faildResponse("user not exist"))
      }
      const link = `http://localhost:3000/reset-password/${userExist.token}`
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "nakitaaronwebsolutions@gmail.com",
          pass: "wslfwyqhiekvzpvj",
        },
      });
      let emailHtml = `
<!doctype html>
<html lang="en-US">
<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #F2F3F8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#F2F3F8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700%7COpen+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #F2F3F8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #CECECE; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            This is A unique link to reset your
                                            password. To reset your password, click the
                                            following link.
                                        </p>
                                        <a href="${link}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>
</html>`
      var mailOptions = {
        from: "nakitaaronwebsolutions@gmail.com",
        to: email,
        subject: "Password Reset",
        html: emailHtml,
      };
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {

          console.log("Email error sent: " + JSON.stringify(error));
          return res.send(faildResponse(error));
        } else {

          console.log("Email result sent: " + JSON.stringify(result));
          return res.send(successResponse("send mail successfully ", result))
        }
      });
      console.log(link);
    } catch (error) {
      return res.send(faildResponse(error))
    }
  },
  async reset_password(req,res,next){
    try{
      const {email,token, new_password} = req.body
      let validate = validateRequest(req.body, ['email','new_password','token'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const userExist = await userModel.findOne({email:email,token:token})
      if(!userExist){
        return res.send(faildResponse("user not exist"))
      }
      const hash = await securePassword(new_password)
      userModel.findOneAndUpdate({email :email },{ password: hash },{ new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse(" reset password  Successfully", result))
        }
      })
    } catch (error) {
      return res.send(faildResponse(error))
    }
  }
}