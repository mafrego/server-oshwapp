const db = require('../db.js');
const CSVFileValidator = require('csv-file-validator')
const fs = require('fs');

// TODO refine config with all proper error functions and options
const config = {
    headers: [
        {
            name: 'atom name',
            inputName: 'name',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
            },
            unique: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            }
        },
        {
            name: 'atom description',
            inputName: 'description',
            required: false
        },
        {
            name: 'quantity',
            inputName: 'quantity',
            required: false,
        },
        {
            name: 'material',
            inputName: 'material',
            required: false
        },
        {
            name: 'weight',
            inputName: 'weight',
            required: false
        },
        {
            name: 'weight unit',
            inputName: 'weightUnit',
            required: false
        }
    ]
}

module.exports = {

    async manageFile(req, res) {
        try {
            let stream = fs.createReadStream(req.file.path);
            // validate BOM.csv file
            const result = await CSVFileValidator(stream, config)
                .then(ret => {
                    fs.unlinkSync(req.file.path);       //remove file
                    return ret;
                })
            if (result.inValidMessages.length) {
                console.log(result.inValidMessages)
                throw result.inValidMessages
            } else {
                // eliminate first element of result.data array because is empty object
                result.data.shift()
                // array of atom objects
                const atoms = result.data
                const projectId = req.params.projectId
                atoms.forEach(element => {
                    // it works: given Project create relationship to and node Atom
                    db.mergeOn('Project',
                        { uuid: projectId },
                        {
                            consists_of: [{ quantity: element.quantity, node: element }]
                        }
                    )
                });
                res.status(201).send({
                    message: 'Atoms of BOM created'
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: error
            })
        }
    },

    async uploadImages(req, res) {
        try {
            if (req.body.s3responses.length <= 0) {
                return res.send({message: 'no images were uploaded'});
            }
            res.status(201).send({
                message: 'Images uploaded!',
                s3responses: req.body.s3responses
            })
        } catch (error) {
            console.log(error)
        }
    },

    // just for testing
    testSingleFile(req, res){
        console.log(req.body)
        res.status(200).send({
            message: 'single file arrived!'
        })
    },
    testMultipleFiles(req, res){
        console.log(req.body)
        res.status(200).send({
            message: 'multiple files arrived!'
        })
    }
}