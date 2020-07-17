//ABYME single module to manage connection to neo4j
const Neode = require('neode')

let neode = null

if (process.env.NODE_ENV === 'production') {
    // neode = new Neode(
    //     process.env.GRAPHENEDB_BOLT_URL,
    //     process.env.GRAPHENEDB_BOLT_USER,
    //     process.env.GRAPHENEDB_BOLT_PASSWORD,
    //     false,
    //     'ENCRYPTION_ON'
    // );
    neode = new Neode(
        process.env.GRAPHENEDB_BOLT_URL,
        process.env.GRAPHENEDB_BOLT_USER,
        process.env.GRAPHENEDB_BOLT_PASSWORD,
        false,
        'app177883617',
        { NEO4J_ENCRYPTION: 'ENCRYPTION_ON' }
    );
    neode.withDirectory(__dirname + '/models');
} else {
    neode = Neode
        .fromEnv()
        .withDirectory(__dirname + '/models');
}

async function asyncCall(neode) {
    try {
        const result = await neode.driver.verifyConnectivity();
        if (result) {
            console.log('result of verify driver connectivity:')
            console.log(result)
        }
    } catch (error) {
        console.log(error)
    }
}

asyncCall(neode);

module.exports = neode;
