const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const movieSchema = new mongoose.Schema(
  {
    // страна создания фильма
    country: {
      type: String,
      required: true,
    },
    // режиссёр фильма
    director: {
      type: String,
      required: true,
    },
    // длительность фильма
    duration: {
      type: Number,
      required: true,
    },
    // год выпуска фильма
    year: {
      type: String,
      required: true,
    },
    // описание фильма
    description: {
      type: String,
      required: true,
    },
    // ссылка на постер к фильму
    image: {
      type: String,
      required: true,
      validate: {
        validator: (image) => {
          /https?:\/\/(www\.)?[a-zA-Z0-9-@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([a-zA-Z0-9()-@:%_+.~#?&//=]*)/.test(
            image,
          );
        },
        message: 'Передан некорректный электронный адрес постера',
      },
    },
    // ссылка на трейлер фильма
    trailerLink: {
      type: String,
      required: true,
      validate: {
        validator: (trailerLink) => {
          /https?:\/\/(www\.)?[a-zA-Z0-9-@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([a-zA-Z0-9()-@:%_+.~#?&//=]*)/.test(
            trailerLink,
          );
        },
        message: 'Передан некорректный электронный адрес трейлера',
      },
    },
    // миниатюрное изображение постера к фильму
    thumbnail: {
      type: String,
      required: true,
      validate: {
        validator: (thumbnail) => {
          /https?:\/\/(www\.)?[a-zA-Z0-9-@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([a-zA-Z0-9()-@:%_+.~#?&//=]*)/.test(
            thumbnail,
          );
        },
        message: 'Передан некорректный электронный адрес трейлера',
      },
    },
    // _id пользователя, который сохранил фильм
    owner: {
      type: ObjectId,
      required: true,
    },
    // id фильма, который содержится в ответе сервиса MoviesExplorer
    movieId: {
      type: Number, // ЭТО ФОРМАТ??????
      required: true,
    },
    // название фильма на русском языке
    nameRU: {
      type: String,
      required: true,
    },
    // название фильма на английском языке
    nameEN: {
      type: String,
      required: true,
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('movie', movieSchema);
