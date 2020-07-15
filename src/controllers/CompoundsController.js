const db = require('../db.js');

module.exports = {

    // TODO modify
    async index(req, res) {
        try {
            let compounds = null
            const search = req.query.search
            if (search) {
                console.log(search)
                compounds = await db.all('Compound', {
                    name: search
                }).then(res => { return res.toJson() })
            } else {
                console.log(search)
                compounds = await db.all('Compound').then(res => { return res.toJson() })
            }
            res.send(compounds)

        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the compounds'
            })
        }
    },

    // TODO modify
    show(req, res) {
        const compound = db.model('Compound');
        compound.find(req.params.id)
            // db.find('Compound', req.params.id)
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
                    error: 'An error has occured trying to fetch the compound'
                });
            });
    },

    // OK
    post(req, res){
        db.mergeOn('Compound',
        req.body,
        {
            made_with: req.body.parts.map((uuid, index) => ({
                quantity: req.body.quantities[index],
                node: uuid  // This can be an ID or an object. Might be something else depending on your mapping, the default is node...  
            }))
        })
            .then(compound => compound.toJson())
            .then(json => {
                console.log(json);
                res.send(json)
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({
                    error: 'An error has occurred trying to create the compound'
                })
            });
    },

    // TODO modify
    delete(req, res) {
        var compound = db.model('Compound');
        compound.find(req.params.id)
            .then(response => {
                response.delete();
                console.log('compound deleted');
                res.status(200).send({msg: `compound with uuid:${req.params.id} has been deleted`});
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({
                    error: 'An error has occured trying to delete the compound'
                });
            });

    }
}