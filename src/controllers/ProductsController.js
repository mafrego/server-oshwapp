const db = require('../db.js');

module.exports = {


    async index(req, res) {
        try {
            let result = []
            const search = req.query.search
            const projects = await db.all('Project', { state: 'released' })
            const json = await projects.toJson()
            // console.log('projects: ', json)

            if (search) {
                json.forEach(element => { if( search === element.has_root[0].node.name){
                    let data = {}
                    data.name = element.has_root[0].node.name
                    data.description = element.has_root[0].node.description
                    data.imageUrl = element.has_root[0].node.imageUrl
                    data.link = element.link
                    data.bopUrl = element.bopUrl
                    data.country = element.country
                    data.version = element.version
                    data.author = element.manages.node.username
                    result.push(data)
                }
                });
            } else {
                json.forEach(element => {
                    let data = {}
                    data.name = element.has_root[0].node.name
                    data.description = element.has_root[0].node.description
                    data.imageUrl = element.has_root[0].node.imageUrl
                    data.link = element.link
                    data.bopUrl = element.bopUrl
                    data.country = element.country
                    data.version = element.version
                    data.author = element.manages.node.username
                    result.push(data)
                });
            }
            // console.log(result)
            res.status(200).send(result)

        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the roots'
            })
        }
    },

    async show(req, res) {
        try {
            const product = await db.model('Product').find(req.params.id)
            const json = await product.toJson()
            res.status(200).send(json);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: `An error has occured trying to fetch the product with uuid:${req.params.id}`
            });
        }
    },

    // NO NEED OF DISTINCTION!
    // distinguish between Compounds and Atoms 
    // async showbis(req, res) {
    //     try {
    //         let product = null
    //         let atom = null
    //         let isAnAssembly = await db.find('Assembly', req.params.id)
    //         // console.log(isAnAssembly)
    //         if (isAnAssembly) {
    //             product = await db.find('Assembly', req.params.id).then(ret => { return ret.toJson() })
    //             return res.status(200).send(product)
    //         } else {
    //             atom = await db.find('Atom', req.params.id).then(ret => { return ret.toJson() })
    //             // console.log(atom)
    //             return res.status(200).send(atom)
    //         }
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send({
    //             error: 'An error has occured trying to fetch the assemblies'
    //         })
    //     }
    // },

    // TODO refactor if eager relationship use method get('relationship_name') to get all nodes
    // and substitute .then()
    async getchildren(req, res) {
        try {
            // let children = null
            let assembly = null
            assembly = await db.model('Assembly').find(req.params.id)
                .then(res => { return res.toJson() })
                .then(json => {
                    console.log(json.assembled_from)
                    // console.log(json.assembled_from[0])
                    // console.log(json.assembled_from[0].quantity)
                    // console.log(json.assembled_from[0].node)
                    return json.assembled_from
                })
            res.status(200).send(assembly)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the assemblies'
            })
        }
    },


    // get tree from root in json format using cypher and apoc
    // if you want that only a root gets its tree add: WHERE NOT ()-[:MADE_WITH]->(n)
    async gettree(req, res) {
        try {
            let tree = null
            tree = await db.cypher('MATCH p=(n:Assembly {uuid: $uuid})-[:ASSEMBLED_FROM*]->(m)  WITH COLLECT(p) AS ps CALL apoc.convert.toTree(ps) yield value RETURN value;',
                { uuid: req.params.id })
                .then(ret => {
                    // console.log(ret)
                    return ret.records[0]._fields[0]
                })
            res.status(200).send(tree)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the tree'
            })
        }
    },

    // For now it has no sense create a product: only atoms and compounds
    // post(req, res){
    //     db.mergeOn('Product',
    //     req.body,
    //     {
    //         assembled_from: req.body.parts.map((uuid, index) => ({
    //             quantity: req.body.quantities[index],
    //             node: uuid  // This can be an ID or an object. Might be something else depending on your mapping, the default is node...  
    //         }))
    //     })
    //         .then(product => product.toJson())
    //         .then(json => {
    //             console.log(json);
    //             res.send(json)
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             res.status(500).send({
    //                 error: 'An error has occurred trying to create the product'
    //             })
    //         });
    // },

    async delete(req, res) {
        try {
            const product = await db.model('Product').find(req.params.id)
            await product.delete()
            console.log('product deleted');
            res.status(200).send({ msg: `product with uuid:${req.params.id} has been deleted` });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the product'
            });
        }
    }

}