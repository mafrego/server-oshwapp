const db = require('../db.js');

module.exports = {

    async index(req, res) {
        try {
            let atoms = null
            const search = req.query.search
            if (search) {
                const ret = await db.all('Atom', {
                    name: search
                })
                atoms = await ret.toJson()
            } else {
                // all(model,params,order,limit,skip)
                const ret = await db.all('Atom', {}, {}, 20, 0)
                atoms = await ret.toJson()
            }
            res.status(200).send(atoms)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the atoms'
            })
        }
    },

    async show(req, res) {
        try {
            const atom = await db.model('Atom').find(req.params.id)
            const json = await atom.toJson()
            res.status(200).send(json);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch the atom'
            });
        }
    },

    async post(req, res) {
        try {
            // console.log(req.body)
            req.body.imageUrl = process.env.AWS_S3_BASE_URL+"test/" + req.body.name + ".png"
            const atom = await db.model('Atom').create(req.body)
            const json = await atom.toJson()
            res.status(201).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occurred trying to create the atom'
            })
        }
    },

    async addAtomToBom(req, res) {
        try {
            const projectID = req.params.projectID
            let atom = req.body

            // check if atom with same name is already present
            const project = await db.find('Project', projectID)
            const projectJson = await project.toJson()
            let isAtomPresent = false
            for (let element of projectJson.consists_of) {
                if (element.node.name === atom.name) {
                    isAtomPresent = true
                    break
                }
            }

            if (isAtomPresent) {
                res.status(409).send({ message: 'atom with same name already present' })
            } else {
                atom.imageUrl = process.env.AWS_S3_BASE_URL + projectID + "/images/" + atom.name + ".png"
                const response1 = await db.create('Atom', atom)
                await project.relateTo(response1, 'consists_of')
                const json = await response1.toJson()
                res.status(201).send(json)
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'An error has occurred trying to add the atom to the BOM'
            })
        }
    },

    // check if after updating pre-existing relationships are kept
    async update(req, res) {
        try {
            // console.log(req.body)
            const atom = await db.model('Atom').find(req.body.uuid)
            const atomUpdated = await atom.update(req.body)
            const json = await atomUpdated.toJson()
            // 200 for modified existing resource with PUT
            res.status(200).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: `An error has occurred trying to update atom with uuid:${req.body.uuid}`
            })
        }
    },

    async delete(req, res) {
        try {
            const atom = await db.model('Atom').find(req.params.id)
            const response = await atom.delete()
            const json = await response.toJson()
            res.status(200).send(json);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the atom'
            });
        }
    }

}