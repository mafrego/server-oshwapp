module.exports = {
    labels: ["Product"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    itemNumber: 'int',
    name: 'string',
    vendorCode: 'string',
    description: 'string',
    moq: 'int',
    quantity: 'int',
    quantity_to_assemble: 'int',
    unitCost: 'float',
    pseudoUnitCost: 'float',
    totalCost: 'float',
    currency: 'string',     // ISO 4217
    GTIN:'string',
    SKU: 'string',
    instruction: 'string',
    vendorUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    leadTime: 'duration',       //IS0 8601
    link: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
    notes: 'string',
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