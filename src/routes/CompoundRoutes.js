const authJwt  = require("../middleware/AuthJWT");
const CompoundsController = require('../controllers/CompoundsController')

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get('/compounds',
    CompoundsController.index)

    app.get('/compounds/:id', 
    CompoundsController.show)

    app.post('/compounds', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    CompoundsController.post)

    app.delete('/compounds/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    CompoundsController.delete)
}