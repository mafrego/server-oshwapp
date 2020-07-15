const db = require('../db.js');

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
                error: 'An error has occured trying to fetch the atom'
            });
        }
    },
    
    //it works
    async showBom(req, res){
        const project = db.model('Project')
        try {
            const bom = await project.find(req.query.projectID)
                .then(ret => {
                    console.log('ret: '+ret)
                    return ret.toJson()
                })
                .then(pro =>{
                    console.log(pro)
                    // get all user projects and assign them to array pros
                    const arr = pro.consists_of.map(rel => rel.node);
                    console.log('arr: '+arr)
                    return arr
                })
            console.log('bom: '+bom)
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

    async updateUser(req, res){
        try {
            let user = null
            user = await db.model('User')
                            .mergeOn(req.userID, { manages: {properties: {status: 'created'}, node: req.projectID}})
            console.log(user)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to mergeOn the user'
            })
        }
    },

    async delete(req, res) {
        try {
            const product = await db.model('Project').find(req.params.id)
            await product.delete()
            console.log('project deleted');
            res.status(200).send({ msg: `project with uuid:${req.params.id} has been deleted` });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the project'
            });
        }
    }

}