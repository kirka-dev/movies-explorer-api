const Movie = require('../models/movie');

const BadRequestError = require('../errors/badrequest');
const ConflictError = require('../errors/conflict');
const Forbidden = require('../errors/forbidden');
const NotFoundError = require('../errors/notfound');
const ServerError = require('../errors/server');

const ERRORS = require('../utils/errorMessages');

const getMovies = (req, res, next) => {
  Movie.find({owner: req.user._id})
    .then((movies) => res.status(200).send({ data: movies }))
    .catch(() => {
      throw new ServerError(ERRORS.AN_ERROR_OCCURRED_WHILE_GETTING_THE_LIST_OF_CARDS);
    })
    .catch(next);
};

const addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image, trailer,
    nameRU, nameEN,
    thumbnail,
    movieId,
  } = req.body;
  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(ERRORS.INVALID_DATA_WAS_PASSED_WHEN_CREATING_A_CARD);
      } else if (err.code === 11000) {
        throw new ConflictError(ERRORS.THE_MOVIE_HAS_ALREADY_BEEN_ADDED);
      } else {
        throw new ServerError(ERRORS.SOMETHING_WENT_WRONG);
      }
    })
    .catch(next);
};

const removeMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => {
      throw new NotFoundError(ERRORS.MOVIE_NOT_FOUND);
    })
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new Forbidden(ERRORS.NO_ACCESS);
      }
      movie.remove()
        .then(() => { res.send({ data: movie }); })
        .catch(() => {
          throw new ServerError(ERRORS.SOMETHING_WENT_WRONG);
        });
    })
    .catch(next);
};

module.exports = { getMovies, addMovie, removeMovie };
