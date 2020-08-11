module.exports = {
    labels: ["Atom", "Product"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    code: 'string',
    description: 'string',
    link: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    vendorUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    moq: 'int',
    leadTime: 'duration',
    notes: 'string',
    quantity: 'int',
    quantity_to_assemble: 'int',
    material: 'string',
    weight: 'float',
    weightUnit: 'string',
    costUnit: 'float',
    currency: 'string',
    license: 'string',
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https', 'file']
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
    }
}
