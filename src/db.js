//ABYME single module to manage connection to neo4j
const Neode = require('neode')

let neode = null

if (process.env.NODE_ENV === 'production') {
    neode = new Neode(
        process.env.GRAPHENEDB_BOLT_URL,
        process.env.GRAPHENEDB_BOLT_USER,
        process.env.GRAPHENEDB_BOLT_PASSWORD,
        false,
        null,
        { encrypted: 'ENCRYPTION_ON' }
    );
    neode.withDirectory(__dirname + '/models');
} else {
    // alternative to get neode
    // neode = Neode
    //     .fromEnv()
    //     .withDirectory(__dirname + '/models');
    neode = new Neode(
        process.env.NEO4J_BOLT_URL,
        process.env.NEO4J_USERNAME,
        process.env.NEO4J_PASSWORD
    );
    neode.withDirectory(__dirname + '/models')
}

async function asyncCall(neode) {
    try {
        const result = await neode.driver.verifyConnectivity();
        if (result) {
            console.log('result of neode.driver.verifyConnectivity():')
            console.log(result)
        }
    } catch (error) {
        console.log(error)
    }
}

asyncCall(neode);

module.exports = neode;
