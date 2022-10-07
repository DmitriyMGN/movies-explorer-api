const express = require('express');

const userRoutes = express.Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateUserInfoById,
  getMyInfo,
  signOut,
  login,
  createUser,
} = require('../controllers/users');

userRoutes.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);
userRoutes.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
    }),
  }),
  createUser,
);
userRoutes.get('/signout', express.json(), signOut);
userRoutes.get('/users/me', express.json(), getMyInfo);
userRoutes.patch(
  '/users/me',
  express.json(),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required(),
    }),
  }),
  updateUserInfoById,
);

module.exports = userRoutes;
