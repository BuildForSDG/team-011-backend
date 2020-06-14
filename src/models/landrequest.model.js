/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const LandRequestStatus = {
  DECLINED: "DECLINED",
  APPROVED: "APPROVED",
  PENDING: "PENDING"
};

const landRequestSchema = mongoose
  .Schema(
    {
      landId: { type: mongoose.Schema.Types.ObjectId, ref: "Land", required: true },
      landownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      status: { type: LandRequestStatus, default: LandRequestStatus.PENDING },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
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
const LandRequest = mongoose.model("LandRequest", landRequestSchema);

module.exports = {
  LandRequest,
  schema: landRequestSchema,
  LandRequestStatus
};
