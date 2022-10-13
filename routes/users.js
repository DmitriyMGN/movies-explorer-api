const express = require('express');

const userRoutes = express.Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateUserInfoById,
  getMyInfo,
} = require('../controllers/users');

userRoutes.get('/users/me', express.json(), getMyInfo);
userRoutes.patch(
  '/users/me',
  express.json(),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
    }),
  }),
  updateUserInfoById,
);

module.exports = { userRoutes };
