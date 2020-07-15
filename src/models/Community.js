// I keep this model but I don't thing I going to use it
module.exports = {
    labels: ['Community'],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    name: 'string',
    email: 'string',
    place: 'string',
    website: 'string',
    sells: {
        type: "relationships",
        target: "Product",
        relationship: "SELLS",
        direction: "out",
        properties: {
            price: "float",
            currency: "string"
        },
        eager: true // <-- eager load this relationship
    },
    assembles: {
        type: "relationships",
        target: "Product",
        relationship: "ASSEMBLES",
        direction: "out",
        properties: {
            place: "string"
        },
        eager: true // <-- eager load this relationship
    },
    manufactures: {
        type: "relationships",
        target: "Product",
        relationship: "MANUFACTURES",
        direction: "out",
        properties: {
            place: "string"
        },
        eager: true // <-- eager load this relationship
    }
}
