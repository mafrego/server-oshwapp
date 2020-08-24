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
    leadTime: 'duration',       //IS0 8601
    notes: 'string',
    quantity: 'int',
    quantity_to_assemble: 'int',
    material: 'string',
    weight: 'float',        //in Kg
    cost: 'float',
    currency: 'string',     // ISO 4217
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https']
        }
    },
}
