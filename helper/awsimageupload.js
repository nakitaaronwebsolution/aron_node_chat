var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');

aws.config.update({
  // Your SECRET ACCESS KEY from AWS should go here,
  secretAccessKey: 'VvNTUdHgJFQOYXho/jA+AFMctFYnVbuBpY3uwMcs',
  accessKeyId: 'AKIARMMSRAXD3CJK7TIP',

// region of your bucket
});

// console.log('console',config)
var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'erparon-1',
    contentLength: 500000000,
    acl: 'public-read',
    metadata: function (req, file, cb) {
        console.log('file',file)
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        console.log('file.originalname',file.originalname)
      cb(null, Date.now().toString() + file.originalname)
    }
  })
});

module.exports = upload;

