const jwt = require('jsonwebtoken')
const jwt_secretWord = process.env.JWT_SECRET
const db = require('../db')

module.exports = {

    jwtSignUser(user) {
        const TIME_TO_EXPIRE = 60 * 60 * 12
        return jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: TIME_TO_EXPIRE
        })
    },

    verifyToken(req, res, next){

        let token = req.headers["x-access-token"];
        if (!token) {
            return res.status(403).send({
                error: "No token provided!"
            });
        }

        jwt.verify(token, jwt_secretWord, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized!"
                });
            }
            // console.log('decoded.uuid: '+decoded.uuid);
            req.userId = decoded.uuid;
            // console.log("decoded.uuid: ",decoded.uuid)
            next();
        });
    },

    isAdmin(req, res, next) {

        // console.log('req.userID: ' + req.userId);
        db.first('User', 'uuid', req.userId)
            .then(response => response.toJson())
            .then(json => {
                const roles = [];
                json.has_role.map(curr => roles.push(curr.node.name));
                if (roles.includes('admin')) {
                    next();
                    return;
                }
                res.status(403).send({
                    error: "Require admin role!"
                });
                return;
            })
            .catch(err => {
                console.log(err);
                res.status(400).send({
                    error: 'There is something wrong with db'
                })
            }
            )
    },

    isAssembler(req, res, next) {
        let id = req.userId
        db.first('User', 'uuid', req.userId)
            .then(response => response.toJson())
            .then(json => {
                const roles = [];
                json.has_role.map(curr => roles.push(curr.node.name));
                if (roles.includes('assembler')) {
                    // pass variable id to next function
                    req.userid = id;
                    next();
                    return;
                }
                res.status(403).send({
                    error: "Require assembler role!"
                });
                return;
            })
            .catch(err => {
                console.log(err);
                res.status(400).send({
                    error: 'There is something wrong with db'
                })
            }
            )
    },

    isAssemblerOrAdmin(req, res, next) {
        db.first('User', 'uuid', req.userId)
            .then(response => response.toJson())
            .then(json => {
                const roles = [];
                json.has_role.map(curr => roles.push(curr.node.name));
                if (roles.includes('assembler') || roles.includes('admin')) {
                    next();
                    return;
                }
                res.status(403).send({
                    error: "Require assembler or admin role!"
                });
                return;
            })
            .catch(err => {
                console.log(err);
                res.status(400).send({
                    error: 'There is something wrong with db'
                })
            }
            )
    }
}