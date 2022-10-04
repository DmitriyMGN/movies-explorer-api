const express = require('express');

const userRoutes = express.Router();
const movieRoutes = express.Router();
const { celebrate, Joi } = require('celebrate');
const { urlRegex } = require('../utils/constants');

const {
  updateUserInfoById,
  getMyInfo,
  signOut,
} = require('../controllers/users');
const {
  createMovie,
  getMovies,
  deleteMovieById,
} = require('../controllers/movies');

userRoutes.get('/signout', express.json(), signOut);
userRoutes.get('/users/me', express.json(), getMyInfo);
userRoutes.patch(
  '/users/me',
  express.json(),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().regex(urlRegex),
    }),
  }),
  updateUserInfoById,
);

movieRoutes.get('/movies', express.json(), getMovies);
movieRoutes.post(
  '/movies',
  express.json(),
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.string().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().regex(urlRegex),
      trailer: Joi.string().required().regex(urlRegex),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      thumbnail: Joi.string().required().regex(urlRegex),
      movieId: Joi.string().required(),
    }),
  }),
  createMovie,
);
movieRoutes.delete(
  '/movies/:movieId',
  express.json(),
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().alphanum().length(24),
    }),
  }),
  deleteMovieById,
);

module.exports = { userRoutes, movieRoutes };
