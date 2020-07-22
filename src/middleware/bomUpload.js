const multer = require('multer');

const bomFileFilter = (req, file, cb) => {

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
  fileFilter: bomFileFilter,
  limits: {
    fileSize: MAX_BOM_SIZE
  }
})

// the name 'file' comes from formData.append("file", this.file); in Vue component
const uploadBOM = bomUpload.single('file')


module.exports = {
  bomUpload: uploadBOM,
};