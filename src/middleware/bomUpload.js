const multer = require('multer');
const CSVFileValidator = require('csv-file-validator')
const fs = require('fs');
const aws = require("aws-sdk");

const BUCKET_NAME = process.env.BUCKET_NAME
const AWSAccessKeyId = process.env.AWSAccessKeyId
const AWSSecretKey = process.env.AWSSecretKey

if (process.env.NODE_ENV === 'production') {
  aws.config = new aws.Config();
  aws.config.accessKeyId = AWSAccessKeyId
  aws.config.secretAccessKey = AWSSecretKey
  aws.config.region = 'eu-central-1'
} else {
  aws.config.update({
    accessKeyId: AWSAccessKeyId,
    secretAccessKey: AWSSecretKey,
    region: 'eu-central-1'
  })
}

const bomFilter = (req, file, cb) => {

  const allowedBOMType = ["text/csv"]

  if (!allowedBOMType.includes(file.mimetype)) {
    console.log("file type not allowed")
    const error = new Error("Wrong file type")
    error.code = "LIMIT_BOM_FILE_TYPE"
    return cb(error, false)
  }
  cb(null, true)
}

// BOM of 1024 rows is about 160 KB
const MAX_BOM_SIZE = 200000
const bomUpload = multer({
  dest: './uploads',
  fileFilter: bomFilter,
  limits: {
    fileSize: MAX_BOM_SIZE
  }
})

// the name 'file' comes from formData.append("file", this.file); in Vue component
const uploadBOM = bomUpload.single('file')

function isAlphanumericString(str) {
  const patter = /^[0-9a-zA-Z_]+$/;  
  return patter.test(str)
}

function isDescriptionString(str) {
  const patter = /^[-a-zA-Z0-9 _.]*$/;  
  return patter.test(str)
}

function isPositiveInt(str) {
  const patter = /^[0-9]*[1-9][0-9]*$/;  
  return patter.test(str)
}

function isPositiveFloat(str) {
  const patter = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;  
  return patter.test(str)
}


// TODO add validation functions for single inputs
const config = {
  headers: [
    {
      name: 'name',
      inputName: 'name',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in row ${rowNumber}-column ${columnNumber}`
      },
      // comment for testing
      unique: true,
      uniqueError: function (headerName) {
        return `${headerName} is not unique`
      },
      validate: function (str) {
        return isAlphanumericString(str)
      }
    },
    {
      name: 'description',
      inputName: 'description',
      required: true,
      validate: function (str) {
        return isDescriptionString(str)
      }
    },
    {
      name: 'quantity',
      inputName: 'quantity',
      required: true,
      validate: function (str) {
        return isPositiveInt(str)
      }
    },
    {
      name: 'cost',
      inputName: 'cost',
      required: true,
      validate: function (str) {
        return isPositiveFloat(str)
      }
    },
    {
      name: 'currency',
      inputName: 'currency',
      required: true
    },
    {
      name: 'code',
      inputName: 'code',
      required: false
    },
    // TODO add validation function for urls
    {
      name: 'link',
      inputName: 'link',
      required: false
    },
    // TODO add validation function for urls
    {
      name: 'vendorURL',
      inputName: 'vendorUrl',
      required: false
    },
    // TODO add validation function for positive integers
    {
      name: 'moq',
      inputName: 'moq',
      required: false
    },
    {
      name: 'leadtime',
      inputName: 'leadTime',
      required: false
    },
    {
      name: 'material',
      inputName: 'material',
      required: false
    },
    {
      name: 'weight',
      inputName: 'weight',
      required: false
    },
    {
      name: 'weightunit',
      inputName: 'weightUnit',
      required: false
    },
    {
      name: 'notes',
      inputName: 'notes',
      required: false
    },
  ]
}

const csvValidate = async (req, res, next) => {
  // console.log("csvValidate function called")
  try {
    let stream = fs.createReadStream(req.file.path);
    const result = await CSVFileValidator(stream, config)
    if (result.inValidMessages.length) {
      throw result.inValidMessages
    } else {
      req.result = result
      next()
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error)
  }
}

// if csv validation passed, save file to S3 and then remove .csv file stored locally
const uploadCsvFileToS3 = async (req, res, next) => {
  try {
    const folderName = req.params.projectId
    const s3 = new aws.S3()
    const pathName = `${folderName}/bom.csv`;
    let stream = fs.createReadStream(req.file.path);

    await s3.upload({
      Bucket: BUCKET_NAME,
      Key: pathName,
      Body: stream,
      ContentType: 'text/csv',
      ACL: 'public-read'
    }).promise()

    console.log("removing .csv file from server...")
    fs.unlinkSync(req.file.path)    //remove file

    next()
  } catch (error) {
    console.log(error)
    res.status(422).send({ msg: 'error in uploading bom.csv to S3' })
  }
}


// for each object in req.result remove all properties with empty string
// otherwise neode gives empty string error while creating new node 
// KEEP IT!!! in case you need the logic later
// const removeEmptyProperties = (req, res, next) => {
//   const cleaned = req.result.data.map(obj => {
//     Object.keys(obj).forEach(k => { if (obj[k] === '') delete obj[k] })
//     return obj
//   })
//   req.result.data = cleaned
//   next()
// }

module.exports = {
  bomFileFilter: uploadBOM,
  csvValidate: csvValidate,
  uploadCsvFileToS3: uploadCsvFileToS3,
};
