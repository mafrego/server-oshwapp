module.exports = {
    labels: ["Questionnaire"],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true, 
    },
    name: 'string',
    dateTime: 'datetime',       // update
    answer0: 'string',
    answer1: 'string',
    answer2: 'string',
    answer3: 'string',
    fills_in: {
        type: "relationship",
        target: "Questionnaire",
        relationship: "FILLS_IN",
        direction: "in",
        eager: true // <-- eager load this relationship
    },
}
