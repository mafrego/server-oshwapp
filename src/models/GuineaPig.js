module.exports = {
    labels: ["GuineaPig"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    description: 'string',
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https', 'file']
        }
    },
    lived_in: {
        type: "relationships",
        target: "Cage",
        relationship: "LIVED_IN",
        direction: "out",
        properties: {
            from_date: 'date',
            to_date: 'date',
            duration: 'duration'
        },
        eager: true // <-- eager load this relationship
    }
}
