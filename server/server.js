const bodyParser = require('body-parser');
const express = require('express');
const { mongoose } = require('./db/mongoose.js');
const { User } = require('./models/User');
const { Todo } = require('./models/Todo');

const PORT = 3000;

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

// app.get('/todos', (req, res) => {

// })

app.listen(PORT, err => {
  if (err) console.log(`There was an error ${err}`);
  console.log(`Server listening to port ${PORT}`);
})