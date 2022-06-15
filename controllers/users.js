const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../errors/badrequest');
const ConflictError = require('../errors/conflict');
const NotFoundError = require('../errors/notfound');
const ServerError = require('../errors/server');
const UnauthorizedError = require('../errors/unauthorized');

const ERRORS = require('../utils/errorMessages');

const signIn = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      );
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      }).send({ _id: user._id, name: user.name, email: user.email, token });
    })
    .catch(() => {
      throw new UnauthorizedError(ERRORS.INVALID_LOGIN_DATA_PASSED);
    })
    .catch(next);
};

const signUp = (req, res, next) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => res.send({
      name: user.name,
      email: user.email,
      _id: user._id,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(ERRORS.INVALID_DATA_PASSED_WHEN_CREATING_USER);
      } else if (err.code === 11000) {
        throw new ConflictError(ERRORS.THE_USER_WITH_THE_GIVEN_EMAIL_ALREADY_EXISTS);
      } else {
        throw new ServerError(ERRORS.SOMETHING_WENT_WRONG);
      }
    })
    .catch(next);
};

const signOut = (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выполнен выход.' });
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError(ERRORS.INVALID_DATA_TRANSFERRED);
      }
      next(err);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  return User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError(ERRORS.THE_USER_WITH_THE_SPECIFIED__ID_WAS_NOT_FOUND);
      } else if (err.name === 'CastError') {
        throw new BadRequestError(ERRORS.INVALID_DATA_TRANSMITTED_WHEN_UPDATING_PROFILE);
      } else if (err.code === 11000) {
        throw new ConflictError(ERRORS.THE_USER_WITH_THE_GIVEN_EMAIL_ALREADY_EXISTS);
      } else {
        throw new ServerError(ERRORS.SOMETHING_WENT_WRONG);
      }
    })
    .catch(next);
};

module.exports = {
  signIn,
  signUp,
  signOut,
  getUser,
  updateUser,
};
