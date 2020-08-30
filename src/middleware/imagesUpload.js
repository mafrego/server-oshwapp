const multer = require('multer');
const sharp = require("sharp");
const db = require('../db.js')
const { aws, BUCKET_NAME } = require('../aws.js')

const multerStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {

  const allowedImageTypes = ["image/png", "image/svg", "image/svg+xml", "image/jpg", "image/jpeg"]

  if (!allowedImageTypes.includes(file.mimetype)) {
    console.log("file type not allowed")
    const error = new Error("Wrong file type")
    error.code = "LIMIT_IMAGE_FILE_TYPE"
    return cb(error, false)
  }
  cb(null, true)
}

// max size of single image is 70K, on average 17K
const MAX_IMG_SIZE = 70000
const imagesUpload = multer({
  // dest: './uploads',
  storage: multerStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_IMG_SIZE
  }
})

// the name 'files' comes from formData.append("files", file); in Vue component + #max uploaded files
const uploadImages = imagesUpload.array("files", 1000);

// make req.files match to actual nodes
const syncImagesAtoms = async (req, res, next) => {

  // console.log('req.files.length before sync:', req.files.length)

  try {
    const project = await db.model('Project').find(req.params.projectId)
    const projectJson = await project.toJson()

    const atoms = projectJson.consists_of.map(el => el.node)
    const atomNames = atoms.map(el => el.name)
    const filteredAtomImgNames = req.files.filter(function (file) {
      if (atomNames.includes(file.originalname.replace(/\..+$/, ""))) {
        return true
      } else {
        return false
      }
    })

    const assemblies = projectJson.refers_to.map(el => el.node)
    const assemblyNames = assemblies.map(el => el.name)
    const filteredAssemblyImgNames = req.files.filter(function (file) {
      if (assemblyNames.includes(file.originalname.replace(/\..+$/, ""))) {
        return true
      } else {
        return false
      }
    })

    req.files = filteredAtomImgNames.concat(filteredAssemblyImgNames)
    // console.log('req.files.length after sync:', req.files.length)

    next()
  } catch (error) {
    console.log(error)
  }

}

const resizeAndUploadToS3Images = async (req, res, next) => {

  if (!req.files) return next();

  try {
    const folderName = req.params.projectId
    const s3 = new aws.S3()

    // console.log(req.files)

    req.results = await Promise.all(
      req.files.map(async file => {

        const filename = file.originalname.replace(/\..+$/, "");

        // to add folder in aws s3 bucket just add folderName/anotherFolderName/imgName.png
        const pathName = `${folderName}/images/${filename}.png`;

        const buffer = await sharp(file.buffer)
          .resize(256, 256)
          .toFormat("png")
          // .png({ quality: 90 })
          .toBuffer()

        // remember to add ContentType: .... otherwise aws-s3 doesn't display picture but ask to download it
        const s3res = await s3.upload({
          Bucket: BUCKET_NAME,
          Key: pathName,
          Body: buffer,
          ContentType: 'image/png',
          ACL: 'public-read'
        }).promise()

        return s3res
      })
    );
    next();
  } catch (error) {
    console.log(error)
    res.status(422).send({ msg: 'error in resizing and uploading to S3' })
  }
};

module.exports = {
  multerFilter: uploadImages,
  syncImagesAtoms: syncImagesAtoms,
  resizeAndUploadToS3Images: resizeAndUploadToS3Images
};