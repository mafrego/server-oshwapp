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

    //it works
    async showBom(req, res) {
        const project = db.model('Project')
        try {
            const bom = await project.find(req.query.projectID)
                .then(ret => {
                    console.log('ret: ' + ret)
                    return ret.toJson()
                })
                .then(pro => {
                    console.log(pro)
                    // get all user projects and assign them to array pros
                    const arr = pro.consists_of.map(rel => rel.node);
                    console.log('arr: ' + arr)
                    return arr
                })
            console.log('bom: ' + bom)
            res.send(bom)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch the projectBOM'
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
            const updatedRet = await ret.update({ state: state })
            const project = await updatedRet.toJson()
            res.status(200).send(project)
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
            // nodes with relationships consist_of and refers_to to delete 
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
            // TODO replicate code above for assemblies

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
            // finally delete project node itself
            await project.delete()
            // console.log(`deleted project with uuid:${req.params.id}`);
            res.status(200).send({ msg: `project with uuid:${req.params.id} has been deleted` });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the project'
            });
        }
    }

}