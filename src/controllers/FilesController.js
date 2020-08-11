const db = require('../db.js');

module.exports = {

    // used as middleware function for storing atoms before calling getBom() in ProjectController
    // TODO refactor: use map and ret something to pass to send or use Promise all
    async storeBom(req, res) {
        try {
            // eliminate first element of result.data array because is empty object
            req.result.data.shift()
            // array of atom objects from middleware
            const atoms = req.result.data
            // console.log(atoms)
            const projectId = req.params.projectId
            atoms.forEach(async element => {
                try {
                    element.quantity_to_assemble = element.quantity
                    // it works: given Project create relationship to and node Atom
                    await db.mergeOn('Project',
                        { uuid: projectId },
                        {
                            consists_of: [{
                                node: element
                            }]
                        }
                    )
                } catch(error) {
                    console.log(error)
                    res.status(500).send({
                        error: 'An error has occurred trying to link atom to project'
                    })
                }
            });
            res.status(201).send({ msg: 'bom uploaded!' })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                error: 'An error has occurred trying to store bom on db'
            })
        }
    },

    async uploadImages(req, res) {
        try {
            if (req.results.length <= 0) {
                return res.status(200).send({ message: 'no images uploaded' });
            }
            res.status(201).send({
                message: 'Images uploaded!',
                s3responses: req.results
            })
        } catch (error) {
            console.log(error)
        }
    },

    // just for testing
    testSingleFile(req, res) {
        console.log(req.body)
        res.status(200).send({
            message: 'single file arrived!'
        })
    },
    testMultipleFiles(req, res) {
        console.log(req.body)
        res.status(200).send({
            message: 'multiple files arrived!'
        })
    }
}