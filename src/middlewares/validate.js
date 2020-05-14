const { validationResult } = require('express-validator');
const httpStatus = require('http-status-codes');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {};
    errors.array().map((err) => {
      error[err.param] = err.msg;
      return error;
    });
    return res.status(httpStatus.BAD_REQUEST).json({ error });
  }

  return next();
};
