/* eslint-disable no-console */
const httpStatus = require("http-status-codes");
const { Notification } = require("../models/notification.model");

exports.getAll = async (req, res) => {
  const { query, opts } = req.query;
  const condition = { ...JSON.parse(query), to: req.user.id };
  const notifications = await Notification.find(condition, null, JSON.parse(opts));
  return res.status(httpStatus.OK).json({ totalCount: notifications.length, items: notifications });
};
exports.delete = async (req, res) => {
  const result = await Notification.deleteMany({ to: req.user.id }).exec();
  return res.status(httpStatus.OK).json(result);
};
