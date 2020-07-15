module.exports = {
    labels: ["Compound", "Product"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    description: 'string',
    atom: 'int',
    compound: 'int',
    license: 'string',
    "imageUrl": {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    made_with: {
        type: "relationships",
        target: "Product",
        relationship: "MADE_WITH",
        direction: "out",
        properties: {
            quantity: 'int'
        },
        eager: true // <-- eager load this relationship
    },
    assembled_with: {
        type: "relationships",
        target: "Product",
        relationship: "ASSEMBLED_WITH",
        direction: "out",
        properties: {
            duration: 'duration'
        },
        eager: true // <-- eager load this relationship
    }
}
