const { Types } = require('mongoose');
const { Todo } = require('../../models/Todo');


const testTodos = [
  {
    _id: new Types.ObjectId(),
    text: 'Do something'
  },
  {
    _id: new Types.ObjectId(),
    text: 'it\'s now or never',
    completed: true,
    completedAt: 333
  }
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    console.log('\n\n\n\n\n HEREERERERE n\n\n\n\n\n\n')
    return Todo.insertMany(testTodos);

  }).then(() => done());
};

module.exports = { testTodos, populateTodos };
