const multer = require('multer');
const CSVFileValidator = require('csv-file-validator')
const fs = require('fs');
const { aws, BUCKET_NAME } = require('../aws.js')
const regex = require('../service/regex')

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

// shuffle header places not allowed on .csv file
const config = {
  headers: [
    {
      name: 'itemNumber',
      inputName: 'itemNumber',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in row ${rowNumber}-column ${columnNumber}`
      },
      unique: true,
      uniqueError: function (headerName) {
        return `${headerName} is not unique`
      },
      validate: function (str) {
        return regex.isPositiveInt(str)
      }
    },
    {
      name: 'name',
      inputName: 'name',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in row ${rowNumber}-column ${columnNumber}`
      },
      unique: true,
      uniqueError: function (headerName) {
        return `${headerName} is not unique`
      },
      validate: function (str) {
        return regex.isAlphanumericString(str)
      }
    },
    {
      name: 'description',
      inputName: 'description',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in row ${rowNumber}-column ${columnNumber}`
      },
      validate: function (str) {
        return regex.isDescriptionString(str)
      }
    },
    {
      name: 'moq',
      inputName: 'moq',
      required: true,
      validate: function (str) {
        if (str) return regex.isPositiveInt(str)
        else return true
      }
    },
    {
      name: 'quantity',
      inputName: 'quantity',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in row ${rowNumber}-column ${columnNumber}`
      },
      validate: function (str) {
        return regex.isPositiveInt(str)
      }
    },
    {
      name: 'unitCost',
      inputName: 'unitCost',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in row ${rowNumber}-column ${columnNumber}`
      },
      validate: function (str) {
        return regex.isPositiveFloat(str)
      }
    },
    {
      name: 'totalCost',
      inputName: 'totalCost',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in row ${rowNumber}-column ${columnNumber}`
      },
      validate: function (str) {
        return regex.isPositiveFloat(str)
      }
    },
    {
      name: 'currency',
      inputName: 'currency',      //ISO 4217
      required: true,
      validate: function (str) {
        return regex.isISO4217(str)
      }
    },
    {
      name: 'GTIN',
      inputName: 'GTIN',
      unique: false,
      uniqueError: function (headerName) {
        return `${headerName} is not unique`
      },
      required: false,
      validate: function (str) {
        if (str) return regex.isGTIN(str)
        else return true
      }
    },
    {
      name: 'SKU',
      inputName: 'SKU',
      unique: false,
      uniqueError: function (headerName) {
        return `${headerName} is not unique`
      },
      required: false,
      validate: function (str) {
        if (str) return regex.isSKU(str)
        else return true
      }
    },
    {
      name: 'vendorUrl',
      inputName: 'vendorUrl',
      required: false,
      validate: function (str) {
        if (str) return regex.isHTTP(str)
        else return true
      }
    },
    {
      name: 'leadTime',
      inputName: 'leadTime',          //ISO 8601
      required: false,
      validate: function (str) {
        if (str) return regex.isDurationISO8601(str)
        else return true
      }
    },
    {
      name: 'link',
      inputName: 'link',
      required: false,
      validate: function (str) {
        if (str) return regex.isHTTP(str)
        else return true
      }
    },
    {
      name: 'notes',
      inputName: 'notes',
      required: false,
      validate: function (str) {
        if (str) return regex.isDescriptionString(str)
        else return true
      }
    },
  ]
}

const csvValidate = async (req, res, next) => {
  // console.log("csvValidate function called")
  try {
    let stream = fs.createReadStream(req.file.path);
    const result = await CSVFileValidator(stream, config)
    if (result.inValidMessages.length) {
      fs.unlinkSync(req.file.path)    //remove file
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
    const fileName = req.file.originalname
    const s3 = new aws.S3()
    const pathName = `${folderName}/${fileName}`;
    let stream = fs.createReadStream(req.file.path);
    // console.log('req.file:', req.file)

    const ret = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: pathName,
      Body: stream,
      ContentType: 'text/csv',
      ACL: 'public-read'
    }).promise()

    // console.log('ret:', ret)
    req.s3bomPath = ret.Location
    // console.log("removing .csv file from server...")
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
