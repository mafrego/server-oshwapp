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
            req.body.imageUrl = process.env.AWS_S3_BASE_URL+"service/assembly.png"
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

    // return assemblables
    async assembleCopy(req, res) {
        const projectId = req.params.id
        const name = req.body.name
        // console.log(req.body)
        // TODO refactor: add imageUrl
        req.body.imageUrl = process.env.AWS_S3_BASE_URL+ projectId +"/images/"+ name +".png"
        
        try {
            //1. create assembly
            const assembly = await db.mergeOn('Assembly',
                req.body,
                {
                    assembled_from: req.body.parts.map(item => ({
                        quantity: item.quantity_single,
                        node: item.uuid  // This can be an ID or an object. Might be something else depending on your mapping, the default is node...  
                    }))
                })
                .then(assembly => { return assembly.toJson() })

            //2. link project to newly created assembly
            await db.mergeOn('Project',
                { uuid: projectId },
                {
                    refers_to: [{
                        node: assembly.uuid,
                        type: req.body.type,
                        version: req.body.version
                    }]
                }
            )

            //3. update quantity_to_assemble for each children of newly created assembly
            await Promise.all(req.body.parts.map(async item => {
                try {
                    const updated_quantity = item.quantity_to_assemble - item.quantity_total
                    await db.mergeOn('Product', { uuid: item.uuid }, { quantity_to_assemble: updated_quantity })
                } catch (error) {
                    console.log(error)
                    res.status(500).send({
                        error: `An error has occured trying to update quantity_to assemble of Product with uuid:${item.uuid}`
                    });
                }
            })
            )

            // 4. get assemblables
            const project = await db.model('Project').find(projectId)
            const json = await project.toJson()
            const atoms = json.consists_of
                .map(rel => rel.node)
                .filter(el => { return el.quantity_to_assemble > 0 })
            // console.log(atoms)
            const assemblies = json.refers_to
                .map(rel => rel.node)
                .filter(el => { return el.quantity_to_assemble > 0 })
            // console.log(json)
            // console.log(assemblies)      
            const assemblables = atoms.concat(assemblies)

            res.status(201).send(assemblables)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to create the assembly'
            })
        }
    },

    async disassemble(req, res) {
        try {
            // find assembly and get its quantity
            const assembly = await db.model('Assembly').find(req.params.id)
            const assemblyJson = await assembly.toJson()
            // console.log('assemblyJson:', assemblyJson)
            const assemblyQuantity = assemblyJson.quantity

            // find assembly's parts, get their quantities from the relationship "assembled_from"
            const parts = assemblyJson.assembled_from.map(item => {
                return {
                    node: item.node,
                    quantity: item.quantity
                }
            })
            // console.log('parts:', parts)

            // for each part add to quantity_to_assemble the product of assembly's quantity 
            // and single part qty in relationship "assembled_from" 
            await Promise.all(parts.map(async item => {
                try {
                    const updated_quantity = item.node.quantity_to_assemble + assemblyQuantity * item.quantity
                    await db.mergeOn('Product', { uuid: item.node.uuid }, { quantity_to_assemble: updated_quantity })
                    // const retjson = await ret.toJson() 
                    // console.log(retjson)
                } catch (error) {
                    console.log(error)
                    res.status(500).send({
                        error: `An error has occured trying to update quantity_to assemble of Product with uuid:${item.node.uuid}`
                    });
                }
            }
            ))

            // delete assembly
            await assembly.delete()

            res.status(200).send({ msg: `assembly with uuid:${req.params.id} has been disassembled` });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to disassemble'
            });
        }
    },

    // neode bug needs to be fixed #141 on gitHub
    async updateAssemby(req, res){
        try {
            // console.log('assembly: ', req.body)
            const assembly = await db.model('Assembly').find(req.body.uuid)
            const assemblyUpdated = await assembly.update(req.body)
            const json = await assemblyUpdated.toJson()
            // console.log('atom updated:', json)
            // 200 for modified existing resource with PUT
            res.status(200).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: `An error has occurred trying to update assembly: ${req.body.uuid}`
            })
        }
    },    

    // check if this function is ever used
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