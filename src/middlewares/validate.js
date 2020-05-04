const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {};
    errors.array().map((err) => {
      error[err.param] = err.msg;
      return error;
    });
    return res.status(422).json({ error });
  }

  return next();
};
