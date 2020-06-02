const httpStatus = require('http-status-codes');

module.exports = ({ userIdParam, allowedRoles }) => (req, res, next) => {
  const { role } = req.user;
  if (userIdParam && req.params[userIdParam] !== req.user.id) {
    return res.status(httpStatus.FORBIDDEN).json({ message: "You don't have permission to modify this resource" });
  }
  const foundRole = allowedRoles.find((v) => v === role);
  return foundRole ? next() : res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
};
