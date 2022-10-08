const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const router = require('./routes/index');
const { NotFoundError } = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
require('dotenv').config();

const { NODE_ENV, MONGO_URI } = process.env;

const { PORT = 3000 } = process.env;

const app = express();
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://diploma.dmitriymgn.nomoredomains.icu',
    credentials: true,
  }),
);

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(router);

app.use((req, res, next) => {
  try {
    return next(new NotFoundError('Страница не найдена.'));
  } catch (err) {
    return next();
  }
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send({ message });
  next();
});

async function main() {
  await mongoose.connect(NODE_ENV === 'production' ? MONGO_URI : 'mongodb://localhost:27017/bitfilmsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });

  await app.listen(PORT);

  console.log(`Сервер запущен на ${PORT} порту`);
}

main();
