const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/unauthorized');

const ERRORS = require('../utils/errorMessages');

module.exports = (req, res, next) => {
  function getToken() {
    let token = '';

    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '')
    }
    return token;
  }

  if (!getToken()) {
    throw new UnauthorizedError(ERRORS.AUTHORIZATION_FAILED_JWT_NOT_FOUND);
  }

  const { NODE_ENV, JWT_SECRET } = process.env;
  const secretKey = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';

  try {
    const payload = jwt.verify(getToken(), secretKey);
    req.user = payload;
  } catch (err) {
    throw new UnauthorizedError(ERRORS.AUTHORISATION_ERROR);
  }

  next();
};
