require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
// Безопасность
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
// const limiter = require('./middlewares/rateLimiter');

const app = express();
const { PORT = 3005 } = process.env;
const { DB_ADDRESS } = require('./config');

const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
// Ошибки
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/NotFoundError'); // 404
const handleErrors = require('./middlewares/handleErrors'); // 500

// Безопасность
app.use(
  cors({
    origin: [
      'http://localhost:3000', // фронтенд локальный
      'http://localhost:3005',
      'https://api.milenadiploma.nomoredomainswork.ru', // фронтенд сервер
      'https://milenadiploma.nomoredomainswork.ru', // фронтенд сервер
      'https://api.nomoreparties.co/beatfilm-movies',
    ],
    credentials: true,
    maxAge: 30,
  }),
);
app.use(helmet());
app.use(cookieParser());
// app.use(limiter);

// Подключаемся к серверу Mongo
mongoose.connect(DB_ADDRESS);

// Сборка пакетов
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// подключаем логгер запросов
app.use(requestLogger);

// Проверка падения и восстановления сервера
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

// Регистрация
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

// Аутентификация
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

// Маршруты
app.use('/', auth, require('./routes/users'));
app.use('/', auth, require('./routes/movies'));

// Роут неизвестного маршрута
app.all('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

// подключаем логгер ошибок
app.use(errorLogger);

// Обработчик ошибок celebrate
app.use(errors());

// Централизованная обработка ошибок
app.use(handleErrors);

app.listen(PORT);
