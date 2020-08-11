const authJwt  = require("../middleware/AuthJWT");
const FilesController = require('../controllers/FilesController')
const bomUpload  = require("../middleware/bomUpload");
const imagesUpload  = require("../middleware/imagesUpload");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.post('/bomupload/:projectId',   
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    bomUpload.bomFileFilter,
    bomUpload.csvFileValidate,
    bomUpload.removeEmptyProperties,
    FilesController.storeBom)

    app.post('/imagesupload/:projectId',   
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    imagesUpload.multerFilter,
    imagesUpload.syncImagesAtoms,
    imagesUpload.resizeAndUploadToS3Images,
    FilesController.uploadImages)

    // testing
    app.post('/single/',
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    bomUpload.bomFileFilter,
    FilesController.testSingleFile)
    // testing
    app.post('/multiple/',
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    imagesUpload.multerFilter,
    FilesController.testMultipleFiles)

}