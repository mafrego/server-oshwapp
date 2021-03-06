const db = require('../db.js');
const { aws, BUCKET_NAME } = require('../aws.js')
const cypher = require('../service/cypher.js')

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

    async getAssemblies(req, res) {
        try {
            const project = await db.find('Project', req.params.id)
            const json = await project.toJson()
            const assemblies = await json.refers_to.map(el => el.node)
            res.status(200).send(assemblies)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: `An error has occured trying to fetch assemblies of project: ${req.arams.id}`
            })
        }
    },

    async createProject(req, res) {
        try {
            // TODO compose imageUrl from user image or other and select a random img
            req.body.imageUrl = process.env.AWS_S3_BASE_URL + "service/project.svg"
            const ret = await db.model('Project').create(req.body)
            const project = await ret.toJson()
            await db.mergeOn('User',
                { uuid: req.body.userID },
                { manages: [{ state: 'created', node: project.uuid }] }
            )
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
            let ret = null
            const newstate = req.body.state
            const projectId = req.params.id
            const project = await db.model('Project').find(projectId)
            if (newstate === 'released') {
                ret = await db.mergeOn('Project',
                    { uuid: projectId },
                    {
                        state: newstate, has_root: [{
                            version: req.body.version,
                            node: req.body.assemblyID
                        }]
                    }
                )
            } else {
                ret = await project.update({ state: newstate })
            }
            const json = await ret.toJson()
            // console.log('json:', json)
            res.status(200).send({
                project: json,
                message: `project: ${projectId} updated to state: ${newstate}`
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to update project state'
            })
        }
    },

    // wait for Adam's response
    async updateProject(req, res) {
        try {
            // console.log('req.body:', req.body)
            const projectId = req.params.id
            const project = await db.model('Project').find(projectId)
            const response = await project.update(req.body)
            // update is supposed to give back the udated property but it is not if property is set to null
            if (response) {
                const projectBis = await db.model('Project').find(projectId)
                const json = await projectBis.toJson()
                // console.log(json)
                res.status(200).send(json)
            }
                // const json = await response.toJson()
                // console.log(json)
                // res.status(200).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to update project metadata'
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

    // delete atoms in neo4j and corresponding images on S3 but not projectName-bom.csv file 
    async deleteBom(req, res) {
        const projectId = req.params.id
        try {
            const project = await db.model('Project').find(projectId)
            const projectJson = await project.toJson()
            const atoms = projectJson.consists_of.map(el => el.node)

            await cypher.deleteAllAtomsFromProject(projectId)

            // DELETE all images in S3 bucket
            if (atoms.length > 0) {         // Objects must not be empty otherwise s3 error
                const imageNames = projectJson.consists_of.map(el => el.node.name)
                const Objects = imageNames.map(name => ({ Key: req.params.id + "/images/" + name + ".png" }))
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
                    if (err) console.log('deleting atom images: ', err, err.stack)
                    else {
                        // console.log(data)
                        return data
                    }
                })
            }

            const projectWithNoAtoms = await db.model('Project').find(projectId)
            const updatedProject = await projectWithNoAtoms.update({ state: 'created' })
            const json = await updatedProject.toJson()
            // console.log('json:', json)
            res.status(200).send(json)

        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: `An error has occured trying to delete bom of project:${projectId}`
            });
        }
    },

    // delete all relative products and images in s3
    async delete(req, res) {
        const projectId = req.params.id
        try {

            const project = await db.model('Project').find(projectId)
            const projectJson = await project.toJson()
            const projectName = projectJson.name
            const atoms = projectJson.consists_of.map(el => el.node)
            const assemblies = projectJson.refers_to.map(el => el.node)

            await db.cypher(
                'MATCH (project:Project {uuid: $projectId}), \
                (project)-[:CONSISTS_OF]->(atom:Atom) \
                DETACH DELETE atom',
                { projectId: projectId }
            )
            await db.cypher(
                'MATCH (project:Project {uuid: $projectId}), \
                (project)-[:REFERS_TO]->(assembly:Assembly) \
                DETACH DELETE assembly',
                { projectId: projectId }
            )

            // DELETE all images in S3 bucket
            // you need to check that there are images stored on S3
            if (atoms.length > 0) {         // Objects must not be empty otherwise s3 error
                const imageNames = projectJson.consists_of.map(el => el.node.name)
                const Objects = imageNames.map(name => ({ Key: req.params.id + "/images/" + name + ".png" }))
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
                    if (err) console.log('deleting atom images: ', err, err.stack)
                    else {
                        // console.log(data)
                        return data
                    }
                })
            }

            if (assemblies.length > 0) {         // Objects must not be empty otherwise s3 error
                const imageNames = projectJson.refers_to.map(el => el.node.name)
                const Objects = imageNames.map(name => ({ Key: req.params.id + "/images/" + name + ".png" }))
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
                    if (err) console.log('deleting assembliy images: ', err, err.stack)
                    else {
                        // console.log(data)
                        return data
                    }
                })
            }

            // logic to delete folder with bom.csv in S3 bucket
            const s3 = new aws.S3()
            const bom = projectId + "/" + projectName + "-bom.csv"
            const toDelete = {
                Bucket: BUCKET_NAME,
                Key: bom
            }
            s3.deleteObject(toDelete, function (err, data) {
                if (err) console.log('deleting bom.csv:', err, err.stack)
                else {
                    // console.log(data)
                    return data
                }
            })

            // delete empty folder
            const emptyFolder = projectId + '/'
            const folderToDelete = {
                Bucket: BUCKET_NAME,
                Key: emptyFolder
            }
            s3.deleteObject(folderToDelete, function (err, data) {
                if (err) console.log('deleting empty project folder: ', err, err.stack)
                else {
                    // console.log(data)
                    return data
                }
            })

            // finally delete project node itself
            await project.delete()

            res.status(200).send({ msg: `project with uuid:${projectId} has been deleted` });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the project'
            });
        }
    },

    async updateProjectBom(req, res) {
        try {
            // console.log('req.body:', req.body)
            // console.log('updateProjectBomCalled')
            const projectName = req.body.projectName
            const fileName = projectName + "-bom.csv"
            // console.log('fileName:', fileName)
            const projectId = req.body.projectId
            const query = `MATCH (atom)<-[:CONSISTS_OF]-(project:Project) 
                WHERE project.uuid = "${projectId}" \
                RETURN atom.itemNumber AS itemNumber, \
                atom.name AS name, \
                atom.description AS description, \
                atom.moq AS moq, \
                atom.quantity AS quantity, \
                atom.unitCost AS unitCost, \
                atom.totalCost AS totalCost, \
                atom.currency AS currency, \
                atom.GTIN AS GTIN, \
                atom.SKU AS SKU, \
                atom.vendorUrl AS vendorUrl, \
                atom.leadTime AS leadTime, \
                atom.link AS link, \
                atom.notes AS notes \
                ORDER BY atom.itemNumber`

            const ret = await db.cypher(
                'WITH $query AS query \
                CALL apoc.export.csv.query(query, null, {quotes: false, stream: true}) \
                YIELD  data \
                RETURN data',
                { query: query })

            const pathName = `${projectId}/${fileName}`;
            const stream = ret.records[0]._fields[0]
            // console.log(stream)
            const s3 = new aws.S3()
            const retfromS3 = await s3.upload({
                Bucket: BUCKET_NAME,
                Key: pathName,
                Body: stream,
                ContentType: 'text/csv',
                ACL: 'public-read'
            }).promise()

            // console.log(retfromS3)
            res.status(200).send(retfromS3)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to download the project BOP'
            });
        }
    }

}