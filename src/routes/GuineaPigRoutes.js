const GuineaPigsController = require('../controllers/GuineaPigsController')
const authJwt  = require("../middleware/AuthJWT");

module.exports = (app) => {
    
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.post('/guinea_pigs', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    GuineaPigsController.create)

    app.get('/guinea_pigs',
    GuineaPigsController.getAll)

    app.get('/guinea_pigs_search',
    GuineaPigsController.search)

    // app.get('/guinea_pigs/:id', 
    // GuineaPigsController.read)

    app.put('/guinea_pig', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    GuineaPigsController.update)

    app.delete('/guinea_pigs/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    GuineaPigsController.delete)
}