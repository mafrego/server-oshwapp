const db = require("../db");
const Joi = require('@hapi/joi')
// user web app roles
const ROLES = ['user', 'assembler', 'admin']

module.exports = {

    validateData(req, res, next) {
        const schema = Joi.object({
            username: Joi.string().required(),
            email: Joi.string().email(),
            password: Joi.string().regex(
                new RegExp('^[a-zA-Z0-9]{8,32}')
            ),
            roles: Joi.array().items(Joi.string())
        })

        const {error} = schema.validate(req.body); 

        if (error) {
            switch (error.details[0].context.key) {
                case 'username':
                    res.status(400).send({
                        error: 'You must provide a valid username'
                    })
                    break
                case 'email':
                    res.status(400).send({
                        error: 'You must provide a valid email address'
                    })
                    break
                case 'password':
                    res.status(400).send({
                        error: `The password provided failed to match the following rules
                        <br>
                        1. only following chars ....
                        <br>
                        2. at least 8 chars ...
                        `
                    })
                    break
                case 'roles':
                    res.status(400).send({
                        error: 'something wrong with role'
                    })
                    break
                default:
                    res.status(400).send({
                        error: 'invalid registration infos'
                    })
            }
        } else {
            next()
        }
    },

  // checkDuplicateEmail(req, res, next) {
  //   const mail = req.body.email
  //   db.first('User', 'email', mail)
  //     .then(user => {
  //       console.log('user from mail: ' + user);
  //       if (user) {
  //         res.status(400).send({
  //           error: "Failed! Username is already in use!"
  //         });
  //         return
  //       } else {
  //         next()
  //       }
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       res.status(400).send({
  //         error: 'There is something wrong in verifying user email in db'
  //       })
  //     }
  //     )
  // },

  // same checkDuplicateEmail but with async/await
  async checkDuplicateEmail(req, res, next) {
    try {
      const mail = req.body.email
      // console.log('mail: '+mail)
      const response = await db.first('User', 'email', mail)
      // console.log('response: '+response)
      if (response) {
        res.status(400).send({
          error: 'user already registered with this email'
        })
      } else {
        next()
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: 'An error has occured trying to access the db'
      })
    }
  },

  checkRolesExisted(req, res, next) {
    if (req.body.roles) {
      for (let i = 0; i < req.body.roles.length; i++) {
        if (!ROLES.includes(req.body.roles[i])) {
          res.status(400).send({
            error: "Failed! Role does not exist = " + req.body.roles[i]
          });
          return;
        }
      }
    }

    next();
  }
}