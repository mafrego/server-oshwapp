const authJwt  = require("../middleware/AuthJWT");
const controller = require("../controllers/UserController");

module.exports = function(app) {
  
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
      "/api/test/all", 
      controller.allAccess);

  // not used yet
  app.get(
    "/api/test/user",
    authJwt.verifyToken,
    controller.userBoard
  );

  app.get(
    "/api/test/assembler",
    authJwt.verifyToken,
    authJwt.isAssembler,
    controller.assemblerBoard
  );

  app.get(
    "/api/test/admin",
    authJwt.verifyToken,
    authJwt.isAdmin,
    controller.adminBoard
  );
};