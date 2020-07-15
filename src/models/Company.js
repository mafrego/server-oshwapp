module.exports = {
    labels: ['Company'],
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
        target: "Assembly",
        relationship: "ASSEMBLES",
        direction: "out",
        properties: {
            when: "localdatetime",
            place: "string"
        },
        eager: true // <-- eager load this relationship
    },
    manufactures: {
        type: "relationships",
        target: "Atom",
        relationship: "MANUFACTURES",
        direction: "out",
        properties: {
            place: "string",
            when: "localdatetime"
        },
        eager: true // <-- eager load this relationship
    }
}
