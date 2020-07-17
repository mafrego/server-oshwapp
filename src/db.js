//ABYME single module to manage connection to neo4j
const Neode = require('neode')

let neode = null

if (process.env.NODE_ENV === 'production') {
    neode = new Neode(
        process.env.GRAPHENEDB_BOLT_URL,
        process.env.GRAPHENEDB_BOLT_USER,
        process.env.GRAPHENEDB_BOLT_PASSWORD,
        false,
        // process.env.GRAPHENEDB_ENCRYPTION
        'ENCRYPTION_ON'
        );
    neode.withDirectory(__dirname + '/models');
} else {
    neode = Neode
        .fromEnv()
        .withDirectory(__dirname + '/models');
}

async function asyncCall(neode) {
    const result = await neode.driver.verifyConnectivity();
    if (result) {
        console.log('connected to neo4j through neode')
        console.log(result);
    } else {
        console.log('no connection to neo4j established')
    }
}

asyncCall(neode);
console.log('connected to neo4j through neode')

module.exports = neode;
