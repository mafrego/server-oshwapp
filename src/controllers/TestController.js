module.exports = {

    async getAllTodos(req, res) {
        try {
            res.status(200).send({msg: 'test arrived'})
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: 'An error has occured trying to test the test'
            })
        }
    },

}