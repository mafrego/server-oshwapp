module.exports = {
    labels: ["Atom", "Product"],
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
    totalCost: 'float',
    currency: 'string',     // ISO 4217
    GTIN:'string',
    SKU: 'string',
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
}
