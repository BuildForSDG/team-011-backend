/* eslint-disable no-unused-vars */

// generic route handler
const genericHandler = (req, res, _next) => {
  res.json({
    status: 'success',
    data: req.body
  });
};
module.exports = genericHandler;
