const Movie = require('../models/movie');

const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');

const createMovie = async (req, res, next) => {
  try {
    const movie = await new Movie({ owner: req.user._id, ...req.body }).save();

    return res.send(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы неккоректные данные фильма'));
    }
    return next();
  }
};

const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});
    return res.send(movies);
  } catch (err) {
    return next();
  }
};

const deleteMovieById = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      return next(new NotFoundError('Фильм не найден.'));
    }
    await Movie.findByIdAndRemove(movieId);
    return res.send({ message: 'Фильм удален' });
  } catch (e) {
    if (e.name === 'CastError') {
      return next(new BadRequestError('Переданы неккоректные данные фильма'));
    }
    return next();
  }
};

module.exports = {
  createMovie,
  getMovies,
  deleteMovieById,
};
