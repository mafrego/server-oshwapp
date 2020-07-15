module.exports = {
    labels: ["Atom", "Product"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    description: 'string',
    //quantity: 'int',
    material: 'string',
    weight: 'float',
    weightUnit: 'string',
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
