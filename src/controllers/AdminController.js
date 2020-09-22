const db = require('../db.js');

module.exports = {

    async getAllUsers(req, res) {
        try {
            const users = await db.all('User')
            const json = await users.toJson()
            const result = json.map(user => {
                return {
                    username: user.username,
                    uuid: user.uuid,
                    // manages: user.manages
                }
            })
            res.status(200).send(result)
            // console.log(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch all users'
            })
        }
    },

    async getUser(req, res) {
        try {
            const userId = req.params.id
            const ret = await db.model('User').find(userId)
            const json = await ret.toJson()
            // console.log(json)
            const projects = json.manages.map(item => { 
                const project = { 
                    name: item.node.name,
                    uuid: item.node.uuid
                }; 
                return project 
            })
            const user = {
                uuid: json.uuid,
                username: json.username,
                email: json.email,
                description: json.description,
                like: json.fills_in.node.answer0,
                dislike: json.fills_in.node.answer1,
                improvement: json.fills_in.node.answer2,
                comment: json.fills_in.node.answer3,
            }
            const data = {
                user: user,
                projects: projects
            }
            res.status(200).send(data)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: `An error has occured trying to fetch user with uuid ${req.params.id}`
            })
        }
    },

    async getAllProjects(req, res) {
        try {
            const projects = await db.all('Project')
            const json = await projects.toJson()
            const results = json.map(project => {
                return {
                    name: project.name,
                    uuid: project.uuid,
                    // manages: user.manages
                }
            })
            res.status(200).send(results)
            // console.log(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch all users'
            })
        }
    },

    async deleteUser(req, res) {
        try {
            const user = await db.model('User').find(req.params.id)
            const userJson = await user.toJson()

            // delete questionnaire
            // check first relationship "fills_in" is present otherwise gives errors and stops
            if (userJson.fills_in) {
                const questionnaire = await db.model('Questionnaire').find(userJson.fills_in.node.uuid)
                await questionnaire.delete()
            }

            await user.delete()
            res.status(200).send({ msg: `user with uuid:${req.params.id} has been deleted` });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the user'
            });
        }
    },

}