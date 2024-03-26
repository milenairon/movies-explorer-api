const { JWT_SECRET = '5cdd183194489560b0e6bfaf8a81541e' } = process.env; // сгенерирован crypto
const { NODE_ENV = 'production' } = process.env;
const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

module.exports = { JWT_SECRET, NODE_ENV, DB_ADDRESS };
