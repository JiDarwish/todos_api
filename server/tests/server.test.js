const expect = require('expect');
const request = require('supertest');


const { app } = require('../server');
const { Todo } = require('../models/Todo');

const coupleTestingTodos = [
  {
    text: 'Do something'
  },
  {
    text: 'it\'s now or never'
  }
];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(coupleTestingTodos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('Should create a new todo', done => {
    const text = "Test todos route";

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err);


        Todo.find({ text }).then(todos => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done()
        }).catch(err => done(err));
      })
  });

  it('Should not create todo with bad body data', done => {
    const text = "";
    request(app)
      .post('/todos')
      .send({ text })
      .expect(400)
      .end((err, res) => {
        if (err) done(err);
      })

    Todo.find({ text }).then(todos => {
      expect(todos.length).toBe(0);
      done();
    }).catch(err => done(err));
  });
});

describe('GET /todos', () => {
  it('Should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done)

  });
});