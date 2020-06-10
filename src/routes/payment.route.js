const express = require("express");
const { celebrate, Segments } = require("celebrate");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const { UserRole } = require("../models/user.model");
const roleMiddleware = require("../middlewares/role.middleware");
const PaymentCtrl = require("../controllers/payment.controller");

const router = express.Router();

const paymentDto = Joi.object({
  requestId: Joi.objectId().required(),
  metadata: Joi.any().required()
}).unknown(false);

router.post(
  "/",
  celebrate({ [Segments.BODY]: paymentDto }),
  roleMiddleware({ allowedRoles: [UserRole.Farmer] }),
  PaymentCtrl.makePayment
);
module.exports = router;
