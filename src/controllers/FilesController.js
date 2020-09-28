const db = require('../db.js');
const fs = require('fs');

module.exports = {

    confirmCSVValidation(req, res) {
        fs.unlinkSync(req.file.path)    //remove file
        res.status(200).send({ msg: "bom.csv valid!" })
    },

    // function to load bom.csv to neo4j + add uuid + add quantity_to_assemble + add imageUrl
    async loadCSV(req, res) {
        try {
            const projectId = req.params.projectId
            const s3bomPath = req.s3bomPath
            // TODO find an alternative to save the image URL properties:
            // maybe use a cypehr query passing an array of image URLs after uploading images 
            const imagePath = process.env.AWS_S3_BASE_URL+`${projectId}/images/`
            await db.cypher(
                'LOAD CSV WITH HEADERS FROM $s3bomPath AS line \
                 MATCH (project:Project { uuid: $projectId}) \
                 CREATE ( \
                        atom:Atom:Product { \
                        uuid: apoc.create.uuid(),  \
                        itemNumber: toInteger(line.itemNumber), \
                        name: line.name, \
                        description: line.description, \
                        moq: toInteger(line.moq), \
                        quantity: toInteger(line.quantity), \
                        quantity_to_assemble: toInteger(line.quantity), \
                        unitCost: toFloat(line.unitCost), \
                        pseudoUnitCost: toFloat(line.totalCost) / toInteger(line.quantity) , \
                        totalCost: toFloat(line.totalCost), \
                        currency: line.currency, \
                        GTIN: toInteger(line.GTIN), \
                        SKU: line.SKU, \
                        vendorUrl: line.vendorUrl, \
                        leadTime: duration(line.leadTime), \
                        link: line.link, \
                        notes: line.notes, \
                        imageUrl: $imagePath + line.name + ".png" \
                        }  \
                    ) \
                CREATE (project)-[:CONSISTS_OF]->(atom)',
                { projectId: projectId, s3bomPath: s3bomPath, imagePath: imagePath })
                // .then(() => res.status(201).send({ msg: "BOM uploaded and sotored on db" }))

                const project = await db.model('Project').find(projectId)
                await project.update({ bopUrl: s3bomPath })

                res.status(201).send({ msg: "BOM uploaded and stored on db" })
        } catch (error) {
            console.log(error);
            res.status(400).send({msg: "something went wrong while uploading the BOM"})
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