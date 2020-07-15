const db = require('../db.js');

module.exports = {

    // OK
    async create(req, res) {
        try {
            const guinea_pig = await db.model('GuineaPig').create(req.body)
            const json = await guinea_pig.toJson()
            res.status(201).send(json)
        } catch (error) {
            console.log(error);
            res.status(500)
                .send({
                    error: 'An error has occurred trying to generate a guinea pig'
                })
            // .send(error)
        }
    },

    // OK
    async getAll(req, res) {
        try {
            const guinea_pigs = await db.all('GuineaPig')
            const json = await guinea_pigs.toJson()
            res.status(200).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch all guinea pigs'
            })
        }
    },

    // OK
    async search(req, res) {
        try {
            let guinea_pigs = []
            const search = req.query.search
            if (search) {
                // console.log(search)
                const ret = await db.all('GuineaPig', {
                    name: search
                })
                guinea_pigs = await ret.toJson()
            }
            res.send(guinea_pigs)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the guinea_pigs'
            })
        }
    },

    // TODO
    read(req, res) {
        const atom = db.model('GuineaPig');
        atom.find(req.params.id)
            // db.find('GuineaPig', req.params.id)
            .then(res => {
                return res.toJson();
            })
            .then(json => {
                console.log(json);
                res.send(json);
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({
                    error: 'An error has occured trying to fetch the atom'
                });
            });
    },

    // OK
    async update(req, res) {
        try {
            const guinea_pigId = req.body.uuid
            // console.log(guinea_pigId)
            const guinea_pig =  await db.model('GuineaPig').find(guinea_pigId)
            const gpUpdated = await guinea_pig.update(req.body)
            const json = await gpUpdated.toJson()
            res.status(200).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to update the guinea pig'
            })
        }    
    },

    // OK
    async delete(req, res) {
        try {
            const guinea_pigId = req.params.id
            const guinea_pig = await db.model('GuineaPig').find(guinea_pigId)
            if (guinea_pig) {
                db.model('GuineaPig')
                    .find(guinea_pigId)
                    .then(ret => {
                        ret.delete();
                        console.log(`atom with uuid: ${req.params.id} has been deleted`)
                        res.status(200).send({ msg: `atom with uuid: ${req.params.id} has been deleted` })
                    })
            } else {
                res.status(202).send({ msg: `No guinea pig with uuid: ${req.params.id} in db` })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete a guinea pig'
            })
        }
    }
}