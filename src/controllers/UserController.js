const db = require('../db.js');

module.exports = {

  // allAccess(req, res) {
  //   res.status(200).send("Public Content.");
  // },

  // userBoard(req, res) {
  //   res.status(200).send("User Content.");
  // },

  // adminBoard(req, res) {
  //   res.status(200).send("Admin Content.");
  // },

  // assemblerBoard(req, res) {
  //   res.status(200).send("Moderator Content.");
  // },

  async updateQuestionnaire(req, res) {
    try {
      // console.log('req.body:', req.body)
      const questionnaire = await db.model('Questionnaire').find(req.body.uuid)
      const updated = await questionnaire.update(req.body)
      const json = await updated.toJson()
      res.status(200).send(json)
    } catch (error) {
      console.log('error:', error)
      res.status(500).send({ message: "A problem has occurred while updating questionnaire" })
    }
  },

  async update(req, res) {
    try {
      // console.log('req.body:', req.body)
      const user = await db.model('User').find(req.body.uuid)
      // ATTENTION error if passing whole user object that is re.body!!! I don't know why
      const updated = await user.update({ description: req.body.description})
      const json = await updated.toJson()
      res.status(200).send(json)
    } catch (error) {
      console.log('error:', error)
      res.status(500).send({ message: "A problem has occurred while updating user" })
    }
  }
}