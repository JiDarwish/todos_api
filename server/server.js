const bodyParser = require('body-parser');
const express = require('express');
const { Types } = require('mongoose');
const { mongoose } = require('./db/mongoose.js');
const { User } = require('./models/User');
const { Todo } = require('./models/Todo');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  })
    .save()
    .then(doc => res.send(doc), err => res.status(400).send(err))

})

app.get('/todos', (req, res) => {
  Todo.find().then(todos => {
    res.send({
      todos
    });
  }).catch(err => {
    res.status(400).send(err);
  })
})


app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).send();
  }
  Todo.findById(id).then(todo => {
    if (!todo) {
      res.status(404).send({ err: 'No todo with this id found' })
    }
    res.send({
      todo
    });
  }).catch(err => {
    res.status(400).send(err);
  })


})

app.listen(PORT, err => {
  if (err) console.log(`There was an error ${err}`);
  console.log(`Server listening to port ${PORT}`);
})

module.exports = { app }