const Card = require('../models/card');

const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');
const { ForbiddenError } = require('../errors/ForbiddenError');

const createCard = async (req, res, next) => {
  try {
    const card = await new Card({ owner: req.user._id, ...req.body }).save();

    return res.send(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы неккоректные данные карточки'));
    }
    return next();
  }
};

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (err) {
    return next();
  }
};

const deleteCardById = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { cardId } = req.params;
    if (!cardId) {
      return next(new NotFoundError('Карточка не найдена.'));
    }
    const card = await Card.findById(cardId);
    const cardOwner = card.owner._id.toString();
    if (cardOwner === currentUserId) {
      await Card.findByIdAndRemove(cardId);
    } else {
      return next(new ForbiddenError('Попытка удаления чужой карточки'));
    }

    return res.send({ message: 'Карточка удалена' });
  } catch (e) {
    if (e.name === 'CastError') {
      return next(new BadRequestError('Переданы неккоректные данные карточки'));
    }
    return next();
  }
};

const likeCardById = async (req, res, next) => {
  try {
    const like = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!like) {
      return next(new NotFoundError('Карточка не найдена.'));
    }

    return res.send(like);
  } catch (e) {
    if (e.name === 'CastError') {
      return next(new BadRequestError('Переданы неккоректные данные карточки'));
    }
    return next();
  }
};

const dislikeCardById = async (req, res, next) => {
  try {
    const dislike = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!dislike) {
      return next(new NotFoundError('Карточка не найдена.'));
    }

    return res.send(dislike);
  } catch (e) {
    if (e.name === 'CastError') {
      return next(new BadRequestError('Переданы неккоректные данные карточки'));
    }
    return next();
  }
};

module.exports = {
  createCard,
  getCards,
  deleteCardById,
  likeCardById,
  dislikeCardById,
};
