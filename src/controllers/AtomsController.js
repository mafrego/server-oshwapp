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
                const ret = await db.all('Atom', {},{},20,0)
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
            req.body.imageUrl = "https://oshwapp.s3.eu-central-1.amazonaws.com/test/"+req.body.name+".png"
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
            console.log(req.params.projectID)
            const projectID = req.params.projectID
            let atom = req.body
            atom.imageUrl = "https://oshwapp.s3.eu-central-1.amazonaws.com/"+projectID+"/images/"+atom.name+".png"
            console.log(atom)
            const response = await Promise.all([
                db.find('Project', projectID),
                db.create('Atom', atom)
            ])
            // console.log(response)
            await response[0].relateTo( response[1], 'consists_of')
            const json = await response[1].toJson()
            // console.log(json)
            res.status(201).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occurred trying to add the atom to the BOM'
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