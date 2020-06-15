/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const httpStatus = require("http-status-codes");
const { LandRequest } = require("../models/landrequest.model");
const { Land, LandStatus } = require("../models/land.model");

const { Payment } = require("../models/payment.model");
const { Notification } = require("../models/notification.model");

// eslint-disable-next-line complexity
exports.makePayment = async (req, res) => {
  try {
    const { requestId, metadata } = req.body;
    const landReq = await LandRequest.findOne({ _id: requestId }).populate("createdBy", "firstName");

    if (!landReq) {
      return res.status(httpStatus.NOT_FOUND).json({ message: `Land request with ID ${requestId} not found` });
    }

    const land = await Land.findOne({ _id: landReq.landId });
    if (!land) {
      return res.status(httpStatus.NOT_FOUND).json({ message: `Land with ID ${landReq.landId} not found` });
    }
    if (land.status !== LandStatus.PENDING_PAYMENT) {
      return res.status(httpStatus.NOT_ACCEPTABLE).json({ message: "Payment not made" });
    }
    await Land.findOneAndUpdate(
      { _id: landReq.landId },
      { $set: { status: LandStatus.OCCUPIED } },
      { new: true, useFindAndModify: false }
    );

    const payment = new Payment({
      land: land._id,
      request: landReq._id,
      createdBy: req.user.id,
      amount: land.price,
      metadata
    });
    await payment.save();
    const notification = new Notification({
      to: land.createdBy,
      title: "land-payment-completed",
      metadata: {
        message: `${landReq.createdBy.firstName} made payment`,
        at: payment.createdAt
      },
      createdBy: req.user.id
    });
    await notification.save();
    const { io } = req.app;
    if (io) { io.emit("notification", notification); }

    return res.status(httpStatus.CREATED).json(payment);
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error has occurred" });
  }
};
