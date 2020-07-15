//ABYME single module to manage connection to neo4j
import Neode from 'neode';

const neode

if (process.env.NODE_ENV === 'production') {
    const neode = new Neode(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD, true);
    neode.withDirectory(__dirname+'/models');
} else {
    neode = Neode
        // require('neode')
        .fromEnv()
        .withDirectory(__dirname + '/models');
}

console.log('connected to neo4j through neode')

module.exports = neode;
