const verifySignUp = require("../middleware/VerifySignUp");
const controller = require("../controllers/AuthenticationController");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/register",
        //maybe add auhtenticationcontrollerpolicy middleware
        verifySignUp.checkDuplicateEmail,
        verifySignUp.validateData,
        verifySignUp.checkRolesExisted,
        controller.register
    );

    app.post(
        "/login", 
        controller.login);
};
