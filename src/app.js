// export default appName;
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

// Setting up port
const connUri = process.env.MONGO_URI;

//= == 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());

// for parsing application/json
app.use(express.json());

// for parsing application/xwww-
app.use(express.urlencoded({ extended: false }));
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

module.exports = app;
