module.exports = {
    labels: ["Assembly", "Product"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    description: 'string',
    quantity: 'int',
    quantity_to_assemble: 'int',
    instruction: 'string',
    totalCost: 'float',         //sum of cost of its parts, shippingCosts included
    link: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
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
