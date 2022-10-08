const express = require('express');

const movieRoutes = express.Router();
const { celebrate, Joi } = require('celebrate');
const { urlRegex } = require('../utils/constants');

const {
  createMovie,
  getMovies,
  deleteMovieById,
} = require('../controllers/movies');

movieRoutes.get('/movies', express.json(), getMovies);
movieRoutes.post(
  '/movies',
  express.json(),
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().regex(urlRegex),
      trailerLink: Joi.string().required().regex(urlRegex),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      thumbnail: Joi.string().required().regex(urlRegex),
      movieId: Joi.number().required(),
    }),
  }),
  createMovie,
);
movieRoutes.delete(
  '/movies/:movieId',
  express.json(),
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().hex().length(24),
    }),
  }),
  deleteMovieById,
);

module.exports = { movieRoutes };
