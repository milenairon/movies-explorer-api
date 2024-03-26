const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getCurrentUser, patchCurrentUser } = require('../controllers/users');

// РОУТЕРЫ

// возвращает информацию о пользователе (email и имя)
router.get('/users/me', getCurrentUser);

// обновляет информацию о пользователе (email и имя)
router.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().required().email(),
    }),
  }),
  patchCurrentUser,
);

module.exports = router;
