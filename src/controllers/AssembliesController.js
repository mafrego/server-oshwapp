const db = require('../db.js');

module.exports = {

    async index(req, res) {
        try {
            let assemblies = null
            const search = req.query.search
            if (search) {
                const ret = await db.all('Assembly', {
                    name: search
                })
                assemblies = await ret.toJson()
            } else {
                const ret = await db.all('Assembly')
                assemblies = await ret.toJson()
            }
            res.status(200).send(assemblies)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the assemblies'
            })
        }
    },

    async show(req, res) {
        try {
            const ret = await db.model('Assembly').find(req.params.id)
            const json = await ret.toJson();
            res.status(200).send(json);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch the assembly'
            });
        }
    },

    async post(req, res) {
        try {
            // TODO set imageUrl properly
            req.body.imageUrl = "https://oshwapp.s3.eu-central-1.amazonaws.com/service/assembly.png"
            const ret = await db.mergeOn('Assembly',
                req.body,
                {
                    assembled_from: req.body.parts.map((uuid, index) => ({
                        quantity: req.body.quantities[index],
                        node: uuid
                    }))
                })
            const json = await ret.toJson()
            res.status(201).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occurred trying to create the assembly'
            })
        }
    },

    // TODO refactor and find a way to display only the remaining parts to be assembled
    async assemble(req, res) {
        const projectId = req.params.id
        // console.log(req.body.quantities)
        try {
            const assembly = await db.mergeOn('Assembly',
                req.body,
                {
                    assembled_from: req.body.parts.map((uuid, index) => ({
                        quantity: req.body.quantities[index],
                        node: uuid  // This can be an ID or an object. Might be something else depending on your mapping, the default is node...  
                    }))
                })
                .then(assembly => { return assembly.toJson() })

            // link project to new assembly
            db.mergeOn('Project',
                { uuid: projectId },
                {
                    refers_to: [{
                        node: assembly.uuid,
                        type: req.body.type,
                        version: req.body.version,
                        // quantity_to_assemble: req.body.quantity_to_assemble
                    }]
                }
            )

            // update quantity_to_assemble for each children of newly created assembly
            await Promise.all(req.body.parts.map(async (uuid, index) => {
                try {
                    const product = await db.find('Product', uuid )
                    const json = await product.toJson()
                    const quantity_to_assemble = json.quantity_to_assemble
                    const updated_quantity = quantity_to_assemble - req.body.quantities[index]
                    await db.mergeOn('Product', { uuid: uuid }, { quantity_to_assemble: updated_quantity })
                } catch (error) {
                    console.log(error)
                    res.status(500).send({
                        error: `An error has occured trying to update quantity_to assemble of Product with uuid:${uuid}`
                    });
                }
            })
            )

            res.status(201).send(assembly)
            // console.log(assembly)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to create the assembly'
            })
        }
    },

    delete(req, res) {
        var assembly = db.model('Assembly');
        assembly.find(req.params.id)
            .then(response => {
                response.delete();
                // console.log('assembly deleted');
                res.status(200).send({ msg: `assembly with uuid:${req.params.id} has been deleted` });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({
                    error: 'An error has occured trying to delete the assembly'
                });
            });
    },

    // refactored 
    // async delete(req, res) {
    //     try {
    //         const assembly = await db.model('Assembly').find(req.params.id)
    //         await assembly.delete()
    //         res.status(200).send({ msg: `assembly with uuid:${req.params.id} has been deleted` });
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({
    //             error: 'An error has occured trying to delete the assembly'
    //         });
    //     }
    // }

}