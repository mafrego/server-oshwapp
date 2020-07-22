const multer = require('multer');
const sharp = require("sharp");
const aws = require("aws-sdk")

const BUCKET_NAME = process.env.BUCKET_NAME
const AWSAccessKeyId = process.env.AWSAccessKeyId
const AWSSecretKey = process.env.AWSSecretKey

aws.config.update({
  AWSAccessKeyId: AWSAccessKeyId,
  AWSSecretKey: AWSSecretKey
})

const multerStorage = multer.memoryStorage();

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

const resizeAndUploadToS3Images = async (req, res, next) => {

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
        // const pathName = `test/${filename}.png`;

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
  bomUpload: uploadBOM,
  // resizeImages: resizeImages,
  resizeAndUploadToS3Images: resizeAndUploadToS3Images
};