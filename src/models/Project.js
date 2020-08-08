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
    // states: create, assembling, rooted, released, forked, versioned
    state: 'string',
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
            version: 'string'
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
}
