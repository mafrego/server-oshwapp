const db = require('../db.js');

module.exports = {

    async getAllTodos(req, res) {
        try {
            let todos = null
            const ret = await db.all('Todo')
            todos = await ret.toJson()
            res.status(200).send(todos)
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to fetch the todos'
            })
        }
    },

    async show(req, res) {
        try {
            const todo = await db.model('Todo').find(req.params.id)
            const json = await todo.toJson()
            res.status(200).send(json);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to fetch the todo'
            });
        }
    },

    async post(req, res) {
        try {
            const todo = await db.model('Todo').create(req.body)
            const json = await todo.toJson()
            res.status(201).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occurred trying to create the todo'
            })
        }
    },

    async put(req, res){
        try {
            const todo = await db.model('Todo').find(req.params.id) 
            const updated = await todo.update(req.body)
            const json = await updated.toJson()
            res.status(201).send(json)
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occurred trying to update the todo'
            })
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id
            console.log(id)
            const todo = await db.model('Todo').find(id)
            if(todo){
                await todo.delete()
                res.status(200).send({ msg: `todo with uuid:${id} has been deleted` })
            }else{
                res.status(404).send({msg: `no todo with uuid:${id} found`})
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: 'An error has occured trying to delete the todo'
            });
        }
    }

}