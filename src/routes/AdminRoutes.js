const AdminController = require('../controllers/AdminController')
const ProjectsController = require('../controllers/ProjectsController')
const authJwt  = require("../middleware/AuthJWT");

module.exports = (app) => {
    
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get('/allusers',
    authJwt.verifyToken,
    authJwt.isAdmin,
    AdminController.getAllUsers)

    app.get('/allprojects',
    authJwt.verifyToken,
    authJwt.isAdmin,
    AdminController.getAllProjects)

    app.delete('/deleteuser/:id', 
    authJwt.verifyToken,
    authJwt.isAdmin,
    AdminController.deleteUser)

    app.delete('/deleteproject/:id', 
    authJwt.verifyToken,
    authJwt.isAdmin,
    ProjectsController.delete)
}