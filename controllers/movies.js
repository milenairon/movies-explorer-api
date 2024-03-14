const { HTTP_STATUS_CREATED } = require('http2').constants; // 201
const Movie = require('../models/movie');

const BadRequestError = require('../errors/BadRequestError'); // 400
const ForbiddenError = require('../errors/ForbiddenError'); // 403
const NotFoundError = require('../errors/NotFoundError'); // 404

// КОНТРОЛЛЕРЫ
// Контроллер — функция, ответственная за взаимодействие с моделью.
// То есть это функция, которая выполняет создание, чтение, обновление
// или удаление документа.

// возвращает все сохранённые текущим пользователем фильмы
const getMovies = (req, res, next) => {
  // _id пользователя, который сохранил фильм
  const userId = req.user._id;
  Movie.find({ owner: userId })
    .then((movies) => {
      if (movies) {
        return res.send(movies);
      }
      return next(new NotFoundError('Фильмы не найдены'));
    })
    .catch((err) => {
      switch (err.name) {
        case 'NotFoundError':
          return next(new NotFoundError(err.message));

        default:
          return next(err);
      }
    });
};

// создаёт фильм
const postMovie = (req, res, next) => {
  const userId = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: userId,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.status(HTTP_STATUS_CREATED).send(movie))
    .catch((err) => {
      switch (err.name) {
        case 'ValidationError':
          return next(
            new BadRequestError(
              'Переданы некорректные данные при создании фильма',
            ),
          );

        default:
          return next(err);
      }
    });
};

// удаляет сохранённый фильм по id
const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      }
      if (movie.owner.toString() !== userId) {
        throw new ForbiddenError('Попытка удалить чужой фильм');
      }

      return Movie.findByIdAndDelete(movieId).then(() => {
        res.send({ message: 'Фильм удален!' });
      });
    })
    .catch((err) => {
      switch (err.name) {
        case 'CastError':
          return next(new BadRequestError('Фильм не найден'));
        case 'NotFoundError':
          return next(new NotFoundError(err.message));
        case 'ForbiddenError':
          return next(new ForbiddenError(err.message));

        default:
          return next(err);
      }
    });
};

module.exports = {
  getMovies,
  postMovie,
  deleteMovie,
};
