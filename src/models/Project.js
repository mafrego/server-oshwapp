module.exports = {
    labels: ["Project"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    description: 'string',
    license: 'string',
    dateTime: 'datetime',
    //possible states: create, assembling, rooted, released, forked, versioned
    state: 'string',
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https', 'file']
        }
    },
    refers_to: {
        type: "relationships",
        target: "Assembly",
        relationship: "REFERS_TO",
        direction: "out",
        properties: {
            // possible types child, root
            type: 'string',
            version: 'string',
            quantity: 'int'
        },
        eager: true // <-- eager load this relationship
    },
    consists_of: {
        type: "relationships",
        target: "Atom",
        relationship: "CONSISTS_OF",
        direction: "out",
        properties: {
            quantity: 'int'
        },
        eager: true // <-- eager load this relationship
    },
    // for the moment this relationship doesn't make any sense
    // includes: {
    //     type: "relationships",
    //     target: "Project",
    //     relationship: "INCLUDES",
    //     direction: "out",
    //     properties: {
    //         someprop: 'string'
    //     },
    //     eager: true // <-- eager load this relationship
    // }
}
