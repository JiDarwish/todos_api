require('./config/config');

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const { Types } = require('mongoose');
const { mongoose } = require('./db/mongoose.js');
const { User } = require('./models/User');
const { Todo } = require('./models/Todo');

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
      todos: todo
    });
  }).catch(err => {
    res.status(400).send(err);
  })
})


app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).send();
  }

  Todo.findByIdAndRemove(id).then(doc => {
    if (!doc) {
      return res.status(404).send();
    }
    res.send({ todos: doc });
  })
})

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).send({ err: "Not a valid todo id" });
  }

  const body = _.pick(req.body, ['text', 'completed']);

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
    if (!todo) {
      return res.status(404).send('No todo with this id found');
    }
    res.send({ todos: todo });
  })
    .catch(err => err && console.log(err));

})

app.listen(process.env.PORT, err => {
  if (err) console.log(`There was an error ${err}`);
  console.log(`Server listening to port ${process.env.PORT}`);
})

module.exports = { app }