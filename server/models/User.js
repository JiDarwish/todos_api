const validator = require('validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


const UserSchema = new mongoose.Schema({
  email: {
    required: true,
    trim: true,
    type: String,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});


UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'supersecretDude').toString();
  user.tokens = user.tokens.concat([{ token, access }]);
  return user.save()
    .then(() => token)
    .catch(err => console.log(err));
}

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  return _.pick(user, ['_id', 'email']);
}

UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, 'supersecretDude')
  } catch (err) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}


UserSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10)
    .then(salt => {
      return bcrypt.hash(user.password, salt)
    })
    .then(hashedPass => {
      console.log('hashed', hashedPass);
      user.password = hashedPass;
      next();
    })
})

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this;

  return User.findOne({ email })
    .then(user => {
      if (!user) {
        return Promise.reject();
      }

      return bcrypt.compare(password, user.password)
        .then(isAuth => {
          if (!isAuth) {
            return Promise.reject();
          }
          return user;
        })
        .catch(err => {
          console.log(err);
          return Promise.reject();
        })
    }).catch(err => {
      console.log(err);
      return Promise.reject();
    })
}

UserSchema.methods.removeToken = function (token) {
  const user = this;
  return user.update({ $pull: { tokens: { token } } }); // remove element with the same token from array
}


module.exports = { User: mongoose.model('User', UserSchema) };