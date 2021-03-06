const authJwt  = require("../middleware/AuthJWT");
const validate  = require("../middleware/formValidate");
const ProjectsController = require('../controllers/ProjectsController')

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get('/projects',
    ProjectsController.index)

    app.get('/projectBOM/:id',
    ProjectsController.getBom)

    app.get('/productsbyproject/:id',
    ProjectsController.getAllProducts)

    app.get('/assembliesbyproject/:id',
    ProjectsController.getAssemblies)

    app.get('/projects/:id', 
    ProjectsController.show)

    app.get('/getassemblables/:id', 
    ProjectsController.getAssemblables)

    app.post('/projects',
    validate.projectFormValidate,
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    ProjectsController.createProject)

    app.put('/projectstate/:id',   
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    ProjectsController.updateProjectState)

    app.put('/projectbom/',   
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    ProjectsController.updateProjectBom)

    app.put('/project/:id',   
    validate.projectFormValidate,
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    ProjectsController.updateProject)

    app.delete('/projects/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    ProjectsController.delete)

    app.delete('/projectbom/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    ProjectsController.deleteBom)
}