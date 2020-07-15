const db = require('../db.js');
const bcrypt = require("bcrypt");
const authJWT = require('../middleware/AuthJWT')

const SALT_FACTOR = 2

module.exports = {

    async register(req, res) {
        try {
            //hardcoded roles here
            const roles = ["assembler"]
            const user = await db.model('User')
                .mergeOn(
                    {
                        username: req.body.username,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, SALT_FACTOR)
                    },
                    {
                        has_role: roles.map((name) => ({
                            node: name
                        }))
                    }
                )
            const json = await user.toJson()
            res.status(201).send({
                user: json,
                token: authJWT.jwtSignUser(json),
                message: `user with mail: ${req.body.email} registered succesfully!`
            });
            console.log("WLF")
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'There is something wrong in creating user in db'
            })
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body
            const ret = await db.first('User', 'email', email)
            if (!ret) {
                console.log(`no user with this email: ${email}`);
                res.status(401).send({
                    error: 'no user with this email found!'
                });
                return null
            }
            const json = await ret.toJson()
            const authorities = [];
            const roles = json.has_role;
            // console.log(roles[0].node.name);
            roles.map(curr => authorities.push("ROLE_" + curr.node.name.toUpperCase()));
            // console.log(authorities);
            if (bcrypt.compareSync(password, json.password)) {
                res.status(200).send({
                    user: json,
                    token: authJWT.jwtSignUser(json),
                    roles: authorities,
                    message: `user with email: ${email} logged in successfully!`
                })
            } else {
                console.log('password not valid with this email!');
                res.status(401).send({
                    error: 'password not matching user email!'
                });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to log in'
            })
        }
    },
}