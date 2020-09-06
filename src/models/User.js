module.exports = {
    labels: ['User'],
    uuid: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    username: 'string',
    email: 'string',
    password: 'string',
    description: {
        required: false,
        type: 'string'
    },
    has_role: {
        type: "relationships",
        target: "Role",
        relationship: "HAS_ROLE",
        direction: "out",
        eager: true // <-- eager load this relationship
    },
    manages: {
        type: "relationships",
        target: "Project",
        relationship: "MANAGES",
        direction: "out",
        properties: {
            from: 'date',
            state: 'string'
        },
        eager: true // <-- eager load this relationship
        // eager: false // <-- no eager load this relationship
    },
    evaluates: {
        type: "relationships",
        target: "Project",
        relationship: "EVALUATES",
        direction: "out",
        properties: {
            vote: 'int'
        },
        eager: true // <-- eager load this relationship
    },
    works_for: {
        type: "relationships",
        target: "Company",
        relationship: "WORKS_FOR",
        direction: "out",
        properties: {
            role: "string"
        },
        eager: true // <-- eager load this relationship
    },
    answers: {
        type: "relationship",
        target: "Questionnaire",
        relationship: "ANSWERS",
        direction: "out",
        eager: true // <-- eager load this relationship
    },
}
