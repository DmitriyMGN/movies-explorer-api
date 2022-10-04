const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { AutorizationError } = require('../errors/AutorizationError');
const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require('../errors/ConflictError');

require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = async (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return next(new AutorizationError('Введите логин или пароль'));
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      about,
      avatar,
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

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (e) {
    return next();
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('Такого пользователя не существует'));
    }

    return res.send(user);
  } catch (e) {
    if (e.name === 'CastError') {
      return next(new BadRequestError('Переданы неккоректные данные пользователя'));
    }
    return next();
  }
};

const updateUserInfoById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      name: req.body.name,
      about: req.body.about,
    }, { new: true, runValidators: true });

    if (!user) {
      return next(new NotFoundError('Такого пользователя не существует'));
    }
    return res.send(user);
  } catch (e) {
    if (e.name === 'ValidationError') {
      return next(new BadRequestError('Переданы неккоректные данные пользователя'));
    }
    return next();
  }
};

const updateUserAvatarById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      avatar: req.body.avatar,
    }, { new: true });
    if (!user) {
      return next(new NotFoundError('Такого пользователя не существует'));
    }

    return res.send(user);
  } catch (e) {
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
      return next(new AutorizationError('Такого пользователя не существует'));
    }

    const isUserValid = await bcrypt.compare(password, user.password);
    if (isUserValid) {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        SameSite: 'None',
        Secure: true,
      });
      return res.send(user);
    }
    return next(new AutorizationError('Неверный логин или пароль'));
  } catch (e) {
    return next();
  }
};

const getMyInfo = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    return res.send(user);
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
  getUsers,
  getUserById,
  updateUserInfoById,
  updateUserAvatarById,
  login,
  getMyInfo,
  signOut,
};
