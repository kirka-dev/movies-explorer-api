require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { handleErrors } = require('./middlewares/handleErrors');
const limiter = require('./middlewares/rateLimiter');
const routes = require('./routes/routes');

const MONGO_DEV_URL = require('./utils/mongoConfig');

const app = express();
const { PORT = 3000, MONGO_URL = MONGO_DEV_URL } = process.env;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
})
  .then(() => console.log('Подключились'))
  .catch((err) => console.log(err.message));

app.use(cors({
  origin: [
    'https://search-movies.nomoredomains.club',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);
app.use(limiter);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(handleErrors);
app.listen(PORT, () => console.log(`Порт: ${PORT}`));
