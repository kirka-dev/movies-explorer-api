module.exports.handleErrors = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const { message } = err;
  res.status(status).send({ message: message || 'Ошибка сервера.' });
  return next();
};
