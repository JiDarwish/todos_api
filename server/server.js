require('./config/config');

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const { Types } = require('mongoose');
const bcrypt = require('bcryptjs');

const { mongoose } = require('./db/mongoose.js');
const { User } = require('./models/User');
const { Todo } = require('./models/Todo');
const { authenticate } = require('./middleware/middleware')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//////////////////////////////////////////////// TODOS
// POST
app.post('/todos', authenticate, (req, res) => {
  new Todo({
    text: req.body.text,
    _creator: req.user._id
  })
    .save()
    .then(doc => res.send(doc))
    .catch(err => res.status(400).send());
})

// GET all
app.get('/todos', authenticate, (req, res) => {
  Todo
    .find({ _creator: req.user._id })
    .then(todos => {
      res.send({
        todos
      });
    }).catch(err => {
      res.status(400).send(err);
    })
})

// GET single
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

// DELETE
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

// PATCH
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

/////////////////////////////////////////////// USERS

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  const user = new User(body);

  user.save()
    .then(newUser => {
      return newUser.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);

    });
})

app.post('/users/login', (req, res) => {
  const { email, password } = req.body;
  console.log('findCredential');
  User.findByCredentials(email, password)
    .then(user => {
      console.log('generate');
      user.generateAuthToken()
        .then(token => {
          console.log('setting header');
          res.header('x-auth', token).send(user);
        })
        .catch(err => res.status(500).send(err))
    })
    .catch(err => {
      console.log('oops')
      res.status(400).send()
    })
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
})

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token)
    .then(() => res.status(200).send())
    .catch(res.status(400).send);
})


app.listen(process.env.PORT, err => {
  if (err) console.log(`There was an error ${err}`);
  console.log(`Server listening to port ${process.env.PORT}`);
})

module.exports = { app }