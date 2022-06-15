const routes = require('express').Router();
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const { signIn, signUp, signOut } = require('../controllers/users');
const { signInValidation, signUpValidation } = require('../middlewares/validation');
const auth = require('../middlewares/auth');

const NotFoundError = require('../errors/notfound');

const ERRORS = require('../utils/errorMessages');

routes.post('/signin', signInValidation, signIn);
routes.post('/signup', signUpValidation, signUp);
routes.post('/signout', auth, signOut);
routes.use('/users', auth, usersRouter);
routes.use('/movies', auth, moviesRouter);
routes.use('*', () => {
  throw new NotFoundError(ERRORS.THE_SERVER_CANNOT_FIND_THE_DATA_AS_REQUESTED);
});

module.exports = routes;
