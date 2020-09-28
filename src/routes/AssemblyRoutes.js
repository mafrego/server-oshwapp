const authJwt  = require("../middleware/AuthJWT");
const AssembliesController = require('../controllers/AssembliesController')
const validate  = require("../middleware/formValidate");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get('/assemblies',
    AssembliesController.index)

    app.get('/assemblies/:id', 
    AssembliesController.show)

    app.post('/assemblies', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AssembliesController.post)

    app.post('/assemblycopy/:id', 
    validate.assemblyFormValidate,
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AssembliesController.assembleCopy)

    app.delete('/assembly/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AssembliesController.disassemble)

    app.delete('/assemblies/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AssembliesController.delete)
}