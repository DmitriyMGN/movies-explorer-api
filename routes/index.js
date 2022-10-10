const express = require('express');

const { celebrate, Joi } = require('celebrate');

const router = express.Router();

const { userRoutes } = require('./users');
const { movieRoutes } = require('./movies');
const { auth } = require('../middlewares/auth');

const {
  login,
  createUser,
  signOut,
} = require('../controllers/users');

router.get('/signout', signOut);
router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);
router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  createUser,
);

router.use(auth);
router.use(userRoutes);
router.use(movieRoutes);

module.exports = router;
