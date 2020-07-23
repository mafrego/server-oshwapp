const multer = require('multer');
const sharp = require("sharp");
const aws = require("aws-sdk");
const db = require('../db.js')

const BUCKET_NAME = process.env.BUCKET_NAME
const AWSAccessKeyId = process.env.AWSAccessKeyId
const AWSSecretKey = process.env.AWSSecretKey

function configAWS(){
if (process.env.NODE_ENV === 'production') {

  // console.log("production")
  // console.log(AWSAccessKeyId)
  // console.log(AWSSecretKey)
  // console.log(BUCKET_NAME)
  console.log(process.env.AWSAccessKeyId)
  console.log(process.env.AWSSecretKey)
  console.log(process.env.BUCKET_NAME)
  aws.config = new aws.Config();
  aws.config.accessKeyId = process.env.AWSAccessKeyId
  aws.config.secretAccessKey = process.env.AWSSecretKey
  // aws.config.region = 'eu-central-1'
} else {
  aws.config.update({
    AWSAccessKeyId: AWSAccessKeyId,
    AWSSecretKey: AWSSecretKey,
  })
}
}

const multerStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {

  const allowedImageTypes = ["image/png", "image/svg", "image/jpg", "image/jpeg"]

  if (!allowedImageTypes.includes(file.mimetype)) {
    console.log("file type not allowed")
    const error = new Error("Wrong file type")
    error.code = "LIMIT_IMAGE_FILE_TYPE"
    return cb(error, false)
  }
  cb(null, true)
}

// TODO set ing size limit
const MAX_IMG_SIZE = 500000
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

const syncImagesAtoms = async (req, res, next) => {

  try {
    const project = await db.model('Project').find(req.params.projectId)
    const projectJson = await project.toJson()
    req.atoms = projectJson.consists_of.map(el => el.node)
    const atomNames = req.atoms.map(el => el.name)

    req.files = req.files.filter(function (file) {
      if (atomNames.includes(file.originalname.replace(/\..+$/, ""))) {
        return true
      } else {
        return false
      }
    })
    next()
  } catch (error) {
    console.log(error)
  }

}

const resizeAndUploadToS3Images = async (req, res, next) => {

  // console.log(AWSAccessKeyId)
  // console.log(AWSSecretKey)
  // console.log(BUCKET_NAME)

  configAWS()

  if (!req.files) return next();

  try {
    const folderName = req.params.projectId
    req.body.images = [];
    req.body.s3responses = []
    const s3 = new aws.S3()

    await Promise.all(
      req.files.map(async file => {

        const filename = file.originalname.replace(/\..+$/, "");
        // to add folder in aws s3 bucket just add folderName/anotherFolderName/imgName.png
        const pathName = `${folderName}/${filename}.png`;

        const buffer = await sharp(file.buffer)
          .resize(256, 256)
          .toFormat("png")
          // .png({ quality: 90 })
          .toBuffer()

        // remember to add ContentType: .... otherwise aws-s3 doesn't display picture but ask to dowload
        const s3res = await s3.upload({
          Bucket: BUCKET_NAME,
          Key: pathName,
          Body: buffer,
          ContentType: 'image/png',
          ACL: 'public-read'
        }).promise()

        req.body.images.push(pathName);
        req.body.s3responses.push(s3res)
      })
    );

    next();
  } catch (error) {
    console.log(error)
    res.status(422).send({ msg: 'error in resizing and uploading to S3' })
  }
};

// just for testing sharp
// const resizeImages = async (req, res, next) => {

//   if (!req.files) return next();
//   req.body.images = [];

//   await Promise.all(
//     req.files.map(async file => {
//       // const filename = file.originalname.replace(/\..+$/, "");
//       const pathName = `${file.originalname}.png`;

//       await sharp(file.buffer)
//         .resize(256, 256)
//         .toFormat("png")
//         .png({ quality: 90 })
//         .toFile(`./uploads/${pathName}`);

//       req.body.images.push(pathName);
//     })
//   );

//   next();
// };

module.exports = {
  multerFilter: uploadImages,
  syncImagesAtoms: syncImagesAtoms,
  resizeAndUploadToS3Images: resizeAndUploadToS3Images
};