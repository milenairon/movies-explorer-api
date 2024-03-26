// МИДЛВЕР ДЛЯ АВТОРИЗАЦИИ
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = require('../config');

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок(токен)
  const { authorization } = req.headers;
  // Проверка, если токена нет
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Передан неверный логин или пароль'));
  }

  // Проверка, если токен не тот
  const token = authorization.replace('Bearer ', ''); // в token запишется только JWT.
  let payload;

  try {
    // Верифицируем токен
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    );
  } catch (err) {
    // отправим ошибку, если не получилось
    return next(new UnauthorizedError('Передан неверный логин или пароль'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
