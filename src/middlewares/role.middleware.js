const httpStatus = require('http-status-codes');

module.exports = (...userRoles) => (req, res, next) => {
  const { role } = req.user;
  const foundRole = userRoles.find((v) => v === role);
  return foundRole ? next() : res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
};
