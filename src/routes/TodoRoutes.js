const TodosController = require('../controllers/TodosController')
const authJwt  = require("../middleware/AuthJWT");

module.exports = (app) => {
    
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get('/todos',
    TodosController.getAllTodos)

    // app.get('/todos/:id', 
    // TodosController.show)

    app.post('/todos', 
    authJwt.verifyToken,
    authJwt.isAdmin,
    TodosController.post)

    app.put('/todos/:id',
    TodosController.put)

    app.delete('/todos/:id', 
    authJwt.verifyToken,
    authJwt.isAdmin,
    TodosController.delete)
}