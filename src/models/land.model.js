/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const AuctionType = {
  Lease: "Lease",
  Rent: "Rent"
};
const InstallmentType = {
  Biannual: "Biannual",
  Annual: "Annual",
  Monthly: "Monthly",
  Weekly: "Weekly",
  Daily: "Daily"
};
const LandStatus = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  PENDING_PAYMENT: "PENDING_PAYMENT"
};
const landSchema = mongoose
  .Schema(
    {
      description: { type: String, max: 128 },
      photo: { type: String },
      status: { type: LandStatus, default: LandStatus.AVAILABLE },
      shortLocation: { type: String, required: true, max: 32 },
      fullLocation: { type: String, required: true, max: 512 },
      acres: { type: Number, required: true },
      occupant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      price: { type: Number, required: true },
      auctionType: { type: AuctionType, required: true },
      installmentType: { type: InstallmentType, required: true },
      requests: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "LandRequest" }]
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
const Land = mongoose.model("Land", landSchema);
module.exports = {
  Land,
  LandStatus,
  AuctionType,
  InstallmentType
};
