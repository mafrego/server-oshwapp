module.exports = {
    labels: ["Project"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    description: 'string',
    license: 'string',       //does it make sense?
    version: 'string',          // semantic version
    country: 'string',           // ISO 3166-1
    region: 'string',           // ISO 3166-2
    dateTime: 'datetime',       // creation
    // states: create, assembling, rooted, released, forked, versioned
    state: 'string',
    currency: 'string',
    bopUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    link: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https', 'file']
        }
    },
    has_root: {
        type: "relationships",
        target: "Assembly",
        relationship: "HAS_ROOT",
        direction: "out",
        properties: {
            version: 'string'       //version property of relationship or of project itself?
        },
        eager: true // <-- eager load this relationship
    },
    refers_to: {
        type: "relationships",
        target: "Assembly",
        relationship: "REFERS_TO",
        direction: "out",
        properties: {
            quantity_to_assemble: 'int'
        },
        eager: true // <-- eager load this relationship
    },
    consists_of: {
        type: "relationships",
        target: "Atom",
        relationship: "CONSISTS_OF",
        direction: "out",
        properties: {
            quantity_to_assemble: 'int'
        },
        eager: true // <-- eager load this relationship
    },
    manages: {
        type: "relationship",
        target: "User",
        relationship: "MANAGES",
        direction: "in",
        properties: {
            from: 'date',
            state: 'string'
        },
        eager: true // <-- eager load this relationship
    },
}
