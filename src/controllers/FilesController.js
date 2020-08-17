const db = require('../db.js');

module.exports = {

    // KEEP IT!!! in case you need the code
    // async storeBom(req, res) {
    //     // eliminate first element of result.data array because is empty object
    //     req.result.data.shift()
    //     const atoms = req.result.data
    //     const projectId = req.params.projectId
    //     try {
    //         await Promise.all(atoms.map(async atom => {
    //             atom.quantity_to_assemble = atom.quantity
    //             await db.mergeOn('Project',
    //                 { uuid: projectId },
    //                 {
    //                     consists_of: [{
    //                         node: atom
    //                     }]
    //                 }
    //             )
    //         }
    //         )).then(() => res.status(201).send({ message: 'all atoms linked to project'}))
    //     }
    //     catch (error) {
    //         console.log(error)
    //         res.status(500).send({
    //             error: 'An error has occurred trying to link atoms to project'
    //         })
    //     }
    // },

    // KEEP IT!!! in case you need the code
    // async storeBom(req, res) {
    //     // eliminate first element of result.data array because is empty object
    //     req.result.data.shift()
    //     const atoms = req.result.data
    //     const projectId = req.params.projectId
    //     try {
    //         await Promise.all(atoms.map(async atom => {
    //             await db.cypher(
    //                 'MATCH (project:Project { uuid: $projectId}) \
    //                 MERGE (project)-[r:CONSISTS_OF]->(atom:Atom:Product { \
    //                     name: $atom.name, \
    //                     uuid: apoc.create.uuid(), \
    //                     quantity: $atom.quantity, \
    //                     quantity_to_assemble: $atom.quantity, \
    //                     description: $atom.description, \
    //                     costUnit: $atom.costUnit, \
    //                     currency: $atom.currency, \
    //                     code: $atom.code \
    //                 }) \
    //                 RETURN project.name, type(r), atom.name',
    //                 { atom: atom, projectId: projectId })
    //         }
    //         )).then(
    //         res.status(201).send({
    //             message: 'all atoms linked to project'
    //         }))
    //     }
    //     catch (error) {
    //         console.log(error)
    //         res.status(500).send({
    //             error: 'An error has occurred trying to link atoms to project'
    //         })
    //     }
    // },

    // function to load bom.csv to neo4j + add uuid + add quantity_to_assemble + add imageUrl
    async loadCSV(req, res) {
        try {
            const projectId = req.params.projectId
            const bomPath = `https://oshwapp.s3.eu-central-1.amazonaws.com/${projectId}/bom.csv`
            const imagePath = `https://oshwapp.s3.eu-central-1.amazonaws.com/${projectId}/images/`
            await db.cypher(
                'LOAD CSV WITH HEADERS FROM $bomPath AS line \
                 MATCH (project:Project { uuid: $projectId}) \
                 CREATE ( \
                        atom:Atom:Product { \
                        name: line.name, \
                        description: line.description, \
                        uuid: apoc.create.uuid(),  \
                        quantity: toInteger(line.quantity), \
                        quantity_to_assemble: toInteger(line.quantity), \
                        cost: toFloat(line.cost), \
                        currency: line.currency, \
                        code: line.code, \
                        link: line.link, \
                        vendorUrl: line.vendorUrl, \
                        moq: toInteger(line.moq), \
                        leadTime: duration(line.leadtime), \
                        material: line.material, \
                        weight: toFloat(line.weight), \
                        notes: line.notes, \
                        imageUrl: $imagePath + line.name + ".png" \
                        }  \
                    ) \
                CREATE (project)-[:CONSISTS_OF]->(atom)',
                { projectId: projectId, bomPath: bomPath, imagePath: imagePath }
            ).then(() => res.status(201).send({ msg: "BOM uploaded and sotored on db" }))
            // console.log(ret)
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    },

    // TODO remove async and try/catch
    async uploadImages(req, res) {
        try {
            if (req.results.length <= 0) {
                return res.status(200).send({ message: 'no images uploaded' });
            }
            res.status(201).send({
                message: 'Images uploaded!',
                // s3responses: req.results
            })
        } catch (error) {
            console.log(error)
        }
    },

}