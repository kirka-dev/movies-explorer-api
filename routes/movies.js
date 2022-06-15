const router = require('express').Router();
const { getMovies, addMovie, removeMovie } = require('../controllers/movies');
const { addMovieValidation, removeMovieValidation } = require('../middlewares/validation');

router.get('/', getMovies);
router.post('/', addMovieValidation, addMovie);
router.delete('/:movieId', removeMovieValidation, removeMovie);

module.exports = router;
