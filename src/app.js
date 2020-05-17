// export default appName;
require('dotenv').config();
const { errors } = require('celebrate');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const logger = require('morgan');

// Setting up port
const connUri = process.env.MONGO_URI;

//= == 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(logger('dev'));
app.use(cors());

app.use(express.json());
// app.use(forms.array());
app.use(express.urlencoded({ extended: true }));

// form-urlencoded

//= == 2 - SET UP DATABASE
// Configure mongoose's promise to global promise
mongoose.promise = global.Promise;
mongoose.connect(connUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const { connection } = mongoose;
connection.on('error', () => {
  process.exit();
});

//= == 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
require('./middlewares/jwt')(passport);

//= == 4 - CONFIGURE ROUTES
// Configure Route
require('./routes/index')(app);

app.use(errors());
module.exports = app;
