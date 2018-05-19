const expect = require('expect');
const request = require('supertest');
const { Types } = require('mongoose');


const { app } = require('../server');
const { Todo } = require('../models/Todo');

const oneId = new Types.ObjectId().toHexString();
const coupleTestingTodos = [
  {
    _id: new Types.ObjectId(),
    text: 'Do something'
  },
  {
    _id: new Types.ObjectId(),
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

describe('GET /todos/:id', () => {
  it('Should return todo doc', done => {

    request(app)
      .get(`/todos/${coupleTestingTodos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.text).toBe(coupleTestingTodos[0].text);
      })
      .end(done)
  });

  it('Should return 404 if todo not found', done => {
    const objectId = new Types.ObjectId();
    request(app)
      .get(`/todos/${objectId.toHexString()}`)
      .expect(404)
      .end(done)
  });

  it('Should return 400 if not a valid id', done => {
    request(app)
      .get('/todos/123')
      .expect(400)
      .end(done);
  });

});


describe('DELETE /todos/:id', () => {
  it('Should remove a todo and return it', done => {
    request(app)
      .delete(`/todos/${coupleTestingTodos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.text).toBe(coupleTestingTodos[0].text);
      })
      .end(done);
  });

  it('Should return 400 if id not valid', done => {
    request(app)
      .delete('/todos/123')
      .expect(400)
      .end(done);
  });

  it('should return 404 if todo is not found', done => {
    request(app)
      .delete(`/todos/5b001decd316650a20a1a3df`)
      .expect(404)
      .end(done)
  });
});