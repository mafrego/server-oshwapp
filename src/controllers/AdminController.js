const db = require('../db.js');

module.exports = {

    async getAllUsers(req, res){
        try {
            const users = await db.all('User')
            const json = await users.toJson()
            const result = json.map( user => { return { 
                username: user.username,
                uuid: user.uuid,
                // manages: user.manages
            }})
            res.status(200).send(result)
            // console.log(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch all users'
            })
        }
    },

    async getAllProjects(req, res){
        try {
            const projects = await db.all('Project')
            const json = await projects.toJson()
            const results = json.map( project => { return { 
                name: project.name,
                uuid: project.uuid,
                // manages: user.manages
            }})
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
            await user.delete()
            res.status(200).send({ msg: `user with uuid:${req.params.id} has been deleted` });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the user'
            });
        }
    },

    // async index(req, res) {
    //     try {
    //         let atoms = null
    //         const search = req.query.search
    //         if (search) {
    //             const ret = await db.all('Atom', {
    //                 name: search
    //             })
    //             atoms = await ret.toJson()
    //         } else {
    //             const ret = await db.all('Atom')
    //             atoms = await ret.toJson()
    //         }
    //         res.status(200).send(atoms)
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send({
    //             error: 'An error has occured trying to fetch the atoms'
    //         })
    //     }
    // },

    // async show(req, res) {
    //     try {
    //         const atom = await db.model('Atom').find(req.params.id)
    //         const json = await atom.toJson()
    //         res.status(200).send(json);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({
    //             error: 'An error has occured trying to fetch the atom'
    //         });
    //     }
    // },

    // async post(req, res) {
    //     try {
    //         console.log(req.body)
    //         req.body.imageUrl = "https://oshwapp.s3.eu-central-1.amazonaws.com/test/"+req.body.name+".png"
    //         const atom = await db.model('Atom').create(req.body)
    //         const json = await atom.toJson()
    //         res.status(201).send(json)
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({
    //             error: 'An error has occurred trying to create the atom'
    //         })
    //     }
    // },

    // async delete(req, res) {
    //     try {
    //         const atom = await db.model('Atom').find(req.params.id)
    //         await atom.delete()
    //         res.status(200).send({ msg: `atom with uuid:${req.params.id} has been deleted` });
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({
    //             error: 'An error has occured trying to delete the atom'
    //         });
    //     }
    // }

}