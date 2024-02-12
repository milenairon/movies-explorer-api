const bcrypt = require('bcryptjs'); // хэш пароля
const mongoose = require('mongoose');

const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    // имя пользователя
    name: {
      type: String,
      minlength: [2, 'Имя не должно быть короче 2-х символов'],
      maxlength: [30, 'Имя не должно быть длиннее 30-и символов'],
      default: 'Жак-Ив Кусто',
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // уникальный
      validate: {
        validator: (email) => validator.isEmail(email),
        message: 'Указана неверная почта',
      },
    },
    password: {
      type: String,
      required: [true, 'Необходимо ввести пароль'],
      select: false, // пароль не возвращается в ответе
    },
  },
  { versionKey: false, timestamps: true },
);

// метод схемы для проверки почты и пароля
// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      // проверяет почту
      if (!user) {
        // неправильная почта, перейдем в catch
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      // проверяет хеши паролей
      return bcrypt.compare(password, user.password).then((matched) => {
        // если хэши не совпали
        if (!matched) {
          // неправильный пароль
          return Promise.reject(new Error('Неправильные почта или пароль'));
        }
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
