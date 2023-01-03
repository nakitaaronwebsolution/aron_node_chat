const bcrypt = require("bcrypt")
module.exports = {
    faildResponse: function (msg) {
      return {
        message: msg,
        status: false,
        statusCode: 500,
      }
    },
    successResponse: function (msg, data) {
      return {
        statusCode: 200,
        message: msg,
        data: data,
      };
    },

    
    validateRequest: function (body, data) {
      let response = {
        msg: "",
        status: true
      }
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (body && body[`${data[i]}`] && body[`${data[i]}`] != "" && body[`${data[i]}`] != null) {
  
          } else {
            response.msg = `${data[i]} IS Required!`
            response.status = false
            break;
          }
        }
        return response;
      } else {
        return response
      }
    },
    securePassword : function (password){
      const passwordHash =  bcrypt.hash(password, 10);
      return passwordHash;
    },
   comparePassword : function (password, passwordHash) {
      const compassword =  bcrypt.compare(password, passwordHash);
      return compassword;
    },
  }
  
 