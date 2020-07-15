module.exports = {
    labels: ["Todo"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    title: 'string',
    description: 'string',
    completed: 'int',
    priority: 'int'
}
