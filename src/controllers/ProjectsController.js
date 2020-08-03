const db = require('../db.js');
const aws = require("aws-sdk");

const BUCKET_NAME = process.env.BUCKET_NAME
const AWSAccessKeyId = process.env.AWSAccessKeyId
const AWSSecretKey = process.env.AWSSecretKey

if (process.env.NODE_ENV === 'production') {
    aws.config = new aws.Config();
    aws.config.accessKeyId = AWSAccessKeyId
    aws.config.secretAccessKey = AWSSecretKey
    aws.config.region = 'eu-central-1'
} else {
    aws.config.update({
        accessKeyId: AWSAccessKeyId,
        secretAccessKey: AWSSecretKey,
        region: 'eu-central-1'
    })
}

module.exports = {

    async index(req, res) {
        try {
            const user = await db.model('User').find(req.query.userID)
            const json = await user.toJson()
            const projects = await json.manages.map(rel => rel.node)
            res.status(200).send(projects)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the projects'
            })
        }
    },

    async show(req, res) {
        try {
            const atom = await db.model('Project').find(req.params.id)
            const json = await atom.toJson()
            res.status(200).send(json);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch the project'
            });
        }
    },

    async getAssemblables(req, res) {
        try {
            const project = await db.model('Project').find(req.params.id)
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
            // console.log(assemblables)
            res.status(200).send(assemblables)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch the assemblable products'
            });
        }
    },

    async getBom(req, res) {
        try {
            const project = await db.find('Project', req.params.id)
            const json = await project.toJson()
            const bom = await json.consists_of.map(el => el.node)
            res.status(200).send(bom)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch the project BOM'
            })
        }
    },

    async getAllProducts(req, res) {
        try {
            const project = await db.find('Project', req.params.id)
            const json = await project.toJson()
            const atoms = await json.consists_of.map(el => el.node)
            const assemblies = await json.refers_to.map(el => el.node)
            const products = atoms.concat(assemblies)
            res.status(200).send(products)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch all products'
            })
        }
    },

    async createProject(req, res) {
        try {
            // TODO compose imageUrl from env. variable and user image or other
            req.body.imageUrl = "https://oshwapp.s3.eu-central-1.amazonaws.com/service/project.svg"
            const ret = await db.model('Project').create(req.body)
            const project = await ret.toJson()
            await db.mergeOn('User', { uuid: req.body.userID }, { manages: [{ state: 'created', node: project.uuid }] })
            res.status(201).send(project)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to create the project'
            })
        }
    },

    async updateProjectState(req, res) {
        try {
            const state = req.body.state
            const projectId = req.params.id
            const ret = await db.model('Project').find(projectId)
            await ret.update({ state: state })
            res.status(200).send({
                state: state,
                message: `project: ${projectId} updated to state: ${state}`
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to update project state'
            })
        }
    },

    async updateUser(req, res) {
        try {
            let user = null
            user = await db.model('User')
                .mergeOn(req.userID, { manages: { properties: { status: 'created' }, node: req.projectID } })
            console.log(user)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to mergeOn the user'
            })
        }
    },

    // delete all relative products and images in s3
    async delete(req, res) {
        try {
            //delete all nodes with relationship consist_of(atoms)
            const project = await db.model('Project').find(req.params.id)
            const projectJson = await project.toJson()
            const atoms = projectJson.consists_of.map(el => el.node)
            await Promise.all(
                atoms.map(async atom => {
                    try {
                        const atomToDelete = await db.model('Atom').find(atom.uuid)
                        await atomToDelete.delete()
                        // console.log(`deleted atom with uuid:${atom.uuid}`)
                    } catch (error) {
                        console.log(error)
                        res.status(500).send({
                            error: `An error has occured trying to delete the atom with uuid:${atom.uuid}`
                        });
                    }
                })
            )
            //delete all nodes with relationship refers_to(assemblies)
            const assemblies = projectJson.refers_to.map(el => el.node)
            await Promise.all(
                assemblies.map(async assembly => {
                    try {
                        const assemblyToDelete = await db.model('Assembly').find(assembly.uuid)
                        await assemblyToDelete.delete()
                        // console.log(`deleted assembly with uuid:${assembly.uuid}`)
                    } catch (error) {
                        console.log(error)
                        res.status(500).send({
                            error: `An error has occured trying to delete the assembly with uuid:${assembly.uuid}`
                        });
                    }
                })
            )

            // TODO add logic for assembly images
            // array of objects(imagename.png) to delete on s3
            if (atoms.length > 0) {         // Objects must not be empty otherwise s3 error
                const imageNames = projectJson.consists_of.map(el => el.node.name)
                const Objects = imageNames.map(name => ({ Key: req.params.id + "/" + name + ".png" }))
                // console.log(Objects)
                const toDelete = {
                    Bucket: BUCKET_NAME,
                    Delete: {
                        Objects: Objects,
                        Quiet: false
                    }
                }

                const s3 = new aws.S3()
                s3.deleteObjects(toDelete, function (err, data) {
                    if (err) console.log(err, err.stack)
                    else console.log(data)
                })
            }

            if (assemblies.length > 0) {         // Objects must not be empty otherwise s3 error
                const imageNames = projectJson.refers_to.map(el => el.node.name)
                const Objects = imageNames.map(name => ({ Key: req.params.id + "/" + name + ".png" }))
                // console.log(Objects)
                const toDelete = {
                    Bucket: BUCKET_NAME,
                    Delete: {
                        Objects: Objects,
                        Quiet: false
                    }
                }

                const s3 = new aws.S3()
                s3.deleteObjects(toDelete, function (err, data) {
                    if (err) console.log(err, err.stack)
                    else console.log(data)
                })
            }


            // finally delete project node itself
            await project.delete()
            // console.log(`deleted project with uuid:${req.params.id}`);
            res.status(200).send({ misg: `project with uuid:${req.params.id} has been deleted` });
            // console.log(response)
            // res.status(200).send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the project'
            });
        }
    }

}