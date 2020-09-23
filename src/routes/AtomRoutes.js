const AtomsController = require('../controllers/AtomsController')
const validate  = require("../middleware/formValidate");
const authJwt  = require("../middleware/AuthJWT");

module.exports = (app) => {
    
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get('/atoms',
    AtomsController.index)

    app.get('/atoms/:id', 
    AtomsController.show)

    app.post('/atoms', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AtomsController.post)

    app.post('/atom/:projectID', 
    validate.atomFormValidate,
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AtomsController.addAtomToBom)

    app.put('/atom', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AtomsController.update)

    app.delete('/atoms/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AtomsController.delete)
}