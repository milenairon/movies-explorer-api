const bcrypt = require('bcryptjs'); // хэш пароля

const MONGO_DUBLICATE_ERROR_CODE = 11000;
const SOLT_ROUND = 10;
const { HTTP_STATUS_CREATED } = require('http2').constants; // 201

const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = require('../config');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError'); // 400
const UnauthorizedError = require('../errors/UnauthorizedError'); // 401
const NotFoundError = require('../errors/NotFoundError'); // 404
const ConflictError = require('../errors/ConflictError'); // 409

// КОНТРОЛЛЕРЫ

// возвращает информацию о пользователе (email и имя)
const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findOne({ _id: userId })
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

// обновляет информацию о пользователе (email и имя)
const patchCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }, // нужен обновленный валидируемый объект
  )
    .orFail(() => new NotFoundError('Пользователь по указанному _id не найден'))
    .then((user) => {
      res.send(user); // МОЖЕТ ВСТАВИТЬ name: user.name, email: user.email?????????????????
    })
    .catch((err) => {
      switch (err.name) {
        case 'CastError':
          return next(
            new BadRequestError(
              'Переданы некорректные данные при обновлении профиля',
            ),
          );
        case 'ValidationError':
          return next(
            new BadRequestError(
              'Переданы некорректные данные при обновлении профиля',
            ),
          );
        case 'NotFoundError':
          return next(new NotFoundError(err.message)); // НУЖЕН ЛИ ОН ТУТ?????????????????????

        default:
          return next(err);
      }
    });
};

// Получает почту и пароль и проверяет их(/signin)
const login = (req, res, next) => {
  // ищет по емаил пользователя
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      );
      res.send({ _id: token });
    })
    .catch(() => {
      next(new UnauthorizedError('Передан неверный логин или пароль'));
    });
};

// Создаёт пользователя (Регистрация /signup)
const createUser = async (req, res, next) => {
  // получим из объекта запроса данные пользователя
  try {
    const {
      name, email, password,
    } = req.body || {}; // ТОЧНО ЛИ НАДО ОСТАВЛЯТЬ МАССИВ ПУСТЫМ????????????????
    const hash = await bcrypt.hash(password, SOLT_ROUND);
    const newUser = await User.create({
      name,
      email,
      password: hash,
    });
    res.status(HTTP_STATUS_CREATED).send({
      name: newUser.name,
      email: newUser.email,
      _id: newUser._id,
    });
  } catch (err) {
    if (
      err.code === MONGO_DUBLICATE_ERROR_CODE || err.name === 'MongoServerError'
    ) {
      next(
        new ConflictError(
          'При регистрации указан email, который уже существует на сервере',
        ),
      );
    } else if (err.name === 'ValidationError') {
      next(
        new BadRequestError('Переданы некорректные данные при создании профиля'),
      );
    } else if (err.name === 'NotFoundError') {
      next(new NotFoundError(err.message));
    } else {
      next(err);
    }
  }
};

module.exports = {
  getCurrentUser,
  patchCurrentUser,
  login,
  createUser,
};
