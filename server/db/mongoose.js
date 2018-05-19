const mongoose = require('mongoose');
const { mongoURL } = require('../config/config');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = { mongoose }