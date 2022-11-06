const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { AutorizationError } = require('../errors/AutorizationError');
const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require('../errors/ConflictError');

require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const getMyInfo = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    return res.send(user);
  } catch (e) {
    return next();
  }
};

const updateUserInfoById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      name: req.body.name,
      email: req.body.email,
    }, { new: true, runValidators: true });

    if (!user) {
      return next(new NotFoundError('Такого пользователя не существует'));
    }

    return res.send(user);
  } catch (e) {
    if (e.name === 'ValidationError') {
      return next(new BadRequestError('Переданы неккоректные данные пользователя'));
    }

    if (e.code === 11000) {
      return next(new ConflictError('Пользователь с указанным e-mail уже существует'));
    }
    return next();
  }
};

const createUser = async (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы неккоректные данные пользователя'));
    }
    if (err.code === 11000) {
      return next(new ConflictError('Пользователь с указанным email уже существует'));
    }
    return next();
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new NotFoundError('Введите логин или пароль'));
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AutorizationError('Неправильная почта или пароль'));
    }

    const isUserValid = await bcrypt.compare(password, user.password);
    if (isUserValid) {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });
      return res.send(user);
    }
    return next(new AutorizationError('Неверный логин или пароль'));
  } catch (e) {
    return next();
  }
};

const signOut = async (req, res, next) => {
  try {
    return await res.clearCookie('jwt').send({ message: 'Куки очищены' });
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  createUser,
  updateUserInfoById,
  login,
  getMyInfo,
  signOut,
};
