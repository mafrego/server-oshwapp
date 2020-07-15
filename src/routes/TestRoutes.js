const TodosController = require('../controllers/TestController')

module.exports = (app) => {
    
    app.get('/test',
    TestController.test)
}