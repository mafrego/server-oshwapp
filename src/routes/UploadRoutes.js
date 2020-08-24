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
    bomUpload.csvValidate,
    bomUpload.uploadCsvFileToS3,
    FilesController.loadCSV)

    app.post('/bomcheck/:projectId',   
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    bomUpload.bomFileFilter,
    bomUpload.csvValidate,
    FilesController.confirmCSVValidation)

    app.post('/imagesupload/:projectId',   
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    imagesUpload.multerFilter,
    imagesUpload.syncImagesAtoms,
    imagesUpload.resizeAndUploadToS3Images,
    FilesController.uploadImages)

}