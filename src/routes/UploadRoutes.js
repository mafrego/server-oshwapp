const authJwt  = require("../middleware/AuthJWT");
const FilesController = require('../controllers/FilesController')
const filesUpload  = require("../middleware/FilesUpload");

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
    filesUpload.bomUpload,
    FilesController.manageFile)

    app.post('/imagesupload/:projectId',   
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    filesUpload.multerFilter,
    // filesUpload.resizeImages,
    filesUpload.resizeAndUploadToS3Images,
    FilesController.uploadImages)

    // testing
    app.post('/single/',
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    filesUpload.bomUpload,
    FilesController.testSingleFile)
    // testing
    app.post('/multiple/',
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    filesUpload.multerFilter,
    FilesController.testMultipleFiles)

}