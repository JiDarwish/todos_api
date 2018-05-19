const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
  process.env.PORT = 3000;
} else if (env === 'test') {
  console.log('herererere');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
  process.env.PORT = 3000;
}