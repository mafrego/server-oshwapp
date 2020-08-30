const db = require('../db.js');

module.exports = {


    async deleteAllAtomsFromProject(projectId) {
        try {
            await db.cypher(
                'MATCH (project:Project {uuid: $projectId}), \
                (project)-[:CONSISTS_OF]->(atom:Atom) \
                DETACH DELETE atom',
                { projectId: projectId }
            )
            .then( () => {return true})
        } catch (error) {
            console.log(error);
            return false
        }
    },

}