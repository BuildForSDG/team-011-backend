const httpStatus = require('http-status-codes');

module.exports = ({ userIdParam, allowedRoles }) => (req, res, next) => {
  try {
    const { role } = req.user;
    if (userIdParam && req.params[userIdParam] !== req.user.id) {
      return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
    }
    if (!allowedRoles) return next();
    const foundRole = allowedRoles.find((v) => v === role);
    return foundRole ? next() : res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred' });
  }
};
