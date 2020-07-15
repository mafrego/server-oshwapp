//ABYME single module to manage connection to neo4j
var neode = require('neode')
            .fromEnv()
            .withDirectory(__dirname+'/models');

console.log('connected to neo4j through neode')

module.exports = neode;
