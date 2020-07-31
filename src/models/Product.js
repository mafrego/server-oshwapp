module.exports = {
    labels: ["Product"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    description: 'string',
    quantity: 'int',
    quantity_to_assemble: 'int',
    material: 'string',
    weight: 'float',
    weightUnit: 'string',
    license: 'string',
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    built_with: {
        type: "relationships",
        target: "Product",
        relationship: "BUILT_WITH",
        direction: "out",
        properties: {
            quantity: 'int',
            duration: 'duration'
        },
        eager: true // <-- eager load this relationship
    },
    assembled_from: {
        type: "relationships",
        target: "Product",
        relationship: "ASSEMBLED_FROM",
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