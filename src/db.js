//ABYME single module to manage connection to neo4j
console.log(process.env.NEO4J_PROTOCOL)
console.log(process.env.NEO4J_HOST)
console.log(process.env.NEO4J_USERNAME)
console.log(process.env.NEO4J_PASSWORD)
console.log("ciao")

var neode = require('neode')
            .fromEnv()
            .withDirectory(__dirname+'/models');

console.log('connected to neo4j through neode')

module.exports = neode;
