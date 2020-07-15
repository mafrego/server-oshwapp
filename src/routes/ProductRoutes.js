const authJwt  = require("../middleware/AuthJWT");
const ProductsController = require('../controllers/ProductsController')

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get('/products',
    ProductsController.index)

    // app.get('/products/:id', 
    // ProductsController.show)

    app.get('/products/:id', 
    ProductsController.show)

    app.get('/products/children/:id', 
    ProductsController.getchildren)

    app.get('/products/tree/:id', 
    ProductsController.gettree)

    // not for the moment
    // app.post('/products', 
    // authJwt.verifyToken,
    // authJwt.isAssemblerOrAdmin,
    // ProductsController.post)

    app.delete('/products/:id', 
    authJwt.verifyToken,
    authJwt.isAssemblerOrAdmin,
    ProductsController.delete)
}