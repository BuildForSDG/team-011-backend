const passport = require('passport');
const httpStatus = require('http-status-codes');

module.exports = (req, res, next) => {
  passport.authenticate('jwt', (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'User is not logged in' });
    }
    req.user = user;

    return next();
  })(req, res, next);
};
