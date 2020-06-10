/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const mongoose = require("mongoose");

const paymentSchema = mongoose
  .Schema(
    {
      land: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Land"
      },
      request: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "LandRequest"
      },
      metadata: {},
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      amount: { type: Number, required: true }
    },
    { timestamps: true }
  )
  .set("toJSON", {
    transform(doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  });
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = { Payment };
