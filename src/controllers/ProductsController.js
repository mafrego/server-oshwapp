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
                    data.uuid = element.has_root[0].node.uuid
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
                    data.uuid = element.has_root[0].node.uuid
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
            // let tree = null
            const tree = await db.cypher(
                'MATCH p=(n:Assembly {uuid: $uuid})-[:ASSEMBLED_FROM*]->(m) WITH COLLECT(p) AS ps CALL apoc.convert.toTree(ps) yield value RETURN value',
                { uuid: req.params.id })
                .then(ret => {
                    // console.log(ret)
                    return ret.records[0]._fields[0]
                })
                // console.log('tree:', tree)
            res.status(200).send(tree)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the tree'
            })
        }
    },

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