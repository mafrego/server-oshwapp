module.exports = {
    labels: ["Cage"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    imageUrl: {
        type: "string",
        uri: {
            scheme: ['http', 'https', 'file']
        }
    },
    populated: {
        type: "relationships",
        target: "GuineaPig",
        relationship: "POPULATED",
        direction: "in",
        properties: {
            from_date: 'date',
            to_date: 'date',
            duration: 'duration'
        },
        eager: true // <-- eager load this relationship
    }
}
