const auth = require('./auth.route');
const user = require('./user.route');
const land = require('./land.route');


const authenticate = require('../middlewares/authenticate');
// const multerConfig =

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.status(200).send({ message: 'Welcome to the AUTHENTICATION API. Register or Login to test Authentication.' });
  });

  app.use('/api/auth', auth);
  app.use('/api/user', authenticate, user);

  app.use('/api/land', land);
};
