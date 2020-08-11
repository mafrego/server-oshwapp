const multer = require('multer');
const CSVFileValidator = require('csv-file-validator')
const fs = require('fs');

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

const MAX_BOM_SIZE = 20000
const bomUpload = multer({
  dest: './uploads',
  fileFilter: bomFilter,
  limits: {
    fileSize: MAX_BOM_SIZE
  }
})

// the name 'file' comes from formData.append("file", this.file); in Vue component
const uploadBOM = bomUpload.single('file')


const config = {
  headers: [
    {
      name: 'atom name',
      inputName: 'name',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      },
      unique: true,
      uniqueError: function (headerName) {
        return `${headerName} is not unique`
      }
    },
    {
      name: 'atom description',
      inputName: 'description',
      required: true
    },
    { 
      name: 'quantity',
      inputName: 'quantity',
      required: true
    },
    {
      name: 'cost unit',
      inputName: 'costUnit',
      required: true
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
    {
      name: 'link',
      inputName: 'link',
      required: false
    },
    {
      name: 'vendor URL',
      inputName: 'vendorUrl',
      required: false
    },
    {
      name: 'minimum order quantity',
      inputName: 'moq',
      required: false
    },
    {
      name: 'lead time',
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
      name: 'weight unit',
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
  console.log("csvValidate function called")
  try {
    let stream = fs.createReadStream(req.file.path);
    const result = await CSVFileValidator(stream, config)
      .then(ret => {
        fs.unlinkSync(req.file.path);       //remove file
        return ret;
      })
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

module.exports = {
  bomFileFilter: uploadBOM,
  csvFileValidate: csvValidate
};
