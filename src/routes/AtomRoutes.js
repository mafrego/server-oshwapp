const AtomsController = require('../controllers/AtomsController')
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

    app.delete('/atoms/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    AtomsController.delete)
}